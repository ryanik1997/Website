import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { createBookPreviewController } from './bookPreviewController'
import booksCatalog from './data/books-catalog.json'
import './readingCorner.css'

type BookCover = {
  id: string
  title: string
  author: string | null
  coverUrl: string
  pdfUrl?: string
  note?: string
}

type DragState = {
  pointerId: number
  startX: number
  startScrollLeft: number
  moved: boolean
}

const BOOKS = booksCatalog as BookCover[]
const BOOKS_PER_SHELF = 9

const SHELVES = Array.from(
  { length: Math.ceil(BOOKS.length / BOOKS_PER_SHELF) },
  (_, index) =>
    BOOKS.slice(index * BOOKS_PER_SHELF, (index + 1) * BOOKS_PER_SHELF),
)

const DUST_PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  x: 4 + ((index * 37) % 92),
  y: 7 + ((index * 29) % 78),
  size: 2 + (index % 3),
  drift: -18 + ((index * 11) % 37),
  duration: 8 + (index % 8),
  delay: -((index * 0.73) % 11),
}))

function getStableBookHash(bookId: string): number {
  return [...bookId].reduce((value, character) => {
    return Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0
  }, 2166136261)
}

function getBookTilt(bookId: string): number {
  const hash = getStableBookHash(bookId)
  if (hash % 100 >= 14) return 0

  const direction = hash % 2 === 0 ? -1 : 1
  return direction * (4 + (hash % 5))
}

function getBookCoverAngle(bookId: string): number {
  return (getStableBookHash(bookId) % 13) - 6
}

