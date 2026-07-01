import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight, Search, Star } from 'lucide-react'
import { sentenceStructureRepo } from '@ryan/db'
import type { SentenceStructure } from '@ryan/db'
import { categoryMeta } from './types'

const PAGE_SIZE = 24

export default function StructureListHub() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)

  const items = useLiveQuery(() => sentenceStructureRepo.all(), [])

  const filtered = useMemo(() => {
    if (!items) return items
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(s =>
      s.title.toLowerCase().includes(q)
      || s.template.toLowerCase().includes(q)
      || s.category.toLowerCase().includes(q)
      || s.description.toLowerCase().includes(q)
      || s.exampleNoteVi.toLowerCase().includes(q),
    )
  }, [items, query])

  const total = filtered?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageStart = safePage * PAGE_SIZE
  const pageItems = filtered?.slice(pageStart, pageStart + PAGE_SIZE) ?? []

  function goToPractice(id: string) {
    navigate(`/app/sentence-structure/${id}`)
  }

  return (
    <div className="ss-hub">
      <div className="ss-hub-toolbar">
        <div className="ss-hub-search">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0) }}
            placeholder="Tìm theo tên, mẫu câu, chủ đề…"
            aria-label="Tìm cấu trúc câu"
          />
        </div>
        <p className="ss-hub-count">
          {total.toLocaleString('vi-VN')} cấu trúc
          {query.trim() ? ' (đã lọc)' : ''}
        </p>
      </div>

      <div className="ss-hub-list" role="list">
        {pageItems.map(item => (
          <StructureRow
            key={item.id}
            item={item}
            onOpen={() => goToPractice(item.id)}
          />
        ))}
        {filtered && total === 0 && (
          <p className="ss-hub-empty">
            {query.trim() ? 'Không tìm thấy cấu trúc phù hợp' : 'Chưa có bài nào — bấm Thêm bài để tạo'}
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <footer className="ss-hub-pagination">
          <button
            type="button"
            className="ss-hub-page-btn"
            disabled={safePage <= 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            aria-label="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="ss-hub-page-info">
            {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, total)} / {total.toLocaleString('vi-VN')}
            <span className="ss-hub-page-num"> · Trang {safePage + 1}/{totalPages}</span>
          </span>
          <button
            type="button"
            className="ss-hub-page-btn"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            aria-label="Trang sau"
          >
            <ChevronRight size={16} />
          </button>
        </footer>
      )}
    </div>
  )
}

function StructureRow({
  item, onOpen,
}: {
  item: SentenceStructure
  onOpen: () => void
}) {
  const cat = categoryMeta(item.category)

  return (
    <div className="ss-hub-row" role="listitem">
      <button type="button" className="ss-hub-row-main" onClick={onOpen}>
        <div className="ss-hub-row-top">
          <h2 className="ss-hub-row-title">{item.title}</h2>
          {item.starred && (
            <Star size={14} className="ss-hub-row-starred" fill="currentColor" aria-hidden />
          )}
        </div>
        <p className="ss-hub-row-template">{item.template}</p>
        {item.description && (
          <p className="ss-hub-row-desc">{item.description}</p>
        )}
        <span className="ss-cat-tag">{cat.icon} {item.category}</span>
      </button>
      <button
        type="button"
        className={`ss-hub-star${item.starred ? ' is-starred' : ''}`}
        title={item.starred ? 'Bỏ đánh dấu' : 'Đánh dấu'}
        onClick={e => {
          e.stopPropagation()
          void sentenceStructureRepo.toggleStar(item.id)
        }}
      >
        <Star size={15} fill={item.starred ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}