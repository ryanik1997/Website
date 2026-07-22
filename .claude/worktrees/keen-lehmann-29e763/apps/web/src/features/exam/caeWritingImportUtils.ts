import type { ReadingImportPartJson, ReadingImportPayload } from './importReadingManualUtils'
import {
  findImportImageByStems,
  isExamImportImageFile,
  normalizeImportFileKey,
} from './examImportImageFormats'

function normalizeFileKey(name: string): string {
  return normalizeImportFileKey(name)
}

export function isCaeWritingImageFile(file: File): boolean {
  return isExamImportImageFile(file)
}

export function findCaePart9ImageFile(files: File[]): File | null {
  return findImportImageByStems(
    files,
    ['part9-page', 'part9', 'part9-prompt'],
    /^part9[-_]/i,
  )
}

export function findCaePart10ImageFile(files: File[]): File | null {
  return findImportImageByStems(
    files,
    ['part10-page', 'part10', 'part10-prompt'],
    /^part10[-_]/i,
  )
}

export function buildCaePart9Json(imageFile?: string): ReadingImportPartJson {
  const passage = imageFile
    ? [{ imageFile }]
    : [{ imageFile: 'part9-page.jpg' }]

  return {
    partNumber: 9,
    rangeLabel: 'Question 57',
    passageTitle: 'Writing Part 9',
    passage,
    questionGroups: [{
      range: 'Question 57',
      instruction: 'Write 220–260 words.',
      type: 'sentence-completion',
      questions: [{
        number: 57,
        type: 'writing-task',
        prompt: 'Write your answer to Question 1 in the box on the right.',
        options: [],
        answer: '',
        minWords: 220,
        explanation: 'Writing — chấm bằng AI.',
      }],
    }],
  }
}

export function buildCaePart10Json(imageFile?: string): ReadingImportPartJson {
  const passage = imageFile
    ? [{ imageFile }]
    : [{ imageFile: 'part10-page.jpg' }]

  return {
    partNumber: 10,
    rangeLabel: 'Question 58',
    passageTitle: 'Writing Part 10',
    passage,
    questionGroups: [{
      range: 'Question 58',
      instruction: 'Write 220–260 words.',
      type: 'sentence-completion',
      questions: [{
        number: 58,
        type: 'writing-task',
        prompt: 'Write your answer to Question 2 in the box on the right.',
        options: [],
        answer: '',
        minWords: 220,
        explanation: 'Writing — chấm bằng AI.',
      }],
    }],
  }
}

export interface CaeWritingMergeResult {
  payload: ReadingImportPayload
  merged: boolean
  notes: string[]
  extraMediaFiles: File[]
}

/** Gắn Part 9–10 Writing (+ ảnh) vào payload CAE C1. */
export function mergeCaeWritingImagesIntoPayload(
  payload: ReadingImportPayload,
  mediaFiles: File[],
): CaeWritingMergeResult {
  const notes: string[] = []
  const extraMediaFiles: File[] = []

  if (payload.cambridgeLevel !== 'c1') {
    return { payload, merged: false, notes, extraMediaFiles }
  }

  const part9File = findCaePart9ImageFile(mediaFiles)
  const part10File = findCaePart10ImageFile(mediaFiles)

  if (!part9File && !part10File) {
    return { payload, merged: false, notes, extraMediaFiles }
  }

  const next: ReadingImportPayload = {
    ...payload,
    durationMinutes: Math.max(payload.durationMinutes, 120),
    bandHint: payload.bandHint?.includes('Writing')
      ? payload.bandHint
      : payload.bandHint?.replace(/Reading/, 'Reading & Writing')
        ?? 'C1 Advanced Reading & Writing',
    parts: [...payload.parts],
  }

  let merged = false

  if (part9File) {
    const imageFile = normalizeFileKey(part9File.name)
    const p9 = next.parts.find(p => p.partNumber === 9)
    if (p9) {
      p9.passage = [{ imageFile }]
      notes.push(`Part 9: cập nhật ảnh ${imageFile}`)
    } else {
      next.parts.push(buildCaePart9Json(imageFile))
      notes.push(`Part 9: ảnh ${imageFile}`)
    }
    extraMediaFiles.push(part9File)
    merged = true
  }

  if (part10File) {
    const imageFile = normalizeFileKey(part10File.name)
    const p10 = next.parts.find(p => p.partNumber === 10)
    if (p10) {
      p10.passage = [{ imageFile }]
      notes.push(`Part 10: cập nhật ảnh ${imageFile}`)
    } else {
      next.parts.push(buildCaePart10Json(imageFile))
      notes.push(`Part 10: ảnh ${imageFile}`)
    }
    extraMediaFiles.push(part10File)
    merged = true
  }

  next.parts.sort((a, b) => a.partNumber - b.partNumber)

  return { payload: next, merged, notes, extraMediaFiles }
}

export const CAE_WRITING_IMAGE_HINT =
  'part9-page.jpg|.webp (đề Part 9 Q57) + part10-page.jpg|.webp (đề Part 10 Q58)'