export default function BilingualBooksPage() {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const books = [...stage.querySelectorAll<HTMLElement>('.book')]
    const shelfTracks = [...stage.querySelectorAll<HTMLElement>('.shelf-track')]
    if (!books.length) return

    const previewController = createBookPreviewController({
      onOpenChange: isOpen => {
        stage.classList.toggle('is-preview-open', isOpen)
      },
    })
    const dragStates = new WeakMap<HTMLElement, DragState>()

    const openBook = (bookElement: HTMLElement) => {
      previewController.openBook(bookElement)
    }
    const closeBook = () => {
      previewController.closeBook()
    }
    const handleBookClick = (event: Event) => {
      const book = event.currentTarget as HTMLElement
      const track = book.closest<HTMLElement>('.shelf-track')
      if (track?.dataset.didDrag === 'true') {
        event.preventDefault()
        return
      }
      openBook(book)
    }
    const handleBookKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent
      if (keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') return
      keyboardEvent.preventDefault()
      openBook(keyboardEvent.currentTarget as HTMLElement)
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      const track = event.currentTarget as HTMLElement
      dragStates.set(track, {
        pointerId: event.pointerId,
        startX: event.clientX,
        startScrollLeft: track.scrollLeft,
        moved: false,
      })
    }
    const handlePointerMove = (event: PointerEvent) => {
      const track = event.currentTarget as HTMLElement
      const dragState = dragStates.get(track)
      if (!dragState || dragState.pointerId !== event.pointerId) return

      const deltaX = event.clientX - dragState.startX
      if (Math.abs(deltaX) > 6 && !dragState.moved) {
        dragState.moved = true
        track.setPointerCapture(event.pointerId)
        track.classList.add('is-dragging')
      }
      if (!dragState.moved) return

      event.preventDefault()
      track.scrollLeft = dragState.startScrollLeft - deltaX
    }
    const finishDrag = (event: PointerEvent) => {
      const track = event.currentTarget as HTMLElement
      const dragState = dragStates.get(track)
      if (!dragState || dragState.pointerId !== event.pointerId) return

      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId)
      }
      track.classList.remove('is-dragging')
      dragStates.delete(track)

      if (dragState.moved) {
        track.dataset.didDrag = 'true'
        window.setTimeout(() => {
          delete track.dataset.didDrag
        }, 0)
      }
    }
    const handleWheel = (event: WheelEvent) => {
      if (!event.shiftKey || !event.deltaY) return
      const track = event.currentTarget as HTMLElement
      event.preventDefault()
      track.scrollLeft += event.deltaY
    }

    books.forEach(book => {
      book.addEventListener('click', handleBookClick)
      book.addEventListener('keydown', handleBookKeyDown)
    })
    shelfTracks.forEach(track => {
      track.addEventListener('pointerdown', handlePointerDown)
      track.addEventListener('pointermove', handlePointerMove)
      track.addEventListener('pointerup', finishDrag)
      track.addEventListener('pointercancel', finishDrag)
      track.addEventListener('wheel', handleWheel, { passive: false })
    })

    return () => {
      books.forEach(book => {
        book.removeEventListener('click', handleBookClick)
        book.removeEventListener('keydown', handleBookKeyDown)
      })
      shelfTracks.forEach(track => {
        track.removeEventListener('pointerdown', handlePointerDown)
        track.removeEventListener('pointermove', handlePointerMove)
        track.removeEventListener('pointerup', finishDrag)
        track.removeEventListener('pointercancel', finishDrag)
        track.removeEventListener('wheel', handleWheel)
      })
      closeBook()
      previewController.destroy()
    }
  }, [])

  return (
    <div className="hero-bilingual library-scene">
      <div className="library-camera">
        <div className="library-bg" aria-hidden />
        <div className="library-bg-overlay" aria-hidden />
        <div className="library-header-depth" aria-hidden />
        <div className="library-dust" aria-hidden>
          {DUST_PARTICLES.map((particle, index) => {
            const particleStyle = {
              '--dust-x': `${particle.x}%`,
              '--dust-y': `${particle.y}%`,
              '--dust-size': `${particle.size}px`,
              '--dust-drift': `${particle.drift}px`,
              '--dust-duration': `${particle.duration}s`,
              '--dust-delay': `${particle.delay}s`,
            } as CSSProperties

            return (
              <span
                className="library-dust__particle"
                style={particleStyle}
                key={`dust-${index + 1}`}
              />
            )
          })}
        </div>

        <Link to="/app/reading-corner" className="hero-bilingual-back">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        Góc đọc
        </Link>

        <div className="library-layout">
        <header className="library-intro">
          <div className="eyebrow">Thư viện song ngữ</div>
          <h1>Đọc nguyên tác và đối chiếu tiếng Việt dễ dàng</h1>
          <div className="note">
            <p>
              Các giáo viên đã tuyển chọn và biên tập những cuốn sách song ngữ
              chất lượng, giúp bạn đọc nguyên tác tiếng Anh đồng thời đối chiếu
              bản dịch tiếng Việt thuận tiện trên cùng một giao diện.
            </p>
          </div>
          <div className="hero-bilingual-cta">
            <Link to="/app/reading-corner/bao">Đọc Báo Song Ngữ →</Link>
          </div>
        </header>

        <div className="bookcase-container">
          <div
            className="stage library-shelves bookcase"
            ref={stageRef}
            id="stage"
          >
            <div className="bookcase-back" aria-hidden />
            <div className="bookcase-divider bookcase-divider--left" aria-hidden />
            <div className="bookcase-divider bookcase-divider--right" aria-hidden />

            <div className="bookcase-shelves">
              {SHELVES.map((shelfBooks, shelfIndex) => (
                <section
                  className="shelf-row"
                  aria-label={`Kệ sách ${shelfIndex + 1}`}
                  key={`shelf-${shelfIndex + 1}`}
                >
                  <div className="shelf-track">
                    <div className="shelf-books">
                      {shelfBooks.map(book => {
                    const bookStyle = {
                      '--book-tilt': `${getBookTilt(book.id)}deg`,
                      '--book-cover-y': `${getBookCoverAngle(book.id)}deg`,
                      '--book-cover-image': `url("${book.coverUrl}")`,
                    } as CSSProperties

                    return (
                      <div
                        key={book.id}
                        className="book"
                        style={bookStyle}
                        title={book.title}
                        role="button"
                        tabIndex={0}
                        aria-label={`Mở xem trước ${book.title}`}
                        data-book-title={book.title}
                        onMouseEnter={event =>
                          event.currentTarget.classList.add('is-hover')
                        }
                        onMouseLeave={event =>
                          event.currentTarget.classList.remove('is-hover')
                        }
                      >
                        <div className="book-modal-content">
                          <div className="book-inside" aria-hidden="true">
                            <span className="book-inside__eyebrow">
                              Xem trước tác phẩm
                            </span>
                            <h2>{book.title}</h2>
                            <p className="book-inside__author">
                              {book.author || 'Tác giả đang cập nhật'}
                            </p>
                            <p className="book-inside__description">
                              {book.note ||
                                'Bản song ngữ được biên tập để bạn đọc nguyên tác và đối chiếu tiếng Việt thuận tiện hơn.'}
                            </p>
                            {book.pdfUrl ? (
                              <a
                                href={`/app/reading-corner/sach/read/${book.id}`}
                                target="_self"
                                tabIndex={-1}
                                data-book-preview-action
                              >
                                Đọc sách
                              </a>
                            ) : (
                              <button
                                type="button"
                                tabIndex={-1}
                                data-book-preview-action
                              >
                                Đọc thử
                              </button>
                            )}
                            <span
                              className="book-inside__status"
                              data-book-preview-status
                              aria-live="polite"
                            />
                          </div>

                          <div className="book-cover">
                            <div className="book-inner">
                              <div className="face-back" />
                              <div className="edge edge-spine" />
                              <div className="edge edge-right" />
                              <div className="edge edge-bottom" />
                              <div className="edge edge-top" />
                              <div className="face-front">
                                <img
                                  src={book.coverUrl}
                                  alt={book.title}
                                  width={200}
                                  height={300}
                                  decoding="async"
                                  draggable={false}
                                />
                                <span className="gloss" aria-hidden />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                      })}
                    </div>
                  </div>
                  <div className="shelf-bar" aria-hidden />
                </section>
              ))}
            </div>

            <div className="bookcase-light" aria-hidden />
            <div className="bookcase-top" aria-hidden />
            <div className="bookcase-side bookcase-side-left" aria-hidden />
            <div className="bookcase-side bookcase-side-right" aria-hidden />
            <div className="bookcase-bottom" aria-hidden />
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
