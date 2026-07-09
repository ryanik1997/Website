import type { ReadingPart } from './examData'
import { formatPassageTextForDisplay } from './readingGapDisplay'
import type { HighlightTextBlock } from './examAiEvidence'

/** Block IDs khớp ReadingPassagePanel (`passage-p-${index}`). */
export function buildReadingPassageHighlightBlocks(
  part: ReadingPart | null | undefined,
  cambridgeLevel?: string,
): HighlightTextBlock[] {
  if (!part?.passage?.length) return []
  return part.passage
    .map((block, index) => ({
      blockId: `passage-p-${index}`,
      text: formatPassageTextForDisplay(block.text ?? '', part, cambridgeLevel),
    }))
    .filter(b => b.text.trim().length > 0)
}
