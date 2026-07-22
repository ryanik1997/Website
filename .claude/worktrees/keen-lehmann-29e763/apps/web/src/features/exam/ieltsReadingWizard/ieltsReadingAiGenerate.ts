import { callAI, type AIProvider } from '@ryan/core'
import {
  validateReadingManualImport,
  type ReadingImportPartJson,
  type ReadingImportPayload,
} from '../importReadingManualUtils'
import {
  gapNumbersInReadingNoteTable,
  isListLikeOrIncompleteNoteTable,
  mergeTemplateLayoutWithPrompts,
  normalizeReadingNoteTable,
  noteTableStaticTextLength,
  partNeedsNoteTableRepair,
  remapReadingNoteTableGaps,
} from '../readingNoteTableUtils'
import { sliceAnswerKeyForPassage } from './ieltsReadingAnswerKey'
import { buildIeltsReadingPassageAiMessages } from './ieltsReadingAiPrompt'
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
  validateAiReadingPartAgainstTemplate,
  validateAiReadingPartShape,
} from './ieltsReadingAiNormalize'
import { getIeltsReadingWizardTemplatePart, resolveReadingTemplateKind } from './ieltsReadingPartTemplates'
import {
  assertTemplateMatchesPassage,
  type IeltsReadingPassageNumber,
  type IeltsReadingWizardTemplateKind,
} from './ieltsReadingWizardConfig'

const TABLE_REPAIR_KINDS = new Set<IeltsReadingWizardTemplateKind>([
  'p1-r1-tfng-gap-table',
  'p1-r1-table-tfng',
  'p1-r1-notes-tfng-table',
  'p1-r1-notes-table-tfng',
  'p1-r1-tfng-table',
  'p1-r1-sentence-table-tfng',
  'p3-r3-match-table-features',
  'p3-r3-table-ynng-match',
])

export interface GenerateIeltsReadingPassageResult {
  part: ReadingImportPartJson
  warnings: string[]
  rawJson: string
}

/** Cắt object JSON ngoài cùng theo dấu { } (bỏ text thừa trước/sau). */
function sliceOuterJsonObject(text: string): string {
  const start = text.indexOf('{')
  if (start < 0) return text
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escape) {
        escape = false
        continue
      }
      if (ch === '\\') {
        escape = true
        continue
      }
      if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return text.slice(start)
}

/** Sửa lỗi JSON phổ biến từ AI (trailing comma, smart quotes, " trong string…). */
function repairAiJsonText(input: string): string {
  let s = input
    .replace(/^\uFEFF/, '')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    // trailing commas trước } hoặc ]
    .replace(/,\s*([}\]])/g, '$1')

  // Escape " lỏng trong string: "foo "bar" baz" → "foo \"bar\" baz"
  // (khi " không phải kết thúc field hợp lệ trước : , } ])
  let out = ''
  let inString = false
  let escape = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (!inString) {
      out += ch
      if (ch === '"') inString = true
      continue
    }
    // in string
    if (escape) {
      out += ch
      escape = false
      continue
    }
    if (ch === '\\') {
      out += ch
      escape = true
      continue
    }
    if (ch === '\n' || ch === '\r') {
      out += ch === '\n' ? '\\n' : '\\r'
      continue
    }
    if (ch === '\t') {
      out += '\\t'
      continue
    }
    if (ch === '"') {
      // Nhìn phía sau: nếu là kết thúc string hợp lệ → giữ "; không thì escape
      let j = i + 1
      while (j < s.length && /[ \t\r\n]/.test(s[j])) j++
      const next = s[j]
      if (next === undefined || next === ',' || next === '}' || next === ']' || next === ':') {
        out += '"'
        inString = false
      } else {
        out += '\\"'
      }
      continue
    }
    out += ch
  }
  return out
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  let candidate = fence ? fence[1].trim() : trimmed
  candidate = sliceOuterJsonObject(candidate)

  const attempts = [candidate, repairAiJsonText(candidate)]
  let lastErr: unknown
  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt)
    } catch (e) {
      lastErr = e
    }
  }

  // Thử repair lần 2 sau khi slice lại (nếu AI bọc text lạ)
  try {
    return JSON.parse(repairAiJsonText(sliceOuterJsonObject(trimmed)))
  } catch {
    /* fall through */
  }

  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr)
  const snip = candidate.slice(0, 120).replace(/\s+/g, ' ')
  throw new Error(
    `AI trả JSON không hợp lệ (${msg}). Thường do dấu ngoặc kép trong passage/prompt — bấm Tạo JSON lại. Đầu JSON: ${snip}…`,
  )
}

