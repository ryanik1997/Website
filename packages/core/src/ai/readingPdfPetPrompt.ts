import { callAI, type AIProvider } from './provider'
import type {
  ParsedReadingFull,
  ParsedReadingPart,
  ParseProgressCallback,
} from './readingPdfPrompt'
import { parseAiJsonContent, READING_PDF_PART_SLICE, READING_PDF_TEXT_SLICE } from './readingPdfPrompt'

export type PetPartNumber = 1 | 2 | 3 | 4 | 5 | 6

const PET_PART_NUMBERS: PetPartNumber[] = [1, 2, 3, 4, 5, 6]

const PET_PART_FIRST_Q: Record<PetPartNumber, number> = {
  1: 1,
  2: 6,
  3: 11,
  4: 16,
  5: 21,
  6: 27,
}

const PET_PART_DEFAULTS: Record<PetPartNumber, { title: string; range: string }> = {
  1: { title: 'Part 1 — Signs and messages', range: 'Questions 1–5' },
  2: { title: 'Part 2 — Matching', range: 'Questions 6–10' },
  3: { title: 'Part 3 — Reading', range: 'Questions 11–15' },
  4: { title: 'Part 4 — Gapped text', range: 'Questions 16–20' },
  5: { title: 'Part 5 — Open cloze (MC)', range: 'Questions 21–26' },
  6: { title: 'Part 6 — Open cloze', range: 'Questions 27–32' },
}

const PET_QUESTION_TYPE_RULES = `
PET B1 Reading (Parts 1–6 only — ignore Writing):
- Part 1 (Q1–5): signs, notices, messages. group "multiple-choice", options A/B/C.
- Part 2 (Q6–10): match people to descriptions (often 8 options A–H). group "matching-features" with features A–H OR "multiple-choice" with options A–H.
- Part 3 (Q11–15): longer text + MC with FOUR options A/B/C/D. group "multiple-choice".
- Part 4 (Q16–20): gapped text — choose sentence from list A–H (3 extra). group "matching-features" (features = sentence options) OR "multiple-choice" per gap.
- Part 5 (Q21–26): text with gaps, often MC options per gap. group "multiple-choice" or "gap-fill".
- Part 6 (Q27–32): open cloze in text. group "gap-fill", ONE WORD per gap.

Question types: "multiple-choice", "gap-fill", "summary-completion", "matching-features".
MC options id: "A","B","C" (Part 1) or "A"–"D" (Part 3+) or "A"–"H" (matching).
Answer: letter lowercase for MC; single word lowercase for gap-fill.
answerConfidence: "key" if from answer key in PDF, else "inferred".
explanation in Vietnamese.
`

function buildPetFullPrompt(pdfText: string): string {
  return `You are a Cambridge B1 Preliminary (PET) Reading test parser. Extract ALL SIX reading parts (ignore Writing).

Return JSON: { "parts": [ { "partNumber": 1..6, "passageTitle": "...", "rangeLabel": "...", "passage": [...], "questionGroups": [...] } ] }

${PET_QUESTION_TYPE_RULES}

Rules:
- Part 1: passage may be empty — put sign/message text in question prompts.
- Part 2: passage has all description texts (markets, activities A–H).
- Parts 3–6: include full reading texts in passage[].
- Keep exact question numbers. Do not invent content.
- Stop before Writing sections.

PDF TEXT:
---
${pdfText.slice(0, READING_PDF_TEXT_SLICE)}
---`
}

