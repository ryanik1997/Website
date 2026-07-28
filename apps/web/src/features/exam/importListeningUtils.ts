import { audioRepo } from '@ryan/db'
import type {
  ListeningExam,
  ListeningExamMode,
  ListeningExamType,
  ListeningFlowChartStep,
  ListeningNotePassageBlock,
  ListeningNoteTable,
  ListeningPart,
  ListeningQuestion,
  ListeningQuestionType,
} from './listeningExamData'
import {
  gapNumbersFromSections,
  validateNotePassageBlocks,
  validateNoteTable,
  validateNoteTables,
} from './listeningNotePassage'
import { listeningExamAudioKey } from './listeningExamData'
import {
  catalogPartImageUrl,
  catalogPictureImageUrl,
  catalogQuestionAudioUrl,
  diagnoseCatalogListeningMatch,
  findCatalogListeningTwin,
  resolveListeningCatalogAudioUrl,
} from './listeningExamCatalogMerge'
import { compositePictureFileCandidates } from './listeningPictureMc'
import { ieltsListeningFullTemplate } from './ieltsListeningImportTemplates'
import { normalizeListeningImportPayload } from './listeningImportNormalize'
import {
  ensureImageFileMime,
  isExamImportImageFile,
  isExamImportImageFileName,
  normalizeImportFileKey,
  resolveImageMediaFile,
} from './examImportImageFormats'

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
  /**
   * Biến thể đáp án (gap-fill). Có thể dùng thêm answer: "8/eight".
   * Import sẽ gộp vào chấm điểm.
   */
  acceptableAnswers?: string[]
  explanation?: string
  audioFile?: string
  ttsText?: string
  wordLimit?: number
  /** PET Part 2: "You will hear…" */
  context?: string
  /** PET Part 3: câu gap-fill */
  gapLead?: string
  gapTrail?: string
  noteBefore?: string
  noteAfter?: string
  contextFirst?: boolean
  sectionRange?: string
  sectionInstruction?: string
  sectionTitle?: string
  mapLabel?: boolean
  diagramLabel?: boolean
  flowChart?: boolean
  flowChartEnd?: string
}

