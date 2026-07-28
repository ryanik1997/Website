import { extractKetPassageFromSlice, ketPassageTitleFromSlice } from './ketPassageExtract'
import { callAI, type AIProvider } from './provider'
import type {
  ParsedReadingFull,
  ParsedReadingPart,
  ParseProgressCallback,
} from './readingPdfPrompt'
import { parseAiJsonContent, READING_PDF_PART_SLICE, READING_PDF_TEXT_SLICE } from './readingPdfPrompt'

const KET_MIN_SLICE_CHARS = 40

export type KetPartNumber = 1 | 2 | 3 | 4 | 5

const KET_PART_NUMBERS: KetPartNumber[] = [1, 2, 3, 4, 5]

const KET_PART_FIRST_Q: Record<KetPartNumber, number> = {
  1: 1,
  2: 7,
  3: 14,
  4: 19,
  5: 25,
}

const KET_PART_DEFAULTS: Record<KetPartNumber, { title: string; range: string }> = {
  1: { title: 'Part 1 — Signs and messages', range: 'Questions 1–6' },
  2: { title: 'Part 2 — Matching people', range: 'Questions 7–13' },
  3: { title: 'Part 3 — Reading', range: 'Questions 14–18' },
  4: { title: 'Part 4 — Open cloze', range: 'Questions 19–24' },
  5: { title: 'Part 5 — Email / message', range: 'Questions 25–30' },
}

const KET_QUESTION_TYPE_RULES = `
KET A2 Reading (Parts 1–5 only — ignore Writing Parts 6–7):
- Part 1 (Q1–6): short signs, notices, messages. group "multiple-choice", options id A/B/C with full labels.
  Each question MUST have number 1–6. If sign text is only in options, set prompt to "Question N" and keep full text in options.
- Part 2 (Q7–13): match people to statements. group "multiple-choice" (options A/B/C = people or statements) OR "matching-features" with features list.
- Part 3 (Q14–18): longer text + MC. group "multiple-choice", passage required.
- Part 4 (Q19–24): gapped text — đề gốc là MULTIPLE-CHOICE: mỗi gap có 3 từ A/B/C (vd early/short/quick). group "multiple-choice", mỗi câu đủ options + answer a/b/c. KHÔNG dùng gap-fill tự gõ.
- Part 5 (Q25–30): email/message open cloze. group "gap-fill", ONE WORD per gap.

Question types: "multiple-choice", "gap-fill", "summary-completion", "matching-features".
Options id: use "A", "B", "C" (uppercase) for KET MC.
Answer: single letter lowercase for MC (a/b/c), single word lowercase for gap-fill.
answerConfidence: "key" if from answer key in PDF, else "inferred".
explanation in Vietnamese.
`

function buildKetFullPrompt(pdfText: string): string {
  return `You are a Cambridge A2 Key (KET) Reading test parser. Extract ALL FIVE reading parts (ignore Writing).

Return JSON: { "parts": [ { "partNumber": 1..5, "passageTitle": "...", "rangeLabel": "...", "passage": [...], "questionGroups": [...] } ] }

${KET_QUESTION_TYPE_RULES}

Rules:
- Part 1 may have empty passage[] — put sign/message text inside question prompts.
- Part 2 passage: profile texts for each person named in the PDF.
- Parts 3–5: include full reading texts in passage[].
- Keep exact question numbers from PDF. Do not invent content.
- Stop before PART 6 / Writing.

PDF TEXT:
---
${pdfText.slice(0, READING_PDF_TEXT_SLICE)}
---`
}

function buildKetPartPrompt(partNumber: KetPartNumber, pdfText: string): string {
  const defaults = KET_PART_DEFAULTS[partNumber]
  return `Extract ONLY KET A2 Reading Part ${partNumber} from the PDF text.

Return JSON for a SINGLE part (not wrapped in "parts"):
{
  "partNumber": ${partNumber},
  "passageTitle": "string",
  "rangeLabel": "${defaults.range}",
  "passage": [{ "label": "optional", "text": "paragraph" }],
  "questionGroups": [...]
}

${KET_QUESTION_TYPE_RULES}

Rules:
- Only Part ${partNumber} (${defaults.range}). Stop before the next part.
- Part 1: passage may be empty if texts are in prompts.

PDF TEXT (Part ${partNumber}):
---
${pdfText.slice(0, READING_PDF_PART_SLICE)}
---`
}

