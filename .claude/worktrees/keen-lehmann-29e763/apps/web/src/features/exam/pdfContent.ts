import type { AIProvider } from '@ryan/core'
import { providerSupportsVision } from '@ryan/core'
import {
  extractTextFromPdfPerPage,
  renderPdfPagesAsImages,
  type ExtractPdfProgress,
  type PdfPageText,
} from './pdfExtract'
import { extractPagesViaVision } from './pdfVision'

export type PdfExtractMethod = 'text-layer' | 'vision-ocr'

const TEXT_LAYER_MIN = 200

export interface ExtractPdfOptions {
  apiKey?: string
  provider?: AIProvider
  onVisionProgress?: (done: number, total: number) => void
  onPageProgress?: (progress: ExtractPdfProgress) => void
  /** KET/PET scan — luôn render ảnh trang để fallback passage */
  preservePageImages?: boolean
  maxPages?: number
}

export interface PdfPageContent {
  pageNum: number
  text: string
  dataUrl?: string
}

export interface ExtractPdfResult {
  text: string
  method: PdfExtractMethod
  pages: PdfPageContent[]
}

function mergePageText(pages: Array<{ pageNum: number; text: string }>): string {
  return pages
    .map(p => {
      const text = p.text.trim()
      return text ? `--- PAGE ${p.pageNum} ---\n${text}` : ''
    })
    .filter(Boolean)
    .join('\n\n')
}

async function attachRenderedImages(
  file: File,
  pages: PdfPageContent[],
  maxPages: number,
): Promise<PdfPageContent[]> {
  const images = await renderPdfPagesAsImages(file, maxPages)
  const imageByPage = new Map(images.map(img => [img.pageNum, img.dataUrl]))
  return pages.map(page => ({
    ...page,
    dataUrl: imageByPage.get(page.pageNum),
  }))
}

/** Hybrid: text layer trước, Vision OCR nếu scan; luôn có thể giữ ảnh trang. */
export async function extractPdfContent(
  file: File,
  options?: ExtractPdfOptions,
): Promise<ExtractPdfResult> {
  const maxPages = options?.maxPages ?? 28
  const perPage = await extractTextFromPdfPerPage(file, maxPages, progress => {
    options?.onPageProgress?.(progress)
  })
  const mergedText = mergePageText(perPage)
  const needsVision = mergedText.trim().length < TEXT_LAYER_MIN

  if (!needsVision) {
    let pages: PdfPageContent[] = perPage.map(p => ({ pageNum: p.pageNum, text: p.text }))
    if (options?.preservePageImages) {
      pages = await attachRenderedImages(file, pages, maxPages)
    }
    return { text: mergedText, method: 'text-layer', pages }
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

  const visionPages = await extractPagesViaVision(file, apiKey, provider, onVisionProgress)
  const visionText = mergePageText(visionPages)
  if (visionText.length < 200) {
    throw new Error('Vision OCR không đọc được đủ chữ. Thử PDF rõ hơn hoặc provider khác.')
  }

  return {
    text: visionText,
    method: 'vision-ocr',
    pages: visionPages,
  }
}