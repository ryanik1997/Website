import type {
  ReadingNoteTable,
  ReadingNoteTableCell,
  ReadingNoteTableCellBlock,
  ReadingNoteTableRow,
} from './examData'
import type { ReadingImportQuestionGroupJson } from './importReadingManualUtils'

const FINAL_CELL_BLOCK_TYPES = new Set(['static', 'gap', 'break'])

/**
 * Parse text ô AI (string) thành blocks — hỗ trợ:
 *  - "7________" / "7 ______" / "[7]" / "(7)" / "___7___" / "{{7}}"
 *  - xuống dòng → break
 */
export function parseReadingTableCellText(text: string): ReadingNoteTableCellBlock[] {
  const source = text.replace(/\r\n/g, '\n')
  if (!source.trim()) return []

  const gapRe = /(\d{1,2})\s*_{2,}|_{2,}\s*(\d{1,2})\b|\[\s*(\d{1,2})\s*\]|\(\s*(\d{1,2})\s*\)|\{\{\s*(\d{1,2})\s*\}\}|__+(\d{1,2})__+/g
  const blocks: ReadingNoteTableCellBlock[] = []

  const pushLine = (line: string) => {
    let last = 0
    const matches = [...line.matchAll(gapRe)]
    if (!matches.length) {
      if (line) blocks.push({ type: 'static', text: line })
      return
    }
    for (const m of matches) {
      const idx = m.index ?? 0
      if (idx > last) {
        blocks.push({ type: 'static', text: line.slice(last, idx) })
      }
      const num = Number(m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5] ?? m[6])
      if (Number.isFinite(num) && num > 0) {
        blocks.push({ type: 'gap', number: num })
      }
      last = idx + m[0].length
    }
    if (last < line.length) {
      blocks.push({ type: 'static', text: line.slice(last) })
    }
  }

  const lines = source.split('\n')
  lines.forEach((line, i) => {
    if (i > 0) blocks.push({ type: 'break' })
    pushLine(line)
  })

  return blocks
}

function aliasBlockType(raw: string): ReadingNoteTableCellBlock['type'] | null {
  const type = raw.trim().toLowerCase()
  if (type === 'static' || type === 'text' || type === 'label' || type === 'content') return 'static'
  if (type === 'gap' || type === 'blank' || type === 'input' || type === 'answer') return 'gap'
  if (type === 'break' || type === 'newline' || type === 'br') return 'break'
  return FINAL_CELL_BLOCK_TYPES.has(type) ? type as ReadingNoteTableCellBlock['type'] : null
}

