import type { ReadingImportPartJson, ReadingImportPayload } from './importReadingManualUtils'

const IMAGE_EXT = /\.(jpg|jpeg|png|webp)$/i

function normalizeFileKey(name: string): string {
  return name.trim().toLowerCase().replace(/\\/g, '/').split('/').pop() ?? name
}

export function isPetWritingImageFile(file: File): boolean {
  return IMAGE_EXT.test(normalizeFileKey(file.name))
}

export function findPetPart2PageImage(files: File[]): File | null {
  const preferred = ['part2-page.jpg', 'part2.jpg', 'part2-prompt.jpg']
  for (const name of preferred) {
    const hit = files.find(f => normalizeFileKey(f.name) === name)
    if (hit) return hit
  }
  return files.find(f => /^part2[-_]/i.test(normalizeFileKey(f.name))) ?? null
}

export function findPetPart4PageImage(files: File[]): File | null {
  const preferred = ['part4-page.jpg', 'part4.jpg', 'part4-prompt.jpg']
  for (const name of preferred) {
    const hit = files.find(f => normalizeFileKey(f.name) === name)
    if (hit) return hit
  }
  return files.find(f => /^part4[-_]/i.test(normalizeFileKey(f.name))) ?? null
}

export function findPetPart2PersonImages(files: File[]): File[] {
  const found: File[] = []
  for (let n = 6; n <= 10; n += 1) {
    const aliases = [`part2-q${n}.jpg`, `part2-q${n}.jpeg`, `part2-person${n}.jpg`]
    const hit = files.find(f => aliases.includes(normalizeFileKey(f.name)))
    if (hit) found.push(hit)
  }
  return found
}

export function findPetPart7ImageFile(files: File[]): File | null {
  const preferred = ['part7-page.jpg', 'part7.jpg', 'part7-prompt.jpg']
  for (const name of preferred) {
    const hit = files.find(f => normalizeFileKey(f.name) === name)
    if (hit) return hit
  }
  return files.find(f => /^part7[-_]/i.test(normalizeFileKey(f.name))) ?? null
}

export function findPetPart8ImageFile(files: File[]): File | null {
  const preferred = ['part8-page.jpg', 'part8.jpg', 'part8-prompt.jpg']
  for (const name of preferred) {
    const hit = files.find(f => normalizeFileKey(f.name) === name)
    if (hit) return hit
  }
  return files.find(f => /^part8[-_]/i.test(normalizeFileKey(f.name))) ?? null
}

export function buildPetPart7Json(imageFile?: string): ReadingImportPartJson {
  const passage = imageFile
    ? [{ imageFile }]
    : [{ text: 'Write your answer in the box.' }]

  return {
    partNumber: 7,
    rangeLabel: 'Question 33',
    passageTitle: 'Writing Part 7',
    passage,
    questionGroups: [{
      range: 'Question 33',
      instruction: 'Write 100 words or more.',
      type: 'sentence-completion',
      questions: [{
        number: 33,
        type: 'writing-task',
        prompt: 'Write your answer in the box on the right.',
        options: [],
        answer: '',
        minWords: 100,
        explanation: 'Writing — chấm bằng AI.',
      }],
    }],
  }
}

export function buildPetPart8Json(imageFile?: string): ReadingImportPartJson {
  const passage = imageFile
    ? [{ imageFile }]
    : [{ imageFile: 'part8-page.jpg' }]

  return {
    partNumber: 8,
    rangeLabel: 'Question 34',
    passageTitle: 'Writing Part 8',
    passage,
    questionGroups: [{
      range: 'Question 34',
      instruction: 'Write 100 words or more.',
      type: 'sentence-completion',
      questions: [{
        number: 34,
        type: 'writing-task',
        prompt: 'Look at the picture. Write the story shown in the picture. Write 100 words or more.',
        options: [],
        answer: '',
        minWords: 100,
        explanation: 'Writing — chấm bằng AI.',
      }],
    }],
  }
}

