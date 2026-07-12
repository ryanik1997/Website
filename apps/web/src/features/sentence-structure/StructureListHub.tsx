import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight, Search, Star, Tag } from 'lucide-react'
import { dedupeLegacySentenceStructures } from '@ryan/catalog'
import { sentenceStructureRepo } from '@ryan/db'
import type { SentenceStructure } from '@ryan/db'
import { categoryMeta } from './types'
import { CEFR_LEVELS, CEFR_LABELS, parseCefr, cefrBadgeStyle, type CefrLevel } from '../../lib/cefr'

const PAGE_SIZE = 24

function structureDedupeKey(s: Pick<SentenceStructure, 'title' | 'template'>): string {
  return `${s.title.trim().toLowerCase()}|${s.template.trim().toLowerCase()}`
}

/** Ưu tiên catalog id khi list còn sót bản trùng (UI an toàn). */
function uniqueStructures(items: SentenceStructure[]): SentenceStructure[] {
  const map = new Map<string, SentenceStructure>()
  for (const item of items) {
    const key = structureDedupeKey(item)
    const prev = map.get(key)
    if (!prev) {
      map.set(key, item)
      continue
    }
    const preferNew =
      (item.id.startsWith('catalog:') && !prev.id.startsWith('catalog:'))
      || (!item.id.startsWith('catalog:') && !prev.id.startsWith('catalog:') && item.updatedAt >= prev.updatedAt)
      || (item.id.startsWith('catalog:') && prev.id.startsWith('catalog:') && item.updatedAt >= prev.updatedAt)
    if (preferNew) map.set(key, item)
  }
  return [...map.values()].sort((a, b) => b.updatedAt - a.updatedAt)
}

export default function StructureListHub() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const cefrFilter = parseCefr(searchParams.get('cefr') ?? undefined)

  useEffect(() => {
    void dedupeLegacySentenceStructures()
  }, [])

  const items = useLiveQuery(() => sentenceStructureRepo.all(), [])

  const filtered = useMemo(() => {
    if (!items) return items
    let unique = uniqueStructures(items)
    if (cefrFilter) {
      unique = unique.filter(s => s.cefr === cefrFilter)
    }
    const q = query.trim().toLowerCase()
    if (!q) return unique
    return unique.filter(s =>
      s.title.toLowerCase().includes(q)
      || s.template.toLowerCase().includes(q)
      || s.category.toLowerCase().includes(q)
      || s.description.toLowerCase().includes(q)
      || s.exampleNoteVi.toLowerCase().includes(q)
      || (s.cefr?.toLowerCase().includes(q) ?? false),
    )
  }, [items, query, cefrFilter])

  const total = filtered?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageStart = safePage * PAGE_SIZE
  const pageItems = filtered?.slice(pageStart, pageStart + PAGE_SIZE) ?? []
  const groupedPageItems = useMemo(() => {
    const groups = new Map<string, SentenceStructure[]>()
    for (const item of pageItems) {
      const key = categoryMeta(item.category).label
      const current = groups.get(key) ?? []
      current.push(item)
      groups.set(key, current)
    }
    return [...groups.entries()]
  }, [pageItems])

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
        <div className="flex flex-wrap gap-1.5 px-1 pb-1">
          <button
            type="button"
            className="px-2.5 py-1 rounded-full text-[11px] font-bold border"
            style={{
              borderColor: !cefrFilter ? 'var(--color-primary)' : 'var(--border-color)',
              color: !cefrFilter ? 'var(--color-primary)' : 'var(--text-muted)',
              background: !cefrFilter
                ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
                : 'transparent',
            }}
            onClick={() => {
              const next = new URLSearchParams(searchParams)
              next.delete('cefr')
              setSearchParams(next, { replace: true })
              setPage(0)
            }}
          >
            Tất cả CEFR
          </button>
          {CEFR_LEVELS.map(level => {
            const active = cefrFilter === level
            const st = cefrBadgeStyle(level)
            return (
              <button
                key={level}
                type="button"
                className="px-2.5 py-1 rounded-full text-[11px] font-bold border"
                style={{
                  borderColor: active ? st.color : 'var(--border-color)',
                  color: active ? st.color : 'var(--text-muted)',
                  background: active ? st.bg : 'transparent',
                }}
                title={CEFR_LABELS[level]}
                onClick={() => {
                  const next = new URLSearchParams(searchParams)
                  next.set('cefr', level)
                  setSearchParams(next, { replace: true })
                  setPage(0)
                }}
              >
                {level}
              </button>
            )
          })}
        </div>
        <p className="ss-hub-count">
          {total.toLocaleString('vi-VN')} cấu trúc
          {(query.trim() || cefrFilter) ? ' (đã lọc)' : ''}
        </p>
      </div>

      <div className="ss-hub-groups">
        {groupedPageItems.map(([category, categoryItems]) => (
          <section className="ss-hub-group" key={category}>
            <header className="ss-hub-group-head">
              <h2>{category}</h2>
              <span>{categoryItems.length}</span>
            </header>
            <div className="ss-hub-list" role="list">
              {categoryItems.map(item => (
                <StructureRow key={item.id} item={item} onOpen={() => goToPractice(item.id)} />
              ))}
            </div>
          </section>
        ))}
        {filtered && total === 0 && (
          <p className="ss-hub-empty ss-hub-empty--grouped">
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
  const cefr = item.cefr as CefrLevel | undefined
  const badge = cefr ? cefrBadgeStyle(cefr) : null

  return (
    <div className={`ss-hub-row${cefr ? ` ss-hub-row--${cefr.toLowerCase()}` : ''}`} role="listitem">
      <button type="button" className="ss-hub-row-main" onClick={onOpen}>
        <div className="ss-hub-row-top">
          <h2 className="ss-hub-row-title">{item.title}</h2>
          {cefr && badge && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: badge.bg, color: badge.color }}
            >
              {cefr}
            </span>
          )}
        </div>
        <p className="ss-hub-row-template">{item.template}</p>
        {item.description && (
          <p className="ss-hub-row-desc">{item.description}</p>
        )}
        <span className="ss-cat-tag"><Tag size={12} /> {item.category}</span>
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
