import { audioRepo } from '@ryan/db'
import {
  buildWritingGradePrompt,
  callAI,
  providerSupportsVision,
  type AIProvider,
  type AIMessage,
  type CambridgeScore,
} from '@ryan/core'
import type { ReadingPart, ReadingQuestion } from '../examData'

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export function buildKetWritingTaskPrompt(part: ReadingPart, question: ReadingQuestion): string {
  const blocks = part.passage.map(block => {
    if (block.text?.trim()) {
      return block.label ? `${block.label}: ${block.text}` : block.text
    }
    return ''
  }).filter(Boolean)

  const body = blocks.join('\n\n')
  return body ? `${body}\n\n${question.prompt}` : question.prompt
}

async function loadPassageImageDataUrls(part: ReadingPart): Promise<string[]> {
  const urls: string[] = []
  for (const block of part.passage) {
    if (!block.imageKey) continue
    const record = await audioRepo.get(block.imageKey)
    if (record?.blob) {
      urls.push(await blobToDataUrl(record.blob))
    }
  }
  return urls
}

function buildGradeMessagesWithImages(
  taskPrompt: string,
  essay: string,
  imageDataUrls: string[],
  provider: AIProvider,
): AIMessage[] {
  let messages = buildWritingGradePrompt('cambridge_a2', taskPrompt, essay)
  if (!imageDataUrls.length) return messages

  const pictureHint = '\n\nThe student was shown three story pictures (attached). Score whether the writing matches the story sequence.'
  messages = messages.map(m => {
    if (m.role !== 'user' || typeof m.content !== 'string') return m
    return { ...m, content: m.content + pictureHint }
  })

  if (providerSupportsVision(provider)) {
    const userIdx = messages.findIndex(m => m.role === 'user')
    if (userIdx >= 0) {
      const userMsg = messages[userIdx]
      const text = typeof userMsg.content === 'string'
        ? userMsg.content
        : userMsg.content.filter(p => p.type === 'text').map(p => p.text).join('\n')
      const content: AIMessage['content'] = [
        { type: 'text', text },
        ...imageDataUrls.map(url => ({
          type: 'image_url' as const,
          image_url: { url, detail: 'high' as const },
        })),
      ]
      messages = [...messages]
      messages[userIdx] = { ...userMsg, content }
    }
  }

  return messages
}

export async function gradeKetWritingAnswer(
  part: ReadingPart,
  question: ReadingQuestion,
  essay: string,
  apiKey: string,
  provider: AIProvider,
): Promise<{ score: CambridgeScore; tokens: number }> {
  const trimmed = essay.trim()
  if (!trimmed) {
    throw new Error('Chưa có bài viết để chấm.')
  }

  const taskPrompt = buildKetWritingTaskPrompt(part, question)
  const imageDataUrls = part.partNumber === 7 ? await loadPassageImageDataUrls(part) : []
  const messages = buildGradeMessagesWithImages(taskPrompt, trimmed, imageDataUrls, provider)

  const result = await callAI(messages, apiKey, provider)
  const parsed = JSON.parse(result.content) as CambridgeScore
  return {
    score: { ...parsed, framework: 'cambridge' },
    tokens: result.inputTokens + result.outputTokens,
  }
}