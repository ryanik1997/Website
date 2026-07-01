import type { TextItem } from 'pdfjs-dist/types/src/display/api'

type PdfJsModule = typeof import('pdfjs-dist')
type PdfLoadingTask = ReturnType<PdfJsModule['getDocument']>
type PdfDoc = Awaited<PdfLoadingTask['promise']>
type PdfPage = Awaited<ReturnType<PdfDoc['getPage']>>

const EXTRACT_TIMEOUT_MS = 120_000
const OPEN_TIMEOUT_MS = 60_000
const PAGE_TIMEOUT_MS = 20_000
const DESTROY_TIMEOUT_MS = 2_000

const PDF_WORKER_SRC = '/pdf.worker.min.mjs'

let pdfJsReady: Promise<PdfJsModule> | null = null

export type ExtractPdfStage = 'loading-lib' | 'opening' | 'reading'

export interface ExtractPdfProgress {
  stage: ExtractPdfStage
  page?: number
  total?: number
}

type PdfJsWorkerGlobal = typeof globalThis & {
  pdfjsWorker?: { WorkerMessageHandler?: unknown }
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

function releasePdfTask(task: PdfLoadingTask): void {
  void Promise.race([
    task.destroy(),
    new Promise<void>(resolve => {
      setTimeout(resolve, DESTROY_TIMEOUT_MS)
    }),
  ]).catch(() => {})
}

/**
 * Bỏ qua Web Worker (thường treo handshake trên Vite/Windows).
 * pdf.js đọc WorkerMessageHandler từ globalThis.pdfjsWorker → chạy fake worker trên main thread.
 */
async function installMainThreadWorker(): Promise<void> {
  const g = globalThis as PdfJsWorkerGlobal
  if (g.pdfjsWorker?.WorkerMessageHandler) return

  const workerMod = await import('pdfjs-dist/build/pdf.worker.min.mjs') as {
    WorkerMessageHandler?: unknown
  }
  if (!workerMod.WorkerMessageHandler) {
    throw new Error('pdf.worker thiếu WorkerMessageHandler.')
  }
  g.pdfjsWorker = workerMod
}

async function loadPdfJs(onProgress?: (progress: ExtractPdfProgress) => void): Promise<PdfJsModule> {
  onProgress?.({ stage: 'loading-lib' })
  if (!pdfJsReady) {
    pdfJsReady = (async () => {
      await installMainThreadWorker()
      const pdfjs = await import('pdfjs-dist/build/pdf.mjs') as PdfJsModule
      pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC
      return pdfjs
    })().catch(err => {
      pdfJsReady = null
      const msg = err instanceof Error ? err.message : String(err)
      throw new Error(`Không tải được pdf.js (${msg}). Thử reload trang.`)
    })
  }
  return pdfJsReady
}

/** Gọi sớm khi mở modal import để tránh chờ lâu lần đầu. */
export function preloadPdfJs(): void {
  void loadPdfJs().catch(() => {})
}

async function openPdf(
  file: File,
  onProgress?: (progress: ExtractPdfProgress) => void,
): Promise<{ pdf: PdfDoc; task: PdfLoadingTask }> {
  const { getDocument } = await loadPdfJs(onProgress)
  onProgress?.({ stage: 'opening' })
  const data = new Uint8Array(await file.arrayBuffer())
  const task = getDocument({
    data,
    useWorkerFetch: false,
    useWasm: false,
  })
  const pdf = await withTimeout(task.promise, OPEN_TIMEOUT_MS, 'Mở PDF')
  return { pdf, task }
}

function textFromPageItems(items: unknown[]): string {
  return items
    .filter((item): item is TextItem => typeof item === 'object' && item !== null && 'str' in item)
    .map(item => item.str)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** @deprecated — dùng ExtractPdfProgress */
export interface ExtractPdfPageProgress {
  page: number
  total: number
}

/** Trích text từ PDF — full Reading test thường ~12–16 trang. */
export async function extractTextFromPdf(
  file: File,
  maxPages = 28,
  onProgress?: (progress: ExtractPdfProgress) => void,
): Promise<string> {
  return withTimeout(
    (async () => {
      const { pdf, task } = await openPdf(file, onProgress)
      const pageCount = Math.min(pdf.numPages, maxPages)
      const chunks: string[] = []

      try {
        for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
          onProgress?.({ stage: 'reading', page: pageNum, total: pageCount })
          const page = await withTimeout(pdf.getPage(pageNum), PAGE_TIMEOUT_MS, `Đọc trang ${pageNum}`)
          const content = await withTimeout(page.getTextContent(), PAGE_TIMEOUT_MS, `Trích chữ trang ${pageNum}`)
          const pageText = textFromPageItems(content.items as unknown[])
          if (pageText) chunks.push(pageText)
        }
      } finally {
        releasePdfTask(task)
      }

      return chunks.join('\n\n')
    })(),
    EXTRACT_TIMEOUT_MS,
    'Đọc PDF',
  )
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
  const { pdf, task } = await openPdf(file)
  const pageCount = Math.min(pdf.numPages, maxPages)
  const images: PdfPageImage[] = []

  try {
    for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
      const page = await withTimeout(pdf.getPage(pageNum), PAGE_TIMEOUT_MS, `Render trang ${pageNum}`)
      const canvas = await renderPageToCanvas(page, scale)
      if (!canvas) continue
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
      images.push({ pageNum, dataUrl })
    }
  } finally {
    releasePdfTask(task)
  }

  return images
}