import type {
  ReadingExam,
  ReadingPart,
  ReadingQuestion,
  ReadingQuestionGroup,
  ReadingQuestionOption,
} from './examData'
import { normalizeReadingNoteTable } from './readingNoteTableUtils'
import { normalizeReadingChooseTwoGroup } from './readingChooseTwoUtils'

const YNNG_OPTIONS = [
  { id: 'yes', label: 'YES' },
  { id: 'no', label: 'NO' },
  { id: 'not-given', label: 'NOT GIVEN' },
] as const

const TFNG_OPTIONS = [
  { id: 'true', label: 'TRUE' },
  { id: 'false', label: 'FALSE' },
  { id: 'not-given', label: 'NOT GIVEN' },
] as const

const VALID_GROUP_TYPES = new Set<ReadingQuestionGroup['type']>([
  'tfng',
  'ynng',
  'matching-paragraph',
  'matching-headings',
  'matching-features',
  'multiple-choice',
  'gap-fill',
  'summary-completion',
  'sentence-completion',
])

const GROUP_TYPE_ALIASES: Record<string, ReadingQuestionGroup['type']> = {
  'table-completion': 'gap-fill',
  table_completion: 'gap-fill',
  'true-false-not-given': 'tfng',
  tfng: 'tfng',
  'yes-no-not-given': 'ynng',
  ynng: 'ynng',
  'matching-paragraph': 'matching-paragraph',
  'matching-headings': 'matching-headings',
  'matching-features': 'matching-features',
  'multiple-choice': 'multiple-choice',
  'gap-fill': 'gap-fill',
  'summary-completion': 'summary-completion',
  'sentence-completion': 'sentence-completion',
}

function inferGroupType(group: {
  type?: string
  noteTable?: { headers?: string[] }
  notePassage?: unknown[]
  note?: string
  questions: Array<{ type?: string }>
}): ReadingQuestionGroup['type'] {
  if (group.noteTable?.headers?.length) return 'gap-fill'
  if (group.notePassage?.length) return 'gap-fill'
  if (group.note && /\d{1,2}_{2,}/.test(group.note)) return 'summary-completion'

  const qTypes = new Set(group.questions.map(q => q.type).filter(Boolean))
  if (qTypes.size === 1) {
    const only = [...qTypes][0]
    if (only === 'yes-no-not-given') return 'ynng'
    if (only === 'true-false-not-given') return 'tfng'
    if (only === 'matching-paragraph') return 'matching-paragraph'
    if (only === 'matching-headings') return 'matching-headings'
    if (only === 'matching-features') return 'matching-features'
    if (only === 'gap-fill') return 'gap-fill'
    if (only === 'sentence-completion') return 'sentence-completion'
    if (only === 'multiple-choice') return 'multiple-choice'
  }

  return 'multiple-choice'
}

/** Chuẩn hóa type nhóm câu — AI/import hay dùng `table-completion` thay `gap-fill`. */
export function normalizeReadingGroupType(
  raw: string | undefined,
  group: Parameters<typeof inferGroupType>[0],
): ReadingQuestionGroup['type'] {
  const key = String(raw ?? '').trim().toLowerCase()
  if (key && GROUP_TYPE_ALIASES[key]) return GROUP_TYPE_ALIASES[key]
  if (key && VALID_GROUP_TYPES.has(key as ReadingQuestionGroup['type'])) {
    return key as ReadingQuestionGroup['type']
  }
  return inferGroupType(group)
}

/** Map id/label AI → yes|no|not-given hoặc true|false|not-given */
function normalizeTriStateId(
  raw: string,
  mode: 'ynng' | 'tfng',
): 'yes' | 'no' | 'true' | 'false' | 'not-given' | null {
  const s = raw.trim().toLowerCase().replace(/[_–—]/g, ' ').replace(/\s+/g, ' ')
  if (!s) return null
  if (/^not[\s-]?given$|^ng$|^c$/.test(s) || s.includes('not given') || s.includes('impossible to say')) {
    return 'not-given'
  }
  if (mode === 'ynng') {
    if (/^yes$|^y$|^a$/.test(s) || s.startsWith('yes if') || s.startsWith('yes,')) return 'yes'
    if (/^no$|^n$|^b$/.test(s) || s.startsWith('no if') || s.startsWith('no,')) return 'no'
  } else {
    if (/^true$|^t$|^a$/.test(s) || s.startsWith('true if') || s.startsWith('true,')) return 'true'
    if (/^false$|^f$|^b$/.test(s) || s.startsWith('false if') || s.startsWith('false,')) return 'false'
  }
  return null
}

