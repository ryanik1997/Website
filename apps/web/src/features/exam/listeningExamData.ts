import { CATALOG_LISTENING_EXAMS } from '@ryan/catalog'
import { CAMBRIDGE_LISTENING_SAMPLES } from './cambridgeListeningSamples'
import { IELTS_LISTENING_SAMPLES } from './ieltsListeningSamples'

export type ListeningExamMode = 'practice' | 'exam'
export type ListeningExamType = 'ket' | 'ielts' | 'pet' | 'fce' | 'cae' | 'cpe'

const CAMBRIDGE_LISTENING_TYPES = new Set<ListeningExamType>(['pet', 'fce', 'cae', 'cpe'])

export function isKetStyleListening(examType: ListeningExamType): boolean {
  return examType === 'ket'
}

export function isPetStyleListening(examType: ListeningExamType): boolean {
  return examType === 'pet'
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
  /** Part 1 picture-mc: một ảnh lớn chứa A+B+C (ưu tiên hơn ảnh từng option) */
  pictureImageKey?: string
  pictureImageUrl?: string
  audioKey?: string
  audioUrl?: string
  ttsText?: string
  wordLimit?: number
  /** PET Part 2: "You will hear two friends talking about…" */
  context?: string
  /** PET Part 3: câu gap-fill — phần trước ô trống */
  gapLead?: string
  /** PET Part 3: câu gap-fill — phần sau ô trống */
  gapTrail?: string
  /** IELTS note-completion: dòng tĩnh ngay trước câu (không có ô trống) */
  noteBefore?: string
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
  /** PET Part 3 / FCE Part 2: tiêu đề đoạn (vd. Spectacled Bears) */
  passageTitle?: string
  /** FCE Part 2: ảnh minh họa cạnh tiêu đề (một ảnh cho cả Part) */
  partImageUrl?: string
  partImageKey?: string
  /** PET Part 3/4: mô tả đoạn nghe trước câu hỏi */
  audioIntro?: string
  /** CAE Part 4: hai task matching song song (Task One + Task Two) */
  matchingDualTask?: boolean
  taskOneInstruction?: string
  taskTwoInstruction?: string
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
  ...(CATALOG_LISTENING_EXAMS as ListeningExam[]),
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
    const given = normalizeListeningAnswer(userAnswer)
    const expectedRaw = question.answer.trim()
    const variants = /[/|]/.test(expectedRaw)
      ? expectedRaw.split(/[/|]/).map(s => normalizeListeningAnswer(s)).filter(Boolean)
      : [normalizeListeningAnswer(expectedRaw)]

    return variants.some(expected => {
      if (given === expected) return true
      return given.split(/\s+/).length <= (question.wordLimit ?? 3)
        && (given.includes(expected) || expected.includes(given))
    })
  }

  const given = userAnswer.trim().toUpperCase()
  const expectedRaw = question.answer.trim()
  if (/[/|]/.test(expectedRaw)) {
    const variants = expectedRaw.split(/[/|]/).map(s => s.trim().toUpperCase()).filter(Boolean)
    return variants.includes(given)
  }
  return given === expectedRaw.toUpperCase()
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