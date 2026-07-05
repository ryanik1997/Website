import type {
  ListeningNotePassageBlock,
  ListeningNotePassageSection,
  ListeningNoteTable,
  ListeningQuestion,
} from './listeningExamData'

export function gapNumbersFromSections(
  sections: Array<Pick<ListeningNotePassageSection, 'blocks' | 'gapNumbers'>> | undefined,
): number[] {
  if (!sections?.length) return []
  const numbers: number[] = []
  for (const section of sections) {
    const fromMeta = section.gapNumbers ?? []
    const fromBlocks = section.blocks
      .filter((b): b is ListeningNotePassageBlock & { number: number } =>
        b.type === 'gap' && typeof b.number === 'number')
      .map(b => b.number)
    numbers.push(...(fromMeta.length ? fromMeta : fromBlocks))
  }
  return numbers
}

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
export const NOTE_LINE_MARKER_RE = /^[•●‣▪◦○·*+–−\-►▸]\s*/

const NOTE_LINE_PRIMARY_MARKERS = new Set(['•', '●', '‣', '▪', '◦', '○', '·', '*'])

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

/** Chỉ có marker •/– không kèm chữ (Cam15 T2 P4: "• " + [31] + trail). */
function isMarkerOnlyNoteLine(text: string): boolean {
  const trimmed = (text ?? '').trim()
  return Boolean(trimmed) && hasNoteLineMarker(trimmed) && !bareNoteText(text)
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
  /^(of|in|at|the|a|an|from|were|was|is|are|issue|that|which|and|or|but|to|for|with|her|his|their|our|my|your|its|hair|licence|payment|corridors?|may|might|can|could|would|should|\)|,)\b/i

/** Dòng bullet mới sau gap — không nối vào dòng trước. */
const NEW_BULLET_LINE_RE =
  /^(must|into|near|aim:|chairs|all|will|need)\b/i

/** Đoạn nối trên cùng dòng gap (Cam11 P4 Q31 trail, Q3 payment…). */
const SAME_LINE_GAP_TRAIL_RE =
  /^(at|for|in the|payment|corridors?|licence|door|during the week)\b/i

/** Trail sau gap trên form table (Cam11 T2 P1: Street…; , and is interested…). */
const FORM_COMMA_TRAIL_RE = /^,\s/
const FORM_ADDRESS_TRAIL_RE = /^(street|place|road|lane|avenue|drive),/i
/** Giải thích sau gap trên cùng dòng (Cam13 T1 P4: "the [31] — because of its general adaptability"). */
const EM_DASH_GAP_TRAIL_RE = /^[–—-]\s+/

/** Mô tả phòng/hội trường sau gap — cùng dòng (Cam11 T1 Q1: "Room – seats 100"). */
const ROOM_DESCRIPTOR_TRAIL_RE =
  /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*[–—-]\s*seats\s+\d+$/i

/** Tên phòng sau gap địa chỉ (Cam17 T2 P1: "[3] Room in the village hall"). */
const FORM_ROOM_IN_TRAIL_RE = /^Room in the /i

/** Tòa nhà + số căn sau gap địa chỉ (Cam14 T1 P1: "Apartments (No 15)"). Không /i — tránh khớp "shoes (not sandals)" (Cam16 T3 P1). */
const FORM_BUILDING_TRAIL_RE =
  /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*\([^)]+\)\s*$/

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
  const raw = block?.text ?? ''
  const stripped = bareNoteText(raw)
  if (block?.type !== 'static' || prev?.type !== 'gap' || !stripped) return false
  // Dòng • sau gap = mục mới — không gom trail (Cam16 T3 P1: "• shoes (not sandals)")
  if (hasNoteLineMarker(raw) && !ROOM_DESCRIPTOR_TRAIL_RE.test(stripped)) return false
  if (NEW_BULLET_LINE_RE.test(stripped)) return false
  if (SAME_LINE_GAP_TRAIL_RE.test(stripped)) return true
  if (ROOM_DESCRIPTOR_TRAIL_RE.test(stripped)) return true
  if (FORM_ROOM_IN_TRAIL_RE.test(stripped)) return true
  if (FORM_COMMA_TRAIL_RE.test(stripped)) return true
  if (FORM_ADDRESS_TRAIL_RE.test(stripped)) return true
  if (FORM_BUILDING_TRAIL_RE.test(stripped)) return true
  if (EM_DASH_GAP_TRAIL_RE.test(stripped)) return true
  // If the candidate trail itself has a bullet marker, it's a new list item, not a plain text continuation.
  if (hasNoteLineMarker(raw)) return false
  if (next?.type === 'gap') return false
  if (stripped.split(/\s+/).length > 5) return false
  if (/^[A-Z]/.test(stripped) && !FORM_BUILDING_TRAIL_RE.test(stripped)) return false
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
  ' your', ' my', ' its', ' produces',
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
  const lower = label.toLowerCase()
  // Exception: labels like "Qualities required:" are section headers that get • bullet in paper + subs below.
  if (lower.includes('qualit') || lower.includes('required')) return false
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

