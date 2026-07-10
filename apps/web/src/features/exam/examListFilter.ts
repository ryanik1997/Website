import { isImportedReadingExamId } from './importReadingManualUtils'
import {
  parseCambridgeBookNumber,
  parseCambridgeTestNumber,
} from './cambridgeLibraryGrouping'

export const EXAM_IMPORTS_ONLY_STORAGE_KEY = 'ryan-exam-imports-only'

export function isUserImportedListeningExamId(id: string): boolean {
  return id.startsWith('listening-import-')
}

/** Đề hệ thống (builtin/catalog/sample) — không cho xóa. */
export function isSystemListeningExamId(id: string): boolean {
  return (
    id.startsWith('catalog-')
    || isCambridgeSampleExamId(id)
    || id.startsWith('ielts-listening-')
  )
}

/** Có thể xóa khỏi Library: import local hoặc bản publish (không phải catalog). */
export function canDeleteListeningExamId(id: string): boolean {
  if (isSystemListeningExamId(id)) return false
  // Import local hoặc publish từ import (cùng id listening-import-*)
  if (isUserImportedListeningExamId(id)) return true
  // Publish admin với id khác (uuid) — cho xóa nếu không phải system
  if (!id.startsWith('catalog-') && !isCambridgeSampleExamId(id)) return true
  return false
}

/** Đề sample stub (nội bộ) — ẩn khi đã có catalog builtin cùng level/type. */
export function isCambridgeSampleExamId(id: string): boolean {
  return (
    id.includes('-sample-')
    || /^cambridge-[a-z0-9]+-(reading|listening)-sample/i.test(id)
    || /^(ket|pet|fce|cae|cpe)-listening-sample/i.test(id)
  )
}

export function examSourceRank(id: string): number {
  if (id.startsWith('catalog-')) return 100
  if (isCambridgeSampleExamId(id)) return 10
  if (isImportedReadingExamId(id) || isUserImportedListeningExamId(id)) return 40
  return 50
}

function partCount(e: { parts?: unknown[] }): number {
  return Array.isArray(e.parts) ? e.parts.length : 0
}

function hasWritingLabel(e: { title?: string; bandHint?: string }): boolean {
  const s = `${e.title ?? ''} ${e.bandHint ?? ''}`
  return /writing/i.test(s) || /&\s*writing/i.test(s) || /rw\b/i.test(s)
}

/**
 * Cùng Book · Test (vd. 3 dòng "Test 1"):
 * 1) Nhiều part hơn thắng (7-part RW > 5-part Reading-only)
 * 2) Có nhãn Writing thắng
 * 3) Rank nguồn (catalog > local > sample) khi hoà
 */
export function preferLibraryExam<
  T extends {
    id: string
    title: string
    bandHint?: string
    parts?: unknown[]
  },
>(a: T, b: T): T {
  const pa = partCount(a)
  const pb = partCount(b)
  if (pb !== pa) return pb > pa ? b : a

  const aw = hasWritingLabel(a)
  const bw = hasWritingLabel(b)
  if (bw !== aw) return bw ? b : a

  const ra = examSourceRank(a.id)
  const rb = examSourceRank(b.id)
  if (rb !== ra) return rb > ra ? b : a

  // Ổn định: id lexicographic
  return a.id <= b.id ? a : b
}

function librarySlotKey(e: {
  id: string
  title: string
  cambridgeLevel?: string
  examType?: string
  bandHint?: string
}): string | null {
  const test = parseCambridgeTestNumber(e.title)
  if (test == null) return null
  const book = parseCambridgeBookNumber(e.title)
  const level =
    e.cambridgeLevel
    ?? e.examType
    ?? (e.bandHint?.match(/\b(A2|B1|B2|C1|C2)\b/i)?.[1]?.toLowerCase() ?? 'x')
  return `${level}|b${book}|t${test}`
}

/**
 * Dedupe Library Archives:
 * 1) Unique theo id
 * 2) Ẩn sample khi đã có catalog cùng level/type
 * 3) Cùng Book+Test → giữ 1 đề (ưu tiên nhiều part / Writing)
 *    → hết double "Test 1 · 5 parts" khi đã có "Test 1 · 7 parts"
 */
export function dedupeExamsForLibraryDisplay<
  T extends {
    id: string
    title: string
    cambridgeLevel?: string
    bandHint?: string
    examType?: string
    parts?: unknown[]
  },
>(exams: T[]): T[] {
  if (exams.length <= 1) return exams

  const catalogCoverage = new Set<string>()
  for (const e of exams) {
    if (!e.id.startsWith('catalog-')) continue
    if (e.cambridgeLevel) catalogCoverage.add(`lv:${e.cambridgeLevel}`)
    if (e.examType) catalogCoverage.add(`type:${e.examType}`)
  }

  const byId = new Map<string, T>()
  for (const e of exams) {
    if (isCambridgeSampleExamId(e.id)) {
      const coveredByLevel = e.cambridgeLevel != null && catalogCoverage.has(`lv:${e.cambridgeLevel}`)
      const coveredByType = e.examType != null && catalogCoverage.has(`type:${e.examType}`)
      if (coveredByLevel || coveredByType) continue
    }

    const prev = byId.get(e.id)
    byId.set(e.id, prev ? preferLibraryExam(prev, e) : e)
  }

  const bySlot = new Map<string, T>()
  const unslotted: T[] = []
  for (const e of byId.values()) {
    const key = librarySlotKey(e)
    if (!key) {
      unslotted.push(e)
      continue
    }
    const prev = bySlot.get(key)
    bySlot.set(key, prev ? preferLibraryExam(prev, e) : e)
  }

  return [...bySlot.values(), ...unslotted]
}

export function filterReadingExamsForDisplay<T extends { id: string }>(
  exams: T[],
  importsOnly: boolean,
): T[] {
  if (!importsOnly) return exams
  return exams.filter(e => isImportedReadingExamId(e.id))
}

export function filterListeningExamsForDisplay<T extends { id: string }>(
  exams: T[],
  importsOnly: boolean,
): T[] {
  if (!importsOnly) return exams
  return exams.filter(e => isUserImportedListeningExamId(e.id))
}
