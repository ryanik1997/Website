import { CAMBRIDGE_LISTENING_SAMPLES } from './cambridgeListeningSamples'
import { IELTS_LISTENING_SAMPLES } from './ieltsListeningSamples'

export type ListeningExamMode = 'practice' | 'exam'
export type ListeningExamType = 'ket' | 'ielts' | 'pet' | 'fce' | 'cae' | 'cpe'

const CAMBRIDGE_LISTENING_TYPES = new Set<ListeningExamType>(['pet', 'fce', 'cae', 'cpe'])

export function isKetStyleListening(examType: ListeningExamType): boolean {
  return examType === 'ket'
}

export function isMultiPartListening(examType: ListeningExamType): boolean {
  return examType === 'ielts' || CAMBRIDGE_LISTENING_TYPES.has(examType)
}

export type ListeningQuestionType =
  | 'picture-mc'
  | 'multiple-choice'
  | 'gap-fill'
  | 'matching'

export interface ListeningQuestionOption {
  id: string
  label: string
  imageUrl?: string
  imageKey?: string
}

export interface ListeningQuestion {
  id: string
  number: number
  type: ListeningQuestionType
  prompt: string
  options: ListeningQuestionOption[]
  answer: string
  explanation: string
  audioKey?: string
  audioUrl?: string
  ttsText?: string
  wordLimit?: number
}

export interface ListeningPart {
  id: string
  partNumber: number
  rangeLabel: string
  instruction?: string
  /** Audio cả Part (IELTS) */
  audioKey?: string
  audioUrl?: string
  ttsText?: string
  /** Giới hạn số lần nghe khi examMode = exam */
  maxPlays?: number
  questions: ListeningQuestion[]
}

export interface ListeningExam {
  id: string
  title: string
  durationMinutes: number
  bandHint: string
  examType: ListeningExamType
  examMode: ListeningExamMode
  parts: ListeningPart[]
}

function normalizeListeningAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, ' ')
}

export const LISTENING_EXAMS: ListeningExam[] = [
  ...CAMBRIDGE_LISTENING_SAMPLES,
  ...IELTS_LISTENING_SAMPLES,
]

export function getListeningExam(examId: string): ListeningExam | null {
  return LISTENING_EXAMS.find(exam => exam.id === examId) ?? null
}

export function getPartQuestions(part: ListeningPart): ListeningQuestion[] {
  return part.questions
}

export function getListeningExamQuestions(exam: ListeningExam): ListeningQuestion[] {
  return exam.parts.flatMap(getPartQuestions)
}

export function isListeningAnswerCorrect(question: ListeningQuestion, userAnswer: string): boolean {
  if (!userAnswer.trim()) return false

  if (question.type === 'gap-fill') {
    const expected = normalizeListeningAnswer(question.answer)
    const given = normalizeListeningAnswer(userAnswer)
    if (given === expected) return true
    return given.split(/\s+/).length <= (question.wordLimit ?? 3)
      && (given === expected || given.includes(expected) || expected.includes(given))
  }

  return userAnswer.trim().toUpperCase() === question.answer.trim().toUpperCase()
}

export function formatListeningAnswer(
  question: ListeningQuestion,
  answerId: string,
): string {
  if (!answerId) return '—'
  const option = question.options.find(o => o.id === answerId)
  if (option) return `${option.id}. ${option.label}`
  return answerId
}

export function listeningExamAudioKey(examId: string, suffix: string): string {
  return `listening-exam:${examId}:${suffix}`
}