/**
 * YNNG/TFNG: luôn đúng 3 option ngắn (YES/NO/NG hoặc TRUE/FALSE/NG).
 * AI hay trả 6 option (double) hoặc label dài trùng instruction → UI "double Yes No Not Given".
 */
export function canonicalizeTriStateOptions(
  mode: 'ynng' | 'tfng',
  rawOptions: ReadingQuestion['options'] | undefined,
): ReadingQuestionOption[] {
  const canonical = mode === 'ynng' ? YNNG_OPTIONS : TFNG_OPTIONS
  if (!Array.isArray(rawOptions) || rawOptions.length === 0) {
    return canonical.map(o => ({ ...o }))
  }

  // Dedupe theo id chuẩn; bỏ option lạ / trùng
  const seen = new Set<string>()
  for (const opt of rawOptions) {
    const idHit = normalizeTriStateId(String(opt?.id ?? ''), mode)
    const labelHit = normalizeTriStateId(String(opt?.label ?? ''), mode)
    const hit = idHit ?? labelHit
    if (hit) seen.add(hit)
  }

  // Đủ 3 (hoặc gần đủ) → luôn trả canonical ngắn, không giữ label dài AI
  if (seen.size >= 2 || rawOptions.length >= 3) {
    return canonical.map(o => ({ ...o }))
  }

  return canonical.map(o => ({ ...o }))
}

