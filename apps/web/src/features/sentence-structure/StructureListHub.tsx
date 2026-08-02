import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight, Star, Tag } from 'lucide-react'
import { dedupeLegacySentenceStructures, syncGlobalCatalog } from '@ryan/catalog'
import { sentenceStructureRepo } from '@ryan/db'
import type { LearningStatus, SentenceStructure } from '@ryan/db'
import { categoryMeta } from './types'
import { CEFR_LEVELS, CEFR_LABELS, parseCefr, cefrBadgeStyle, type CefrLevel } from '../../lib/cefr'
import { getStructureCompletionHistory, type StructureCompletionEntry } from './structureHistory'
import LearningStatusChip from './LearningStatusChip'
import {
  countStatuses,
  filterStructures,
  getLearningStatus,
  uniqueStructures,
  type LearningStatusFilter,
} from './structureLibrary'
import {
  EmptySavedStructures,
  SavedStructuresCard,
  SavedViewHeader,
  SentenceStructureToolbar,
} from './SentenceStructureLibraryControls'

const PAGE_SIZE = 24

export default function StructureListHub() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [history, setHistory] = useState<StructureCompletionEntry[]>([])
  const [error, setError] = useState('')
  const cefrFilter = parseCefr(searchParams.get('cefr') ?? undefined)
  const categoryFilter = searchParams.get('category') ?? ''
  const statusFilter = (searchParams.get('status') ?? '') as LearningStatusFilter
  const savedOnly = searchParams.get('view') === 'saved'

  useEffect(() => {
    void (async () => {
      await syncGlobalCatalog().catch(err => console.warn('[structure] catalog sync', err))
      await dedupeLegacySentenceStructures()
    })()
    setHistory(getStructureCompletionHistory())
  }, [])

  const items = useLiveQuery(() => sentenceStructureRepo.all(), [])
  const unique = useMemo(() => uniqueStructures(items ?? []), [items])
  const savedCounts = useMemo(() => countStatuses(unique.filter(item => item.starred)), [unique])
  const filtered = useMemo(() => filterStructures(unique, {
    query,
    cefr: cefrFilter,
    category: categoryFilter,
    status: statusFilter,
    savedOnly,
  }), [unique, query, cefrFilter, categoryFilter, statusFilter, savedOnly])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageStart = safePage * PAGE_SIZE
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE)
  const groupedPageItems = useMemo(() => {
    const groups = new Map<string, SentenceStructure[]>()
    const order = [...CEFR_LEVELS, 'unassigned']
    for (const item of pageItems) {
      const key = item.cefr ?? 'unassigned'
      groups.set(key, [...(groups.get(key) ?? []), item])
    }
    return [...groups.entries()]
      .sort(([a], [b]) => order.indexOf(a as typeof order[number]) - order.indexOf(b as typeof order[number]))
      .map(([level, levelItems]) => {
        const categories = new Map<string, SentenceStructure[]>()
        for (const item of levelItems) {
          const category = categoryMeta(item.category).label
          categories.set(category, [...(categories.get(category) ?? []), item])
        }
        return [level, [...categories.entries()]] as const
      })
  }, [pageItems])

  function updateParam(key: string, value?: string, options: { replace?: boolean } = { replace: true }) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, options)
    setPage(0)
  }

  async function updateStatus(id: string, status: LearningStatus) {
    setError('')
    try {
      await sentenceStructureRepo.setLearningStatus(id, status)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể lưu trạng thái học tập. Vui lòng thử lại.')
      throw reason
    }
  }

  async function toggleStar(id: string) {
    setError('')
    try {
      await sentenceStructureRepo.toggleStar(id)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể cập nhật cấu trúc đã lưu. Vui lòng thử lại.')
    }
  }

  return (
    <div className="ss-hub">
      {savedOnly
        ? <SavedViewHeader onClose={() => updateParam('view', undefined, { replace: false })} />
        : <SavedStructuresCard counts={savedCounts} onOpen={() => updateParam('view', 'saved', { replace: false })} />}

      <SentenceStructureToolbar
        query={query}
        cefr={cefrFilter}
        category={categoryFilter}
        status={statusFilter}
        resultCount={total}
        historyCount={history.length}
        onQueryChange={value => { setQuery(value); setPage(0) }}
        onCefrChange={value => updateParam('cefr', value)}
        onCategoryChange={value => updateParam('category', value)}
        onStatusChange={value => updateParam('status', value)}
      />

      {error && <div className="ss-library-error" role="alert">{error}</div>}

      <div className="ss-hub-groups">
        {groupedPageItems.map(([level, categoryGroups]) => (
          <section className="ss-hub-group" key={level}>
            <header className="ss-hub-group-head">
              <h2>{level === 'unassigned' ? 'Chưa gán CEFR' : CEFR_LABELS[level as CefrLevel]}</h2>
              <span>{categoryGroups.reduce((sum, [, categoryItems]) => sum + categoryItems.length, 0)}</span>
            </header>
            {categoryGroups.map(([category, categoryItems]) => (
              <div className="ss-hub-category" key={category}>
                <div className="ss-hub-category-head"><span>{category}</span><b>{categoryItems.length}</b></div>
                <div className="ss-hub-list" role="list">
                  {categoryItems.map(item => (
                    <StructureRow
                      key={item.id}
                      item={item}
                      onOpen={() => navigate(`/app/sentence-structure/${item.id}`)}
                      onStatusChange={status => updateStatus(item.id, status)}
                      onToggleStar={() => toggleStar(item.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
        {total === 0 && (savedOnly && !query.trim() && !cefrFilter && !categoryFilter && !statusFilter
          ? <EmptySavedStructures />
          : <p className="ss-hub-empty ss-hub-empty--grouped">Không tìm thấy cấu trúc phù hợp</p>)}
      </div>

      {totalPages > 1 && (
        <footer className="ss-hub-pagination">
          <button type="button" className="ss-hub-page-btn" disabled={safePage <= 0} onClick={() => setPage(value => Math.max(0, value - 1))} aria-label="Trang trước">
            <ChevronLeft size={16} />
          </button>
          <span className="ss-hub-page-info">
            {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, total)} / {total.toLocaleString('vi-VN')}
            <span className="ss-hub-page-num"> · Trang {safePage + 1}/{totalPages}</span>
          </span>
          <button type="button" className="ss-hub-page-btn" disabled={safePage >= totalPages - 1} onClick={() => setPage(value => Math.min(totalPages - 1, value + 1))} aria-label="Trang sau">
            <ChevronRight size={16} />
          </button>
        </footer>
      )}
    </div>
  )
}

function StructureRow({
  item,
  onOpen,
  onStatusChange,
  onToggleStar,
}: {
  item: SentenceStructure
  onOpen: () => void
  onStatusChange: (status: LearningStatus) => Promise<void>
  onToggleStar: () => Promise<void>
}) {
  const cefr = item.cefr as CefrLevel | undefined
  const badge = cefr ? cefrBadgeStyle(cefr) : null

  return (
    <div className={`ss-hub-row${cefr ? ` ss-hub-row--${cefr.toLowerCase()}` : ''}`} role="listitem">
      <button type="button" className="ss-hub-row-main" onClick={onOpen}>
        <div className="ss-hub-row-top">
          <h2 className="ss-hub-row-title">{item.title}</h2>
          {cefr && badge && <span className="ss-cefr-badge" style={{ background: badge.bg, color: badge.color }}>{cefr}</span>}
        </div>
        <p className="ss-hub-row-template">{item.template}</p>
        {item.description && <p className="ss-hub-row-desc">{item.description}</p>}
        <span className="ss-cat-tag"><Tag size={12} /> {categoryMeta(item.category).label}</span>
      </button>
      <div className="ss-hub-row-actions">
        <LearningStatusChip status={getLearningStatus(item)} onChange={onStatusChange} />
        <button
          type="button"
          className={`ss-hub-star${item.starred ? ' is-starred' : ''}`}
          aria-label={item.starred ? `Bỏ lưu ${item.title}` : `Lưu ${item.title}`}
          title={item.starred ? 'Bỏ đánh dấu' : 'Đánh dấu'}
          onClick={() => void onToggleStar()}
        >
          <Star size={16} fill={item.starred ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  )
}
