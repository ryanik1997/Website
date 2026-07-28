import type { ReadingPart } from './examData'
import type { HighlightTextBlock } from './examAiEvidence'

/**
 * Block IDs gần đúng với KetRwPartContent / RwMcRadioQuestion / gap segments
 * để tô cam bằng chứng AI trên đề Cambridge RW.
 */
export function buildCambridgeRwEvidenceBlocks(part: ReadingPart | null | undefined): HighlightTextBlock[] {
  if (!part) return []
  const partId = part.id
  const blocks: HighlightTextBlock[] = []

  if (part.passageTitle?.trim()) {
    blocks.push({ blockId: `${partId}-title`, text: part.passageTitle })
  }
  if (part.passageSubtitle?.trim()) {
    blocks.push({ blockId: `${partId}-subtitle`, text: part.passageSubtitle })
  }

  part.passage.forEach((block, idx) => {
    if (block.label?.trim()) {
      blocks.push({ blockId: `${partId}-lbl-${idx}`, text: block.label })
      blocks.push({ blockId: `${partId}-hdr-${idx}`, text: block.label })
    }
    if (block.text?.trim()) {
      blocks.push({ blockId: `${partId}-txt-${idx}`, text: block.text })
      blocks.push({ blockId: `${partId}-sign`, text: block.text })
      // gap segments: full text also tried as single segment 0
      blocks.push({ blockId: `${partId}-passage-seg-0`, text: block.text })
      blocks.push({ blockId: `${partId}-body-seg-0`, text: block.text })
    }
  })

  for (const group of part.questionGroups) {
    for (const q of group.questions) {
      if (q.prompt?.trim()) {
        blocks.push({ blockId: `${partId}-q-${q.id}-prompt`, text: q.prompt })
        blocks.push({ blockId: `${partId}-wq-prompt`, text: q.prompt })
      }
      for (const opt of q.options ?? []) {
        if (opt.label?.trim()) {
          blocks.push({
            blockId: `${partId}-q-${q.id}-opt-${opt.id}`,
            text: opt.label,
          })
        }
      }
    }
  }

  return blocks.filter(b => b.text.trim().length > 0)
}