function buildPetPartPrompt(partNumber: PetPartNumber, pdfText: string): string {
  const defaults = PET_PART_DEFAULTS[partNumber]
  return `Extract ONLY PET B1 Reading Part ${partNumber} from the PDF text.

Return JSON for a SINGLE part (not wrapped in "parts"):
{
  "partNumber": ${partNumber},
  "passageTitle": "string",
  "rangeLabel": "${defaults.range}",
  "passage": [{ "label": "optional A-H", "text": "paragraph" }],
  "questionGroups": [...]
}

${PET_QUESTION_TYPE_RULES}

Rules:
- Only Part ${partNumber} (${defaults.range}). Stop before the next part.

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

/** Cắt text theo PART 1–6; bỏ Writing nếu có. */
export function splitPdfTextForPetParts(fullText: string): Record<PetPartNumber, string> {
  const empty: Record<PetPartNumber, string> = { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' }
  const text = fullText.replace(/\r\n/g, '\n').trim()
  if (!text) return empty

  // PET Reading = Part 1–6; chỉ cắt khi gặp Writing Part 7+ (tránh khớp nhầm header/footer)
  const writingIdx = findEarliestIndex(text, [
    /\bpart\s*7\b/i,
    /\bpart\s*8\b/i,
  ])
  const body = writingIdx > 100 && writingIdx < text.length - 80 ? text.slice(0, writingIdx) : text

  const part1Start = findEarliestIndex(body, [
    /\bpart\s*1\b/i,
    /questions?\s*1\s*[–\-—]/i,
    /preliminary\s+english\s+test/i,
    /\breading\b/i,
  ])
  const start = part1Start < body.length ? part1Start : 0

  const boundaries: number[] = [start]
  for (const n of [2, 3, 4, 5, 6] as PetPartNumber[]) {
    const q = PET_PART_FIRST_Q[n]
    const idx = findEarliestIndex(body, [
      new RegExp(`\\bpart\\s*${n}\\b`, 'i'),
      new RegExp(`questions?\\s*${q}\\s*[–\\-—]`, 'i'),
      new RegExp(`questions?\\s*${q}\\b`, 'i'),
    ], boundaries[boundaries.length - 1] + 60)
    if (idx < body.length && idx > boundaries[boundaries.length - 1] + 60) {
      boundaries.push(idx)
    }
  }
  boundaries.push(body.length)

  while (boundaries.length < 7) {
    const last = boundaries[boundaries.length - 1]
    boundaries.splice(boundaries.length - 1, 0, last)
  }

  return {
    1: body.slice(boundaries[0], boundaries[1]),
    2: body.slice(boundaries[1], boundaries[2]),
    3: body.slice(boundaries[2], boundaries[3]),
    4: body.slice(boundaries[3], boundaries[4]),
    5: body.slice(boundaries[4], boundaries[5]),
    6: body.slice(boundaries[5], boundaries[6]),
  }
}

function normalizePetPart(raw: ParsedReadingPart, fallbackNumber: PetPartNumber): ParsedReadingPart {
  const rawNum = Number(raw.partNumber)
  const partNumber = (rawNum >= 1 && rawNum <= 6 ? rawNum : fallbackNumber) as PetPartNumber
  const defaults = PET_PART_DEFAULTS[partNumber]

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
          return {
            number: Number(q.number) || 0,
            type: qType,
            prompt: q.prompt?.trim() ?? '',
            options: noOptions ? [] : summaryOpts,
            answer: (q.answer ?? '').trim().toLowerCase(),
            explanation: q.explanation?.trim() || 'Kiểm tra lại đáp án trong PDF.',
            answerConfidence: q.answerConfidence === 'inferred' ? 'inferred' as const : 'key' as const,
          }
        }).filter(q => q.prompt && q.number > 0),
      }
    }).filter(g => g.questions.length > 0),
  }
}

function normalizePetFull(raw: ParsedReadingFull): ParsedReadingPart[] {
  const byPart = new Map<number, ParsedReadingPart>()

  for (const [i, p] of (raw.parts ?? []).entries()) {
    const fallback = (Math.min(i + 1, 6)) as PetPartNumber
    const normalized = normalizePetPart(p, fallback)
    if (normalized.questionGroups.length > 0) {
      byPart.set(normalized.partNumber, normalized)
    }
  }

  return [...byPart.values()].sort((a, b) => a.partNumber - b.partNumber)
}

async function callParsePetPdf(
  pdfText: string,
  apiKey: string,
  provider: AIProvider,
  systemHint: string,
  userPrompt: string,
  minChars = 120,
): Promise<ParsedReadingPart[]> {
  const slice = pdfText.trim().slice(0, READING_PDF_TEXT_SLICE)
  if (slice.length < minChars) {
    throw new Error('Đoạn text quá ngắn để phân tích part PET này.')
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
    throw new Error('AI trả về JSON không hợp lệ. Thử lại hoặc dùng provider khác.')
  }

  const normalized = normalizePetFull(parsed)
  if (!normalized.length) {
    throw new Error('Không trích được câu hỏi PET.')
  }

  return normalized
}

async function parsePetSinglePart(
  partNumber: PetPartNumber,
  partText: string,
  apiKey: string,
  provider: AIProvider,
): Promise<ParsedReadingPart | null> {
  if (partText.trim().length < 120) return null

  const parts = await callParsePetPdf(
    partText,
    apiKey,
    provider,
    `You extract PET B1 Reading Part ${partNumber} only. Respond with valid JSON only.`,
    buildPetPartPrompt(partNumber, partText),
    100,
  )

  return parts.find(p => p.partNumber === partNumber) ?? parts[0] ?? null
}

async function parsePetPerPart(
  pdfText: string,
  apiKey: string,
  provider: AIProvider,
  onProgress?: ParseProgressCallback,
): Promise<ParsedReadingPart[]> {
  const slices = splitPdfTextForPetParts(pdfText)
  const results: ParsedReadingPart[] = []

  for (const partNumber of PET_PART_NUMBERS) {
    onProgress?.({ phase: 'part', partNumber, status: 'start' })
    const slice = slices[partNumber]
    if (slice.trim().length < 120) {
      onProgress?.({ phase: 'part', partNumber, status: 'skip' })
      continue
    }
    try {
      const part = await parsePetSinglePart(partNumber, slice, apiKey, provider)
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
    throw new Error('Không trích được part PET nào. Thử provider khác (OpenAI/DeepSeek/Gemini).')
  }

  return results.sort((a, b) => a.partNumber - b.partNumber)
}

function shouldPetFallbackToPerPart(parts: ParsedReadingPart[]): boolean {
  return parts.length < 5
}

/** Trích PET B1 Reading — 6 parts; fallback parse từng part. */
export async function parsePetReadingPdfFull(
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
    const fullParts = await callParsePetPdf(
      pdfText,
      apiKey,
      provider,
      'You extract structured PET B1 Reading data for all 6 parts. Respond with valid JSON only.',
      buildPetFullPrompt(pdfText),
    )
    onProgress?.({ phase: 'full', status: 'done' })

    if (!shouldPetFallbackToPerPart(fullParts)) {
      return fullParts
    }
  } catch {
    onProgress?.({ phase: 'full', status: 'error' })
  }

  return parsePetPerPart(pdfText, apiKey, provider, onProgress)
}