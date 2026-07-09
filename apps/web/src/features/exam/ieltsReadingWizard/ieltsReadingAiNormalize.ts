import type { ReadingImportPartJson } from '../importReadingManualUtils'
import {
  gapNumbersInReadingNoteTable,
  mergeTemplateNoteTables,
  normalizeReadingImportNoteTables,
  readingNoteTableColumnCount,
  validateReadingNoteTable,
} from '../readingNoteTableUtils'
import {
  IELTS_READING_PASSAGE_RANGES,
  type IeltsReadingPassageNumber,
  type IeltsReadingWizardTemplateKind,
} from './ieltsReadingWizardConfig'

/** Chuẩn hóa notePassage: decade heading → section; \\n → nhiều block / break. */
function normalizeAiNotePassage(
  notePassage: ReadingImportPartJson['questionGroups'][0]['notePassage'],
): ReadingImportPartJson['questionGroups'][0]['notePassage'] {
  if (!notePassage?.length) return notePassage

  const out: NonNullable<typeof notePassage> = []
  const decadeRe = /^(early|mid|late)?\s*[-–]?\s*\d{3,4}s$/i
  const centuryRe = /^(early|mid|late)?\s*\d{1,2}(st|nd|rd|th)\s+century$/i

  for (const block of notePassage) {
    if (!block || typeof block !== 'object') continue
    const type = String((block as { type?: string }).type ?? 'static')

    if (type === 'break') {
      out.push({ type: 'break' })
      continue
    }
    if (type === 'gap') {
      out.push(block)
      continue
    }

    const text = typeof (block as { text?: string }).text === 'string'
      ? (block as { text: string }).text
      : ''
    const lines = text.split(/\r?\n/)
    if (lines.length > 1) {
      for (const line of lines) {
        if (!line.trim()) {
          out.push({ type: 'break' })
          continue
        }
        const t = line.trim()
        if (decadeRe.test(t) || centuryRe.test(t) || type === 'section') {
          out.push({ type: 'section', text: t })
        } else if (type === 'example' || t.toLowerCase().startsWith('example')) {
          out.push({ type: 'example', text: line })
        } else {
          out.push({ type: 'static', text: line })
        }
      }
      continue
    }

    const t = text.trim()
    if ((type === 'static' || type === 'section') && (decadeRe.test(t) || centuryRe.test(t))) {
      out.push({ type: 'section', text: t })
      continue
    }
    out.push(block)
  }

  return out
}

export function normalizeAiReadingPart(part: ReadingImportPartJson): ReadingImportPartJson {
  let next = { ...part }

  if (!next.rangeLabel?.trim()) {
    const [from, to] = IELTS_READING_PASSAGE_RANGES[next.partNumber as IeltsReadingPassageNumber] ?? [1, 13]
    next.rangeLabel = `Read the text and answer questions ${from}–${to}.`
  }

  if (next.passage?.length) {
    next.passage = next.passage.map(block => ({
      ...block,
      text: block.text ?? '',
    }))
  }

  next.questionGroups = normalizeReadingImportNoteTables(
    next.questionGroups.map(g => ({
      ...g,
      notePassage: normalizeAiNotePassage(g.notePassage),
      note: normalizeAiSentenceOrSummaryNote(g.note, g.instruction, g.type),
      questions: normalizeAiSentencePrompts(g.questions ?? [], g.type, g.instruction),
    })),
  )

  return next
}

/** "Complete the sentences" note: mỗi câu 1 dòng; single \\n → \\n\\n để render tách đoạn. */
function normalizeAiSentenceOrSummaryNote(
  note: string | undefined,
  instruction: string | undefined,
  type: string | undefined,
): string | undefined {
  if (!note?.trim()) return note
  let text = note.replace(/\r\n/g, '\n').trim()

  const isSentences = type === 'sentence-completion'
    || /complete the sentences/i.test(instruction ?? '')
    || /complete each sentence/i.test(instruction ?? '')

  // Đã có đoạn kép — giữ
  if (/\n\s*\n/.test(text)) return text

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length <= 1) {
    // AI dán 1 dòng: tách sau mỗi 12________ / 14________ nếu có ≥2 gap
    const gapHits = [...text.matchAll(/(\d{1,2})_{2,}/g)]
    if (gapHits.length >= 2 && isSentences) {
      let rebuilt = ''
      let last = 0
      for (let i = 0; i < gapHits.length; i += 1) {
        const m = gapHits[i]
        const gapEnd = (m.index ?? 0) + m[0].length
        // lấy đến hết câu (dấu . ! ? hoặc trước gap kế)
        let end = gapEnd
        const after = text.slice(gapEnd)
        const sentEnd = after.search(/[.!?](?:\s|$)/)
        if (sentEnd >= 0) end = gapEnd + sentEnd + 1
        else if (i + 1 < gapHits.length) {
          // cắt trước khoảng trắng + chữ hoa trước gap kế
          end = gapHits[i + 1].index ?? gapEnd
        } else {
          end = text.length
        }
        const chunk = text.slice(last, end).trim()
        if (chunk) rebuilt += (rebuilt ? '\n\n' : '') + chunk
        last = end
      }
      const tail = text.slice(last).trim()
      if (tail) rebuilt += (rebuilt ? '\n\n' : '') + tail
      return rebuilt || text
    }
    return text
  }

  // Nhiều dòng single \\n → ép \\n\\n (mỗi dòng = 1 câu trên đề)
  if (isSentences || lines.filter(l => /\d{1,2}_{2,}/.test(l)).length >= 2) {
    return lines.join('\n\n')
  }
  return text
}

