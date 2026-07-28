import { audioRepo } from '@ryan/db'
import type { ReadingPdfExamFormat } from '@ryan/core'
import type { ReadingPart } from './examData'
import type { PdfPageContent } from './pdfContent'
import { readingExamMediaKey } from './importReadingManualUtils'

export const MIN_PASSAGE_TEXT_CHARS = 80

const KET_PART_MARKERS: Record<number, RegExp[]> = {
  1: [/\bpart\s*1\b/i, /\bquestions?\s*1\s*[–\-—]/i],
  2: [/\bpart\s*2\b/i, /\bquestions?\s*7\s*[–\-—]/i],
  3: [/\bpart\s*3\b/i, /\bquestions?\s*14\s*[–\-—]/i],
  4: [/\bpart\s*4\b/i, /\bquestions?\s*19\s*[–\-—]/i],
  5: [/\bpart\s*5\b/i, /\bquestions?\s*25\s*[–\-—]/i],
}

const PET_PART_MARKERS: Record<number, RegExp[]> = {
  1: [/\bpart\s*1\b/i, /\bquestions?\s*1\s*[–\-—]/i],
  2: [/\bpart\s*2\b/i, /\bquestions?\s*6\s*[–\-—]/i],
  3: [/\bpart\s*3\b/i, /\bquestions?\s*11\s*[–\-—]/i],
  4: [/\bpart\s*4\b/i, /\bquestions?\s*16\s*[–\-—]/i],
  5: [/\bpart\s*5\b/i, /\bquestions?\s*21\s*[–\-—]/i],
  6: [/\bpart\s*6\b/i, /\bquestions?\s*27\s*[–\-—]/i],
}

function isAnswerKeyPage(text: string, pageNum: number, totalPages: number): boolean {
  const lower = text.toLowerCase()
  if (/\b(answer\s*key|answers|đáp\s*án|answer\s*sheet)\b/i.test(lower)) return true
  if (pageNum >= totalPages - 1 && /\b\d{1,2}\s*[a-d]\b/i.test(lower) && lower.length < 600) {
    return true
  }
  return false
}

function isWritingPage(text: string): boolean {
  return /\bwriting\b.*\bpart\s*[67]\b/i.test(text)
    || /\bpart\s*[67]\b.*\bwriting\b/i.test(text)
}

function findPartStartPages(
  pages: PdfPageContent[],
  markers: Record<number, RegExp[]>,
  maxPart: number,
): Map<number, number> {
  const starts = new Map<number, number>()
  for (const page of pages) {
    for (let part = 1; part <= maxPart; part += 1) {
      if (starts.has(part)) continue
      const patterns = markers[part] ?? []
      if (patterns.some(re => re.test(page.text))) {
        starts.set(part, page.pageNum)
      }
    }
  }
  return starts
}

function fallbackEqualSplit(pageNums: number[], partCount: number): Map<number, number[]> {
  const map = new Map<number, number[]>()
  if (!pageNums.length) return map
  const perPart = Math.max(1, Math.ceil(pageNums.length / partCount))
  for (let part = 1; part <= partCount; part += 1) {
    const slice = pageNums.slice((part - 1) * perPart, part * perPart)
    if (slice.length) map.set(part, slice)
  }
  return map
}

export function detectPartPageRanges(
  pages: PdfPageContent[],
  format: ReadingPdfExamFormat,
): Map<number, number[]> {
  const maxPart = format === 'ket-a2' ? 5 : format === 'pet-b1' ? 6 : 3
  const markers = format === 'ket-a2'
    ? KET_PART_MARKERS
    : format === 'pet-b1'
      ? PET_PART_MARKERS
      : null

  const contentPages = pages.filter(page => {
    if (!page.dataUrl) return false
    if (isAnswerKeyPage(page.text, page.pageNum, pages.length)) return false
    if (format !== 'ielts' && isWritingPage(page.text)) return false
    return true
  })

  const pageNums = contentPages.map(p => p.pageNum)
  if (!markers) {
    return fallbackEqualSplit(pageNums, maxPart)
  }

  const starts = findPartStartPages(contentPages, markers, maxPart)
  if (starts.size === 0) {
    return fallbackEqualSplit(pageNums, maxPart)
  }

  const sortedParts = [...starts.entries()].sort((a, b) => a[1] - b[1])
  const ranges = new Map<number, number[]>()

  for (let i = 0; i < sortedParts.length; i += 1) {
    const [part, startPage] = sortedParts[i]
    const nextStart = sortedParts[i + 1]?.[1]
    const endPage = nextStart != null ? nextStart - 1 : pageNums[pageNums.length - 1]
    const assigned = pageNums.filter(n => n >= startPage && n <= endPage)
    if (assigned.length) ranges.set(part, assigned)
  }

  const unassigned = pageNums.filter(n => ![...ranges.values()].flat().includes(n))
  if (unassigned.length && !ranges.has(1)) {
    ranges.set(1, [...(ranges.get(1) ?? []), ...unassigned])
  }

  return ranges
}

export function passageTextLength(part: ReadingPart): number {
  return part.passage.reduce((sum, block) => sum + (block.text?.trim().length ?? 0), 0)
}

export function partHasPassageImages(part: ReadingPart): boolean {
  return part.passage.some(block => Boolean(block.imageKey || block.imageUrl))
}

export function needsPassageImageFallback(part: ReadingPart): boolean {
  return passageTextLength(part) < MIN_PASSAGE_TEXT_CHARS && !partHasPassageImages(part)
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}

export async function savePdfPageImages(
  examId: string,
  pages: PdfPageContent[],
): Promise<Map<number, string>> {
  const keys = new Map<number, string>()
  for (const page of pages) {
    if (!page.dataUrl) continue
    const key = readingExamMediaKey(examId, `page-${page.pageNum}`)
    await audioRepo.put(key, dataUrlToBlob(page.dataUrl))
    keys.set(page.pageNum, key)
  }
  return keys
}

export function attachPageImagesToParts(
  parts: ReadingPart[],
  pageKeys: Map<number, string>,
  partPageRanges: Map<number, number[]>,
  options?: {
    format?: ReadingPdfExamFormat
    forcePart1Images?: boolean
  },
): ReadingPart[] {
  const { format, forcePart1Images } = options ?? {}

  return parts.map(part => {
    const pageNums = partPageRanges.get(part.partNumber) ?? []
    const isKetPart1 = format === 'ket-a2' && part.partNumber === 1
    const shouldAttach = needsPassageImageFallback(part)
      || (forcePart1Images && isKetPart1 && pageNums.length > 0)

    if (!shouldAttach || pageNums.length === 0) return part

    const imageBlocks = pageNums
      .filter(pageNum => pageKeys.has(pageNum))
      .map(pageNum => ({
        text: '',
        imageKey: pageKeys.get(pageNum)!,
      }))

    if (!imageBlocks.length) return part

    const existingImages = part.passage.filter(b => b.imageKey || b.imageUrl)
    const existingText = part.passage.filter(b => b.text?.trim())

    return {
      ...part,
      passage: [...imageBlocks, ...existingImages, ...existingText],
    }
  })
}

export function shouldPreservePdfPageImages(format: ReadingPdfExamFormat): boolean {
  return format === 'ket-a2' || format === 'pet-b1'
}

export function countPartsWithImageFallback(parts: ReadingPart[]): number {
  return parts.filter(needsPassageImageFallback).length
}