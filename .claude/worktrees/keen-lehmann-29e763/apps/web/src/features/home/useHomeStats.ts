import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, writingRepo } from '@ryan/db'
import { AI_PROVIDERS } from '@ryan/core'
import { calcCheckInStreak, CHECKIN_MODE } from './checkInSync'

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

  const checkInLogs = useMemo(
    () => reviewLogs.filter(log => log.mode === CHECKIN_MODE),
    [reviewLogs],
  )
  // The overview streak is attendance streak, so it must use the same
  // persisted check-in records as CheckInButton (not study activity logs).
  const streak = useMemo(() => calcCheckInStreak(checkInLogs), [checkInLogs])

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
