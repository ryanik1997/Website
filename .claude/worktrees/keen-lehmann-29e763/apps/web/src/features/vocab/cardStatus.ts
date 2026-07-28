import type { Srs } from '@ryan/db'

export type CardStudyStatus = 'new' | 'due' | 'learned'

export const STATUS_LABELS: Record<CardStudyStatus, string> = {
  new: 'Từ mới',
  due: 'Cần ôn',
  learned: 'Đã học',
}

/** Từ mới = chưa ôn; Cần ôn = đến hạn; Đã học = đã ôn, chưa đến hạn */
export function getCardStudyStatus(srs: Srs | undefined): CardStudyStatus {
  if (!srs || srs.state === 'new' || srs.reps === 0) return 'new'
  if (srs.dueAt <= Date.now()) return 'due'
  return 'learned'
}