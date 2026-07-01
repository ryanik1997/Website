import type { Lesson } from '@ryan/db'
import { lessonStats } from './listeningUtils'

export interface LessonBookGroup {
  bookNum: number | string
  book: string
  tests: Record<number, Lesson[]>
}

const BOOK_COLORS: Record<number, string> = {
  20: '#b45309', 19: '#1e293b', 18: '#1e293b', 17: '#7c3aed', 16: '#1e3a5f',
  15: '#065f46', 14: '#831843', 13: '#7f1d1d', 2: '#7c3aed',
}

const BOOK_COLOR_PALETTE = [
  '#0f766e', '#0369a1', '#7c3aed', '#b45309', '#be185d',
  '#166534', '#9333ea', '#c2410c', '#0e7490', '#4338ca',
]

export function getBookColor(bookNum: number | string | undefined, seed?: string): string {
  if (bookNum != null) {
    const n = typeof bookNum === 'number' ? bookNum : parseInt(String(bookNum), 10)
    if (!Number.isNaN(n) && BOOK_COLORS[n]) return BOOK_COLORS[n]!
  }
  const s = String(seed ?? bookNum ?? '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i)) % BOOK_COLOR_PALETTE.length
  return BOOK_COLOR_PALETTE[h]!
}

export function bookThumbSmall(bookNum: number | string | undefined): string {
  if (bookNum == null) return ''
  const n = typeof bookNum === 'number' ? bookNum : parseInt(String(bookNum), 10)
  return Number.isNaN(n) ? '' : String(n)
}

export function isStructuredLesson(lesson: Lesson): boolean {
  return Boolean(lesson.book?.trim() || lesson.bookNum != null)
}

export function groupCambridgeLessons(lessons: Lesson[]): LessonBookGroup[] {
  const books: Record<string, LessonBookGroup> = {}

  for (const lesson of lessons) {
    if (!isStructuredLesson(lesson)) continue
    const book = lesson.book?.trim() || `Cambridge ${lesson.bookNum ?? ''}`
    const bookNum = lesson.bookNum ?? book
    const key = String(bookNum)
    if (!books[key]) books[key] = { bookNum, book, tests: {} }
    const test = lesson.test ?? 1
    if (!books[key].tests[test]) books[key].tests[test] = []
    books[key].tests[test].push(lesson)
  }

  return Object.values(books)
    .map(g => {
      for (const t of Object.keys(g.tests)) {
        g.tests[Number(t)]!.sort((a, b) => (a.part ?? 1) - (b.part ?? 1))
      }
      return g
    })
    .sort((a, b) => {
      const an = typeof a.bookNum === 'number' ? a.bookNum : parseInt(String(a.bookNum), 10)
      const bn = typeof b.bookNum === 'number' ? b.bookNum : parseInt(String(b.bookNum), 10)
      if (!Number.isNaN(an) && !Number.isNaN(bn)) return bn - an
      return a.book.localeCompare(b.book)
    })
}

export function buildCambridgeTitle(book: string, test: number, part: number): string {
  return `${book} — Test ${test} — Part ${part}`
}

export function partLabel(lesson: Lesson): string {
  return `Part ${lesson.part ?? 1}`
}

export function testCount(group: LessonBookGroup): number {
  return Object.keys(group.tests).length
}

export function partSentenceCount(lesson: Lesson): number {
  return lessonStats(lesson).count
}