export function formatExamTimer(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function initialExamTimerSeconds(durationMinutes: number): number {
  return Math.max(0, Math.floor(durationMinutes * 60))
}

/** Giới hạn chỉnh tay: 0 → 6 giờ */
export const EXAM_TIMER_MAX_SECONDS = 6 * 60 * 60

export function clampExamTimerSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return 0
  return Math.max(0, Math.min(EXAM_TIMER_MAX_SECONDS, Math.floor(seconds)))
}

/**
 * Parse input người dùng:
 * - `m:ss` / `mm:ss` / `h:mm:ss`
 * - số thuần = phút (vd. `60` → 60:00)
 */
export function parseExamTimerInput(raw: string): number | null {
  const t = raw.trim().replace(/\s+/g, '')
  if (!t) return null

  if (/^\d+$/.test(t)) {
    const mins = Number(t)
    if (!Number.isFinite(mins)) return null
    return clampExamTimerSeconds(mins * 60)
  }

  const parts = t.split(':')
  if (parts.length === 2) {
    const m = Number(parts[0])
    const s = Number(parts[1])
    if (!Number.isFinite(m) || !Number.isFinite(s) || s < 0 || s >= 60 || m < 0) return null
    return clampExamTimerSeconds(m * 60 + s)
  }
  if (parts.length === 3) {
    const h = Number(parts[0])
    const m = Number(parts[1])
    const s = Number(parts[2])
    if (
      !Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(s)
      || h < 0 || m < 0 || m >= 60 || s < 0 || s >= 60
    ) return null
    return clampExamTimerSeconds(h * 3600 + m * 60 + s)
  }
  return null
}