import type {
  ReadingNoteTable,
  ReadingNoteTableCell,
  ReadingNoteTableCellBlock,
  ReadingNoteTableRow,
} from './examData'
import type { ReadingImportQuestionGroupJson } from './importReadingManualUtils'

const CELL_BLOCK_TYPES = new Set(['static', 'gap', 'break'])

function asCellBlocks(raw: unknown): ReadingNoteTableCellBlock[] {
  if (!Array.isArray(raw)) return []
  const blocks: ReadingNoteTableCellBlock[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const block = item as Record<string, unknown>
    const type = String(block.type ?? '').trim()
    if (!CELL_BLOCK_TYPES.has(type)) continue
    blocks.push({
      type: type as ReadingNoteTableCellBlock['type'],
      ...(typeof block.text === 'string' ? { text: block.text } : {}),
      ...(typeof block.number === 'number' ? { number: block.number } : {}),
    })
  }
  return blocks
}

export interface ParsedReadingNoteTableCell {
  skip: boolean
  rowSpan?: number
  colSpan?: number
  blocks: ReadingNoteTableCellBlock[]
}

export function parseReadingNoteTableCell(raw: ReadingNoteTableCell | unknown): ParsedReadingNoteTableCell {
  if (Array.isArray(raw)) {
    return { skip: false, blocks: asCellBlocks(raw) }
  }
  if (!raw || typeof raw !== 'object') {
    return { skip: false, blocks: [] }
  }

  const obj = raw as Record<string, unknown>
  if (obj.skip === true) {
    return { skip: true, blocks: [] }
  }

  const blocks = asCellBlocks(obj.blocks ?? obj.content)
  const rowSpan = typeof obj.rowSpan === 'number' && obj.rowSpan > 1 ? obj.rowSpan : undefined
  const colSpan = typeof obj.colSpan === 'number' && obj.colSpan > 1 ? obj.colSpan : undefined

  return { skip: false, rowSpan, colSpan, blocks }
}

function normalizeCell(raw: unknown): ReadingNoteTableCell {
  if (Array.isArray(raw)) {
    return asCellBlocks(raw)
  }
  if (!raw || typeof raw !== 'object') {
    return []
  }

  const obj = raw as Record<string, unknown>
  if (obj.skip === true) {
    return { skip: true }
  }

  const blocks = asCellBlocks(obj.blocks ?? obj.content)
  const rowSpan = typeof obj.rowSpan === 'number' && obj.rowSpan > 1 ? obj.rowSpan : undefined
  const colSpan = typeof obj.colSpan === 'number' && obj.colSpan > 1 ? obj.colSpan : undefined

  if (rowSpan || colSpan) {
    return {
      ...(rowSpan ? { rowSpan } : {}),
      ...(colSpan ? { colSpan } : {}),
      blocks,
    }
  }

  return blocks
}

function normalizeCellMatrix(raw: unknown, columnCount: number): ReadingNoteTableCell[] {
  if (!Array.isArray(raw)) {
    return Array.from({ length: columnCount }, () => [])
  }

  const cells = raw.map(cell => normalizeCell(cell))
  while (cells.length < columnCount) {
    cells.push([])
  }
  return cells.slice(0, columnCount)
}

/** Gom số gap từ bảng (mọi ô, mọi dòng). */
export function gapNumbersInReadingNoteTable(table: ReadingNoteTable | undefined): number[] {
  if (!table?.rows?.length) return []
  const numbers: number[] = []
  for (const row of table.rows) {
    for (const cell of row.cells) {
      const { skip, blocks } = parseReadingNoteTableCell(cell)
      if (skip) continue
      for (const block of blocks) {
        if (block.type === 'gap' && typeof block.number === 'number') {
          numbers.push(block.number)
        }
      }
    }
  }
  return numbers
}

/** Chuẩn hóa bảng n cột × n dòng — pad ô thiếu, sync gapNumbers. */
export function normalizeReadingNoteTable(
  raw: ReadingNoteTable | Record<string, unknown> | undefined,
): ReadingNoteTable | undefined {
  if (!raw || typeof raw !== 'object') return undefined

  const obj = raw as Record<string, unknown>
  const headers = Array.isArray(obj.headers)
    ? obj.headers.map(h => String(h ?? '').trim()).filter(Boolean)
    : []
  if (!headers.length) return undefined

  const columnCount = headers.length
  const rawRows = Array.isArray(obj.rows) ? obj.rows : []
  const rows: ReadingNoteTableRow[] = rawRows.map(row => {
    const r = row as Record<string, unknown>
    return { cells: normalizeCellMatrix(r.cells, columnCount) }
  })

  if (!rows.length) return undefined

  const gapNumbers = gapNumbersInReadingNoteTable({ headers, rows })
  const title = typeof obj.title === 'string' && obj.title.trim() ? obj.title.trim() : undefined
  const instruction = typeof obj.instruction === 'string' && obj.instruction.trim()
    ? obj.instruction.trim()
    : undefined

  return {
    headers,
    rows,
    ...(title ? { title } : {}),
    ...(instruction ? { instruction } : {}),
    ...(gapNumbers.length ? { gapNumbers } : {}),
  }
}

