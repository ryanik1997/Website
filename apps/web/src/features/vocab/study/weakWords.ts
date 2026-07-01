import type { Srs } from '@ryan/db'

/** Từ yếu: đã quên ≥1 lần, ease thấp, hoặc đang học lại */
export function isWeakWord(srs: Srs): boolean {
  if (srs.reps === 0 && srs.lapses === 0) return false
  return srs.lapses >= 1 || srs.ease < 2.0 || srs.state === 'learning'
}

/** Điểm ưu tiên ôn — cao hơn = yếu hơn */
export function weakScore(srs: Srs): number {
  return srs.lapses * 10 + Math.max(0, 2.5 - srs.ease) * 5 + (srs.state === 'learning' ? 3 : 0)
}

export function easeLabel(ease: number): string {
  if (ease < 1.5) return 'Rất khó'
  if (ease < 2.0) return 'Khó'
  if (ease < 2.5) return 'Trung bình'
  return 'Ổn định'
}