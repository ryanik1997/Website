import type { AIProvider } from '@ryan/core'
import { providerSupportsVision } from '@ryan/core'
import { extractTextFromPdf, type ExtractPdfProgress } from './pdfExtract'
import { extractTextViaVision } from './pdfVision'

export type PdfExtractMethod = 'text-layer' | 'vision-ocr'

const TEXT_LAYER_MIN = 200

export interface ExtractPdfOptions {
  apiKey?: string
  provider?: AIProvider
  onVisionProgress?: (done: number, total: number) => void
  onPageProgress?: (progress: ExtractPdfProgress) => void
}

export interface ExtractPdfResult {
  text: string
  method: PdfExtractMethod
}

/** Hybrid: text layer trước, Vision OCR nếu scan. */
export async function extractPdfContent(
  file: File,
  options?: ExtractPdfOptions,
): Promise<ExtractPdfResult> {
  const textLayer = await extractTextFromPdf(file, 28, progress => {
    options?.onPageProgress?.(progress)
  })
  if (textLayer.trim().length >= TEXT_LAYER_MIN) {
    return { text: textLayer, method: 'text-layer' }
  }

  const { apiKey, provider, onVisionProgress } = options ?? {}
  if (!apiKey?.trim() || !provider) {
    throw new Error(
      'PDF gần như không có chữ (có thể là scan). Cần API key OpenAI/Gemini trong Cài đặt → AI để dùng Vision OCR.',
    )
  }

  if (!providerSupportsVision(provider)) {
    throw new Error(
      'PDF có vẻ là scan ảnh. Đổi provider sang OpenAI hoặc Gemini (hỗ trợ Vision) trong Cài đặt → AI.',
    )
  }

  const visionText = await extractTextViaVision(file, apiKey, provider, onVisionProgress)
  return { text: visionText, method: 'vision-ocr' }
}