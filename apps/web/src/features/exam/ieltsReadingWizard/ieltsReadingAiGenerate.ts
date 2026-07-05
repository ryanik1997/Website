import { callAI, type AIProvider } from '@ryan/core'
import {
  validateReadingManualImport,
  type ReadingImportPartJson,
  type ReadingImportPayload,
} from '../importReadingManualUtils'
import { sliceAnswerKeyForPassage } from './ieltsReadingAnswerKey'
import { buildIeltsReadingPassageAiMessages } from './ieltsReadingAiPrompt'
import { normalizeAiReadingPart, validateAiReadingPartShape } from './ieltsReadingAiNormalize'
import {
  assertTemplateMatchesPassage,
  type IeltsReadingPassageNumber,
  type IeltsReadingWizardTemplateKind,
} from './ieltsReadingWizardConfig'

export interface GenerateIeltsReadingPassageResult {
  part: ReadingImportPartJson
  warnings: string[]
  rawJson: string
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fence ? fence[1].trim() : trimmed
  return JSON.parse(candidate)
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
  const rawJson = result.content.trim()
  const parsed = extractJsonObject(rawJson)
  const part = normalizeAiReadingPart(extractPartFromAi(parsed))
  validateAiReadingPartShape(part, passageNumber)
  return { part, rawJson }
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

  assertTemplateMatchesPassage(passageNumber, templateKind)

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
      passageNumber, templateKind, examText, keySlice, apiKey, provider,
    ))
  } catch (firstError) {
    const hint = firstError instanceof Error ? firstError.message : 'JSON không hợp lệ'
    ;({ part, rawJson } = await callAndParse(
      passageNumber, templateKind, examText, keySlice, apiKey, provider, hint,
    ))
  }

  const warnings = validateReadingManualImport(wrapSinglePassagePayload(part, title))
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