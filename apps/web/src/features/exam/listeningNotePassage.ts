import type {
  ListeningNotePassageBlock,
  ListeningNotePassageSection,
  ListeningNoteTable,
  ListeningQuestion,
} from './listeningExamData'

export function gapNumbersInNoteTable(table: ListeningNoteTable): number[] {
  const numbers: number[] = []
  for (const row of table.rows) {
    for (const cell of row.cells) {
      for (const block of cell) {
        if (block.type === 'gap' && typeof block.number === 'number') {
          numbers.push(block.number)
        }
      }
    }
  }
  return numbers
}

/** Bảng tương ứng một đoạn gap-fill (hỗ trợ nhiều bảng / Part — a4). */
export function noteTableForGapSegment(
  tables: ListeningNoteTable[] | undefined,
  singleTable: ListeningNoteTable | undefined,
  segmentQuestions: ListeningQuestion[],
): ListeningNoteTable | null {
  if (!segmentQuestions.length) return null

  const segmentNumbers = segmentQuestions.map(q => q.number)
  const segmentSet = new Set(segmentNumbers)

  const matchesSegment = (table: ListeningNoteTable) => {
    const gapNumbers = table.gapNumbers?.length
      ? table.gapNumbers
      : gapNumbersInNoteTable(table)
    if (!gapNumbers.length) return false
    const gapSet = new Set(gapNumbers)
    return segmentNumbers.every(n => gapSet.has(n))
      && gapNumbers.every(n => segmentSet.has(n))
  }

  if (tables?.length) {
    const match = tables.find(matchesSegment)
    if (match) return match
  }

  if (singleTable && matchesSegment(singleTable)) {
    return singleTable
  }

  return null
}

function gapNumbersInPassageBlocks(blocks: ListeningNotePassageBlock[]): number[] {
  return blocks
    .filter((block): block is ListeningNotePassageBlock & { number: number } =>
      block.type === 'gap' && typeof block.number === 'number')
    .map(block => block.number)
}

/** Khối notePassage section tương ứng một đoạn gap (c1/c2 Part 3). */
export function notePassageSectionForGapSegment(
  sections: ListeningNotePassageSection[] | undefined,
  segmentQuestions: ListeningQuestion[],
): ListeningNotePassageSection | null {
  if (!sections?.length || !segmentQuestions.length) return null

  const segmentNumbers = segmentQuestions.map(q => q.number)
  const segmentSet = new Set(segmentNumbers)

  const matchesSegment = (section: ListeningNotePassageSection) => {
    const gapNumbers = section.gapNumbers?.length
      ? section.gapNumbers
      : gapNumbersInPassageBlocks(section.blocks)
    if (!gapNumbers.length) return false
    const gapSet = new Set(gapNumbers)
    return segmentNumbers.every(n => gapSet.has(n))
      && gapNumbers.every(n => segmentSet.has(n))
  }

  return sections.find(matchesSegment) ?? null
}

/** Lấy khối notePassage tương ứng một đoạn gap-fill liên tiếp trong Part. */
export function notePassageForGapSegment(
  blocks: ListeningNotePassageBlock[],
  segmentQuestions: ListeningQuestion[],
): ListeningNotePassageBlock[] | null {
  if (!blocks.length || !segmentQuestions.length) return null

  const numSet = new Set(segmentQuestions.map(q => q.number))
  const gapIndices = blocks
    .map((block, index) => (block.type === 'gap' && block.number != null && numSet.has(block.number) ? index : -1))
    .filter(index => index >= 0)

  if (!gapIndices.length) return null

  const start = gapIndices.reduce((min, index) => {
    let cursor = index
    while (cursor > 0 && blocks[cursor - 1].type !== 'gap') cursor -= 1
    return Math.min(min, cursor)
  }, gapIndices[0])

  const end = gapIndices.reduce((max, index) => {
    let cursor = index
    while (cursor < blocks.length - 1 && blocks[cursor + 1].type !== 'gap') {
      cursor += 1
    }
    return Math.max(max, cursor)
  }, gapIndices[0])

  return blocks
    .slice(start, end + 1)
    .filter(block => block.type !== 'gap' || (block.number != null && numSet.has(block.number)))
}

export type NotePassageRenderLine =
  | { kind: 'section'; block: ListeningNotePassageBlock }
  | { kind: 'example'; block: ListeningNotePassageBlock }
  | { kind: 'inline'; blocks: ListeningNotePassageBlock[] }

/** Ký hiệu đầu dòng trong đề IELTS: • – + * ▪ · … (giữ nguyên như đề giấy). */
export const NOTE_LINE_MARKER_RE = /^[•‣▪◦○·*+–−\-►▸]\s*/

const NOTE_LINE_PRIMARY_MARKERS = new Set(['•', '‣', '▪', '◦', '○', '·', '*'])

