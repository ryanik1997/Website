import { useLiveQuery } from 'dexie-react-hooks'
import { isSrsNew, isSrsReviewDue } from '@ryan/core'
import { db } from '@ryan/db'
import { useVocabStore } from '../vocabStore'
import { filterCardsByUnitKind } from '../vocabUnitKind'

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
  const unitKind = useVocabStore(s => s.unitKind)
  return useLiveQuery(async (): Promise<DeckStudyStats | null> => {
    if (!deckId) return null
    const [allCards, srsRows] = await Promise.all([
      db.cards.where('deckId').equals(deckId).toArray(),
      db.srs.where('deckId').equals(deckId).toArray(),
    ])
    const cards = filterCardsByUnitKind(allCards, unitKind)
    const idSet = new Set(cards.map(c => c.id))
    const scoped = srsRows.filter(s => idSet.has(s.cardId))
    const t = Date.now()
    const total = cards.length
    const learned = scoped.filter(s => s.reps > 0 || s.state !== 'new').length
    const progress = total ? Math.round((learned / total) * 100) : 0
    const newCount = scoped.filter(s => isSrsNew(s)).length
    // Chỉ thẻ đã học và đến hạn — không đếm thẻ new seed
    const dueNow = scoped.filter(s => isSrsReviewDue(s, t)).length
    const scheduled = scoped.filter(s => s.dueAt > t).length
    const future = scoped.filter(s => s.dueAt > t).map(s => s.dueAt)
    const nextReviewLabel = future.length ? formatNextDue(Math.min(...future)) : null
    return { total, learned, progress, newCount, dueNow, scheduled, nextReviewLabel }
  }, [deckId, unitKind]) ?? null
}