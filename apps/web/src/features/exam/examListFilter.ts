import { isImportedReadingExamId } from './importReadingManualUtils'

export const EXAM_IMPORTS_ONLY_STORAGE_KEY = 'ryan-exam-imports-only'

export function isUserImportedListeningExamId(id: string): boolean {
  return id.startsWith('listening-import-')
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