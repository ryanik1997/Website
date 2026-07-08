import type {
  ReadingExam,
  ReadingPart,
  ReadingQuestion,
  ReadingQuestionGroup,
} from './examData'
import { normalizeReadingNoteTable } from './readingNoteTableUtils'

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

function sanitizeQuestion(group: ReadingQuestionGroup, q: ReadingQuestion): ReadingQuestion {
  const answer = typeof q.answer === 'string' ? q.answer : ''
  let options = Array.isArray(q.options) ? q.options : []

  if (group.type === 'ynng' && options.length < 3) {
    options = [...YNNG_OPTIONS]
  }
  if (group.type === 'tfng' && options.length < 3) {
    options = [...TFNG_OPTIONS]
  }

  return {
    ...q,
    prompt: typeof q.prompt === 'string' ? q.prompt : `Question ${q.number}`,
    answer,
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

function sanitizeGroup(group: ReadingQuestionGroup): ReadingQuestionGroup {
  const type = normalizeReadingGroupType(group.type, group)
  const noteTable = group.noteTable
    ? normalizeReadingNoteTable(group.noteTable) ?? group.noteTable
    : undefined

  const next: ReadingQuestionGroup = {
    ...group,
    type,
    range: typeof group.range === 'string' ? group.range : 'Questions',
    instruction: typeof group.instruction === 'string' ? group.instruction : 'Choose the correct answer.',
    ...(noteTable ? { noteTable } : {}),
    features: sanitizeFeatureList(group.features),
    headings: sanitizeHeadings(group.headings),
    wordBank: sanitizeWordBank(group.wordBank),
    paragraphLetters: Array.isArray(group.paragraphLetters)
      ? group.paragraphLetters.map(l => String(l ?? '').trim()).filter(Boolean)
      : group.paragraphLetters,
    questions: (group.questions ?? []).map(q => sanitizeQuestion({ ...group, type }, q)),
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