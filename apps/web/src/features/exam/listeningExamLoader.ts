import { isCatalogListeningExamId } from '@ryan/catalog'
import type { ListeningExamRecord } from '@ryan/db'
import { listeningExamRepo } from '@ryan/db'
import type { ListeningExam, ListeningPart } from './listeningExamData'
import { getListeningExam, LISTENING_EXAMS } from './listeningExamData'
import { mergeCatalogListeningMedia } from './listeningExamCatalogMerge'

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
    exam = mergeCatalogListeningMedia(exam)
    return exam
  }

  if (!builtin) return null
  return mergeCatalogListeningMedia(builtin)
}

export async function listAllListeningExams(): Promise<ListeningExam[]> {
  const imported = (await listeningExamRepo.list()).map(recordToExam)
  const builtinIds = new Set(LISTENING_EXAMS.map(e => e.id))
  const localOnly = imported.filter(e => !builtinIds.has(e.id))
  return [...LISTENING_EXAMS, ...localOnly]
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