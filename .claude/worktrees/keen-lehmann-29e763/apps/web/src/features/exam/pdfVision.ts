import {
  callAI,
  providerSupportsVision,
  type AIProvider,
  type AIMessagePart,
} from '@ryan/core'
import { renderPdfPagesAsImages, type PdfPageImage } from './pdfExtract'
import type { PdfPageContent } from './pdfContent'

const VISION_MAX_PAGES = 20

async function ocrSinglePage(
  image: PdfPageImage,
  apiKey: string,
  provider: AIProvider,
): Promise<string> {
  const parts: AIMessagePart[] = [
    {
      type: 'text',
      text: `OCR page ${image.pageNum} of a Cambridge/IELTS Reading exam PDF.
Extract readable text: headings, "Part N", question numbers, paragraph labels (A, B, C…), options, answer key fragments.
Preserve line breaks between blocks. Return plain text only.`,
    },
    {
      type: 'image_url',
      image_url: { url: image.dataUrl, detail: 'high' as const },
    },
  ]

  const result = await callAI(
    [
      {
        role: 'system',
        content: 'You OCR exam PDF pages accurately. Output plain text only — no markdown.',
      },
      { role: 'user', content: parts },
    ],
    apiKey,
    provider,
    undefined,
    { jsonMode: false },
  )

  return result.content.trim()
}

/** Vision OCR từng trang — giữ ảnh gốc + text theo pageNum (map part KET/PET). */
export async function extractPagesViaVision(
  file: File,
  apiKey: string,
  provider: AIProvider,
  onProgress?: (done: number, total: number) => void,
): Promise<PdfPageContent[]> {
  if (!providerSupportsVision(provider)) {
    throw new Error('Provider hiện tại không hỗ trợ Vision. Dùng OpenAI hoặc Gemini.')
  }

  const images = await renderPdfPagesAsImages(file, VISION_MAX_PAGES, 1.6)
  if (!images.length) {
    throw new Error('Không render được trang PDF.')
  }

  const pages: PdfPageContent[] = []
  for (let i = 0; i < images.length; i += 1) {
    const image = images[i]
    onProgress?.(i + 1, images.length)
    const text = await ocrSinglePage(image, apiKey, provider)
    pages.push({
      pageNum: image.pageNum,
      text,
      dataUrl: image.dataUrl,
    })
  }

  return pages
}

/** @deprecated — dùng extractPagesViaVision; giữ cho tương thích nếu cần merged text only */
export async function extractTextViaVision(
  file: File,
  apiKey: string,
  provider: AIProvider,
  onProgress?: (done: number, total: number) => void,
): Promise<string> {
  const pages = await extractPagesViaVision(file, apiKey, provider, onProgress)
  return pages.map(p => p.text).filter(Boolean).join('\n\n')
}