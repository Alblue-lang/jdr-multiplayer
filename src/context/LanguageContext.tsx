'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'fr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation dictionaries
const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.dashboard': 'Tableau de bord',
    'nav.campaigns': 'Campagnes',
    'nav.chat': 'Chat',
    'nav.calendar': 'Calendrier',
    'nav.ranking': 'Classements',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',
    'nav.login': 'Connexion',
    'nav.register': 'Inscription',

    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.create': 'Créer',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.sort': 'Trier',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.close': 'Fermer',
    'common.open': 'Ouvrir',

    // Authentication
    'auth.login.title': 'Connexion',
    'auth.login.subtitle': 'Connectez-vous à votre compte',
    'auth.register.title': 'Inscription',
    'auth.register.subtitle': 'Créez votre compte JDR',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.username': 'Nom d\'utilisateur',
    'auth.role': 'Rôle',
    'auth.role.mj': 'Maître du Jeu',
    'auth.role.player': 'Joueur',
    'auth.role.both': 'Les deux',
    'auth.forgot_password': 'Mot de passe oublié ?',
    'auth.no_account': 'Pas de compte ?',
    'auth.have_account': 'Déjà un compte ?',
    'auth.login_here': 'Connectez-vous ici',
    'auth.register_here': 'Inscrivez-vous ici',

    // Dashboard
    'dashboard.welcome': 'Bienvenue, {username} !',
    'dashboard.role': 'Rôle',
    'dashboard.quick_actions': 'Actions rapides',
    'dashboard.my_campaigns': 'Mes Campagnes',
    'dashboard.manage_games': 'Gérer vos parties',
    'dashboard.chat': 'Chat',
    'dashboard.community': 'Discuter avec la communauté',
    'dashboard.calendar': 'Calendrier',
    'dashboard.next_sessions': 'Vos prochaines sessions',
    'dashboard.ranking': 'Classements',
    'dashboard.progression': 'Voir votre progression',
    'dashboard.stats.campaigns_joined': 'Campagnes rejointes',
    'dashboard.stats.sessions_played': 'Sessions jouées',
    'dashboard.stats.dice_rolled': 'Dés lancés',
    'dashboard.stats.campaigns_created': 'Campagnes créées',

    // Campaigns
    'campaigns.title': 'Campagnes',
    'campaigns.create': 'Créer une campagne',
    'campaigns.join': 'Rejoindre',
    'campaigns.leave': 'Quitter',
    'campaigns.manage': 'Gérer',
    'campaigns.players': 'Joueurs',
    'campaigns.gm': 'Maître du Jeu',
    'campaigns.status': 'Statut',
    'campaigns.system': 'Système',
    'campaigns.genre': 'Genre',
    'campaigns.max_players': 'Joueurs max',
    'campaigns.description': 'Description',

    // Chat
    'chat.general': 'Chat général',
    'chat.campaign': 'Chat campagne',
    'chat.send_message': 'Envoyer un message',
    'chat.type_message': 'Tapez votre message...',
    'chat.online': 'En ligne',
    'chat.offline': 'Hors ligne',

    // Dice
    'dice.roll': 'Lancer',
    'dice.result': 'Résultat',
    'dice.history': 'Historique',
    'dice.modifier': 'Modificateur',
    'dice.purpose': 'Objectif',
    'dice.critical_success': 'Réussite critique !',
    'dice.critical_failure': 'Échec critique !',

    // Calendar
    'calendar.title': 'Calendrier',
    'calendar.add_event': 'Ajouter un événement',
    'calendar.session': 'Session',
    'calendar.event': 'Événement',
    'calendar.confirmed': 'Confirmé',
    'calendar.planned': 'Planifié',
    'calendar.cancelled': 'Annulé',

    // Ranking
    'ranking.title': 'Classements',
    'ranking.weekly': 'Hebdomadaire',
    'ranking.monthly': 'Mensuel',
    'ranking.participation': 'Participation',
    'ranking.difficulty': 'Difficulté',
    'ranking.evaluation': 'Évaluation',
    'ranking.vote': 'Voter',
    'ranking.rank': 'Rang',
    'ranking.score': 'Score',

    // Profile
    'profile.title': 'Profil',
    'profile.edit': 'Modifier le profil',
    'profile.avatar': 'Avatar',
    'profile.background': 'Arrière-plan',
    'profile.bio': 'Biographie',
    'profile.experience': 'Expérience',
    'profile.favorite_genres': 'Genres favoris',
    'profile.preferences': 'Préférences',
    'profile.theme': 'Thème',
    'profile.language': 'Langue',
    'profile.notifications': 'Notifications',

    // Tutorial
    'tutorial.welcome': 'Bienvenue dans JDR Multiplayer !',
    'tutorial.step': 'Étape {current} sur {total}',
    'tutorial.next': 'Suivant',
    'tutorial.previous': 'Précédent',
    'tutorial.finish': 'Terminer',
    'tutorial.skip': 'Passer',

    // AI
    'ai.generate': 'Générer',
    'ai.npc': 'PNJ',
    'ai.quest': 'Quête',
    'ai.event': 'Événement',
    'ai.random': 'Aléatoire',

    // Errors
    'error.network': 'Erreur de réseau',
    'error.unauthorized': 'Non autorisé',
    'error.forbidden': 'Accès interdit',
    'error.not_found': 'Non trouvé',
    'error.server': 'Erreur serveur',
    'error.validation': 'Erreur de validation',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.campaigns': 'Campaigns',
    'nav.chat': 'Chat',
    'nav.calendar': 'Calendar',
    'nav.ranking': 'Rankings',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Register',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.open': 'Open',

    // Authentication
    'auth.login.title': 'Login',
    'auth.login.subtitle': 'Sign in to your account',
    'auth.register.title': 'Register',
    'auth.register.subtitle': 'Create your RPG account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.username': 'Username',
    'auth.role': 'Role',
    'auth.role.mj': 'Game Master',
    'auth.role.player': 'Player',
    'auth.role.both': 'Both',
    'auth.forgot_password': 'Forgot password?',
    'auth.no_account': 'No account?',
    'auth.have_account': 'Already have an account?',
    'auth.login_here': 'Login here',
    'auth.register_here': 'Register here',

    // Dashboard
    'dashboard.welcome': 'Welcome, {username}!',
    'dashboard.role': 'Role',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.my_campaigns': 'My Campaigns',
    'dashboard.manage_games': 'Manage your games',
    'dashboard.chat': 'Chat',
    'dashboard.community': 'Chat with community',
    'dashboard.calendar': 'Calendar',
    'dashboard.next_sessions': 'Your next sessions',
    'dashboard.ranking': 'Rankings',
    'dashboard.progression': 'View your progress',
    'dashboard.stats.campaigns_joined': 'Campaigns joined',
    'dashboard.stats.sessions_played': 'Sessions played',
    'dashboard.stats.dice_rolled': 'Dice rolled',
    'dashboard.stats.campaigns_created': 'Campaigns created',

    // Campaigns
    'campaigns.title': 'Campaigns',
    'campaigns.create': 'Create Campaign',
    'campaigns.join': 'Join',
    'campaigns.leave': 'Leave',
    'campaigns.manage': 'Manage',
    'campaigns.players': 'Players',
    'campaigns.gm': 'Game Master',
    'campaigns.status': 'Status',
    'campaigns.system': 'System',
    'campaigns.genre': 'Genre',
    'campaigns.max_players': 'Max Players',
    'campaigns.description': 'Description',

    // Chat
    'chat.general': 'General Chat',
    'chat.campaign': 'Campaign Chat',
    'chat.send_message': 'Send Message',
    'chat.type_message': 'Type your message...',
    'chat.online': 'Online',
    'chat.offline': 'Offline',

    // Dice
    'dice.roll': 'Roll',
    'dice.result': 'Result',
    'dice.history': 'History',
    'dice.modifier': 'Modifier',
    'dice.purpose': 'Purpose',
    'dice.critical_success': 'Critical Success!',
    'dice.critical_failure': 'Critical Failure!',

    // Calendar
    'calendar.title': 'Calendar',
    'calendar.add_event': 'Add Event',
    'calendar.session': 'Session',
    'calendar.event': 'Event',
    'calendar.confirmed': 'Confirmed',
    'calendar.planned': 'Planned',
    'calendar.cancelled': 'Cancelled',

    // Ranking
    'ranking.title': 'Rankings',
    'ranking.weekly': 'Weekly',
    'ranking.monthly': 'Monthly',
    'ranking.participation': 'Participation',
    'ranking.difficulty': 'Difficulty',
    'ranking.evaluation': 'Evaluation',
    'ranking.vote': 'Vote',
    'ranking.rank': 'Rank',
    'ranking.score': 'Score',

    // Profile
    'profile.title': 'Profile',
    'profile.edit': 'Edit Profile',
    'profile.avatar': 'Avatar',
    'profile.background': 'Background',
    'profile.bio': 'Biography',
    'profile.experience': 'Experience',
    'profile.favorite_genres': 'Favorite Genres',
    'profile.preferences': 'Preferences',
    'profile.theme': 'Theme',
    'profile.language': 'Language',
    'profile.notifications': 'Notifications',

    // Tutorial
    'tutorial.welcome': 'Welcome to RPG Multiplayer!',
    'tutorial.step': 'Step {current} of {total}',
    'tutorial.next': 'Next',
    'tutorial.previous': 'Previous',
    'tutorial.finish': 'Finish',
    'tutorial.skip': 'Skip',

    // AI
    'ai.generate': 'Generate',
    'ai.npc': 'NPC',
    'ai.quest': 'Quest',
    'ai.event': 'Event',
    'ai.random': 'Random',

    // Errors
    'error.network': 'Network error',
    'error.unauthorized': 'Unauthorized',
    'error.forbidden': 'Access forbidden',
    'error.not_found': 'Not found',
    'error.server': 'Server error',
    'error.validation': 'Validation error',
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr')

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('jdr_language') as Language
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.startsWith('en')) {
        setLanguage('en')
      } else {
        setLanguage('fr')
      }
    }
  }, [])

  // Save language preference
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('jdr_language', lang)
  }

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof typeof translations[typeof language]] || key

    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue))
      })
    }

    return translation
  }

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Hook for getting translated text with parameters
export function useTranslation() {
  const { t } = useLanguage()
  
  return {
    t: (key: string, params?: Record<string, string | number>) => t(key, params)
  }
}

// Component for easy translation
export function T({ 
  k, 
  params 
}: { 
  k: string
  params?: Record<string, string | number>
}) {
  const { t } = useLanguage()
  return <>{t(k, params)}</>
}
