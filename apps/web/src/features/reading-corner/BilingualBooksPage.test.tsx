import { cleanup, fireEvent, render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import BilingualBooksPage from './BilingualBooksPage'

describe('BilingualBooksPage library shelves', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders three static shelves without starting an auto-rotate loop', () => {
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
    const { container } = render(
      <MemoryRouter>
        <BilingualBooksPage />
      </MemoryRouter>,
    )

    expect(container.querySelectorAll('.shelf-row')).toHaveLength(3)
    expect(container.querySelectorAll('.shelf-bar')).toHaveLength(3)
    expect(container.querySelectorAll('.book')).toHaveLength(27)
    expect(container.querySelector('.library-scene')).not.toBeNull()
    expect(container.querySelector('.library-bg')).not.toBeNull()
    expect(container.querySelector('.library-bg-overlay')).not.toBeNull()
    expect(container.querySelector('.library-header-depth')).not.toBeNull()
    expect(container.querySelectorAll('.library-dust__particle')).toHaveLength(18)
    expect(container.querySelector('.bookcase-container')).not.toBeNull()
    expect(container.querySelector('.bookcase-back')).not.toBeNull()
    expect(container.querySelector('.bookcase-top')).not.toBeNull()
    expect(container.querySelector('.bookcase-bottom')).not.toBeNull()
    expect(container.querySelectorAll('.bookcase-side')).toHaveLength(2)
    expect(container.querySelectorAll('.bookcase-divider')).toHaveLength(2)
    expect(requestAnimationFrameSpy).not.toHaveBeenCalled()

    const tiltedBooks = [...container.querySelectorAll<HTMLElement>('.book')].filter(
      book => book.style.getPropertyValue('--book-tilt') !== '0deg',
    )
    expect(tiltedBooks).toHaveLength(3)

    const coverAngles = [...container.querySelectorAll<HTMLElement>('.book')].map(
      book => Number.parseFloat(book.style.getPropertyValue('--book-cover-y')),
    )
    expect(coverAngles.every(angle => angle >= -6 && angle <= 6)).toBe(true)
  })

  it('keeps a normal book click available for the FLIP preview', () => {
    const { container } = render(
      <MemoryRouter>
        <BilingualBooksPage />
      </MemoryRouter>,
    )
    const book = container.querySelector<HTMLElement>('.book')
    const track = container.querySelector<HTMLElement>('.shelf-track')
    expect(book).not.toBeNull()
    expect(track).not.toBeNull()
    if (!book || !track) return

    const setPointerCapture = vi.fn()
    track.setPointerCapture = setPointerCapture
    track.hasPointerCapture = vi.fn().mockReturnValue(false)
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

    fireEvent.pointerDown(book, {
      button: 0,
      pointerId: 1,
      clientX: 100,
    })

    expect(setPointerCapture).not.toHaveBeenCalled()

    fireEvent.click(book)
    expect(document.querySelector('.book-preview-overlay')).not.toBeNull()
  })

  it('wires The Song of Achilles to its imported PDF', () => {
    const { container } = render(
      <MemoryRouter>
        <BilingualBooksPage />
      </MemoryRouter>,
    )
    const book = container.querySelector<HTMLElement>(
      '.book[title="The Song of Achilles"]',
    )
    const previewAction = book?.querySelector<HTMLAnchorElement>(
      '[data-book-preview-action]',
    )

    expect(previewAction).toBeInstanceOf(HTMLAnchorElement)
    expect(previewAction).toHaveTextContent('Đọc sách')
    expect(previewAction).toHaveAttribute(
      'href',
      '/app/reading-corner/sach/read/cv01',
    )
    expect(previewAction).toHaveAttribute('target', '_self')
  })

  it('lets the opened book page receive pointer input above the rotated cover', () => {
    const css = readFileSync(
      resolve(process.cwd(), 'src/features/reading-corner/readingCorner.css'),
      'utf8',
    )
    const openCoverRule = css.match(
      /\.book-modal-content\.is-open\s+\.book-cover\s*\{([^}]*)\}/s,
    )?.[1]
    const openInsideRule = css.match(
      /\.book-modal-content\.is-open\s+\.book-inside\s*\{([^}]*)\}/s,
    )?.[1]
    const previewActionRule = css.match(
      /\.book-preview-modal\s+\[data-book-preview-action\]\s*\{([^}]*)\}/s,
    )?.[1]

    expect(openCoverRule).toMatch(/pointer-events:\s*none/)
    expect(openInsideRule).toMatch(/pointer-events:\s*auto/)
    expect(openInsideRule).toMatch(/z-index:\s*3/)
    expect(openInsideRule).toMatch(/transform:\s*translateZ\(1px\)/)
    expect(previewActionRule).toMatch(/pointer-events:\s*auto/)
    expect(previewActionRule).toMatch(/z-index:\s*5/)
    expect(previewActionRule).toMatch(/translateZ\(8px\)/)
  })
})
