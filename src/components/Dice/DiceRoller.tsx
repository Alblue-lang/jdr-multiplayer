'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface DiceRollResult {
  diceType: string
  numberOfDice: number
  modifier: number
  results: number[]
  total: number
  notation: string
  formattedResult: string
  quality?: string
}

interface DiceRollerProps {
  campaignId?: string
  onRoll?: (result: DiceRollResult) => void
  showHistory?: boolean
  compact?: boolean
}

const diceTypes = [
  { value: 'd4', label: 'D4', sides: 4 },
  { value: 'd6', label: 'D6', sides: 6 },
  { value: 'd8', label: 'D8', sides: 8 },
  { value: 'd10', label: 'D10', sides: 10 },
  { value: 'd12', label: 'D12', sides: 12 },
  { value: 'd20', label: 'D20', sides: 20 },
  { value: 'd100', label: 'D100', sides: 100 }
]

export default function DiceRoller({ 
  campaignId, 
  onRoll, 
  showHistory = true, 
  compact = false 
}: DiceRollerProps) {
  const [diceType, setDiceType] = useState('d20')
  const [numberOfDice, setNumberOfDice] = useState(1)
  const [modifier, setModifier] = useState(0)
  const [purpose, setPurpose] = useState('')
  const [isRolling, setIsRolling] = useState(false)
  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null)
  const [rollHistory, setRollHistory] = useState<DiceRollResult[]>([])

  const handleRoll = async () => {
    try {
      setIsRolling(true)

      let result: DiceRollResult

      if (campaignId) {
        // Roll with campaign context
        const response = await api.dice.roll({
          campaignId,
          diceType,
          numberOfDice,
          modifier,
          purpose: purpose.trim(),
          visibility: 'public'
        })

        result = {
          diceType,
          numberOfDice,
          modifier,
          results: response.data.roll.results,
          total: response.data.roll.total,
          notation: response.data.roll.notation,
          formattedResult: response.data.roll.formattedResult,
          quality: response.data.quality
        }
      } else {
        // Quick roll without campaign
        const response = await api.dice.quickRoll({
          diceType,
          numberOfDice,
          modifier
        })

        result = response.data
      }

      setLastResult(result)
      setRollHistory(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 rolls

      // Show result toast
      const qualityEmoji = getQualityEmoji(result.quality)
      toast.success(`${qualityEmoji} ${result.notation} = ${result.total}`)

      // Call callback if provided
      onRoll?.(result)

      // Clear purpose after successful roll
      setPurpose('')

    } catch (error) {
      console.error('Dice roll error:', error)
      toast.error('Erreur lors du lancer de dé')
    } finally {
      setIsRolling(false)
    }
  }

  const getQualityEmoji = (quality?: string) => {
    switch (quality) {
      case 'critical_success': return '🎯'
      case 'critical_failure': return '💥'
      case 'excellent': return '⭐'
      case 'good': return '👍'
      case 'poor': return '👎'
      case 'terrible': return '💀'
      default: return '🎲'
    }
  }

  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case 'critical_success': return 'bg-green-500'
      case 'critical_failure': return 'bg-red-500'
      case 'excellent': return 'bg-blue-500'
      case 'good': return 'bg-green-400'
      case 'poor': return 'bg-orange-400'
      case 'terrible': return 'bg-red-400'
      default: return 'bg-gray-500'
    }
  }

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Lanceur de dés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Select value={diceType} onValueChange={setDiceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {diceTypes.map((dice) => (
                  <SelectItem key={dice.value} value={dice.value}>
                    {dice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              min="1"
              max="20"
              value={numberOfDice}
              onChange={(e) => setNumberOfDice(parseInt(e.target.value) || 1)}
              placeholder="Nb"
            />

            <Input
              type="number"
              min="-100"
              max="100"
              value={modifier || ''}
              onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
              placeholder="Mod"
            />
          </div>

          <Button 
            onClick={handleRoll} 
            disabled={isRolling}
            className="w-full"
          >
            {isRolling ? 'Lancement...' : `Lancer ${numberOfDice}${diceType}${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''}`}
          </Button>

          {lastResult && (
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {lastResult.total}
              </div>
              <div className="text-sm text-muted-foreground">
                {lastResult.formattedResult}
              </div>
              {lastResult.quality && (
                <Badge variant="secondary" className="mt-1">
                  {getQualityEmoji(lastResult.quality)} {lastResult.quality}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lanceur de dés</CardTitle>
          <CardDescription>
            Lancez vos dés avec modificateurs et historique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type de dé</Label>
              <Select value={diceType} onValueChange={setDiceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {diceTypes.map((dice) => (
                    <SelectItem key={dice.value} value={dice.value}>
                      {dice.label} ({dice.sides} faces)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nombre de dés</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={numberOfDice}
                onChange={(e) => setNumberOfDice(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label>Modificateur</Label>
              <Input
                type="number"
                min="-100"
                max="100"
                value={modifier || ''}
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          {campaignId && (
            <div className="space-y-2">
              <Label>Objectif (optionnel)</Label>
              <Textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Ex: Attaque au corps à corps, Jet de sauvegarde..."
                rows={2}
                maxLength={200}
              />
            </div>
          )}

          <Button 
            onClick={handleRoll} 
            disabled={isRolling}
            className="w-full"
            size="lg"
          >
            {isRolling ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Lancement...</span>
              </div>
            ) : (
              `🎲 Lancer ${numberOfDice}${diceType}${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''}`
            )}
          </Button>

          {lastResult && (
            <div className="text-center p-6 bg-muted rounded-lg">
              <div className="text-4xl font-bold mb-2">
                {lastResult.total}
              </div>
              <div className="text-lg text-muted-foreground mb-2">
                {lastResult.formattedResult}
              </div>
              {lastResult.quality && (
                <Badge variant="secondary" className="text-sm">
                  {getQualityEmoji(lastResult.quality)} {lastResult.quality}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showHistory && rollHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des lancers</CardTitle>
            <CardDescription>Vos derniers lancers de dés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rollHistory.map((roll, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getQualityColor(roll.quality)}`} />
                    <span className="font-medium">{roll.notation}</span>
                    <span className="text-muted-foreground">=</span>
                    <span className="font-bold">{roll.total}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {roll.formattedResult}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
