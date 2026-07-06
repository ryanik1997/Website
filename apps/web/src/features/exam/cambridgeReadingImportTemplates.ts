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
  optionCount?: 3 | 4 | 5 | 7 | 8
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
      instruction: 'For each question, write the correct answer. Write one word for each gap.',
    },
    {
      partNumber: 6,
      from: 31,
      to: 31,
      title: 'Writing — short message',
      groupType: 'sentence-completion',
      instruction: 'Write 25 words or more.',
    },
    {
      partNumber: 7,
      from: 32,
      to: 32,
      title: 'Writing — picture story',
      groupType: 'sentence-completion',
      instruction: 'Write 35 words or more.',
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
    {
      partNumber: 7,
      from: 33,
      to: 33,
      title: 'Writing — extended message',
      groupType: 'sentence-completion',
      instruction: 'Write 100 words or more.',
    },
    {
      partNumber: 8,
      from: 34,
      to: 34,
      title: 'Writing — picture story',
      groupType: 'sentence-completion',
      instruction: 'Write 100 words or more.',
    },
  ],
  b2: [
    { partNumber: 1, from: 1, to: 8, title: 'Multiple-choice cloze', groupType: 'multiple-choice', optionCount: 4 },
    { partNumber: 2, from: 9, to: 16, title: 'Open cloze', groupType: 'gap-fill' },
    { partNumber: 3, from: 17, to: 24, title: 'Word formation', groupType: 'gap-fill' },
    { partNumber: 4, from: 25, to: 30, title: 'Key word transformation', groupType: 'gap-fill' },
    { partNumber: 5, from: 31, to: 36, title: 'Reading — text 1', groupType: 'multiple-choice', optionCount: 4 },
    { partNumber: 6, from: 37, to: 42, title: 'Reading — gapped text', groupType: 'matching-features', optionCount: 7 },
    { partNumber: 7, from: 43, to: 52, title: 'Reading — multiple matching', groupType: 'matching-features', optionCount: 4 },
    {
      partNumber: 8,
      from: 53,
      to: 53,
      title: 'Writing — essay',
      groupType: 'sentence-completion',
      instruction: 'Write 140–190 words.',
    },
    {
      partNumber: 9,
      from: 54,
      to: 54,
      title: 'Writing — picture story',
      groupType: 'sentence-completion',
      instruction: 'Write 140–190 words.',
    },
  ],
  c1: [
    { partNumber: 1, from: 1, to: 8, title: 'Multiple-choice cloze', groupType: 'multiple-choice', optionCount: 4 },
    { partNumber: 2, from: 9, to: 16, title: 'Open cloze', groupType: 'gap-fill' },
    { partNumber: 3, from: 17, to: 24, title: 'Word formation', groupType: 'gap-fill' },
    { partNumber: 4, from: 25, to: 30, title: 'Key word transformation', groupType: 'gap-fill' },
    { partNumber: 5, from: 31, to: 36, title: 'Reading — text 1', groupType: 'multiple-choice', optionCount: 4 },
    { partNumber: 6, from: 37, to: 40, title: 'Reading — cross-text matching', groupType: 'matching-features', optionCount: 4 },
    { partNumber: 7, from: 41, to: 46, title: 'Reading — gapped text', groupType: 'matching-features', optionCount: 7 },
    { partNumber: 8, from: 47, to: 56, title: 'Reading — multiple matching', groupType: 'matching-features', optionCount: 5 },
    {
      partNumber: 9,
      from: 57,
      to: 57,
      title: 'Writing — task 1',
      groupType: 'sentence-completion',
      instruction: 'Write 220–260 words.',
    },
    {
      partNumber: 10,
      from: 58,
      to: 58,
      title: 'Writing — task 2',
      groupType: 'sentence-completion',
      instruction: 'Write 220–260 words.',
    },
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

function mcOptions(count: 3 | 4 | 5 | 7 | 8, wordChoice?: boolean) {
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

function fceParagraphOptions(count: 4 | 5) {
  const letters = ['A', 'B', 'C', 'D', 'E'].slice(0, count)
  return letters.map(id => ({ id, label: `Paragraph ${id}` }))
}

function fceParagraphMatchingQuestion(n: number, meta: PartMeta) {
  const count = (meta.optionCount ?? 4) as 4 | 5
  return {
    number: n,
    type: 'matching-features' as const,
    prompt: `Question ${n} — copy từ đề`,
    options: fceParagraphOptions(count),
    answer: 'a',
    explanation: 'Paragraph A/B/C/D theo answer key.',
  }
}

function caeReviewerOptions(count: 4) {
  const letters = ['A', 'B', 'C', 'D'].slice(0, count)
  return letters.map(id => ({ id, label: `Reviewer ${id}` }))
}

function caeConsultantOptions(count: 5) {
  const letters = ['A', 'B', 'C', 'D', 'E'].slice(0, count)
  return letters.map(id => ({ id, label: `Consultant ${id}` }))
}

function caeLabeledMatchingQuestion(
  n: number,
  meta: PartMeta,
  kind: 'reviewer' | 'consultant',
) {
  const count = (meta.optionCount ?? (kind === 'reviewer' ? 4 : 5)) as 4 | 5
  const options = kind === 'reviewer'
    ? caeReviewerOptions(count as 4)
    : caeConsultantOptions(count as 5)
  return {
    number: n,
    type: 'matching-features' as const,
    prompt: `Question ${n} — copy từ đề`,
    options,
    answer: 'a',
    explanation: kind === 'reviewer'
      ? 'Reviewer A/B/C/D theo answer key.'
      : 'Consultant A/B/C/D/E theo answer key.',
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

function writingQuestion(n: number, minWords: number, prompt: string) {
  return {
    number: n,
    type: 'writing-task' as const,
    prompt,
    options: [],
    answer: '',
    explanation: 'Writing — chấm thủ công / AI sau.',
    minWords,
  }
}

function sampleQuestions(meta: PartMeta, level: CambridgeLevelSlug) {
  const nums: number[] = []
  for (let n = meta.from; n <= meta.to; n += 1) nums.push(n)

  if (level === 'a2' && meta.partNumber === 6) {
    return [writingQuestion(31, 25, 'Write your email in the box on the right.')]
  }
  if (level === 'a2' && meta.partNumber === 7) {
    return [writingQuestion(32, 35, 'Look at the three pictures. Write the story shown in the pictures. Write 35 words or more.')]
  }
  if (level === 'b1' && meta.partNumber === 7) {
    return [writingQuestion(33, 100, 'Write your answer in the box on the right.')]
  }
  if (level === 'b1' && meta.partNumber === 8) {
    return [writingQuestion(34, 100, 'Look at the picture. Write the story shown in the picture. Write 100 words or more.')]
  }
  if (level === 'b2' && meta.partNumber === 8) {
    return [writingQuestion(53, 140, 'Write your answer in the box on the right.')]
  }
  if (level === 'b2' && meta.partNumber === 9) {
    return [writingQuestion(54, 140, 'Look at the picture. Write the story shown in the picture. Write 140–190 words.')]
  }
  if (level === 'b2' && meta.partNumber === 7) {
    return nums.map(n => fceParagraphMatchingQuestion(n, meta))
  }
  if (level === 'c1' && meta.partNumber === 6) {
    return nums.map(n => caeLabeledMatchingQuestion(n, meta, 'reviewer'))
  }
  if (level === 'c1' && meta.partNumber === 8) {
    return nums.map(n => caeLabeledMatchingQuestion(n, meta, 'consultant'))
  }
  if (level === 'c1' && meta.partNumber === 9) {
    return [writingQuestion(57, 220, 'Write your answer to Question 1 in the box on the right.')]
  }
  if (level === 'c1' && meta.partNumber === 10) {
    return [writingQuestion(58, 220, 'Write your answer to Question 2 in the box on the right.')]
  }

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
    return [
      { label: 'From', text: '…' },
      { label: 'To', text: '…' },
      { text: 'How (0) are you? … (25) ........ … — đoạn 1 thân email.' },
      { text: 'Đoạn 2 thân email — (28) ........ … (30) ........ …' },
      { text: 'Write soon!' },
    ]
  }

  if (level === 'a2' && meta.partNumber === 6) {
    return [
      { imageFile: 'part6-page.jpg' },
    ]
  }

  if (level === 'a2' && meta.partNumber === 7) {
    return [
      { imageFile: 'part7-p1.jpg' },
      { imageFile: 'part7-p2.jpg' },
      { imageFile: 'part7-p3.jpg' },
    ]
  }

  if (level === 'b1' && meta.partNumber === 7) {
    return [{ imageFile: 'part7-page.jpg' }]
  }

  if (level === 'b1' && meta.partNumber === 8) {
    return [{ imageFile: 'part8-page.jpg' }]
  }

  if (level === 'b2' && meta.partNumber === 8) {
    return [{ imageFile: 'part8-page.jpg' }]
  }

  if (level === 'b2' && meta.partNumber === 9) {
    return [{ imageFile: 'part9-page.jpg' }]
  }

  if (level === 'c1' && meta.partNumber === 9) {
    return [{ imageFile: 'part9-page.jpg' }]
  }

  if (level === 'c1' && meta.partNumber === 10) {
    return [{ imageFile: 'part10-page.jpg' }]
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
  const range = meta.from === meta.to
    ? `Question ${meta.from}`
    : `Questions ${meta.from}–${meta.to}`
  const group: ReadingImportPayload['parts'][0]['questionGroups'][0] = {
    range,
    type: meta.groupType,
    instruction: meta.instruction ?? DEFAULT_INSTRUCTIONS[meta.groupType],
    questions: sampleQuestions(meta, level),
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

  if (meta.groupType === 'matching-features' && level === 'b2' && meta.partNumber === 7) {
    group.features = [
      { id: 'a', name: 'Paragraph A' },
      { id: 'b', name: 'Paragraph B' },
      { id: 'c', name: 'Paragraph C' },
      { id: 'd', name: 'Paragraph D' },
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
    let passageHint = 'Copy nguyên văn passage[].text từ PDF — PDF có bao nhiêu đoạn thì bấy nhiêu block (không gộp \\n\\n). Cần text để Highlight.'
    let questionHint = `${meta.groupType}; answer từ answer key.`

    if (meta.title.toLowerCase().includes('reading comprehension')) {
      passageHint = 'passageTitle + passageSubtitle (tiêu đề/subtitle trong khung PDF); thân bài: mỗi đoạn = 1 block text.'
    }
    if (level === 'a2' && meta.partNumber === 5) {
      passageHint = '1 email: label From/To + từng đoạn + Write soon! · 2 email (Test 1): 1 block/email (25–27 rồi 28–30).'
    }
    if (level === 'a2' && meta.partNumber === 6) {
      passageHint = 'Ảnh JPG part6-page.jpg (screenshot đề) HOẶC copy text đề email vào passage[].text.'
    }
    if (level === 'a2' && meta.partNumber === 7) {
      passageHint = '3 ảnh part7-p1.jpg … part7-p3.jpg (bắt buộc đủ 3 khi import bằng ảnh).'
    }
    if (level === 'b1' && meta.partNumber === 7) {
      passageHint = 'Ảnh part7-page.jpg (screenshot đề) HOẶC copy text đề vào passage[].text.'
    }
    if (level === 'b1' && meta.partNumber === 8) {
      passageHint = '1 ảnh part8-page.jpg (truyện tranh 3 khung trong 1 file) — KHÔNG tách part8-p1…p3 như KET.'
    }
    if (level === 'b2' && meta.partNumber === 7) {
      passageHint = 'Tiêu đề + intro; mỗi đoạn A–D = { "label": "A", "text": "..." } — UI hiển thị "Paragraph A" phía trên.'
      questionHint = 'matching-features: options label "Paragraph A" … "Paragraph D"; answer key a/b/c/d.'
    }
    if (level === 'b2' && meta.partNumber === 8) {
      passageHint = 'Ảnh JPG part8-page.jpg (screenshot đề essay) HOẶC copy text đề vào passage[].text.'
    }
    if (level === 'b2' && meta.partNumber === 9) {
      passageHint = '1 ảnh part9-page.jpg (truyện tranh 3 khung trong 1 file) — KHÔNG tách part9-p1…p3 như KET.'
    }
    if (level === 'c1' && meta.partNumber === 6) {
      passageHint = 'Tiêu đề + intro; mỗi reviewer A–D = { "label": "A", "text": "..." } — UI hiển thị "Reviewer A".'
      questionHint = 'matching-features: options label "Reviewer A" … "Reviewer D"; answer key a/b/c/d.'
    }
    if (level === 'c1' && meta.partNumber === 7) {
      passageHint = 'Gapped text: giữ (41) … (46) trong passage; bank A–G trong passage label.'
      questionHint = 'matching-features kéo thả A–G; answer key a–g.'
    }
    if (level === 'c1' && meta.partNumber === 8) {
      passageHint = 'Tiêu đề + intro; mỗi consultant A–E = { "label": "A", "text": "..." } — UI hiển thị "Consultant A".'
      questionHint = 'matching-features: options label "Consultant A" … "Consultant E"; answer key a/b/c/d/e.'
    }
    if (level === 'c1' && meta.partNumber === 9) {
      passageHint = 'Ảnh JPG part9-page.jpg (screenshot đề Writing Q57) HOẶC copy text đề vào passage[].text.'
    }
    if (level === 'c1' && meta.partNumber === 10) {
      passageHint = 'Ảnh JPG part10-page.jpg (screenshot đề Writing Q58) HOẶC copy text đề vào passage[].text.'
    }

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
    if (level === 'a2' && meta.partNumber === 5) {
      questionHint = 'gap-fill ONE WORD; answer key có 2 từ → answer: "từ1/từ2" (app chấp nhận cả hai).'
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
  if (level === 'a2') {
    return `${fmt?.exam ?? 'KET'}: 7 parts · ${qCount} câu. Part 1 + Part 6–7 có thể dùng ảnh JPG; Part 2–5 copy text.`
  }
  if (level === 'b1') {
    return `${fmt?.exam ?? 'PET'}: 8 parts · ${qCount} câu. Part 1 + Part 7–8 ảnh JPG (Part 8 = 1 ảnh); Part 2–6 copy text.`
  }
  if (level === 'b2') {
    return `${fmt?.exam ?? 'FCE'}: 9 parts · ${qCount} câu. Part 1–7 copy text; Part 8–9 ảnh JPG (mỗi part 1 ảnh: part8-page.jpg, part9-page.jpg).`
  }
  if (level === 'c1') {
    return `${fmt?.exam ?? 'CAE'}: 10 parts · ${qCount} câu. Part 1–8 copy text; Part 9–10 ảnh JPG (part9-page.jpg Q57, part10-page.jpg Q58).`
  }
  if (level === 'c2') {
    return `${fmt?.exam ?? 'CPE'}: 9 parts · 53 mục. Part 1–7 copy text; Part 8–9 ảnh JPG (part8-page.jpg Q1, part9-page.jpg Q2–4) — không text passage.`
  }
  return `${fmt?.exam ?? 'Cambridge'}: ${parts.length} parts · ${qCount} câu Reading. ${imageNote}; Part 2+ bắt buộc text.`
}

export function cambridgeImportGuideLines(level: CambridgeLevelSlug): string[] {
  const guides = cambridgeReadingPartGuides(level)
  return guides.map(g => (
    `Part ${g.partNumber} (${g.range}): ${g.title} — ${g.groupType}. ${g.passageHint}`
  ))
}