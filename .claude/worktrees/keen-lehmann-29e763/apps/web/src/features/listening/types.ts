export interface LessonSentence {
  id: string
  text: string
  vi?: string
  ease: number
  interval: number
  reps: number
  lapses: number
  dueAt: number
  state: 'new' | 'learning' | 'review'
}

export function defaultSentence(text: string): LessonSentence {
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    ease: 2.5, interval: 0, reps: 0, lapses: 0,
    dueAt: Date.now(), state: 'new',
  }
}

export function parseSentences(raw: unknown[]): LessonSentence[] {
  return raw as LessonSentence[]
}

/** Tách đoạn văn thành câu */
export function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 4)
}

/** Chấm từng từ: trả về mảng { word, correct } */
export function compareWords(
  input: string,
  target: string,
): { word: string; correct: boolean }[] {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const targetWords = target.trim().split(/\s+/)
  const inputWords = input.trim().split(/\s+/)
  return targetWords.map((word, i) => ({
    word,
    correct: normalize(inputWords[i] ?? '') === normalize(word),
  }))
}

export function accuracy(comparison: { correct: boolean }[]): number {
  if (!comparison.length) return 0
  return Math.round((comparison.filter(c => c.correct).length / comparison.length) * 100)
}

/** Chọn SRS rating theo accuracy */
export function ratingFromAccuracy(pct: number): 1 | 2 | 3 | 4 {
  if (pct >= 90) return 4
  if (pct >= 70) return 3
  if (pct >= 40) return 2
  return 1
}