function extractPartFromAi(raw: unknown): ReadingImportPartJson {
  if (!raw || typeof raw !== 'object') {
    throw new Error('AI trả về không phải object JSON.')
  }

  const obj = raw as Record<string, unknown>

  if (obj.part && typeof obj.part === 'object') {
    return obj.part as ReadingImportPartJson
  }

  if (Array.isArray(obj.parts) && obj.parts[0] && typeof obj.parts[0] === 'object') {
    return obj.parts[0] as ReadingImportPartJson
  }

  if (typeof obj.partNumber === 'number' && Array.isArray(obj.questionGroups)) {
    return obj as unknown as ReadingImportPartJson
  }

  throw new Error('JSON thiếu "part" hoặc "parts[0]".')
}

function wrapSinglePassagePayload(
  part: ReadingImportPartJson,
  title: string,
): ReadingImportPayload {
  return {
    version: 1,
    title,
    durationMinutes: 60,
    bandHint: `IELTS · Passage ${part.partNumber} · Wizard`,
    examTrack: 'ielts',
    parts: [part],
  }
}

async function callAndParse(
  passageNumber: IeltsReadingPassageNumber,
  templateKind: IeltsReadingWizardTemplateKind,
  examText: string,
  answerKey: string,
  apiKey: string,
  provider: AIProvider,
  retryHint?: string,
): Promise<{ part: ReadingImportPartJson; rawJson: string }> {
  const messages = buildIeltsReadingPassageAiMessages(passageNumber, templateKind, examText, answerKey)
  if (retryHint) {
    messages.push({
      role: 'user',
      content: `Lần trước lỗi: ${retryHint}\nSửa và trả { "part": { ... } } hợp lệ.`,
    })
  }

  const result = await callAI(messages, apiKey, provider, undefined, { jsonMode: true })
  const aiRaw = result.content.trim()
  const parsed = extractJsonObject(aiRaw)
  const templatePart = getIeltsReadingWizardTemplatePart(passageNumber, templateKind)
  let part = normalizeAiReadingPart(extractPartFromAi(parsed))
  part = applyReadingTemplateTableStructure(part, templatePart)

  // Bắt buộc: template table phải còn noteTable đủ hàng sau normalize
  const tplTables = templatePart.questionGroups
    .map((g, idx) => ({ g, idx }))
    .filter(({ g }) => g.noteTable?.headers?.length)
  for (const { g: tplG, idx } of tplTables) {
    const got = part.questionGroups[idx]
    const rows = got?.noteTable?.rows?.length ?? 0
    const need = tplG.noteTable?.rows?.length ?? 0
    if (got && need >= 6 && rows < Math.ceil(need * 0.85)) {
      const nums = got.questions.map(q => q.number).filter((n): n is number => typeof n === 'number')
      const forced = mergeTemplateLayoutWithPrompts(tplG.noteTable!, got.questions, nums)
      part = {
        ...part,
        questionGroups: part.questionGroups.map((g, i) => {
          if (i !== idx) return g
          return {
            ...g,
            type: 'gap-fill' as const,
            note: undefined,
            notePassage: undefined,
            noteTable: forced,
            questions: g.questions.map(q => ({
              ...q,
              type: 'gap-fill' as const,
              prompt: `Gap (${q.number})`,
            })),
          }
        }),
      }
    }
  }

  validateAiReadingPartShape(part, passageNumber)
  validateAiReadingPartAgainstTemplate(part, passageNumber, templateKind)
  // Lưu JSON đã normalize (có noteTable) — không lộ raw DeepSeek
  const rawJson = JSON.stringify({ part }, null, 2)
  return { part, rawJson }
}

