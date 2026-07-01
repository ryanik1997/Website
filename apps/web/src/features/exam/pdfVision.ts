import {
  callAI,
  providerSupportsVision,
  type AIProvider,
  type AIMessagePart,
} from '@ryan/core'
import { renderPdfPagesAsImages, type PdfPageImage } from './pdfExtract'

const VISION_BATCH = 3
const VISION_MAX_PAGES = 20

async function ocrImageBatch(
  images: PdfPageImage[],
  apiKey: string,
  provider: AIProvider,
): Promise<string> {
  const pageNums = images.map(i => i.pageNum).join(', ')
  const parts: AIMessagePart[] = [
    {
      type: 'text',
      text: `Extract ALL readable text from these IELTS Reading PDF pages (${pageNums}). Preserve question numbers, headings, paragraph labels (A, B, C…), and answer key if visible. Return plain text only, no markdown.`,
    },
    ...images.map(img => ({
      type: 'image_url' as const,
      image_url: { url: img.dataUrl, detail: 'low' as const },
    })),
  ]

  const result = await callAI(
    [
      { role: 'system', content: 'You OCR exam PDF pages accurately. Output plain text only.' },
      { role: 'user', content: parts },
    ],
    apiKey,
    provider,
    undefined,
    { jsonMode: false },
  )

  return result.content.trim()
}

/** Vision OCR cho PDF scan — batch theo nhóm trang. */
export async function extractTextViaVision(
  file: File,
  apiKey: string,
  provider: AIProvider,
  onProgress?: (done: number, total: number) => void,
): Promise<string> {
  if (!providerSupportsVision(provider)) {
    throw new Error('Provider hiện tại không hỗ trợ Vision. Dùng OpenAI hoặc Gemini.')
  }

  const images = await renderPdfPagesAsImages(file, VISION_MAX_PAGES)
  if (!images.length) {
    throw new Error('Không render được trang PDF.')
  }

  const chunks: string[] = []
  for (let i = 0; i < images.length; i += VISION_BATCH) {
    const batch = images.slice(i, i + VISION_BATCH)
    onProgress?.(Math.min(i + batch.length, images.length), images.length)
    const text = await ocrImageBatch(batch, apiKey, provider)
    if (text) chunks.push(text)
  }

  const merged = chunks.join('\n\n')
  if (merged.length < 200) {
    throw new Error('Vision OCR không đọc được đủ chữ. Thử PDF rõ hơn hoặc provider khác.')
  }

  return merged
}