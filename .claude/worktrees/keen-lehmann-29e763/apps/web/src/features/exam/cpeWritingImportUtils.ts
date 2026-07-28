import type { ReadingImportPartJson, ReadingImportPayload } from './importReadingManualUtils'
import {
  findImportImageByStems,
  isExamImportImageFile,
  normalizeImportFileKey,
} from './examImportImageFormats'

function normalizeFileKey(name: string): string {
  return normalizeImportFileKey(name)
}

export function isCpeWritingImageFile(file: File): boolean {
  return isExamImportImageFile(file)
}

export function findCpePart8ImageFile(files: File[]): File | null {
  return findImportImageByStems(
    files,
    ['part8-page', 'part8', 'part8-prompt'],
    /^part8[-_]/i,
  )
}

export function findCpePart9ImageFile(files: File[]): File | null {
  return findImportImageByStems(
    files,
    ['part9-page', 'part9', 'part9-prompt'],
    /^part9[-_]/i,
  )
}

export function buildCpePart8Json(imageFile?: string): ReadingImportPartJson {
  const passage = [{ imageFile: imageFile ?? 'part8-page.jpg' }]

  return {
    partNumber: 8,
    rangeLabel: 'Question 1',
    passageTitle: 'Writing Part 8',
    passage,
    questionGroups: [{
      range: 'Question 1',
      instruction: 'Write 240–280 words.',
      type: 'sentence-completion',
      questions: [{
        number: 1,
        type: 'writing-task',
        prompt: 'Write your essay.',
        options: [],
        answer: '',
        minWords: 240,
        explanation: 'Writing — chấm bằng AI.',
      }],
    }],
  }
}

export function buildCpePart9Json(imageFile?: string): ReadingImportPartJson {
  const passage = [{ imageFile: imageFile ?? 'part9-page.jpg' }]

  return {
    partNumber: 9,
    rangeLabel: 'Questions 2–4',
    passageTitle: 'Writing Part 9',
    passage,
    questionGroups: [{
      range: 'Questions 2–4',
      instruction: 'Write 280–320 words. Choose one question.',
      type: 'sentence-completion',
      questions: [
        {
          number: 2,
          type: 'writing-task',
          prompt: 'Write your article.',
          options: [],
          answer: '',
          minWords: 280,
          explanation: 'Writing — choice task (Question 2).',
        },
        {
          number: 3,
          type: 'writing-task',
          prompt: 'Write your review.',
          options: [],
          answer: '',
          minWords: 280,
          explanation: 'Writing — choice task (Question 3).',
        },
        {
          number: 4,
          type: 'writing-task',
          prompt: 'Write your letter.',
          options: [],
          answer: '',
          minWords: 280,
          explanation: 'Writing — choice task (Question 4).',
        },
      ],
    }],
  }
}

export interface CpeWritingMergeResult {
  payload: ReadingImportPayload
  merged: boolean
  notes: string[]
  extraMediaFiles: File[]
}

/** Gắn Part 8–9 Writing (+ ảnh) vào payload CPE C2. */
export function mergeCpeWritingImagesIntoPayload(
  payload: ReadingImportPayload,
  mediaFiles: File[],
): CpeWritingMergeResult {
  const notes: string[] = []
  const extraMediaFiles: File[] = []

  if (payload.cambridgeLevel !== 'c2') {
    return { payload, merged: false, notes, extraMediaFiles }
  }

  const part8File = findCpePart8ImageFile(mediaFiles)
  const part9File = findCpePart9ImageFile(mediaFiles)

  if (!part8File && !part9File) {
    return { payload, merged: false, notes, extraMediaFiles }
  }

  const next: ReadingImportPayload = {
    ...payload,
    durationMinutes: Math.max(payload.durationMinutes, 120),
    bandHint: payload.bandHint?.includes('Writing')
      ? payload.bandHint
      : payload.bandHint?.replace(/Reading/, 'Reading & Writing')
        ?? 'C2 Proficiency Reading & Writing',
    parts: [...payload.parts],
  }

  let merged = false

  if (part8File) {
    const imageFile = normalizeFileKey(part8File.name)
    const p8 = next.parts.find(p => p.partNumber === 8)
    if (p8) {
      p8.passage = [{ imageFile }]
      notes.push(`Part 8: cập nhật ảnh ${imageFile}`)
    } else {
      next.parts.push(buildCpePart8Json(imageFile))
      notes.push(`Part 8: ảnh ${imageFile}`)
    }
    extraMediaFiles.push(part8File)
    merged = true
  }

  if (part9File) {
    const imageFile = normalizeFileKey(part9File.name)
    const p9 = next.parts.find(p => p.partNumber === 9)
    if (p9) {
      p9.passage = [{ imageFile }]
      notes.push(`Part 9: cập nhật ảnh ${imageFile}`)
    } else {
      next.parts.push(buildCpePart9Json(imageFile))
      notes.push(`Part 9: ảnh ${imageFile}`)
    }
    extraMediaFiles.push(part9File)
    merged = true
  }

  next.parts.sort((a, b) => a.partNumber - b.partNumber)

  return { payload: next, merged, notes, extraMediaFiles }
}

export const CPE_WRITING_IMAGE_HINT =
  'part8-page.jpg|.webp (đề Part 8 Q1) + part9-page.jpg|.webp (đề Part 9 Q2–4)'