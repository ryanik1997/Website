import { callAI, type AIProvider } from '@ryan/core'
import type { IeltsListeningP1TemplateKind } from '../ieltsListeningImportTemplates'
import {
  validateListeningImport,
  type ListeningImportPartJson,
  type ListeningImportPayload,
} from '../importListeningUtils'
import { sliceAnswerKeyForPart } from './ieltsListeningAnswerKey'
import { buildIeltsPartAiMessages } from './ieltsListeningAiPrompt'
import {
  normalizeAiPart,
  validateAiPartAgainstTemplate,
  validateAiPartShape,
} from './ieltsListeningAiNormalize'
import {
  assertTemplateMatchesPart,
  type IeltsListeningWizardTemplateKind,
  type IeltsWizardPartNumber,
} from './ieltsListeningWizardConfig'

export interface GenerateIeltsPartResult {
  part: ListeningImportPartJson
  warnings: string[]
  rawJson: string
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fence ? fence[1].trim() : trimmed
  return JSON.parse(candidate)
}

function extractPartFromAi(raw: unknown): ListeningImportPartJson {
  if (!raw || typeof raw !== 'object') {
    throw new Error('AI trả về không phải object JSON.')
  }

  const obj = raw as Record<string, unknown>

  if (obj.part && typeof obj.part === 'object') {
    return obj.part as ListeningImportPartJson
  }

  if (Array.isArray(obj.parts) && obj.parts[0] && typeof obj.parts[0] === 'object') {
    return obj.parts[0] as ListeningImportPartJson
  }

  if (typeof obj.partNumber === 'number' && Array.isArray(obj.questions)) {
    return obj as unknown as ListeningImportPartJson
  }

  throw new Error('JSON thiếu "part" hoặc "parts[0]".')
}

function wrapSinglePartPayload(
  part: ListeningImportPartJson,
  title: string,
): ListeningImportPayload {
  return {
    version: 1,
    title,
    durationMinutes: 30,
    bandHint: `IELTS · Part ${part.partNumber} · Wizard`,
    examType: 'ielts',
    examMode: 'practice',
    parts: [part],
  }
}

async function callAndParse(
  partNumber: IeltsWizardPartNumber,
  templateKind: IeltsListeningWizardTemplateKind,
  examText: string,
  answerKey: string,
  apiKey: string,
  provider: AIProvider,
  retryHint?: string,
): Promise<{ part: ListeningImportPartJson; rawJson: string }> {
  const messages = buildIeltsPartAiMessages(partNumber, templateKind, examText, answerKey)
  if (retryHint) {
    messages.push({
      role: 'user',
      content: `Lần trước lỗi: ${retryHint}\nSửa và trả { "part": { ... } } hợp lệ.`,
    })
  }

  const result = await callAI(messages, apiKey, provider, undefined, { jsonMode: true })
  const rawJson = result.content.trim()
  const parsed = extractJsonObject(rawJson)
  const part = normalizeAiPart(extractPartFromAi(parsed), { examText })
  validateAiPartShape(part, partNumber)
  validateAiPartAgainstTemplate(part, partNumber, templateKind)
  return { part, rawJson }
}

export async function generateIeltsListeningPart(options: {
  partNumber: IeltsWizardPartNumber
  templateKind: IeltsListeningWizardTemplateKind
  examText: string
  answerKey: string
  apiKey: string
  provider: AIProvider
  title?: string
}): Promise<GenerateIeltsPartResult> {
  const {
    partNumber,
    templateKind,
    examText,
    answerKey,
    apiKey,
    provider,
    title = `IELTS Listening — Part ${partNumber}`,
  } = options

  assertTemplateMatchesPart(partNumber, templateKind)

  if (!examText.trim()) {
    throw new Error(`Chưa dán text đề Part ${partNumber}.`)
  }
  if (!apiKey.trim()) {
    throw new Error('Chưa có API key — vào Cài đặt → AI.')
  }

  const keySlice = sliceAnswerKeyForPart(answerKey, partNumber)

  let part: ListeningImportPartJson
  let rawJson: string

  try {
    ;({ part, rawJson } = await callAndParse(
      partNumber, templateKind, examText, keySlice, apiKey, provider,
    ))
  } catch (firstError) {
    const hint = firstError instanceof Error ? firstError.message : 'JSON không hợp lệ'
    ;({ part, rawJson } = await callAndParse(
      partNumber, templateKind, examText, keySlice, apiKey, provider, hint,
    ))
  }

  const warnings = validateListeningImport(wrapSinglePartPayload(part, title))
  return { part, warnings, rawJson }
}

/** @deprecated use generateIeltsListeningPart */
export async function generateIeltsListeningP1Part(options: {
  templateKind: IeltsListeningP1TemplateKind
  examText: string
  answerKey: string
  apiKey: string
  provider: AIProvider
  title?: string
}): Promise<GenerateIeltsPartResult> {
  return generateIeltsListeningPart({ partNumber: 1, ...options })
}

export function buildFullExamPayload(
  parts: ListeningImportPartJson[],
  meta: { title: string; cambridge?: number; test?: number },
): ListeningImportPayload {
  const cam = meta.cambridge ? `Cam ${meta.cambridge}` : ''
  const test = meta.test ? `Test ${meta.test}` : ''
  const bandHint = ['IELTS', cam, test, '4 parts · 40 câu · Wizard'].filter(Boolean).join(' · ')

  const sorted = [...parts].sort((a, b) => a.partNumber - b.partNumber)

  return {
    version: 1,
    title: meta.title.trim() || 'IELTS Listening',
    durationMinutes: 30,
    bandHint,
    examType: 'ielts',
    examMode: 'practice',
    parts: sorted.map(p => ({ ...p, audioFile: p.audioFile ?? 'listening.mp3' })),
  }
}

/** @deprecated */
export function buildPayloadFromP1Part(
  part: ListeningImportPartJson,
  meta: { title: string; cambridge?: number; test?: number },
): ListeningImportPayload {
  return buildFullExamPayload([part], meta)
}