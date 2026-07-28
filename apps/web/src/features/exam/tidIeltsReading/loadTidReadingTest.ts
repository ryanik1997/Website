import type { ReadingTest } from './types'

/**
 * Map app exam ids → TID slug `cam-{book}-{test}`.
 * Examples:
 *  - catalog-cam-9-1-reading → cam-9-1
 *  - ielts-cam9-test1 / catalog-ielts-cam9-test1 → cam-9-1
 *  - reading-ielts-cam18-test2 → cam-18-2
 */
export function examIdToTidSlug(examId: string): string | null {
  const id = examId.toLowerCase().replace(/_/g, '-')

  // catalog-cam-9-1-reading | cam-9-1 | reading-cam-9-1
  let m = id.match(/(?:^|-)cam-(\d+)-(\d+)(?:-|$)/)
  if (m) return `cam-${Number(m[1])}-${Number(m[2])}`

  // ielts-cam9-test1 | catalog-ielts-cam19-test2 | reading-ielts-cam10-test3
  m = id.match(/cam\s*(\d+)[- ]*test\s*(\d+)/i) || id.match(/cam(\d+)-test(\d+)/)
  if (m) return `cam-${Number(m[1])}-${Number(m[2])}`

  // title-like cam9test1
  m = id.match(/cam(\d{1,2})test(\d)/)
  if (m) return `cam-${Number(m[1])}-${Number(m[2])}`

  return null
}

const modules = import.meta.glob('./data/reading-cam-*.json', { eager: true }) as Record<
  string,
  { default: Omit<ReadingTest, 'slug'> } | Omit<ReadingTest, 'slug'>
>

function loadRaw(slug: string): Omit<ReadingTest, 'slug'> | null {
  const key = Object.keys(modules).find((k) => k.endsWith(`reading-${slug}.json`))
  if (!key) return null
  const mod = modules[key]
  if (!mod) return null
  if ('default' in mod && mod.default) return mod.default
  return mod as Omit<ReadingTest, 'slug'>
}

export function loadTidReadingTestBySlug(slug: string): ReadingTest | null {
  const raw = loadRaw(slug)
  if (!raw) return null
  return { ...raw, slug }
}

export function loadTidReadingTestByExamId(examId: string): ReadingTest | null {
  const slug = examIdToTidSlug(examId)
  if (!slug) return null
  return loadTidReadingTestBySlug(slug)
}

export function hasTidReadingTest(examId: string): boolean {
  return loadTidReadingTestByExamId(examId) != null
}