/** Label + gap liền kề (vd. Name: Edith [1], Address: Flat 4, [2] — Cam10 T4 a6). */
function isInlineFormField(
  blocks: ListeningNotePassageBlock[],
  index: number,
): boolean {
  const block = blocks[index]
  if (block?.type !== 'static') return false
  const text = bareNoteText(block.text ?? '')
  if (!text.includes(':')) return false
  return blocks[index + 1]?.type === 'gap'
}

function isExampleMarkerLine(text: string): boolean {
  return bareNoteText(text).trim().toLowerCase() === 'example'
}

/** Form/table không dùng • trong JSON — không inject bullet sau gap (Cam11 T2 P1). */
function formPassageWithoutBullets(blocks: ListeningNotePassageBlock[]): boolean {
  if (!isFormStylePassage(blocks)) return false
  return !blocks.some(
    b => b.type === 'static' && hasNoteLineMarker((b.text ?? '').trim()),
  )
}

function isFormStylePassage(blocks: ListeningNotePassageBlock[]): boolean {
  const hasExample = blocks.some(
    block => block.type === 'example'
      || (block.type === 'static' && isExampleMarkerLine(block.text ?? '')),
  )
  const pureLabels = blocks.filter(
    block => block.type === 'static' && isPureFormLabel(block.text ?? ''),
  ).length
  const sameLineFields = blocks.filter(
    (_, index) => blocks[index]?.type === 'static' && isSameLineFormField(blocks, index),
  ).length
  const inlineFormFields = blocks.filter(
    (_, index) => isInlineFormField(blocks, index),
  ).length
  return hasExample && (pureLabels >= 2 || sameLineFields >= 2 || inlineFormFields >= 2)
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

      // Promote items that use – in source data but should render as top-level • in paper (common in P1 forms).
      // Covers Cam9 T1 "Qualities" section + similar patterns across other tests.
      const bareLower = bareNoteText(text).toLowerCase()
      if (
        bareLower.includes('interview arranged') ||
        bareLower.includes('bring the names') ||
        bareLower.includes('ask for')
      ) {
        listDepth = 1
        if (!'•*+'.includes(marker)) {
          out[index] = { ...block, text: padNoteMarker('•', text) }
        }
      }
      continue
    }

    if (isGapTrailAt(out, index) || isStaticContinuation(out, index)) continue

    if (isPureFormLabel(text)) continue
    if (isFormGapLabel(out, index, formStyle)) continue
    if (formStyle && isInlineFormField(out, index)) continue
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
      if (formStyle && isInlineFormField(out, index)) continue
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

/** JSON bundle đã có •/– (Tainguyen) — không chạy enrich để tránh thêm marker / gom dòng sai. */
function notePassageHasStructuredMarkers(blocks: ListeningNotePassageBlock[]): boolean {
  const statics = blocks.filter(
    block => block.type === 'static' && Boolean(block.text?.trim()),
  )
  if (!statics.length) return false
  const marked = statics.filter(block => hasNoteLineMarker(block.text ?? '')).length
  return marked >= Math.min(3, Math.ceil(statics.length * 0.2))
}

