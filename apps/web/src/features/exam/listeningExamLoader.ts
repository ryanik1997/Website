import { isCatalogListeningExamId } from '@ryan/catalog'
import type { ListeningExamRecord } from '@ryan/db'
import { listeningExamRepo } from '@ryan/db'
import type { ListeningExam, ListeningPart } from './listeningExamData'
import { getListeningExam, LISTENING_EXAMS } from './listeningExamData'
import { dedupeExamsForLibraryDisplay } from './examListFilter'
import { mergeCatalogListeningMedia } from './listeningExamCatalogMerge'
import { getPublishedListeningExam, listPublishedListeningExams } from './listeningExamPublish'
import { normalizeListeningExamForDisplay } from './listeningImportNormalize'

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

export function getBuiltinListeningExam(examId: string): ListeningExam | null {
  return getListeningExam(examId)
}

export async function resolveListeningExam(examId: string): Promise<ListeningExam | null> {
  const builtin = getBuiltinListeningExam(examId)

  // Đề catalog builtin: luôn lấy JSON trong bundle (tránh bản Dexie cũ ghi đè notePassage/bullets).
  if (builtin && isCatalogListeningExamId(examId)) {
    return mergeCatalogListeningMedia(builtin)
  }

  const local = await listeningExamRepo.get(examId)
  if (local) {
    let exam = recordToExam(local)
    exam = normalizeListeningExamForDisplay(exam)
    exam = mergeCatalogListeningMedia(exam)
    return exam
  }

  try {
    const published = await getPublishedListeningExam(examId)
    if (published) {
      let exam = normalizeListeningExamForDisplay(published)
      exam = mergeCatalogListeningMedia(exam)
      return exam
    }
  } catch (err) {
    console.warn('Không tải được đề Listening published:', err)
  }

  if (!builtin) return null
  return mergeCatalogListeningMedia(builtin)
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
  return dedupeExamsForLibraryDisplay(
    [...LISTENING_EXAMS, ...publishedOnly, ...localOnly].map(safeListExam),
  )
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