export interface PetWritingMergeResult {
  payload: ReadingImportPayload
  merged: boolean
  notes: string[]
  extraMediaFiles: File[]
}

/** Gắn Part 7–8 (+ ảnh Part 2/4 tuỳ chọn) vào payload PET. */
export function mergePetWritingImagesIntoPayload(
  payload: ReadingImportPayload,
  mediaFiles: File[],
): PetWritingMergeResult {
  const notes: string[] = []
  const extraMediaFiles: File[] = []

  if (payload.cambridgeLevel !== 'b1' && payload.examTrack !== 'cambridge') {
    return { payload, merged: false, notes, extraMediaFiles }
  }

  const part7File = findPetPart7ImageFile(mediaFiles)
  const part8File = findPetPart8ImageFile(mediaFiles)
  const part2Page = findPetPart2PageImage(mediaFiles)
  const part4Page = findPetPart4PageImage(mediaFiles)
  const part2People = findPetPart2PersonImages(mediaFiles)

  if (!part7File && !part8File && !part2Page && !part4Page && part2People.length === 0) {
    return { payload, merged: false, notes, extraMediaFiles }
  }

  const next: ReadingImportPayload = {
    ...payload,
    durationMinutes: Math.max(payload.durationMinutes, 45),
    bandHint: payload.bandHint?.includes('Writing')
      ? payload.bandHint
      : payload.bandHint?.replace(/\bReading\b/, 'Reading & Writing')
        ?? 'B1 Preliminary Reading & Writing',
    parts: [...payload.parts],
  }

  let merged = false

  if (part2Page) {
    const p2 = next.parts.find(p => p.partNumber === 2)
    if (p2) {
      const imageFile = normalizeFileKey(part2Page.name)
      p2.passage = [{ imageFile }, ...p2.passage.filter(b => b.text?.trim())]
      extraMediaFiles.push(part2Page)
      notes.push(`Part 2: ảnh layout ${imageFile}`)
      merged = true
    }
  }

  for (const file of part2People) {
    extraMediaFiles.push(file)
    notes.push(`Part 2: ảnh người ${normalizeFileKey(file.name)}`)
    merged = true
  }

  if (part4Page) {
    const p4 = next.parts.find(p => p.partNumber === 4)
    if (p4) {
      const imageFile = normalizeFileKey(part4Page.name)
      p4.passage = [{ imageFile }]
      extraMediaFiles.push(part4Page)
      notes.push(`Part 4: ảnh layout ${imageFile}`)
      merged = true
    }
  }

  const hasPart7 = next.parts.some(p => p.partNumber === 7)
  const hasPart8 = next.parts.some(p => p.partNumber === 8)

  if (part7File && !hasPart7) {
    const imageFile = normalizeFileKey(part7File.name)
    next.parts.push(buildPetPart7Json(imageFile))
    extraMediaFiles.push(part7File)
    notes.push(`Part 7: ảnh ${imageFile}`)
    merged = true
  }

  if (part8File) {
    const imageFile = normalizeFileKey(part8File.name)
    const p8 = next.parts.find(p => p.partNumber === 8)
    if (p8) {
      p8.passage = [{ imageFile }]
      notes.push(`Part 8: cập nhật 1 ảnh ${imageFile}`)
    } else {
      next.parts.push(buildPetPart8Json(imageFile))
      notes.push(`Part 8: ảnh ${imageFile}`)
    }
    extraMediaFiles.push(part8File)
    merged = true
  }

  next.parts.sort((a, b) => a.partNumber - b.partNumber)

  return { payload: next, merged, notes, extraMediaFiles }
}

export const PET_WRITING_IMAGE_HINT = 'part7-page.jpg (đề Part 7) + part8-page.jpg (1 ảnh truyện Part 8); tuỳ chọn part2-page.jpg, part2-q6…q10.jpg, part4-page.jpg'