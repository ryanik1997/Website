export interface LibraryParsedExam<T> {
  exam: T
  book: number
  test: number
}

export interface LibraryBook<T> {
  book: number
  exams: LibraryParsedExam<T>[]
}

const CAM_BOOK_RE = /Cambridge\s*(\d+)/i
const BOOK_VOL_RE = /(?:Book|Vol(?:ume)?)\s*(\d+)/i
const TEST_RE = /Test\s*(\d+)/i

export function parseCambridgeTestNumber(title: string): number | null {
  const match = title.match(TEST_RE)
  if (match) return Number(match[1])
  if (/\bsample\b/i.test(title)) return 1
  return null
}

/** Suy ra số “quyển” từ tiêu đề hoặc gom Test 1–4 → Book 1, Test 5–8 → Book 2… */
export function parseCambridgeBookNumber(title: string): number {
  const cam = title.match(CAM_BOOK_RE)
  if (cam) return Number(cam[1])
  const vol = title.match(BOOK_VOL_RE)
  if (vol) return Number(vol[1])
  const test = parseCambridgeTestNumber(title)
  if (test != null) return Math.ceil(test / 4)
  return 1
}

export function groupCambridgeExamsByBook<T extends { title: string }>(
  exams: T[],
): { books: LibraryBook<T>[]; ungrouped: T[] } {
  const byBook = new Map<number, LibraryParsedExam<T>[]>()
  const ungrouped: T[] = []

  for (const exam of exams) {
    const test = parseCambridgeTestNumber(exam.title)
    if (test == null) {
      ungrouped.push(exam)
      continue
    }
    const book = parseCambridgeBookNumber(exam.title)
    const list = byBook.get(book) ?? []
    list.push({ exam, book, test })
    byBook.set(book, list)
  }

  const books = [...byBook.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([book, items]) => ({
      book,
      exams: items.sort((a, b) => a.test - b.test),
    }))

  return { books, ungrouped }
}

const BRAND_BASE_COLORS: Record<string, string> = {
  KET: '#b85c2a',
  PET: '#1a6b8c',
  FCE: '#2d6b4a',
  CAE: '#5b3a8c',
  CPE: '#2a2a2a',
}

export function getCambridgeBrandBookCoverColor(brand: string, book: number): string {
  const base = BRAND_BASE_COLORS[brand] ?? '#4a5568'
  if (book <= 1) return base
  const hueShift = (book - 1) * 18
  return `color-mix(in srgb, ${base} 72%, hsl(${(book * 41 + hueShift) % 360} 38% 32%))`
}

export function filterCambridgeBooksByQuery<T extends { title: string }>(
  books: LibraryBook<T>[],
  ungrouped: T[],
  query: string,
  brand: string,
): { books: LibraryBook<T>[]; ungrouped: T[] } {
  const q = query.trim().toLowerCase()
  if (!q) return { books, ungrouped }

  const bookMatch = q.match(/(?:book|vol(?:ume)?|quyển)\s*(\d+)/i)
  const testMatch = q.match(/test\s*(\d+)/i)
  const brandLower = brand.toLowerCase()

  const filteredBooks = books
    .filter(book => {
      if (bookMatch && Number(bookMatch[1]) !== book.book) return false
      if (!bookMatch && q.includes(brandLower)) return true
      if (!bookMatch && (`book ${book.book}`.includes(q) || String(book.book).includes(q))) return true
      return book.exams.some(e => e.exam.title.toLowerCase().includes(q))
    })
    .map(book => ({
      ...book,
      exams: testMatch
        ? book.exams.filter(e => e.test === Number(testMatch[1]))
        : book.exams.filter(e => e.exam.title.toLowerCase().includes(q) || !testMatch),
    }))
    .filter(book => book.exams.length > 0)

  const filteredUngrouped = ungrouped.filter(e => e.title.toLowerCase().includes(q))

  return { books: filteredBooks, ungrouped: filteredUngrouped }
}

export function formatCambridgeBookTitle(brand: string, book: number): string {
  return `CAMBRIDGE ${brand} ${book}`
}