import { useMemo, useState } from 'react'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Headphones,
  LayoutGrid,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react'
import {
  filterCambridgeBooksByQuery,
  formatCambridgeBookTitle,
  getCambridgeBrandBookCoverColor,
  groupCambridgeExamsByBook,
} from './cambridgeLibraryGrouping'
import {
  filterIeltsBooksByQuery,
  getIeltsBookCoverColor,
  groupExamsByCambridgeBook,
  type IeltsLibrarySkill,
} from './ieltsLibraryGrouping'

export type LibraryArchiveMode = 'ielts' | 'cambridge'

export interface IeltsLibraryExamRow {
  id: string
  title: string
  meta: string
  done?: boolean
  completionLabel?: string
  canDelete?: boolean
}

interface Props<T extends { id: string; title: string }> {
  skill: IeltsLibrarySkill
  exams: T[]
  buildRow: (exam: T) => IeltsLibraryExamRow
  onOpenExam: (id: string) => void
  onRetryExam?: (id: string) => void
  onDeleteExam?: (id: string) => void
  /** IELTS: nhóm theo Cambridge 9–20. Cambridge CEFR: nhóm theo Book/Test. */
  archiveMode?: LibraryArchiveMode
  /** KET, PET, FCE, CAE, CPE — hiển thị trên bìa sách thay IELTS */
  brandLabel?: string
}

function BookCover({
  bookNumber,
  brandLabel,
  archiveMode,
}: {
  bookNumber: number
  brandLabel: string
  archiveMode: LibraryArchiveMode
}) {
  const background = archiveMode === 'ielts'
    ? getIeltsBookCoverColor(bookNumber)
    : getCambridgeBrandBookCoverColor(brandLabel, bookNumber)

  return (
    <div
      className={`ielts-library-cover${brandLabel.length > 4 ? ' ielts-library-cover--compact-brand' : ''}`}
      style={{ background }}
      aria-hidden
    >
      <span className="ielts-library-cover__brand">{brandLabel}</span>
      <span className="ielts-library-cover__num">{bookNumber}</span>
    </div>
  )
}

function bookCardTitle(archiveMode: LibraryArchiveMode, brandLabel: string, bookNumber: number): string {
  if (archiveMode === 'ielts') return `CAMBRIDGE ${bookNumber}`
  return formatCambridgeBookTitle(brandLabel, bookNumber)
}