/** Part 4 lecture prose — không inject •; gỡ marker sai từ import cũ (Cam12 T1/T2 P4). */
function isProseLecturePassage(blocks: ListeningNotePassageBlock[]): boolean {
  const statics = blocks.filter(
    block => block.type === 'static' && Boolean(block.text?.trim()),
  )
  if (!statics.length) return false
  const hasSections = blocks.some(block => block.type === 'section')
  const hasExample = blocks.some(
    block => block.type === 'example'
      || (block.type === 'static' && isExampleMarkerLine(block.text ?? '')),
  )
  if (hasSections && !hasExample) return true
  return !statics.some(block => hasNoteLineMarker(block.text ?? ''))
}

/** Phần text ngắn nối tiếp sau gap trên cùng một dòng đề giấy (vd. "Road", " km", "at 6 p.m."). */
function isShortContinuation(
  text: string,
  current?: ListeningNotePassageBlock[],
): boolean {
  const s = (text ?? '').trim()
  if (!s) return false
  if (hasNoteLineMarker(s)) return false
  if (EM_DASH_GAP_TRAIL_RE.test(bareNoteText(text))) return true
  // Trail dài sau gap (Cam11 T3 P4: "to improve communication between…")
  if (/^(to|in|or|about|while|of|and|used)\b/i.test(s) && s.length <= 100) return true
  if (s.length > 50) return false
  if (/^[•●‣▪◦○·*+–−\-►▸]/.test(s)) return false
  const colonIdx = s.indexOf(':')
  if (colonIdx >= 0 && colonIdx < 18) return false
  // Dòng ghi chú mới (vd. "Phone number … –", "Railway museum …")
  if (/[–—-]\s*$/.test(s)) return false
  // Một từ nối sau gap (vd. "Road" sau "Address: 24 [1]")
  if (!/\s/.test(s) && s.length <= 24) return true
  if (ROOM_DESCRIPTOR_TRAIL_RE.test(s)) return true
  if (FORM_ROOM_IN_TRAIL_RE.test(s)) return true
  if (FORM_COMMA_TRAIL_RE.test(s)) return true
  if (FORM_ADDRESS_TRAIL_RE.test(s)) return true
  if (/^during the week$/i.test(s)) return true
  if (/^[a-z(]/.test(s)) {
    // Prose dòng mới sau gap (Cam14 T4 P1: "has a gallery suitable for musicians")
    if (current?.some(b => b.type === 'gap') && s.split(/\s+/).filter(Boolean).length >= 4) {
      return false
    }
    return true
  }
  return false
}

/** Tiêu đề phụ form (Cam14 T4 P1: Adelphi Room, Carlton Room). */
function isFormSubHeadingLine(text: string): boolean {
  const bare = bareNoteText(text).trim()
  return Boolean(bare && !bare.includes(':') && /\bRoom$/i.test(bare))
}

/** Dòng mô tả độc lập — không gom vào dòng gap trước. */
function isStandaloneFormNoteLine(text: string): boolean {
  const bare = bareNoteText(text).trim()
  if (!bare || bare.includes(':') || hasNoteLineMarker(bare)) return false
  return /^has\s+a\s+/i.test(bare) && bare.split(/\s+/).filter(Boolean).length >= 5
}

/** Label đã có giá trị cố định sau ":" (Cam14 T4 P1: "… eat: 110") — không label mở chờ gap. */
function isFormLabelWithInlineValue(text: string): boolean {
  const bare = bareNoteText(text).trim()
  const colon = bare.indexOf(':')
  if (colon < 0) return false
  const after = bare.slice(colon + 1).trim()
  if (!after) return false
  return /\d/.test(after) || /[.!?]$/.test(after)
}

/** Nhãn nhóm nhiều từ — dòng riêng (Cam14 T4 P1: Master of Ceremonies:). */
function isFormGroupHeadingLabel(text: string): boolean {
  const bare = bareNoteText(text).trim()
  if (!bare.endsWith(':')) return false
  const before = bare.slice(0, -1).trim()
  const words = before.split(/\s+/).length
  if (words < 3 || words > 6) return false
  const lower = before.toLowerCase()
  if (/^(date|number|postcode|phone|name|type|total|price|contact)\b/.test(lower)) return false
  return lower.includes(' of ') || lower.includes('ceremonies')
}

function hasGapAhead(blocks: ListeningNotePassageBlock[], index: number): boolean {
  for (let off = 1; off <= 3; off += 1) {
    const next = blocks[index + off]
    if (!next) break
    if (next.type === 'gap') return true
    if (next.type === 'static' && hasNoteLineMarker(next.text ?? '')) break
  }
  return false
}

/** Prose lecture — dòng prose kế bắt đầu `(` → không gom gapAhead (Cam13 T3 P4). */
function isProseLineBreakAhead(
  blocks: ListeningNotePassageBlock[],
  index: number,
): boolean {
  const block = blocks[index]
  if (block?.type !== 'static' || hasNoteLineMarker((block.text ?? '').trim())) return false
  // Paren sau gap là trail (Cam15 T3 P1: produces [1] (North London))
  if (blocks[index + 1]?.type === 'gap') return false
  let j = index + 1
  while (j < blocks.length && blocks[j]?.type === 'gap') j += 1
  const next = blocks[j]
  if (next?.type !== 'static') return false
  return (next.text ?? '').trim().startsWith('(')
}

const FORM_LABEL_PREFIXES = [
  'name', 'address', 'type', 'number', 'pay', 'heard', 'date', 'time',
  'postcode', 'phone', 'total', 'price', 'includes', 'extra',
]

function isFormLabelLine(text: string): boolean {
  const bare = bareNoteText(text)
  if (bare.includes(':')) return true
  const lower = bare.toLowerCase()
  return FORM_LABEL_PREFIXES.some(prefix => lower.startsWith(prefix))
}

/** Dòng form mới (Phone number:, Where to park:) — không gom vào dòng Address đang mở. */
function isNewFormFieldLine(text: string): boolean {
  const bare = bareNoteText(text).trim()
  if (!bare.includes(':')) return false
  const colon = bare.indexOf(':')
  if (colon > 40) return false
  const before = bare.slice(0, colon).trim()
  if (!before || before.split(/\s+/).length > 6) return false
  const lower = before.toLowerCase()
  if (FORM_LABEL_PREFIXES.some(prefix => lower.startsWith(prefix))) return true
  return /^(phone|where|best|needs|heard|work|email|postcode|customer)\b/.test(lower)
}

function formLineHasLabel(blocks: ListeningNotePassageBlock[]): boolean {
  return blocks.some(
    b => b.type === 'static' && isFormLabelLine(b.text ?? ''),
  )
}

/** Dòng form đang mở — có label hoặc đã có gap (vd. sau Address: Flat 4, [2]). */
function formLineCanContinue(blocks: ListeningNotePassageBlock[]): boolean {
  return formLineHasLabel(blocks) || blocks.some(b => b.type === 'gap')
}

/** Thêm • cho dòng mới sau gap khi JSON/AI thiếu marker (Cam11 T1). */
export function repairNewBulletLinesAfterGap(
  blocks: ListeningNotePassageBlock[],
): ListeningNotePassageBlock[] {
  const out = blocks.map(block => ({ ...block }))
  const skipAutoBullets = formPassageWithoutBullets(out) || isProseLecturePassage(out)

  for (let index = 1; index < out.length; index += 1) {
    const block = out[index]
    const prev = out[index - 1]
    if (block.type !== 'static' || prev?.type !== 'gap') continue

    const text = block.text ?? ''
    if (!text.trim() || hasNoteLineMarker(text.trim())) continue
    if (skipAutoBullets || isGapTrailAt(out, index) || isShortContinuation(text)) continue
    // Address trail sau gap (Cam14 T1 P1: "Apartments (No 15)" sau Current address)
    if (/^[A-Z][a-z]+.*\([^)]*\)\s*$/.test(bareNoteText(text))) continue

    out[index] = { ...block, text: padNoteMarker('•', text) }
  }

  return out
}

