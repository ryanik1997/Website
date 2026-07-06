import type { ReadingExam } from './examData'

/** Thời gian làm bài Reading only KET (legacy 5 parts) */
export const KET_READING_DURATION_MINUTES = 30

/** Reading & Writing KET A2 (7 parts) — 60 phút */
export const KET_READING_WRITING_DURATION_MINUTES = 60

/** Reading & Writing PET B1 (8 parts) — 45 phút */
export const PET_READING_WRITING_DURATION_MINUTES = 45

export function isKetReadingWritingPaper(exam: ReadingExam): boolean {
  return exam.cambridgeLevel === 'a2'
    && exam.parts.some(p => p.partNumber >= 6)
}

export function isPetReadingWritingPaper(exam: ReadingExam): boolean {
  return exam.cambridgeLevel === 'b1'
}

export function readingExamDurationMinutes(exam: ReadingExam): number {
  if (isKetReadingWritingPaper(exam)) return KET_READING_WRITING_DURATION_MINUTES
  if (isPetReadingWritingPaper(exam)) return PET_READING_WRITING_DURATION_MINUTES
  if (exam.cambridgeLevel === 'a2') return KET_READING_DURATION_MINUTES
  return exam.durationMinutes
}