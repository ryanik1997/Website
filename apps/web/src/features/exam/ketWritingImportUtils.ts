import type { ReadingImportPartJson, ReadingImportPayload } from './importReadingManualUtils'

const IMAGE_EXT = /\.(jpg|jpeg|png|webp)$/i

function normalizeFileKey(name: string): string {
  return name.trim().toLowerCase().replace(/\\/g, '/').split('/').pop() ?? name
}

export function isKetWritingImageFile(file: File): boolean {
  return IMAGE_EXT.test(normalizeFileKey(file.name))
}

export function findKetPart6ImageFile(files: File[]): File | null {
  const preferred = ['part6-page.jpg', 'part6-page.jpeg', 'part6.jpg', 'part6.jpeg', 'part6-prompt.jpg']
  for (const name of preferred) {
    const hit = files.find(f => normalizeFileKey(f.name) === name)
    if (hit) return hit
  }
  return files.find(f => /^part6[-_]/i.test(normalizeFileKey(f.name))) ?? null
}

export function findKetPart7ImageFiles(files: File[]): File[] {
  const found: File[] = []
  for (let i = 1; i <= 3; i += 1) {
    const aliases = [
      `part7-p${i}.jpg`,
      `part7-p${i}.jpeg`,
      `part7-p${i}.png`,
      `part7-${i}.jpg`,
      `part7_${i}.jpg`,
    ]
    const hit = files.find(f => aliases.includes(normalizeFileKey(f.name)))
      ?? files.find(f => new RegExp(`^part7[-_]?p?${i}\\.(jpe?g|png|webp)$`, 'i').test(normalizeFileKey(f.name)))
    if (hit) found.push(hit)
  }
  return found
}

export function buildKetPart6Json(imageFile?: string): ReadingImportPartJson {
  const passage = imageFile
    ? [{ imageFile }]
    : [
      { text: 'You are going shopping with your English friend Pat tomorrow.' },
      {
        text: 'Write an email to Pat. Say:\n• where you want to meet\n• what time you want to meet\n• what you want to buy.',
      },
    ]

  return {
    partNumber: 6,
    rangeLabel: 'Question 31',
    passageTitle: 'Writing Part 6',
    passage,
    questionGroups: [{
      range: 'Question 31',
      instruction: 'Write 25 words or more.',
      type: 'sentence-completion',
      questions: [{
        number: 31,
        type: 'writing-task',
        prompt: 'Write your email in the box on the right.',
        options: [],
        answer: '',
        minWords: 25,
        explanation: 'Writing — chấm bằng AI.',
      }],
    }],
  }
}

export function buildKetPart7Json(imageFiles: string[]): ReadingImportPartJson {
  const passage = imageFiles.length > 0
    ? imageFiles.map(imageFile => ({ imageFile }))
    : [
      { imageFile: 'part7-p1.jpg' },
      { imageFile: 'part7-p2.jpg' },
      { imageFile: 'part7-p3.jpg' },
    ]

  return {
    partNumber: 7,
    rangeLabel: 'Question 32',
    passageTitle: 'Writing Part 7',
    passage,
    questionGroups: [{
      range: 'Question 32',
      instruction: 'Write 35 words or more.',
      type: 'sentence-completion',
      questions: [{
        number: 32,
        type: 'writing-task',
        prompt: 'Look at the three pictures. Write the story shown in the pictures. Write 35 words or more.',
        options: [],
        answer: '',
        minWords: 35,
        explanation: 'Writing — chấm bằng AI.',
      }],
    }],
  }
}

export function payloadHasKetWritingParts(payload: ReadingImportPayload): boolean {
  return payload.parts.some(p => p.partNumber === 6 || p.partNumber === 7)
}

export interface KetWritingMergeResult {
  payload: ReadingImportPayload
  merged: boolean
  notes: string[]
  extraMediaFiles: File[]
}

/** Gắn Part 6–7 vào payload 5-part khi user upload ảnh JPG. */
export function mergeKetWritingImagesIntoPayload(
  payload: ReadingImportPayload,
  mediaFiles: File[],
): KetWritingMergeResult {
  const notes: string[] = []
  const extraMediaFiles: File[] = []

  if (payload.cambridgeLevel !== 'a2' && payload.examTrack !== 'cambridge') {
    return { payload, merged: false, notes, extraMediaFiles }
  }

  const part6File = findKetPart6ImageFile(mediaFiles)
  const part7Files = findKetPart7ImageFiles(mediaFiles)

  if (!part6File && part7Files.length === 0) {
    return { payload, merged: false, notes, extraMediaFiles }
  }

  const next: ReadingImportPayload = {
    ...payload,
    durationMinutes: Math.max(payload.durationMinutes, 60),
    bandHint: payload.bandHint?.includes('Writing')
      ? payload.bandHint
      : payload.bandHint?.replace(/\bReading\b/, 'Reading & Writing')
        ?? 'A2 Key Reading & Writing',
    parts: payload.parts.filter(p => p.partNumber < 6),
  }

  let merged = false

  if (part6File) {
    const imageFile = normalizeFileKey(part6File.name)
    next.parts.push(buildKetPart6Json(imageFile))
    extraMediaFiles.push(part6File)
    notes.push(`Part 6: ảnh ${imageFile}`)
    merged = true
  } else if (!next.parts.some(p => p.partNumber === 6)) {
    notes.push('Part 6: chưa có ảnh (part6-page.jpg hoặc part6.jpg).')
  }

  if (part7Files.length >= 3) {
    const names = part7Files.map(f => normalizeFileKey(f.name))
    next.parts.push(buildKetPart7Json(names))
    extraMediaFiles.push(...part7Files)
    notes.push(`Part 7: ${names.join(', ')}`)
    merged = true
  } else if (part7Files.length > 0) {
    notes.push(`Part 7: cần đủ 3 ảnh (hiện có ${part7Files.length}/3 — part7-p1…p3.jpg).`)
  } else if (!next.parts.some(p => p.partNumber === 7)) {
    notes.push('Part 7: chưa có ảnh (part7-p1.jpg, part7-p2.jpg, part7-p3.jpg).')
  }

  next.parts.sort((a, b) => a.partNumber - b.partNumber)

  return { payload: next, merged, notes, extraMediaFiles }
}

export const KET_WRITING_IMAGE_HINT = 'part6-page.jpg (đề Part 6) + part7-p1.jpg … part7-p3.jpg (3 ảnh truyện)'