/** Tách static AI gộp nhầm (vd. "Park Flats (Behind the") trước khi gom dòng form. */
export function repairFormPassageInlineBlocks(
  blocks: ListeningNotePassageBlock[],
): ListeningNotePassageBlock[] {
  if (notePassageHasStructuredMarkers(blocks)) return blocks

  const out: ListeningNotePassageBlock[] = []

  for (const block of blocks) {
    if (block.type !== 'static') {
      out.push(block)
      continue
    }

    const text = block.text ?? ''
    if (hasNoteLineMarker(text.trim())) {
      out.push(block)
      continue
    }

    const bare = bareNoteText(text).trim()
    if (!bare || bare.includes(':')) {
      out.push(block)
      continue
    }

    const splitParen = bare.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\([^)]*)$/i)
    if (splitParen && splitParen[2].length >= 2) {
      const prefix = text.slice(0, text.length - text.trimStart().length)
      out.push({ type: 'static', text: `${prefix}${splitParen[1]}` })
      out.push({ type: 'static', text: `${prefix}${splitParen[2]}` })
      continue
    }

    out.push(block)
  }

  return out
}

/** Sub-field sau gap — dòng mới thụt (Cam11 T2 P1: "Studying" sau [4], không gom Occupation). */
function isFormSubFieldStarter(
  blocks: ListeningNotePassageBlock[],
  index: number,
): boolean {
  const block = blocks[index]
  if (block?.type !== 'static') return false
  if (blocks[index - 1]?.type !== 'gap') return false
  if (isGapTrailAt(blocks, index)) return false
  const bare = bareNoteText(block.text ?? '')
  if (!/^[A-Z][a-z]+$/.test(bare)) return false
  return blocks[index + 1]?.type === 'gap'
}

