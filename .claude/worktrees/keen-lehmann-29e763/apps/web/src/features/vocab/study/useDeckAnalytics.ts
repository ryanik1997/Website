import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@ryan/db'
import type { ReviewLog } from '@ryan/db'
import { getCardStudyStatus } from '../cardStatus'
import { isWeakWord } from './weakWords'

export interface DeckAnalytics {
  totalReviews: number
  accuracyPct: number
  streakDays: number
  avgEase: number
  ratingCounts: [number, number, number, number]
  modeCounts: Record<string, number>
  dailyActivity: { date: string; label: string; count: number; pct: number }[]
  statusCounts: { new: number; due: number; learned: number }
  topWeak: { phrase: string; lapses: number; ease: number }[]
}

const DAY_MS = 86_400_000
const VOCAB_MODES = new Set(['srs', 'quiz', 'type', 'listen'])

function calcStreak(logs: ReviewLog[]): number {
  if (!logs.length) return 0
  const days = new Set(logs.map(l => new Date(l.at).toISOString().slice(0, 10)))
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().slice(0, 10)
    if (days.has(key)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function useDeckAnalytics(deckId: string | null): DeckAnalytics | undefined {
  return useLiveQuery(async () => {
    if (!deckId) return null

    const [cards, srsRows] = await Promise.all([
      db.cards.where('deckId').equals(deckId).toArray(),
      db.srs.where('deckId').equals(deckId).toArray(),
    ])
    const cardIds = new Set(cards.map(c => c.id))
    const cardMap = new Map(cards.map(c => [c.id, c]))

    const allLogs = await db.reviewLog.toArray()
    const logs = allLogs.filter(l => cardIds.has(l.cardId) && VOCAB_MODES.has(l.mode))

    const ratingCounts: [number, number, number, number] = [0, 0, 0, 0]
    const modeCounts: Record<string, number> = {}
    let correct = 0

    for (const log of logs) {
      const r = Math.min(4, Math.max(1, log.rating)) as 1 | 2 | 3 | 4
      ratingCounts[r - 1]++
      modeCounts[log.mode] = (modeCounts[log.mode] ?? 0) + 1
      if (r >= 3) correct++
    }

    const totalReviews = logs.length
    const accuracyPct = totalReviews ? Math.round((correct / totalReviews) * 100) : 0
    const streakDays = calcStreak(logs)

    const reviewed = srsRows.filter(s => s.reps > 0)
    const avgEase = reviewed.length
      ? Math.round((reviewed.reduce((a, s) => a + s.ease, 0) / reviewed.length) * 10) / 10
      : 2.5

    const statusCounts = { new: 0, due: 0, learned: 0 }
    for (const srs of srsRows) {
      statusCounts[getCardStudyStatus(srs)]++
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dailyActivity: DeckAnalytics['dailyActivity'] = []
    let maxDay = 1
    const dayCounts: number[] = []

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today.getTime() - i * DAY_MS)
      const key = d.toISOString().slice(0, 10)
      const count = logs.filter(l => new Date(l.at).toISOString().slice(0, 10) === key).length
      dayCounts.push(count)
      if (count > maxDay) maxDay = count
      dailyActivity.push({
        date: key,
        label: d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' }),
        count,
        pct: 0,
      })
    }
    for (let i = 0; i < dailyActivity.length; i++) {
      dailyActivity[i].pct = maxDay ? Math.round((dayCounts[i] / maxDay) * 100) : 0
    }

    const topWeak = srsRows
      .filter(isWeakWord)
      .sort((a, b) => b.lapses - a.lapses || a.ease - b.ease)
      .slice(0, 5)
      .map(s => ({
        phrase: cardMap.get(s.cardId)?.phrase ?? '—',
        lapses: s.lapses,
        ease: Math.round(s.ease * 10) / 10,
      }))

    return {
      totalReviews,
      accuracyPct,
      streakDays,
      avgEase,
      ratingCounts,
      modeCounts,
      dailyActivity,
      statusCounts,
      topWeak,
    }
  }, [deckId]) ?? undefined
}