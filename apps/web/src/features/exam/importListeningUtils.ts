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
import {
  catalogPictureImageUrl,
  catalogQuestionAudioUrl,
  catalogSharedListeningAudioUrl,
  findCatalogListeningTwin,
} from './listeningExamCatalogMerge'
import { compositePictureFileCandidates } from './listeningPictureMc'

export const LISTENING_IMPORT_MAX_JSON_BYTES = 2 * 1024 * 1024
export const LISTENING_IMPORT_MAX_MEDIA_BYTES = 80 * 1024 * 1024

export interface ListeningImportQuestionJson {
  number: number
  type: ListeningQuestionType
  prompt: string
  /** Part 1 picture-mc: một ảnh lớn q1.jpg chứa A+B+C */
  imageFile?: string
  options?: Array<{ id: string; label: string; imageFile?: string }>
  answer: string
  explanation?: string
  audioFile?: string
  ttsText?: string
  wordLimit?: number
  /** PET Part 2: "You will hear…" */
  context?: string
  /** PET Part 3: câu gap-fill */
  gapLead?: string
  gapTrail?: string
}

export interface ListeningImportPartJson {
  partNumber: number
  rangeLabel: string
  instruction?: string
  audioFile?: string
  ttsText?: string
  maxPlays?: number
  /** PET Part 3: tiêu đề khung điền */
  passageTitle?: string
  audioIntro?: string
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

export interface ListeningImportMediaCheck {
  label: string
  found: boolean
  required: boolean
}

function collectExpectedMediaFiles(payload: ListeningImportPayload): Array<{ label: string; required: boolean }> {
  const items: Array<{ label: string; required: boolean }> = []
  const seen = new Set<string>()

  const push = (label: string, required = true) => {
    const key = label.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    items.push({ label, required })
  }

  for (const part of payload.parts) {
    if (part.audioFile) push(part.audioFile, true)
    for (const q of part.questions) {
      if (q.audioFile) push(q.audioFile, false)
      if (q.type === 'picture-mc') {
        if (q.imageFile) {
          push(q.imageFile, true)
        } else {
          push(`q${q.number}.jpg`, true)
        }
      }
      for (const opt of q.options ?? []) {
        if (opt.imageFile) push(opt.imageFile, false)
      }
    }
  }

  return items
}

function mediaFileFound(mediaFiles: File[], filename: string): boolean {
  const map = buildMediaMap(mediaFiles)
  if (resolveMediaFile(map, filename)) return true
  const base = normalizeFileKey(filename)
  const alt = base.replace(/\.(jpg|jpeg|png|webp)$/i, '')
  for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
    if (resolveMediaFile(map, `${alt}${ext}`)) return true
  }
  return false
}

export function checkListeningImportMedia(
  payload: ListeningImportPayload,
  mediaFiles: File[],
): ListeningImportMediaCheck[] {
  return collectExpectedMediaFiles(payload).map(({ label, required }) => ({
    label,
    required,
    found: mediaFileFound(mediaFiles, label),
  }))
}

