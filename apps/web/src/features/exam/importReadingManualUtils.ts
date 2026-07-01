import { audioRepo } from '@ryan/db'
import type {
  ReadingExam,
  ReadingExamTrack,
  ReadingPart,
  ReadingPassageBlock,
  ReadingQuestion,
  ReadingQuestionGroup,
  ReadingQuestionType,
} from './examData'
import type { CambridgeLevelSlug } from './cambridgeExamLevels'
import {
  cambridgeReadingImportTemplate,
  cambridgeReadingPartGuides,
} from './cambridgeReadingImportTemplates'

export const READING_IMPORT_MAX_JSON_BYTES = 2 * 1024 * 1024
export const READING_IMPORT_MAX_MEDIA_BYTES = 40 * 1024 * 1024

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif)$/i

const VALID_QUESTION_TYPES: ReadingQuestionType[] = [
  'true-false-not-given',
  'multiple-choice',
  'matching-paragraph',
  'matching-features',
  'gap-fill',
  'summary-completion',
  'sentence-completion',
]

const VALID_GROUP_TYPES: ReadingQuestionGroup['type'][] = [
  'tfng',
  'matching-paragraph',
  'matching-features',
  'multiple-choice',
  'gap-fill',
  'summary-completion',
  'sentence-completion',
]

export interface ReadingImportPassageBlockJson {
  label?: string
  text?: string
  imageFile?: string
}

export interface ReadingImportQuestionJson {
  number: number
  type: ReadingQuestionType
  prompt: string
  options?: Array<{ id: string; label: string }>
  answer: string
  explanation?: string
}

export interface ReadingImportQuestionGroupJson {
  range: string
  instruction: string
  note?: string
  type: ReadingQuestionGroup['type']
  paragraphLetters?: string[]
  features?: Array<{ id: string; name: string }>
  wordBank?: Array<{ id: string; label: string }>
  questions: ReadingImportQuestionJson[]
}

export interface ReadingImportPartJson {
  partNumber: number
  rangeLabel: string
  passageTitle: string
  passageSubtitle?: string
  passage: ReadingImportPassageBlockJson[]
  questionGroups: ReadingImportQuestionGroupJson[]
}

export interface ReadingImportPayload {
  version: 1
  title: string
  durationMinutes: number
  bandHint?: string
  examTrack?: ReadingExamTrack
  cambridgeLevel?: CambridgeLevelSlug
  parts: ReadingImportPartJson[]
}

function normalizeFileKey(name: string): string {
  return name.trim().toLowerCase().replace(/\\/g, '/').split('/').pop() ?? name
}

function buildMediaMap(files: File[]): Map<string, File> {
  const map = new Map<string, File>()
  for (const file of files) {
    map.set(normalizeFileKey(file.name), file)
  }
  return map
}

function resolveMediaFile(map: Map<string, File>, filename?: string): File | null {
  if (!filename) return null
  return map.get(normalizeFileKey(filename)) ?? null
}

export function readingExamMediaKey(examId: string, suffix: string): string {
  return `reading-exam:${examId}:${suffix}`
}

