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

function isBulletLineStart(text: string): boolean {
  const trimmed = text.trimStart()
  return trimmed.startsWith('•')
    || trimmed.startsWith('–')
    || trimmed.startsWith('−')
    || trimmed.startsWith('- ')
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
  const normalized: ListeningNotePassageBlock[] = []

  for (const block of blocks) {
    if (block.type === 'static' || block.type === 'example') {
      const text = block.text ?? ''
      const lines = text.split('\n')
      if (lines.length > 1) {
        for (const line of lines) {
          if (!line.trim()) continue
          if (line.trim().toLowerCase().startsWith('example')) {
            normalized.push({ type: 'example', text: line })
          } else {
            normalized.push({ type: 'static', text: line })
          }
        }
        continue
      }
      if (block.type === 'static' && text.trim().toLowerCase().startsWith('example')) {
        normalized.push({ type: 'example', text })
        continue
      }
    }
    normalized.push(block)
  }

  const enriched: ListeningNotePassageBlock[] = []
  for (let index = 0; index < normalized.length; index += 1) {
    const block = normalized[index]
    if (block.type !== 'gap' || block.number == null) {
      enriched.push(block)
      continue
    }

    const prev = normalized[index - 1]
    const next = normalized[index + 1]
    const hasContext = (prev?.type === 'static' && Boolean(prev.text?.trim()))
      || (next?.type === 'static' && Boolean(next.text?.trim()))

    if (hasContext) {
      enriched.push(block)
      continue
    }

    const question = questionsByNumber.get(block.number)
    if (question?.gapLead?.trim()) {
      const lead = question.gapLead.trim()
      const needsBullet = !isBulletLineStart(lead) && !lead.startsWith('Example')
      enriched.push({
        type: 'static',
        text: needsBullet ? `• ${lead}${lead.endsWith(' ') ? '' : ' '}` : `${lead}${lead.endsWith(' ') ? '' : ' '}`,
      })
    } else if (question) {
      enriched.push({ type: 'static', text: '– ' })
    }

    enriched.push(block)

    if (question?.gapTrail?.trim()) {
      enriched.push({ type: 'static', text: question.gapTrail })
    }
  }

  return enriched
}

/** Gom static + gap thành dòng inline giống đề giấy (Part 1 form · Part 4 lecture). */
export function groupNotePassageIntoLines(
  blocks: ListeningNotePassageBlock[],
): NotePassageRenderLine[] {
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