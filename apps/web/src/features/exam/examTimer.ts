export function formatExamTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function initialExamTimerSeconds(durationMinutes: number): number {
  return durationMinutes * 60
}