/** Gỡ khối YES/NO/NOT GIVEN (hoặc TRUE/FALSE) AI dán vào cuối prompt từng câu */
function stripTriStateLegendFromPrompt(prompt: string): string {
  let text = prompt.replace(/\r\n/g, '\n').trim()
  // Cắt từ dòng YES/TRUE if … đến hết (legend Cambridge lặp lại)
  text = text.replace(
    /\n+\s*(YES|TRUE)\s+if[\s\S]*$/i,
    '',
  )
  // Cắt các dòng chỉ là YES / NO / NOT GIVEN / TRUE / FALSE lặp lại
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

function sanitizeQuestion(group: ReadingQuestionGroup, q: ReadingQuestion): ReadingQuestion {
  const answer = typeof q.answer === 'string' ? q.answer : ''
  let options = Array.isArray(q.options) ? q.options : []
  let prompt = typeof q.prompt === 'string' ? q.prompt : `Question ${q.number}`

  if (group.type === 'ynng' || q.type === 'yes-no-not-given') {
    options = canonicalizeTriStateOptions('ynng', options)
    prompt = stripTriStateLegendFromPrompt(prompt)
  } else if (group.type === 'tfng' || q.type === 'true-false-not-given') {
    options = canonicalizeTriStateOptions('tfng', options)
    prompt = stripTriStateLegendFromPrompt(prompt)
  }

  // Map answer về id chuẩn
  let nextAnswer = answer
  if (group.type === 'ynng' || q.type === 'yes-no-not-given') {
    const mapped = normalizeTriStateId(answer, 'ynng')
    if (mapped) nextAnswer = mapped
  } else if (group.type === 'tfng' || q.type === 'true-false-not-given') {
    const mapped = normalizeTriStateId(answer, 'tfng')
    if (mapped) nextAnswer = mapped
  }

  return {
    ...q,
    type: group.type === 'ynng'
      ? 'yes-no-not-given'
      : group.type === 'tfng'
        ? 'true-false-not-given'
        : q.type,
    prompt,
    answer: nextAnswer,
    explanation: typeof q.explanation === 'string' ? q.explanation : '',
    options,
  }
}

function sanitizeFeatureList(
  features: ReadingQuestionGroup['features'],
): ReadingQuestionGroup['features'] {
  if (!Array.isArray(features)) return features
  return features.map((feature, index) => {
    const raw = feature as { id?: string; name?: string; label?: string }
    const id = typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim().toLowerCase()
      : String.fromCharCode(97 + index)
    const name = typeof raw.name === 'string' && raw.name.trim()
      ? raw.name.trim()
      : typeof raw.label === 'string' && raw.label.trim()
        ? raw.label.trim()
        : `Item ${id.toUpperCase()}`
    return { id, name }
  })
}

function sanitizeHeadings(
  headings: ReadingQuestionGroup['headings'],
): ReadingQuestionGroup['headings'] {
  if (!Array.isArray(headings)) return headings
  return headings.map((heading, index) => {
    const raw = heading as { id?: string; label?: string; text?: string }
    const id = typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim().toLowerCase()
      : String(index + 1)
    const label = typeof raw.label === 'string' && raw.label.trim()
      ? raw.label.trim()
      : typeof raw.text === 'string' && raw.text.trim()
        ? raw.text.trim()
        : `Heading ${id}`
    return { id, label }
  })
}

function sanitizeWordBank(
  wordBank: ReadingQuestionGroup['wordBank'],
): ReadingQuestionGroup['wordBank'] {
  if (!Array.isArray(wordBank)) return wordBank
  return wordBank.map((word, index) => {
    const raw = word as { id?: string; label?: string }
    const id = typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim().toLowerCase()
      : String.fromCharCode(97 + index)
    const label = typeof raw.label === 'string' && raw.label.trim()
      ? raw.label.trim()
      : id.toUpperCase()
    return { id, label }
  })
}

/** Chữ cái MC chuẩn A–D — không được coi là YES/NO/TRUE/FALSE (normalizeTriStateId map a→yes, b→no, c→NG). */
function isBareMcLetter(raw: string): boolean {
  return /^[a-d]$/i.test(raw.trim())
}

/**
 * Options có vẻ chỉ YES/NO/NG hoặc TRUE/FALSE/NG (≤3), không phải MC A–C (tên người/địa điểm).
 * KET A2 Part 2: options id A/B/C + label "Angus"/"Frank"/"Zac" — trước đây bị ép nhầm ynng
 * vì id A/B/C match normalizeTriStateId và label < 12 ký tự không vượt hasRealMcOpts.
 */
function optionsLookTriStateOnly(opts: ReadingQuestion['options'] | undefined): boolean {
  if (!Array.isArray(opts) || opts.length === 0) return false
  if (opts.length > 3) return false
  return opts.every(o => {
    const id = String(o?.id ?? '').trim()
    const lab = String(o?.label ?? '').trim()
    // Ưu tiên label: tên người/chỗ (Angus, Hillside…) ≠ tri-state
    if (lab) {
      return Boolean(
        normalizeTriStateId(lab, 'ynng')
        || normalizeTriStateId(lab, 'tfng')
        || /^(yes|no|true|false|not[\s-]?given)\b/i.test(lab),
      )
    }
    // Không label — id đơn A/B/C/D là MC letter, không phải YES/NO
    if (isBareMcLetter(id)) return false
    return Boolean(
      normalizeTriStateId(id, 'ynng')
      || normalizeTriStateId(id, 'tfng'),
    )
  })
}

/**
 * AI/import hay gán group.type = multiple-choice trong khi câu là YNNG
 * (Cam19 T1 P3 Q37–40) → UI MC hiện A YES / B NO + instruction YES if… = double.
 */
function coerceTriStateGroupType(
  preliminary: ReadingQuestionGroup['type'],
  group: ReadingQuestionGroup,
): ReadingQuestionGroup['type'] {
  const qs = group.questions ?? []
  if (!qs.length) return preliminary
  const instr = typeof group.instruction === 'string' ? group.instruction : ''

  const ynngInstr = /claims of the writer|views of the writer/i.test(instr)
    && /yes if|not given/i.test(instr)
  const tfngInstr = /true if the statement|FALSE if the statement/i.test(instr)
    || (/true if/i.test(instr) && /false if/i.test(instr) && /not given/i.test(instr)
      && !/yes if/i.test(instr))

  const allYnngQ = qs.every(q =>
    q.type === 'yes-no-not-given'
    || optionsLookTriStateOnly(q.options)
    || /^(yes|no|not[\s-]?given)$/i.test(String(q.answer ?? '')),
  )
  const allTfngQ = qs.every(q =>
    q.type === 'true-false-not-given'
    || optionsLookTriStateOnly(q.options)
    || /^(true|false|not[\s-]?given)$/i.test(String(q.answer ?? '')),
  )
  // Có option MC thật (tên người/địa điểm, A–D dài…) → không ép tri-state
  const hasRealMcOpts = qs.some(q => {
    const opts = q.options ?? []
    if (opts.length >= 4) return true
    return opts.some(o => {
      const lab = String(o.label ?? '').trim()
      if (!lab) return false
      // Mọi label không phải YES/NO/TRUE/FALSE/NG đều là MC (kể cả "Angus", "Zac")
      if (normalizeTriStateId(lab, 'ynng') || normalizeTriStateId(lab, 'tfng')) return false
      if (/^(yes|no|true|false|not[\s-]?given)\b/i.test(lab)) return false
      return true
    })
  })
  if (hasRealMcOpts) return preliminary

  if (ynngInstr || (allYnngQ && (preliminary === 'multiple-choice' || preliminary === 'ynng'
    || qs.every(q => q.type === 'yes-no-not-given')))) {
    if (!tfngInstr) return 'ynng'
  }
  if (tfngInstr || (allTfngQ && (preliminary === 'multiple-choice' || preliminary === 'tfng'
    || qs.every(q => q.type === 'true-false-not-given')))) {
    if (!ynngInstr) return 'tfng'
  }
  return preliminary
}

function sanitizeGroup(group: ReadingQuestionGroup): ReadingQuestionGroup {
  // Choose TWO: AI hay bỏ options câu 2 → share bank A–E trước khi detect type
  const preChooseTwo = normalizeReadingChooseTwoGroup(group)
  const preliminary = normalizeReadingGroupType(preChooseTwo.type, preChooseTwo)
  const type = coerceTriStateGroupType(preliminary, preChooseTwo)
  let noteTable = group.noteTable
    ? normalizeReadingNoteTable(group.noteTable) ?? group.noteTable
    : undefined

  // TFNG / YNNG / matching / MC / summary / notes — không giữ noteTable nhiễm
  const instr = typeof preChooseTwo.instruction === 'string' ? preChooseTwo.instruction : ''
  const banTable = type === 'tfng' || type === 'ynng'
    || type === 'matching-headings' || type === 'matching-paragraph' || type === 'matching-features'
    || type === 'multiple-choice'
    || /complete the summary|summary below|complete the notes|notes below|complete the sentences/i.test(instr)
    || Boolean(preChooseTwo.notePassage?.length)
    || (Boolean(preChooseTwo.note && /\d{1,2}_{2,}/.test(preChooseTwo.note))
      && !/complete the table|table below/i.test(instr))

  if (banTable) noteTable = undefined

  const next: ReadingQuestionGroup = {
    ...preChooseTwo,
    type,
    range: typeof preChooseTwo.range === 'string' ? preChooseTwo.range : 'Questions',
    instruction: typeof preChooseTwo.instruction === 'string' ? preChooseTwo.instruction : 'Choose the correct answer.',
    ...(noteTable ? { noteTable } : { noteTable: undefined }),
    features: sanitizeFeatureList(preChooseTwo.features),
    headings: sanitizeHeadings(preChooseTwo.headings),
    // TFNG/YNNG không dùng wordBank (tránh UI lạ / bank dính từ group trước)
    wordBank: type === 'tfng' || type === 'ynng' ? undefined : sanitizeWordBank(preChooseTwo.wordBank),
    paragraphLetters: Array.isArray(preChooseTwo.paragraphLetters)
      ? preChooseTwo.paragraphLetters.map(l => String(l ?? '').trim()).filter(Boolean)
      : preChooseTwo.paragraphLetters,
    questions: (preChooseTwo.questions ?? []).map(q => sanitizeQuestion({ ...preChooseTwo, type }, q)),
  }

  // Xóa hẳn field nếu undefined (tránh JSON còn noteTable: null)
  if (!noteTable) {
    const { noteTable: _drop, ...rest } = next
    return rest as ReadingQuestionGroup
  }

  return next
}

export function sanitizeReadingPart(part: ReadingPart): ReadingPart {
  return {
    ...part,
    rangeLabel: typeof part.rangeLabel === 'string' ? part.rangeLabel : `Part ${part.partNumber}`,
    passageTitle: typeof part.passageTitle === 'string' ? part.passageTitle : `Part ${part.partNumber}`,
    passage: (part.passage ?? []).map(block => ({
      ...block,
      text: typeof block.text === 'string' ? block.text : '',
    })),
    questionGroups: (part.questionGroups ?? []).map(sanitizeGroup),
  }
}

export function sanitizeReadingExam(exam: ReadingExam): ReadingExam {
  return {
    ...exam,
    parts: (exam.parts ?? []).map(sanitizeReadingPart),
  }
}