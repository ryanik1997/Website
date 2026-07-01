import type { CambridgeLevelSlug } from './cambridgeExamLevels'
import { getCambridgeExamFormat } from './cambridgeExamFormats'
import type { ReadingImportPayload } from './importReadingManualUtils'

type GroupType = ReadingImportPayload['parts'][0]['questionGroups'][0]['type']

export interface CambridgeReadingPartGuide {
  partNumber: number
  range: string
  title: string
  groupType: GroupType
  passageHint: string
  questionHint: string
  /** A2 Part 4: MC chọn 1 trong 3 từ */
  wordChoiceMc?: boolean
}

interface PartMeta {
  partNumber: number
  from: number
  to: number
  title: string
  /** Part 1 A2/B1 signs — ảnh OK; các part khác dùng text để Highlight */
  imageOk?: boolean
  /** A2 Part 1: mỗi câu 1 ảnh part1-qN.jpg */
  imagePerQuestion?: boolean
  groupType: GroupType
  optionCount?: 3 | 4 | 5 | 8
  /** Part 4 KET: MC chọn 1 từ (3 options là từ, không phải gap-fill tự gõ) */
  wordChoiceMc?: boolean
  instruction?: string
}

const LEVEL_PARTS: Record<CambridgeLevelSlug, PartMeta[]> = {
  a2: [
    {
      partNumber: 1,
      from: 1,
      to: 6,
      title: 'Signs and messages',
      imageOk: true,
      imagePerQuestion: true,
      groupType: 'multiple-choice',
      optionCount: 3,
      instruction: 'For each question, choose the correct answer.',
    },
    {
      partNumber: 2,
      from: 7,
      to: 13,
      title: 'Matching people',
      groupType: 'multiple-choice',
      optionCount: 3,
      instruction: 'For each question, choose the correct answer.',
    },
    {
      partNumber: 3,
      from: 14,
      to: 18,
      title: 'Reading comprehension',
      groupType: 'multiple-choice',
      optionCount: 3,
      instruction: 'For each question, choose the correct answer.',
    },
    {
      partNumber: 4,
      from: 19,
      to: 24,
      title: 'Multiple-choice cloze',
      groupType: 'multiple-choice',
      optionCount: 3,
      wordChoiceMc: true,
      instruction: 'For each question, choose the correct answer.',
    },
    {
      partNumber: 5,
      from: 25,
      to: 30,
      title: 'Email / open cloze',
      groupType: 'gap-fill',
      instruction: 'Write ONE word for each gap.',
    },
  ],
  b1: [
    {
      partNumber: 1,
      from: 1,
      to: 5,
      title: 'Signs and messages',
      imageOk: true,
      imagePerQuestion: true,
      groupType: 'multiple-choice',
      optionCount: 3,
    },
    { partNumber: 2, from: 6, to: 10, title: 'Matching', groupType: 'matching-features', optionCount: 8 },
    { partNumber: 3, from: 11, to: 15, title: 'Reading comprehension', groupType: 'multiple-choice', optionCount: 4 },
    { partNumber: 4, from: 16, to: 20, title: 'Gapped text (sentences)', groupType: 'matching-features', optionCount: 8 },
    {
      partNumber: 5,
      from: 21,
      to: 26,
      title: 'Multiple-choice cloze',
      groupType: 'multiple-choice',
      optionCount: 4,
      wordChoiceMc: true,
    },
    { partNumber: 6, from: 27, to: 32, title: 'Open cloze', groupType: 'gap-fill' },
  ],
  b2: [
    { partNumber: 1, from: 1, to: 8, title: 'Multiple-choice cloze', groupType: 'multiple-choice', optionCount: 4 },
    { partNumber: 2, from: 9, to: 16, title: 'Open cloze', groupType: 'gap-fill' },
    { partNumber: 3, from: 17, to: 24, title: 'Word formation', groupType: 'gap-fill' },
    { partNumber: 4, from: 25, to: 30, title: 'Key word transformation', groupType: 'gap-fill' },
    { partNumber: 5, from: 31, to: 36, title: 'Reading — text 1', groupType: 'multiple-choice', optionCount: 4 },
    { partNumber: 6, from: 37, to: 42, title: 'Reading — gapped text', groupType: 'gap-fill' },
    { partNumber: 7, from: 43, to: 52, title: 'Reading — multiple matching', groupType: 'matching-features', optionCount: 5 },
  ],
  c1: [
    { partNumber: 1, from: 1, to: 8, title: 'Multiple-choice cloze', groupType: 'multiple-choice', optionCount: 4 },
    { partNumber: 2, from: 9, to: 16, title: 'Open cloze', groupType: 'gap-fill' },
    { partNumber: 3, from: 17, to: 24, title: 'Word formation', groupType: 'gap-fill' },
    { partNumber: 4, from: 25, to: 30, title: 'Key word transformation', groupType: 'gap-fill' },
    { partNumber: 5, from: 31, to: 36, title: 'Reading — text 1', groupType: 'multiple-choice', optionCount: 4 },
    { partNumber: 6, from: 37, to: 42, title: 'Reading — cross-text matching', groupType: 'matching-features', optionCount: 5 },
    { partNumber: 7, from: 43, to: 48, title: 'Reading — gapped text', groupType: 'gap-fill' },
    { partNumber: 8, from: 49, to: 56, title: 'Reading — multiple matching', groupType: 'matching-features', optionCount: 5 },
  ],
  c2: [
    { partNumber: 1, from: 1, to: 8, title: 'Multiple-choice cloze', groupType: 'multiple-choice', optionCount: 4 },
    { partNumber: 2, from: 9, to: 16, title: 'Open cloze', groupType: 'gap-fill' },
    { partNumber: 3, from: 17, to: 24, title: 'Word formation', groupType: 'gap-fill' },
    { partNumber: 4, from: 25, to: 30, title: 'Key word transformation', groupType: 'gap-fill' },
    { partNumber: 5, from: 31, to: 36, title: 'Reading — text 1', groupType: 'multiple-choice', optionCount: 4 },
    { partNumber: 6, from: 37, to: 42, title: 'Reading — gapped text', groupType: 'gap-fill' },
    { partNumber: 7, from: 43, to: 53, title: 'Reading — multiple matching', groupType: 'matching-features', optionCount: 5 },
  ],
}