/**
 * DeepSeek hay trả table = list 1 dòng/gap (thiếu Aim, bullet tĩnh, rowSpan…).
 * Gọi AI lần 2: CHỈ sửa noteTable cho đủ nội dung đề giấy.
 */
async function repairIncompleteNoteTables(
  part: ReadingImportPartJson,
  passageNumber: IeltsReadingPassageNumber,
  templateKind: IeltsReadingWizardTemplateKind,
  examText: string,
  answerKey: string,
  apiKey: string,
  provider: AIProvider,
): Promise<ReadingImportPartJson> {
  if (!TABLE_REPAIR_KINDS.has(templateKind)) return part

  const templatePart = getIeltsReadingWizardTemplatePart(passageNumber, templateKind)
  if (!partNeedsNoteTableRepair(part, templatePart)) return part

  const tableGroups = part.questionGroups
    .map((g, idx) => ({ g, idx }))
    .filter(({ g }) => g.noteTable?.headers?.length || /table/i.test(g.instruction ?? ''))

  if (!tableGroups.length) return part

  const sampleTables = templatePart.questionGroups
    .filter(g => g.noteTable?.headers?.length)
    .map(g => g.noteTable)

  const currentSummary = tableGroups.map(({ g, idx }) => ({
    groupIndex: idx,
    range: g.range,
    instruction: g.instruction,
    gapNumbers: g.questions.map(q => q.number),
    answers: Object.fromEntries(g.questions.map(q => [q.number, q.answer])),
    // Giữ prompt gốc nếu còn (trước finalize Gap n)
    prompts: Object.fromEntries(g.questions.map(q => [q.number, q.prompt])),
    currentNoteTable: g.noteTable,
    staticLen: noteTableStaticTextLength(g.noteTable),
    listLike: isListLikeOrIncompleteNoteTable(g.noteTable, sampleTables[0]),
  }))

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [
    {
      role: 'system',
      content: [
        'You repair IELTS Reading table-completion JSON for Ryan English.',
        'Output JSON only: { "tables": [ { "groupIndex": number, "noteTable": { title?, headers, rows } } ] }',
        'RULES:',
        '- noteTable = FULL paper table: n columns × m rows (m often >> number of gaps)',
        '- MUST include static-only rows (labels Aim/Method/Findings, bullets WITHOUT blanks)',
        '- MUST include every static phrase from the exam paper around each gap',
        '- Cells: [ {type:"static", text}, {type:"gap", number}, {type:"break"} ] or {rowSpan, blocks} / {skip:true}',
        '- questions stay unchanged — only rebuild noteTable content',
        '- gap numbers MUST match the provided gapNumbers exactly',
        '- Copy layout ideas from SAMPLE noteTable (rowSpan/skip) but text MUST come from EXAM TEXT',
        '- NEVER return 1 row per gap only (list-like) — that is WRONG',
        '- NEVER leave cells empty; NEVER drop section headers or non-gap bullets',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        'SAMPLE noteTable structure(s):',
        '```json',
        JSON.stringify(sampleTables, null, 2),
        '```',
        '',
        'CURRENT incomplete tables (fix these):',
        '```json',
        JSON.stringify(currentSummary, null, 2),
        '```',
        '',
        'ANSWER KEY (this passage):',
        answerKey || '(none)',
        '',
        'EXAM TEXT (extract FULL table wording from here — all rows, all labels, all bullets):',
        examText,
      ].join('\n'),
    },
  ]

  try {
    const result = await callAI(messages, apiKey, provider, undefined, { jsonMode: true })
    const parsed = extractJsonObject(result.content.trim()) as {
      tables?: Array<{ groupIndex?: number; noteTable?: unknown }>
      noteTable?: unknown
    }

    let next = { ...part, questionGroups: [...part.questionGroups] }

    const applyTable = (groupIndex: number, rawTable: unknown) => {
      let noteTable = normalizeReadingNoteTable(rawTable as never)
      if (!noteTable?.headers?.length || !noteTable.rows?.length) return

      const group = next.questionGroups[groupIndex]
      if (!group) return
      const gapNums = group.questions.map(q => q.number).filter((n): n is number => typeof n === 'number')

      // Remap gap nếu AI trả 7–13 mà đề chỉ 7–12
      const tableGaps = gapNumbersInReadingNoteTable(noteTable)
      if (gapNums.length && tableGaps.length && gapNums.some(n => !tableGaps.includes(n))) {
        noteTable = remapReadingNoteTableGaps(noteTable, gapNums)
      }
      const gapsAfter = gapNumbersInReadingNoteTable(noteTable)
      if (gapNums.some(n => !gapsAfter.includes(n))) return

      const prev = next.questionGroups[groupIndex]?.noteTable
      const prevLen = noteTableStaticTextLength(prev)
      const nextLen = noteTableStaticTextLength(noteTable)
      // Chấp nhận nếu nhiều chữ hơn, hoặc hết list-like, hoặc nhiều hàng hơn rõ
      const better = nextLen > prevLen + 20
        || (isListLikeOrIncompleteNoteTable(prev, sampleTables[0])
          && !isListLikeOrIncompleteNoteTable(noteTable, sampleTables[0]))
        || (noteTable.rows.length > (prev?.rows?.length ?? 0) + 2 && nextLen >= 80)
      if (!better && nextLen < 80) return

      next.questionGroups[groupIndex] = {
        ...group,
        type: 'gap-fill',
        note: undefined,
        notePassage: undefined,
        noteTable,
        questions: group.questions.map(q => ({
          ...q,
          type: 'gap-fill' as const,
          prompt: `Gap (${q.number})`,
        })),
      }
    }

    if (Array.isArray(parsed.tables)) {
      for (const item of parsed.tables) {
        if (typeof item.groupIndex === 'number' && item.noteTable) {
          applyTable(item.groupIndex, item.noteTable)
        }
      }
    } else if (parsed.noteTable && tableGroups[0]) {
      applyTable(tableGroups[0].idx, parsed.noteTable)
    } else if (parsed && typeof parsed === 'object' && 'headers' in (parsed as object)) {
      // AI trả thẳng noteTable object
      if (tableGroups[0]) applyTable(tableGroups[0].idx, parsed)
    }

    // KHÔNG chạy lại rematerialize (sẽ phá bảng đầy đủ) — chỉ normalize nhẹ
    next = {
      ...next,
      questionGroups: next.questionGroups.map(g => {
        if (!g.noteTable) return g
        const nt = normalizeReadingNoteTable(g.noteTable)
        return nt ? { ...g, noteTable: nt } : g
      }),
    }

    const improved = next.questionGroups.some((g, i) => {
      const before = part.questionGroups[i]?.noteTable
      const after = g.noteTable
      if (!after) return false
      const beforeLen = noteTableStaticTextLength(before)
      const afterLen = noteTableStaticTextLength(after)
      const beforeList = isListLikeOrIncompleteNoteTable(before, sampleTables[0])
      const afterList = isListLikeOrIncompleteNoteTable(after, sampleTables[0])
      return afterLen > beforeLen + 20 || (beforeList && !afterList)
        || (after.rows.length > (before?.rows?.length ?? 0) + 2)
    })

    if (improved) {
      try {
        validateAiReadingPartShape(next, passageNumber)
        validateAiReadingPartAgainstTemplate(next, passageNumber, templateKind)
      } catch {
        // Vẫn trả next nếu bảng đã tốt hơn — validate có thể soft-fail gap thừa
      }
      return next
    }
  } catch {
    // fall through — ép layout SAMPLE
  }

  // Fallback deterministic: SAMPLE layout đủ Aim/Method/… (không phụ thuộc repair AI)
  const fallback = {
    ...part,
    questionGroups: part.questionGroups.map((g, idx) => {
      const tplG = templatePart.questionGroups[idx]
      if (!tplG?.noteTable?.headers?.length) return g
      const nums = g.questions.map(q => q.number).filter((n): n is number => typeof n === 'number' && n > 0)
      if (!nums.length) return g
      if (!isListLikeOrIncompleteNoteTable(g.noteTable, tplG.noteTable)) return g
      const merged = mergeTemplateLayoutWithPrompts(tplG.noteTable, g.questions, nums)
      return {
        ...g,
        type: 'gap-fill' as const,
        note: undefined,
        notePassage: undefined,
        noteTable: merged,
        questions: g.questions.map(q => ({
          ...q,
          type: 'gap-fill' as const,
          prompt: `Gap (${q.number})`,
        })),
      }
    }),
  }
  return fallback
}

