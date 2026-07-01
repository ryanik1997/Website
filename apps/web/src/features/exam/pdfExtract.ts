import {
  getDocumentProxy,
  renderPageAsImage,
  resolvePDFJSImport,
} from 'unpdf'

const EXTRACT_TIMEOUT_MS = 120_000
const OPEN_TIMEOUT_MS = 30_000
const PAGE_TIMEOUT_MS = 20_000

let unpdfReady: Promise<void> | null = null

export type ExtractPdfStage = 'loading-lib' | 'opening' | 'reading'

export interface ExtractPdfProgress {
  stage: ExtractPdfStage
  page?: number
  total?: number
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} quá lâu (>${Math.round(ms / 1000)}s). Thử reload trang hoặc PDF khác.`))
    }, ms)
    promise.then(
      value => {
        clearTimeout(timer)
        resolve(value)
      },
      err => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

async function ensureUnpdf(): Promise<void> {
  if (!unpdfReady) {
    unpdfReady = resolvePDFJSImport().catch(err => {
      unpdfReady = null
      const msg = err instanceof Error ? err.message : String(err)
      throw new Error(`Không tải được thư viện PDF (${msg}). Thử reload trang.`)
    })
  }
  return unpdfReady
}

/** Gọi sớm khi mở modal import để tránh chờ lâu lần đầu. */
export function preloadPdfJs(): void {
  void ensureUnpdf().catch(() => {})
}

async function readFileBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer())
}

async function openPdf(
  file: File,
  onProgress?: (progress: ExtractPdfProgress) => void,
) {
  await ensureUnpdf()
  onProgress?.({ stage: 'opening' })
  const data = await readFileBytes(file)
  const pdf = await withTimeout(getDocumentProxy(data), OPEN_TIMEOUT_MS, 'Mở PDF')
  return { pdf, data }
}

function textFromPageContent(items: Array<{ str?: string; hasEOL?: boolean }>): string {
  return items
    .filter(item => item.str != null)
    .map(item => `${item.str}${item.hasEOL ? '\n' : ''}`)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

/** @deprecated — dùng ExtractPdfProgress */
export interface ExtractPdfPageProgress {
  page: number
  total: number
}

export interface PdfPageText {
  pageNum: number
  text: string
}

/** Trích text từng trang PDF — dùng map part KET/PET + giữ ảnh trang. */
export async function extractTextFromPdfPerPage(
  file: File,
  maxPages = 28,
  onProgress?: (progress: ExtractPdfProgress) => void,
): Promise<PdfPageText[]> {
  return withTimeout(
    (async () => {
      onProgress?.({ stage: 'loading-lib' })
      const { pdf } = await openPdf(file, onProgress)
      const pageCount = Math.min(pdf.numPages, maxPages)
      const pages: PdfPageText[] = []

      for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
        onProgress?.({ stage: 'reading', page: pageNum, total: pageCount })
        const page = await withTimeout(pdf.getPage(pageNum), PAGE_TIMEOUT_MS, `Đọc trang ${pageNum}`)
        const content = await withTimeout(page.getTextContent(), PAGE_TIMEOUT_MS, `Trích chữ trang ${pageNum}`)
        const pageText = textFromPageContent(content.items as Array<{ str?: string; hasEOL?: boolean }>)
        pages.push({ pageNum, text: pageText })
      }

      return pages
    })(),
    EXTRACT_TIMEOUT_MS,
    'Đọc PDF',
  )
}

/** Trích text từ PDF — full Reading test thường ~12–16 trang. */
export async function extractTextFromPdf(
  file: File,
  maxPages = 28,
  onProgress?: (progress: ExtractPdfProgress) => void,
): Promise<string> {
  const pages = await extractTextFromPdfPerPage(file, maxPages, onProgress)
  return pages.map(p => p.text).filter(Boolean).join('\n\n')
}

export interface PdfPageImage {
  pageNum: number
  dataUrl: string
}

/** Render trang PDF thành JPEG data URL (cho Vision OCR). */
export async function renderPdfPagesAsImages(
  file: File,
  maxPages = 20,
  scale = 1.4,
): Promise<PdfPageImage[]> {
  await ensureUnpdf()
  const { pdf } = await openPdf(file)
  const pageCount = Math.min(pdf.numPages, maxPages)
  const images: PdfPageImage[] = []

  for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
    const dataUrl = await withTimeout(
      renderPageAsImage(pdf, pageNum, { scale, toDataURL: true }),
      PAGE_TIMEOUT_MS,
      `Render trang ${pageNum}`,
    )
    images.push({ pageNum, dataUrl })
  }

  return images
}