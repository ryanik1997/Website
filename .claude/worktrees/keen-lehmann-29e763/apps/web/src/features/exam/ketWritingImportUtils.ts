import type { ReadingImportPartJson, ReadingImportPayload } from './importReadingManualUtils'
import {
  findImportImageByStems,
  isExamImportImageFile,
  normalizeImportFileKey,
} from './examImportImageFormats'

function normalizeFileKey(name: string): string {
  return normalizeImportFileKey(name)
}

export function isKetWritingImageFile(file: File): boolean {
  return isExamImportImageFile(file)
}

export function findKetPart6ImageFile(files: File[]): File | null {
  return findImportImageByStems(
    files,
    ['part6-page', 'part6', 'part6-prompt'],
    /^part6[-_]/i,
  )
}

/**
 * Part 7 Writing: **1 ảnh** `part7-page.jpg|.webp` (toàn trang / 3 khung trong 1 file).
 * Không còn part7-p1…p3.
 */
export function findKetPart7ImageFile(files: File[]): File | null {
  return findImportImageByStems(
    files,
    ['part7-page', 'part7'],
    /^part7([-_]page)?\./i,
  )
}

/** @deprecated Dùng findKetPart7ImageFile — giữ alias mảng 0|1 phần tử cho UI cũ. */
export function findKetPart7ImageFiles(files: File[]): File[] {
  const f = findKetPart7ImageFile(files)
  return f ? [f] : []
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

export function buildKetPart7Json(imageFile?: string): ReadingImportPartJson {
  const passage = imageFile
    ? [{ imageFile }]
    : [{ imageFile: 'part7-page.jpg' }]

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
  const part7File = findKetPart7ImageFile(mediaFiles)

  if (!part6File && !part7File) {
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

  if (part7File) {
    const imageFile = normalizeFileKey(part7File.name)
    next.parts.push(buildKetPart7Json(imageFile))
    extraMediaFiles.push(part7File)
    notes.push(`Part 7: ảnh ${imageFile}`)
    merged = true
  } else if (!next.parts.some(p => p.partNumber === 7)) {
    notes.push('Part 7: chưa có ảnh (part7-page.jpg).')
  }

  next.parts.sort((a, b) => a.partNumber - b.partNumber)

  return { payload: next, merged, notes, extraMediaFiles }
}

export const KET_WRITING_IMAGE_HINT =
  'part6-page.jpg|.webp (đề Part 6) + part7-page.jpg|.webp (1 ảnh truyện / 3 khung)'