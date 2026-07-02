import type { ReadingExam } from './examData'
import type { ListeningExam, ListeningExamType } from './listeningExamData'

const LISTENING_TYPE_TO_CAMBRIDGE_LEVEL: Partial<Record<ListeningExamType, string>> = {
  ket: 'a2',
  pet: 'b1',
  fce: 'b2',
  cae: 'c1',
  cpe: 'c2',
}

export function readingExamBackPath(exam: ReadingExam): string {
  if (exam.examTrack === 'cambridge' && exam.cambridgeLevel) {
    return `/app/exam/track/cambridge/${exam.cambridgeLevel}`
  }
  if (exam.examTrack === 'ielts') {
    return '/app/exam/track/ielts'
  }
  return '/app/exam'
}

export function listeningExamBackPath(exam: ListeningExam): string {
  const level = LISTENING_TYPE_TO_CAMBRIDGE_LEVEL[exam.examType]
  if (level) {
    return `/app/exam/track/cambridge/${level}`
  }
  if (exam.examType === 'ielts') {
    return '/app/exam/track/ielts'
  }
  return '/app/exam'
}