function normalizeImportPart(raw: Record<string, unknown>): ReadingImportPartJson {
  const partNumber = Number(raw.partNumber) || 1
  const rawTitle = String(raw.passageTitle ?? raw.title ?? `Part ${partNumber}`).trim()
  const rangeFromTitle = rawTitle.match(/questions?\s*(\d+)\s*[-–—]\s*(\d+)/i)
  const rangeLabel = typeof raw.rangeLabel === 'string' && raw.rangeLabel.trim()
    ? raw.rangeLabel.trim()
    : rangeFromTitle
      ? `Questions ${rangeFromTitle[1]}–${rangeFromTitle[2]}`
      : rawTitle
  const passageTitle = rawTitle.replace(/^part\s*\d+\s*[—\-–]\s*questions?\s*\d+\s*[-–—]\s*\d+\s*/i, '').trim()
    || rawTitle

  const partInstructions = typeof raw.instructions === 'string' ? raw.instructions.trim() : ''
  const rawGroups = Array.isArray(raw.questionGroups) ? raw.questionGroups : []

  const questionGroups: ReadingImportQuestionGroupJson[] = rawGroups.map(group => {
    const g = group as Record<string, unknown>
    const groupType = (g.type as ReadingImportQuestionGroupJson['type']) ?? 'multiple-choice'
    const questionsRaw = Array.isArray(g.questions) ? g.questions : []
    const questions: ReadingImportQuestionJson[] = questionsRaw.map(q => {
      const item = q as Record<string, unknown>
      const number = Number(item.number) || 0
      const qType = (item.type as ReadingImportQuestionJson['type'])
        ?? (groupType === 'gap-fill' || groupType === 'summary-completion' ? 'gap-fill' : 'multiple-choice')
      const prompt = typeof item.prompt === 'string' ? item.prompt.trim() : ''
      return {
        number,
        type: qType,
        prompt: prompt || (qType === 'gap-fill' ? `Gap (${number})` : `Question ${number}`),
        options: Array.isArray(item.options) ? item.options as ReadingImportQuestionJson['options'] : undefined,
        answer: String(item.answer ?? '').trim(),
        explanation: typeof item.explanation === 'string' ? item.explanation : undefined,
      }
    })

    return {
      range: typeof g.range === 'string' && g.range.trim() ? g.range.trim() : rangeLabel,
      instruction: typeof g.instruction === 'string' && g.instruction.trim()
        ? g.instruction.trim()
        : partInstructions || 'Choose the correct answer.',
      note: typeof g.note === 'string' ? g.note : undefined,
      type: groupType,
      paragraphLetters: g.paragraphLetters as ReadingImportQuestionGroupJson['paragraphLetters'],
      features: g.features as ReadingImportQuestionGroupJson['features'],
      wordBank: g.wordBank as ReadingImportQuestionGroupJson['wordBank'],
      questions,
    }
  })

  return {
    partNumber,
    rangeLabel,
    passageTitle,
    passageSubtitle: typeof raw.passageSubtitle === 'string' ? raw.passageSubtitle : undefined,
    passage: Array.isArray(raw.passage) ? raw.passage as ReadingImportPassageBlockJson[] : [],
    questionGroups,
  }
}

/** Chuẩn hóa JSON từ Claude / tool ngoài (title→passageTitle, thêm type câu hỏi…). */
export function normalizeReadingImportPayload(payload: ReadingImportPayload): ReadingImportPayload {
  return {
    ...payload,
    parts: (payload.parts as unknown as Record<string, unknown>[]).map(normalizeImportPart),
  }
}

export function parseReadingImportJson(text: string): ReadingImportPayload {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('File JSON không hợp lệ.')
  }

  if (!raw || typeof raw !== 'object') {
    throw new Error('JSON phải là object.')
  }

  const obj = raw as Record<string, unknown>
  if (obj.version !== 1) {
    throw new Error('Chỉ hỗ trợ version 1.')
  }
  if (typeof obj.title !== 'string' || !obj.title.trim()) {
    throw new Error('Thiếu title.')
  }
  if (!Array.isArray(obj.parts) || obj.parts.length === 0) {
    throw new Error('parts phải là mảng có ít nhất 1 phần.')
  }

  const examTrack = obj.examTrack === 'cambridge' ? 'cambridge' : obj.examTrack === 'ielts' ? 'ielts' : undefined
  const validLevels: CambridgeLevelSlug[] = ['a2', 'b1', 'b2', 'c1', 'c2']
  const cambridgeLevel = typeof obj.cambridgeLevel === 'string' && validLevels.includes(obj.cambridgeLevel as CambridgeLevelSlug)
    ? obj.cambridgeLevel as CambridgeLevelSlug
    : undefined

  return normalizeReadingImportPayload({
    version: 1,
    title: obj.title.trim(),
    durationMinutes: typeof obj.durationMinutes === 'number' ? obj.durationMinutes : 60,
    bandHint: typeof obj.bandHint === 'string' ? obj.bandHint : undefined,
    examTrack,
    cambridgeLevel,
    parts: obj.parts as ReadingImportPartJson[],
  })
}

