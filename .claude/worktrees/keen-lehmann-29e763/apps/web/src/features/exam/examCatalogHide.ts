/**
 * Admin ẩn/xóa đề catalog (builtin) khỏi Library cho mọi user trên máy này.
 * Catalog JSON vẫn nằm trong bundle deploy — hide = không list / resolve.
 * Cloud publish vẫn xóa riêng qua deletePublished*.
 */
import { settingsRepo } from '@ryan/db'

const HIDDEN_READING_KEY = 'hidden-catalog-reading-exam-ids'
const HIDDEN_LISTENING_KEY = 'hidden-catalog-listening-exam-ids'

async function readIdSet(key: string): Promise<Set<string>> {
  const raw = await settingsRepo.getSetting(key)
  if (!Array.isArray(raw)) return new Set()
  return new Set(raw.filter((x): x is string => typeof x === 'string' && x.length > 0))
}

async function writeIdSet(key: string, ids: Set<string>): Promise<void> {
  await settingsRepo.putSetting(key, [...ids].sort())
}

export async function listHiddenReadingCatalogIds(): Promise<string[]> {
  return [...(await readIdSet(HIDDEN_READING_KEY))]
}

export async function listHiddenListeningCatalogIds(): Promise<string[]> {
  return [...(await readIdSet(HIDDEN_LISTENING_KEY))]
}

export async function isReadingCatalogHidden(examId: string): Promise<boolean> {
  return (await readIdSet(HIDDEN_READING_KEY)).has(examId)
}

export async function isListeningCatalogHidden(examId: string): Promise<boolean> {
  return (await readIdSet(HIDDEN_LISTENING_KEY)).has(examId)
}

export async function hideReadingCatalogExam(examId: string): Promise<void> {
  const set = await readIdSet(HIDDEN_READING_KEY)
  set.add(examId)
  await writeIdSet(HIDDEN_READING_KEY, set)
}

export async function hideListeningCatalogExam(examId: string): Promise<void> {
  const set = await readIdSet(HIDDEN_LISTENING_KEY)
  set.add(examId)
  await writeIdSet(HIDDEN_LISTENING_KEY, set)
}

export async function unhideReadingCatalogExam(examId: string): Promise<void> {
  const set = await readIdSet(HIDDEN_READING_KEY)
  if (!set.delete(examId)) return
  await writeIdSet(HIDDEN_READING_KEY, set)
}

export async function unhideListeningCatalogExam(examId: string): Promise<void> {
  const set = await readIdSet(HIDDEN_LISTENING_KEY)
  if (!set.delete(examId)) return
  await writeIdSet(HIDDEN_LISTENING_KEY, set)
}

export function isCatalogStyleExamId(id: string): boolean {
  return (
    id.startsWith('catalog-')
    || id.startsWith('ielts-reading-')
    || id.startsWith('ielts-listening-')
    || (id.startsWith('cambridge-') && id.includes('-sample-'))
  )
}
