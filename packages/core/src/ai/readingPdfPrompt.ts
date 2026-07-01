import { callAI, type AIProvider } from './provider'

export const READING_PDF_MAX_BYTES = 12 * 1024 * 1024
/** ~13k tokens — đủ cho full Reading test 3 parts */
export const READING_PDF_TEXT_SLICE = 52_000

export interface ParsedReadingQuestion {
  number: number
  type: 'true-false-not-given' | 'multiple-choice' | 'matching-paragraph' | 'matching-features'
  prompt: string
  options: Array<{ id: string; label: string }>
  answer: string
  explanation: string
}

export interface ParsedReadingQuestionGroup {
  range: string
  instruction: string
  note?: string
  type: 'tfng' | 'matching-paragraph' | 'matching-features' | 'multiple-choice'
  paragraphLetters?: string[]
  features?: Array<{ id: string; name: string }>
  questions: ParsedReadingQuestion[]
}

export interface ParsedReadingPart {
  partNumber: 1 | 2 | 3
  passageTitle: string
  passageSubtitle?: string
  rangeLabel: string
  passage: Array<{ label?: string; text: string }>
  questionGroups: ParsedReadingQuestionGroup[]
}

/** @deprecated — dùng ParsedReadingPart */
export type ParsedReadingPart1 = ParsedReadingPart

export interface ParsedReadingFull {
  parts: ParsedReadingPart[]
}

const TFNG_OPTIONS = [
  { id: 'true', label: 'TRUE' },
  { id: 'false', label: 'FALSE' },
  { id: 'not-given', label: 'NOT GIVEN' },
]

const PART_DEFAULTS: Record<1 | 2 | 3, { title: string; range: string }> = {
  1: { title: 'Reading Passage 1', range: 'Read the text and answer questions 1–13.' },
  2: { title: 'Reading Passage 2', range: 'Read the text and answer questions 14–26.' },
  3: { title: 'Reading Passage 3', range: 'Read the text and answer questions 27–40.' },
}

function buildFullPrompt(pdfText: string): string {
  return `You are an IELTS Academic Reading test parser. Extract ALL THREE parts (Passage 1, 2, 3) from the PDF text below.

Return JSON with this exact shape:
{
  "parts": [
    {
      "partNumber": 1,
      "passageTitle": "string",
      "passageSubtitle": "optional",
      "rangeLabel": "Read the text and answer questions 1–13.",
      "passage": [{ "text": "paragraph" }],
      "questionGroups": [
        {
          "range": "Questions 1–6",
          "instruction": "full instruction",
          "note": "optional NB note",
          "type": "tfng",
          "questions": [
            {
              "number": 1,
              "type": "true-false-not-given",
              "prompt": "statement",
              "options": [
                { "id": "true", "label": "TRUE" },
                { "id": "false", "label": "FALSE" },
                { "id": "not-given", "label": "NOT GIVEN" }
              ],
              "answer": "true|false|not-given",
              "explanation": "short Vietnamese explanation"
            }
          ]
        }
      ]
    },
    {
      "partNumber": 2,
      "passageTitle": "string",
      "passage": [{ "label": "A", "text": "paragraph A" }],
      "questionGroups": [
        {
          "range": "Questions 14–18",
          "type": "matching-paragraph",
          "instruction": "Which paragraph contains the following information?",
          "note": "NB You may use any letter more than once.",
          "paragraphLetters": ["A","B","C","D","E","F","G"],
          "questions": [
            {
              "number": 14,
              "type": "matching-paragraph",
              "prompt": "statement",
              "options": [],
              "answer": "a|b|c|d|e|f|g",
              "explanation": "Vietnamese"
            }
          ]
        },
        {
          "range": "Questions 19–23",
          "type": "matching-features",
          "instruction": "Match each statement with the correct person A–C.",
          "features": [{ "id": "a", "name": "Person name" }],
          "questions": [
            {
              "number": 19,
              "type": "matching-features",
              "prompt": "statement",
              "options": [],
              "answer": "a|b|c",
              "explanation": "Vietnamese"
            }
          ]
        }
      ]
    },
    {
      "partNumber": 3,
      "passageTitle": "string",
      "passage": [{ "text": "paragraph" }],
      "questionGroups": []
    }
  ]
}

Rules:
- Extract Part 1 (questions ~1–13), Part 2 (~14–26), Part 3 (~27–40). Include every part present in the PDF.
- Part 2 passages often have labelled paragraphs A–G — include "label" on each passage block.
- For matching-paragraph: group type "matching-paragraph", question type "matching-paragraph", options=[], answer is paragraph letter lowercase.
- For matching-features: group type "matching-features", include "features" list, question type "matching-features", options=[], answer is feature id lowercase.
- For TRUE/FALSE/NOT GIVEN: group type "tfng", question type "true-false-not-given", use the three TFNG options.
- For multiple choice: group type "multiple-choice", options id a/b/c/d with full option text.
- If answer key is missing, infer best answer from passage; note uncertainty in explanation.
- Keep original question numbers. explanation in Vietnamese, concise.
- Do not invent content unsupported by the text.
- If a part is missing from PDF, omit it from the parts array (do not fabricate).

PDF TEXT:
---
${pdfText}
---`
}

