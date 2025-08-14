const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Simple rate limiting for memory DB
const rateLimitMap = new Map();

const rateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const record = rateLimitMap.get(ip);
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Trop de tentatives. Réessayez dans 15 minutes.'
    });
  }

  record.count++;
  next();
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'jdr-super-secret-jwt-key-for-development-only',
    { expiresIn: '7d' }
  );
};

// Authenticate token middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token d\'accès requis'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jdr-super-secret-jwt-key-for-development-only');
    const user = await req.app.locals.db.findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

// Apply rate limiting
router.use(rateLimit);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'Joueur', avatar = 'warrior', background = 'forest' } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nom d\'utilisateur, email et mot de passe sont requis'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    if (!['MJ', 'Joueur', 'Both'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide. Doit être MJ, Joueur ou Both'
      });
    }

    // Check if user already exists
    const existingUser = await req.app.locals.db.findUserByEmail(email.toLowerCase());

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = await req.app.locals.db.createUser({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      avatar,
      background,
      tutorialCompleted: false,
      profile: {
        bio: '',
        experience: 'Débutant',
        favoriteGenres: []
      },
      preferences: {
        theme: 'light',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          campaigns: true,
          messages: true
        }
      },
      stats: {
        totalSessions: 0,
        totalCampaigns: 0,
        diceRolls: 0,
        messagesCount: 0
      }
    });

    // Create initial rankings
    await req.app.locals.db.createOrUpdateRanking(user._id, {
      weeklyScore: { participation: 0, difficulty: 0, evaluation: 0 },
      monthlyScore: { participation: 0, difficulty: 0, evaluation: 0 },
      totalSessions: 0,
      totalVotes: 0
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis'
      });
    }

    // Find user by email
    const user = await req.app.locals.db.findUserByEmail(email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Update last login
    await req.app.locals.db.updateUser(user._id, {
      lastLogin: new Date()
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await req.app.locals.db.findUserById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, avatar, background, profile, preferences } = req.body;
    const user = await req.app.locals.db.findUserById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Prepare update data
    const updateData = {};

    if (username && username !== user.username) {
      updateData.username = username.trim();
    }

    if (avatar) updateData.avatar = avatar;
    if (background) updateData.background = background;

    // Update profile information
    if (profile) {
      updateData.profile = {
        ...user.profile,
        ...profile
      };
    }

    // Update preferences
    if (preferences) {
      updateData.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    const updatedUser = await req.app.locals.db.updateUser(user._id, updateData);

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
});

// @route   PUT /api/auth/password
// @desc    Change user password
// @access  Private
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe sont requis'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
      });
    }

    const user = await req.app.locals.db.findUserById(req.user._id);

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await req.app.locals.db.updateUser(user._id, {
      password: hashedPassword
    });

    res.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe'
    });
  }
});

// @route   POST /api/auth/complete-tutorial
// @desc    Mark tutorial as completed
// @access  Private
router.post('/complete-tutorial', authenticateToken, async (req, res) => {
  try {
    const user = await req.app.locals.db.findUserById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    await req.app.locals.db.updateUser(user._id, {
      tutorialCompleted: true
    });

    res.json({
      success: true,
      message: 'Tutoriel marqué comme terminé',
      data: {
        tutorialCompleted: true
      }
    });

  } catch (error) {
    console.error('Complete tutorial error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du tutoriel'
    });
  }
});

module.exports = router;
