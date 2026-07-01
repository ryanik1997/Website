import type { ReadingPassageBlock } from './examData'

export const REF_LETTERS = 'ABCDEFGH'

export function referenceLetter(label: string | undefined, index: number): string {
  const trimmed = label?.trim() ?? ''
  if (/^[A-H]$/i.test(trimmed)) return trimmed.toUpperCase()
  return REF_LETTERS[index] ?? String(index + 1)
}

/** Part 2: "Beckfield Market — description" */
export function isMarketLikeBlock(text: string): boolean {
  return /^.+\s*[—–-]\s+\S/.test(text.trim())
}

export function splitReferenceText(text: string, withTitle: boolean): { title?: string; body: string } {
  const trimmed = text.trim()
  if (!withTitle) return { body: trimmed }
  const match = trimmed.match(/^(.+?)\s*[—–-]\s+([\s\S]+)$/)
  if (match) return { title: match[1].trim(), body: match[2].trim() }
  return { body: trimmed }
}

export function resolveReferenceParts(
  block: ReadingPassageBlock,
  index: number,
  showMarketTitle: boolean,
): { letter: string; title?: string; body: string } {
  const letter = referenceLetter(block.label, index)
  const split = splitReferenceText(block.text ?? '', showMarketTitle)
  const label = block.label?.trim() ?? ''

  if (showMarketTitle && !split.title && label && !/^[A-H]$/i.test(label)) {
    return { letter, title: label, body: split.body }
  }

  return { letter, title: split.title, body: split.body }
}

function slotIndexForLetter(letter: string, count: number): number {
  const idx = REF_LETTERS.indexOf(letter.toUpperCase())
  return idx >= 0 && idx < count ? idx : -1
}

/** Gộp passage + features để luôn đủ A–H (Part 2/4 PET B1). */
export function buildB1ReferenceBlocks(
  passage: ReadingPassageBlock[],
  features: Array<{ id: string; name: string }>,
  partNumber: 2 | 4,
): ReadingPassageBlock[] {
  const count = 8
  const slots: Array<ReadingPassageBlock | null> = Array.from({ length: count }, () => null)

  const labeled = passage.filter(b => Boolean(b.label?.trim()))
  const unlabeled = passage.filter(b => !b.label?.trim() && Boolean(b.text?.trim()))

  for (let index = 0; index < labeled.length; index += 1) {
    const block = labeled[index]!
    const letter = referenceLetter(block.label, index)
    const slot = slotIndexForLetter(letter, count)
    if (slot >= 0 && !slots[slot]) slots[slot] = block
  }

  if (partNumber === 2) {
    for (const block of unlabeled.filter(b => isMarketLikeBlock(b.text ?? ''))) {
      const empty = slots.findIndex(s => s === null)
      if (empty < 0) break
      slots[empty] = { ...block, label: REF_LETTERS[empty] }
    }
  }

  if (partNumber === 4) {
    const isGappedPassage = (t: string) =>
      t === 'Sentences' || t === 'A new life' || /\(\d+\)\s*\.{2,}/.test(t)
    for (const block of unlabeled) {
      const t = (block.text ?? '').trim()
      if (!t || isGappedPassage(t)) continue
      const empty = slots.findIndex(s => s === null)
      if (empty < 0) break
      slots[empty] = { ...block, label: REF_LETTERS[empty] }
    }
  }

  for (let index = 0; index < features.length; index += 1) {
    const feature = features[index]!
    const letter = referenceLetter(feature.id, index)
    const slot = slotIndexForLetter(letter, count)
    if (slot < 0 || slots[slot]) continue
    slots[slot] = { label: letter, text: feature.name }
  }

  return slots.filter((b): b is ReadingPassageBlock => b !== null)
}

/** Intro / gapped text — không đưa vào danh sách A–H. */
export function getB1IntroPassageBlocks(
  passage: ReadingPassageBlock[],
  partNumber: 2 | 4,
): ReadingPassageBlock[] {
  return passage.filter(b => {
    if (b.label?.trim()) return false
    const t = b.text?.trim() ?? ''
    if (!t) return false
    if (partNumber === 2 && isMarketLikeBlock(t)) return false
    if (partNumber === 4) {
      const isGappedPassage = t === 'A new life' || /\(\d+\)\s*\.{2,}/.test(t)
      if (t !== 'Sentences' && !isGappedPassage && t.length < 320) return false
    }
    return true
  })
}