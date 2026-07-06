import type { ReadingImportPartJson, ReadingImportPayload } from './importReadingManualUtils'

const IMAGE_EXT = /\.(jpg|jpeg|png|webp)$/i

function normalizeFileKey(name: string): string {
  return name.trim().toLowerCase().replace(/\\/g, '/').split('/').pop() ?? name
}

export function isFceWritingImageFile(file: File): boolean {
  return IMAGE_EXT.test(normalizeFileKey(file.name))
}

export function findFcePart8ImageFile(files: File[]): File | null {
  const preferred = ['part8-page.jpg', 'part8.jpg', 'part8-prompt.jpg']
  for (const name of preferred) {
    const hit = files.find(f => normalizeFileKey(f.name) === name)
    if (hit) return hit
  }
  return files.find(f => /^part8[-_]/i.test(normalizeFileKey(f.name))) ?? null
}

export function findFcePart9ImageFile(files: File[]): File | null {
  const preferred = ['part9-page.jpg', 'part9.jpg', 'part9-prompt.jpg']
  for (const name of preferred) {
    const hit = files.find(f => normalizeFileKey(f.name) === name)
    if (hit) return hit
  }
  return files.find(f => /^part9[-_]/i.test(normalizeFileKey(f.name))) ?? null
}

export function buildFcePart8Json(imageFile?: string): ReadingImportPartJson {
  const passage = imageFile
    ? [{ imageFile }]
    : [{ text: 'Write your answer in the box on the right.' }]

  return {
    partNumber: 8,
    rangeLabel: 'Question 53',
    passageTitle: 'Writing Part 8',
    passage,
    questionGroups: [{
      range: 'Question 53',
      instruction: 'Write 140–190 words.',
      type: 'sentence-completion',
      questions: [{
        number: 53,
        type: 'writing-task',
        prompt: 'Write your answer in the box on the right.',
        options: [],
        answer: '',
        minWords: 140,
        explanation: 'Writing — chấm bằng AI.',
      }],
    }],
  }
}

export function buildFcePart9Json(imageFile?: string): ReadingImportPartJson {
  const passage = imageFile
    ? [{ imageFile }]
    : [{ imageFile: 'part9-page.jpg' }]

  return {
    partNumber: 9,
    rangeLabel: 'Question 54',
    passageTitle: 'Writing Part 9',
    passage,
    questionGroups: [{
      range: 'Question 54',
      instruction: 'Write 140–190 words.',
      type: 'sentence-completion',
      questions: [{
        number: 54,
        type: 'writing-task',
        prompt: 'Look at the picture. Write the story shown in the picture. Write 140–190 words.',
        options: [],
        answer: '',
        minWords: 140,
        explanation: 'Writing — chấm bằng AI.',
      }],
    }],
  }
}

export interface FceWritingMergeResult {
  payload: ReadingImportPayload
  merged: boolean
  notes: string[]
  extraMediaFiles: File[]
}

/** Gắn Part 8–9 (+ ảnh) vào payload FCE B2. */
export function mergeFceWritingImagesIntoPayload(
  payload: ReadingImportPayload,
  mediaFiles: File[],
): FceWritingMergeResult {
  const notes: string[] = []
  const extraMediaFiles: File[] = []

  if (payload.cambridgeLevel !== 'b2' && payload.examTrack !== 'cambridge') {
    return { payload, merged: false, notes, extraMediaFiles }
  }

  const part8File = findFcePart8ImageFile(mediaFiles)
  const part9File = findFcePart9ImageFile(mediaFiles)

  if (!part8File && !part9File) {
    return { payload, merged: false, notes, extraMediaFiles }
  }

  const next: ReadingImportPayload = {
    ...payload,
    durationMinutes: Math.max(payload.durationMinutes, 80),
    bandHint: payload.bandHint?.includes('Writing')
      ? payload.bandHint
      : payload.bandHint?.replace(/Reading/, 'Reading & Writing')
        ?? 'B2 First Reading & Writing',
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
      next.parts.push(buildFcePart8Json(imageFile))
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
      notes.push(`Part 9: cập nhật 1 ảnh ${imageFile}`)
    } else {
      next.parts.push(buildFcePart9Json(imageFile))
      notes.push(`Part 9: ảnh ${imageFile}`)
    }
    extraMediaFiles.push(part9File)
    merged = true
  }

  next.parts.sort((a, b) => a.partNumber - b.partNumber)

  return { payload: next, merged, notes, extraMediaFiles }
}

export const FCE_WRITING_IMAGE_HINT = 'part8-page.jpg (đề Part 8) + part9-page.jpg (1 ảnh truyện Part 9)'