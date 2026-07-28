import { isSrsNew, isSrsReviewDue } from '@ryan/core'
import type { Srs } from '@ryan/db'

export type CardStudyStatus = 'new' | 'due' | 'learned'

export const STATUS_LABELS: Record<CardStudyStatus, string> = {
  new: 'Từ mới',
  due: 'Cần ôn',
  learned: 'Đã học',
}

/** Từ mới = chưa rating; Cần ôn = đã học + đến hạn; Đã học = đã ôn, chưa đến hạn */
export function getCardStudyStatus(srs: Srs | undefined): CardStudyStatus {
  if (!srs || isSrsNew(srs)) return 'new'
  if (isSrsReviewDue(srs)) return 'due'
  return 'learned'
}