function findEarliestIndex(text: string, patterns: RegExp[], start = 0): number {
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

function findKetPartStart(body: string, partNumber: KetPartNumber, after: number): number | null {
  const q = KET_PART_FIRST_Q[partNumber]
  const idx = findEarliestIndex(body, [
    new RegExp(`\\bpart\\s*${partNumber}\\b`, 'i'),
    new RegExp(`questions?\\s*${q}\\s*[–\\-—]`, 'i'),
    new RegExp(`questions?\\s*${q}\\b`, 'i'),
  ], after + 15)
  if (idx >= body.length || idx <= after + 15) return null
  return idx
}

function buildKetBoundaries(body: string, start: number, end: number): number[] {
  const known: Array<number | null> = [start]
  let cursor = start
  for (const n of [2, 3, 4, 5] as KetPartNumber[]) {
    const idx = findKetPartStart(body, n, cursor)
    known.push(idx)
    if (idx != null) cursor = idx
  }
  known.push(end)

  const resolved: number[] = [start]
  for (let i = 1; i <= 4; i += 1) {
    const direct = known[i] as number | null
    if (direct != null) {
      resolved.push(direct)
      continue
    }
    const prev = resolved[resolved.length - 1]
    let next: number = end
    for (let j = i + 1; j <= 5; j += 1) {
      const later = known[j] as number | null
      if (later != null) {
        next = later
        break
      }
    }
    const remaining = 5 - i
    resolved.push(Math.round(prev + (next - prev) / remaining))
  }
  resolved.push(end)
  return resolved
}

/** Cắt text theo PART 1–5; bỏ Writing (Part 6+). */
export function splitPdfTextForKetParts(fullText: string): Record<KetPartNumber, string> {
  const empty: Record<KetPartNumber, string> = { 1: '', 2: '', 3: '', 4: '', 5: '' }
  const text = fullText.replace(/\r\n/g, '\n').trim()
  if (!text) return empty

  const writingIdx = findEarliestIndex(text, [
    /\bpart\s*6\b/i,
    /\bwriting\s+part\s*6\b/i,
    /\bpart\s*7\b/i,
  ])
  const body = writingIdx > 100 && writingIdx < text.length - 80 ? text.slice(0, writingIdx) : text

  const part2Idx = findEarliestIndex(body, [
    /\bpart\s*2\b/i,
    /questions?\s*7\s*[–\-—]/i,
  ])

  let start = 0
  if (part2Idx > 80 && part2Idx < body.length) {
    start = 0
  } else {
    const part1Idx = findEarliestIndex(body, [
      /\bpart\s*1\b/i,
      /questions?\s*1\s*[–\-—]/i,
    ])
    start = part1Idx < body.length ? part1Idx : 0
  }

  const boundaries = buildKetBoundaries(body, start, body.length)

  return {
    1: body.slice(boundaries[0], boundaries[1]),
    2: body.slice(boundaries[1], boundaries[2]),
    3: body.slice(boundaries[2], boundaries[3]),
    4: body.slice(boundaries[3], boundaries[4]),
    5: body.slice(boundaries[4], boundaries[5]),
  }
}

function applyKetPassageFallback(
  part: ParsedReadingPart,
  partNumber: KetPartNumber,
  rawSlice: string,
): ParsedReadingPart {
  if (part.passage.length > 0) return part
  const fallback = extractKetPassageFromSlice(partNumber, rawSlice)
  if (!fallback.length) return part
  const titleFromSlice = ketPassageTitleFromSlice(partNumber, rawSlice)
  return {
    ...part,
    passageTitle: titleFromSlice || part.passageTitle,
    passage: fallback.map(block => ({
      label: block.label,
      text: block.text,
    })),
  }
}

function normalizeKetPart(raw: ParsedReadingPart, fallbackNumber: KetPartNumber): ParsedReadingPart {
  const rawNum = Number(raw.partNumber)
  const partNumber = (rawNum >= 1 && rawNum <= 5 ? rawNum : fallbackNumber) as KetPartNumber
  const defaults = KET_PART_DEFAULTS[partNumber]

  return {
    partNumber,
    passageTitle: raw.passageTitle?.trim() || defaults.title,
    passageSubtitle: raw.passageSubtitle?.trim() || undefined,
    rangeLabel: raw.rangeLabel?.trim() || defaults.range,
    passage: (raw.passage ?? [])
      .map(p => ({ label: p.label?.trim(), text: p.text?.trim() ?? '' }))
      .filter(p => p.text.length > 0),
    questionGroups: (raw.questionGroups ?? []).map(group => {
      const groupType = group.type ?? 'multiple-choice'
      return {
        range: group.range?.trim() || defaults.range,
        instruction: group.instruction?.trim() || 'Choose the correct answer.',
        note: group.note?.trim() || undefined,
        type: groupType,
        paragraphLetters: group.paragraphLetters,
        features: group.features,
        wordBank: group.wordBank,
        questions: (group.questions ?? []).map(q => {
          const qType = q.type ?? (
            groupType === 'gap-fill' ? 'gap-fill'
              : groupType === 'summary-completion' ? 'summary-completion'
                : groupType === 'matching-features' ? 'matching-features'
                  : 'multiple-choice'
          )
          const noOptions = qType === 'gap-fill' || qType === 'matching-features'
          const summaryOpts = qType === 'summary-completion' && group.wordBank?.length
            ? group.wordBank
            : (q.options ?? [])
          const number = Number(q.number) || 0
          const options = noOptions ? [] : summaryOpts
          const prompt = q.prompt?.trim()
            || (options.length > 0 ? `Question ${number}` : '')
          return {
            number,
            type: qType,
            prompt,
            options,
            answer: (q.answer ?? '').trim().toLowerCase(),
            explanation: q.explanation?.trim() || 'Kiểm tra lại đáp án trong PDF.',
            answerConfidence: q.answerConfidence === 'inferred' ? 'inferred' as const : 'key' as const,
          }
        }).filter(q => q.number > 0 && (q.prompt || q.options.length > 0 || q.answer)),
      }
    }).filter(g => g.questions.length > 0),
  }
}

function normalizeKetFull(raw: ParsedReadingFull): ParsedReadingPart[] {
  const byPart = new Map<number, ParsedReadingPart>()

  for (const [i, p] of (raw.parts ?? []).entries()) {
    const fallback = (Math.min(i + 1, 5)) as KetPartNumber
    const normalized = normalizeKetPart(p, fallback)
    if (normalized.questionGroups.length > 0) {
      byPart.set(normalized.partNumber, normalized)
    }
  }

  return [...byPart.values()].sort((a, b) => a.partNumber - b.partNumber)
}

async function callParseKetPdf(
  pdfText: string,
  apiKey: string,
  provider: AIProvider,
  systemHint: string,
  userPrompt: string,
  minChars = 120,
): Promise<ParsedReadingPart[]> {
  const slice = pdfText.trim().slice(0, READING_PDF_TEXT_SLICE)
  if (slice.length < minChars) {
    throw new Error('Đoạn text quá ngắn để phân tích part KET này.')
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
    const json = parseAiJsonContent<ParsedReadingFull | ParsedReadingPart>(result.content)
    if ('parts' in json && Array.isArray(json.parts)) {
      parsed = json
    } else {
      parsed = { parts: [json as ParsedReadingPart] }
    }
  } catch {
    throw new Error('AI trả về JSON không hợp lệ. Thử lại hoặc dùng provider khác (OpenAI/Gemini).')
  }

  const normalized = normalizeKetFull(parsed)
  if (!normalized.length) {
    throw new Error('Không trích được câu hỏi KET.')
  }

  return normalized
}

async function parseKetSinglePart(
  partNumber: KetPartNumber,
  partText: string,
  apiKey: string,
  provider: AIProvider,
): Promise<ParsedReadingPart | null> {
  if (partText.trim().length < KET_MIN_SLICE_CHARS) return null

  const parts = await callParseKetPdf(
    partText,
    apiKey,
    provider,
    `You extract KET A2 Reading Part ${partNumber} only. Respond with valid JSON only.`,
    buildKetPartPrompt(partNumber, partText),
    60,
  )

  return parts.find(p => p.partNumber === partNumber) ?? parts[0] ?? null
}

function ketPartQuestionCount(part: ParsedReadingPart): number {
  return part.questionGroups.reduce((sum, g) => sum + g.questions.length, 0)
}

function mergeKetParts(...groups: ParsedReadingPart[][]): ParsedReadingPart[] {
  const byPart = new Map<number, ParsedReadingPart>()
  for (const group of groups) {
    for (const part of group) {
      const count = ketPartQuestionCount(part)
      if (count === 0) continue
      const existing = byPart.get(part.partNumber)
      const existingCount = existing ? ketPartQuestionCount(existing) : 0
      if (!existing || count >= existingCount) {
        byPart.set(part.partNumber, part)
      }
    }
  }
  return [...byPart.values()].sort((a, b) => a.partNumber - b.partNumber)
}

function applyKetPassageFallbacks(
  parts: ParsedReadingPart[],
  pdfText: string,
): ParsedReadingPart[] {
  const slices = splitPdfTextForKetParts(pdfText)
  return parts.map(p => {
    const n = p.partNumber as KetPartNumber
    return applyKetPassageFallback(p, n, slices[n] ?? '')
  })
}

async function parseKetPerPart(
  pdfText: string,
  apiKey: string,
  provider: AIProvider,
  onProgress?: ParseProgressCallback,
): Promise<ParsedReadingPart[]> {
  const slices = splitPdfTextForKetParts(pdfText)
  const results: ParsedReadingPart[] = []

  for (const partNumber of KET_PART_NUMBERS) {
    onProgress?.({ phase: 'part', partNumber, status: 'start' })
    const slice = slices[partNumber]
    if (slice.trim().length < KET_MIN_SLICE_CHARS) {
      onProgress?.({ phase: 'part', partNumber, status: 'skip' })
      continue
    }
    try {
      const part = await parseKetSinglePart(partNumber, slice, apiKey, provider)
      if (part && ketPartQuestionCount(part) > 0) {
        results.push(applyKetPassageFallback(part, partNumber, slice))
        onProgress?.({ phase: 'part', partNumber, status: 'done' })
      } else {
        onProgress?.({ phase: 'part', partNumber, status: 'skip' })
      }
    } catch {
      onProgress?.({ phase: 'part', partNumber, status: 'error' })
    }
  }

  return results.sort((a, b) => a.partNumber - b.partNumber)
}

/** Trích KET A2 Reading — 5 parts; full parse + per-part + merge. */
export async function parseKetReadingPdfFull(
  pdfText: string,
  apiKey: string,
  provider: AIProvider = 'openai',
  onProgress?: ParseProgressCallback,
): Promise<ParsedReadingPart[]> {
  if (pdfText.trim().length < 200) {
    throw new Error('PDF không đủ chữ — có thể là file scan. Thử OCR/Vision hoặc PDF có lớp text.')
  }

  let fullParts: ParsedReadingPart[] = []

  onProgress?.({ phase: 'full', status: 'start' })
  try {
    fullParts = await callParseKetPdf(
      pdfText,
      apiKey,
      provider,
      'You extract structured KET A2 Reading data for all 5 parts. Respond with valid JSON only.',
      buildKetFullPrompt(pdfText),
    )
    onProgress?.({ phase: 'full', status: 'done' })
  } catch {
    onProgress?.({ phase: 'full', status: 'error' })
  }

  if (fullParts.length >= 3) {
    return applyKetPassageFallbacks(fullParts, pdfText)
  }

  const perPartResults = await parseKetPerPart(pdfText, apiKey, provider, onProgress)
  const merged = mergeKetParts(fullParts, perPartResults)

  if (merged.length > 0) {
    return applyKetPassageFallbacks(merged, pdfText)
  }

  throw new Error(
    'Không trích được part KET nào. PDF có thể là scan — cần OpenAI/Gemini (Vision). '
    + 'Hoặc thử Import thủ công (JSON + ảnh).',
  )
}