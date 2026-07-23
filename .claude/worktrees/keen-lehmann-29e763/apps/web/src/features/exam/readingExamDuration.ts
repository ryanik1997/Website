import type { ReadingExam } from './examData'

/** Thời gian làm bài Reading only KET (legacy 5 parts) */
export const KET_READING_DURATION_MINUTES = 30

/** Reading & Writing KET A2 (7 parts) — 60 phút */
export const KET_READING_WRITING_DURATION_MINUTES = 60

/** Reading & Writing PET B1 (8 parts) — 45 phút */
export const PET_READING_WRITING_DURATION_MINUTES = 45

/** Reading & Writing FCE B2 (9 parts) — 80 phút */
export const FCE_READING_WRITING_DURATION_MINUTES = 80

/** Reading & Writing CAE C1 (8 parts Reading) — 90 phút */
export const CAE_READING_DURATION_MINUTES = 90

/** Reading & Writing CAE C1 (9 parts gồm Writing) — 120 phút */
export const CAE_READING_WRITING_DURATION_MINUTES = 120

/** Reading & Writing CPE C2 (7 parts Reading) — 90 phút */
export const CPE_READING_DURATION_MINUTES = 90

/** Reading & Writing CPE C2 (9 parts gồm Writing) — 120 phút */
export const CPE_READING_WRITING_DURATION_MINUTES = 120

export function isKetReadingWritingPaper(exam: ReadingExam): boolean {
  return exam.cambridgeLevel === 'a2'
    && exam.parts.some(p => p.partNumber >= 6)
}

export function isPetReadingWritingPaper(exam: ReadingExam): boolean {
  return exam.cambridgeLevel === 'b1'
}

export function isFceReadingWritingPaper(exam: ReadingExam): boolean {
  return exam.cambridgeLevel === 'b2'
}

export function isCaeReadingWritingPaper(exam: ReadingExam): boolean {
  return exam.cambridgeLevel === 'c1'
}

export function isCpeReadingWritingPaper(exam: ReadingExam): boolean {
  return exam.cambridgeLevel === 'c2'
}

export function hasCaeWritingPart(exam: ReadingExam): boolean {
  return exam.parts.some(p => p.partNumber === 9 || p.partNumber === 10)
}

export function hasCpeWritingPart(exam: ReadingExam): boolean {
  return exam.parts.some(p => p.partNumber === 8 || p.partNumber === 9)
}

export function readingExamDurationMinutes(exam: ReadingExam): number {
  if (isKetReadingWritingPaper(exam)) return KET_READING_WRITING_DURATION_MINUTES
  if (isPetReadingWritingPaper(exam)) return PET_READING_WRITING_DURATION_MINUTES
  if (isFceReadingWritingPaper(exam)) return FCE_READING_WRITING_DURATION_MINUTES
  if (isCaeReadingWritingPaper(exam)) {
    return hasCaeWritingPart(exam)
      ? CAE_READING_WRITING_DURATION_MINUTES
      : CAE_READING_DURATION_MINUTES
  }
  if (isCpeReadingWritingPaper(exam)) {
    return hasCpeWritingPart(exam)
      ? CPE_READING_WRITING_DURATION_MINUTES
      : CPE_READING_DURATION_MINUTES
  }
  if (exam.cambridgeLevel === 'a2') return KET_READING_DURATION_MINUTES
  return exam.durationMinutes
}