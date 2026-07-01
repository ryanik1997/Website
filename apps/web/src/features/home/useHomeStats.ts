import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, writingRepo } from '@ryan/db'
import type { ReviewLog } from '@ryan/db'
import { AI_PROVIDERS } from '@ryan/core'

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

export function useHomeStats() {
  const cardCount = useLiveQuery(() => db.cards.count(), []) ?? 0
  const deckCount = useLiveQuery(() => db.decks.count(), []) ?? 0
  const docCount = useLiveQuery(() => db.writingDocs.count(), []) ?? 0
  const wordsStudied = useLiveQuery(
    () => db.srs.where('state').notEqual('new').count(),
    [],
  ) ?? 0
  const reviewLogs = useLiveQuery(() => db.reviewLog.toArray(), []) ?? []
  const hasReview = useLiveQuery(
    () => db.reviewLog.count().then(c => c > 0),
    [],
  ) ?? false
  const hasApiKey = useLiveQuery(async () => {
    for (const p of AI_PROVIDERS) {
      const key = await writingRepo.getSetting(`ai_key_${p.id}`) as string
      if (key?.trim()) return true
    }
    return false
  }, []) ?? false

  const streak = useMemo(() => calcStreak(reviewLogs), [reviewLogs])

  const hasData = deckCount > 0 || docCount > 0 || cardCount > 0

  const onboarding = useMemo(() => [
    { id: 'deck', label: 'Tạo bộ thẻ từ vựng đầu tiên', done: deckCount > 0, to: '/app/vocab' },
    { id: 'cards', label: 'Thêm ít nhất 10 từ', done: cardCount >= 10, to: '/app/vocab' },
    { id: 'srs', label: 'Học thử chế độ Lặp lại (SRS)', done: hasReview, to: '/app/vocab' },
    { id: 'writing', label: 'Tạo bài Writing IELTS', done: docCount > 0, to: '/app/writing' },
    { id: 'ai', label: 'Cấu hình API key (Settings → AI)', done: hasApiKey, to: '/app/settings?tab=ai' },
  ], [deckCount, cardCount, docCount, hasReview, hasApiKey])

  const onboardingDone = onboarding.filter(s => s.done).length

  return {
    cardCount,
    deckCount,
    docCount,
    wordsStudied,
    streak,
    hasData,
    onboarding,
    onboardingDone,
  }
}