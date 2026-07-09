/** CEFR levels dùng cho Translation / Cấu trúc câu / gợi ý sau exam */
export type CefrLevel = 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export const CEFR_LEVELS: CefrLevel[] = ['A2', 'B1', 'B2', 'C1', 'C2']

export const CEFR_LABELS: Record<CefrLevel, string> = {
  A2: 'A2 · Cơ bản',
  B1: 'B1 · Trung cấp',
  B2: 'B2 · Trung cao',
  C1: 'C1 · Cao cấp',
  C2: 'C2 · Thành thạo',
}

const ORDER: Record<CefrLevel, number> = { A2: 0, B1: 1, B2: 2, C1: 3, C2: 4 }

export function parseCefr(v: unknown): CefrLevel | undefined {
  if (typeof v !== 'string') return undefined
  const u = v.trim().toUpperCase()
  if ((CEFR_LEVELS as string[]).includes(u)) return u as CefrLevel
  return undefined
}

/** Band IELTS thô → CEFR gợi ý ôn */
export function ieltsBandToCefr(band: number): CefrLevel {
  if (band < 4.0) return 'A2'
  if (band < 5.0) return 'A2'
  if (band < 6.0) return 'B1'
  if (band < 7.0) return 'B2'
  if (band < 8.0) return 'C1'
  return 'C2'
}

/** % đúng (0–100) → CEFR gợi ý (Cambridge / general) */
export function percentToCefr(pct: number): CefrLevel {
  if (pct < 40) return 'A2'
  if (pct < 55) return 'B1'
  if (pct < 70) return 'B2'
  if (pct < 85) return 'C1'
  return 'C2'
}

/** CEFR mục tiêu ôn: thường hạ 1 bậc nếu điểm thấp, giữ/nâng nhẹ nếu cao */
export function practiceCefrFromScore(opts: {
  framework: 'ielts' | 'cambridge' | 'other'
  correct: number
  total: number
  band?: number
}): CefrLevel {
  const pct = opts.total > 0 ? (opts.correct / opts.total) * 100 : 0
  if (opts.framework === 'ielts' && opts.band != null) {
    const base = ieltsBandToCefr(opts.band)
    // Ôn tập: tập trung level hiện tại (hoặc thấp hơn 1 nếu band thấp)
    if (opts.band < 5.5) return stepDown(base)
    return base
  }
  const base = percentToCefr(pct)
  if (pct < 50) return stepDown(base)
  return base
}

function stepDown(level: CefrLevel): CefrLevel {
  const i = ORDER[level]
  if (i <= 0) return 'A2'
  return CEFR_LEVELS[i - 1]
}

export function cefrBadgeStyle(level: CefrLevel): { bg: string; color: string } {
  switch (level) {
    case 'A2': return { bg: 'color-mix(in srgb, #22c55e 16%, transparent)', color: '#16a34a' }
    case 'B1': return { bg: 'color-mix(in srgb, #3b82f6 16%, transparent)', color: '#2563eb' }
    case 'B2': return { bg: 'color-mix(in srgb, #8b5cf6 16%, transparent)', color: '#7c3aed' }
    case 'C1': return { bg: 'color-mix(in srgb, #f59e0b 16%, transparent)', color: '#d97706' }
    case 'C2': return { bg: 'color-mix(in srgb, #ef4444 16%, transparent)', color: '#dc2626' }
  }
}
