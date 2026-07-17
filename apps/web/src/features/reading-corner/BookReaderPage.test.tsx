import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import BookReaderPage from './BookReaderPage'

const pdfMocks = vi.hoisted(() => {
  const destroyPdf = vi.fn()
  const renderPage = vi.fn().mockReturnValue({ promise: Promise.resolve() })
  const getPage = vi.fn().mockResolvedValue({
    getViewport: vi.fn().mockReturnValue({ width: 600, height: 900 }),
    render: renderPage,
  })
  const getDocument = vi.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 278,
      destroy: destroyPdf,
      getPage,
    }),
  })

  return {
    destroyPdf,
    getDocument,
    getPage,
    renderPage,
    getResolvedPDFJS: vi.fn().mockResolvedValue({ getDocument }),
    resolvePDFJSImport: vi.fn().mockResolvedValue(undefined),
  }
})

const mediaMocks = vi.hoisted(() => ({
  resolvePlayableMediaUrl: vi.fn().mockResolvedValue(
    'https://storage.example.test/signed-book.pdf',
  ),
}))

vi.mock('unpdf', () => ({
  getResolvedPDFJS: pdfMocks.getResolvedPDFJS,
  resolvePDFJSImport: pdfMocks.resolvePDFJSImport,
}))

vi.mock('../../lib/protectedMedia', () => ({
  resolvePlayableMediaUrl: mediaMocks.resolvePlayableMediaUrl,
}))

describe('BookReaderPage', () => {
  beforeEach(() => {
    const pdfBytes = new TextEncoder().encode('%PDF-1.4 fake')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: () => Promise.resolve(pdfBytes.buffer),
    }))
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      clearRect: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('fetches the PDF itself and hands the buffer to PDF.js', async () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/app/reading-corner/sach/read/cv01']}>
        <Routes>
          <Route
            path="/app/reading-corner/sach/read/:bookId"
            element={<BookReaderPage />}
          />
        </Routes>
      </MemoryRouter>,
    )

    await screen.findByText('1 / 278')
    await waitFor(() => expect(pdfMocks.renderPage).toHaveBeenCalled())

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://storage.example.test/signed-book.pdf',
      expect.objectContaining({ cache: 'no-store' }),
    )
    expect(mediaMocks.resolvePlayableMediaUrl).toHaveBeenCalledWith(
      '/books/the-song-of-achilles.pdf',
    )
    expect(pdfMocks.resolvePDFJSImport).toHaveBeenCalled()
    expect(pdfMocks.getDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.any(Uint8Array),
      }),
    )
    expect(pdfMocks.getDocument).not.toHaveBeenCalledWith(
      expect.objectContaining({ url: expect.anything() }),
    )
    expect(pdfMocks.getPage).toHaveBeenCalledWith(1)
    expect(document.querySelector('canvas')).not.toBeNull()
    expect(document.querySelector('iframe')).toBeNull()

    unmount()
    expect(pdfMocks.destroyPdf).toHaveBeenCalled()
  })

  it('shows an error when the server answers without a body (e.g. 204)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 204,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    }))

    render(
      <MemoryRouter initialEntries={['/app/reading-corner/sach/read/cv01']}>
        <Routes>
          <Route
            path="/app/reading-corner/sach/read/:bookId"
            element={<BookReaderPage />}
          />
        </Routes>
      </MemoryRouter>,
    )

    await screen.findByText(/HTTP 204/)
    expect(pdfMocks.getDocument).not.toHaveBeenCalled()
  })
})
