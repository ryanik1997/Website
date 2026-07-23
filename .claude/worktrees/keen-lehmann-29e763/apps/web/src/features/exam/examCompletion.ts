import {
  getExamQuestions,
  isReadingAnswerCorrect,
  type ReadingExam,
} from './examData'
import {
  getListeningExamQuestions,
  isListeningAnswerCorrect,
  type ListeningExam,
} from './listeningExamData'
import { clearExamDraftStorage } from './examRetry'
import { notifyExamDraftRevision } from './useExamDraftRevision'

export const READING_DRAFT_PREFIX = 'exam-reading-draft:'
export const LISTENING_DRAFT_PREFIX = 'exam-listening-draft:'

export interface ExamDraftCompletion {
  submitted: boolean
  correct: number
  total: number
}

interface ReadingDraftPayload {
  answers?: Record<string, string>
  submitted?: boolean
}

interface ListeningDraftPayload {
  answers?: Record<string, string>
  submitted?: boolean
}

function parseDraft<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function readReadingDraftCompletion(exam: ReadingExam): ExamDraftCompletion | null {
  try {
    const draft = parseDraft<ReadingDraftPayload>(
      window.localStorage.getItem(`${READING_DRAFT_PREFIX}${exam.id}`),
    )
    if (!draft?.submitted) return null

    const questions = getExamQuestions(exam)
    const answers = draft.answers ?? {}
    const correct = questions.filter(q => {
      try {
        return isReadingAnswerCorrect(q, answers[q.id] ?? '')
      } catch {
        return false
      }
    }).length

    return { submitted: true, correct, total: questions.length }
  } catch (err) {
    console.warn('[readReadingDraftCompletion]', exam.id, err)
    return null
  }
}

export function readListeningDraftCompletion(exam: ListeningExam): ExamDraftCompletion | null {
  try {
    const draft = parseDraft<ListeningDraftPayload>(
      window.localStorage.getItem(`${LISTENING_DRAFT_PREFIX}${exam.id}`),
    )
    if (!draft?.submitted) return null

    const questions = getListeningExamQuestions(exam)
    const answers = draft.answers ?? {}
    const correct = questions.filter(q => {
      try {
        return isListeningAnswerCorrect(q, answers[q.id] ?? '')
      } catch {
        return false
      }
    }).length

    return { submitted: true, correct, total: questions.length }
  } catch (err) {
    console.warn('[readListeningDraftCompletion]', exam.id, err)
    return null
  }
}

export function clearReadingDraft(examId: string): void {
  clearExamDraftStorage(`${READING_DRAFT_PREFIX}${examId}`)
  notifyExamDraftRevision()
}

export function clearListeningDraft(examId: string): void {
  clearExamDraftStorage(`${LISTENING_DRAFT_PREFIX}${examId}`)
  notifyExamDraftRevision()
}

/** Chèn số câu trước mỗi chỗ trống … trong đoạn hướng dẫn KET Part 2 */
export function injectKetGapFillQuestionMarkers(
  instruction: string,
  questions: { number: number }[],
): string {
  let gapIndex = 0
  return instruction.replace(/…/g, () => {
    const question = questions[gapIndex]
    gapIndex += 1
    if (!question) return '…'
    return `(${question.number}) …`
  })
}