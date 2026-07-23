/* SM-2 variant — port từ flashcardSrs_v1 */
export interface SrsState {
  ease: number       // default 2.5
  interval: number   // days
  reps: number
  lapses: number
  dueAt: number      // timestamp ms
  state: 'new' | 'learning' | 'review'
}

export type Rating = 1 | 2 | 3 | 4   // 1=Again 2=Hard 3=Good 4=Easy

export function nextSrs(s: SrsState, rating: Rating, now = Date.now()): SrsState {
  const DAY = 86_400_000
  const MINUTE = 60_000
  let { ease, interval, reps, lapses } = s
  let dueInMs: number
  let state: SrsState['state']

  if (rating === 1) {
    lapses++
    interval = 1 / 1440
    reps = 0
    ease = Math.max(1.3, ease - 0.2)
    dueInMs = MINUTE
    state = 'learning'
  } else if (rating === 2) {
    interval = 10 / 1440
    ease = Math.max(1.3, ease - 0.15)
    dueInMs = 10 * MINUTE
    state = 'learning'
  } else {
    reps++
    if (rating === 3) {
      if (reps === 1) interval = 1
      else if (reps === 2) interval = 4
      else interval = Math.max(4, Math.round(interval * ease))
    } else {
      ease = Math.min(3.0, ease + 0.15)
      if (reps === 1) interval = 4
      else interval = Math.max(4, Math.round(interval * ease))
    }
    dueInMs = interval * DAY
    state = 'review'
  }

  return {
    ease,
    interval,
    reps,
    lapses,
    dueAt: now + dueInMs,
    state,
  }
}

export function defaultSrs(cardId: string): SrsState & { cardId: string } {
  return { cardId, ease: 2.5, interval: 0, reps: 0, lapses: 0, dueAt: Date.now(), state: 'new' }
}

/**
 * Thẻ mới (chưa bấm Quên/Nhớ/Khó/Dễ): seed gán dueAt=now để có thể học,
 * nhưng KHÔNG tính là "cần ôn lại".
 * "Ôn lại" = đã vào learning/review và đến hạn (dueAt ≤ now).
 */
export function isSrsNew(s: Pick<SrsState, 'state' | 'reps'>): boolean {
  return s.state === 'new' && s.reps === 0
}

/** Đến hạn ôn thật (đã học trước đó, hoặc đang learning sau khi rating). */
export function isSrsReviewDue(
  s: Pick<SrsState, 'dueAt' | 'state' | 'reps'>,
  now = Date.now(),
): boolean {
  if (s.dueAt > now) return false
  if (isSrsNew(s)) return false
  return true
}

/** Có thể học/ôn ngay: review due HOẶC thẻ mới chưa học. */
export function isSrsStudyable(
  s: Pick<SrsState, 'dueAt' | 'state' | 'reps'>,
  now = Date.now(),
): boolean {
  if (s.dueAt > now) return false
  return true
}