const DEFAULT_INSTRUCTIONS: Record<GroupType, string> = {
  'multiple-choice': 'For each question, choose the correct answer.',
  'gap-fill': 'Write ONE word for each gap.',
  'summary-completion': 'Choose the correct word from the box for each gap.',
  'matching-features': 'For each question, choose the correct answer.',
  'matching-paragraph': 'Which paragraph contains the following information?',
  'tfng': 'Do the statements agree with the information in the passage?',
  'sentence-completion': 'Complete the sentences using NO MORE THAN TWO WORDS from the passage.',
}

function mcOptions(count: 3 | 4 | 5 | 8, wordChoice?: boolean) {
  const ids = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, count)
  return ids.map(id => ({
    id,
    label: wordChoice ? `word ${id}` : `Option ${id}`,
  }))
}

function mcQuestion(n: number, meta: PartMeta) {
  const count = meta.optionCount ?? 4
  return {
    number: n,
    type: 'multiple-choice' as const,
    prompt: meta.wordChoiceMc ? `Gap (${n})` : `Question ${n} — copy từ đề`,
    options: mcOptions(count, meta.wordChoiceMc),
    answer: 'a',
    explanation: meta.wordChoiceMc
      ? 'Chọn đúng từ A/B/C theo answer key (đề KET Part 4 là MC chọn từ, không tự gõ).'
      : 'Giải thích đáp án.',
  }
}