export function hasNoteLineMarker(text: string): boolean {
  return NOTE_LINE_MARKER_RE.test(text.trimStart())
}

/** Phân cấp hiển thị: bullet chính (•) · sub (– + - …). */
export function noteLineMarkerKind(text: string): 'bullet' | 'sub' | '' {
  const trimmed = text.trimStart()
  if (!NOTE_LINE_MARKER_RE.test(trimmed)) return ''
  const marker = trimmed[0]
  return NOTE_LINE_PRIMARY_MARKERS.has(marker) ? 'bullet' : 'sub'
}

/** Nội dung dòng sau khi bỏ ký hiệu đầu dòng (hiển thị qua CSS ::before). */
export function noteLineBodyText(text: string): string {
  const leading = text.slice(0, text.length - text.trimStart().length)
  let stripped = text.trimStart()
  while (stripped && NOTE_LINE_MARKER_RE.test(stripped)) {
    stripped = stripped.replace(NOTE_LINE_MARKER_RE, '').trimStart()
  }
  return leading + stripped
}

function isBulletLineStart(text: string): boolean {
  return hasNoteLineMarker(text)
}

/** Static ngay sau gap, tiếp nối cùng câu trên đề giấy (vd. " the caring involves"). */
function isGapTrailBlock(
  block: ListeningNotePassageBlock,
  prevBlock: ListeningNotePassageBlock | undefined,
  nextBlock: ListeningNotePassageBlock | undefined,
): boolean {
  const stripped = (block.text ?? '').trim()
  return block.type === 'static'
    && prevBlock?.type === 'gap'
    && Boolean(stripped)
    && !hasNoteLineMarker(stripped)
    && nextBlock?.type !== 'gap'
    && !/^[A-Z]/.test(stripped)
}

function isGapLeadBlock(
  blocks: ListeningNotePassageBlock[],
  index: number,
): boolean {
  const block = blocks[index]
  const next = blocks[index + 1]
  return block?.type === 'static'
    && next?.type === 'gap'
    && !hasNoteLineMarker(block.text ?? '')
}

const GAP_TRAIL_START_RE =
  /^(of|in|at|the|a|an|from|were|was|is|are|issue|that|which|and|or|but|to|for|with|her|his|their|our|my|your|its|hair|licence|\)|,)\b/i

function gapLeadBefore(
  blocks: ListeningNotePassageBlock[],
  index: number,
): ListeningNotePassageBlock | undefined {
  if (index <= 0 || blocks[index - 1]?.type !== 'gap') return undefined
  let j = index - 2
  while (j >= 0 && blocks[j]?.type === 'gap') j -= 2
  return j >= 0 && blocks[j]?.type === 'static' ? blocks[j] : undefined
}

function isGapTrailAt(
  blocks: ListeningNotePassageBlock[],
  index: number,
): boolean {
  const block = blocks[index]
  const prev = blocks[index - 1]
  const next = blocks[index + 1]
  const stripped = bareNoteText(block?.text ?? '')
  if (block?.type !== 'static' || prev?.type !== 'gap' || !stripped) return false
  if (next?.type === 'gap') return false
  if (/^[A-Z]/.test(stripped)) return false
  if (NEW_LIST_AFTER_GAP_RE.test(stripped)) return false
  if (GAP_TRAIL_START_RE.test(stripped)) return true
  const lead = gapLeadBefore(blocks, index)
  if (lead) {
    const leadBare = bareNoteText(lead.text ?? '').trimEnd()
    if ((leadBare.endsWith(' a') || leadBare.endsWith(' an')) && !GAP_TRAIL_START_RE.test(stripped)) {
      return false
    }
  }
  return stripped.split(/\s+/).length <= 4
}

const SUBJECT_LIST_ITEM_RE =
  /^(Science|Geography|History|Music|Maths|English|Art|Biology|Chemistry|Physics|PE|Drama):\s/

const LIST_ITEM_START_RE =
  /^(do not|does not|did not|show|ignore|have|has|had|help|look|found|increase|effect|sleep|transport|any |what |how |why |when |where |will |need |can |may |should )/i

const NEW_LIST_AFTER_GAP_RE =
  /^(ignore|show|do not|have |has |help|look|found|increase|effect|sleep|transport|regard|plenty|some |will |need )/i

const INCOMPLETE_TRAIL_ENDINGS = [
  "'s", "'", '(', ',', ' the', ' a', ' an', ' of', ' in', ' with', ' for', ' to',
  ' and', ' or', ' on', ' at', ' by', ' from', ' their', ' her', ' his', ' our',
  ' your', ' my', ' its',
]

function stripNoteMarker(text: string): string {
  const leading = text.slice(0, text.length - text.trimStart().length)
  let stripped = text.trimStart()
  while (stripped && hasNoteLineMarker(stripped)) {
    stripped = stripped.replace(NOTE_LINE_MARKER_RE, '').trimStart()
  }
  return leading + stripped
}

