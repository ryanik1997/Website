import { audioRepo } from '@ryan/db'
import {
  buildWritingGradePrompt,
  buildWritingModelAnswerPrompt,
  callAI,
  providerSupportsVision,
  attachImagesToUserMessage,
  type AIProvider,
  type AIMessage,
  type CambridgeScore,
  type WritingDocType,
  type WritingModelAnswer,
} from '@ryan/core'
import type { ReadingExam, ReadingPart, ReadingQuestion } from './examData'

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export function cambridgeLevelToWritingType(
  level: ReadingExam['cambridgeLevel'] | undefined,
): WritingDocType {
  switch (level) {
    case 'a2': return 'cambridge_a2'
    case 'b1': return 'cambridge_b1'
    case 'b2': return 'cambridge_b2'
    case 'c1': return 'cambridge_c1'
    case 'c2': return 'cambridge_c2'
    default: return 'cambridge_a2'
  }
}

export function buildCambridgeRwTaskPrompt(part: ReadingPart, question: ReadingQuestion): string {
  const blocks = part.passage.map(block => {
    if (block.text?.trim()) {
      return block.label ? `${block.label}: ${block.text}` : block.text
    }
    return ''
  }).filter(Boolean)

  const body = blocks.join('\n\n')
  const title = part.passageTitle ? `Title: ${part.passageTitle}\n` : ''
  const head = `Part ${part.partNumber}${part.passageSubtitle ? ` — ${part.passageSubtitle}` : ''}`
  return [head, title + body, question.prompt].filter(Boolean).join('\n\n')
}

async function loadPassageImageDataUrls(part: ReadingPart): Promise<string[]> {
  const urls: string[] = []
  for (const block of part.passage) {
    if (block.imageUrl?.startsWith('data:')) {
      urls.push(block.imageUrl)
      continue
    }
    if (!block.imageKey) continue
    const record = await audioRepo.get(block.imageKey)
    if (record?.blob) {
      urls.push(await blobToDataUrl(record.blob))
    }
  }
  return urls
}

function shouldAttachWritingImages(part: ReadingPart, level: ReadingExam['cambridgeLevel']): boolean {
  // KET P7 story pictures; PET/FCE/CAE/CPE writing often has prompt images in passage
  if (level === 'a2' && part.partNumber === 7) return true
  return part.passage.some(b => !!b.imageKey || !!b.imageUrl)
}

export async function gradeCambridgeRwWritingAnswer(
  exam: ReadingExam,
  part: ReadingPart,
  question: ReadingQuestion,
  essay: string,
  apiKey: string,
  provider: AIProvider,
): Promise<{ score: CambridgeScore; tokens: number }> {
  const trimmed = essay.trim()
  if (!trimmed) throw new Error('Chưa có bài viết để chấm.')

  const writingType = cambridgeLevelToWritingType(exam.cambridgeLevel)
  const taskPrompt = buildCambridgeRwTaskPrompt(part, question)
  let messages: AIMessage[] = buildWritingGradePrompt(writingType, taskPrompt, trimmed)

  if (shouldAttachWritingImages(part, exam.cambridgeLevel)) {
    const imageDataUrls = await loadPassageImageDataUrls(part)
    if (imageDataUrls.length && providerSupportsVision(provider)) {
      messages = attachImagesToUserMessage(
        messages,
        imageDataUrls,
        'Attached image(s) are the writing prompt visuals. Score Content against them.',
      )
    } else if (imageDataUrls.length) {
      messages = messages.map(m => {
        if (m.role !== 'user' || typeof m.content !== 'string') return m
        return {
          ...m,
          content: `${m.content}\n\n(Note: prompt includes ${imageDataUrls.length} image(s); current AI provider has no vision — score from text only.)`,
        }
      })
    }
  }

  const result = await callAI(messages, apiKey, provider)
  const parsed = JSON.parse(result.content) as CambridgeScore
  return {
    score: { ...parsed, framework: 'cambridge' },
    tokens: result.inputTokens + result.outputTokens,
  }
}

export async function generateCambridgeRwModelAnswer(
  exam: ReadingExam,
  part: ReadingPart,
  question: ReadingQuestion,
  apiKey: string,
  provider: AIProvider,
): Promise<{ model: WritingModelAnswer; tokens: number }> {
  const writingType = cambridgeLevelToWritingType(exam.cambridgeLevel)
  const taskPrompt = buildCambridgeRwTaskPrompt(part, question)
  let messages = buildWritingModelAnswerPrompt(writingType, taskPrompt)

  if (shouldAttachWritingImages(part, exam.cambridgeLevel) && providerSupportsVision(provider)) {
    const imageDataUrls = await loadPassageImageDataUrls(part)
    if (imageDataUrls.length) {
      messages = attachImagesToUserMessage(messages, imageDataUrls)
    }
  }

  const result = await callAI(messages, apiKey, provider)
  const model = JSON.parse(result.content) as WritingModelAnswer
  if (!model.modelAnswer?.trim()) throw new Error('AI không trả bài mẫu.')
  return { model, tokens: result.inputTokens + result.outputTokens }
}

/** @deprecated use gradeCambridgeRwWritingAnswer */
export async function gradeKetWritingAnswer(
  part: ReadingPart,
  question: ReadingQuestion,
  essay: string,
  apiKey: string,
  provider: AIProvider,
): Promise<{ score: CambridgeScore; tokens: number }> {
  return gradeCambridgeRwWritingAnswer(
    { id: 'legacy', title: '', durationMinutes: 0, bandHint: '', parts: [], cambridgeLevel: 'a2' },
    part,
    question,
    essay,
    apiKey,
    provider,
  )
}