/** Đoạn nối tiếp trên cùng dòng form (vd. "Park Flats", "(Behind the", ")" sau Address: Flat 4, [2]). */
function isFormInlineSegment(
  current: ListeningNotePassageBlock[],
  text: string,
  blocks?: ListeningNotePassageBlock[],
  index?: number,
): boolean {
  if (!formLineCanContinue(current)) return false
  if (hasNoteLineMarker((text ?? '').trim())) return false
  if (blocks != null && index != null && isFormSubFieldStarter(blocks, index)) return false
  const s = bareNoteText(text ?? '').trim()
  if (!s || isNewFormFieldLine(s)) return false
  if (s === ')' || /^\([^)]*$/.test(s)) return true
  if (ROOM_DESCRIPTOR_TRAIL_RE.test(s)) return true
  if (FORM_ROOM_IN_TRAIL_RE.test(s)) return true
  if (FORM_COMMA_TRAIL_RE.test(s)) return true
  if (FORM_ADDRESS_TRAIL_RE.test(s)) return true
  if (/^during the week$/i.test(s)) return true
  if (/^[A-Z][a-z]+$/.test(s) && s.length <= 40) {
    // Sub-field sau gap+trail (Cam14 T2 P1: "goes" sau " club") — dòng mới
    if (
      blocks != null
      && index != null
      && blocks[index + 1]?.type === 'gap'
      && current.some(b => b.type === 'gap')
    ) {
      return false
    }
    return true
  }
  if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(s) && s.length <= 40) {
    if (current.some(b => b.type === 'gap') && /\bRoom$/i.test(s)) return false
    return true
  }
  if (FORM_BUILDING_TRAIL_RE.test(s)) return true
  // AI hay gộp "Park Flats (Behind the" thành một block
  if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*\([^)]+$/i.test(s) && s.length <= 60) return true
  return false
}

/** Bullet inject nhầm trên trail ngắn sau gap — gom lại (Cam11 T1 "• Room – seats 100"). */
function isMisplacedGapTrailBullet(text: string): boolean {
  const trimmed = (text ?? '').trim()
  if (!hasNoteLineMarker(trimmed)) return false
  const bare = bareNoteText(text)
  // Bullet mới sau gap — không gom vào dòng trước (Cam14 T1 P1: "• a"; Cam15 T3 P3: "• the")
  if (/^(a|the|any|what)$/i.test(bare)) return false
  if (ROOM_DESCRIPTOR_TRAIL_RE.test(bare)) return true
  if (!/\s/.test(bare) && bare.length <= 24 && isShortContinuation(bare)) {
    // "• Limited" sau gap là dòng form mới, không gom trail (Cam13 T3 P1)
    if (/^[A-Z][a-z]+$/.test(bare)) return false
    return true
  }
  return false
}

