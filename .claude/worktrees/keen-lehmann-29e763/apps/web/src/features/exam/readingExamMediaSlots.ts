import type { ReadingExamImageSlot } from './readingExamCloudImages'

export interface ParsedReadingMediaSlot {
  partNumber: number
  slot: ReadingExamImageSlot
  itemIndex?: number
}

const PLACEMENT_RE = /^part(\d+)-(top|bottom)\.(jpe?g|png|webp|gif)$/i
const PASSAGE_RE = /^part(\d+)-p(\d+)\.(jpe?g|png|webp|gif)$/i
const GROUP_RE = /^part(\d+)-group-(\d+)\.(jpe?g|png|webp|gif)$/i

/** Nhận diện tên file ảnh chuẩn: part1-top.jpg, part2-p0.png, part3-group-1.jpg */
export function parseReadingMediaFilename(filename: string): ParsedReadingMediaSlot | null {
  const key = filename.trim().toLowerCase().replace(/\\/g, '/').split('/').pop() ?? filename

  const placement = key.match(PLACEMENT_RE)
  if (placement) {
    return {
      partNumber: Number(placement[1]),
      slot: placement[2] as 'top' | 'bottom',
    }
  }

  const passage = key.match(PASSAGE_RE)
  if (passage) {
    return {
      partNumber: Number(passage[1]),
      slot: 'passage',
      itemIndex: Number(passage[2]),
    }
  }

  const group = key.match(GROUP_RE)
  if (group) {
    return {
      partNumber: Number(group[1]),
      slot: 'group',
      itemIndex: Number(group[2]),
    }
  }

  return null
}

export function resolvePlacementMediaFile(
  mediaMap: Map<string, File>,
  partNumber: number,
  slot: 'top' | 'bottom',
): File | null {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'gif']) {
    const file = mediaMap.get(`part${partNumber}-${slot}.${ext}`)
    if (file) return file
  }
  return null
}