function gapQuestion(n: number) {
  return {
    number: n,
    type: 'gap-fill' as const,
    prompt: `Gap (${n})`,
    answer: 'word',
    explanation: 'ONE WORD (theo answer key).',
  }
}

function sampleQuestions(meta: PartMeta) {
  const nums: number[] = []
  for (let n = meta.from; n <= meta.to; n += 1) nums.push(n)

  if (meta.groupType === 'gap-fill' || meta.groupType === 'summary-completion') {
    return nums.map(gapQuestion)
  }
  return nums.map(n => mcQuestion(n, meta))
}

function passageBlocks(meta: PartMeta, level: CambridgeLevelSlug): ReadingImportPayload['parts'][0]['passage'] {
  if (meta.imagePerQuestion && meta.imageOk) {
    const blocks: ReadingImportPayload['parts'][0]['passage'] = []
    for (let n = meta.from; n <= meta.to; n += 1) {
      blocks.push({ imageFile: `part1-q${n}.jpg` })
    }
    return blocks
  }

  if (meta.imageOk) {
    return [
      { imageFile: `part${meta.partNumber}-page.jpg` },
      { text: 'Hoặc copy text signs vào đây nếu không dùng ảnh.' },
    ]
  }

  if (level === 'a2' && meta.partNumber === 2) {
    return [
      { text: 'Copy tiêu đề part từ PDF (vd: Making friends at university).' },
      { label: 'Angus', text: 'Copy nguyên đoạn profile — text để Highlight khi làm bài.' },
      { label: 'Frank', text: 'Copy profile Frank…' },
      { label: 'Zac', text: 'Copy profile Zac…' },
    ]
  }

  if (level === 'a2' && meta.partNumber === 4) {
    return [{
      text: 'Oymyakon is a village… the days are (19) ........ , and temperatures can go as (20) ........ as -68°C. Copy nguyên văn + giữ (19) ........ … (24) ........ trong passage.',
    }]
  }

  if (level === 'a2' && meta.partNumber === 5) {
    return [{
      text: 'Example: 0 are\n\nFrom: …\nTo: …\n\nCopy email đầy đủ — giữ (25), (26)… trong text.',
    }]
  }

  if (meta.partNumber === 1 && level !== 'a2' && level !== 'b1') {
    return [{
      text: 'Copy toàn bộ text Part 1 từ PDF. Text = Highlight khi làm bài.',
    }]
  }

  return [
    { text: `Copy tiêu đề + đoạn văn Part ${meta.partNumber} từ PDF vào đây.` },
    { text: 'Thêm khối { "text": "..." } hoặc { "label": "A", "text": "..." } cho từng đoạn/paragraph.' },
  ]
}

function buildPart(meta: PartMeta, level: CambridgeLevelSlug): ReadingImportPayload['parts'][0] {
  const range = `Questions ${meta.from}–${meta.to}`
  const group: ReadingImportPayload['parts'][0]['questionGroups'][0] = {
    range,
    type: meta.groupType,
    instruction: meta.instruction ?? DEFAULT_INSTRUCTIONS[meta.groupType],
    questions: sampleQuestions(meta),
  }

  if (meta.groupType === 'summary-completion' && level === 'b1' && meta.partNumber === 5) {
    group.wordBank = [
      { id: 'a', label: 'word A' },
      { id: 'b', label: 'word B' },
      { id: 'c', label: 'word C' },
      { id: 'd', label: 'word D' },
      { id: 'e', label: 'word E' },
    ]
  }

  if (meta.groupType === 'matching-features' && level === 'b1' && (meta.partNumber === 2 || meta.partNumber === 4)) {
    group.features = [
      { id: 'a', name: 'Short label A (pills only — full text in passage[])' },
      { id: 'b', name: 'Short label B' },
      { id: 'c', name: 'Short label C' },
      { id: 'd', name: 'Short label D' },
      { id: 'e', name: 'Short label E' },
      { id: 'f', name: 'Short label F' },
      { id: 'g', name: 'Short label G' },
      { id: 'h', name: 'Short label H' },
    ]
  }

  return {
    partNumber: meta.partNumber,
    rangeLabel: range,
    passageTitle: `Part ${meta.partNumber} — ${meta.title}`,
    passage: passageBlocks(meta, level),
    questionGroups: [group],
  }
}

