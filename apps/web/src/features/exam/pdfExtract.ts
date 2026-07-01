import type { TextItem } from 'pdfjs-dist/types/src/display/api'

type PdfJsModule = typeof import('pdfjs-dist')
type PdfDoc = Awaited<ReturnType<PdfJsModule['getDocument']>['promise']>
type PdfPage = Awaited<ReturnType<PdfDoc['getPage']>>

let pdfJsReady: Promise<PdfJsModule> | null = null

async function loadPdfJs(): Promise<PdfJsModule> {
  if (!pdfJsReady) {
    pdfJsReady = (async () => {
      const pdfjs = await import('pdfjs-dist')
      const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default
      return pdfjs
    })()
  }
  return pdfJsReady
}

async function openPdf(file: File): Promise<PdfDoc> {
  const { getDocument } = await loadPdfJs()
  const data = await file.arrayBuffer()
  const loadingTask = getDocument({ data })
  return loadingTask.promise
}

function textFromPageItems(items: unknown[]): string {
  return items
    .filter((item): item is TextItem => typeof item === 'object' && item !== null && 'str' in item)
    .map(item => item.str)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Trích text từ PDF — full Reading test thường ~12–16 trang. */
export async function extractTextFromPdf(file: File, maxPages = 28): Promise<string> {
  const pdf = await openPdf(file)
  const pageCount = Math.min(pdf.numPages, maxPages)
  const chunks: string[] = []

  for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = textFromPageItems(content.items as unknown[])
    if (pageText) chunks.push(pageText)
  }

  return chunks.join('\n\n')
}

export interface PdfPageImage {
  pageNum: number
  dataUrl: string
}

async function renderPageToCanvas(page: PdfPage, scale: number): Promise<HTMLCanvasElement | null> {
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const task = page.render({ canvasContext: ctx, viewport, canvas })
  await task.promise
  return canvas
}

/** Render trang PDF thành JPEG data URL (cho Vision OCR). */
export async function renderPdfPagesAsImages(
  file: File,
  maxPages = 20,
  scale = 1.4,
): Promise<PdfPageImage[]> {
  const pdf = await openPdf(file)
  const pageCount = Math.min(pdf.numPages, maxPages)
  const images: PdfPageImage[] = []

  for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
    const page = await pdf.getPage(pageNum)
    const canvas = await renderPageToCanvas(page, scale)
    if (!canvas) continue
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
    images.push({ pageNum, dataUrl })
  }

  return images
}