/** Mỗi sentence-completion question chỉ 1 dòng prompt (bỏ newline / tách nếu AI gộp). */
function normalizeAiSentencePrompts<T extends { type?: string; prompt?: string; number?: number }>(
  questions: T[],
  groupType: string | undefined,
  instruction: string | undefined,
): T[] {
  if (!questions.length) return questions
  const isSentences = groupType === 'sentence-completion'
    || /complete the sentences/i.test(instruction ?? '')
  if (!isSentences) return questions

  return questions.map(q => {
    if (q.type && q.type !== 'sentence-completion' && q.type !== 'gap-fill') return q
    const prompt = typeof q.prompt === 'string' ? q.prompt.replace(/\r\n/g, '\n').trim() : q.prompt
    if (!prompt || !prompt.includes('\n')) return { ...q, prompt }
    // Giữ dòng có ___ hoặc dòng đầu
    const lines = prompt.split('\n').map(l => l.trim()).filter(Boolean)
    const withBlank = lines.find(l => /_{2,}|\b___+\b/.test(l)) ?? lines[0]
    return { ...q, prompt: withBlank }
  })
}

function gapNumbersInNotePassage(
  notePassage: Array<{ type?: string; number?: number }> | undefined,
): number[] {
  if (!notePassage?.length) return []
  return notePassage
    .filter(b => b.type === 'gap' && typeof b.number === 'number')
    .map(b => b.number as number)
}

/** Gắn notePassage từ template khi AI thiếu notes (r1n8 / r1nt / r3tn). */
function mergeTemplateNotePassages(
  part: ReadingImportPartJson,
  templatePart: ReadingImportPartJson,
): ReadingImportPartJson {
  const templateNotes = templatePart.questionGroups
    .map((g, idx) => ({ g, idx }))
    .filter(({ g }) => g.notePassage?.length)

  if (!templateNotes.length) return part

  const used = new Set<number>()
  const questionGroups = part.questionGroups.map(group => {
    if (group.notePassage?.length) return group
    if (group.noteTable?.headers?.length) return group

    const gapNums = new Set(
      group.questions
        .filter(q => q.type === 'gap-fill' || q.type === 'sentence-completion')
        .map(q => q.number),
    )
    if (!gapNums.size) return group

    let best: { idx: number; g: typeof templateNotes[0]['g']; score: number } | undefined
    for (const { g, idx } of templateNotes) {
      if (used.has(idx) || !g.notePassage) continue
      const noteGaps = gapNumbersInNotePassage(g.notePassage)
      const overlap = noteGaps.filter(n => gapNums.has(n)).length
      if (!overlap) continue
      const score = overlap === noteGaps.length && overlap === gapNums.size ? overlap + 100 : overlap
      if (!best || score > best.score) best = { idx, g, score }
    }
    if (!best) return group
    used.add(best.idx)
    return {
      ...group,
      type: 'gap-fill' as const,
      notesTitle: group.notesTitle ?? best.g.notesTitle,
      notePassage: best.g.notePassage,
    }
  })

  return { ...part, questionGroups }
}

export function applyReadingTemplateTableStructure(
  part: ReadingImportPartJson,
  templatePart: ReadingImportPartJson,
): ReadingImportPartJson {
  const withNotes = mergeTemplateNotePassages(part, templatePart)
  const merged = mergeTemplateNoteTables(withNotes, templatePart)
  return {
    ...part,
    questionGroups: normalizeReadingImportNoteTables(merged.questionGroups),
  }
}

