import type { SpeakingHistory } from '../speaking-ai/speakingAiApi'

export function isIeltsHistory(entry: SpeakingHistory): boolean {
  return /ielts/i.test(`${entry.conversation.mode} ${entry.conversation.topic}`)
}

export function completedIeltsHistory(history: SpeakingHistory[], now = new Date()): SpeakingHistory[] {
  const weekStart = new Date(now); weekStart.setHours(0, 0, 0, 0)
  const day = weekStart.getDay() || 7; weekStart.setDate(weekStart.getDate() - day + 1)
  return history.filter(entry => isIeltsHistory(entry) && entry.turns.length > 0 && (!entry.conversation.started_at || new Date(entry.conversation.started_at) >= weekStart))
}

export function streakDays(history: SpeakingHistory[], now = new Date()): number {
  const key = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  const days = new Set(history.filter(isIeltsHistory).filter(x => x.turns.length > 0).map(x => x.conversation.started_at ? key(new Date(x.conversation.started_at)) : undefined).filter(Boolean))
  const cursor = new Date(now); cursor.setHours(0, 0, 0, 0); let streak = 0
  while (days.has(key(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1) }
  return streak
}