function prevEndsIncomplete(text: string): boolean {
  const stripped = text.trimEnd()
  if (!stripped || '.!?'.includes(stripped.at(-1) ?? '')) return false
  const lower = stripped.toLowerCase()
  return INCOMPLETE_TRAIL_ENDINGS.some(end => lower.endsWith(end))
}

function isFormGapLabel(
  blocks: ListeningNotePassageBlock[],
  index: number,
  formStyle: boolean,
): boolean {
  if (!formStyle || index >= blocks.length - 1) return false
  if (blocks[index + 1]?.type !== 'gap') return false
  return isPureFormLabel(blocks[index]?.text ?? '')
}

function bareNoteText(text: string): string {
  return stripNoteMarker(text).trim()
}

function isNoteIntroLine(text: string): boolean {
  const trimmed = bareNoteText(text)
  if (!trimmed) return false
  const lower = trimmed.toLowerCase()
  if (lower.startsWith('example')) return true
  if (!trimmed.endsWith(':')) return false
  return (
    lower.includes('discussion of')
    || lower.includes('give the')
    || lower.includes('items stolen')
    || lower.includes('may include')
    || lower.includes('this can give')
  )
}

/** Dòng kết thúc ':' mà các mục sau là sub-bullet (–), không phải • chính. */
function colonIntroducesSubItems(text: string): boolean {
  const bare = bareNoteText(text)
  if (!bare.endsWith(':')) return false
  if (isNoteIntroLine(text)) return false
  return true
}

function colonIntroducesSubItemsAt(
  blocks: ListeningNotePassageBlock[],
  index: number,
): boolean {
  const text = blocks[index]?.text ?? ''
  if (!colonIntroducesSubItems(text)) return false
  const next = blocks[index + 1]
  if (next?.type === 'gap') {
    const label = bareNoteText(text).slice(0, -1).trim().toLowerCase()
    return label.includes('benefits') || label.includes('required') || label.includes('qualit')
  }
  return true
}

