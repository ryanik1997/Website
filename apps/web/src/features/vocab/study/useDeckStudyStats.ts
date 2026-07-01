import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@ryan/db'

export interface DeckStudyStats {
  total: number
  learned: number
  progress: number
  newCount: number
  dueNow: number
  scheduled: number
  nextReviewLabel: string | null
}

function formatNextDue(ms: number): string {
  const diff = ms - Date.now()
  if (diff <= 0) return 'đến hạn ngay'
  const mins = Math.round(diff / 60_000)
  if (mins < 60) return `còn ${mins} phút`
  const hours = Math.round(mins / 60)
  if (hours < 48) return `còn ${hours} giờ`
  const days = Math.round(hours / 24)
  return `còn ${days} ngày`
}

export function useDeckStudyStats(deckId: string | null): DeckStudyStats | null {
  return useLiveQuery(async (): Promise<DeckStudyStats | null> => {
    if (!deckId) return null
    const [cards, srsRows] = await Promise.all([
      db.cards.where('deckId').equals(deckId).toArray(),
      db.srs.where('deckId').equals(deckId).toArray(),
    ])
    const total = cards.length
    const learned = srsRows.filter(s => s.reps > 0).length
    const progress = total ? Math.round((learned / total) * 100) : 0
    const newCount = srsRows.filter(s => s.state === 'new').length
    const dueNow = srsRows.filter(s => s.dueAt <= Date.now()).length
    const scheduled = srsRows.filter(s => s.dueAt > Date.now()).length
    const future = srsRows.filter(s => s.dueAt > Date.now()).map(s => s.dueAt)
    const nextReviewLabel = future.length ? formatNextDue(Math.min(...future)) : null
    return { total, learned, progress, newCount, dueNow, scheduled, nextReviewLabel }
  }, [deckId]) ?? null
}