export function validateAiReadingPartShape(
  part: ReadingImportPartJson,
  passageNumber: IeltsReadingPassageNumber,
): void {
  if (part.partNumber !== passageNumber) {
    throw new Error(`partNumber phải là ${passageNumber} (nhận ${part.partNumber}).`)
  }
  if (!part.passageTitle?.trim()) {
    throw new Error('Thiếu passageTitle.')
  }
  if (!part.passage?.some(b => b.text?.trim())) {
    throw new Error('passage[] trống — cần toàn bộ text đoạn văn.')
  }
  if (!part.questionGroups?.length) {
    throw new Error('Thiếu questionGroups.')
  }

  const numbers = part.questionGroups.flatMap(g => g.questions.map(q => q.number)).sort((a, b) => a - b)
  if (!numbers.length) {
    throw new Error('Không có câu hỏi.')
  }

  const [from, to] = IELTS_READING_PASSAGE_RANGES[passageNumber]
  for (const n of numbers) {
    if (n < from || n > to) {
      throw new Error(`Câu ${n} ngoài range Passage ${passageNumber} (${from}–${to}).`)
    }
  }

  for (const q of part.questionGroups.flatMap(g => g.questions)) {
    if (/placeholder/i.test(q.prompt)) {
      throw new Error(`Câu ${q.number}: prompt placeholder.`)
    }
  }
}

const TABLE_TEMPLATE_KINDS = new Set<IeltsReadingWizardTemplateKind>([
  'p1-r1-tfng-gap-table',
  'p1-r1-table-tfng',
  'p1-r1-notes-tfng-table',
  'p1-r1-notes-table-tfng',
  'p3-r3-match-table-features',
  'p3-r3-table-ynng-match',
])

export function validateAiReadingPartAgainstTemplate(
  part: ReadingImportPartJson,
  passageNumber: IeltsReadingPassageNumber,
  templateKind: IeltsReadingWizardTemplateKind,
): void {
  if (!TABLE_TEMPLATE_KINDS.has(templateKind)) return

  const errors: string[] = []
  const gapGroups = part.questionGroups.filter(g => {
    const gaps = g.questions.filter(q => q.type === 'gap-fill' || q.type === 'sentence-completion')
    return gaps.length > 0
  })

  for (const group of gapGroups) {
    const gapNums = group.questions
      .filter(q => q.type === 'gap-fill' || q.type === 'sentence-completion')
      .map(q => q.number)

    // r1nt / notes: nhóm notePassage (Notes) — KHÔNG bắt noteTable
    const hasNotes = Boolean(group.notePassage?.length)
    const hasTable = Boolean(group.noteTable?.headers?.length && group.noteTable.rows?.length)

    if (hasNotes && !hasTable) {
      const noteGaps = gapNumbersInNotePassage(group.notePassage)
      for (const n of gapNums) {
        if (!noteGaps.includes(n)) {
          errors.push(`${group.range}: notePassage thiếu gap ${n}.`)
        }
      }
      continue
    }

    if (!hasTable) {
      errors.push(`${group.range}: thiếu noteTable (cần bảng ${gapNums.length} gap, lưới n cột × m dòng).`)
      continue
    }

    const colN = readingNoteTableColumnCount(group.noteTable)
    if (colN < 2) {
      errors.push(`${group.range}: noteTable cần ≥2 cột (headers.length = n).`)
    }
    // Ép validate lưới n cột × m dòng + đủ gap
    errors.push(...validateReadingNoteTable(group.noteTable, gapNums, group.range))
  }

  // r1nt: Notes → TFNG → Table
  if (templateKind === 'p1-r1-notes-tfng-table') {
    const sig = part.questionGroups.map(g => g.type).join('|')
    if (sig !== 'gap-fill|tfng|gap-fill') {
      errors.push(`Layout P1 r1nt cần gap-fill|tfng|gap-fill (nhận ${sig}).`)
    }
    const notesG = part.questionGroups[0]
    const tableG = part.questionGroups[2]
    if (!notesG?.notePassage?.length) {
      errors.push('Questions notes (nhóm 1): thiếu notePassage (notes như r1n8).')
    }
    if (!tableG?.noteTable?.headers?.length) {
      errors.push('Questions table (nhóm 3): thiếu noteTable (bảng như r1tt).')
    }
  }

  // r1ntf: Notes → Table → TFNG
  if (templateKind === 'p1-r1-notes-table-tfng') {
    const sig = part.questionGroups.map(g => g.type).join('|')
    if (sig !== 'gap-fill|gap-fill|tfng') {
      errors.push(`Layout P1 r1ntf cần gap-fill|gap-fill|tfng (nhận ${sig}).`)
    }
    const notesG = part.questionGroups[0]
    const tableG = part.questionGroups[1]
    if (!notesG?.notePassage?.length) {
      errors.push('Questions notes (nhóm 1): thiếu notePassage.')
    }
    if (!tableG?.noteTable?.headers?.length) {
      errors.push('Questions table (nhóm 2): thiếu noteTable.')
    }
  }

  if (passageNumber === 3 && templateKind === 'p3-r3-table-ynng-match') {
    const sig = part.questionGroups.map(g => g.type).join('|')
    if (sig !== 'gap-fill|ynng|matching-paragraph') {
      errors.push(`Layout P3 r3ty cần gap-fill|ynng|matching-paragraph (nhận ${sig}).`)
    }
  }

  if (errors.length) {
    throw new Error(errors.join(' '))
  }
}