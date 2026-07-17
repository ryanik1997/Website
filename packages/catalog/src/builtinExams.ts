/**
 * Mode C — catalog list metadata only (no questions/answers in the JS bundle).
 * Full exam bodies live at catalog/exams/{listening|reading}/{id}.json
 * and are loaded via protectedMedia + content-sign after login/plan check.
 */
import catalogManifest from '../data/manifest.json'
import listeningMeta from '../data/catalog-listening-meta.json'
import readingMeta from '../data/catalog-reading-meta.json'

export type CatalogExamStub = {
  id: string
  title: string
  durationMinutes?: number
  bandHint?: string
  examType?: string
  examMode?: string
  examTrack?: string
  cambridgeLevel?: string
  bodyPath?: string
  bodyRemote?: boolean
  questionCount?: number
  parts?: unknown[]
}

/** Reading stubs for library list — hydrate body on open. */
export const CATALOG_READING_EXAMS = readingMeta as CatalogExamStub[]

/** Listening stubs for library list — hydrate body on open. */
export const CATALOG_LISTENING_EXAMS = listeningMeta as CatalogExamStub[]

export const CATALOG_EXAM_MANIFEST = catalogManifest

export const CATALOG_READING_EXAM_IDS = CATALOG_READING_EXAMS.map(e => e.id)
export const CATALOG_LISTENING_EXAM_IDS = CATALOG_LISTENING_EXAMS.map(e => e.id)

export function isCatalogReadingExamId(id: string): boolean {
  return id.startsWith('catalog-reading-')
}

export function isCatalogListeningExamId(id: string): boolean {
  return id.startsWith('catalog-listening-')
}

export function catalogExamBodyPath(exam: { id: string; bodyPath?: string }, skill: 'listening' | 'reading'): string {
  if (exam.bodyPath?.trim()) return exam.bodyPath.replace(/^\//, '')
  return `catalog/exams/${skill}/${exam.id}.json`
}