function TestRows({
  rows,
  onOpenExam,
  onRetryExam,
  onDeleteExam,
}: {
  rows: IeltsLibraryExamRow[]
  onOpenExam: (id: string) => void
  onRetryExam?: (id: string) => void
  onDeleteExam?: (id: string) => void
}) {
  return (
    <div className="ielts-library-tests">
      {rows.map(row => (
        <div key={row.id} className="ielts-library-test-row">
          <div className="ielts-library-test-row__main">
            <p className="ielts-library-test-row__title">{row.title}</p>
            <p className="ielts-library-test-row__meta">{row.meta}</p>
          </div>
          <div className="ielts-library-test-row__actions">
            {row.done && <span className="ielts-library-test-row__badge">Đã làm</span>}
            <button type="button" className="ielts-library-test-row__cta" onClick={() => onOpenExam(row.id)}>
              {row.done ? 'Xem kết quả' : 'Làm bài'}
            </button>
            {row.done && onRetryExam && (
              <button
                type="button"
                className="ielts-library-test-row__icon-btn"
                title="Làm lại"
                onClick={() => onRetryExam(row.id)}
              >
                <RotateCcw size={15} />
              </button>
            )}
            {row.canDelete && onDeleteExam && (
              <button
                type="button"
                className="ielts-library-test-row__icon-btn"
                title="Xóa"
                onClick={() => onDeleteExam(row.id)}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function IeltsLibraryArchive<T extends { id: string; title: string }>({
  skill,
  exams,
  buildRow,
  onOpenExam,
  onRetryExam,
  onDeleteExam,
  archiveMode = 'ielts',
  brandLabel = 'IELTS',
}: Props<T>) {
  const [query, setQuery] = useState('')
  const [selectedBookNum, setSelectedBookNum] = useState<number | null>(null)

  const grouped = useMemo(() => {
    if (archiveMode === 'cambridge') return groupCambridgeExamsByBook(exams)
    const ielts = groupExamsByCambridgeBook(exams)
    return {
      books: ielts.books.map(b => ({ book: b.cambridge, exams: b.exams.map(e => ({ ...e, book: b.cambridge, test: e.test })) })),
      ungrouped: ielts.ungrouped,
    }
  }, [archiveMode, exams])

  const filtered = useMemo(() => {
    if (archiveMode === 'cambridge') {
      return filterCambridgeBooksByQuery(grouped.books, grouped.ungrouped, query, brandLabel)
    }
    const ieltsBooks = grouped.books.map(b => ({
      cambridge: b.book,
      exams: b.exams.map(e => ({ exam: e.exam, cambridge: b.book, test: e.test })),
    }))
    const ieltsFiltered = filterIeltsBooksByQuery(ieltsBooks, grouped.ungrouped, query)
    return {
      books: ieltsFiltered.books.map(b => ({
        book: b.cambridge,
        exams: b.exams.map(e => ({ exam: e.exam, book: b.cambridge, test: e.test })),
      })),
      ungrouped: ieltsFiltered.ungrouped,
    }
  }, [archiveMode, brandLabel, grouped, query])

  const selectedBook = useMemo(() => {
    if (selectedBookNum == null) return null
    return filtered.books.find(b => b.book === selectedBookNum) ?? null
  }, [filtered.books, selectedBookNum])

  const skillLabel = skill === 'listening'
    ? 'Listening'
    : archiveMode === 'cambridge'
      ? 'Reading · Writing'
      : 'Reading'
  const searchPlaceholder = archiveMode === 'ielts'
    ? (skill === 'listening' ? 'Tìm bài nghe (VD: Cam 20)...' : 'Tìm bài đọc (VD: Cam 20)...')
    : (skill === 'listening'
      ? `Tìm bài nghe (VD: ${brandLabel} Test 2)...`
      : `Tìm bài đọc (VD: ${brandLabel} Test 2)...`)

  if (exams.length === 0) {
    return (
      <section className="ielts-library">
        <header className="ielts-library__header">
          <div className="ielts-library__title-wrap">
            <LayoutGrid size={18} className="ielts-library__title-icon" />
            <h2 className="ielts-library__title">Library Archives</h2>
          </div>
        </header>
        <p className="ielts-library__empty">Chưa có đề {skillLabel}. Import đề để bắt đầu luyện tập.</p>
      </section>
    )
  }

  if (selectedBook) {
    const rows = selectedBook.exams.map(item => buildRow(item.exam))
    return (
      <section className="ielts-library">
        <button type="button" className="ielts-library__back" onClick={() => setSelectedBookNum(null)}>
          <ChevronLeft size={16} />
          Library Archives
        </button>

        <div className="ielts-library__book-hero">
          <BookCover bookNumber={selectedBook.book} brandLabel={brandLabel} archiveMode={archiveMode} />
          <div>
            <h2 className="ielts-library__book-title">
              {bookCardTitle(archiveMode, brandLabel, selectedBook.book)}
            </h2>
            <p className="ielts-library__book-meta">
              <span><LayoutGrid size={13} /> {selectedBook.exams.length} Tests</span>
              <span>
                {skill === 'listening' ? <Headphones size={13} /> : <BookOpen size={13} />}
                {skillLabel}
              </span>
            </p>
          </div>
        </div>

        <TestRows
          rows={rows}
          onOpenExam={onOpenExam}
          onRetryExam={onRetryExam}
          onDeleteExam={onDeleteExam}
        />

        {filtered.ungrouped.length > 0 && (
          <div className="ielts-library__ungrouped">
            <h3 className="ielts-library__ungrouped-title">Đề khác</h3>
            <TestRows
              rows={filtered.ungrouped.map(buildRow)}
              onOpenExam={onOpenExam}
              onRetryExam={onRetryExam}
              onDeleteExam={onDeleteExam}
            />
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="ielts-library">
      <header className="ielts-library__toolbar">
        <div className="ielts-library__title-wrap">
          <LayoutGrid size={18} className="ielts-library__title-icon" />
          <h2 className="ielts-library__title">Library Archives</h2>
        </div>
        <div className="ielts-library__toolbar-right">
          <span className="ielts-library__filter-pill">TẤT CẢ</span>
          <label className="ielts-library__search">
            <Search size={15} className="ielts-library__search-icon" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={`Tìm ${skillLabel}`}
            />
          </label>
        </div>
      </header>

      <div className="ielts-library__cards">
        {filtered.books.map(book => (
          <button
            key={book.book}
            type="button"
            className="ielts-library-card"
            onClick={() => setSelectedBookNum(book.book)}
          >
            <BookCover bookNumber={book.book} brandLabel={brandLabel} archiveMode={archiveMode} />
            <div className="ielts-library-card__body">
              <p className="ielts-library-card__title">
                {bookCardTitle(archiveMode, brandLabel, book.book)}
              </p>
              <p className="ielts-library-card__meta">
                <span><LayoutGrid size={13} /> {book.exams.length} Tests</span>
                <span>
                  {skill === 'listening' ? <Headphones size={13} /> : <BookOpen size={13} />}
                  {skillLabel}
                </span>
              </p>
            </div>
            <ChevronRight size={18} className="ielts-library-card__chevron" aria-hidden />
          </button>
        ))}
      </div>

      {filtered.ungrouped.length > 0 && (
        <div className="ielts-library__ungrouped">
          <h3 className="ielts-library__ungrouped-title">Đề khác</h3>
          <TestRows
            rows={filtered.ungrouped.map(buildRow)}
            onOpenExam={onOpenExam}
            onRetryExam={onRetryExam}
            onDeleteExam={onDeleteExam}
          />
        </div>
      )}

      {filtered.books.length === 0 && filtered.ungrouped.length === 0 && (
        <p className="ielts-library__empty">Không tìm thấy đề phù hợp.</p>
      )}
    </section>
  )
}