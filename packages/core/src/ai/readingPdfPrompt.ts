import { callAI, type AIProvider } from './provider'

export const READING_PDF_MAX_BYTES = 12 * 1024 * 1024
export const READING_PDF_TEXT_SLICE = 52_000
export const READING_PDF_PART_SLICE = 22_000

export type AnswerConfidence = 'key' | 'inferred'

export interface ParsedReadingQuestion {
  number: number
  type:
    | 'true-false-not-given'
    | 'multiple-choice'
    | 'matching-paragraph'
    | 'matching-features'
    | 'gap-fill'
    | 'summary-completion'
    | 'sentence-completion'
  prompt: string
  options: Array<{ id: string; label: string }>
  answer: string
  explanation: string
  answerConfidence?: AnswerConfidence
}

export interface ParsedReadingQuestionGroup {
  range: string
  instruction: string
  note?: string
  type:
    | 'tfng'
    | 'matching-paragraph'
    | 'matching-features'
    | 'multiple-choice'
    | 'gap-fill'
    | 'summary-completion'
    | 'sentence-completion'
  paragraphLetters?: string[]
  features?: Array<{ id: string; name: string }>
  wordBank?: Array<{ id: string; label: string }>
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

export type ParseProgressEvent =
  | { phase: 'extract'; status: 'start' | 'done' }
  | { phase: 'full'; status: 'start' | 'done' | 'error' }
  | { phase: 'part'; partNumber: 1 | 2 | 3; status: 'start' | 'done' | 'skip' | 'error' }

export type ParseProgressCallback = (event: ParseProgressEvent) => void

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

const QUESTION_TYPE_RULES = `
Question / group types:
- TRUE/FALSE/NOT GIVEN: group "tfng", question "true-false-not-given", three TFNG options.
- Multiple choice: group "multiple-choice", options id a/b/c/d.
- Matching paragraph: group "matching-paragraph", paragraphLetters A–G, question "matching-paragraph", options=[], answer=letter lowercase.
- Matching features: group "matching-features", features list, question "matching-features", options=[], answer=feature id lowercase.
- Gap fill (ONE WORD ONLY): group "gap-fill", question "gap-fill", options=[], answer=single word lowercase.
- Summary completion (word bank A–J): group "summary-completion", wordBank [{id,label}], question "summary-completion", answer=bank id lowercase.
- Sentence completion (ONE WORD): group "sentence-completion", question "sentence-completion", options=[], answer=single word lowercase.

Answer confidence (REQUIRED on every question):
- "key" if answer appears in PDF answer key
- "inferred" if guessed from passage (no key in PDF)
`

function buildFullPrompt(pdfText: string): string {
  return `You are an IELTS Academic Reading test parser. Extract ALL THREE parts from the PDF text.

Return JSON: { "parts": [ { "partNumber": 1, "passageTitle": "...", "rangeLabel": "...", "passage": [...], "questionGroups": [...] }, ... ] }

${QUESTION_TYPE_RULES}

Rules:
- Part 1 (~Q1–13), Part 2 (~Q14–26), Part 3 (~Q27–40). Omit missing parts.
- Part 2: passage blocks often have "label": "A".."G".
- explanation in Vietnamese. Keep question numbers from PDF.
- Do not invent unsupported content.

PDF TEXT:
---
${pdfText.slice(0, READING_PDF_TEXT_SLICE)}
---`
}

function buildPartPrompt(partNumber: 1 | 2 | 3, pdfText: string): string {
  const defaults = PART_DEFAULTS[partNumber]
  return `Extract ONLY IELTS Reading Part ${partNumber} from the PDF text.

Return JSON for a SINGLE part (not wrapped in "parts"):
{
  "partNumber": ${partNumber},
  "passageTitle": "string",
  "rangeLabel": "${defaults.range}",
  "passage": [{ "label": "optional A-G", "text": "paragraph" }],
  "questionGroups": [...]
}

${QUESTION_TYPE_RULES}

Rules:
- Only Part ${partNumber}. Stop before other parts.
- explanation in Vietnamese. answerConfidence required.

PDF TEXT (Part ${partNumber} section):
---
${pdfText.slice(0, READING_PDF_PART_SLICE)}
---`
}

export function splitPdfTextForParts(fullText: string): Record<1 | 2 | 3, string> {
  const text = fullText.trim()
  if (!text) return { 1: '', 2: '', 3: '' }

  const findIdx = (patterns: RegExp[], start = 0): number => {
    let best = text.length
    for (const re of patterns) {
      const m = text.slice(start).search(re)
      if (m >= 0) {
        const abs = start + m
        if (abs < best) best = abs
      }
    }
    return best
  }

  const idx2 = findIdx([
    /reading\s+passage\s+2\b/i,
    /\bpart\s*2\b/i,
    /questions?\s*1[4-9]\s*[–\-—]/i,
    /questions?\s*14\b/i,
  ])

  const idx3 = findIdx([
    /reading\s+passage\s+3\b/i,
    /\bpart\s*3\b/i,
    /questions?\s*2[7-9]\s*[–\-—]/i,
    /questions?\s*27\b/i,
  ], idx2 < text.length ? idx2 : 0)

  const safe2 = idx2 > 200 ? idx2 : text.length
  const safe3 = idx3 > safe2 + 200 ? idx3 : text.length

  return {
    1: text.slice(0, safe2),
    2: text.slice(safe2, safe3),
    3: text.slice(safe3),
  }
}

function resolveQuestionType(
  groupType: ParsedReadingQuestionGroup['type'],
  qType?: ParsedReadingQuestion['type'],
): ParsedReadingQuestion['type'] {
  if (qType) return qType
  switch (groupType) {
    case 'tfng': return 'true-false-not-given'
    case 'matching-paragraph': return 'matching-paragraph'
    case 'matching-features': return 'matching-features'
    case 'gap-fill': return 'gap-fill'
    case 'summary-completion': return 'summary-completion'
    case 'sentence-completion': return 'sentence-completion'
    default: return 'multiple-choice'
  }
}

function normalizeConfidence(raw?: string, explanation?: string): AnswerConfidence {
  const c = raw?.trim().toLowerCase()
  if (c === 'key' || c === 'inferred') return c
  const exp = (explanation ?? '').toLowerCase()
  if (/đoán|không có đáp án|không thấy key|suy luận|ước đoán|guess/i.test(exp)) return 'inferred'
  return 'key'
}

function normalizePart(raw: ParsedReadingPart, fallbackNumber: 1 | 2 | 3): ParsedReadingPart {
  const partNumber = (raw.partNumber === 2 || raw.partNumber === 3 ? raw.partNumber : fallbackNumber) as 1 | 2 | 3
  const defaults = PART_DEFAULTS[partNumber]

  return {
    partNumber,
    passageTitle: raw.passageTitle?.trim() || defaults.title,
    passageSubtitle: raw.passageSubtitle?.trim() || undefined,
    rangeLabel: raw.rangeLabel?.trim() || defaults.range,
    passage: (raw.passage ?? [])
      .map(p => ({ label: p.label?.trim(), text: p.text?.trim() ?? '' }))
      .filter(p => p.text.length > 0),
    questionGroups: (raw.questionGroups ?? []).map(group => {
      const groupType = group.type ?? 'tfng'
      return {
        range: group.range?.trim() || 'Questions',
        instruction: group.instruction?.trim() || '',
        note: group.note?.trim() || undefined,
        type: groupType,
        paragraphLetters: group.paragraphLetters,
        features: group.features,
        wordBank: group.wordBank,
        questions: (group.questions ?? []).map(q => {
          const qType = resolveQuestionType(groupType, q.type)
          const noOptions = qType === 'matching-paragraph'
            || qType === 'matching-features'
            || qType === 'gap-fill'
            || qType === 'sentence-completion'
          const summaryOpts = qType === 'summary-completion' && group.wordBank?.length
            ? group.wordBank
            : (q.options ?? [])
          return {
            number: Number(q.number) || 0,
            type: qType,
            prompt: q.prompt?.trim() ?? '',
            options: qType === 'true-false-not-given' || groupType === 'tfng'
              ? TFNG_OPTIONS
              : noOptions
                ? []
                : summaryOpts,
            answer: (q.answer ?? '').trim().toLowerCase(),
            explanation: q.explanation?.trim() || 'Kiểm tra lại đáp án trong PDF.',
            answerConfidence: normalizeConfidence(q.answerConfidence, q.explanation),
          }
        }).filter(q => q.prompt && q.number > 0),
      }
    }).filter(g => g.questions.length > 0),
  }
}

function normalizeFull(raw: ParsedReadingFull): ParsedReadingPart[] {
  const byPart = new Map<number, ParsedReadingPart>()

  for (const [i, p] of (raw.parts ?? []).entries()) {
    const normalized = normalizePart(p, (p.partNumber ?? (i + 1)) as 1 | 2 | 3)
    if (normalized.passage.length > 0 && normalized.questionGroups.length > 0) {
      byPart.set(normalized.partNumber, normalized)
    }
  }

  return [...byPart.values()].sort((a, b) => a.partNumber - b.partNumber)
}

async function callParsePdf(
  pdfText: string,
  apiKey: string,
  provider: AIProvider,
  systemHint: string,
  userPrompt: string,
  minChars = 200,
): Promise<ParsedReadingPart[]> {
  const slice = pdfText.trim().slice(0, READING_PDF_TEXT_SLICE)
  if (slice.length < minChars) {
    throw new Error('Đoạn text quá ngắn để phân tích part này.')
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
    throw new Error('Không trích được passage hoặc câu hỏi.')
  }

  return normalized
}

async function parseSinglePart(
  partNumber: 1 | 2 | 3,
  partText: string,
  apiKey: string,
  provider: AIProvider,
): Promise<ParsedReadingPart | null> {
  if (partText.trim().length < 250) return null

  const parts = await callParsePdf(
    partText,
    apiKey,
    provider,
    `You extract IELTS Reading Part ${partNumber} only. Respond with valid JSON only.`,
    buildPartPrompt(partNumber, partText),
    200,
  )

  return parts.find(p => p.partNumber === partNumber) ?? parts[0] ?? null
}

async function parsePerPartFallback(
  pdfText: string,
  apiKey: string,
  provider: AIProvider,
  onProgress?: ParseProgressCallback,
): Promise<ParsedReadingPart[]> {
  const slices = splitPdfTextForParts(pdfText)
  const results: ParsedReadingPart[] = []

  for (const partNumber of [1, 2, 3] as const) {
    onProgress?.({ phase: 'part', partNumber, status: 'start' })
    const slice = slices[partNumber]
    if (slice.trim().length < 250) {
      onProgress?.({ phase: 'part', partNumber, status: 'skip' })
      continue
    }
    try {
      const part = await parseSinglePart(partNumber, slice, apiKey, provider)
      if (part) {
        results.push(part)
        onProgress?.({ phase: 'part', partNumber, status: 'done' })
      } else {
        onProgress?.({ phase: 'part', partNumber, status: 'skip' })
      }
    } catch {
      onProgress?.({ phase: 'part', partNumber, status: 'error' })
    }
  }

  if (!results.length) {
    throw new Error('Không trích được part nào. Thử provider khác (OpenAI/Gemini).')
  }

  return results.sort((a, b) => a.partNumber - b.partNumber)
}

function shouldFallbackToPerPart(parts: ParsedReadingPart[], pdfText: string): boolean {
  if (parts.length >= 3) return false
  if (pdfText.length > 28_000 && parts.length < 2) return true
  if (pdfText.length > 40_000 && parts.length < 3) return true
  return false
}

/** Trích đủ 3 parts — thử full trước, fallback parse từng part. */
export async function parseReadingPdfFull(
  pdfText: string,
  apiKey: string,
  provider: AIProvider = 'openai',
  onProgress?: ParseProgressCallback,
): Promise<ParsedReadingPart[]> {
  if (pdfText.trim().length < 200) {
    throw new Error('PDF không đủ chữ — có thể là file scan. Thử OCR/Vision hoặc PDF có lớp text.')
  }

  onProgress?.({ phase: 'full', status: 'start' })
  try {
    const fullParts = await callParsePdf(
      pdfText,
      apiKey,
      provider,
      'You extract structured IELTS Reading data for all parts. Respond with valid JSON only.',
      buildFullPrompt(pdfText),
    )
    onProgress?.({ phase: 'full', status: 'done' })

    if (!shouldFallbackToPerPart(fullParts, pdfText)) {
      return fullParts
    }
  } catch {
    onProgress?.({ phase: 'full', status: 'error' })
  }

  return parsePerPartFallback(pdfText, apiKey, provider, onProgress)
}

/** Chỉ Part 1 — giữ tương thích ngược. */
export async function parseReadingPdfPart1(
  pdfText: string,
  apiKey: string,
  provider: AIProvider = 'openai',
): Promise<ParsedReadingPart> {
  const slices = splitPdfTextForParts(pdfText)
  const part = await parseSinglePart(1, slices[1], apiKey, provider)
  if (part) return part

  const parts = await parseReadingPdfFull(pdfText, apiKey, provider)
  const part1 = parts.find(p => p.partNumber === 1) ?? parts[0]
  if (!part1) throw new Error('Không trích được câu hỏi Part 1.')
  return part1
}