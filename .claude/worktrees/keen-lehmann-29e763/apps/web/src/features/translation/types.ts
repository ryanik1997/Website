import type { TranslationSentence, TranslationSet } from '@ryan/db'

export type TranslationCategory = TranslationSet['category']

export const CATEGORY_LABELS: Record<TranslationCategory, string> = {
  grammar_basic: 'Cấu trúc',
  collocation: 'Collocation',
  paragraph_65: 'Band 6.5',
  paragraph_80: 'Band 8.0',
  essay_full: 'Essay',
  ielts_task2: 'IELTS T2',
  ielts_task1: 'IELTS T1',
  daily: 'Daily',
  user: 'Của tôi',
}

export const DIFFICULTY_LABELS: Record<TranslationSentence['difficulty'], string> = {
  easy: 'Dễ',
  medium: 'TB',
  hard: 'Khó',
}

export type PracticeRating = 'easy' | 'ok' | 'hard'

export interface TargetHighlight {
  word: string
  status: 'correct' | 'missing'
}

export interface TranslationCompareResult {
  targetHighlights: TargetHighlight[]
  extraWords: string[]
  accuracy: number
}

function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9'-]/g, '')
}

function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}

function wordsClose(a: string, b: string): boolean {
  if (a === b) return true
  if (!a || !b) return false
  if (Math.abs(a.length - b.length) > 2) return false
  const maxLen = Math.max(a.length, b.length)
  let diff = 0
  const minLen = Math.min(a.length, b.length)
  for (let i = 0; i < minLen; i++) {
    if (a[i] !== b[i]) diff++
  }
  diff += maxLen - minLen
  return diff <= 1
}

export function compareTranslation(input: string, target: string): TranslationCompareResult {
  const targetWords = tokenize(target)
  const inputWords = tokenize(input)
  const inputNorm = inputWords.map(normalizeWord)

  const used = new Set<number>()
  const targetHighlights: TargetHighlight[] = []
  let correctCount = 0
  let scorable = 0

  for (const word of targetWords) {
    const norm = normalizeWord(word)
    if (!norm) {
      targetHighlights.push({ word, status: 'correct' })
      continue
    }
    scorable++
    let found = false
    for (let i = 0; i < inputNorm.length; i++) {
      if (used.has(i)) continue
      if (wordsClose(inputNorm[i], norm)) {
        used.add(i)
        found = true
        break
      }
    }
    if (found) {
      targetHighlights.push({ word, status: 'correct' })
      correctCount++
    } else {
      targetHighlights.push({ word, status: 'missing' })
    }
  }

  const extraWords = inputWords.filter((_, i) => !used.has(i))
  const accuracy = scorable > 0 ? Math.round((correctCount / scorable) * 100) : 0

  return { targetHighlights, extraWords, accuracy }
}

export function isDue(s: TranslationSentence): boolean {
  return (s.srsState?.dueAt ?? 0) <= Date.now()
}

export function isSentenceTranslated(s: TranslationSentence): boolean {
  return (s.srsState?.translatedAt ?? 0) > 0
}

export function countDue(sentences: TranslationSentence[]): number {
  return sentences.filter(isDue).length
}

const DAY = 86_400_000

export function applyPracticeRating(
  srs: TranslationSentence['srsState'],
  rating: PracticeRating,
  now = Date.now(),
): NonNullable<TranslationSentence['srsState']> {
  const base = srs ?? { ease: 2.5, interval: 0, dueAt: now, reps: 0 }

  if (rating === 'hard') {
    return { ...base, interval: 0, dueAt: now, reps: base.reps, translatedAt: base.translatedAt }
  }

  const days = rating === 'easy' ? 3 : 1
  return {
    ...base,
    interval: days,
    dueAt: now + days * DAY,
    reps: base.reps + 1,
    translatedAt: base.translatedAt,
  }
}

export function defaultSentence(
  data: Pick<TranslationSentence, 'vi' | 'en' | 'hint' | 'difficulty'>,
): TranslationSentence {
  return {
    id: crypto.randomUUID(),
    ...data,
    srsState: { ease: 2.5, interval: 0, dueAt: Date.now(), reps: 0 },
  }
}