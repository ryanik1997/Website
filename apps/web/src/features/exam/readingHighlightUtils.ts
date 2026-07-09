export const EXAM_HIGHLIGHT_ZONE_SELECTOR = '[data-exam-highlight-zone], [data-reading-highlight-zone]'

export function isInExamHighlightZone(el: Element | null | undefined): boolean {
  return Boolean(el?.closest(EXAM_HIGHLIGHT_ZONE_SELECTOR))
}

export type ReadingHighlightKind = 'user' | 'evidence'

export interface ReadingHighlight {
  id: string
  blockId: string
  start: number
  end: number
  /** user = tô vàng thủ công; evidence = AI chỉ đoạn đáp án (cam) */
  kind?: ReadingHighlightKind
}

export interface TextNote {
  id: string
  blockId: string
  start: number
  end: number
  text: string
}

export interface TextAnnotationSegment {
  text: string
  highlighted: boolean
  /** true khi đoạn thuộc bằng chứng AI (cam) */
  evidence?: boolean
  note?: string
}

export interface HighlightRange {
  blockId: string
  start: number
  end: number
}

export function newHighlightId(): string {
  return `hl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function newNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function mergeRanges(ranges: { start: number; end: number }[]): { start: number; end: number }[] {
  if (ranges.length === 0) return []
  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  const merged = [{ ...sorted[0] }]
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1]
    const cur = sorted[i]
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end)
    } else {
      merged.push({ ...cur })
    }
  }
  return merged
}

function collectBlockBreakpoints(
  textLength: number,
  blockId: string,
  highlights: ReadingHighlight[],
  notes: TextNote[],
): number[] {
  const points = new Set<number>([0, textLength])
  for (const h of highlights) {
    if (h.blockId !== blockId || h.start >= h.end) continue
    points.add(Math.max(0, h.start))
    points.add(Math.min(textLength, h.end))
  }
  for (const n of notes) {
    if (n.blockId !== blockId || n.start >= n.end) continue
    points.add(Math.max(0, n.start))
    points.add(Math.min(textLength, n.end))
  }
  return [...points].sort((a, b) => a - b)
}

export function segmentsFromAnnotations(
  text: string | undefined,
  highlights: ReadingHighlight[],
  notes: TextNote[],
  blockId: string,
): TextAnnotationSegment[] {
  const safeText = text ?? ''
  const len = safeText.length
  if (len === 0) return [{ text: '', highlighted: false }]

  const sorted = collectBlockBreakpoints(len, blockId, highlights, notes)
  const segments: TextAnnotationSegment[] = []

  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i]
    const end = sorted[i + 1]
    if (start >= end) continue

    const overlapping = highlights.filter(h =>
      h.blockId === blockId && h.start < end && h.end > start,
    )
    const highlighted = overlapping.length > 0
    const evidence = overlapping.some(h => h.kind === 'evidence')
    const overlappingNote = notes.find(n =>
      n.blockId === blockId && n.start < end && n.end > start && n.text.trim(),
    )

    segments.push({
      text: safeText.slice(start, end),
      highlighted,
      evidence: evidence || undefined,
      note: overlappingNote?.text,
    })
  }

  return segments.length > 0 ? segments : [{ text: safeText, highlighted: false }]
}

export function segmentsFromHighlights(
  text: string,
  highlights: ReadingHighlight[],
  blockId: string,
): { text: string; highlighted: boolean }[] {
  const ranges = mergeRanges(
    highlights
      .filter(h => h.blockId === blockId)
      .map(h => ({ start: h.start, end: h.end }))
      .filter(r => r.start < r.end && r.start >= 0 && r.end <= text.length),
  )

  if (ranges.length === 0) return [{ text, highlighted: false }]

  const segments: { text: string; highlighted: boolean }[] = []
  let pos = 0
  for (const range of ranges) {
    if (range.start > pos) {
      segments.push({ text: text.slice(pos, range.start), highlighted: false })
    }
    if (range.end > range.start) {
      segments.push({ text: text.slice(range.start, range.end), highlighted: true })
    }
    pos = range.end
  }
  if (pos < text.length) {
    segments.push({ text: text.slice(pos), highlighted: false })
  }
  return segments
}

function subtractRange(
  ranges: { start: number; end: number }[],
  remove: { start: number; end: number },
): { start: number; end: number }[] {
  const result: { start: number; end: number }[] = []
  for (const r of ranges) {
    if (remove.end <= r.start || remove.start >= r.end) {
      result.push(r)
      continue
    }
    if (remove.start > r.start) {
      result.push({ start: r.start, end: remove.start })
    }
    if (remove.end < r.end) {
      result.push({ start: remove.end, end: r.end })
    }
  }
  return result
}

function rangesToHighlights(byBlock: Map<string, { start: number; end: number }[]>): ReadingHighlight[] {
  const result: ReadingHighlight[] = []
  for (const [blockId, ranges] of byBlock) {
    for (const range of mergeRanges(ranges)) {
      if (range.start >= range.end) continue
      result.push({
        id: newHighlightId(),
        blockId,
        start: range.start,
        end: range.end,
      })
    }
  }
  return result.sort((a, b) => a.blockId.localeCompare(b.blockId) || a.start - b.start)
}

export function addHighlights(
  existing: ReadingHighlight[],
  newRanges: HighlightRange[],
): ReadingHighlight[] {
  const byBlock = new Map<string, { start: number; end: number }[]>()

  for (const h of existing) {
    const list = byBlock.get(h.blockId) ?? []
    list.push({ start: h.start, end: h.end })
    byBlock.set(h.blockId, list)
  }

  for (const r of newRanges) {
    if (r.start >= r.end) continue
    const list = byBlock.get(r.blockId) ?? []
    list.push({ start: r.start, end: r.end })
    byBlock.set(r.blockId, list)
  }

  return rangesToHighlights(byBlock)
}

export function removeHighlights(
  existing: ReadingHighlight[],
  removeRanges: HighlightRange[],
): ReadingHighlight[] {
  const byBlock = new Map<string, { start: number; end: number }[]>()

  for (const h of existing) {
    const list = byBlock.get(h.blockId) ?? []
    list.push({ start: h.start, end: h.end })
    byBlock.set(h.blockId, list)
  }

  for (const remove of removeRanges) {
    if (remove.start >= remove.end) continue
    const list = byBlock.get(remove.blockId) ?? []
    const next = subtractRange(list, remove)
    byBlock.set(remove.blockId, next)
  }

  return rangesToHighlights(byBlock)
}

function isSkippedNode(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false
  return (node as HTMLElement).hasAttribute('data-highlight-skip')
}

function nodeTextLength(node: Node): number {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.length ?? 0
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return 0
  if (isSkippedNode(node)) return 0
  let len = 0
  for (const child of Array.from(node.childNodes)) {
    len += nodeTextLength(child)
  }
  return len
}

export function getBlockTextLength(blockEl: HTMLElement): number {
  let len = 0
  for (const child of Array.from(blockEl.childNodes)) {
    len += nodeTextLength(child)
  }
  return len
}

function findBlockEl(node: Node | null): HTMLElement | null {
  const el = node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null)
  return el?.closest<HTMLElement>('[data-highlight-block]') ?? null
}

function getTextOffsetInBlock(
  blockEl: HTMLElement,
  targetNode: Node,
  targetOffset: number,
): number | null {
  let charOffset = 0
  let found: number | null = null

  const walk = (node: Node): void => {
    if (found !== null) return
    if (isSkippedNode(node)) return

    if (node === targetNode) {
      if (node.nodeType === Node.TEXT_NODE) {
        found = charOffset + targetOffset
        return
      }
      for (let i = 0; i < targetOffset; i++) {
        charOffset += nodeTextLength(node.childNodes[i])
      }
      found = charOffset
      return
    }

    if (node.nodeType === Node.TEXT_NODE) {
      charOffset += node.textContent?.length ?? 0
      return
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      for (const child of Array.from(node.childNodes)) {
        walk(child)
        if (found !== null) return
      }
    }
  }

  for (const child of Array.from(blockEl.childNodes)) {
    walk(child)
    if (found !== null) return found
  }

  return null
}

export function selectionToHighlightRanges(
  selection: Selection,
  root: HTMLElement,
): HighlightRange[] | null {
  if (!selection.rangeCount || selection.isCollapsed) return null

  const text = selection.toString().trim()
  if (!text) return null

  const anchorEl = selection.anchorNode?.parentElement
  const focusEl = selection.focusNode?.parentElement
  if (!isInExamHighlightZone(anchorEl) || !isInExamHighlightZone(focusEl)) {
    return null
  }
  if (!root.contains(anchorEl ?? null) || !root.contains(focusEl ?? null)) return null

  const range = selection.getRangeAt(0)
  const startBlock = findBlockEl(range.startContainer)
  const endBlock = findBlockEl(range.endContainer)
  if (!startBlock || !endBlock) return null

  const startBlockId = startBlock.dataset.blockId
  const endBlockId = endBlock.dataset.blockId
  if (!startBlockId || !endBlockId) return null

  const startOffset = getTextOffsetInBlock(startBlock, range.startContainer, range.startOffset)
  const endOffset = getTextOffsetInBlock(endBlock, range.endContainer, range.endOffset)
  if (startOffset === null || endOffset === null) return null

  if (startBlockId === endBlockId) {
    const lo = Math.min(startOffset, endOffset)
    const hi = Math.max(startOffset, endOffset)
    if (lo >= hi) return null
    return [{ blockId: startBlockId, start: lo, end: hi }]
  }

  const allBlocks = Array.from(root.querySelectorAll<HTMLElement>('[data-highlight-block]'))
  const startIdx = allBlocks.indexOf(startBlock)
  const endIdx = allBlocks.indexOf(endBlock)
  if (startIdx === -1 || endIdx === -1) return null

  const loIdx = Math.min(startIdx, endIdx)
  const hiIdx = Math.max(startIdx, endIdx)
  const loOffset = startIdx <= endIdx ? startOffset : endOffset
  const hiOffset = startIdx <= endIdx ? endOffset : startOffset

  const results: HighlightRange[] = []

  const firstBlock = allBlocks[loIdx]
  const firstLen = getBlockTextLength(firstBlock)
  if (loOffset < firstLen) {
    results.push({ blockId: firstBlock.dataset.blockId!, start: loOffset, end: firstLen })
  }

  for (let i = loIdx + 1; i < hiIdx; i++) {
    const block = allBlocks[i]
    const len = getBlockTextLength(block)
    if (len > 0) {
      results.push({ blockId: block.dataset.blockId!, start: 0, end: len })
    }
  }

  if (hiOffset > 0) {
    const lastBlock = allBlocks[hiIdx]
    results.push({ blockId: lastBlock.dataset.blockId!, start: 0, end: hiOffset })
  }

  return results.length > 0 ? results : null
}

export function selectionOverlapsHighlight(
  selection: Selection,
  root: HTMLElement,
  highlights: ReadingHighlight[],
): boolean {
  return selectionOverlapsRanges(selection, root, highlights.map(h => ({
    blockId: h.blockId,
    start: h.start,
    end: h.end,
  })))
}

export function selectionOverlapsRanges(
  selection: Selection,
  root: HTMLElement,
  ranges: HighlightRange[],
): boolean {
  const selected = selectionToHighlightRanges(selection, root)
  if (!selected) return false

  return selected.some(range =>
    ranges.some(r =>
      r.blockId === range.blockId
      && r.start < range.end
      && r.end > range.start,
    ),
  )
}

export function findNotesOverlappingRanges(
  notes: TextNote[],
  ranges: HighlightRange[],
): TextNote[] {
  return notes.filter(note =>
    ranges.some(range =>
      note.blockId === range.blockId
      && note.start < range.end
      && note.end > range.start,
    ),
  )
}

export function upsertNotesForRanges(
  existing: TextNote[],
  ranges: HighlightRange[],
  text: string,
): TextNote[] {
  const trimmed = text.trim()
  const withoutOverlap = removeNotesInRanges(existing, ranges)

  if (!trimmed) return withoutOverlap

  const next = [...withoutOverlap]
  for (const range of ranges) {
    if (range.start >= range.end) continue
    next.push({
      id: newNoteId(),
      blockId: range.blockId,
      start: range.start,
      end: range.end,
      text: trimmed,
    })
  }
  return next.sort((a, b) => a.blockId.localeCompare(b.blockId) || a.start - b.start)
}

export function removeNotesInRanges(
  existing: TextNote[],
  removeRanges: HighlightRange[],
): TextNote[] {
  return existing.filter(note =>
    !removeRanges.some(range =>
      note.blockId === range.blockId
      && note.start < range.end
      && note.end > range.start,
    ),
  )
}