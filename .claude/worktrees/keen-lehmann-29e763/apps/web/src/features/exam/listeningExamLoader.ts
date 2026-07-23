import { isCatalogListeningExamId } from '@ryan/catalog'
import type { ListeningExamRecord } from '@ryan/db'
import { audioRepo, listeningExamRepo } from '@ryan/db'
import type { ListeningExam, ListeningPart } from './listeningExamData'
import { getListeningExam, LISTENING_EXAMS } from './listeningExamData'
import { dedupeExamsForLibraryDisplay } from './examListFilter'
import { mergeCatalogListeningMedia } from './listeningExamCatalogMerge'
import { preferLocalListeningMedia } from './listeningLocalMediaPolicy'
import { getPublishedListeningExam, listPublishedListeningExams } from './listeningExamPublish'
import { normalizeListeningExamForDisplay } from './listeningImportNormalize'
import { isListeningCatalogHidden, listHiddenListeningCatalogIds } from './examCatalogHide'

/** Merge catalog (bổ sung thiếu) rồi luôn ưu tiên blob local — sửa đề import cũ. */
function finalizeListeningExam(exam: ListeningExam): ListeningExam {
  return preferLocalListeningMedia(mergeCatalogListeningMedia(exam))
}

function recordToExam(record: ListeningExamRecord): ListeningExam {
  return {
    id: record.id,
    title: record.title,
    durationMinutes: record.durationMinutes,
    bandHint: record.bandHint,
    examType: record.examType,
    examMode: record.examMode,
    parts: record.parts as ListeningPart[],
  }
}

function examHasAnyAudio(exam: ListeningExam): boolean {
  return exam.parts.some(part =>
    Boolean(part.audioKey || part.audioUrl || part.questions.some(q => q.audioKey || q.audioUrl)),
  )
}

async function rehydrateImportedExamAudio(exam: ListeningExam): Promise<ListeningExam> {
  if (examHasAnyAudio(exam)) return exam

  const prefix = `listening-exam:${exam.id}:`
  const keys = await audioRepo.listKeysByPrefix(prefix)
  if (!keys.length) {
    console.warn('[listening loader] local exam missing audio refs and no Dexie blobs found', {
      examId: exam.id,
      title: exam.title,
    })
    return exam
  }

  const sharedKey =
    keys.find(key => key.endsWith(':shared-listening'))
    ?? keys.find(key => key.includes(':part-'))
    ?? keys[0]
  if (!sharedKey) return exam

  console.warn('[listening loader] local exam missing audioKey but Dexie blobs exist; rehydrating from blob store', {
    examId: exam.id,
    title: exam.title,
    blobKeys: keys,
    chosenKey: sharedKey,
  })

  return {
    ...exam,
    parts: exam.parts.map(part => ({
      ...part,
      audioKey: part.audioKey ?? sharedKey,
    })),
  }
}

export function getBuiltinListeningExam(examId: string): ListeningExam | null {
  return getListeningExam(examId)
}

export async function resolveListeningExam(examId: string): Promise<ListeningExam | null> {
  if (await isListeningCatalogHidden(examId)) return null

  const builtin = getBuiltinListeningExam(examId)

  // Đề catalog builtin: luôn lấy JSON trong bundle (tránh bản Dexie cũ ghi đè notePassage/bullets).
  if (builtin && isCatalogListeningExamId(examId)) {
    return finalizeListeningExam(builtin)
  }

  const local = await listeningExamRepo.get(examId)
  if (local) {
    let exam = recordToExam(local)
    exam = normalizeListeningExamForDisplay(exam)
    exam = await rehydrateImportedExamAudio(exam)
    return finalizeListeningExam(exam)
  }

  try {
    const published = await getPublishedListeningExam(examId)
    if (published) {
      let exam = normalizeListeningExamForDisplay(published)
      return finalizeListeningExam(exam)
    }
  } catch (err) {
    console.warn('Không tải được đề Listening published:', err)
  }

  if (!builtin) return null
  return finalizeListeningExam(builtin)
}

function safeListExam(exam: ListeningExam): ListeningExam {
  try {
    return normalizeListeningExamForDisplay({
      ...exam,
      examType: exam.examType ?? 'ielts',
      examMode: exam.examMode ?? 'practice',
      parts: Array.isArray(exam.parts) ? exam.parts : [],
    })
  } catch (err) {
    console.warn('[listAllListeningExams] normalize failed', exam.id, err)
    return {
      ...exam,
      examType: exam.examType ?? 'ielts',
      examMode: exam.examMode ?? 'practice',
      parts: Array.isArray(exam.parts) ? exam.parts : [],
    }
  }
}

export async function listAllListeningExams(): Promise<ListeningExam[]> {
  const imported = (await listeningExamRepo.list()).map(recordToExam)
  const builtinIds = new Set(LISTENING_EXAMS.map(e => e.id))

  let published: ListeningExam[] = []
  try {
    published = await listPublishedListeningExams()
  } catch (err) {
    console.warn('Không tải danh sách đề Listening published:', err)
  }

  const publishedIds = new Set(published.map(e => e.id))
  const publishedOnly = published.filter(e => !builtinIds.has(e.id))
  const localOnly = imported.filter(e => !builtinIds.has(e.id) && !publishedIds.has(e.id))
  const hidden = new Set(await listHiddenListeningCatalogIds())
  return dedupeExamsForLibraryDisplay(
    [...LISTENING_EXAMS, ...publishedOnly, ...localOnly].map(safeListExam),
  ).filter(e => !hidden.has(e.id))
}

export function examRecordFromListening(
  exam: ListeningExam,
  source: 'import' | 'manual',
  sourceFilename?: string,
): Omit<ListeningExamRecord, 'createdAt' | 'updatedAt'> {
  return {
    id: exam.id,
    title: exam.title,
    durationMinutes: exam.durationMinutes,
    bandHint: exam.bandHint,
    examType: exam.examType,
    examMode: exam.examMode,
    parts: exam.parts as unknown[],
    source,
    sourceFilename,
  }
}