export function validateReadingManualImport(payload: ReadingImportPayload): string[] {
  const warnings: string[] = []
  let totalQuestions = 0

  const levelGuides = payload.cambridgeLevel
    ? cambridgeReadingPartGuides(payload.cambridgeLevel)
    : []

  for (const part of payload.parts) {
    if (!part.passageTitle?.trim()) {
      warnings.push(`Part ${part.partNumber}: thiếu passageTitle.`)
    }
    if (!part.questionGroups?.length) {
      warnings.push(`Part ${part.partNumber}: không có questionGroups.`)
      continue
    }

    const hasPassageContent = (part.passage ?? []).some(
      block => block.text?.trim() || block.imageFile?.trim(),
    )
    if (!hasPassageContent) {
      warnings.push(`Part ${part.partNumber}: passage trống — thêm text hoặc imageFile.`)
    }

    const guide = levelGuides.find(g => g.partNumber === part.partNumber)
    if (guide?.groupType === 'multiple-choice' && part.questionGroups.some(g => g.type === 'gap-fill')) {
      warnings.push(
        `Part ${part.partNumber}: đề gốc là multiple-choice (${guide.title}) — không dùng gap-fill tự gõ.`,
      )
    }
    if (guide?.wordChoiceMc) {
      const bad = part.questionGroups.flatMap(g => g.questions).filter(
        q => q.type === 'gap-fill' || (q.type === 'multiple-choice' && (!q.options || q.options.length < 2)),
      )
      if (bad.length > 0) {
        warnings.push(
          `Part ${part.partNumber}: mỗi câu cần đủ options MC (chọn từ) — không dùng gap-fill tự gõ.`,
        )
      }
    }

    for (const group of part.questionGroups) {
      if (!VALID_GROUP_TYPES.includes(group.type)) {
        warnings.push(`Part ${part.partNumber} — ${group.range}: type "${group.type}" không hợp lệ.`)
      }
      if (!group.questions?.length) {
        warnings.push(`Part ${part.partNumber} — ${group.range}: không có câu hỏi.`)
        continue
      }

      for (const q of group.questions) {
        totalQuestions += 1
        if (!q.prompt?.trim()) warnings.push(`Câu ${q.number}: thiếu prompt.`)
        if (!q.answer?.trim()) warnings.push(`Câu ${q.number}: thiếu answer.`)
        if (!VALID_QUESTION_TYPES.includes(q.type)) {
          warnings.push(`Câu ${q.number}: type "${q.type}" không hợp lệ.`)
        }
        if ((q.type === 'multiple-choice' || q.type === 'matching-paragraph' || q.type === 'matching-features')
          && (!q.options || q.options.length < 2)) {
          warnings.push(`Câu ${q.number}: thiếu options.`)
        }
      }
    }
  }

  if (totalQuestions === 0) warnings.push('Đề không có câu hỏi nào.')
  return warnings
}

export function countReadingImportQuestions(payload: ReadingImportPayload): number {
  return payload.parts.reduce(
    (sum, part) => sum + part.questionGroups.reduce((gs, g) => gs + (g.questions?.length ?? 0), 0),
    0,
  )
}

export function buildImportedReadingManualId(): string {
  return `reading-manual-${Date.now()}`
}

export function isReadingMediaFile(file: File): boolean {
  return IMAGE_EXT.test(normalizeFileKey(file.name))
}

export function isReadingJsonFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.json')
    && (file.type === 'application/json' || file.type === '' || file.type === 'text/json')
}

function defaultBandHint(payload: ReadingImportPayload): string {
  if (payload.bandHint?.trim()) return payload.bandHint.trim()
  if (payload.cambridgeLevel) {
    const labels: Record<CambridgeLevelSlug, string> = {
      a2: 'A2 Key',
      b1: 'B1 Preliminary',
      b2: 'B2 First',
      c1: 'C1 Advanced',
      c2: 'C2 Proficiency',
    }
    return `${labels[payload.cambridgeLevel]} Reading`
  }
  if (payload.examTrack === 'ielts') return 'IELTS Academic'
  return 'Import thủ công'
}

