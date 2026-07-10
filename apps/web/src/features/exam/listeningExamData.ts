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

export type ListeningNotePassageBlockType = 'static' | 'section' | 'gap' | 'example' | 'break'

/** IELTS note-completion: thứ tự đầy đủ của form (chữ tĩnh + ô trống). */
export interface ListeningNotePassageBlock {
  type: ListeningNotePassageBlockType
  /** static / section */
  text?: string
  /** gap — tham chiếu questions[].number */
  number?: number
  /** Gap nằm trên dòng riêng trong Word (soft line break) — không gom 1 dòng khi render form. */
  gapOnOwnLine?: boolean
}

export type ListeningNoteTableCellBlockType = 'static' | 'gap' | 'break'

/** Một ô trong bảng IELTS (table-completion). */
export interface ListeningNoteTableCellBlock {
  type: ListeningNoteTableCellBlockType
  text?: string
  number?: number
}

export interface ListeningNoteTableRow {
  cells: ListeningNoteTableCellBlock[][]
}

/** Bảng note-completion (vd. Cam20 P1 Restaurant recommendations). */
export interface ListeningNoteTable {
  headers: string[]
  rows: ListeningNoteTableRow[]
  /** Tiêu đề phụ trên bảng (vd. Talks for patients…) */
  title?: string
  /** Hướng dẫn riêng cho đoạn bảng này */
  instruction?: string
  /** Câu gap-fill thuộc bảng — bắt buộc khi Part có nhiều bảng (a4) */
  gapNumbers?: number[]
}

/** Một khối note-completion tách biệt trong Part (c1/c2 Part 3). */
export interface ListeningNotePassageSection {
  blocks: ListeningNotePassageBlock[]
  gapNumbers?: number[]
  instruction?: string
  title?: string
}

export type ListeningNotePassageLayout = 'list' | 'table' | 'form' | 'lecture'

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
  /** IELTS note-completion: dòng tĩnh ngay sau ô trống của câu */
  noteAfter?: string
  /** Khi có cả context + noteBefore: true = hiện tiêu đề mục trước dòng tĩnh */
  contextFirst?: boolean
  /** IELTS Part 2+: tiêu đề đoạn (vd. Questions 11 – 16) — gắn câu đầu nhóm */
  sectionRange?: string
  /** IELTS Part 2+: hướng dẫn đoạn (Choose TWO / Complete the table…) */
  sectionInstruction?: string
  /** IELTS Part 2+: tiêu đề nội dung (SPORTS WORLD, HINCHINGBROOKE PARK…) */
  sectionTitle?: string
  /** IELTS map labeling — hiện ảnh bản đồ + chọn chữ cái A–I */
  mapLabel?: boolean
  /** IELTS diagram labeling — ảnh sơ đồ + bank A–E + chọn chữ cái */
  diagramLabel?: boolean
  /** IELTS flow-chart matching — bước dọc + bank A–G (c6) */
  flowChart?: boolean
  /** Dòng kết thúc flow-chart (gắn câu đầu nhóm) */
  flowChartEnd?: string
}

/** Một bước trong flow-chart gap-fill (Cam16 T2 P3 — ONE WORD ONLY). */
export type ListeningFlowChartStep =
  | { type: 'static'; label?: string; text: string }
  | { type: 'gap'; label?: string; number: number }

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
  /** IELTS: toàn bộ form note-completion theo đúng thứ tự đề gốc */
  notePassage?: ListeningNotePassageBlock[]
  /** IELTS: list (mặc định) hoặc table — dùng noteTable khi table */
  notePassageLayout?: ListeningNotePassageLayout
  noteTable?: ListeningNoteTable
  /** Nhiều bảng trong cùng Part (bảng + MC + bảng — Giaodien/a4) */
  noteTables?: ListeningNoteTable[]
  /** Nhiều khối note tách biệt (c1/c2 Part 3) */
  notePassageSections?: ListeningNotePassageSection[]
  /** Flow-chart gap-fill — thứ tự bước + nhãn cột trái (Cam16 T2 P3) */
  flowChartSteps?: ListeningFlowChartStep[]
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
  // Sample + catalog; listAllListeningExams ẩn sample khi đã có catalog cùng examType
  ...CAMBRIDGE_LISTENING_SAMPLES,
  ...IELTS_LISTENING_SAMPLES,
  ...(CATALOG_LISTENING_EXAMS as ListeningExam[]),
]

export function getListeningExam(examId: string): ListeningExam | null {
  return LISTENING_EXAMS.find(exam => exam.id === examId) ?? null
}

export function getPartQuestions(part: ListeningPart): ListeningQuestion[] {
  return Array.isArray(part?.questions) ? part.questions : []
}

export function getListeningExamQuestions(exam: ListeningExam): ListeningQuestion[] {
  if (!Array.isArray(exam?.parts)) return []
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
  if (!answerId.trim()) return '—'

  if (/[/|]/.test(answerId)) {
    const letters = answerId.split(/[/|]/).map(s => s.trim().toUpperCase()).filter(Boolean)
    const parts = letters.map(id => {
      const option = question.options.find(o => o.id.toUpperCase() === id)
      return option ? `${option.id}. ${option.label}` : id
    })
    return parts.length > 1 ? parts.join(' hoặc ') : parts[0] ?? answerId
  }

  const option = question.options.find(o => o.id === answerId)
  if (option) return `${option.id}. ${option.label}`
  return answerId
}

export function listeningExamAudioKey(examId: string, suffix: string): string {
  return `listening-exam:${examId}:${suffix}`
}