function isPureFormLabel(text: string): boolean {
  const stripped = bareNoteText(text)
  if (!/^[A-Z][A-Za-z '&/-]{0,40}:\s*$/.test(stripped)) return false
  const label = stripped.slice(0, -1).trim()
  return label.split(/\s+/).length <= 2
}

function isSubjectListItem(text: string): boolean {
  return SUBJECT_LIST_ITEM_RE.test(bareNoteText(text))
}

function isSameLineFormField(
  blocks: ListeningNotePassageBlock[],
  index: number,
): boolean {
  const stripped = bareNoteText(blocks[index]?.text ?? '')
  if (!/^[A-Z][^:]+:\s+.+$/.test(stripped)) return false
  if (blocks[index + 1]?.type === 'gap') return false
  return true
}

function isFormStylePassage(blocks: ListeningNotePassageBlock[]): boolean {
  const hasExample = blocks.some(block => block.type === 'example')
  const pureLabels = blocks.filter(
    block => block.type === 'static' && isPureFormLabel(block.text ?? ''),
  ).length
  const sameLineFields = blocks.filter(
    (_, index) => blocks[index]?.type === 'static' && isSameLineFormField(blocks, index),
  ).length
  return hasExample && (pureLabels >= 2 || sameLineFields >= 2)
}

function looksLikeProse(text: string): boolean {
  const stripped = bareNoteText(text)
  if (stripped.length < 40) return false
  if (/^(show|do not|help|look|found|identify|transport|sleep|increase|effect|any |the |a |an |will |need )/i.test(stripped)) {
    return false
  }
  if (/^(During|When|While|Many|The |Some |In |It |This |Past |Senior |Local |Hard work)/.test(stripped)) {
    return true
  }
  return stripped.length > 55 && /\b(was|were|is|are|had|have|can|may|that|which)\b/.test(stripped)
}

function nextHasSubList(blocks: ListeningNotePassageBlock[], index: number): boolean {
  const colonParent = colonIntroducesSubItems(blocks[index]?.text ?? '')
  for (let j = index + 1; j < Math.min(index + 6, blocks.length); j += 1) {
    const block = blocks[j]
    if (block.type === 'section') return false
    if (block.type !== 'static') continue
    const text = block.text ?? ''
    const marker = noteMarkerChar(text.trim())
    if (marker && '–-+−*'.includes(marker)) return true
    const bare = bareNoteText(text)
    if (bare.startsWith('–') || bare.startsWith('-')) return true
    if (colonParent && marker && '•*+'.includes(marker)) return true
    if (colonParent && bare && !isGapTrailAt(blocks, j)) {
      if (LIST_ITEM_START_RE.test(bare) || /^[a-z]/.test(bare)) return true
    }
  }
  return false
}

function prevNonGapBlock(
  blocks: ListeningNotePassageBlock[],
  index: number,
): ListeningNotePassageBlock | undefined {
  let j = index - 1
  while (j >= 0 && blocks[j]?.type === 'gap') j -= 1
  return j >= 0 ? blocks[j] : undefined
}

function isStaticContinuation(
  blocks: ListeningNotePassageBlock[],
  index: number,
): boolean {
  const block = blocks[index]
  if (block?.type !== 'static') return false
  const stripped = bareNoteText(block.text ?? '')
  if (!stripped || /^[A-Z]/.test(stripped)) return false
  if (LIST_ITEM_START_RE.test(stripped)) return false
  if (stripped.split(/\s+/).length > 4) return false
  const prev = prevNonGapBlock(blocks, index)
  if (!prev || prev.type !== 'static') return false
  const prevText = bareNoteText(prev.text ?? '')
  if (!prevText || prevText.endsWith(':')) return false
  if (prevText.trimEnd().endsWith(' a') || prevText.trimEnd().endsWith(' an')) return false
  return prevEndsIncomplete(prevText)
}

function isProseAfterSection(
  blocks: ListeningNotePassageBlock[],
  index: number,
): boolean {
  const prev = prevNonGapBlock(blocks, index)
  if (prev?.type !== 'section') return false
  return looksLikeProse(blocks[index]?.text ?? '')
}

function shouldStripMarker(
  blocks: ListeningNotePassageBlock[],
  index: number,
  formStyle: boolean,
): boolean {
  const text = blocks[index]?.text ?? ''
  if (!hasNoteLineMarker(text.trim())) return false
  const bare = stripNoteMarker(text).trim()

  if (isGapTrailAt(blocks, index)) return true
  if (isStaticContinuation(blocks, index)) return true
  if (['•', '*', '+', '–', '-', '·'].includes(bare) || !bare) return true
  if (bare.toLowerCase().endsWith('e.g.') && hasNoteLineMarker(text.trim())) return true
  if (isPureFormLabel(text) && blocks[index + 1]?.type === 'gap') {
    const label = bareNoteText(text).slice(0, -1).trim().toLowerCase()
    if (label.includes('benefits') || label.includes('required') || label.includes('qualit')) {
      return false
    }
    return true
  }
  if (isFormGapLabel(blocks, index, formStyle)) return true
  if (isProseAfterSection(blocks, index)) return true
  if (bare.endsWith(':') && !nextHasSubList(blocks, index)) {
    if (blocks[index + 1]?.type === 'gap') return false
    return true
  }
  if (isNoteIntroLine(bare)) return true
  const marker = noteMarkerChar(text.trim())
  if (marker && '–-+−*'.includes(marker) && !inSubListContext(blocks, index)) return true
  if (marker && '•*+'.includes(marker) && inSubListContext(blocks, index)
    && !bareNoteText(text).toLowerCase().endsWith('e.g.')) return true
  if (marker && '•*+'.includes(marker)) {
    const colonIdx = bare.indexOf(':')
    if (colonIdx >= 0 && bare.slice(colonIdx + 1).trim().length > 0) return false
  }
  return false
}

function sanitizeNotePassageMarkers(blocks: ListeningNotePassageBlock[]): void {
  const formStyle = isFormStylePassage(blocks)
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]
    if (block.type !== 'static') continue
    if (shouldStripMarker(blocks, index, formStyle)) {
      blocks[index] = { ...block, text: stripNoteMarker(block.text ?? '') }
    }
  }
}

function padNoteMarker(marker: string, text: string): string {
  const stripped = text.trim()
  const leading = text.slice(0, text.length - text.trimStart().length)
  return `${leading}${marker} ${stripped}`
}

function noteMarkerChar(text: string): string {
  const trimmed = text.trimStart()
  const match = trimmed.match(NOTE_LINE_MARKER_RE)
  return match ? trimmed[0] : ''
}

function findColonSubParent(
  blocks: ListeningNotePassageBlock[],
  index: number,
): ListeningNotePassageBlock | undefined {
  let j = index - 1
  while (j >= 0) {
    const block = blocks[j]
    if (block.type === 'section') return undefined
    if (block.type === 'gap') {
      if (isGapTrailAt(blocks, j)) {
        j -= 2
        continue
      }
      j -= 1
      continue
    }
    if (block.type === 'static') {
      const text = block.text ?? ''
      if (isGapTrailAt(blocks, j)) {
        j -= 2
        continue
      }
      if (colonIntroducesSubItemsAt(blocks, j)) return block
      const bare = bareNoteText(text)
      if (noteMarkerChar(text.trim()) && '–-+−*'.includes(noteMarkerChar(text.trim()))) {
        j -= 1
        continue
      }
      if (bare.toLowerCase().endsWith('e.g.')) return block
      if (hasNoteLineMarker(text.trim())) {
        const marker = noteMarkerChar(text.trim())
        if (marker && '•*+'.includes(marker)) {
          return colonIntroducesSubItemsAt(blocks, j) ? block : undefined
        }
      }
    }
    j -= 1
  }
  return undefined
}