export function cambridgeReadingPartGuides(level: CambridgeLevelSlug): CambridgeReadingPartGuide[] {
  const parts = LEVEL_PARTS[level] ?? []
  return parts.map(meta => {
    const range = `Q${meta.from}–${meta.to}`
    let passageHint = 'Copy nguyên văn passage[].text từ PDF — cần text để Highlight.'
    let questionHint = `${meta.groupType}; answer từ answer key.`

    if (meta.imagePerQuestion) {
      passageHint = '6 ảnh part1-q1.jpg … part1-q6.jpg (mỗi câu 1 sign). Có thể thay bằng 1 ảnh part1-page.jpg.'
    } else if (meta.imageOk) {
      passageHint = 'Có thể dùng ảnh part1-page.jpg; hoặc copy text signs.'
    }
    if (meta.wordChoiceMc) {
      questionHint = 'multiple-choice: mỗi gap 3 từ A/B/C (đề gốc chọn từ, KHÔNG gap-fill tự gõ).'
    }
    if (meta.groupType === 'summary-completion') {
      questionHint = 'summary-completion + wordBank; hoặc MC chọn từ trong bank.'
    }
    if (meta.groupType === 'matching-features') {
      questionHint = 'matching-features: options thường là A–E; khai báo features[] nếu có.'
    }

    return {
      partNumber: meta.partNumber,
      range,
      title: meta.title,
      groupType: meta.groupType,
      passageHint,
      questionHint,
      wordChoiceMc: meta.wordChoiceMc,
    }
  })
}

export function cambridgeReadingImportTemplate(level: CambridgeLevelSlug): ReadingImportPayload | null {
  const fmt = getCambridgeExamFormat(level)
  const partsMeta = LEVEL_PARTS[level]
  if (!fmt || !partsMeta.length) return null

  const readingQuestions = partsMeta.reduce((sum, p) => sum + (p.to - p.from + 1), 0)

  return {
    version: 1,
    title: `${fmt.exam} ${level.toUpperCase()} Reading — Đề import thủ công`,
    durationMinutes: fmt.reading.durationMinutes,
    bandHint: `${fmt.exam} Reading · ${readingQuestions} câu`,
    examTrack: 'cambridge',
    cambridgeLevel: level,
    parts: partsMeta.map(meta => buildPart(meta, level)),
  }
}

export function cambridgeImportGuideNote(level?: CambridgeLevelSlug): string {
  if (!level) {
    return 'Cambridge A2–C2: Part 1 signs (A2/B1) có thể dùng ảnh; Part còn lại copy text passage để Highlight.'
  }
  const fmt = getCambridgeExamFormat(level)
  const parts = LEVEL_PARTS[level]
  const qCount = parts.reduce((sum, p) => sum + (p.to - p.from + 1), 0)
  const imageNote = level === 'a2' || level === 'b1'
    ? 'Part 1: ảnh signs OK'
    : 'Part 1: copy text (cloze)'
  return `${fmt?.exam ?? level.toUpperCase()}: ${parts.length} parts · ${qCount} câu Reading. ${imageNote}; Part 2+ bắt buộc text.`
}

export function cambridgeImportGuideLines(level: CambridgeLevelSlug): string[] {
  const guides = cambridgeReadingPartGuides(level)
  return guides.map(g => (
    `Part ${g.partNumber} (${g.range}): ${g.title} — ${g.groupType}. ${g.passageHint}`
  ))
}