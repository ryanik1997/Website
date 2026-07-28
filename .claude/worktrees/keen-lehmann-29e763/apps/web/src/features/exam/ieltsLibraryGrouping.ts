export type IeltsLibrarySkill = 'reading' | 'listening'

export interface IeltsParsedExam<T> {
  exam: T
  cambridge: number
  test: number
}

export interface IeltsCambridgeBook<T> {
  cambridge: number
  exams: IeltsParsedExam<T>[]
}

const CAM_TITLE_RE = /Cambridge\s*(\d+)\s*Test\s*(\d+)/i

export function parseIeltsCambridgeTitle(title: string): { cambridge: number; test: number } | null {
  const match = title.match(CAM_TITLE_RE)
  if (!match) return null
  return { cambridge: Number(match[1]), test: Number(match[2]) }
}

export function groupExamsByCambridgeBook<T extends { title: string }>(
  exams: T[],
): { books: IeltsCambridgeBook<T>[]; ungrouped: T[] } {
  const byCam = new Map<number, IeltsParsedExam<T>[]>()
  const ungrouped: T[] = []

  for (const exam of exams) {
    const parsed = parseIeltsCambridgeTitle(exam.title)
    if (!parsed) {
      ungrouped.push(exam)
      continue
    }
    const list = byCam.get(parsed.cambridge) ?? []
    list.push({ exam, cambridge: parsed.cambridge, test: parsed.test })
    byCam.set(parsed.cambridge, list)
  }

  const books = [...byCam.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([cambridge, items]) => ({
      cambridge,
      exams: items.sort((a, b) => a.test - b.test),
    }))

  return { books, ungrouped }
}

/** Màu bìa sách theo mockup Giaodien/Giaodienlistening.jpg */
const BOOK_COVER_COLORS: Record<number, string> = {
  20: '#9a6b45',
  19: '#1e3a5f',
  18: '#1f1f1f',
  17: '#5b3a8c',
  16: '#1a6b6b',
  15: '#7a5238',
  14: '#2d4a3e',
  13: '#3d5a80',
  12: '#4a3728',
  11: '#2c5282',
  10: '#6b4423',
  9: '#1a365d',
}

export function getIeltsBookCoverColor(cambridge: number): string {
  return BOOK_COVER_COLORS[cambridge]
    ?? `hsl(${(cambridge * 37) % 360} 32% 38%)`
}

export function filterIeltsBooksByQuery<T extends { title: string }>(
  books: IeltsCambridgeBook<T>[],
  ungrouped: T[],
  query: string,
): { books: IeltsCambridgeBook<T>[]; ungrouped: T[] } {
  const q = query.trim().toLowerCase()
  if (!q) return { books, ungrouped }

  const camMatch = q.match(/cam(?:bridge)?\s*(\d+)/i)
  const testMatch = q.match(/test\s*(\d+)/i)

  const filteredBooks = books
    .filter(book => {
      if (camMatch && Number(camMatch[1]) !== book.cambridge) return false
      if (!camMatch && !`cambridge ${book.cambridge}`.includes(q) && !String(book.cambridge).includes(q)) {
        return book.exams.some(e => e.exam.title.toLowerCase().includes(q))
      }
      return true
    })
    .map(book => ({
      ...book,
      exams: testMatch
        ? book.exams.filter(e => e.test === Number(testMatch[1]))
        : book.exams.filter(e => e.exam.title.toLowerCase().includes(q) || !camMatch),
    }))
    .filter(book => book.exams.length > 0)

  const filteredUngrouped = ungrouped.filter(e => e.title.toLowerCase().includes(q))

  return { books: filteredBooks, ungrouped: filteredUngrouped }
}