export function validateListeningImportMedia(
  payload: ListeningImportPayload,
  mediaFiles: File[],
): string[] {
  const warnings: string[] = []
  for (const item of checkListeningImportMedia(payload, mediaFiles)) {
    if (item.required && !item.found) {
      warnings.push(`Thiếu file trong ZIP/media: ${item.label}`)
    }
  }
  if (mediaFiles.length === 0) {
    warnings.push('Chưa có file MP3/ảnh — upload ZIP (exam.json + listening.mp3 + q1.jpg …) hoặc chọn thêm media.')
  }
  return warnings
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
      if (q.type === 'picture-mc') {
        const hasComposite = Boolean(q.imageFile?.trim())
        const hasSplit = (q.options ?? []).some(o => o.imageFile?.trim())
        if (!hasComposite && !hasSplit) {
          warnings.push(
            `Câu ${q.number} (picture-mc): thêm imageFile "q${q.number}.jpg" (ảnh A+B+C) hoặc q${q.number}-a.jpg …`,
          )
        }
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

async function storeSharedMedia(
  cache: Map<string, string>,
  examId: string,
  suffix: string,
  file: File,
): Promise<string> {
  const fileKey = normalizeFileKey(file.name)
  const cached = cache.get(fileKey)
  if (cached) return cached

  const mediaKey = listeningExamAudioKey(examId, suffix)
  await audioRepo.put(mediaKey, file)
  cache.set(fileKey, mediaKey)
  return mediaKey
}

export async function buildListeningExamFromImport(
  payload: ListeningImportPayload,
  mediaFiles: File[],
  examId = buildImportedListeningExamId(),
): Promise<ListeningExam> {
  const mediaMap = buildMediaMap(mediaFiles)
  const sharedMediaKeys = new Map<string, string>()
  const catalogTwin = findCatalogListeningTwin({
    examType: payload.examType,
    title: payload.title,
  })
  const catalogAudioUrl = catalogTwin ? catalogSharedListeningAudioUrl(catalogTwin) : undefined
  const parts: ListeningPart[] = []

  for (const partJson of payload.parts) {
    const partId = `${examId}-part-${partJson.partNumber}`
    let partAudioKey: string | undefined

    const partFile = resolveMediaFile(mediaMap, partJson.audioFile)
      ?? resolveMediaFile(mediaMap, `part${partJson.partNumber}.mp3`)
    if (partFile) {
      partAudioKey = await storeSharedMedia(
        sharedMediaKeys,
        examId,
        `part-${partJson.partNumber}`,
        partFile,
      )
    }

    const questions: ListeningQuestion[] = []

    for (const qJson of partJson.questions) {
      const qId = `${examId}-q-${qJson.number}`
      let audioKey: string | undefined

      const qFile = resolveMediaFile(mediaMap, qJson.audioFile)
        ?? resolveMediaFile(mediaMap, `q${qJson.number}.mp3`)
      if (qFile) {
        audioKey = await storeSharedMedia(
          sharedMediaKeys,
          examId,
          `q-${qJson.number}`,
          qFile,
        )
      }

      let pictureImageKey: string | undefined
      if (qJson.type === 'picture-mc') {
        for (const candidate of compositePictureFileCandidates(qJson.number, qJson.imageFile)) {
          const boardFile = resolveMediaFile(mediaMap, candidate)
          if (!boardFile) continue
          pictureImageKey = listeningExamAudioKey(examId, `board-q${qJson.number}`)
          await audioRepo.put(pictureImageKey, boardFile)
          break
        }
      }

      const options = []
      for (const opt of qJson.options ?? []) {
        let imageKey: string | undefined
        if (!pictureImageKey) {
          const imgFile = resolveMediaFile(mediaMap, opt.imageFile)
            ?? resolveMediaFile(mediaMap, `q${qJson.number}-${opt.id.toLowerCase()}.jpg`)
            ?? resolveMediaFile(mediaMap, `q${qJson.number}-${opt.id.toLowerCase()}.webp`)
            ?? resolveMediaFile(mediaMap, `q${qJson.number}_${opt.id.toLowerCase()}.png`)
          if (imgFile) {
            imageKey = listeningExamAudioKey(examId, `img-q${qJson.number}-${opt.id}`)
            await audioRepo.put(imageKey, imgFile)
          }
        }
        options.push({
          id: opt.id,
          label: opt.label,
          imageKey,
        })
      }

      const pictureImageUrl = catalogTwin
        ? catalogPictureImageUrl(catalogTwin, qJson.number)
        : undefined
      const questionAudioUrl = catalogTwin
        ? catalogQuestionAudioUrl(catalogTwin, qJson.number)
        : undefined

      questions.push({
        id: qId,
        number: qJson.number,
        type: qJson.type,
        prompt: qJson.prompt,
        options,
        answer: qJson.answer,
        explanation: qJson.explanation ?? '',
        pictureImageKey,
        pictureImageUrl,
        audioKey,
        audioUrl: questionAudioUrl,
        ttsText: qJson.ttsText,
        wordLimit: qJson.wordLimit,
        context: qJson.context,
        gapLead: qJson.gapLead,
        gapTrail: qJson.gapTrail,
      })
    }

    parts.push({
      id: partId,
      partNumber: partJson.partNumber,
      rangeLabel: partJson.rangeLabel,
      instruction: partJson.instruction,
      audioKey: partAudioKey,
      audioUrl: catalogAudioUrl,
      ttsText: partJson.ttsText,
      maxPlays: partJson.maxPlays,
      passageTitle: partJson.passageTitle,
      audioIntro: partJson.audioIntro,
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
    ket: { title: 'KET Listening — Đề mẫu import', bandHint: 'A2 Key', durationMinutes: 25 },
    ielts: { title: 'IELTS Listening — Đề mẫu import', bandHint: 'IELTS', durationMinutes: 40 },
    pet: { title: 'PET Listening — Đề mẫu import', bandHint: 'B1 Preliminary', durationMinutes: 30 },
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
            imageFile: 'q1.jpg',
            audioFile: 'q1.mp3',
            options: [
              { id: 'A', label: 'Classroom' },
              { id: 'B', label: 'Corridor' },
              { id: 'C', label: 'Café' },
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