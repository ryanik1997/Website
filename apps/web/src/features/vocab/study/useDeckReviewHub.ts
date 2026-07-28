import { useLiveQuery } from 'dexie-react-hooks'
import { isSrsNew, isSrsReviewDue } from '@ryan/core'
import { db } from '@ryan/db'
import { isWeakWord } from './weakWords'
import { useVocabStore } from '../vocabStore'
import { filterCardsByUnitKind } from '../vocabUnitKind'

export interface ReviewDayBucket {
  label: string
  dateKey: string
  count: number
  isToday: boolean
  isPast: boolean
}

export interface ReviewHubData {
  dueNow: number
  newCount: number
  scheduled: number
  weakCount: number
  total: number
  upcoming: ReviewDayBucket[]
}

const DAY_MS = 86_400_000

function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

function dayLabel(key: string, todayKey: string): string {
  if (key === todayKey) return 'Hôm nay'
  const d = new Date(key + 'T12:00:00')
  const diff = Math.round((d.getTime() - new Date(todayKey + 'T12:00:00').getTime()) / DAY_MS)
  if (diff === 1) return 'Ngày mai'
  if (diff > 1 && diff <= 7) return `${diff} ngày nữa`
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function useDeckReviewHub(deckId: string | null): ReviewHubData | undefined {
  const unitKind = useVocabStore(s => s.unitKind)
  return useLiveQuery(async () => {
    if (!deckId) return null
    const [allCards, allSrs] = await Promise.all([
      db.cards.where('deckId').equals(deckId).toArray(),
      db.srs.where('deckId').equals(deckId).toArray(),
    ])
    const cards = filterCardsByUnitKind(allCards, unitKind)
    const idSet = new Set(cards.map(c => c.id))
    const srsRows = allSrs.filter(s => idSet.has(s.cardId))
    const now = Date.now()
    const todayKey = dayKey(now)
    const dueNow = srsRows.filter(s => isSrsReviewDue(s, now)).length
    const newCount = srsRows.filter(s => isSrsNew(s)).length
    const scheduled = srsRows.filter(s => s.dueAt > now).length
    const weakCount = srsRows.filter(isWeakWord).length

    const bucketMap = new Map<string, number>()
    for (const s of srsRows) {
      // Lịch ôn: chỉ thẻ đã vào SRS (không nhét cả kho seed "new" vào "Hôm nay")
      if (isSrsNew(s)) continue
      if (s.dueAt <= now) {
        const k = todayKey
        bucketMap.set(k, (bucketMap.get(k) ?? 0) + 1)
      } else {
        const k = dayKey(s.dueAt)
        bucketMap.set(k, (bucketMap.get(k) ?? 0) + 1)
      }
    }

    const upcoming: ReviewDayBucket[] = []
    for (let i = -1; i < 7; i++) {
      const ts = new Date(todayKey + 'T12:00:00').getTime() + i * DAY_MS
      const key = dayKey(ts)
      const count = bucketMap.get(key) ?? 0
      if (count === 0 && i > 0) continue
      upcoming.push({
        label: i < 0 ? 'Quá hạn' : dayLabel(key, todayKey),
        dateKey: key,
        count,
        isToday: key === todayKey,
        isPast: i < 0,
      })
      if (upcoming.length >= 8) break
    }

    return {
      dueNow,
      newCount,
      scheduled,
      weakCount,
      total: cards.length,
      upcoming: upcoming.filter(b => b.count > 0 || b.isToday || b.isPast),
    }
  }, [deckId, unitKind]) ?? undefined
}