import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createBookPreviewController } from './bookPreviewController'

function createBookElement(previewUrl?: string) {
  const book = document.createElement('div')
  book.dataset.bookTitle = 'The Little Prince'
  book.tabIndex = 0
  book.innerHTML = `
    <div class="book-modal-content">
      <div class="book-inside" aria-hidden="true">
        ${previewUrl
          ? `<a
              href="${previewUrl}"
              target="_self"
              tabindex="-1"
              data-book-preview-action
            >Đọc sách</a>`
          : `<button type="button" tabindex="-1" data-book-preview-action>Đọc thử</button>`}
        <span data-book-preview-status></span>
      </div>
      <div class="book-cover"></div>
    </div>
  `
  book.getBoundingClientRect = () =>
    ({
      x: 80,
      y: 120,
      left: 80,
      top: 120,
      right: 200,
      bottom: 300,
      width: 120,
      height: 180,
      toJSON: () => ({}),
    }) as DOMRect
  document.body.append(book)
  return book
}

describe('book preview controller', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'requestAnimationFrame',
      (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 0),
    )
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('opens with a clone, reveals the inside, then restores the source on close', () => {
    const book = createBookElement()
    const onOpenChange = vi.fn()
    const controller = createBookPreviewController({ onOpenChange })

    controller.openBook(book)

    expect(document.querySelector('.book-preview-overlay')).not.toBeNull()
    expect(book.style.visibility).toBe('hidden')
    expect(document.body.style.overflow).toBe('hidden')
    expect(onOpenChange).toHaveBeenCalledWith(true)

    vi.runAllTimers()

    const clonedContent = document.querySelector(
      '.book-preview-modal .book-modal-content',
    )
    expect(clonedContent).toHaveClass('is-open')
    expect(clonedContent?.querySelector('.book-inside')).not.toHaveAttribute('aria-hidden')

    controller.closeBook()
    vi.runAllTimers()

    expect(document.querySelector('.book-preview-overlay')).toBeNull()
    expect(book.style.visibility).toBe('')
    expect(document.body.style.overflow).toBe('')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    controller.destroy()
  })

  it('preserves an imported PDF link in the cloned preview', () => {
    const book = createBookElement('/app/reading-corner/sach/read/cv01')
    const controller = createBookPreviewController()

    controller.openBook(book)
    vi.runAllTimers()

    const previewAction = document.querySelector<HTMLAnchorElement>(
      '.book-preview-modal [data-book-preview-action]',
    )
    expect(previewAction).toHaveAttribute('href', '/app/reading-corner/sach/read/cv01')
    expect(previewAction).toHaveAttribute('target', '_self')
    expect(previewAction).toHaveAttribute('tabindex', '0')

    controller.destroy()
  })
})