function asCellBlocks(raw: unknown): ReadingNoteTableCellBlock[] {
  if (typeof raw === 'string') {
    return parseReadingTableCellText(raw)
  }
  if (!Array.isArray(raw)) return []
  const blocks: ReadingNoteTableCellBlock[] = []
  for (const item of raw) {
    if (typeof item === 'string') {
      blocks.push(...parseReadingTableCellText(item))
      continue
    }
    if (!item || typeof item !== 'object') continue
    const block = item as Record<string, unknown>
    const type = aliasBlockType(String(block.type ?? ''))
    if (!type) continue
    const number = typeof block.number === 'number'
      ? block.number
      : typeof block.q === 'number'
        ? block.q
        : typeof block.question === 'number'
          ? block.question
          : undefined
    blocks.push({
      type,
      ...(typeof block.text === 'string' ? { text: block.text } : {}),
      ...(typeof number === 'number' ? { number } : {}),
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
  if (typeof raw === 'string') {
    return { skip: false, blocks: parseReadingTableCellText(raw) }
  }
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

  // AI đôi khi: { text: "…7________…" } không có blocks
  let blocks = asCellBlocks(obj.blocks ?? obj.content)
  if (!blocks.length && typeof obj.text === 'string') {
    blocks = parseReadingTableCellText(obj.text)
  }
  const rowSpan = typeof obj.rowSpan === 'number' && obj.rowSpan > 1 ? obj.rowSpan : undefined
  const colSpan = typeof obj.colSpan === 'number' && obj.colSpan > 1 ? obj.colSpan : undefined

  return { skip: false, rowSpan, colSpan, blocks }
}

function normalizeCell(raw: unknown): ReadingNoteTableCell {
  if (typeof raw === 'string') {
    return parseReadingTableCellText(raw)
  }
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

  let blocks = asCellBlocks(obj.blocks ?? obj.content)
  if (!blocks.length && typeof obj.text === 'string') {
    blocks = parseReadingTableCellText(obj.text)
  }
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

/** Hàng AI: { cells } | mảng ô | string[] */
function normalizeTableRow(row: unknown, columnCount: number): ReadingNoteTableRow {
  if (Array.isArray(row)) {
    return { cells: normalizeCellMatrix(row, columnCount) }
  }
  if (!row || typeof row !== 'object') {
    return { cells: normalizeCellMatrix([], columnCount) }
  }
  const r = row as Record<string, unknown>
  // AI: { cells } | { columns } | { values }
  const cellsRaw = r.cells ?? r.columns ?? r.values ?? r.cols
  return { cells: normalizeCellMatrix(cellsRaw, columnCount) }
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

/**
 * Chuẩn hóa bảng **n cột × m dòng** (n = headers.length, m = rows.length).
 * Mọi hàng được pad/cắt về đúng n ô — luôn áp dụng lưới đều.
 */
export function normalizeReadingNoteTable(
  raw: ReadingNoteTable | Record<string, unknown> | undefined,
): ReadingNoteTable | undefined {
  if (!raw || typeof raw !== 'object') return undefined

  const obj = raw as Record<string, unknown>
  // Giữ header rỗng '' (cột nhãn hàng trái: Farm type / Intensive…) — KHÔNG filter(Boolean)
  // Bug cũ: filter bỏ '' → 4 cột thành 3 → mất cột Sale + gap 6 (r1st aeroponic)
  const headers = Array.isArray(obj.headers)
    ? obj.headers.map(h => (h == null ? '' : String(h).trim()))
    : []
  // Cần ≥1 header; cho phép một số ô header trống
  if (!headers.length) return undefined
  if (!headers.some(h => h.length > 0) && headers.length < 2) return undefined

  const columnCount = headers.length
  // AI: rows | data | body
  const rawRows = Array.isArray(obj.rows)
    ? obj.rows
    : Array.isArray(obj.data)
      ? obj.data
      : Array.isArray(obj.body)
        ? obj.body
        : []
  const rows: ReadingNoteTableRow[] = rawRows.map(row => normalizeTableRow(row, columnCount))

  if (!rows.length) return undefined

  // Đảm bảo sau pad: mọi hàng đúng n cột
  for (const row of rows) {
    if (row.cells.length !== columnCount) {
      row.cells = normalizeCellMatrix(row.cells, columnCount)
    }
  }

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

/** Số cột n (headers) — dùng validate / AI. */
export function readingNoteTableColumnCount(table: ReadingNoteTable | undefined): number {
  return table?.headers?.length ?? 0
}

/** Số dòng data m (không tính header). */
export function readingNoteTableRowCount(table: ReadingNoteTable | undefined): number {
  return table?.rows?.length ?? 0
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
  const n = table.headers?.length ?? 0
  const m = table.rows.length

  if (!n) {
    warnings.push(`${partLabel}: noteTable thiếu headers (cần n cột).`)
  }

  if (n > 0 && m > 0) {
    for (let i = 0; i < m; i += 1) {
      const cellCount = table.rows[i]?.cells?.length ?? 0
      if (cellCount !== n) {
        warnings.push(
          `${partLabel}: noteTable hàng ${i + 1}/${m} có ${cellCount} ô — lưới n×m yêu cầu ${n} cột.`,
        )
        break
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
      warnings.push(`${partLabel}: câu ${number} thiếu trong noteTable (table-completion).`)
    }
  }

  return warnings
}

function isGapLikeQuestion(q: { type?: string; number?: number; prompt?: string }): boolean {
  const t = String(q.type ?? '').toLowerCase()
  if (t === 'gap-fill' || t === 'sentence-completion' || t === 'summary-completion' || t === 'table-completion') {
    return true
  }
  // AI hay bỏ type — coi mọi câu có number là gap khi nhóm table/gap
  if (!t || t === 'short-answer' || t === 'one-word' || t === 'fill') return true
  return false
}

/** Chỉ table completion — KHÔNG gồm summary / notes / sentence. */
export function isReadingTableInstruction(instruction?: string): boolean {
  const s = instruction ?? ''
  if (/complete the summary|summary below/i.test(s)) return false
  if (/complete the notes|notes below/i.test(s)) return false
  if (/complete the sentences|sentences below/i.test(s)) return false
  return /complete the table|table below|table completion/i.test(s)
}

/** Summary gap-fill (note inline) — tuyệt đối không gắn noteTable. */
export function isReadingSummaryInstruction(instruction?: string): boolean {
  return /complete the summary|summary below/i.test(instruction ?? '')
}

export function isReadingNotesInstruction(instruction?: string): boolean {
  return /complete the notes|notes below/i.test(instruction ?? '')
}

/** Nhóm không được có noteTable (summary / notes / sentence / MC…). */
export function groupMustNotHaveNoteTable(group: {
  instruction?: string
  note?: string
  notePassage?: unknown[]
  type?: string
}): boolean {
  if (isReadingSummaryInstruction(group.instruction)) return true
  if (isReadingNotesInstruction(group.instruction)) return true
  if (/complete the sentences|sentences below/i.test(group.instruction ?? '')) return true
  if (group.notePassage?.length) return true
  // Summary-style note với gap inline (32________) — ưu tiên note, không table
  if (group.note && /\d{1,2}_{2,}/.test(group.note) && !isReadingTableInstruction(group.instruction)) {
    return true
  }
  if (group.type === 'tfng' || group.type === 'ynng' || group.type === 'multiple-choice'
    || group.type === 'matching-headings' || group.type === 'matching-paragraph'
    || group.type === 'matching-features') {
    return true
  }
  return false
}

function gapNumbersInGroup(group: ReadingImportQuestionGroupJson): number[] {
  const typed = group.questions
    .filter(q => isGapLikeQuestion(q))
    .map(q => q.number)
    .filter((n): n is number => typeof n === 'number' && n > 0)
  if (typed.length) return typed

  // Fallback: mọi câu trong nhóm gap-fill / table-completion (không summary)
  const gType = String(group.type ?? '').toLowerCase()
  if (
    gType === 'gap-fill'
    || gType === 'sentence-completion'
    || gType === 'summary-completion'
    || gType === 'table-completion'
    || group.noteTable
    || isReadingTableInstruction(group.instruction)
  ) {
    return group.questions
      .map(q => q.number)
      .filter((n): n is number => typeof n === 'number' && n > 0)
  }
  return []
}

function groupHasTableGaps(group: ReadingImportQuestionGroupJson): boolean {
  return gapNumbersInGroup(group).length > 0
}

/** Tổng độ dài chữ static trong bảng (không tính gap/skip). */
export function noteTableStaticTextLength(table: ReadingNoteTable | undefined): number {
  if (!table?.rows?.length) return 0
  let n = 0
  for (const row of table.rows) {
    for (const cell of row.cells) {
      const { skip, blocks } = parseReadingNoteTableCell(cell)
      if (skip) continue
      for (const b of blocks) {
        if (b.type === 'static' && b.text) n += b.text.trim().length
      }
    }
  }
  return n
}

/**
 * Bảng “có nội dung” — DeepSeek hay trả headers+gap rỗng (0 static).
 * Cần static text thật (nhãn Aim/Method, bullet…) chứ không chỉ ô trống + input.
 */
export function noteTableIsContentRich(table: ReadingNoteTable | undefined): boolean {
  if (!table?.headers?.length || !table.rows?.length) return false
  const gaps = gapNumbersInReadingNoteTable(table)
  const staticLen = noteTableStaticTextLength(table)
  if (staticLen >= 40) return true
  // Ít gap nhưng có text ngắn vẫn OK (vd. 1–2 ô nhãn)
  if (gaps.length > 0 && staticLen >= Math.max(12, gaps.length * 6)) return true
  if (gaps.length === 0 && staticLen >= 20) return true
  return false
}

/** Đếm hàng không có gap (nhãn Aim / bullet tĩnh trên đề giấy). */
export function noteTableStaticOnlyRowCount(table: ReadingNoteTable | undefined): number {
  if (!table?.rows?.length) return 0
  let n = 0
  for (const row of table.rows) {
    let hasGap = false
    let hasStatic = false
    for (const cell of row.cells) {
      const { skip, blocks } = parseReadingNoteTableCell(cell)
      if (skip) continue
      for (const b of blocks) {
        if (b.type === 'gap') hasGap = true
        if (b.type === 'static' && (b.text?.trim().length ?? 0) > 0) hasStatic = true
      }
    }
    if (hasStatic && !hasGap) n += 1
  }
  return n
}

/**
 * Bảng thiếu so với đề / SAMPLE:
 * DeepSeek hay trả “nửa vời” (4–6 hàng có chữ) → không đủ Aim/Method/Findings.
 * Khi có template: so sánh chặt với số hàng + hàng tĩnh SAMPLE.
 */
export function isListLikeOrIncompleteNoteTable(
  table: ReadingNoteTable | undefined,
  templateTable?: ReadingNoteTable,
): boolean {
  if (!table?.headers?.length || !table.rows?.length) return true
  const gaps = gapNumbersInReadingNoteTable(table)
  const staticLen = noteTableStaticTextLength(table)
  const rows = table.rows.length
  const staticOnly = noteTableStaticOnlyRowCount(table)

  if (!gaps.length) return staticLen < 40

  // Mỗi gap ≈ 1 hàng, không hàng tĩnh phụ → list one-word
  if (rows <= gaps.length + 1 && staticOnly === 0) return true
  if (rows <= gaps.length + 1 && staticLen < gaps.length * 45) return true
  // Text trung bình / gap quá ngắn
  if (staticLen / gaps.length < 28 && staticOnly <= 1) return true

  // So với SAMPLE — NGƯỠNG CHẶT (DeepSeek nửa vời hay lọt ngưỡng cũ 0.55)
  if (templateTable?.rows?.length) {
    const tplRows = templateTable.rows.length
    const tplStatic = noteTableStaticTextLength(templateTable)
    const tplStaticOnly = noteTableStaticOnlyRowCount(templateTable)
    // Ít hơn 85% số hàng SAMPLE → thiếu (vd. SAMPLE 11, AI 7 → incomplete)
    if (tplRows >= 6 && rows < Math.ceil(tplRows * 0.85)) return true
    // Static ngắn hơn 55% SAMPLE
    if (tplStatic >= 150 && staticLen < tplStatic * 0.55) return true
    // Thiếu hàng tĩnh (Aim không gap…) so với SAMPLE
    if (tplStaticOnly >= 2 && staticOnly < Math.max(1, Math.floor(tplStaticOnly * 0.5))) return true
  }
  return false
}

/** True nếu nhóm table của part cần repair AI (thiếu hàng/static). */
export function partNeedsNoteTableRepair(
  part: { questionGroups: ReadingImportQuestionGroupJson[] },
  templatePart?: { questionGroups: ReadingImportQuestionGroupJson[] },
): boolean {
  const tplTables = (templatePart?.questionGroups ?? [])
    .map(g => g.noteTable)
    .filter(Boolean) as ReadingNoteTable[]
  let tplI = 0
  for (const g of part.questionGroups) {
    if (!g.noteTable?.headers?.length && !g.questions.some(q => isGapLikeQuestion(q))) continue
    const gaps = g.questions.filter(q => isGapLikeQuestion(q))
    if (!gaps.length) continue
    if (groupMustNotHaveNoteTable(g)) continue
    // Chỉ nhóm table thật
    const isTableGroup = Boolean(g.noteTable?.headers?.length)
      || isReadingTableInstruction(g.instruction)
    if (!isTableGroup) continue
    const tpl = tplTables[tplI++]
    if (isListLikeOrIncompleteNoteTable(g.noteTable, tpl)) return true
  }
  return false
}

function isGenericGapPrompt(prompt: string | undefined): boolean {
  const p = String(prompt ?? '').trim()
  return !p || /^gap\s*\(\s*\d+\s*\)$/i.test(p)
}

/** Prompt one-word có text đề (không chỉ "Gap (7)"). */
export function questionsHaveRichGapPrompts(
  questions: ReadingImportQuestionGroupJson['questions'] | undefined,
): boolean {
  if (!questions?.length) return false
  const rich = questions.filter(q => {
    if (!isGapLikeQuestion(q) && q.type) return false
    return !isGenericGapPrompt(q.prompt)
  })
  return rich.length >= Math.max(1, Math.ceil(questions.length * 0.5))
}

/** Bảng “hợp lệ” = headers + rows + gap/static **và** có nội dung chữ (không phải khung rỗng). */
function groupHasValidNoteTable(group: ReadingImportQuestionGroupJson): boolean {
  const normalized = group.noteTable ? normalizeReadingNoteTable(group.noteTable) : undefined
  if (!normalized?.headers?.length || !normalized.rows?.length) return false
  return noteTableIsContentRich(normalized)
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
    // Summary / notes — không merge table
    if (groupMustNotHaveNoteTable(group)) {
      if (group.noteTable) {
        const { noteTable: _t, ...rest } = group
        return rest
      }
      return group
    }

    const gapNums = gapNumbersInGroup(group)
    if (!gapNums.length) return group

    const normalized = group.noteTable
      ? normalizeReadingNoteTable(group.noteTable)
      : undefined

    // Chỉ giữ noteTable AI khi instruction table (hoặc SAMPLE sẽ force)
    if (
      normalized
      && groupHasValidNoteTable({ ...group, noteTable: normalized })
      && (isReadingTableInstruction(group.instruction) || group.noteTable)
    ) {
      // Nếu có note summary + noteTable → ưu tiên note, bỏ table
      if (group.note && /\d{1,2}_{2,}/.test(group.note) && !isReadingTableInstruction(group.instruction)) {
        const { noteTable: _t, ...rest } = group
        return rest
      }
      return {
        ...group,
        type: 'gap-fill' as const,
        noteTable: normalized,
        questions: ensureGapQuestionTypes(group.questions),
      }
    }

    // Chỉ tìm template table khi instruction là table
    if (!isReadingTableInstruction(group.instruction) && !group.noteTable?.headers?.length) {
      return group
    }

    const templateGroup = findTemplateTableGroup(group, templateTableGroups, used)
    if (!templateGroup?.noteTable) return group
    if (groupMustNotHaveNoteTable(group)) return group

    const noteTable = normalizeReadingNoteTable(templateGroup.noteTable)
    if (!noteTable) return group

    return {
      ...group,
      type: 'gap-fill' as const,
      noteTable,
      questions: ensureGapQuestionTypes(group.questions),
    }
  })

  return { ...part, questionGroups }
}

/**
 * Gắn noteTable theo vị trí nhóm trong template (r1tb, r1tt, r1nt…)
 * khi merge theo gap thất bại — AI hay trả one-word list / `note` inline thay vì noteTable.
 *
 * Ngoài map theo index: nếu template chỉ có 1 nhóm table mà AI lệch index,
 * gắn vào nhóm gap-fill còn thiếu bảng.
 */
export function forceTemplateTablesByIndex(
  part: { questionGroups: ReadingImportQuestionGroupJson[] },
  templatePart: { questionGroups: ReadingImportQuestionGroupJson[] },
): { questionGroups: ReadingImportQuestionGroupJson[] } {
  const usedTplIdx = new Set<number>()

  let questionGroups = part.questionGroups.map((group, idx) => {
    const tplGroup = templatePart.questionGroups[idx]
    if (!tplGroup?.noteTable?.headers?.length) return group
    // Summary / notes — không force table dù index trùng
    if (groupMustNotHaveNoteTable(group)) return group
    if (!groupHasTableGaps(group) && !isReadingTableInstruction(group.instruction)) {
      if (!isReadingTableInstruction(group.instruction) && !/table/i.test(group.range ?? '')) {
        return group
      }
    }
    if (groupHasValidNoteTable(group)) {
      usedTplIdx.add(idx)
      const normalized = normalizeReadingNoteTable(group.noteTable) ?? group.noteTable
      return {
        ...group,
        type: 'gap-fill' as const,
        note: undefined,
        notePassage: undefined,
        noteTable: normalized,
        // Giữ prompt gốc — rematerialize cần text để enrich nếu bảng nghèo
        questions: ensureGapQuestionTypes(group.questions),
      }
    }

    const baseTable = normalizeReadingNoteTable(tplGroup.noteTable)
    if (!baseTable) return group
    usedTplIdx.add(idx)

    const qs = ensureGapQuestionTypes(group.questions)
    const nums = gapNumbersInGroup({ ...group, questions: qs })
    const noteTable = nums.length ? remapReadingNoteTableGaps(baseTable, nums) : baseTable

    const { note: _note, notePassage: _np, ...rest } = group
    return {
      ...rest,
      type: 'gap-fill' as const,
      range: group.range || tplGroup.range,
      instruction: group.instruction || tplGroup.instruction,
      noteTable,
      questions: qs,
    }
  })

  // Fallback: template table group chưa gắn → tìm nhóm gap còn thiếu noteTable
  templatePart.questionGroups.forEach((tplGroup, tplIdx) => {
    if (usedTplIdx.has(tplIdx) || !tplGroup.noteTable?.headers?.length) return
    const noteTable = normalizeReadingNoteTable(tplGroup.noteTable)
    if (!noteTable) return

    const targetIdx = questionGroups.findIndex((g, i) => {
      if (groupHasValidNoteTable(g)) return false
      if (!groupHasTableGaps(g) && !/table|one word|complete/i.test(`${g.instruction ?? ''} ${g.range ?? ''}`)) {
        return false
      }
      // Ưu tiên index trùng; nếu không thì nhóm gap-fill đầu tiên còn trống
      return i === tplIdx || g.type === 'gap-fill' || g.type === 'sentence-completion' || g.type === 'summary-completion'
    })
    if (targetIdx < 0) return

    const group = questionGroups[targetIdx]
    const qs = ensureGapQuestionTypes(group.questions)
    const nums = gapNumbersInGroup({ ...group, questions: qs })
    const remapped = nums.length ? remapReadingNoteTableGaps(noteTable, nums) : noteTable
    const { note: _n, notePassage: _np, ...rest } = group
    questionGroups = questionGroups.map((g, i) => {
      if (i !== targetIdx) return g
      return {
        ...rest,
        type: 'gap-fill' as const,
        range: group.range || tplGroup.range,
        instruction: group.instruction || tplGroup.instruction,
        noteTable: remapped,
        questions: qs,
      }
    })
    usedTplIdx.add(tplIdx)
  })

  return { ...part, questionGroups }
}

function ensureGapQuestionTypes(
  questions: ReadingImportQuestionGroupJson['questions'],
): ReadingImportQuestionGroupJson['questions'] {
  return questions.map(q => {
    if (q.type === 'gap-fill' || q.type === 'sentence-completion') return q
    const t = String(q.type ?? '').toLowerCase()
    if (
      t === 'true-false-not-given'
      || t === 'yes-no-not-given'
      || t.startsWith('matching')
      || t === 'multiple-choice'
    ) {
      return q
    }
    const number = typeof q.number === 'number' ? q.number : 0
    return {
      ...q,
      type: 'gap-fill' as const,
      prompt: (q.prompt && String(q.prompt).trim()) || (number ? `Gap (${number})` : q.prompt),
    }
  })
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

// ── Rematerialize table (DeepSeek hay trả one-word list) ──────────────────

function mapCellGaps(
  cell: ReadingNoteTableCell,
  remap: Map<number, number>,
  dropUnmapped: boolean,
): ReadingNoteTableCell | null {
  const parsed = parseReadingNoteTableCell(cell)
  if (parsed.skip) return { skip: true }

  const blocks: ReadingNoteTableCellBlock[] = []
  for (const b of parsed.blocks) {
    if (b.type !== 'gap' || typeof b.number !== 'number') {
      blocks.push(b)
      continue
    }
    const next = remap.get(b.number)
    if (typeof next === 'number') {
      blocks.push({ type: 'gap', number: next })
    } else if (!dropUnmapped) {
      // Giữ gap gốc nếu không map
      blocks.push(b)
    }
    // dropUnmapped + không map → bỏ gap (template thừa)
  }

  if (parsed.rowSpan || parsed.colSpan) {
    return {
      ...(parsed.rowSpan ? { rowSpan: parsed.rowSpan } : {}),
      ...(parsed.colSpan ? { colSpan: parsed.colSpan } : {}),
      blocks,
    }
  }
  return blocks
}

/**
 * Đổi số gap trong noteTable theo danh sách câu AI (theo thứ tự).
 * SAMPLE Rocha 7–13 + AI Q7–12 → map 7→7…12→12, bỏ gap 13.
 */
export function remapReadingNoteTableGaps(
  table: ReadingNoteTable,
  targetGapNumbers: number[],
): ReadingNoteTable {
  const sourceGaps = gapNumbersInReadingNoteTable(table)
  const targets = targetGapNumbers.filter(n => Number.isFinite(n) && n > 0)
  if (!sourceGaps.length || !targets.length) return table

  const remap = new Map<number, number>()
  const n = Math.min(sourceGaps.length, targets.length)
  for (let i = 0; i < n; i += 1) {
    remap.set(sourceGaps[i], targets[i])
  }
  const dropUnmapped = sourceGaps.length > targets.length

  const rows = table.rows.map(row => ({
    cells: row.cells.map(cell => {
      const next = mapCellGaps(cell, remap, dropUnmapped)
      return next ?? []
    }),
  }))

  const gapNumbers = gapNumbersInReadingNoteTable({ ...table, rows })
  return {
    ...table,
    rows,
    ...(gapNumbers.length ? { gapNumbers } : { gapNumbers: undefined }),
  }
}

/**
 * AI trả list one-word (prompt dài) → dựng noteTable 2 cột từ **nội dung prompt**.
 * Không dùng khi prompt chỉ là "Gap (n)" (sẽ ra bảng rỗng).
 */
export function buildNoteTableFromGapQuestions(
  group: ReadingImportQuestionGroupJson,
): ReadingNoteTable | undefined {
  const questions = ensureGapQuestionTypes(group.questions ?? []).filter(q => {
    const t = String(q.type ?? '').toLowerCase()
    return t === 'gap-fill' || t === 'sentence-completion' || !t || isGapLikeQuestion(q)
  })
  if (!questions.length) return undefined

  // Cần ít nhất 1 prompt có chữ — nếu toàn Gap(n) thì caller nên dùng template
  if (!questionsHaveRichGapPrompts(questions)) return undefined

  const rows: ReadingNoteTableRow[] = questions.map(q => {
    const prompt = String(q.prompt ?? '').trim()
    let blocks: ReadingNoteTableCellBlock[]
    if (isGenericGapPrompt(prompt)) {
      blocks = [{ type: 'gap', number: q.number }]
    } else {
      const withMarker = /\d{1,2}\s*_{2,}|_{2,}|\(\s*\d{1,2}\s*\)|\[\s*\d{1,2}\s*\]/.test(prompt)
        ? prompt
        : `${prompt.replace(/_+$/g, '').trim()} ${q.number}________`
      blocks = parseReadingTableCellText(withMarker)
      if (!blocks.some(b => b.type === 'gap')) {
        blocks = [...blocks, { type: 'gap', number: q.number }]
      } else {
        blocks = blocks.map(b =>
          b.type === 'gap' ? { type: 'gap' as const, number: q.number } : b,
        )
      }
    }
    // Cột trái: nhãn ngắn nếu prompt có ":" / "—" trước blank
    const labelMatch = prompt.match(/^([^:–—]{2,40})\s*[:–—]/)
    const leftLabel = labelMatch?.[1]?.trim()
    return {
      cells: [
        [{ type: 'static', text: leftLabel || String(q.number) }],
        blocks,
      ],
    }
  })

  return {
    headers: ['Section', 'Details'],
    rows,
    gapNumbers: questions.map(q => q.number),
  }
}

/**
 * Bảng khung rỗng (chỉ gap) + prompt giàu → nhét text prompt quanh từng gap.
 */
export function enrichNoteTableWithPrompts(
  table: ReadingNoteTable,
  questions: ReadingImportQuestionGroupJson['questions'],
): ReadingNoteTable {
  if (noteTableIsContentRich(table)) return table
  if (!questionsHaveRichGapPrompts(questions)) return table

  const byNum = new Map(
    questions.filter(q => typeof q.number === 'number').map(q => [q.number, q]),
  )

  const rows = table.rows.map(row => ({
    cells: row.cells.map(cell => {
      const parsed = parseReadingNoteTableCell(cell)
      if (parsed.skip) return cell
      const gapBlocks = parsed.blocks.filter(b => b.type === 'gap' && typeof b.number === 'number')
      if (!gapBlocks.length) return cell

      const staticLen = parsed.blocks
        .filter(b => b.type === 'static')
        .reduce((s, b) => s + (b.text?.trim().length ?? 0), 0)
      if (staticLen >= 12) return cell

      // 1 gap/ô nghèo → thay bằng prompt
      if (gapBlocks.length === 1) {
        const num = gapBlocks[0].number as number
        const q = byNum.get(num)
        if (!q || isGenericGapPrompt(q.prompt)) return cell
        const prompt = String(q.prompt).trim()
        const withMarker = /\d{1,2}\s*_{2,}|_{2,}/.test(prompt)
          ? prompt
          : `${prompt.replace(/_+$/g, '').trim()} ${num}________`
        let blocks = parseReadingTableCellText(withMarker)
        if (!blocks.some(b => b.type === 'gap')) {
          blocks = [...blocks, { type: 'gap', number: num }]
        } else {
          blocks = blocks.map(b => (b.type === 'gap' ? { type: 'gap' as const, number: num } : b))
        }
        if (parsed.rowSpan || parsed.colSpan) {
          return {
            ...(parsed.rowSpan ? { rowSpan: parsed.rowSpan } : {}),
            ...(parsed.colSpan ? { colSpan: parsed.colSpan } : {}),
            blocks,
          }
        }
        return blocks
      }
      return cell
    }),
  }))

  const gapNumbers = gapNumbersInReadingNoteTable({ ...table, rows })
  return {
    ...table,
    rows,
    ...(gapNumbers.length ? { gapNumbers } : {}),
  }
}

/** Bảng khớp tuyệt đối: cùng tập số gap (không thừa / thiếu). */
function noteTableExactGaps(table: ReadingNoteTable | undefined, gapNums: number[]): boolean {
  if (!table?.headers?.length || !table.rows?.length) return false
  const tableGaps = gapNumbersInReadingNoteTable(table)
  if (!tableGaps.length || !gapNums.length) return false
  if (tableGaps.length !== gapNums.length) return false
  const set = new Set(tableGaps)
  return gapNums.every(n => set.has(n))
}

function finalizeTableGroup(
  group: ReadingImportQuestionGroupJson,
  noteTable: ReadingNoteTable,
  questions: ReadingImportQuestionGroupJson['questions'],
  range?: string,
  instruction?: string,
): ReadingImportQuestionGroupJson {
  const { note: _n, notePassage: _np, ...rest } = group
  return {
    ...rest,
    type: 'gap-fill' as const,
    range: range || group.range,
    instruction: instruction
      || group.instruction?.trim()
      || 'Complete the table below. Choose ONE WORD ONLY from the passage for each answer.',
    noteTable,
    questions: questions.map(q => ({
      ...q,
      type: 'gap-fill' as const,
      prompt: `Gap (${q.number})`,
    })),
  }
}

/**
 * Ép layout SAMPLE (đủ hàng Aim/Method/Findings/rowSpan) + remap gap + nhét prompt vào ô gap.
 * Không bao giờ rút thành list 1 hàng/gap.
 */
export function mergeTemplateLayoutWithPrompts(
  templateTable: ReadingNoteTable,
  questions: ReadingImportQuestionGroupJson['questions'],
  targetGaps: number[],
): ReadingNoteTable {
  const remapped = targetGaps.length
    ? remapReadingNoteTableGaps(templateTable, targetGaps)
    : normalizeReadingNoteTable(templateTable) ?? templateTable

  const byNum = new Map(
    (questions ?? [])
      .filter(q => typeof q.number === 'number')
      .map(q => [q.number as number, q]),
  )

  const rows = remapped.rows.map(row => ({
    cells: row.cells.map(cell => {
      const parsed = parseReadingNoteTableCell(cell)
      if (parsed.skip) return cell

      const gapBlocks = parsed.blocks.filter(b => b.type === 'gap' && typeof b.number === 'number')
      if (gapBlocks.length !== 1) return cell

      const num = gapBlocks[0].number as number
      const q = byNum.get(num)
      if (!q || isGenericGapPrompt(q.prompt)) return cell

      const prompt = String(q.prompt).trim()
      // Chỉ thay text quanh gap nếu prompt dài hơn static hiện tại trong ô
      const cellStatic = parsed.blocks
        .filter(b => b.type === 'static')
        .reduce((s, b) => s + (b.text?.trim().length ?? 0), 0)
      if (prompt.replace(/_+/g, '').trim().length < cellStatic + 4) return cell

      const withMarker = /\d{1,2}\s*_{2,}|_{2,}/.test(prompt)
        ? prompt
        : `${prompt.replace(/_+$/g, '').trim()} ${num}________`
      let blocks = parseReadingTableCellText(withMarker)
      if (!blocks.some(b => b.type === 'gap')) {
        blocks = [...blocks, { type: 'gap', number: num }]
      } else {
        blocks = blocks.map(b => (b.type === 'gap' ? { type: 'gap' as const, number: num } : b))
      }

      if (parsed.rowSpan || parsed.colSpan) {
        return {
          ...(parsed.rowSpan ? { rowSpan: parsed.rowSpan } : {}),
          ...(parsed.colSpan ? { colSpan: parsed.colSpan } : {}),
          blocks,
        }
      }
      return blocks
    }),
  }))

  const gapNumbers = gapNumbersInReadingNoteTable({ ...remapped, rows })
  return {
    ...remapped,
    rows,
    ...(gapNumbers.length ? { gapNumbers } : {}),
  }
}

/**
 * Chọn noteTable khi có SAMPLE (r1tb…):
 * — Mặc định LUÔN ép layout SAMPLE (đủ Aim/Method/Findings).
 * — Chỉ giữ noteTable AI khi gần bằng SAMPLE (số hàng ≥ 90% + không incomplete).
 * Không bao giờ giữ bảng DeepSeek “nửa vời”.
 */
function pickBestNoteTable(
  group: ReadingImportQuestionGroupJson,
  questions: ReadingImportQuestionGroupJson['questions'],
  nums: number[],
  tplTable: ReadingNoteTable | undefined,
): ReadingNoteTable | undefined {
  const aiRaw = group.noteTable ? normalizeReadingNoteTable(group.noteTable) : undefined
  const aiTable = aiRaw && nums.length
    ? (noteTableExactGaps(aiRaw, nums) ? aiRaw : remapReadingNoteTableGaps(aiRaw, nums))
    : aiRaw
  const fromPrompts = buildNoteTableFromGapQuestions({ ...group, questions })
  const fromTpl = tplTable && nums.length
    ? mergeTemplateLayoutWithPrompts(tplTable, questions, nums)
    : tplTable
      ? normalizeReadingNoteTable(tplTable)
      : undefined

  // ── Có template table (r1tb / r1tt / …) ──────────────────────────
  if (tplTable && fromTpl) {
    const tplRows = tplTable.rows?.length ?? 0
    const aiRows = aiTable?.rows?.length ?? 0
    const aiOk = Boolean(
      aiTable
      && noteTableIsContentRich(aiTable)
      && gapNumbersInReadingNoteTable(aiTable).length >= Math.max(1, nums.length - 1)
      && !isListLikeOrIncompleteNoteTable(aiTable, tplTable)
      && aiRows >= Math.ceil(tplRows * 0.9),
    )
    if (aiOk && aiTable) {
      return enrichNoteTableWithPrompts(aiTable, questions)
    }
    // ÉP SAMPLE — DeepSeek thiếu / nửa vời / list
    return fromTpl
  }

  // ── Không có template ───────────────────────────────────────────
  if (aiTable && noteTableIsContentRich(aiTable) && gapNumbersInReadingNoteTable(aiTable).length) {
    return enrichNoteTableWithPrompts(aiTable, questions)
  }
  if (fromPrompts) return fromPrompts
  if (aiTable) return aiTable
  return undefined
}

/**
 * Ép mọi nhóm table-template thành noteTable **có nội dung** (không khung rỗng / one-word list).
 */
export function rematerializeReadingTableGroups(
  part: { questionGroups: ReadingImportQuestionGroupJson[] },
  templatePart: { questionGroups: ReadingImportQuestionGroupJson[] },
): { questionGroups: ReadingImportQuestionGroupJson[] } {
  const tplTableIdx = templatePart.questionGroups
    .map((g, idx) => (g.noteTable?.headers?.length ? idx : -1))
    .filter(idx => idx >= 0)

  const processGroup = (
    group: ReadingImportQuestionGroupJson,
    tplIdx: number | undefined,
  ): ReadingImportQuestionGroupJson => {
    const questions = ensureGapQuestionTypes(group.questions)
    const nums = questions
      .filter(q => isGapLikeQuestion(q))
      .map(q => q.number)
      .filter((n): n is number => typeof n === 'number' && n > 0)

    const tplGroup = typeof tplIdx === 'number' ? templatePart.questionGroups[tplIdx] : undefined
    const tplTable = tplGroup?.noteTable
      ? normalizeReadingNoteTable(tplGroup.noteTable)
      : undefined

    let best = pickBestNoteTable(group, questions, nums, tplTable)

    // Nuclear: vẫn thiếu so với SAMPLE → ép merge layout SAMPLE
    if (tplTable && nums.length) {
      if (!best || isListLikeOrIncompleteNoteTable(best, tplTable)) {
        best = mergeTemplateLayoutWithPrompts(tplTable, questions, nums)
      }
      // Hàng quá ít dù isListLike false (edge) → vẫn ép SAMPLE
      if (best && tplTable.rows.length >= 8 && (best.rows?.length ?? 0) < Math.ceil(tplTable.rows.length * 0.85)) {
        best = mergeTemplateLayoutWithPrompts(tplTable, questions, nums)
      }
    }

    if (!best) return group

    return finalizeTableGroup(
      group,
      best,
      questions,
      group.range || tplGroup?.range,
      group.instruction || tplGroup?.instruction,
    )
  }

  // SAMPLE không có noteTable → gỡ mọi noteTable (AI hay nhét table vào summary)
  if (!tplTableIdx.length) {
    return {
      questionGroups: part.questionGroups.map(group => {
        if (!group.noteTable) return group
        const { noteTable: _t, ...rest } = group
        return rest
      }),
    }
  }

  const usedPartIdx = new Set<number>()

  const isNotesLikeGroup = (group: ReadingImportQuestionGroupJson, idx: number): boolean => {
    const tpl = templatePart.questionGroups[idx]
    if (tpl?.notePassage?.length) return true
    if (group.notePassage?.length) return true
    if (isReadingNotesInstruction(group.instruction)) return true
    if (tpl?.notePassage?.length) return true
    return false
  }

  const questionGroups = part.questionGroups.map((group, idx) => {
    // Summary / notes / sentence — tuyệt đối không gắn noteTable
    if (groupMustNotHaveNoteTable(group)) {
      if (group.noteTable) {
        const { noteTable: _t, ...rest } = group
        return rest
      }
      return group
    }
    if (isNotesLikeGroup(group, idx)) {
      if (group.noteTable) {
        const { noteTable: _t, ...rest } = group
        return rest
      }
      return group
    }
    const tplAtIdx = templatePart.questionGroups[idx]
    if (tplAtIdx?.type === 'tfng' || tplAtIdx?.type === 'ynng') return group
    if (group.type === 'tfng' || group.type === 'ynng') return group

    // SAMPLE index không có table → gỡ noteTable nhiễm, không process
    if (tplAtIdx && !tplAtIdx.noteTable?.headers?.length) {
      if (group.noteTable) {
        const { noteTable: _t, ...rest } = group
        return rest
      }
      return group
    }

    const gapNums = gapNumbersInGroup(group)

    // 1) Ưu tiên đúng index template có noteTable
    let tplIdx: number | undefined = tplTableIdx.includes(idx) ? idx : undefined

    // 2) Overlap số gap — chỉ khi instruction là table hoặc đã có noteTable
    if (
      tplIdx === undefined
      && gapNums.length
      && (isReadingTableInstruction(group.instruction) || group.noteTable?.headers?.length)
    ) {
      tplIdx = tplTableIdx.find(ti => {
        if (usedPartIdx.has(ti)) return false
        const tg = gapNumbersInReadingNoteTable(templatePart.questionGroups[ti]?.noteTable)
        const overlap = tg.filter(n => gapNums.includes(n)).length
        return overlap > 0
      })
    }

    // 3) Fallback: instruction rõ là TABLE
    if (tplIdx === undefined && isReadingTableInstruction(group.instruction)) {
      tplIdx = tplTableIdx.find(ti => !usedPartIdx.has(ti))
    }

    // 4) Đã có noteTable + instruction table (không summary)
    if (
      tplIdx === undefined
      && group.noteTable?.headers?.length
      && isReadingTableInstruction(group.instruction)
    ) {
      tplIdx = tplTableIdx.find(ti => !usedPartIdx.has(ti)) ?? tplTableIdx[0]
    }

    const isTableSlot = typeof tplIdx === 'number'
      || isReadingTableInstruction(group.instruction)

    if (!isTableSlot) {
      // Gỡ noteTable lạ trên summary/gap thường
      if (group.noteTable) {
        const { noteTable: _t, ...rest } = group
        return rest
      }
      return group
    }
    if (typeof tplIdx === 'number') usedPartIdx.add(tplIdx)

    return processGroup(group, tplIdx)
  })

  return { questionGroups }
}