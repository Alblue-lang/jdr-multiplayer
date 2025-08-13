'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const avatarOptions = [
  { id: 'warrior', name: 'Guerrier', emoji: '⚔️' },
  { id: 'mage', name: 'Mage', emoji: '🧙‍♂️' },
  { id: 'rogue', name: 'Voleur', emoji: '🗡️' },
  { id: 'cleric', name: 'Clerc', emoji: '⚡' },
  { id: 'ranger', name: 'Rôdeur', emoji: '🏹' },
  { id: 'bard', name: 'Barde', emoji: '🎵' },
  { id: 'paladin', name: 'Paladin', emoji: '🛡️' },
  { id: 'druid', name: 'Druide', emoji: '🌿' }
]

const backgroundOptions = [
  { id: 'forest', name: 'Forêt', color: 'bg-green-500' },
  { id: 'mountain', name: 'Montagne', color: 'bg-gray-500' },
  { id: 'ocean', name: 'Océan', color: 'bg-blue-500' },
  { id: 'desert', name: 'Désert', color: 'bg-yellow-500' },
  { id: 'city', name: 'Ville', color: 'bg-slate-500' },
  { id: 'dungeon', name: 'Donjon', color: 'bg-stone-500' },
  { id: 'castle', name: 'Château', color: 'bg-purple-500' },
  { id: 'tavern', name: 'Taverne', color: 'bg-amber-500' }
]

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Joueur' as 'MJ' | 'Joueur' | 'Both',
    avatar: 'warrior',
    background: 'forest'
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (formData.username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        avatar: formData.avatar,
        background: formData.background
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du compte')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as 'MJ' | 'Joueur' | 'Both'
    }))
  }

  const handleAvatarChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      avatar: value
    }))
  }

  const handleBackgroundChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      background: value
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {t('auth.register.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.register.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('auth.username')}</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="VotreNom"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  minLength={3}
                  maxLength={30}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  minLength={6}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label>{t('auth.role')}</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={handleRoleChange}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="Joueur" id="joueur" />
                  <Label htmlFor="joueur" className="flex-1 cursor-pointer">
                    <div className="font-medium">{t('auth.role.player')}</div>
                    <div className="text-sm text-muted-foreground">
                      Participez aux campagnes créées par d'autres
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="MJ" id="mj" />
                  <Label htmlFor="mj" className="flex-1 cursor-pointer">
                    <div className="font-medium">{t('auth.role.mj')}</div>
                    <div className="text-sm text-muted-foreground">
                      Créez et dirigez vos propres campagnes
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="Both" id="both" />
                  <Label htmlFor="both" className="flex-1 cursor-pointer">
                    <div className="font-medium">{t('auth.role.both')}</div>
                    <div className="text-sm text-muted-foreground">
                      Jouez et dirigez selon vos envies
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Avatar Selection */}
            <div className="space-y-3">
              <Label>Avatar</Label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleAvatarChange(avatar.id)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.avatar === avatar.id
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    disabled={isSubmitting}
                  >
                    <div className="text-2xl">{avatar.emoji}</div>
                    <div className="text-xs mt-1">{avatar.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Selection */}
            <div className="space-y-3">
              <Label>Arrière-plan</Label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {backgroundOptions.map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => handleBackgroundChange(bg.id)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.background === bg.id
                        ? 'border-primary'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    disabled={isSubmitting}
                  >
                    <div className={`w-full h-8 rounded ${bg.color}`}></div>
                    <div className="text-xs mt-1">{bg.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Création du compte...</span>
                </div>
              ) : (
                t('auth.register.title')
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t('auth.have_account')}{' '}
              <Link href="/login" className="text-primary hover:underline">
                {t('auth.login_here')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