function normalizePart(raw: ParsedReadingPart, fallbackNumber: 1 | 2 | 3): ParsedReadingPart {
  const partNumber = (raw.partNumber === 2 || raw.partNumber === 3 ? raw.partNumber : 1) as 1 | 2 | 3
  const defaults = PART_DEFAULTS[partNumber]

  return {
    partNumber,
    passageTitle: raw.passageTitle?.trim() || defaults.title,
    passageSubtitle: raw.passageSubtitle?.trim() || undefined,
    rangeLabel: raw.rangeLabel?.trim() || defaults.range,
    passage: (raw.passage ?? [])
      .map(p => ({ label: p.label?.trim(), text: p.text?.trim() ?? '' }))
      .filter(p => p.text.length > 0),
    questionGroups: (raw.questionGroups ?? []).map(group => ({
      range: group.range?.trim() || 'Questions',
      instruction: group.instruction?.trim() || '',
      note: group.note?.trim() || undefined,
      type: group.type ?? 'tfng',
      paragraphLetters: group.paragraphLetters,
      features: group.features,
      questions: (group.questions ?? []).map(q => ({
        number: Number(q.number) || 0,
        type: q.type ?? (group.type === 'tfng' ? 'true-false-not-given' : group.type === 'matching-paragraph' ? 'matching-paragraph' : group.type === 'matching-features' ? 'matching-features' : 'multiple-choice'),
        prompt: q.prompt?.trim() ?? '',
        options: q.type === 'true-false-not-given' || group.type === 'tfng'
          ? TFNG_OPTIONS
          : (q.type === 'matching-paragraph' || q.type === 'matching-features' || group.type === 'matching-paragraph' || group.type === 'matching-features')
            ? []
            : (q.options ?? []),
        answer: (q.answer ?? '').trim().toLowerCase(),
        explanation: q.explanation?.trim() || 'Kiểm tra lại đáp án trong PDF.',
      })).filter(q => q.prompt && q.number > 0),
    })).filter(g => g.questions.length > 0),
  }
}

function normalizeFull(raw: ParsedReadingFull): ParsedReadingPart[] {
  const parts = (raw.parts ?? [])
    .map((p, i) => normalizePart(p, (p.partNumber ?? (i + 1)) as 1 | 2 | 3))
    .filter(p => p.passage.length > 0 && p.questionGroups.length > 0)
    .sort((a, b) => a.partNumber - b.partNumber)

  return parts
}

async function callParsePdf(
  pdfText: string,
  apiKey: string,
  provider: AIProvider,
  systemHint: string,
  userPrompt: string,
): Promise<ParsedReadingPart[]> {
  const slice = pdfText.trim().slice(0, READING_PDF_TEXT_SLICE)
  if (slice.length < 200) {
    throw new Error('PDF không đủ chữ — có thể là file scan. Thử PDF có lớp text hoặc OCR trước.')
  }

  const result = await callAI(
    [
      { role: 'system', content: systemHint },
      { role: 'user', content: userPrompt },
    ],
    apiKey,
    provider,
    undefined,
    { jsonMode: true },
  )

  let parsed: ParsedReadingFull
  try {
    const json = JSON.parse(result.content) as ParsedReadingFull | ParsedReadingPart
    if ('parts' in json && Array.isArray(json.parts)) {
      parsed = json
    } else {
      parsed = { parts: [json as ParsedReadingPart] }
    }
  } catch {
    throw new Error('AI trả về JSON không hợp lệ. Thử lại hoặc dùng provider khác.')
  }

  const normalized = normalizeFull(parsed)
  if (!normalized.length) {
    throw new Error('Không trích được passage hoặc câu hỏi. Kiểm tra PDF có đúng đề Reading không.')
  }

  return normalized
}

/** Trích đủ 3 parts (hoặc các part có trong PDF). */
export async function parseReadingPdfFull(
  pdfText: string,
  apiKey: string,
  provider: AIProvider = 'openai',
): Promise<ParsedReadingPart[]> {
  return callParsePdf(
    pdfText,
    apiKey,
    provider,
    'You extract structured IELTS Reading data for all parts. Respond with valid JSON only.',
    buildFullPrompt(pdfText),
  )
}

/** Chỉ Part 1 — giữ tương thích ngược. */
export async function parseReadingPdfPart1(
  pdfText: string,
  apiKey: string,
  provider: AIProvider = 'openai',
): Promise<ParsedReadingPart> {
  const parts = await parseReadingPdfFull(pdfText, apiKey, provider)
  const part1 = parts.find(p => p.partNumber === 1) ?? parts[0]
  if (!part1) {
    throw new Error('Không trích được câu hỏi Part 1.')
  }
  return part1
}