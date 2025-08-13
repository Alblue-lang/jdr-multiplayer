'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setIsSubmitting(true)

    try {
      await login(formData.email, formData.password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
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
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {t('auth.login.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.login.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                t('auth.login.title')
              )}
            </Button>

            <div className="text-center space-y-2">
              <Link 
                href="/forgot-password" 
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {t('auth.forgot_password')}
              </Link>
              
              <div className="text-sm text-muted-foreground">
                {t('auth.no_account')}{' '}
                <Link href="/register" className="text-primary hover:underline">
                  {t('auth.register_here')}
                </Link>
              </div>
            </div>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Comptes de démonstration :
            </p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData({
                    email: 'demo.mj@jdr.com',
                    password: 'demo123'
                  })
                }}
                disabled={isSubmitting}
              >
                Demo MJ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData({
                    email: 'demo.joueur@jdr.com',
                    password: 'demo123'
                  })
                }}
                disabled={isSubmitting}
              >
                Demo Joueur
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
