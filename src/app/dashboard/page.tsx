'use client'

import { useAuth, withAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface DashboardStats {
  campaigns: {
    total: number
    active: number
    asPlayer: number
    asGM: number
  }
  sessions: {
    total: number
    thisWeek: number
    thisMonth: number
  }
  dice: {
    total: number
    thisWeek: number
    favorites: string[]
  }
  ranking: {
    currentRank: number
    totalPlayers: number
    weeklyScore: number
    monthlyScore: number
  }
}

interface RecentActivity {
  id: string
  type: 'campaign_join' | 'session_played' | 'dice_roll' | 'message_sent'
  title: string
  description: string
  timestamp: string
  campaignName?: string
}

function DashboardPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load multiple data sources in parallel
      const [campaignsRes, rankingRes, eventsRes] = await Promise.all([
        api.campaigns.getMy(),
        api.ranking.getMyRanking(),
        api.calendar.getMyEvents({ limit: 5 })
      ])

      // Process campaigns data
      const campaigns = campaignsRes.data?.campaigns || []
      const activeCampaigns = campaigns.filter((c: any) => c.status === 'Active')
      const playerCampaigns = campaigns.filter((c: any) => 
        c.players.some((p: any) => p._id === user?._id)
      )
      const gmCampaigns = campaigns.filter((c: any) => 
        c.gameMasters.some((gm: any) => gm._id === user?._id) || c.createdBy._id === user?._id
      )

      // Mock some additional stats (in real app, these would come from API)
      const dashboardStats: DashboardStats = {
        campaigns: {
          total: campaigns.length,
          active: activeCampaigns.length,
          asPlayer: playerCampaigns.length,
          asGM: gmCampaigns.length
        },
        sessions: {
          total: user?.stats?.totalSessions || 0,
          thisWeek: Math.floor(Math.random() * 5) + 1,
          thisMonth: Math.floor(Math.random() * 15) + 5
        },
        dice: {
          total: user?.stats?.diceRolls || 0,
          thisWeek: Math.floor(Math.random() * 50) + 10,
          favorites: ['d20', 'd6', 'd8']
        },
        ranking: {
          currentRank: Math.floor(Math.random() * 100) + 1,
          totalPlayers: 1247,
          weeklyScore: Math.random() * 5,
          monthlyScore: Math.random() * 5
        }
      }

      setStats(dashboardStats)
      setUpcomingEvents(eventsRes.data?.events || [])

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'campaign_join',
          title: 'Rejoint une campagne',
          description: 'Les Héros de Faerun',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          campaignName: 'Les Héros de Faerun'
        },
        {
          id: '2',
          type: 'dice_roll',
          title: 'Lancé un d20',
          description: 'Résultat: 18 (Critique!)',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'session_played',
          title: 'Session terminée',
          description: 'La Quête du Dragon Noir - Session 5',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          campaignName: 'La Quête du Dragon Noir'
        }
      ])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Erreur lors du chargement du tableau de bord')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Bienvenue, {user?.username} !
            </h1>
            <p className="text-muted-foreground">
              {t('dashboard.role')}: <Badge variant="secondary">{user?.role}</Badge>
            </p>
          </div>
          
          {!user?.tutorialCompleted && (
            <Button asChild>
              <Link href="/tutorial">Commencer le tutoriel</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.quick_actions')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button asChild variant="outline" className="h-20 flex-col">
            <Link href="/campaigns">
              <span className="text-lg font-semibold">{t('dashboard.my_campaigns')}</span>
              <span className="text-sm text-muted-foreground">{t('dashboard.manage_games')}</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-20 flex-col">
            <Link href="/chat">
              <span className="text-lg font-semibold">{t('dashboard.chat')}</span>
              <span className="text-sm text-muted-foreground">{t('dashboard.community')}</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-20 flex-col">
            <Link href="/calendar">
              <span className="text-lg font-semibold">{t('dashboard.calendar')}</span>
              <span className="text-sm text-muted-foreground">{t('dashboard.next_sessions')}</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-20 flex-col">
            <Link href="/ranking">
              <span className="text-lg font-semibold">{t('dashboard.ranking')}</span>
              <span className="text-sm text-muted-foreground">{t('dashboard.progression')}</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats Overview */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats?.campaigns.total || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Campagnes totales</p>
              <div className="text-xs text-muted-foreground mt-1">
                {stats?.campaigns.active || 0} actives
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats?.sessions.total || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Sessions jouées</p>
              <div className="text-xs text-muted-foreground mt-1">
                {stats?.sessions.thisWeek || 0} cette semaine
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats?.dice.total || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Dés lancés</p>
              <div className="text-xs text-muted-foreground mt-1">
                {stats?.dice.thisWeek || 0} cette semaine
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">#{stats?.ranking.currentRank || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Classement actuel</p>
              <div className="text-xs text-muted-foreground mt-1">
                sur {stats?.ranking.totalPlayers || 0} joueurs
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Vos dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune activité récente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Prochains événements</CardTitle>
            <CardDescription>Vos sessions et événements à venir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.campaignTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.startDate).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
              
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun événement à venir
                </p>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/calendar">Voir le calendrier complet</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      {user?.role !== 'MJ' && (
        <Card>
          <CardHeader>
            <CardTitle>Progression</CardTitle>
            <CardDescription>Votre évolution en tant que joueur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Score hebdomadaire</span>
                <span>{stats?.ranking.weeklyScore?.toFixed(1) || 0}/5</span>
              </div>
              <Progress value={(stats?.ranking.weeklyScore || 0) * 20} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Score mensuel</span>
                <span>{stats?.ranking.monthlyScore?.toFixed(1) || 0}/5</span>
              </div>
              <Progress value={(stats?.ranking.monthlyScore || 0) * 20} />
            </div>
            
            <div className="pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/ranking">Voir les classements</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default withAuth(DashboardPage)