export async function generateIeltsReadingPassage(options: {
  passageNumber: IeltsReadingPassageNumber
  templateKind: IeltsReadingWizardTemplateKind
  examText: string
  answerKey: string
  apiKey: string
  provider: AIProvider
  title?: string
}): Promise<GenerateIeltsReadingPassageResult> {
  const {
    passageNumber,
    templateKind,
    examText,
    answerKey,
    apiKey,
    provider,
    title = `IELTS Reading — Passage ${passageNumber}`,
  } = options

  const resolvedKind = resolveReadingTemplateKind(passageNumber, templateKind)
  assertTemplateMatchesPassage(passageNumber, resolvedKind)

  if (!examText.trim()) {
    throw new Error(`Chưa dán text Passage ${passageNumber}.`)
  }
  if (!apiKey.trim()) {
    throw new Error('Chưa có API key — vào Cài đặt → AI.')
  }

  const keySlice = sliceAnswerKeyForPassage(answerKey, passageNumber)

  let part: ReadingImportPartJson
  let rawJson: string

  try {
    ;({ part, rawJson } = await callAndParse(
      passageNumber, resolvedKind, examText, keySlice, apiKey, provider,
    ))
  } catch (firstError) {
    const hint = firstError instanceof Error ? firstError.message : 'JSON không hợp lệ'
    ;({ part, rawJson } = await callAndParse(
      passageNumber, resolvedKind, examText, keySlice, apiKey, provider, hint,
    ))
  }

  // Bảng list-like / thiếu hàng tĩnh → AI repair noteTable đầy đủ từ đề
  part = await repairIncompleteNoteTables(
    part, passageNumber, resolvedKind, examText, keySlice, apiKey, provider,
  )
  rawJson = JSON.stringify({ part }, null, 2)

  const warnings = validateReadingManualImport(wrapSinglePassagePayload(part, title))
  // Cảnh báo nếu bảng vẫn list-like sau repair
  const tpl = getIeltsReadingWizardTemplatePart(passageNumber, resolvedKind)
  if (partNeedsNoteTableRepair(part, tpl)) {
    warnings.push(
      `Passage ${passageNumber}: noteTable có thể còn thiếu hàng/static so với đề giấy — kiểm tra lại JSON bảng hoặc dán đủ phần Table trong text đề rồi Tạo JSON lại.`,
    )
  }

  return { part, warnings, rawJson }
}

export function buildFullReadingPayload(
  parts: ReadingImportPartJson[],
  meta: { title: string; cambridge?: number; test?: number },
): ReadingImportPayload {
  const cam = meta.cambridge ? `Cam ${meta.cambridge}` : ''
  const test = meta.test ? `Test ${meta.test}` : ''
  const bandHint = ['IELTS Academic', cam, test, '3 passages · ~40 câu · Wizard'].filter(Boolean).join(' · ')
  const sorted = [...parts].sort((a, b) => a.partNumber - b.partNumber)

  return {
    version: 1,
    title: meta.title.trim() || 'IELTS Reading',
    durationMinutes: 60,
    bandHint,
    examTrack: 'ielts',
    parts: sorted,
  }
}