import { audioRepo } from '@ryan/db'
import type {
  ListeningExam,
  ListeningExamMode,
  ListeningExamType,
  ListeningPart,
  ListeningQuestion,
  ListeningQuestionType,
} from './listeningExamData'
import { listeningExamAudioKey } from './listeningExamData'

export const LISTENING_IMPORT_MAX_JSON_BYTES = 2 * 1024 * 1024
export const LISTENING_IMPORT_MAX_MEDIA_BYTES = 80 * 1024 * 1024

export interface ListeningImportQuestionJson {
  number: number
  type: ListeningQuestionType
  prompt: string
  options?: Array<{ id: string; label: string; imageFile?: string }>
  answer: string
  explanation?: string
  audioFile?: string
  ttsText?: string
  wordLimit?: number
}

export interface ListeningImportPartJson {
  partNumber: number
  rangeLabel: string
  instruction?: string
  audioFile?: string
  ttsText?: string
  maxPlays?: number
  questions: ListeningImportQuestionJson[]
}

export interface ListeningImportPayload {
  version: 1
  title: string
  durationMinutes: number
  bandHint: string
  examType: ListeningExamType
  examMode?: ListeningExamMode
  parts: ListeningImportPartJson[]
}

const AUDIO_EXT = /\.(mp3|wav|m4a|ogg)$/i
const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif)$/i

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

export function parseListeningImportJson(text: string): ListeningImportPayload {
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

  const validExamTypes: ListeningExamType[] = ['ket', 'ielts', 'pet', 'fce', 'cae', 'cpe']
  const rawType = typeof obj.examType === 'string' ? obj.examType : 'ket'
  const examType = validExamTypes.includes(rawType as ListeningExamType)
    ? rawType as ListeningExamType
    : 'ket'
  const examMode = obj.examMode === 'exam' ? 'exam' : 'practice'
  const defaultBandHint = examType === 'ielts'
    ? 'IELTS'
    : examType === 'pet'
      ? 'B1 Preliminary'
      : examType === 'fce'
        ? 'B2 First'
        : examType === 'cae'
          ? 'C1 Advanced'
          : examType === 'cpe'
            ? 'C2 Proficiency'
            : 'A2 Key'

  return {
    version: 1,
    title: obj.title.trim(),
    durationMinutes: typeof obj.durationMinutes === 'number' ? obj.durationMinutes : 30,
    bandHint: typeof obj.bandHint === 'string' ? obj.bandHint : defaultBandHint,
    examType,
    examMode,
    parts: obj.parts as ListeningImportPartJson[],
  }
}

export function validateListeningImport(payload: ListeningImportPayload): string[] {
  const warnings: string[] = []
  let totalQuestions = 0

  for (const part of payload.parts) {
    if (!part.questions?.length) {
      warnings.push(`Part ${part.partNumber}: không có câu hỏi.`)
      continue
    }
    totalQuestions += part.questions.length
    for (const q of part.questions) {
      if (!q.prompt?.trim()) warnings.push(`Câu ${q.number}: thiếu prompt.`)
      if (!q.answer?.trim()) warnings.push(`Câu ${q.number}: thiếu answer.`)
      if ((q.type === 'picture-mc' || q.type === 'multiple-choice' || q.type === 'matching')
        && (!q.options || q.options.length < 2)) {
        warnings.push(`Câu ${q.number}: thiếu options.`)
      }
    }
  }

  if (totalQuestions === 0) warnings.push('Đề không có câu hỏi nào.')
  return warnings
}

export function countListeningImportQuestions(payload: ListeningImportPayload): number {
  return payload.parts.reduce((sum, p) => sum + (p.questions?.length ?? 0), 0)
}

export function buildImportedListeningExamId(): string {
  return `listening-import-${Date.now()}`
}

