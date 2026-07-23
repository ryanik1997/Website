import type { ReadingImportPartJson } from '../importReadingManualUtils'
import {
  forceTemplateTablesByIndex,
  gapNumbersInReadingNoteTable,
  groupMustNotHaveNoteTable,
  isReadingNotesInstruction,
  isReadingSummaryInstruction,
  isReadingTableInstruction,
  mergeTemplateLayoutWithPrompts,
  mergeTemplateNoteTables,
  normalizeReadingImportNoteTables,
  readingNoteTableColumnCount,
  rematerializeReadingTableGroups,
  validateReadingNoteTable,
} from '../readingNoteTableUtils'
import {
  IELTS_READING_PASSAGE_RANGES,
  type IeltsReadingPassageNumber,
  type IeltsReadingWizardTemplateKind,
} from './ieltsReadingWizardConfig'
import { reorderPartGroupsToTemplate } from './ieltsReadingGroupRoles'

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

/** Gán type câu hỏi mặc định khi AI bỏ type (hay gặp table → one-word list). */
function normalizeAiQuestionTypes(
  questions: ReadingImportPartJson['questionGroups'][0]['questions'],
  groupType: string | undefined,
  instruction: string | undefined,
): ReadingImportPartJson['questionGroups'][0]['questions'] {
  if (!questions?.length) return questions
  const g = String(groupType ?? '').toLowerCase()
  const isSummaryBank = g === 'summary-completion'
    || /list of (phrases|options|words)/i.test(instruction ?? '')
  const isTableOrGap = g === 'gap-fill'
    || g === 'table-completion'
    || g === 'sentence-completion'
    || /complete the table|one word only|no more than \w+ words/i.test(instruction ?? '')

  return questions.map(q => {
    if (q.type) {
      // AI type alias
      const t = String(q.type).toLowerCase()
      if (isSummaryBank && (t === 'gap-fill' || t === 'one-word' || t === 'fill' || t === 'short-answer')) {
        return { ...q, type: 'summary-completion' as const, prompt: q.prompt || `Gap (${q.number})` }
      }
      if (t === 'table-completion' || t === 'one-word' || t === 'short-answer' || t === 'fill') {
        return { ...q, type: 'gap-fill' as const, prompt: q.prompt || `Gap (${q.number})` }
      }
      return q
    }
    if (g === 'tfng' || g === 'true-false-not-given') {
      return { ...q, type: 'true-false-not-given' as const }
    }
    if (g === 'ynng' || g === 'yes-no-not-given') {
      return { ...q, type: 'yes-no-not-given' as const }
    }
    if (isSummaryBank) {
      return {
        ...q,
        type: 'summary-completion' as const,
        prompt: (q.prompt && String(q.prompt).trim()) || `Gap (${q.number})`,
      }
    }
    if (isTableOrGap) {
      return {
        ...q,
        type: 'gap-fill' as const,
        prompt: (q.prompt && String(q.prompt).trim()) || `Gap (${q.number})`,
      }
    }
    return q
  })
}

/** Chuẩn hóa type nhóm: table-completion → gap-fill; instruction "Complete the table" → gap-fill. */
function normalizeAiGroupType(
  type: string | undefined,
  instruction: string | undefined,
  hasNoteTable: boolean,
  questions?: Array<{ type?: string }>,
  hasWordBank?: boolean,
): string | undefined {
  const key = String(type ?? '').trim().toLowerCase()
  if (key === 'table-completion' || key === 'table_completion' || key === 'table') return 'gap-fill'
  if (hasNoteTable) return 'gap-fill'
  if (/complete the table|table below/i.test(instruction ?? '')) return 'gap-fill'
  // Summary có list of phrases / wordBank → summary-completion (LIST OF OPTIONS UI)
  if (
    hasWordBank
    || /list of (phrases|options|words)/i.test(instruction ?? '')
    || (/complete the summary/i.test(instruction ?? '') && /phrases|options|box below|from the list/i.test(instruction ?? ''))
  ) {
    return 'summary-completion'
  }
  // DeepSeek: type "multiple-choice" nhưng questions toàn gap-fill + ONE WORD ONLY
  const gapQs = (questions ?? []).filter(q => {
    const t = String(q.type ?? '').toLowerCase()
    return t === 'gap-fill' || t === 'sentence-completion' || t === 'one-word' || !t
  })
  if (
    gapQs.length >= 3
    && gapQs.length === (questions?.length ?? 0)
    && /one word only|no more than/i.test(instruction ?? '')
    && !/list of (phrases|options)/i.test(instruction ?? '')
  ) {
    return 'gap-fill'
  }
  return type
}

