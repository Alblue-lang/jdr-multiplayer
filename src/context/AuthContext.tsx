'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface User {
  _id: string
  username: string
  email: string
  role: 'MJ' | 'Joueur' | 'Both'
  avatar: string
  background: string
  profile: {
    bio?: string
    experience: 'Débutant' | 'Intermédiaire' | 'Expérimenté' | 'Expert'
    favoriteGenres: string[]
  }
  stats: {
    campaignsCreated: number
    campaignsJoined: number
    totalSessions: number
    diceRolls: number
  }
  preferences: {
    theme: 'light' | 'dark'
    language: 'fr' | 'en'
    notifications: {
      email: boolean
      browser: boolean
    }
  }
  tutorialCompleted: boolean
  lastLogin: string
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (profileData: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

interface RegisterData {
  username: string
  email: string
  password: string
  role: 'MJ' | 'Joueur' | 'Both'
  avatar?: string
  background?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && !!token

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('jdr_token')
        const storedUser = localStorage.getItem('jdr_user')

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
          
          // Verify token is still valid
          await refreshUser()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear invalid data
        localStorage.removeItem('jdr_token')
        localStorage.removeItem('jdr_user')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion')
      }

      const { user: userData, token: userToken } = data.data

      setUser(userData)
      setToken(userToken)
      
      // Store in localStorage
      localStorage.setItem('jdr_token', userToken)
      localStorage.setItem('jdr_user', JSON.stringify(userData))

      toast.success('Connexion réussie !')
      
      // Redirect based on tutorial completion
      if (!userData.tutorialCompleted) {
        router.push('/tutorial')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur de connexion')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création du compte')
      }

      const { user: newUser, token: userToken } = data.data

      setUser(newUser)
      setToken(userToken)
      
      // Store in localStorage
      localStorage.setItem('jdr_token', userToken)
      localStorage.setItem('jdr_user', JSON.stringify(newUser))

      toast.success('Compte créé avec succès !')
      router.push('/tutorial')
    } catch (error) {
      console.error('Register error:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du compte')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    
    // Clear localStorage
    localStorage.removeItem('jdr_token')
    localStorage.removeItem('jdr_user')
    
    toast.success('Déconnexion réussie')
    router.push('/')
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      if (!token) throw new Error('Non authentifié')

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour du profil')
      }

      const updatedUser = data.data.user
      setUser(updatedUser)
      
      // Update localStorage
      localStorage.setItem('jdr_user', JSON.stringify(updatedUser))

      toast.success('Profil mis à jour avec succès !')
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil')
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          logout()
          return
        }
        throw new Error('Erreur lors de la récupération du profil')
      }

      const data = await response.json()
      const userData = data.data.user

      setUser(userData)
      localStorage.setItem('jdr_user', JSON.stringify(userData))
    } catch (error) {
      console.error('Refresh user error:', error)
      // Don't show error toast for background refresh
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login')
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}

// Hook for API calls with authentication
export function useAuthenticatedFetch() {
  const { token, logout } = useAuth()

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('Non authentifié')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 401) {
      logout()
      throw new Error('Session expirée')
    }

    return response
  }

  return authenticatedFetch
}
