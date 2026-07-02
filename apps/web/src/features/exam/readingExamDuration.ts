import type { ReadingExam } from './examData'

/** Thời gian làm bài Reading KET / Cambridge A2 Key */
export const KET_READING_DURATION_MINUTES = 30

export function readingExamDurationMinutes(exam: ReadingExam): number {
  if (exam.cambridgeLevel === 'a2') return KET_READING_DURATION_MINUTES
  return exam.durationMinutes
}