function inSubListContext(
  blocks: ListeningNotePassageBlock[],
  index: number,
): boolean {
  const anchor = walkPrevListAnchor(blocks, index)
  if (anchor?.type === 'static') {
    const anchorText = anchor.text?.trim() ?? ''
    const marker = noteMarkerChar(anchorText)
    if (marker && '–-+−*'.includes(marker)) {
      const current = blocks[index]?.text ?? ''
      const currentMarker = noteMarkerChar(current.trim())
      if (currentMarker && '•*+'.includes(currentMarker)) return false
      return true
    }
    if (bareNoteText(anchorText).toLowerCase().endsWith('e.g.')) return true
  }
  return findColonSubParent(blocks, index) !== undefined
}

function resolveListDepth(
  blocks: ListeningNotePassageBlock[],
  index: number,
  marker: string,
): number {
  if (marker && '–-+−*'.includes(marker)) return 2
  const text = blocks[index]?.text ?? ''
  if (marker && '•*+'.includes(marker) && colonIntroducesSubItemsAt(blocks, index)) return 2
  if (inSubListContext(blocks, index)) return 2
  return 1
}

function walkPrevListAnchor(
  blocks: ListeningNotePassageBlock[],
  index: number,
): ListeningNotePassageBlock | undefined {
  let j = index - 1
  while (j >= 0) {
    const block = blocks[j]
    if (block.type === 'gap') {
      j -= 1
      continue
    }
    if (block.type === 'static') {
      if (isGapTrailAt(blocks, j)) {
        j -= 2
        continue
      }
      if (isGapLeadBlock(blocks, j)) {
        j -= 1
        continue
      }
    }
    return block
  }
  return undefined
}

/** Bổ sung • / – khi JSON thiếu marker; gỡ marker sai trước (khớp đề giấy). */
export function enrichNotePassageBullets(
  blocks: ListeningNotePassageBlock[],
): ListeningNotePassageBlock[] {
  const out = blocks.map(block => ({ ...block }))
  sanitizeNotePassageMarkers(out)
  let listDepth = 0
  const formStyle = isFormStylePassage(out)

  for (let index = 0; index < out.length; index += 1) {
    const block = out[index]
    if (block.type === 'section') {
      listDepth = 0
      continue
    }
    if (block.type !== 'static' || !block.text?.trim()) continue

    const text = block.text
    const stripped = text.trim()
    const bare = bareNoteText(text)

    if (hasNoteLineMarker(stripped)) {
      const marker = noteMarkerChar(stripped)
      listDepth = resolveListDepth(out, index, marker)
      if (marker && '•*+'.includes(marker) && !colonIntroducesSubItemsAt(out, index)) {
        listDepth = 1
      }
      if (marker && '•*+'.includes(marker) && listDepth >= 2 && !colonIntroducesSubItems(text)) {
        out[index] = { ...block, text: padNoteMarker('–', text) }
      }
      continue
    }

    if (isGapTrailAt(out, index) || isStaticContinuation(out, index)) continue

    if (isPureFormLabel(text)) continue
    if (isFormGapLabel(out, index, formStyle)) continue
    if (formStyle && isSameLineFormField(out, index)) continue
    if (isProseAfterSection(out, index)) continue

    if (isNoteIntroLine(bare)) {
      listDepth = 1
      continue
    }

    if (bare.endsWith(':') && nextHasSubList(out, index)) {
      if (colonIntroducesSubItemsAt(out, index)) {
        listDepth = 2
        if (!hasNoteLineMarker(stripped)) {
          out[index] = { ...block, text: padNoteMarker('•', text) }
        }
        continue
      }
      if (!hasNoteLineMarker(stripped)) {
        out[index] = { ...block, text: padNoteMarker('•', text) }
      }
      listDepth = 1
      continue
    }

    if (bare.toLowerCase().endsWith('e.g.')) {
      out[index] = { ...block, text: padNoteMarker('•', text) }
      listDepth = 1
      continue
    }

    if (isGapLeadBlock(out, index)) {
      if (isSubjectListItem(text) || /^[A-Z][A-Za-z]+:\s/.test(bare)) {
        out[index] = { ...block, text: padNoteMarker('•', text) }
        listDepth = 1
        continue
      }
      const prev = walkPrevListAnchor(out, index)
      if (listDepth >= 1 && prev) {
        const marker = listDepth >= 2 ? '–' : '•'
        out[index] = { ...block, text: padNoteMarker(marker, text) }
        listDepth = listDepth >= 2 ? 2 : 1
      }
      continue
    }

    const prev = walkPrevListAnchor(out, index)
    if (!prev) continue

    if (prev.type === 'section') {
      if (!looksLikeProse(text)) {
        out[index] = { ...block, text: padNoteMarker('•', text) }
        listDepth = 1
      }
      continue
    }

    if (prev.type === 'static' && prev.text) {
      const prevText = prev.text.trim()
      if (prev.type === 'static' && hasNoteLineMarker(prevText) && !colonIntroducesSubItems(prevText)) {
        out[index] = { ...block, text: padNoteMarker('•', text) }
        listDepth = 1
        continue
      }
      if (isNoteIntroLine(prevText)) {
        out[index] = { ...block, text: padNoteMarker('•', text) }
        listDepth = 1
        continue
      }
      if (bareNoteText(prevText).toLowerCase().endsWith('e.g.')) {
        out[index] = { ...block, text: padNoteMarker('–', text) }
        listDepth = 2
        continue
      }
      if (hasNoteLineMarker(prevText)) {
        const prevMarker = noteMarkerChar(prevText)
        if (prevMarker === '•' && bareNoteText(prevText).toLowerCase().endsWith('e.g.')) {
          out[index] = { ...block, text: padNoteMarker('–', text) }
          listDepth = 2
        } else if (prevMarker && '•*+'.includes(prevMarker)) {
          const prevIdx = out.indexOf(prev)
          if (prevIdx >= 0 && colonIntroducesSubItemsAt(out, prevIdx)) {
            out[index] = { ...block, text: padNoteMarker('–', text) }
            listDepth = 2
          } else {
            out[index] = { ...block, text: padNoteMarker('•', text) }
            listDepth = 1
          }
        } else {
          out[index] = { ...block, text: padNoteMarker('–', text) }
          listDepth = 2
        }
        continue
      }
    }

    if (isSubjectListItem(text)) {
      out[index] = { ...block, text: padNoteMarker('•', text) }
      listDepth = 1
      continue
    }

    if (/^[A-Z][A-Za-z &/]+:/.test(bare) && nextHasSubList(out, index)) {
      out[index] = { ...block, text: padNoteMarker('•', text) }
      listDepth = 1
      continue
    }

    if (listDepth >= 2) {
      out[index] = { ...block, text: padNoteMarker('–', text) }
    } else if (listDepth >= 1) {
      out[index] = { ...block, text: padNoteMarker('•', text) }
    }
  }

  return out
}