type WordBankItem = { id: string; label: string }

/** Lấy wordBank từ field chuẩn hoặc alias AI hay dùng. */
function extractAiWordBank(g: Record<string, unknown>): WordBankItem[] | undefined {
  const candidates = [
    g.wordBank,
    g.word_bank,
    g.listOfOptions,
    g.list_of_options,
    g.phrases,
    g.optionsBank,
    g.optionBank,
  ]
  for (const raw of candidates) {
    if (!Array.isArray(raw) || raw.length < 2) continue
    const items: WordBankItem[] = []
    for (let i = 0; i < raw.length; i++) {
      const item = raw[i] as Record<string, unknown>
      if (typeof item === 'string') {
        items.push({ id: String.fromCharCode(97 + i), label: item })
        continue
      }
      if (!item || typeof item !== 'object') continue
      const id = String(item.id ?? item.key ?? String.fromCharCode(97 + i)).trim().toLowerCase()
      const label = String(item.label ?? item.text ?? item.value ?? item.name ?? '').trim()
      if (label) items.push({ id: id || String.fromCharCode(97 + i), label })
    }
    if (items.length >= 2) return items
  }
  // AI gắn cả bank vào options của câu đầu (≥6 option phrase)
  const questions = Array.isArray(g.questions) ? g.questions as Array<Record<string, unknown>> : []
  for (const q of questions) {
    const opts = Array.isArray(q.options) ? q.options as Array<Record<string, unknown>> : []
    if (opts.length < 6) continue
    const items = opts.map((o, i) => ({
      id: String(o.id ?? String.fromCharCode(97 + i)).trim().toLowerCase(),
      label: String(o.label ?? o.text ?? '').trim(),
    })).filter(o => o.label)
    if (items.length >= 6) return items
  }
  return undefined
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
    next.questionGroups.map(g => {
      const raw = g as unknown as Record<string, unknown>
      const extractedBank = extractAiWordBank(raw)
      const wordBank = (g.wordBank?.length ? g.wordBank : extractedBank) as typeof g.wordBank
      const hasTable = Boolean(
        g.noteTable
        && typeof g.noteTable === 'object'
        && (Array.isArray((g.noteTable as { headers?: unknown }).headers)
          ? ((g.noteTable as { headers: unknown[] }).headers.length > 0)
          : false),
      )
      const groupType = normalizeAiGroupType(
        g.type,
        g.instruction,
        hasTable,
        g.questions,
        Boolean(wordBank?.length),
      ) ?? g.type
      let questions = normalizeAiQuestionTypes(
        normalizeAiSentencePrompts(g.questions ?? [], groupType, g.instruction),
        groupType,
        g.instruction,
      )
      // Summary bank: bỏ options dài gắn trên từng gap (đã đưa lên wordBank)
      if (wordBank && wordBank.length >= 4 && groupType === 'summary-completion') {
        questions = questions.map(q => ({
          ...q,
          type: 'summary-completion' as const,
          options: (q.options?.length ?? 0) >= 6 ? [] : q.options,
        }))
      }
      return {
        ...g,
        type: groupType as typeof g.type,
        wordBank,
        notePassage: normalizeAiNotePassage(g.notePassage),
        note: normalizeAiSentenceOrSummaryNote(g.note, g.instruction, groupType),
        questions,
      }
    }),
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

/** Căn type/range/instruction từng nhóm theo template khi AI đúng số nhóm nhưng sai type. */
export function alignQuestionGroupsToTemplate(
  part: ReadingImportPartJson,
  templatePart: ReadingImportPartJson,
): ReadingImportPartJson {
  // Trước hết: reorder nếu paste/AI xáo trộn Match / TFNG / Choose TWO / Summary…
  const reordered = reorderPartGroupsToTemplate(part, templatePart)
  if (reordered.questionGroups.length !== templatePart.questionGroups.length) {
    return reordered
  }

  return {
    ...reordered,
    questionGroups: reordered.questionGroups.map((group, idx) => {
      const tpl = templatePart.questionGroups[idx]
      if (!tpl) return group
      // Chỉ ép type khi tương thích (tránh ép MC → ynng nhầm khi reorder fail)
      const nextType = tpl.type
      return {
        ...group,
        type: nextType,
        range: group.range?.trim() ? group.range : tpl.range,
        instruction: group.instruction?.trim() ? group.instruction : tpl.instruction,
      }
    }),
  }
}

const TFNG_OPTS = [
  { id: 'true', label: 'TRUE' },
  { id: 'false', label: 'FALSE' },
  { id: 'not-given', label: 'NOT GIVEN' },
] as const

const YNNG_OPTS = [
  { id: 'yes', label: 'YES' },
  { id: 'no', label: 'NO' },
  { id: 'not-given', label: 'NOT GIVEN' },
] as const

/** Gỡ legend YES/NO/NOT GIVEN (hoặc TRUE/FALSE) AI dán vào prompt — tránh double với radio */
function stripEmbeddedTriStateLegend(prompt: string): string {
  let text = prompt.replace(/\r\n/g, '\n').trim()
  text = text.replace(/\n+\s*(YES|TRUE)\s+if[\s\S]*$/i, '')
  const lines = text.split('\n')
  const kept = lines.filter(line => {
    const t = line.trim()
    if (!t) return true
    if (/^(YES|NO|TRUE|FALSE|NOT\s*GIVEN)(\s*if\b.*)?$/i.test(t)) return false
    if (/^[○●•\-*]\s*(YES|NO|TRUE|FALSE|NOT\s*GIVEN)\b/i.test(t)) return false
    return true
  })
  return kept.join('\n').trim() || prompt.trim()
}

/**
 * Ép LIST OF OPTIONS (wordBank) theo SAMPLE — match theo số câu, không phụ thuộc
 * số nhóm AI (DeepSeek hay tách MC → 4 groups → hybrid index cũ bỏ qua bank).
 * r3ysm / r3my / mọi summary-completion có bank.
 */
export function forceTemplateSummaryWordBanks(
  part: ReadingImportPartJson,
  templatePart: ReadingImportPartJson,
): ReadingImportPartJson {
  const bankSlots = templatePart.questionGroups
    .map((g, idx) => ({ g, idx, nums: g.questions.map(q => q.number).filter((n): n is number => n > 0) }))
    .filter(s => (s.g.wordBank?.length ?? 0) >= 4)

  if (!bankSlots.length) return part

  const usedTpl = new Set<number>()

  const questionGroups = part.questionGroups.map((group, gIdx) => {
    const groupNums = group.questions
      .map(q => q.number)
      .filter((n): n is number => typeof n === 'number' && n > 0)
    const numSet = new Set(groupNums)

    // 1) Ưu tiên index nếu cùng số nhóm
    let match = bankSlots.find(s =>
      !usedTpl.has(s.idx)
      && part.questionGroups.length === templatePart.questionGroups.length
      && s.idx === gIdx,
    )

    // 2) Match overlap số câu (Q31–36…)
    if (!match) {
      let bestScore = 0
      for (const s of bankSlots) {
        if (usedTpl.has(s.idx)) continue
        const score = s.nums.filter(n => numSet.has(n)).length
        if (score > bestScore) {
          bestScore = score
          match = s
        }
      }
      if (bestScore < 2) match = undefined
    }

    // 3) Instruction / note gợi ý summary bank
    if (!match) {
      const looksBank = /list of (phrases|options|words)/i.test(group.instruction ?? '')
        || (/complete the summary/i.test(group.instruction ?? '')
          && (Boolean(group.note && /\d{1,2}_{2,}/.test(group.note))
            || group.type === 'summary-completion'
            || group.type === 'gap-fill'))
      if (looksBank) {
        match = bankSlots.find(s => !usedTpl.has(s.idx))
      }
    }

    if (!match?.g.wordBank?.length) return group

    // Tránh gán bank vào TFNG/YNNG/MC/headings
    if (
      group.type === 'tfng'
      || group.type === 'ynng'
      || group.type === 'matching-headings'
      || group.type === 'matching-paragraph'
      || group.type === 'matching-features'
      || (group.type === 'multiple-choice' && group.questions.every(q => (q.options?.length ?? 0) >= 3 && (q.options?.length ?? 0) <= 5))
    ) {
      // Vẫn cho phép nếu overlap số câu mạnh với bank slot
      const overlap = match.nums.filter(n => numSet.has(n)).length
      if (overlap < Math.min(3, match.nums.length)) return group
    }

    usedTpl.add(match.idx)
    const tpl = match.g
    const tplBank = tpl.wordBank!
    const aiBank = group.wordBank ?? []
    const wordBank = aiBank.length >= tplBank.length ? aiBank : tplBank
    const aiNote = typeof group.note === 'string' ? group.note : ''
    const note = (aiNote && /\d{1,2}_{2,}/.test(aiNote)) ? aiNote : (tpl.note || aiNote)

    return {
      ...group,
      type: 'summary-completion' as const,
      range: group.range?.trim() || tpl.range,
      instruction: group.instruction?.trim() || tpl.instruction,
      note: note || undefined,
      wordBank,
      noteTable: undefined,
      notePassage: undefined,
      questions: group.questions.map((q, i) => ({
        ...q,
        type: 'summary-completion' as const,
        prompt: q.prompt?.trim() || tpl.questions[i]?.prompt || `Gap (${q.number})`,
        options: (q.options?.length ?? 0) >= 6 ? [] : (q.options ?? []),
        answer: q.answer || tpl.questions[i]?.answer || '',
      })),
    }
  })

  return { ...part, questionGroups }
}

/**
 * Chỉ khi SAMPLE có notes/table/tfng tương ứng — ép type + notePassage theo index.
 * Không đụng nhóm sentence-completion / MC thuần của template khác.
 */
export function forceTemplateHybridGroups(
  part: ReadingImportPartJson,
  templatePart: ReadingImportPartJson,
): ReadingImportPartJson {
  // Số nhóm AI ≠ SAMPLE → vẫn hybrid từng slot match được + wordBank theo Q-number
  if (part.questionGroups.length !== templatePart.questionGroups.length) {
    return forceTemplateSummaryWordBanks(part, templatePart)
  }

  const questionGroups = part.questionGroups.map((group, idx) => {
    const tpl = templatePart.questionGroups[idx]
    if (!tpl) return group

    // ── TFNG / YNNG (chỉ khi SAMPLE đúng type) ───────────────────
    if (tpl.type === 'tfng' || tpl.type === 'ynng') {
      const isYnng = tpl.type === 'ynng'
      const triOpts = isYnng ? YNNG_OPTS : TFNG_OPTS
      return {
        ...group,
        type: tpl.type,
        range: group.range?.trim() || tpl.range,
        instruction: group.instruction?.trim() || tpl.instruction,
        note: undefined,
        notePassage: undefined,
        noteTable: undefined,
        notesTitle: undefined,
        // Không giữ wordBank / options bank dính sang YNNG
        wordBank: undefined,
        questions: group.questions.map((q, i) => {
          const tq = tpl.questions[i]
          const rawAns = String(q.answer ?? tq?.answer ?? '').toLowerCase().trim()
          let answer = rawAns
          if (isYnng) {
            if (/^y(es)?$|^a$/.test(rawAns) || rawAns.startsWith('yes')) answer = 'yes'
            else if (/^n(o)?$|^b$/.test(rawAns) || rawAns.startsWith('no')) answer = 'no'
            else if (/not[\s-]?given|^ng$|^c$/.test(rawAns)) answer = 'not-given'
          } else {
            if (/^t(rue)?$|^a$/.test(rawAns) || rawAns.startsWith('true')) answer = 'true'
            else if (/^f(alse)?$|^b$/.test(rawAns) || rawAns.startsWith('false')) answer = 'false'
            else if (/not[\s-]?given|^ng$|^c$/.test(rawAns)) answer = 'not-given'
          }
          const rawPrompt = (q.prompt && !/^gap\s*\(/i.test(q.prompt) ? q.prompt : tq?.prompt) || q.prompt || ''
          return {
            ...q,
            type: isYnng ? 'yes-no-not-given' as const : 'true-false-not-given' as const,
            prompt: stripEmbeddedTriStateLegend(rawPrompt),
            // Luôn 3 option ngắn — AI double YES/NO/NG hoặc label dài = bug UI
            options: triOpts.map(o => ({ ...o })),
            answer: answer || String(tq?.answer ?? ''),
          }
        }),
      }
    }

    // ── Matching headings: ép headings[] từ SAMPLE nếu AI thiếu (r2hm / r2hmc) ─
    if (tpl.type === 'matching-headings' && tpl.headings?.length) {
      return {
        ...group,
        type: 'matching-headings' as const,
        range: group.range?.trim() || tpl.range,
        instruction: group.instruction?.trim() || tpl.instruction,
        note: group.note?.trim() || tpl.note,
        headings: group.headings?.length ? group.headings : tpl.headings,
        noteTable: undefined,
        notePassage: undefined,
        questions: group.questions.map((q, i) => {
          const tq = tpl.questions[i]
          return {
            ...q,
            type: 'matching-headings' as const,
            prompt: q.prompt?.trim() || tq?.prompt || `Paragraph ${String.fromCharCode(65 + i)}`,
            answer: q.answer || tq?.answer || '',
            options: q.options?.length ? q.options : [],
          }
        }),
      }
    }

    // ── Summary (note + gaps): SAMPLE có note, không noteTable/notePassage ─
    // Có wordBank (r3my / r3ysm…) → giữ summary-completion để UI hiện LIST OF OPTIONS
    // Không wordBank (ONE WORD from passage) → gap-fill như r2hmc
    if (
      tpl.note
      && /\d{1,2}_{2,}/.test(tpl.note)
      && !tpl.noteTable?.headers?.length
      && !tpl.notePassage?.length
      && (tpl.type === 'gap-fill' || tpl.type === 'summary-completion' || tpl.type === 'sentence-completion')
    ) {
      const aiNote = typeof group.note === 'string' ? group.note : ''
      const useTplNote = !aiNote.trim() || !/\d{1,2}_{2,}/.test(aiNote)
      // AI thiếu / bank dở (ít hơn SAMPLE) → lấy đủ A–J từ SAMPLE (r3ysm / r3my)
      const tplBank = tpl.wordBank ?? []
      const aiBank = group.wordBank ?? []
      const wordBank = aiBank.length >= tplBank.length && tplBank.length > 0
        ? aiBank
        : (tplBank.length ? tplBank : aiBank)
      const hasBank = wordBank.length > 0
        || /list of (phrases|options|words)/i.test(group.instruction ?? '')
        || /list of (phrases|options|words)/i.test(tpl.instruction ?? '')
      const qType = hasBank || tpl.type === 'summary-completion'
        ? 'summary-completion' as const
        : 'gap-fill' as const
      return {
        ...group,
        type: qType,
        range: group.range?.trim() || tpl.range,
        instruction: group.instruction?.trim() || tpl.instruction,
        note: useTplNote ? tpl.note : aiNote,
        // BẮT BUỘC wordBank từ SAMPLE khi AI thiếu (r3ysm A–J, r3my A–H…)
        wordBank: wordBank.length ? wordBank : undefined,
        noteTable: undefined,
        notePassage: undefined,
        questions: group.questions.map((q, i) => ({
          ...q,
          type: qType,
          prompt: q.prompt?.trim() || tpl.questions[i]?.prompt || `Gap (${q.number})`,
          answer: q.answer || tpl.questions[i]?.answer || '',
        })),
      }
    }

    // Summary bank: SAMPLE có wordBank (r3ysm A–J…) — ép dù AI không note / type sai
    if (
      tpl.wordBank?.length
      && (tpl.type === 'summary-completion' || /list of (phrases|options)/i.test(tpl.instruction ?? ''))
      && !tpl.noteTable?.headers?.length
      && !tpl.notePassage?.length
    ) {
      const aiNote = typeof group.note === 'string' ? group.note : ''
      const note = (aiNote && /\d{1,2}_{2,}/.test(aiNote)) ? aiNote : (tpl.note || aiNote)
      const aiBank = group.wordBank ?? []
      const wordBank = aiBank.length >= tpl.wordBank.length ? aiBank : tpl.wordBank
      return {
        ...group,
        type: 'summary-completion' as const,
        range: group.range?.trim() || tpl.range,
        instruction: group.instruction?.trim() || tpl.instruction,
        note: note || undefined,
        wordBank,
        noteTable: undefined,
        notePassage: undefined,
        questions: group.questions.map((q, i) => ({
          ...q,
          type: 'summary-completion' as const,
          prompt: q.prompt?.trim() || tpl.questions[i]?.prompt || `Gap (${q.number})`,
          answer: q.answer || tpl.questions[i]?.answer || '',
        })),
      }
    }

    // ── Notes: CHỈ khi SAMPLE có notePassage ─────────────────────
    if (tpl.notePassage?.length) {
      const hasNotes = Boolean(group.notePassage?.length)
      return {
        ...group,
        type: 'gap-fill' as const,
        range: group.range?.trim() || tpl.range,
        instruction: group.instruction?.trim() || tpl.instruction,
        notesTitle: group.notesTitle?.trim() || tpl.notesTitle,
        notePassage: hasNotes ? group.notePassage : tpl.notePassage,
        noteTable: undefined,
        note: undefined,
        questions: group.questions.map((q, i) => ({
          ...q,
          type: 'gap-fill' as const,
          prompt: q.prompt?.trim() || tpl.questions[i]?.prompt || `Gap (${q.number})`,
          answer: q.answer || tpl.questions[i]?.answer || '',
        })),
      }
    }

    // ── Table: CHỈ khi SAMPLE có noteTable ───────────────────────
    if (tpl.noteTable?.headers?.length) {
      return {
        ...group,
        type: 'gap-fill' as const,
        range: group.range?.trim() || tpl.range,
        instruction: group.instruction?.trim() || tpl.instruction
          || 'Complete the table below. Choose ONE WORD ONLY from the passage for each answer.',
        notePassage: undefined,
        notesTitle: undefined,
        questions: group.questions.map((q, i) => ({
          ...q,
          type: 'gap-fill' as const,
          prompt: /^gap\s*\(/i.test(String(q.prompt ?? '')) || !q.prompt?.trim()
            ? `Gap (${q.number})`
            : q.prompt,
          answer: q.answer || tpl.questions[i]?.answer || '',
        })),
      }
    }

    // Nhóm khác (MC, sentence-completion, matching…): giữ AI, chỉ align type SAMPLE
    // và gỡ noteTable nếu SAMPLE không có table
    const next = {
      ...group,
      type: tpl.type,
      range: group.range?.trim() || tpl.range,
      instruction: group.instruction?.trim() || tpl.instruction,
    }
    if (!tpl.noteTable?.headers?.length && next.noteTable) {
      const { noteTable: _t, ...rest } = next
      return rest
    }
    return next
  })

  return { ...part, questionGroups }
}

/** Template có ít nhất 1 nhóm noteTable (r1t/r1tb/r1nt/r3tb…). */
function templateHasNoteTable(templatePart: ReadingImportPartJson): boolean {
  return templatePart.questionGroups.some(g => Boolean(g.noteTable?.headers?.length))
}

/** Template có notes notePassage (r1n/r1nt/r3tn…). */
function templateHasNotePassage(templatePart: ReadingImportPartJson): boolean {
  return templatePart.questionGroups.some(g => Boolean(g.notePassage?.length))
}

/**
 * Cổng cứng: noteTable CHỈ tồn tại khi SAMPLE cùng index có noteTable.
 * — Template không table → gỡ HẾT noteTable
 * — TFNG/YNNG/match/MC/summary/notes → gỡ
 * — Chỉ giữ khi tpl.noteTable?.headers
 */
export function enforceNoteTableOnlyOnTemplateSlots(
  part: ReadingImportPartJson,
  templatePart: ReadingImportPartJson,
): ReadingImportPartJson {
  const sampleHasAnyTable = templateHasNoteTable(templatePart)

  const questionGroups = part.questionGroups.map((group, idx) => {
    if (!group.noteTable) return group

    // Template không có table nào → strip tuyệt đối
    if (!sampleHasAnyTable) {
      const { noteTable: _t, ...rest } = group
      return rest
    }

    // Summary / notes / sentence / TFNG…
    if (groupMustNotHaveNoteTable(group)) {
      const { noteTable: _t, ...rest } = group
      return rest
    }
    if (group.type === 'tfng' || group.type === 'ynng') {
      const { noteTable: _t, ...rest } = group
      return rest
    }

    const tpl = templatePart.questionGroups[idx]
    // Chỉ giữ khi SAMPLE đúng index có table
    if (!tpl?.noteTable?.headers?.length) {
      const { noteTable: _t, ...rest } = group
      return rest
    }

    // Instruction summary dù SAMPLE table index (AI sai) → strip
    if (isReadingSummaryInstruction(group.instruction) || isReadingNotesInstruction(group.instruction)) {
      const { noteTable: _t, ...rest } = group
      return rest
    }

    return group
  })

  return { ...part, questionGroups }
}

/** @deprecated alias — dùng enforceNoteTableOnlyOnTemplateSlots */
function stripNoteTablesNotInTemplate(
  part: ReadingImportPartJson,
  templatePart: ReadingImportPartJson,
): ReadingImportPartJson {
  return enforceNoteTableOnlyOnTemplateSlots(part, templatePart)
}

function finalizeTemplateStructure(
  part: ReadingImportPartJson,
  templatePart: ReadingImportPartJson,
): ReadingImportPartJson {
  // Luôn ép wordBank A–J… (r3ysm/r3my) kể cả khi AI sai số nhóm
  const withBanks = forceTemplateSummaryWordBanks(part, templatePart)
  return enforceNoteTableOnlyOnTemplateSlots(withBanks, templatePart)
}

export function applyReadingTemplateTableStructure(
  part: ReadingImportPartJson,
  templatePart: ReadingImportPartJson,
): ReadingImportPartJson {
  const hasTable = templateHasNoteTable(templatePart)
  const hasNotes = templateHasNotePassage(templatePart)

  // Template không notes/table: vẫn hybrid (headings + summary note như r2hmc/r2hm)
  // rồi gỡ HẾT noteTable nhiễm
  if (!hasTable && !hasNotes) {
    const aligned = alignQuestionGroupsToTemplate(part, templatePart)
    const hybrid = forceTemplateHybridGroups(aligned, templatePart)
    return finalizeTemplateStructure(hybrid, templatePart)
  }

  // Chỉ notes (r1n8…): merge notePassage, KHÔNG rematerialize table
  if (!hasTable && hasNotes) {
    const aligned = alignQuestionGroupsToTemplate(part, templatePart)
    const hybrid = forceTemplateHybridGroups(aligned, templatePart)
    const withNotes = mergeTemplateNotePassages(hybrid, templatePart)
    return finalizeTemplateStructure(
      { ...part, questionGroups: normalizeReadingImportNoteTables(withNotes.questionGroups) },
      templatePart,
    )
  }

  // Có table (r1tb/r1nt/r1tt/r3tb…) — full pipeline
  const aligned = alignQuestionGroupsToTemplate(part, templatePart)
  const hybrid = forceTemplateHybridGroups(aligned, templatePart)
  const withNotes = mergeTemplateNotePassages(hybrid, templatePart)
  const mergedByGap = mergeTemplateNoteTables(withNotes, templatePart)
  const forced = forceTemplateTablesByIndex(mergedByGap, templatePart)
  const rematerialized = rematerializeReadingTableGroups(forced, templatePart)
  const cleaned = forceTemplateHybridGroups(
    { ...part, questionGroups: rematerialized.questionGroups },
    templatePart,
  )

  // Chỉ ép noteTable ở index SAMPLE có table
  const withTables = cleaned.questionGroups.map((group, idx) => {
    const tpl = templatePart.questionGroups[idx]
    if (!tpl?.noteTable?.headers?.length) {
      if (group.noteTable) {
        const { noteTable: _t, ...rest } = group
        return rest
      }
      return group
    }
    // TFNG/summary không được ép table dù index sai
    if (groupMustNotHaveNoteTable(group) || group.type === 'tfng' || group.type === 'ynng') {
      const { noteTable: _t, ...rest } = group
      return rest
    }
    if (group.noteTable?.headers?.length && (group.noteTable.rows?.length ?? 0) >= 3) {
      return { ...group, type: 'gap-fill' as const, notePassage: undefined }
    }
    const nums = group.questions
      .map(q => q.number)
      .filter((n): n is number => typeof n === 'number' && n > 0)
    const noteTable = mergeTemplateLayoutWithPrompts(tpl.noteTable, group.questions, nums)
    return {
      ...group,
      type: 'gap-fill' as const,
      notePassage: undefined,
      notesTitle: undefined,
      note: undefined,
      noteTable,
      questions: group.questions.map(q => ({
        ...q,
        type: 'gap-fill' as const,
        prompt: `Gap (${q.number})`,
      })),
    }
  })

  // Cổng cứng cuối — wordBank + không bao giờ lọt noteTable ngoài slot SAMPLE
  return finalizeTemplateStructure(
    {
      ...part,
      questionGroups: normalizeReadingImportNoteTables(withTables),
    },
    templatePart,
  )
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
  'p1-r1-tfng-table',
  'p1-r1-sentence-table-tfng',
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
      .filter(q => {
        const t = String(q.type ?? '').toLowerCase()
        return !t
          || t === 'gap-fill'
          || t === 'sentence-completion'
          || t === 'summary-completion'
          || t === 'table-completion'
          || t === 'one-word'
          || t === 'short-answer'
      })
      .map(q => q.number)

    // Summary / notes / sentence — KHÔNG bắt noteTable, không validate table
    if (isReadingSummaryInstruction(group.instruction) || isReadingNotesInstruction(group.instruction)
      || /complete the sentences|sentences below/i.test(group.instruction ?? '')
      || groupMustNotHaveNoteTable(group)) {
      if (isReadingNotesInstruction(group.instruction) || group.notePassage?.length) {
        if (!group.notePassage?.length) {
          errors.push(`${group.range}: thiếu notePassage (notes completion).`)
          continue
        }
        const noteGaps = gapNumbersInNotePassage(group.notePassage)
        for (const n of gapNums) {
          if (!noteGaps.includes(n)) {
            errors.push(`${group.range}: notePassage thiếu gap ${n}.`)
          }
        }
      }
      // Summary: đủ note + gap inline là OK
      continue
    }

    // TFNG/YNNG lọt vào gapGroups? skip
    if (group.type === 'tfng' || group.type === 'ynng') continue

    const tableGaps = gapNumbersInReadingNoteTable(group.noteTable)
    const hasTable = Boolean(
      group.noteTable?.headers?.length
      && group.noteTable.rows?.length
      && (tableGaps.length > 0 || isReadingTableInstruction(group.instruction)),
    )

    // Chỉ nhóm table mới bắt noteTable
    if (!hasTable) {
      if (!isReadingTableInstruction(group.instruction) && !group.noteTable) {
        // gap-fill thường (sentence/summary) — bỏ qua
        continue
      }
      errors.push(
        `${group.range}: thiếu noteTable (table-completion, ${gapNums.length || '?'} gap) — `
        + 'KHÔNG dùng list one-word/sentence; cần noteTable headers+rows+gap trong ô.',
      )
      continue
    }

    const colN = readingNoteTableColumnCount(group.noteTable)
    if (colN < 1) {
      errors.push(`${group.range}: noteTable cần headers (≥1 cột).`)
    }
    for (const n of gapNums) {
      if (!tableGaps.includes(n)) {
        errors.push(`${group.range}: câu ${n} thiếu trong noteTable (table-completion).`)
      }
    }
    const hard = validateReadingNoteTable(group.noteTable, gapNums, group.range)
      .filter(w => /thiếu trong noteTable|thiếu headers/i.test(w))
    errors.push(...hard)
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

  // r1tb: TFNG → Table
  if (templateKind === 'p1-r1-tfng-table') {
    const sig = part.questionGroups.map(g => g.type).join('|')
    if (sig !== 'tfng|gap-fill') {
      errors.push(`Layout P1 r1tb cần tfng|gap-fill (nhận ${sig}).`)
    }
    const tableG = part.questionGroups[1]
    if (!tableG?.noteTable?.headers?.length) {
      errors.push('Questions table (nhóm 2): thiếu noteTable (lưới n cột × m dòng).')
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

  // r1st: Sentence → Table → TFNG
  if (templateKind === 'p1-r1-sentence-table-tfng') {
    const sig = part.questionGroups.map(g => g.type).join('|')
    if (sig !== 'sentence-completion|gap-fill|tfng' && sig !== 'gap-fill|gap-fill|tfng') {
      errors.push(`Layout P1 r1st cần sentence-completion|gap-fill|tfng (nhận ${sig}).`)
    }
    const tableG = part.questionGroups[1]
    if (!tableG?.noteTable?.headers?.length) {
      errors.push('Questions table (nhóm 2): thiếu noteTable (Intensive vs aeroponic).')
    }
    if (part.questionGroups[0]?.noteTable) {
      errors.push('Questions sentence (nhóm 1): không được có noteTable.')
    }
    if (part.questionGroups[2]?.type !== 'tfng') {
      errors.push('Questions TFNG (nhóm 3): type phải là tfng.')
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