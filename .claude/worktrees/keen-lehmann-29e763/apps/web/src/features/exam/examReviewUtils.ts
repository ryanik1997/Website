import type { CSSProperties } from 'react'
import type { ReadingExam, ReadingQuestion } from './examData'
import { getExamQuestions, isReadingAnswerCorrect, isWritingTaskQuestion } from './examData'
import type { ListeningExam, ListeningQuestion } from './listeningExamData'
import { getListeningExamQuestions, isListeningAnswerCorrect } from './listeningExamData'

export type ExamReviewStatus = 'correct' | 'wrong' | 'skipped'

export function examReviewStatus(
  userAnswer: string | undefined,
  isCorrect: (answer: string) => boolean,
): ExamReviewStatus {
  const raw = userAnswer ?? ''
  if (!raw.trim()) return 'skipped'
  return isCorrect(raw) ? 'correct' : 'wrong'
}

/** Màu pill / badge review — inline style để không bị CSS khác đè. */
export const EXAM_REVIEW_COLORS: Record<ExamReviewStatus, { bg: string; fg: string; border: string }> = {
  correct: { bg: '#22c55e', fg: '#ffffff', border: '#16a34a' },
  wrong: { bg: '#ef4444', fg: '#ffffff', border: '#dc2626' },
  skipped: { bg: '#f1c40f', fg: '#5a4500', border: '#d4ac0d' },
}

export function examReviewPillStyle(
  status: ExamReviewStatus | null | undefined,
  isCurrent?: boolean,
): CSSProperties | undefined {
  if (!status) return undefined
  const c = EXAM_REVIEW_COLORS[status]
  return {
    background: c.bg,
    color: c.fg,
    borderColor: c.border,
    boxShadow: isCurrent ? `0 0 0 2px ${c.border}` : undefined,
    fontWeight: 800,
  }
}

export function readingQuestionReviewStatus(
  question: ReadingQuestion,
  userAnswer: string | undefined,
): ExamReviewStatus {
  if (isWritingTaskQuestion(question)) {
    return (userAnswer ?? '').trim() ? 'correct' : 'skipped'
  }
  return examReviewStatus(userAnswer, a => isReadingAnswerCorrect(question, a))
}

export function buildReadingReviewStatusMap(
  exam: ReadingExam,
  answers: Record<string, string>,
): Record<string, ExamReviewStatus> {
  const map: Record<string, ExamReviewStatus> = {}
  for (const q of getExamQuestions(exam)) {
    map[q.id] = readingQuestionReviewStatus(q, answers[q.id])
  }
  return map
}

export function listeningQuestionReviewStatus(
  question: ListeningQuestion,
  userAnswer: string | undefined,
): ExamReviewStatus {
  return examReviewStatus(userAnswer, a => isListeningAnswerCorrect(question, a))
}

export function buildListeningReviewStatusMap(
  exam: ListeningExam,
  answers: Record<string, string>,
): Record<string, ExamReviewStatus> {
  const map: Record<string, ExamReviewStatus> = {}
  for (const q of getListeningExamQuestions(exam)) {
    map[q.id] = listeningQuestionReviewStatus(q, answers[q.id])
  }
  return map
}
