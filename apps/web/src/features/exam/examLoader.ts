import type { ReadingExamRecord } from '@ryan/db'
import { examRepo } from '@ryan/db'
import type { ReadingExam, ReadingPart } from './examData'
import { READING_EXAMS } from './examData'
import { dedupeExamsForLibraryDisplay, preferLibraryExam } from './examListFilter'
import { fillReadingExamFromSources } from './fillReadingExamMedia'
import { getPublishedReadingExam, listPublishedReadingExams } from './readingExamPublish'
import { sanitizeReadingExam } from './readingExamSanitize'
import { isReadingCatalogHidden, listHiddenReadingCatalogIds } from './examCatalogHide'

function recordToExam(record: ReadingExamRecord): ReadingExam {
  return sanitizeReadingExam({
    id: record.id,
    title: record.title,
    durationMinutes: record.durationMinutes,
    bandHint: record.bandHint,
    parts: record.parts as ReadingPart[],
    examTrack: record.examTrack,
    cambridgeLevel: record.cambridgeLevel,
  })
}

export function getBuiltinReadingExam(examId: string): ReadingExam | null {
  const exam = READING_EXAMS.find(e => e.id === examId)
  return exam ? sanitizeReadingExam(exam) : null
}

/** Catalog donor: ưu tiên cùng id; không lấy lung tung đề khác (tránh Part 7 dính ảnh Test 1). */
function findCatalogMediaDonor(exam: ReadingExam): ReadingExam | null {
  const exact = getBuiltinReadingExam(exam.id)
  if (exact) return exact
  if (!exam.cambridgeLevel) return null

  const testOf = (t: string) => t.toLowerCase().match(/\btest\s*(\d+)\b/)?.[1]
  const bookOf = (t: string) => t.toLowerCase().match(/\bbook\s*(\d+)\b/)?.[1]
  const wantTest = testOf(exam.title)
  const wantBook = bookOf(exam.title)
  const track = exam.examTrack ?? 'cambridge'

  // Match Book + Test + level + part count (an toàn khi id local ≠ catalog)
  if (wantTest) {
    const matched = READING_EXAMS.find(e => {
      if (!e.id.startsWith('catalog-')) return false
      if (e.cambridgeLevel !== exam.cambridgeLevel) return false
      if ((e.examTrack ?? 'cambridge') !== track) return false
      if (e.parts.length !== exam.parts.length) return false
      if (testOf(e.title) !== wantTest) return false
      if (wantBook && bookOf(e.title) && bookOf(e.title) !== wantBook) return false
      return true
    })
    if (matched) return matched
  }

  // Không fallback “đề catalog đầu tiên cùng level” — hay dính ket-a2-test1 / book4-test1
  return null
}

export async function resolveReadingExam(examId: string): Promise<ReadingExam | null> {
  if (await isReadingCatalogHidden(examId)) return null

  const local = await examRepo.get(examId).then(r => (r ? recordToExam(r) : null))

  let published: ReadingExam | null = null
  try {
    published = await getPublishedReadingExam(examId)
    if (published) published = sanitizeReadingExam(published)
  } catch (err) {
    console.warn('Không tải được đề Reading published:', err)
  }

  let builtin = getBuiltinReadingExam(examId)
  // Mode C: hydrate catalog stub → full body (signed)
  if (builtin && examId.startsWith('catalog-reading-')) {
    try {
      const { fetchCatalogExamBody } = await import('./catalogExamBody')
      const full = await fetchCatalogExamBody(builtin, 'reading')
      builtin = sanitizeReadingExam(full as ReadingExam)
    } catch (err) {
      console.warn('[resolveReadingExam] catalog body hydrate failed', examId, err)
      throw err
    }
  }

  // Cùng id: ưu tiên nhiều part hơn (catalog 7-part / publish RW thắng local 5-part cũ)
  const candidates = [local, published, builtin].filter((e): e is ReadingExam => Boolean(e))
  if (!candidates.length) return null
  const winner = candidates.reduce((best, cur) => preferLibraryExam(best, cur))

  // Published/local hay mất imageUrl (chỉ còn imageKey bị strip) hoặc mất text Part 2
  // → vá từ catalog + các bản còn lại
  const donor = findCatalogMediaDonor(winner)
  return fillReadingExamFromSources(winner, [donor, builtin, published, local])
}

export async function listAllReadingExams(): Promise<ReadingExam[]> {
  const imported = (await examRepo.list()).map(recordToExam)
  const builtinIds = new Set(READING_EXAMS.map(e => e.id))

  let published: ReadingExam[] = []
  try {
    published = await listPublishedReadingExams()
  } catch (err) {
    console.warn('Không tải danh sách đề Reading published:', err)
  }

  // Cùng id: ưu tiên bản nhiều part hơn (vd. publish 7-part ghi đè catalog 5-part cũ trên list)
  const byId = new Map<string, ReadingExam>()
  for (const exam of READING_EXAMS) {
    byId.set(exam.id, exam)
  }
  for (const raw of published) {
    const exam = sanitizeReadingExam(raw)
    const prev = byId.get(exam.id)
    byId.set(exam.id, prev ? preferLibraryExam(prev, exam) : exam)
  }
  const publishedIds = new Set(published.map(e => e.id))
  const localOnly = imported.filter(e => !builtinIds.has(e.id) && !publishedIds.has(e.id))
  // Dedupe sample/catalog/local cùng Test (vd. double "Test 1 · A2 Key Reading — 5 parts")
  const hidden = new Set(await listHiddenReadingCatalogIds())
  const all = dedupeExamsForLibraryDisplay([...byId.values(), ...localOnly])
  const visible = all.filter(e => !hidden.has(e.id))
  const { filterExamsForPlan } = await import('./freePlanCatalogGate')
  return filterExamsForPlan(visible, 'reading')
}

export function examRecordFromReading(exam: ReadingExam, source: 'pdf' | 'manual', sourceFilename?: string) {
  return {
    id: exam.id,
    title: exam.title,
    durationMinutes: exam.durationMinutes,
    bandHint: exam.bandHint,
    parts: exam.parts as unknown[],
    source,
    sourceFilename,
    examTrack: exam.examTrack,
    cambridgeLevel: exam.cambridgeLevel,
  }
}