export interface ListeningImportPartJson {
  partNumber: number
  rangeLabel: string
  instruction?: string
  audioFile?: string
  ttsText?: string
  maxPlays?: number
  /** PET Part 3 / FCE Part 2: tiêu đề đoạn */
  passageTitle?: string
  /** FCE Part 2: ảnh minh họa (vd. q2.jpg) */
  imageFile?: string
  audioIntro?: string
  /** CAE Part 4: hai task matching song song */
  matchingDualTask?: boolean
  taskOneInstruction?: string
  taskTwoInstruction?: string
  notePassage?: ListeningNotePassageBlock[]
  notePassageLayout?: 'list' | 'table' | 'form' | 'lecture'
  noteTable?: ListeningNoteTable
  noteTables?: ListeningNoteTable[]
  notePassageSections?: Array<{
    blocks: ListeningNotePassageBlock[]
    gapNumbers?: number[]
    instruction?: string
    title?: string
  }>
  flowChartSteps?: ListeningFlowChartStep[]
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

function normalizeFileKey(name: string): string {
  return normalizeImportFileKey(name)
}

function buildMediaMap(files: File[]): Map<string, File> {
  const map = new Map<string, File>()
  for (const file of files) {
    const f = isExamImportImageFile(file) ? ensureImageFileMime(file) : file
    map.set(normalizeFileKey(f.name), f)
  }
  return map
}

function resolveMediaFile(map: Map<string, File>, filename?: string): File | null {
  if (!filename) return null
  // Ảnh: JSON .jpg ↔ file .webp
  if (isExamImportImageFileName(filename) || !AUDIO_EXT.test(filename)) {
    const img = resolveImageMediaFile(map, filename)
    if (img) return img
  }
  return map.get(normalizeFileKey(filename)) ?? null
}

/** Tên MP3 thường gặp trong ZIP pack tay / DeepSeek (Audio.mp3 ≠ listening.mp3). */
const SHARED_LISTENING_AUDIO_ALIASES = [
  'listening.mp3',
  'audio.mp3',
  'audio.wav',
  'audio.m4a',
  'track.mp3',
  'test.mp3',
  'test.wav',
  'part.mp3',
  'full.mp3',
  'recording.mp3',
]

function isSharedListeningAudioName(name: string): boolean {
  const n = normalizeFileKey(name)
  if (SHARED_LISTENING_AUDIO_ALIASES.includes(n)) return true
  // audio-1.mp3, listening_test2.mp3, Audio.MP3 đã normalize
  if (/^(listening|audio|track|test)[-_.]?\d*\.(mp3|wav|m4a|ogg)$/i.test(n)) return true
  return false
}

/**
 * Tìm file audio cho part/câu:
 * 1) đúng tên audioFile trong JSON
 * 2) alias listening/audio.mp3
 * 3) part{N}.mp3
 * 4) nếu ZIP chỉ có 1 file audio → dùng file đó
 */
function resolveListeningAudioFile(
  map: Map<string, File>,
  audioFile?: string,
  partNumber?: number,
): File | null {
  const tried = new Set<string>()
  const tryName = (name?: string): File | null => {
    if (!name) return null
    const key = normalizeFileKey(name)
    if (tried.has(key)) return null
    tried.add(key)
    return resolveMediaFile(map, key)
  }

  let hit = tryName(audioFile)
  if (hit) return hit

  // JSON ghi listening.mp3 nhưng ZIP là Audio.mp3 (và ngược lại)
  if (!audioFile || isSharedListeningAudioName(audioFile) || /listening/i.test(audioFile)) {
    for (const alias of SHARED_LISTENING_AUDIO_ALIASES) {
      hit = tryName(alias)
      if (hit) return hit
    }
  }

  if (partNumber != null) {
    hit = tryName(`part${partNumber}.mp3`)
      ?? tryName(`part-${partNumber}.mp3`)
      ?? tryName(`part_${partNumber}.mp3`)
    if (hit) return hit
  }

  // Một file audio duy nhất trong ZIP
  const audioFiles = [...map.values()].filter(f => AUDIO_EXT.test(normalizeFileKey(f.name)))
  if (audioFiles.length === 1) return audioFiles[0]!

  // Nhiều file: ưu tiên tên có listening/audio/test
  const preferred = audioFiles.find(f => isSharedListeningAudioName(f.name))
  if (preferred) return preferred

  // Lấy file audio lớn nhất (thường là full test)
  if (audioFiles.length > 1) {
    return [...audioFiles].sort((a, b) => b.size - a.size)[0] ?? null
  }

  return null
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
    for (const q of Array.isArray(part.questions) ? part.questions : []) {
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
  // Audio: alias listening.mp3 ↔ Audio.mp3
  if (AUDIO_EXT.test(filename) || isSharedListeningAudioName(filename)) {
    if (resolveListeningAudioFile(map, filename)) return true
  }
  if (resolveImageMediaFile(map, filename)) return true
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
  } else {
    const names = mediaFiles.map(f => f.name).sort((a, b) => a.localeCompare(b))
    const audioNames = names.filter(name => AUDIO_EXT.test(name))
    if (audioNames.length === 0) {
      warnings.push(`Không thấy file audio trong media đã chọn. File hiện có: ${names.join(', ')}`)
    } else {
      warnings.push(`Audio/media đã nhận: ${audioNames.join(', ')}`)
    }
  }
  return warnings
}

export function diagnoseListeningImportMedia(
  payload: ListeningImportPayload,
  mediaFiles: File[],
): string[] {
  const diagnostics: string[] = []
  const mediaMap = buildMediaMap(mediaFiles)
  const audioFiles = mediaFiles
    .filter(file => AUDIO_EXT.test(normalizeFileKey(file.name)))
    .map(file => file.name)
    .sort((a, b) => a.localeCompare(b))

  if (audioFiles.length > 0) {
    diagnostics.push(`ZIP/media có audio: ${audioFiles.join(', ')}`)
  }

  const catalogMsg = diagnoseCatalogListeningMatch({
    examType: payload.examType,
    title: payload.title,
  })
  if (catalogMsg) diagnostics.push(catalogMsg)

  const normalized = normalizeListeningImportPayload(payload)
  const sharedAudioFile = resolveListeningAudioFile(mediaMap, 'listening.mp3')
  if (audioFiles.length > 0 && !sharedAudioFile) {
    diagnostics.push('ZIP có MP3 nhưng importer không resolve được shared audio từ listening.mp3/alias.')
  }

  const unmappedParts = normalized.parts
    .filter(part => {
      const partFile = resolveListeningAudioFile(mediaMap, part.audioFile, part.partNumber)
      return !partFile && !sharedAudioFile
    })
    .map(part => `Part ${part.partNumber}`)
  if (audioFiles.length > 0 && unmappedParts.length > 0) {
    diagnostics.push(`Có MP3 nhưng chưa map được vào các part: ${unmappedParts.join(', ')}`)
  }

  const unmappedQuestions: number[] = []
  for (const part of normalized.parts) {
    for (const q of Array.isArray(part.questions) ? part.questions : []) {
      if (!q.audioFile) continue
      const qFile =
        resolveMediaFile(mediaMap, q.audioFile)
        ?? resolveMediaFile(mediaMap, `q${q.number}.mp3`)
      if (!qFile) unmappedQuestions.push(q.number)
    }
  }
  if (unmappedQuestions.length > 0) {
    diagnostics.push(`audioFile không map được ở câu: ${unmappedQuestions.join(', ')}`)
  }

  return diagnostics
}

export function validateListeningImport(payload: ListeningImportPayload): string[] {
  const warnings: string[] = []
  let totalQuestions = 0

  for (const part of payload.parts) {
    if (payload.examType === 'ielts') {
      const gapNumbers = (part.questions ?? [])
        .filter(q => q.type === 'gap-fill')
        .map(q => q.number)
      const sectionGaps = gapNumbersFromSections(part.notePassageSections)
      const hasSections = Boolean(part.notePassageSections?.length)
      const hasTables = part.notePassageLayout === 'table' || Boolean(part.noteTables?.length)
      const hasSingleTable = Boolean(part.noteTable)
      const tableGapNumbers = sectionGaps.length
        ? gapNumbers.filter(n => !sectionGaps.includes(n))
        : gapNumbers

      if (hasTables) {
        warnings.push(
          ...validateNoteTables(
            part.noteTables,
            part.noteTable,
            tableGapNumbers,
            `Part ${part.partNumber}`,
          ),
        )
      } else if (hasSingleTable) {
        warnings.push(
          ...validateNoteTable(
            part.noteTable,
            tableGapNumbers,
            `Part ${part.partNumber}`,
          ),
        )
      }

      if (hasSections) {
        warnings.push(
          ...validateNotePassageBlocks(
            part.notePassageSections!.flatMap(s => s.blocks),
            sectionGaps.length ? sectionGaps : gapNumbers,
            `Part ${part.partNumber}`,
          ),
        )
      } else if (!hasTables && !hasSingleTable) {
        warnings.push(
          ...validateNotePassageBlocks(
            part.notePassage,
            gapNumbers,
            `Part ${part.partNumber}`,
          ),
        )
      }
    }
    if (!part.questions?.length) {
      warnings.push(`Part ${part.partNumber}: không có câu hỏi.`)
      continue
    }
    const questions = Array.isArray(part.questions) ? part.questions : []
    totalQuestions += questions.length
    for (const q of questions) {
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

  const sharedListening = isSharedListeningAudioName(fileKey) || fileKey === 'listening.mp3'
  const mediaKey = listeningExamAudioKey(examId, sharedListening ? 'shared-listening' : suffix)
  // Ép MIME audio — File từ ZIP đôi khi type rỗng → HTMLAudioElement không play
  let toStore: Blob = file
  if (AUDIO_EXT.test(fileKey) && (!file.type || !file.type.startsWith('audio/'))) {
    const mime = fileKey.endsWith('.wav')
      ? 'audio/wav'
      : fileKey.endsWith('.m4a')
        ? 'audio/mp4'
        : fileKey.endsWith('.ogg')
          ? 'audio/ogg'
          : 'audio/mpeg'
    toStore = new Blob([await file.arrayBuffer()], { type: mime })
  }
  await audioRepo.put(mediaKey, toStore)
  cache.set(fileKey, mediaKey)
  // Alias map: JSON "listening.mp3" và file "audio.mp3" dùng chung key
  if (sharedListening) {
    for (const alias of SHARED_LISTENING_AUDIO_ALIASES) {
      if (!cache.has(alias)) cache.set(alias, mediaKey)
    }
  }
  return mediaKey
}

export async function buildListeningExamFromImport(
  payload: ListeningImportPayload,
  mediaFiles: File[],
  examId = buildImportedListeningExamId(),
): Promise<ListeningExam> {
  const normalized = normalizeListeningImportPayload(payload)
  const mediaMap = buildMediaMap(mediaFiles)
  const sharedMediaKeys = new Map<string, string>()
  // Twin catalog chỉ khi đúng số Test — không bao giờ gán audio Test 1 cho Test N
  const catalogTwin = findCatalogListeningTwin({
    examType: payload.examType,
    title: payload.title,
  })
  const catalogAudioUrl = catalogTwin
    ? resolveListeningCatalogAudioUrl({
        examType: payload.examType,
        title: payload.title,
      })
    : undefined
  const parts: ListeningPart[] = []

  // Fallback audio toàn đề (Audio.mp3 / listening.mp3 / file mp3 duy nhất)
  const sharedAudioFile = resolveListeningAudioFile(mediaMap, 'listening.mp3')
  let sharedAudioKey: string | undefined
  if (sharedAudioFile) {
    sharedAudioKey = await storeSharedMedia(
      sharedMediaKeys,
      examId,
      'shared-listening',
      sharedAudioFile,
    )
  }

  for (const partJson of normalized.parts) {
    const partId = `${examId}-part-${partJson.partNumber}`
    let partAudioKey: string | undefined

    const partFile = resolveListeningAudioFile(
      mediaMap,
      partJson.audioFile,
      partJson.partNumber,
    )
    if (partFile) {
      partAudioKey = await storeSharedMedia(
        sharedMediaKeys,
        examId,
        `part-${partJson.partNumber}`,
        partFile,
      )
    } else if (sharedAudioKey) {
      partAudioKey = sharedAudioKey
    }

    const questions: ListeningQuestion[] = []

    for (const qJson of partJson.questions) {
      const qId = `${examId}-q-${qJson.number}`
      let audioKey: string | undefined

      const qFile = resolveMediaFile(mediaMap, qJson.audioFile)
        ?? resolveMediaFile(mediaMap, `q${qJson.number}.mp3`)
        // Chỉ dùng shared full-test audio khi JSON không chỉ định file câu riêng
        ?? (!qJson.audioFile ? sharedAudioFile : null)
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

      // Catalog URL chỉ khi KHÔNG có blob local — tránh UI hiện ảnh/audio catalog đè import
      const pictureImageUrl = !pictureImageKey && catalogTwin
        ? catalogPictureImageUrl(catalogTwin, qJson.number)
        : undefined
      const questionAudioUrl = !audioKey && catalogTwin
        ? catalogQuestionAudioUrl(catalogTwin, qJson.number)
        : undefined

      const acceptableAnswers = Array.isArray(qJson.acceptableAnswers)
        ? qJson.acceptableAnswers
            .filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
            .map(a => a.trim())
        : undefined

      questions.push({
        id: qId,
        number: qJson.number,
        type: qJson.type,
        prompt: qJson.prompt,
        options,
        answer: typeof qJson.answer === 'string' ? qJson.answer : String(qJson.answer ?? ''),
        ...(acceptableAnswers?.length ? { acceptableAnswers } : {}),
        explanation: qJson.explanation ?? '',
        pictureImageKey,
        pictureImageUrl,
        audioKey,
        audioUrl: audioKey ? undefined : questionAudioUrl,
        ttsText: qJson.ttsText,
        wordLimit: qJson.wordLimit,
        context: qJson.context,
        gapLead: qJson.gapLead,
        gapTrail: qJson.gapTrail,
        noteBefore: qJson.noteBefore,
        noteAfter: qJson.noteAfter,
        contextFirst: qJson.contextFirst,
        sectionRange: qJson.sectionRange,
        sectionInstruction: qJson.sectionInstruction,
        sectionTitle: qJson.sectionTitle,
        mapLabel: qJson.mapLabel,
        diagramLabel: qJson.diagramLabel,
        flowChart: qJson.flowChart,
        flowChartEnd: qJson.flowChartEnd,
      })
    }

    let partImageKey: string | undefined
    let partImageUrl: string | undefined
    if (partJson.imageFile) {
      const partImgFile = resolveMediaFile(mediaMap, partJson.imageFile)
      if (partImgFile) {
        partImageKey = listeningExamAudioKey(examId, `part-img-${partJson.partNumber}`)
        await audioRepo.put(partImageKey, partImgFile)
      }
      if (!partImageKey && catalogTwin) {
        partImageUrl = catalogPartImageUrl(catalogTwin, partJson.partNumber)
      }
    }

    parts.push({
      id: partId,
      partNumber: partJson.partNumber,
      rangeLabel: partJson.rangeLabel,
      instruction: partJson.instruction,
      // Ưu tiên blob local; catalog URL chỉ fallback khi không có file trong ZIP
      audioKey: partAudioKey,
      audioUrl: partAudioKey ? undefined : catalogAudioUrl,
      ttsText: partJson.ttsText,
      maxPlays: partJson.maxPlays,
      passageTitle: partJson.passageTitle,
      partImageKey,
      partImageUrl,
      audioIntro: partJson.audioIntro,
      matchingDualTask: partJson.matchingDualTask,
      taskOneInstruction: partJson.taskOneInstruction,
      taskTwoInstruction: partJson.taskTwoInstruction,
      notePassage: partJson.notePassage,
      notePassageLayout: partJson.notePassageLayout,
      noteTable: partJson.noteTable,
      noteTables: partJson.noteTables,
      notePassageSections: partJson.notePassageSections,
      flowChartSteps: partJson.flowChartSteps,
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
  if (examType === 'ielts') return ieltsListeningFullTemplate()

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
  return AUDIO_EXT.test(name) || isExamImportImageFile(file) || isExamImportImageFileName(name)
}

export function isListeningJsonFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.json')
    && (file.type === 'application/json' || file.type === '' || file.type === 'text/json')
}
