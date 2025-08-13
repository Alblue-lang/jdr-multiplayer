'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activePlayers: 0,
    totalSessions: 0,
    diceRolls: 0
  })

  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalCampaigns: 156,
      activePlayers: 1247,
      totalSessions: 892,
      diceRolls: 15634
    })
  }, [])

  if (isAuthenticated && user) {
    return <DashboardView user={user} stats={stats} />
  }

  return <LandingView stats={stats} />
}

function LandingView({ stats }: { stats: any }) {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-16">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            JDR Multiplayer
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            La plateforme complète pour créer et gérer vos parties de jeu de rôle multijoueur
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/register">Commencer maintenant</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link href="/login">Se connecter</Link>
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold">{stats.totalCampaigns}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Campagnes actives</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold">{stats.activePlayers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Joueurs actifs</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold">{stats.totalSessions}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Sessions jouées</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold">{stats.diceRolls}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Dés lancés</p>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Fonctionnalités</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour une expérience de jeu de rôle exceptionnelle
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Gestion de Campagnes"
            description="Créez et gérez vos campagnes avec des outils complets pour MJ et joueurs"
            features={["Fiches de personnages", "Journal de session", "Gestion des participants"]}
          />
          
          <FeatureCard
            title="Chat Intégré"
            description="Communiquez en temps réel avec votre groupe de jeu"
            features={["Chat par campagne", "Chat général", "Système de mentions"]}
          />
          
          <FeatureCard
            title="Système de Dés"
            description="Lancez vos dés directement dans l'interface avec historique complet"
            features={["Tous types de dés", "Modificateurs", "Historique détaillé"]}
          />
          
          <FeatureCard
            title="Calendrier"
            description="Planifiez vos sessions et gérez votre emploi du temps"
            features={["Sessions récurrentes", "Confirmations", "Rappels"]}
          />
          
          <FeatureCard
            title="Classements"
            description="Système d'évaluation et de classement des joueurs et MJ"
            features={["Votes hebdomadaires", "Statistiques", "Badges"]}
          />
          
          <FeatureCard
            title="IA Intégrée"
            description="Générateur de contenu pour enrichir vos parties"
            features={["PNJ aléatoires", "Quêtes générées", "Événements"]}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-8 py-16 bg-muted/50 rounded-lg">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Prêt à commencer votre aventure ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rejoignez des milliers de joueurs et créez des histoires inoubliables
          </p>
        </div>
        
        <Button asChild size="lg" className="text-lg px-8">
          <Link href="/register">Créer un compte gratuit</Link>
        </Button>
      </section>
    </div>
  )
}

function DashboardView({ user, stats }: { user: any, stats: any }) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Bienvenue, {user.username} !
            </h1>
            <p className="text-muted-foreground">
              Rôle: <Badge variant="secondary">{user.role}</Badge>
            </p>
          </div>
          
          {!user.tutorialCompleted && (
            <Button asChild>
              <Link href="/tutorial">Commencer le tutoriel</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/campaigns">
            <span className="text-lg font-semibold">Mes Campagnes</span>
            <span className="text-sm text-muted-foreground">Gérer vos parties</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/chat">
            <span className="text-lg font-semibold">Chat</span>
            <span className="text-sm text-muted-foreground">Discuter avec la communauté</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/calendar">
            <span className="text-lg font-semibold">Calendrier</span>
            <span className="text-sm text-muted-foreground">Vos prochaines sessions</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/ranking">
            <span className="text-lg font-semibold">Classements</span>
            <span className="text-sm text-muted-foreground">Voir votre progression</span>
          </Link>
        </Button>
      </section>

      {/* User Stats */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{user.stats?.campaignsJoined || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Campagnes rejointes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{user.stats?.totalSessions || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Sessions jouées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{user.stats?.diceRolls || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Dés lancés</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{user.stats?.campaignsCreated || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Campagnes créées</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function FeatureCard({ title, description, features }: {
  title: string
  description: string
  features: string[]
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              <span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
