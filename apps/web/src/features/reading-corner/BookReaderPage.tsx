import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getResolvedPDFJS, resolvePDFJSImport } from 'unpdf'
import { resolvePlayableMediaUrl } from '../../lib/protectedMedia'
import booksCatalog from './data/books-catalog.json'
import './readingCorner.css'

type ReaderBook = {
  id: string
  title: string
  author: string | null
  pdfUrl?: string
}

type PdfPage = {
  getViewport: (options: { scale: number }) => {
    width: number
    height: number
  }
  render: (options: {
    canvas: HTMLCanvasElement
    canvasContext: CanvasRenderingContext2D
    viewport: unknown
  }) => {
    promise: Promise<unknown>
    cancel?: () => void
  }
  cleanup?: () => void
}

type PdfDocument = {
  numPages: number
  destroy: () => Promise<void>
  getPage: (pageNumber: number) => Promise<PdfPage>
}

type PdfLoadingTask = {
  promise: Promise<PdfDocument>
  destroy?: () => Promise<void>
}

const BOOKS = booksCatalog as ReaderBook[]

export default function BookReaderPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const book = useMemo(
    () => BOOKS.find(item => item.id === bookId),
    [bookId],
  )
  const pdfRef = useRef<PdfDocument | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!book?.pdfUrl) return

    let loadedPdf: PdfDocument | null = null
    let loadingTask: PdfLoadingTask | null = null
    let cancelled = false

    setError(null)
    setPageCount(0)

    void (async () => {
      // Tự fetch PDF thành buffer rồi đưa cho PDF.js — không dùng transport
      // range-request của PDF.js (nguồn lỗi "Unexpected server response (204)").
      const protectedUrl = await resolvePlayableMediaUrl(book.pdfUrl)
      if (!protectedUrl) throw new Error('Không thể tạo đường dẫn bảo mật cho sách.')
      const response = await fetch(protectedUrl, { cache: 'no-store' })
      if (!response.ok || response.status === 204) {
        throw new Error(`Không tải được PDF (HTTP ${response.status}).`)
      }
      const buffer = await response.arrayBuffer()
      if (buffer.byteLength === 0) {
        throw new Error('File PDF rỗng — kiểm tra lại đường dẫn sách.')
      }
      if (cancelled) return

      await resolvePDFJSImport()
      const pdfjs = await getResolvedPDFJS()
      loadingTask = pdfjs.getDocument({
        data: new Uint8Array(buffer),
        isEvalSupported: false,
        useSystemFonts: true,
      }) as PdfLoadingTask

      const pdf = await loadingTask.promise
      loadedPdf = pdf
      if (cancelled) {
        void pdf.destroy()
        return
      }

      pdfRef.current = pdf
      setPageNumber(1)
      setPageCount(pdf.numPages)
    })().catch(reason => {
      if (cancelled) return
      setError(reason instanceof Error ? reason.message : 'Không tải được PDF.')
    })

    return () => {
      cancelled = true
      if (!loadedPdf) void loadingTask?.destroy?.()
      if (pdfRef.current === loadedPdf) pdfRef.current = null
      if (loadedPdf) void loadedPdf.destroy()
    }
  }, [book])

  useEffect(() => {
    const pdf = pdfRef.current
    const canvas = canvasRef.current
    if (!pdf || !canvas || pageCount === 0) return

    let cancelled = false
    let renderTask: ReturnType<PdfPage['render']> | null = null
    let loadedPage: PdfPage | null = null

    setRendering(true)
    setError(null)

    void (async () => {
      const page = await pdf.getPage(pageNumber)
      loadedPage = page
      if (cancelled) return

      const viewport = page.getViewport({ scale: 1.6 })
      const context = canvas.getContext('2d', { alpha: false })
      if (!context) {
        throw new Error('Trình duyệt không hỗ trợ canvas để đọc sách.')
      }

      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`
      context.clearRect(0, 0, canvas.width, canvas.height)

      renderTask = page.render({
        canvas,
        canvasContext: context,
        viewport,
      })
      await renderTask.promise
    })()
      .catch(reason => {
        if (cancelled) return
        setError(reason instanceof Error ? reason.message : 'Không render được trang sách.')
      })
      .finally(() => {
        if (!cancelled) setRendering(false)
      })

    return () => {
      cancelled = true
      renderTask?.cancel?.()
      loadedPage?.cleanup?.()
    }
  }, [pageCount, pageNumber])

  if (!book?.pdfUrl) {
    return (
      <div className="book-reader-page book-reader-page--message">
        <BookOpen size={32} aria-hidden />
        <h1>Không tìm thấy sách</h1>
        <Link to="/app/reading-corner/sach">Quay lại kệ sách</Link>
      </div>
    )
  }

  return (
    <div className="book-reader-page">
      <header className="book-reader-toolbar">
        <Link to="/app/reading-corner/sach" className="book-reader-back">
          <ArrowLeft size={17} aria-hidden />
          Kệ sách
        </Link>
        <div className="book-reader-title">
          <strong>{book.title}</strong>
          <span>{book.author || 'Tác giả đang cập nhật'}</span>
        </div>
        <div className="book-reader-pagination" aria-label="Điều hướng trang">
          <button
            type="button"
            aria-label="Trang trước"
            disabled={pageNumber <= 1 || rendering}
            onClick={() => setPageNumber(value => Math.max(1, value - 1))}
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <span>{pageCount ? `${pageNumber} / ${pageCount}` : '— / —'}</span>
          <button
            type="button"
            aria-label="Trang sau"
            disabled={pageNumber >= pageCount || rendering}
            onClick={() => setPageNumber(value => Math.min(pageCount, value + 1))}
          >
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      </header>

      <main className="book-reader-document">
        {error ? (
          <div className="book-reader-state" role="alert">
            <BookOpen size={30} aria-hidden />
            <strong>Không thể mở sách</strong>
            <span>{error}</span>
          </div>
        ) : pageCount === 0 ? (
          <div className="book-reader-state" aria-live="polite">
            <span className="book-reader-spinner" aria-hidden />
            <strong>Đang tải sách…</strong>
          </div>
        ) : (
          <div className="book-reader-page-scroll">
            <canvas
              ref={canvasRef}
              className="book-reader-page-image"
              role="img"
              aria-label={`Trang ${pageNumber} của ${book.title}`}
            />
            {rendering ? (
              <div className="book-reader-rendering" aria-live="polite">
                <span className="book-reader-spinner" aria-hidden />
                <span>Đang render trang {pageNumber}…</span>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}