/** Tách static/example chứa \\n thành nhiều block — mỗi dòng đề = một block. */
export function atomizeNotePassageBlocks(
  blocks: ListeningNotePassageBlock[],
): ListeningNotePassageBlock[] {
  const out: ListeningNotePassageBlock[] = []

  for (const block of blocks) {
    if (block.type !== 'static' && block.type !== 'example') {
      out.push(block)
      continue
    }

    const text = block.text ?? ''
    const parts = text.split(/\r?\n/)
    if (parts.length <= 1) {
      out.push(block)
      continue
    }

    for (const part of parts) {
      if (!part.trim()) continue
      const trimmed = part.trim()
      if (block.type === 'example' || trimmed.toLowerCase().startsWith('example')) {
        out.push({ type: 'example', text: part })
      } else {
        out.push({ type: 'static', text: part })
      }
    }
  }

  return out
}

function isCompleteFormLine(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.endsWith('.') || trimmed.endsWith('?')) return true
  if (trimmed.endsWith(')')) return true

  const colon = trimmed.indexOf(':')
  if (colon < 0) return false

  const after = trimmed.slice(colon + 1).trim()
  if (!after) return false
  if (trimmed.endsWith('(')) return false

  if (/\d/.test(after)) return true
  if (after.split(/\s+/).length >= 2) return true
  return false
}