export async function buildReadingExamFromImport(
  payload: ReadingImportPayload,
  mediaFiles: File[],
  examId = buildImportedReadingManualId(),
): Promise<ReadingExam> {
  const mediaMap = buildMediaMap(mediaFiles)
  const parts: ReadingPart[] = []

  for (const partJson of payload.parts) {
    const partId = `${examId}-part-${partJson.partNumber}`
    const passage: ReadingPassageBlock[] = []

    for (let blockIndex = 0; blockIndex < (partJson.passage ?? []).length; blockIndex += 1) {
      const blockJson = partJson.passage[blockIndex]
      let imageKey: string | undefined

      const imgFile = resolveMediaFile(mediaMap, blockJson.imageFile)
        ?? resolveMediaFile(mediaMap, `part${partJson.partNumber}-p${blockIndex}.jpg`)
        ?? resolveMediaFile(mediaMap, `part${partJson.partNumber}-p${blockIndex}.webp`)
        ?? resolveMediaFile(mediaMap, `part${partJson.partNumber}-p${blockIndex}.png`)
      if (imgFile) {
        imageKey = readingExamMediaKey(examId, `part${partJson.partNumber}-img-${blockIndex}`)
        await audioRepo.put(imageKey, imgFile)
      }

      passage.push({
        label: blockJson.label,
        text: blockJson.text ?? '',
        imageKey,
      })
    }

    const questionGroups: ReadingQuestionGroup[] = partJson.questionGroups.map((groupJson, groupIndex) => {
      const groupId = `${partId}-g${groupIndex}`
      const questions: ReadingQuestion[] = groupJson.questions.map(qJson => ({
        id: `${partId}-q${qJson.number}`,
        number: qJson.number,
        type: qJson.type,
        prompt: qJson.prompt,
        options: qJson.options ?? [],
        answer: qJson.answer,
        explanation: qJson.explanation ?? '',
        answerConfidence: 'key',
      }))

      return {
        id: groupId,
        range: groupJson.range,
        instruction: groupJson.instruction,
        note: groupJson.note,
        type: groupJson.type,
        paragraphLetters: groupJson.paragraphLetters,
        features: groupJson.features,
        wordBank: groupJson.wordBank,
        questions,
      }
    })

    parts.push({
      id: partId,
      partNumber: partJson.partNumber,
      rangeLabel: partJson.rangeLabel,
      passageTitle: partJson.passageTitle,
      passageSubtitle: partJson.passageSubtitle,
      passage,
      questionGroups,
    })
  }

  const partCount = parts.length
  const bandHint = defaultBandHint(payload)
    + (partCount > 0 ? ` — ${partCount} part${partCount === 1 ? '' : 's'}` : '')

  return {
    id: examId,
    title: payload.title,
    durationMinutes: payload.durationMinutes,
    bandHint,
    parts,
    examTrack: payload.examTrack,
    cambridgeLevel: payload.cambridgeLevel,
  }
}

export function readingImportTemplate(
  examTrack: ReadingExamTrack = 'ielts',
  cambridgeLevel?: CambridgeLevelSlug,
): ReadingImportPayload {
  if (cambridgeLevel && examTrack === 'cambridge') {
    const tpl = cambridgeReadingImportTemplate(cambridgeLevel)
    if (tpl) return tpl
  }

  const isIelts = examTrack === 'ielts'
  const levelLabel = cambridgeLevel?.toUpperCase() ?? 'IELTS'

  return {
    version: 1,
    title: isIelts
      ? 'IELTS Reading — Đề import thủ công'
      : `${levelLabel} Reading — Đề import thủ công`,
    durationMinutes: 60,
    bandHint: isIelts ? 'IELTS Academic' : `${levelLabel} Reading`,
    examTrack,
    cambridgeLevel,
    parts: [
      {
        partNumber: 1,
        rangeLabel: 'Read the text and answer questions 1–3.',
        passageTitle: 'Sample passage title',
        passageSubtitle: 'Optional subtitle',
        passage: [
          {
            text: 'Paste your passage paragraph here. You can add multiple blocks.',
          },
          {
            imageFile: 'part1-p1.jpg',
          },
          {
            label: 'A',
            text: 'Optional labelled paragraph (e.g. matching paragraph tasks).',
          },
        ],
        questionGroups: [
          {
            range: 'Questions 1–3',
            type: 'tfng',
            instruction: 'Do the following statements agree with the information in the passage?',
            questions: [
              {
                number: 1,
                type: 'true-false-not-given',
                prompt: 'The passage mentions a specific date.',
                options: [
                  { id: 'true', label: 'TRUE' },
                  { id: 'false', label: 'FALSE' },
                  { id: 'not-given', label: 'NOT GIVEN' },
                ],
                answer: 'true',
                explanation: 'Explain why this is the correct answer.',
              },
              {
                number: 2,
                type: 'gap-fill',
                prompt: 'The research was conducted in ______.',
                answer: 'London',
                explanation: 'ONE WORD ONLY from the passage.',
              },
              {
                number: 3,
                type: 'multiple-choice',
                prompt: 'What is the main purpose of the passage?',
                options: [
                  { id: 'A', label: 'To describe a process' },
                  { id: 'B', label: 'To argue a position' },
                  { id: 'C', label: 'To report findings' },
                  { id: 'D', label: 'To tell a story' },
                ],
                answer: 'C',
                explanation: 'The passage reports research findings.',
              },
            ],
          },
        ],
      },
    ],
  }
}

export function isImportedReadingExamId(id: string): boolean {
  return id.startsWith('reading-pdf-') || id.startsWith('reading-manual-')
}