/** Trail prose sau gap giữa câu (Cam12 T2 P4 Q38: "…more [38] may create…"). */
function isProseGapSentenceTrail(
  current: ListeningNotePassageBlock[],
  text: string,
): boolean {
  const last = current[current.length - 1]
  if (last?.type !== 'gap') return false
  const trimmed = (text ?? '').trim()
  if (!trimmed || hasNoteLineMarker(trimmed)) return false
  const bare = bareNoteText(text)
  if (isNewFormFieldLine(bare)) return false
  const leadStatic = [...current].reverse().find(block => block.type === 'static')
  if (!leadStatic?.text) return false
  const lead = bareNoteText(leadStatic.text)
  const markerOnlyLead = isMarkerOnlyNoteLine(leadStatic.text)
  if (!lead && !markerOnlyLead) return false
  if (lead && /[.!?]$/.test(lead.trim())) return false
  // Dòng form độc lập (Cam14 T2 P1: "no allergies", Cam14 T4 P1 gallery line)
  if (/^no\s+\w/i.test(bare)) return false
  if (isStandaloneFormNoteLine(text)) return false
  return /^[a-z(]/.test(bare)
}

function shouldAppendToFormLine(
  current: ListeningNotePassageBlock[],
  text: string,
  blocks?: ListeningNotePassageBlock[],
  index?: number,
): boolean {
  const trimmed = (text ?? '').trim()
  if (hasNoteLineMarker(trimmed)) {
    const lastInLine = current[current.length - 1]
    return lastInLine?.type === 'gap' && isMisplacedGapTrailBullet(text)
  }
  if (blocks != null && index != null && isFormSubFieldStarter(blocks, index)) return false
  const bare = bareNoteText(text)
  if (/^no\s+\w/i.test(bare)) return false
  if (/^[a-z]$/.test(bare)) {
    const lastStatic = [...current].reverse().find(block => block.type === 'static')
    if (lastStatic?.text && hasNoteLineMarker((lastStatic.text ?? '').trim())) return false
  }
  // Sub-field sau trail (Cam14 T2 P1: "goes" sau " club", Cam11 T2: "Studying")
  if (
    blocks != null
    && index != null
    && blocks[index + 1]?.type === 'gap'
    && /^[A-Za-z]+$/.test(bare)
    && bare.length <= 24
    && current.some(b => b.type === 'gap')
  ) {
    return false
  }
  // Dòng form mới sau gap đã đóng (Cam14 T4 P1: "will provide" sau "can give …")
  if (
    blocks != null
    && index != null
    && blocks[index + 1]?.type === 'gap'
    && current.some(b => b.type === 'gap')
    && /^(will|can)\s+\w/i.test(bare)
  ) {
    return false
  }
  // Mục mới trước gap kế — không gom vào dòng gap trước (Cam18 T1 P1: "frequency…" sau [6])
  if (
    blocks != null
    && index != null
    && isGapLeadBlock(blocks, index)
    && current.some(b => b.type === 'gap')
  ) {
    return false
  }
  return isShortContinuation(text, current)
    || isFormInlineSegment(current, text, blocks, index)
    || isProseGapSentenceTrail(current, text)
}

/** Gỡ • sai trên trail sau gap (Dexie/import cũ: "• Room – seats 100"). */
export function repairGapTrailBullets(
  blocks: ListeningNotePassageBlock[],
): ListeningNotePassageBlock[] {
  const out = blocks.map(block => ({ ...block }))

  for (let index = 1; index < out.length; index += 1) {
    const block = out[index]
    const prev = out[index - 1]
    if (block.type !== 'static' || prev?.type !== 'gap') continue

    const text = block.text ?? ''
    if (!hasNoteLineMarker(text.trim()) || !isGapTrailAt(out, index)) continue
    out[index] = { ...block, text: bareNoteText(text) }
  }

  return out
}

function trailBlockForFormLine(block: ListeningNotePassageBlock): ListeningNotePassageBlock {
  const text = block.text ?? ''
  if (block.type !== 'static' || !hasNoteLineMarker(text.trim())) return block
  const bare = bareNoteText(text)
  if (!ROOM_DESCRIPTOR_TRAIL_RE.test(bare) && !isShortContinuation(bare)) return block
  return { ...block, text: bare }
}

/** Tách dòng, nhận dạng Example, bổ sung gapLead/gapTrail cho gap trần (đề cũ). */
export function prepareNotePassageBlocks(
  blocks: ListeningNotePassageBlock[],
  questionsByNumber: Map<number, ListeningQuestion>,
): ListeningNotePassageBlock[] {
  const atomized = repairNewBulletLinesAfterGap(
    repairGapTrailBullets(
      atomizeNotePassageBlocks(repairFormPassageInlineBlocks(blocks)),
    ),
  )
  const proseLecture = isProseLecturePassage(atomized)
  const structuredNotes = notePassageHasStructuredMarkers(atomized)
  // Giữ •/– trong JSON có cấu trúc (Cam12 T3 P4) — không gỡ marker để tách dòng đúng.
  const cleaned = proseLecture && !structuredNotes
    ? atomized.map(block =>
        block.type === 'static' && hasNoteLineMarker((block.text ?? '').trim())
          ? { ...block, text: noteLineBodyText(block.text ?? '') }
          : block,
      )
    : atomized
  const base = structuredNotes
    || isFormStylePassage(cleaned)
    || proseLecture
    ? cleaned
    : enrichNotePassageBullets(cleaned)

  const normalized = base.map(block => {
    if (block.type === 'static' && isExampleMarkerLine(block.text ?? '')) {
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
        || bareNoteText(prev.text ?? '').endsWith(':')
        || isMarkerOnlyNoteLine(prev.text ?? ''))
    const nextIsTrail = next?.type === 'static'
      && Boolean(next.text?.trim())
      && !hasNoteLineMarker((next.text ?? '').trim())
      && /^[a-z(]/.test(bareNoteText(next.text ?? ''))
    const leadInPrev = gapLeadRenderedAdjacent(prev, question?.gapLead)
    const trailInNext = gapTrailRenderedAdjacent(next, question?.gapTrail)
    const hasInlineContext = prevIsInlineLead || nextIsTrail || leadInPrev || trailInNext

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
 * Part 1 form / Part 4 lecture — port logic gen.py (HTML chuẩn):
 * Mỗi bullet / label / prose+có-gap = một dòng flex; gom gap + trail ngắn; không gom bullet kế tiếp.
 */
function groupNotePassageFormLines(
  blocks: ListeningNotePassageBlock[],
): NotePassageRenderLine[] {
  const lines: NotePassageRenderLine[] = []
  let index = 0

  while (index < blocks.length) {
    const block = blocks[index]

    if (block.type === 'section' || block.type === 'example') {
      lines.push({ kind: block.type, block })
      index += 1
      continue
    }

    if (block.type === 'static') {
      const text = (block.text ?? '').trim()
      if (!text) {
        index += 1
        continue
      }

      const isBullet = hasNoteLineMarker(text)
      const isLabel = isFormLabelLine(text) && !isBullet
      const gapAhead = hasGapAhead(blocks, index)
      const nextGap = blocks[index + 1]
      const gapOnOwnLineAhead = nextGap?.type === 'gap' && Boolean(nextGap.gapOnOwnLine)
      const isCompleteProse =
        !isBullet && !isLabel && (text.endsWith('.') || text.endsWith('?'))

      if (
        isFormSubHeadingLine(text)
        || isStandaloneFormNoteLine(text)
        || (isFormLabelWithInlineValue(text) && !gapAhead)
        || isFormGroupHeadingLabel(text)
      ) {
        lines.push({ kind: 'inline', blocks: [block] })
        index += 1
        continue
      }

      if ((isBullet || isLabel) && gapOnOwnLineAhead) {
        lines.push({ kind: 'inline', blocks: [block] })
        index += 1
        continue
      }

      if ((isBullet || isLabel || gapAhead) && !isCompleteProse && !isProseLineBreakAhead(blocks, index)) {
        const current: ListeningNotePassageBlock[] = [block]
        index += 1

        while (index < blocks.length) {
          const next = blocks[index]
          if (next.type === 'gap') {
            if (next.gapOnOwnLine) {
              if (current.length) lines.push({ kind: 'inline', blocks: [...current] })
              lines.push({ kind: 'inline', blocks: [next] })
              index += 1
              if (index < blocks.length && blocks[index].type === 'static') {
                lines.push({ kind: 'inline', blocks: [blocks[index]] })
                index += 1
              }
              current.length = 0
              break
            }
            current.push(next)
            index += 1
            if (index < blocks.length && blocks[index].type === 'static') {
              const trailText = blocks[index].text ?? ''
              if (shouldAppendToFormLine(current, trailText, blocks, index)) {
                current.push(trailBlockForFormLine(blocks[index]))
                index += 1
              }
            }
            continue
          }
          if (next.type === 'static') {
            const nextText = next.text ?? ''
            const lastInLine = current[current.length - 1]
            const misplacedTrailBullet = lastInLine?.type === 'gap'
              && isMisplacedGapTrailBullet(nextText)
            if (hasNoteLineMarker(nextText.trim()) && !misplacedTrailBullet) break
            if (shouldAppendToFormLine(current, nextText, blocks, index)) {
              current.push(trailBlockForFormLine(next))
              index += 1
              continue
            }
            break
          }
          break
        }

        if (current.length) lines.push({ kind: 'inline', blocks: current })
        continue
      }

      lines.push({ kind: 'inline', blocks: [block] })
      index += 1
      continue
    }

    if (block.type === 'gap') {
      lines.push({ kind: 'inline', blocks: [block] })
      index += 1
      continue
    }

    index += 1
  }

  return lines
}

/** gapLead/gapTrail đã được inject vào static block liền kề — không render lại trong GapInlineCompact. */
function normalizeGapFragment(text: string): string {
  return bareNoteText(text)
    .replace(/\s+/g, ' ')
    .replace(/[–—]/g, '-')
    .trim()
}

export function gapLeadRenderedAdjacent(
  prevBlock: ListeningNotePassageBlock | undefined,
  gapLead: string | undefined,
): boolean {
  if (!gapLead?.trim() || prevBlock?.type !== 'static') return false
  const bare = normalizeGapFragment(prevBlock.text ?? '')
  const lead = normalizeGapFragment(gapLead)
  return bare === lead || bare.endsWith(lead) || lead.endsWith(bare)
}

export function gapTrailRenderedAdjacent(
  nextBlock: ListeningNotePassageBlock | undefined,
  gapTrail: string | undefined,
): boolean {
  if (!gapTrail?.trim() || nextBlock?.type !== 'static') return false
  const nextNorm = normalizeGapFragment(nextBlock.text ?? '')
  const trailNorm = normalizeGapFragment(gapTrail)
  if (!nextNorm || !trailNorm) return false
  return nextNorm === trailNorm
    || nextNorm.endsWith(trailNorm)
    || nextNorm.startsWith(trailNorm)
}

/** gapTrail đã có trong notePassage (cùng dòng hoặc dòng kế) — không render lại trong GapInlineCompact. */
export function gapTrailRenderedInPassage(
  blocks: ListeningNotePassageBlock[],
  gapIndex: number,
  gapTrail: string | undefined,
): boolean {
  if (!gapTrail?.trim() || gapIndex < 0 || gapIndex >= blocks.length) return false
  let j = gapIndex + 1
  while (j < blocks.length && blocks[j]?.type === 'gap') j += 1
  if (j >= blocks.length || blocks[j]?.type !== 'static') return false
  return gapTrailRenderedAdjacent(blocks[j], gapTrail)
}

/** gapLead đã có trong notePassage static trước gap — không render lại trong GapInlineCompact. */
export function gapLeadRenderedInPassage(
  blocks: ListeningNotePassageBlock[],
  gapIndex: number,
  gapLead: string | undefined,
): boolean {
  if (!gapLead?.trim() || gapIndex < 0 || gapIndex >= blocks.length) return false
  let j = gapIndex - 1
  while (j >= 0 && blocks[j]?.type === 'gap') j -= 1
  if (j < 0 || blocks[j]?.type !== 'static') return false
  return gapLeadRenderedAdjacent(blocks[j], gapLead)
}

/** Dòng sub-field form (vd. "Studying [5]…") — thụt lề, không bullet. */
export function isFormSubFieldRenderLine(blocks: ListeningNotePassageBlock[]): boolean {
  const first = blocks.find(block => block.type === 'static')
  if (!first) return false
  const bare = bareNoteText(first.text ?? '')
  if (!/^[A-Z][a-z]+$/.test(bare)) return false
  return blocks.some(block => block.type === 'gap')
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