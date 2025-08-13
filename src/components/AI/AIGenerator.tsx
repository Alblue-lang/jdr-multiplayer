'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface GeneratedContent {
  type: 'npc' | 'quest' | 'hook' | 'event' | 'random' | 'plot_hook' | 'random_event' | 'random_content'
  data: any
  generatedAt: string
}

export default function AIGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([])
  const [activeTab, setActiveTab] = useState('npc')

  // NPC filters
  const [npcRace, setNpcRace] = useState('')
  const [npcProfession, setNpcProfession] = useState('')

  // Quest filters
  const [questType, setQuestType] = useState('')
  const [questDifficulty, setQuestDifficulty] = useState('')

  const generateContent = async (type: 'npc' | 'quest' | 'hook' | 'event' | 'random') => {
    try {
      setIsGenerating(true)
      let response

      switch (type) {
        case 'npc':
          response = await api.ai.generateNPC({
            race: npcRace || undefined,
            profession: npcProfession || undefined
          })
          break
        case 'quest':
          response = await api.ai.generateQuest({
            type: questType || undefined,
            difficulty: questDifficulty || undefined
          })
          break
        case 'hook':
          response = await api.ai.generateHook()
          break
        case 'event':
          response = await api.ai.generateEvent()
          break
        case 'random':
          response = await api.ai.generateRandom()
          break
      }

      const newContent: GeneratedContent = {
        type: response.data.type || type,
        data: response.data,
        generatedAt: new Date().toISOString()
      }

      setGeneratedContent(prev => [newContent, ...prev.slice(0, 9)]) // Keep last 10 generations
      toast.success(`${getContentTypeLabel(type)} généré avec succès !`)

    } catch (error) {
      console.error('AI generation error:', error)
      toast.error('Erreur lors de la génération')
    } finally {
      setIsGenerating(false)
    }
  }

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'npc': return 'PNJ'
      case 'quest': return 'Quête'
      case 'hook': return 'Accroche'
      case 'event': return 'Événement'
      case 'random': return 'Contenu aléatoire'
      default: return 'Contenu'
    }
  }

  const renderNPCContent = (npc: any) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{npc.name}</h3>
        <div className="flex space-x-2">
          <Badge variant="secondary">{npc.race}</Badge>
          <Badge variant="outline">{npc.profession}</Badge>
        </div>
      </div>
      
      <p className="text-muted-foreground">{npc.appearance}</p>
      
      <div>
        <h4 className="font-semibold mb-2">Personnalité</h4>
        <div className="flex flex-wrap gap-1">
          {npc.personality.map((trait: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {trait}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Histoire</h4>
        <p className="text-sm">{npc.background}</p>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Particularités</h4>
        <ul className="text-sm space-y-1">
          {npc.quirks.map((quirk: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 mt-2 flex-shrink-0" />
              {quirk}
            </li>
          ))}
        </ul>
      </div>

      {npc.stats && (
        <div>
          <h4 className="font-semibold mb-2">Caractéristiques</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>FOR: {npc.stats.strength}</div>
            <div>DEX: {npc.stats.dexterity}</div>
            <div>CON: {npc.stats.constitution}</div>
            <div>INT: {npc.stats.intelligence}</div>
            <div>SAG: {npc.stats.wisdom}</div>
            <div>CHA: {npc.stats.charisma}</div>
          </div>
        </div>
      )}
    </div>
  )

  const renderQuestContent = (quest: any) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{quest.title}</h3>
        <div className="flex space-x-2">
          <Badge variant="secondary">{quest.type}</Badge>
          <Badge variant={quest.difficulty === 'Difficile' ? 'destructive' : 'outline'}>
            {quest.difficulty}
          </Badge>
        </div>
      </div>
      
      <p className="text-muted-foreground">{quest.description}</p>
      
      <div>
        <h4 className="font-semibold mb-2">Objectifs</h4>
        <ul className="space-y-1">
          {quest.objectives.map((objective: string, index: number) => (
            <li key={index} className="flex items-start text-sm">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 mt-2 flex-shrink-0" />
              {objective}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Récompenses</h4>
        <div className="flex flex-wrap gap-1">
          {quest.rewards.map((reward: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {reward}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Accroches possibles</h4>
        <ul className="space-y-1">
          {quest.hooks.map((hook: string, index: number) => (
            <li key={index} className="flex items-start text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
              {hook}
            </li>
          ))}
        </ul>
      </div>

      {quest.complications && (
        <div>
          <h4 className="font-semibold mb-2">Complications possibles</h4>
          <ul className="space-y-1">
            {quest.complications.map((complication: string, index: number) => (
              <li key={index} className="flex items-start text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0" />
                {complication}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        <strong>Durée estimée :</strong> {quest.estimatedDuration}
      </div>
    </div>
  )

  const renderHookContent = (hookData: any) => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Accroche narrative</h3>
      <p className="text-lg">{hookData.hook}</p>
      
      {hookData.context && (
        <div>
          <h4 className="font-semibold mb-2">Contexte</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Lieu :</strong> {hookData.context.location}</div>
            <div><strong>Moment :</strong> {hookData.context.timeOfDay}</div>
            <div><strong>Météo :</strong> {hookData.context.weather}</div>
            <div><strong>Ambiance :</strong> {hookData.context.crowdLevel}</div>
          </div>
        </div>
      )}
    </div>
  )

  const renderEventContent = (eventData: any) => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Événement aléatoire</h3>
      <p className="text-lg">{eventData.event}</p>
      
      {eventData.details && (
        <div>
          <h4 className="font-semibold mb-2">Détails</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Gravité :</strong> {eventData.details.severity}</div>
            <div><strong>Durée :</strong> {eventData.details.duration}</div>
            <div><strong>Conséquences :</strong> {eventData.details.consequences}</div>
            <div><strong>Témoins :</strong> {eventData.details.witnesses}</div>
          </div>
        </div>
      )}
    </div>
  )

  const renderGeneratedContent = (content: GeneratedContent) => {
    const { type, data } = content

    switch (type) {
      case 'npc':
        return renderNPCContent(data.npc || data.content)
      case 'quest':
        return renderQuestContent(data.quest || data.content)
      case 'hook':
      case 'plot_hook':
        return renderHookContent(data)
      case 'event':
      case 'random_event':
        return renderEventContent(data)
      case 'random_content':
        // Handle random content based on contentType
        if (data.contentType === 'npc') return renderNPCContent(data.content)
        if (data.contentType === 'quest') return renderQuestContent(data.content)
        if (data.contentType === 'hook') return renderHookContent(data.content)
        if (data.contentType === 'event') return renderEventContent(data.content)
        return <div>Contenu généré : {JSON.stringify(data.content)}</div>
      default:
        return <div>Type de contenu non reconnu</div>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Générateur IA</CardTitle>
          <CardDescription>
            Générez du contenu pour enrichir vos parties de JDR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="npc">PNJ</TabsTrigger>
              <TabsTrigger value="quest">Quête</TabsTrigger>
              <TabsTrigger value="hook">Accroche</TabsTrigger>
              <TabsTrigger value="event">Événement</TabsTrigger>
              <TabsTrigger value="random">Aléatoire</TabsTrigger>
            </TabsList>

            <TabsContent value="npc" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Race (optionnel)</Label>
                  <Select value={npcRace} onValueChange={setNpcRace}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les races" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les races</SelectItem>
                      <SelectItem value="Humain">Humain</SelectItem>
                      <SelectItem value="Elfe">Elfe</SelectItem>
                      <SelectItem value="Nain">Nain</SelectItem>
                      <SelectItem value="Halfelin">Halfelin</SelectItem>
                      <SelectItem value="Orc">Orc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Profession (optionnel)</Label>
                  <Select value={npcProfession} onValueChange={setNpcProfession}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les professions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les professions</SelectItem>
                      <SelectItem value="Forgeron">Forgeron</SelectItem>
                      <SelectItem value="Mage">Mage</SelectItem>
                      <SelectItem value="Guerrier">Guerrier</SelectItem>
                      <SelectItem value="Voleur">Voleur</SelectItem>
                      <SelectItem value="Clerc">Clerc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={() => generateContent('npc')} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Génération...' : '🧙‍♂️ Générer un PNJ'}
              </Button>
            </TabsContent>

            <TabsContent value="quest" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type (optionnel)</Label>
                  <Select value={questType} onValueChange={setQuestType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les types</SelectItem>
                      <SelectItem value="Exploration">Exploration</SelectItem>
                      <SelectItem value="Combat">Combat</SelectItem>
                      <SelectItem value="Enquête">Enquête</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Donjon">Donjon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulté (optionnel)</Label>
                  <Select value={questDifficulty} onValueChange={setQuestDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les difficultés" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les difficultés</SelectItem>
                      <SelectItem value="Facile">Facile</SelectItem>
                      <SelectItem value="Moyen">Moyen</SelectItem>
                      <SelectItem value="Difficile">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={() => generateContent('quest')} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Génération...' : '⚔️ Générer une quête'}
              </Button>
            </TabsContent>

            <TabsContent value="hook" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Générez une accroche narrative pour lancer une nouvelle aventure.
              </p>
              <Button 
                onClick={() => generateContent('hook')} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Génération...' : '🎭 Générer une accroche'}
              </Button>
            </TabsContent>

            <TabsContent value="event" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Générez un événement aléatoire pour pimenter vos sessions.
              </p>
              <Button 
                onClick={() => generateContent('event')} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Génération...' : '🎲 Générer un événement'}
              </Button>
            </TabsContent>

            <TabsContent value="random" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Laissez l'IA choisir le type de contenu à générer.
              </p>
              <Button 
                onClick={() => generateContent('random')} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Génération...' : '🎰 Génération aléatoire'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generated Content History */}
      {generatedContent.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Contenu généré</h2>
          {generatedContent.map((content, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {getContentTypeLabel(content.type)}
                  </CardTitle>
                  <Badge variant="outline">
                    {new Date(content.generatedAt).toLocaleString('fr-FR')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {renderGeneratedContent(content)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