/** Tách dòng, nhận dạng Example, bổ sung gapLead/gapTrail cho gap trần (đề cũ). */
export function prepareNotePassageBlocks(
  blocks: ListeningNotePassageBlock[],
  questionsByNumber: Map<number, ListeningQuestion>,
): ListeningNotePassageBlock[] {
  const normalized = enrichNotePassageBullets(atomizeNotePassageBlocks(blocks)).map(block => {
    if (
      block.type === 'static'
      && (block.text ?? '').trim().toLowerCase().startsWith('example')
    ) {
      return { type: 'example' as const, text: block.text }
    }
    return block
  })

  const enriched: ListeningNotePassageBlock[] = []
  for (let index = 0; index < normalized.length; index += 1) {
    const block = normalized[index]
    if (block.type !== 'gap' || block.number == null) {
      enriched.push(block)
      continue
    }

    const prev = normalized[index - 1]
    const next = normalized[index + 1]
    const question = questionsByNumber.get(block.number)
    const prevIsInlineLead = prev?.type === 'static'
      && Boolean(prev.text?.trim())
      && (prevEndsIncomplete(bareNoteText(prev.text ?? ''))
        || bareNoteText(prev.text ?? '').endsWith(':'))
    const nextIsTrail = next?.type === 'static'
      && Boolean(next.text?.trim())
      && !hasNoteLineMarker((next.text ?? '').trim())
      && /^[a-z(]/.test(bareNoteText(next.text ?? ''))
    const hasInlineContext = prevIsInlineLead || nextIsTrail

    if (hasInlineContext) {
      enriched.push(block)
      continue
    }

    if (question?.gapLead?.trim()) {
      const lead = question.gapLead.trim()
      const isEgLine = /^e\.g\./i.test(lead)
      const needsBullet = !isBulletLineStart(lead) && !lead.startsWith('Example') && !isEgLine
      const needsSubBullet = isEgLine && !isBulletLineStart(lead)
      const suffix = lead.endsWith(' ') ? '' : ' '
      let text = `${lead}${suffix}`
      if (needsBullet) text = padNoteMarker('•', `${lead}${suffix}`)
      else if (needsSubBullet) text = padNoteMarker('–', `${lead}${suffix}`)
      enriched.push({ type: 'static', text })
    }

    enriched.push(block)

    if (question?.gapTrail?.trim()) {
      enriched.push({ type: 'static', text: question.gapTrail })
    }
  }

  return enriched
}

/**
 * Part 1 form / Part 4 lecture — khớp đề giấy 100%:
 * - Mỗi static block JSON → một dòng (không nối dài).
 * - Chỉ gom static + gap (+ trail) khi trail tiếp nối gap trên cùng câu.
 */
function groupNotePassageFormLines(
  blocks: ListeningNotePassageBlock[],
): NotePassageRenderLine[] {
  const lines: NotePassageRenderLine[] = []
  let current: ListeningNotePassageBlock[] = []

  const flush = () => {
    if (!current.length) return
    lines.push({ kind: 'inline', blocks: [...current] })
    current = []
  }

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]
    if (block.type === 'section' || block.type === 'example') {
      flush()
      lines.push({ kind: block.type, block })
      continue
    }

    if (block.type === 'gap') {
      const prev = current[current.length - 1]
      const next = blocks[index + 1]
      const prevBare = prev?.type === 'static' ? bareNoteText(prev.text ?? '') : ''
      const nextIsTrail = next?.type === 'static' && isGapTrailAt(blocks, index + 1)
      const keepInline = prev?.type === 'static' && (
        prevEndsIncomplete(prevBare)
        || prevBare.endsWith(':')
        || nextIsTrail
      )
      if (prev?.type === 'static' && !keepInline) {
        flush()
      }
      current.push(block)
      continue
    }

    if (block.type === 'static') {
      const prev = current[current.length - 1]
      const next = blocks[index + 1]
      if (isGapTrailBlock(block, prev, next)) {
        current.push(block)
        continue
      }
      flush()
      current.push(block)
    }
  }

  flush()
  return lines
}

/** gapLead/gapTrail đã được inject vào static block liền kề — không render lại trong GapInlineCompact. */
export function gapLeadRenderedAdjacent(
  prevBlock: ListeningNotePassageBlock | undefined,
  gapLead: string | undefined,
): boolean {
  if (!gapLead?.trim() || prevBlock?.type !== 'static') return false
  const bare = bareNoteText(prevBlock.text ?? '').trimEnd()
  const lead = bareNoteText(gapLead).trimEnd()
  return bare === lead || bare.endsWith(lead) || lead.endsWith(bare)
}

export function gapTrailRenderedAdjacent(
  nextBlock: ListeningNotePassageBlock | undefined,
  gapTrail: string | undefined,
): boolean {
  if (!gapTrail?.trim() || nextBlock?.type !== 'static') return false
  const nextText = (nextBlock.text ?? '').trim()
  const trail = gapTrail.trim()
  const nextBare = bareNoteText(nextBlock.text ?? '').trim()
  const trailBare = bareNoteText(gapTrail).trim()
  return nextText === trail
    || nextText.endsWith(trail)
    || nextText.startsWith(trail)
    || nextBare === trailBare
}