export async function buildListeningExamFromImport(
  payload: ListeningImportPayload,
  mediaFiles: File[],
  examId = buildImportedListeningExamId(),
): Promise<ListeningExam> {
  const mediaMap = buildMediaMap(mediaFiles)
  const parts: ListeningPart[] = []

  for (const partJson of payload.parts) {
    const partId = `${examId}-part-${partJson.partNumber}`
    let partAudioKey: string | undefined

    const partFile = resolveMediaFile(mediaMap, partJson.audioFile)
      ?? resolveMediaFile(mediaMap, `part${partJson.partNumber}.mp3`)
    if (partFile) {
      partAudioKey = listeningExamAudioKey(examId, `part-${partJson.partNumber}`)
      await audioRepo.put(partAudioKey, partFile)
    }

    const questions: ListeningQuestion[] = []

    for (const qJson of partJson.questions) {
      const qId = `${examId}-q-${qJson.number}`
      let audioKey: string | undefined

      const qFile = resolveMediaFile(mediaMap, qJson.audioFile)
        ?? resolveMediaFile(mediaMap, `q${qJson.number}.mp3`)
      if (qFile) {
        audioKey = listeningExamAudioKey(examId, `q-${qJson.number}`)
        await audioRepo.put(audioKey, qFile)
      }

      const options = []
      for (const opt of qJson.options ?? []) {
        let imageKey: string | undefined
        const imgFile = resolveMediaFile(mediaMap, opt.imageFile)
          ?? resolveMediaFile(mediaMap, `q${qJson.number}-${opt.id.toLowerCase()}.jpg`)
          ?? resolveMediaFile(mediaMap, `q${qJson.number}-${opt.id.toLowerCase()}.webp`)
          ?? resolveMediaFile(mediaMap, `q${qJson.number}_${opt.id.toLowerCase()}.png`)
        if (imgFile) {
          imageKey = listeningExamAudioKey(examId, `img-q${qJson.number}-${opt.id}`)
          await audioRepo.put(imageKey, imgFile)
        }
        options.push({
          id: opt.id,
          label: opt.label,
          imageKey,
        })
      }

      questions.push({
        id: qId,
        number: qJson.number,
        type: qJson.type,
        prompt: qJson.prompt,
        options,
        answer: qJson.answer,
        explanation: qJson.explanation ?? '',
        audioKey,
        ttsText: qJson.ttsText,
        wordLimit: qJson.wordLimit,
      })
    }

    parts.push({
      id: partId,
      partNumber: partJson.partNumber,
      rangeLabel: partJson.rangeLabel,
      instruction: partJson.instruction,
      audioKey: partAudioKey,
      ttsText: partJson.ttsText,
      maxPlays: partJson.maxPlays,
      questions,
    })
  }

  return {
    id: examId,
    title: payload.title,
    durationMinutes: payload.durationMinutes,
    bandHint: payload.bandHint,
    examType: payload.examType,
    examMode: payload.examMode ?? 'practice',
    parts,
  }
}

export function listeningImportTemplate(examType: ListeningExamType = 'ket'): ListeningImportPayload {
  const meta: Record<ListeningExamType, { title: string; bandHint: string; durationMinutes: number }> = {
    ket: { title: 'KET Listening — Đề mẫu import', bandHint: 'A2 Key', durationMinutes: 30 },
    ielts: { title: 'IELTS Listening — Đề mẫu import', bandHint: 'IELTS', durationMinutes: 40 },
    pet: { title: 'PET Listening — Đề mẫu import', bandHint: 'B1 Preliminary', durationMinutes: 35 },
    fce: { title: 'FCE Listening — Đề mẫu import', bandHint: 'B2 First', durationMinutes: 40 },
    cae: { title: 'CAE Listening — Đề mẫu import', bandHint: 'C1 Advanced', durationMinutes: 40 },
    cpe: { title: 'CPE Listening — Đề mẫu import', bandHint: 'C2 Proficiency', durationMinutes: 40 },
  }
  const info = meta[examType]

  return {
    version: 1,
    title: info.title,
    durationMinutes: info.durationMinutes,
    bandHint: info.bandHint,
    examType,
    examMode: 'practice',
    parts: [
      {
        partNumber: 1,
        rangeLabel: 'Questions 1–2',
        instruction: 'Listen and choose the correct answer.',
        questions: [
          {
            number: 1,
            type: 'picture-mc',
            prompt: 'Where will they meet?',
            audioFile: 'q1.mp3',
            options: [
              { id: 'A', label: 'Classroom', imageFile: 'q1-a.jpg' },
              { id: 'B', label: 'Corridor', imageFile: 'q1-b.jpg' },
              { id: 'C', label: 'Café', imageFile: 'q1-c.jpg' },
            ],
            answer: 'B',
            explanation: 'They agree to meet in the corridor.',
            ttsText: 'Optional fallback if no MP3',
          },
          {
            number: 2,
            type: 'multiple-choice',
            prompt: 'What time does the film start?',
            audioFile: 'q2.mp3',
            options: [
              { id: 'A', label: '6:30 p.m.' },
              { id: 'B', label: '7:00 p.m.' },
              { id: 'C', label: '7:30 p.m.' },
            ],
            answer: 'C',
            explanation: 'The film begins at half past seven.',
          },
        ],
      },
    ],
  }
}

export function isListeningMediaFile(file: File): boolean {
  const name = normalizeFileKey(file.name)
  return AUDIO_EXT.test(name) || IMAGE_EXT.test(name)
}

export function isListeningJsonFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.json')
    && (file.type === 'application/json' || file.type === '' || file.type === 'text/json')
}