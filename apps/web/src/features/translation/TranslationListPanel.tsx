import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Languages, Trash2, Pencil, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { db, translationRepo } from '@ryan/db'
import type { TranslationSet } from '@ryan/db'
import { useTranslationStore } from './translationStore'
import { CATEGORY_LABELS, countDue } from './types'
import { setMatchesTrackGenre, type TranslationGenre, type TranslationTrack } from './translationCatalog'
import NewSetModal from './NewSetModal'
import PanelHeader from '../../components/PanelHeader'
import PanelEmpty from '../../components/PanelEmpty'

export default function TranslationListPanel({
  filterTrack,
  filterGenre,
  filterSet,
  panelTitle = 'Bộ câu',
  createTitle = 'Tạo bộ câu mới',
  emptyMessage = 'Chưa có bộ câu nào',
  showSearch = false,
  fixedCategory,
  fixedGenre,
}: {
  filterTrack?: TranslationTrack
  filterGenre?: TranslationGenre
  filterSet?: (set: TranslationSet) => boolean
  panelTitle?: string
  createTitle?: string
  emptyMessage?: string
  showSearch?: boolean
  fixedCategory?: TranslationSet['category']
  fixedGenre?: TranslationGenre
}) {
  const { activeSetId, setActiveSetId } = useTranslationStore()
  const [showCreate, setShowCreate] = useState(false)
  const [query, setQuery] = useState('')

  const filterKey = `${filterTrack?.slug ?? 'all'}:${filterGenre ?? ''}:${filterSet ? '1' : '0'}`
  const sets = useLiveQuery(async () => {
    const all = await db.translationSets.orderBy('createdAt').reverse().toArray()
    let list = all
    if (filterTrack) list = list.filter(s => s.category === filterTrack.category)
    if (filterSet) list = list.filter(filterSet)
    else if (filterTrack && filterGenre) {
      list = list.filter(s => setMatchesTrackGenre(s, filterTrack, filterGenre))
    }
    return list
  }, [filterKey])

  const visibleSets = useMemo(() => {
    if (!sets) return sets
    const q = query.trim().toLowerCase()
    if (!q) return sets
    return sets.filter(s => s.title.toLowerCase().includes(q))
  }, [sets, query])

  useEffect(() => {
    if (!visibleSets?.length) return
    const activeInList = activeSetId != null && visibleSets.some(s => s.id === activeSetId)
    if (!activeInList) setActiveSetId(visibleSets[0].id)
  }, [visibleSets, activeSetId, setActiveSetId])

  return (
    <div
      className="w-60 flex flex-col shrink-0 border-r"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <PanelHeader
        title={panelTitle}
        subtitle={visibleSets ? `${visibleSets.length} bộ` : undefined}
        actions={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ color: 'var(--color-primary)' }}
            title={createTitle}
          >
            <Plus size={16} />
          </button>
        }
      />

      {showSearch && (
        <div className="px-3 pb-2">
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
          >
            <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm bộ câu…"
              className="flex-1 min-w-0 bg-transparent outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {!visibleSets?.length ? (
          <PanelEmpty
            icon={Languages}
            message={emptyMessage}
            action={{ label: '+ Tạo bộ câu', onClick: () => setShowCreate(true) }}
          />
        ) : (
          visibleSets.map(set => (
            <SetItem
              key={set.id}
              set={set}
              active={set.id === activeSetId}
              onSelect={() => setActiveSetId(set.id)}
              onDelete={async () => {
                if (!confirm(`Xóa bộ "${set.title}"?`)) return
                await translationRepo.delete(set.id)
                if (activeSetId === set.id) setActiveSetId(null)
              }}
              canDelete={set.category === 'user'}
            />
          ))
        )}
      </div>

      {showCreate && (
        <NewSetModal
          fixedCategory={fixedCategory}
          fixedGenre={fixedGenre}
          title={createTitle}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}

function SetItem({
  set, active, onSelect, onDelete, canDelete,
}: {
  set: TranslationSet
  active: boolean
  onSelect: () => void
  onDelete: () => void
  canDelete: boolean
}) {
  const due = countDue(set.sentences)
  const [renaming, setRenaming] = useState(false)
  const [draftTitle, setDraftTitle] = useState(set.title)

  useEffect(() => {
    if (!renaming) setDraftTitle(set.title)
  }, [set.title, renaming])

  async function saveTitle() {
    const next = draftTitle.trim()
    if (!next) {
      setDraftTitle(set.title)
      setRenaming(false)
      return
    }
    if (next !== set.title) await translationRepo.updateTitle(set.id, next)
    setRenaming(false)
  }

  return (
    <div
      className="group flex items-center rounded-lg mb-0.5 transition-colors"
      style={{ background: active ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'transparent' }}
    >
      <div className="flex-1 min-w-0 px-3 py-2.5">
        {renaming ? (
          <input
            autoFocus
            value={draftTitle}
            onChange={e => setDraftTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') void saveTitle()
              if (e.key === 'Escape') {
                setDraftTitle(set.title)
                setRenaming(false)
              }
            }}
            onBlur={() => void saveTitle()}
            className="w-full px-2 py-0.5 rounded text-sm border outline-none"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--color-primary)',
              color: 'var(--text-primary)',
            }}
          />
        ) : (
          <div className="flex items-center gap-1 min-w-0">
            <button
              type="button"
              onClick={onSelect}
              className="text-sm font-medium truncate flex-1 min-w-0 text-left"
              style={{ color: active ? 'var(--color-primary)' : 'var(--text-primary)' }}
            >
              {set.title}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftTitle(set.title)
                setRenaming(true)
              }}
              className="p-1 rounded shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: active ? 'var(--color-primary)' : 'var(--text-muted)' }}
              title="Đổi tên chủ đề"
            >
              <Pencil size={11} />
            </button>
          </div>
        )}
        <button type="button" onClick={onSelect} className="w-full text-left mt-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                background: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
                color: 'var(--color-accent)',
              }}
            >
              {CATEGORY_LABELS[set.category]}
            </span>
            <span className="text-xs" style={{ color: active ? 'var(--color-primary)' : 'var(--text-muted)' }}>
              {set.sentences.length} câu
            </span>
            {due > 0 && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  background: 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
                  color: 'var(--color-primary)',
                }}
              >
                {due} ôn
              </span>
            )}
          </div>
        </button>
      </div>
      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="mr-1 p-1.5 rounded opacity-60 hover:opacity-100 transition-opacity hover:bg-[color-mix(in_srgb,#ef4444_12%,transparent)]"
          style={{ color: 'var(--text-muted)' }}
          title="Xóa bộ câu"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  )
}