/** Gom static + gap thành dòng inline giống đề giấy (Part 1 form · Part 4 lecture). */
export function groupNotePassageIntoLines(
  blocks: ListeningNotePassageBlock[],
  layout: 'list' | 'form' | 'lecture' = 'list',
): NotePassageRenderLine[] {
  if (layout === 'form' || layout === 'lecture') {
    return groupNotePassageFormLines(blocks)
  }

  const lines: NotePassageRenderLine[] = []
  let current: ListeningNotePassageBlock[] = []

  const flush = () => {
    if (!current.length) return
    lines.push({ kind: 'inline', blocks: [...current] })
    current = []
  }

  for (const block of blocks) {
    if (block.type === 'section' || block.type === 'example') {
      flush()
      lines.push({ kind: block.type, block })
      continue
    }

    if (block.type === 'static') {
      const text = block.text ?? ''

      if (current.length === 0) {
        current.push(block)
        if (isCompleteFormLine(text) && !isBulletLineStart(text)) flush()
        continue
      }

      if (isBulletLineStart(text)) {
        flush()
        current.push(block)
        continue
      }

      const lineHasGap = current.some(item => item.type === 'gap')
      const startsNewSentence = /^[A-Z]/.test(text.trim()) && !isBulletLineStart(text)
      if (lineHasGap && startsNewSentence) flush()

      const last = current[current.length - 1]
      if (last?.type === 'static' && isCompleteFormLine(last.text ?? '')) flush()

      current.push(block)
      if (isCompleteFormLine(text) && !isBulletLineStart(text)) flush()
      continue
    }

    if (block.type === 'gap') {
      current.push(block)
    }
  }

  flush()
  return lines
}

export function validateNotePassageBlocks(
  blocks: ListeningNotePassageBlock[] | undefined,
  gapQuestionNumbers: number[],
  partLabel: string,
): string[] {
  if (!blocks?.length) return []
  if (gapQuestionNumbers.length === 0) return []

  const warnings: string[] = []
  const gapSet = new Set(gapQuestionNumbers)
  const passageGapNumbers = blocks
    .filter((block): block is ListeningNotePassageBlock & { number: number } =>
      block.type === 'gap' && typeof block.number === 'number')
    .map(block => block.number)

  for (const number of passageGapNumbers) {
    if (!gapSet.has(number)) {
      warnings.push(`${partLabel}: notePassage gap ${number} không có trong questions.`)
    }
  }

  for (const number of gapQuestionNumbers) {
    if (!passageGapNumbers.includes(number)) {
      warnings.push(`${partLabel}: câu ${number} thiếu trong notePassage (IELTS note-completion).`)
    }
  }

  for (const block of blocks) {
    if (block.type === 'gap' && (block.number == null || block.number < 1)) {
      warnings.push(`${partLabel}: notePassage gap thiếu number hợp lệ.`)
    }
    if (
      (block.type === 'static' || block.type === 'section' || block.type === 'example')
      && !block.text?.trim()
    ) {
      warnings.push(`${partLabel}: notePassage ${block.type} thiếu text.`)
    }
  }

  return warnings
}

export function validateNoteTable(
  table: ListeningNoteTable | undefined,
  gapQuestionNumbers: number[],
  partLabel: string,
): string[] {
  if (!table?.rows?.length) return []
  if (gapQuestionNumbers.length === 0) return []

  const warnings: string[] = []
  const gapSet = new Set(gapQuestionNumbers)
  const tableGapNumbers: number[] = []

  for (const row of table.rows) {
    for (const cell of row.cells) {
      for (const block of cell) {
        if (block.type === 'gap' && typeof block.number === 'number') {
          tableGapNumbers.push(block.number)
        }
      }
    }
  }

  for (const number of tableGapNumbers) {
    if (!gapSet.has(number)) {
      warnings.push(`${partLabel}: noteTable gap ${number} không có trong questions.`)
    }
  }

  for (const number of gapQuestionNumbers) {
    if (!tableGapNumbers.includes(number)) {
      warnings.push(`${partLabel}: câu ${number} thiếu trong noteTable (IELTS table-completion).`)
    }
  }

  if (!table.headers?.length) {
    warnings.push(`${partLabel}: noteTable thiếu headers.`)
  }

  return warnings
}

export function validateNoteTables(
  tables: ListeningNoteTable[] | undefined,
  singleTable: ListeningNoteTable | undefined,
  gapQuestionNumbers: number[],
  partLabel: string,
): string[] {
  const allTables = tables?.length
    ? tables
    : singleTable
      ? [singleTable]
      : []

  if (!allTables.length) return []

  const warnings: string[] = []
  const gapSet = new Set(gapQuestionNumbers)
  const covered = new Set<number>()

  for (const [index, table] of allTables.entries()) {
    const label = `${partLabel} bảng ${index + 1}`
    const tableGaps = table.gapNumbers?.length
      ? table.gapNumbers
      : gapNumbersInNoteTable(table)

    warnings.push(...validateNoteTable(table, tableGaps, label))

    for (const number of tableGaps) {
      if (covered.has(number)) {
        warnings.push(`${label}: câu ${number} trùng trong nhiều bảng.`)
      }
      covered.add(number)
    }
  }

  for (const number of gapQuestionNumbers) {
    if (!covered.has(number)) {
      warnings.push(`${partLabel}: câu ${number} thiếu trong noteTable/noteTables.`)
    }
  }

  for (const number of covered) {
    if (!gapSet.has(number)) {
      warnings.push(`${partLabel}: noteTables gap ${number} không có trong questions.`)
    }
  }

  return warnings
}