export function validateReadingNoteTable(
  table: ReadingNoteTable | undefined,
  gapQuestionNumbers: number[],
  partLabel: string,
): string[] {
  if (!table?.rows?.length) return []
  if (!gapQuestionNumbers.length) return []

  const warnings: string[] = []
  const gapSet = new Set(gapQuestionNumbers)
  const tableGapNumbers = gapNumbersInReadingNoteTable(table)

  if (!table.headers?.length) {
    warnings.push(`${partLabel}: noteTable thiếu headers.`)
  }

  for (const row of table.rows) {
    if (row.cells.length !== table.headers.length) {
      warnings.push(
        `${partLabel}: noteTable hàng có ${row.cells.length} ô — cần ${table.headers.length} cột.`,
      )
      break
    }
  }

  for (const number of tableGapNumbers) {
    if (!gapSet.has(number)) {
      warnings.push(`${partLabel}: noteTable gap ${number} không có trong questions.`)
    }
  }

  for (const number of gapQuestionNumbers) {
    if (!tableGapNumbers.includes(number)) {
      warnings.push(`${partLabel}: câu ${number} thiếu trong noteTable (table-completion).`)
    }
  }

  return warnings
}

function gapNumbersInGroup(group: ReadingImportQuestionGroupJson): number[] {
  return group.questions
    .filter(q => q.type === 'gap-fill')
    .map(q => q.number)
}

function findTemplateTableGroup(
  group: ReadingImportQuestionGroupJson,
  templateGroups: ReadingImportQuestionGroupJson[],
  used: Set<number>,
): ReadingImportQuestionGroupJson | undefined {
  const gapNums = new Set(gapNumbersInGroup(group))
  if (!gapNums.size) return undefined

  let best: { idx: number; group: ReadingImportQuestionGroupJson; score: number } | undefined

  templateGroups.forEach((tg, idx) => {
    if (used.has(idx) || !tg.noteTable?.headers?.length) return
    const tableGaps = gapNumbersInReadingNoteTable(tg.noteTable)
    if (!tableGaps.length) return
    const overlap = tableGaps.filter(n => gapNums.has(n)).length
    if (!overlap) return
    const score = overlap === tableGaps.length && overlap === gapNums.size ? overlap + 100 : overlap
    if (!best || score > best.score) {
      best = { idx, group: tg, score }
    }
  })

  if (!best) return undefined
  used.add(best.idx)
  return best.group
}

/** Gắn noteTable từ template khi AI/import thiếu bảng (table-completion). */
export function mergeTemplateNoteTables(
  part: { questionGroups: ReadingImportQuestionGroupJson[] },
  templatePart: { questionGroups: ReadingImportQuestionGroupJson[] },
): { questionGroups: ReadingImportQuestionGroupJson[] } {
  const templateTableGroups = templatePart.questionGroups.filter(
    g => g.noteTable?.headers?.length,
  )
  if (!templateTableGroups.length) return part

  const used = new Set<number>()

  const questionGroups: ReadingImportQuestionGroupJson[] = part.questionGroups.map(group => {
    const gapNums = gapNumbersInGroup(group)
    if (!gapNums.length) return group

    const normalized = group.noteTable
      ? normalizeReadingNoteTable(group.noteTable)
      : undefined

    if (normalized?.headers?.length && normalized.rows?.length) {
      const tableType = group.type === 'summary-completion' || group.type === 'gap-fill'
        ? group.type === 'summary-completion' ? 'gap-fill' as const : group.type
        : 'gap-fill' as const
      return {
        ...group,
        type: tableType,
        noteTable: normalized,
      }
    }

    const templateGroup = findTemplateTableGroup(group, templateTableGroups, used)
    if (!templateGroup?.noteTable) return group

    const noteTable = normalizeReadingNoteTable(templateGroup.noteTable)
    if (!noteTable) return group

    return {
      ...group,
      type: 'gap-fill' as const,
      noteTable,
    }
  })

  return { ...part, questionGroups }
}

export function normalizeReadingImportNoteTables(
  questionGroups: ReadingImportQuestionGroupJson[],
): ReadingImportQuestionGroupJson[] {
  return questionGroups.map(group => {
    if (!group.noteTable) return group
    const noteTable = normalizeReadingNoteTable(group.noteTable)
    if (!noteTable) {
      const { noteTable: _removed, ...rest } = group
      return rest
    }
    return { ...group, noteTable }
  })
}