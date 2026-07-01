import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, PenLine, Trash2, ImageIcon, Pencil, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { db, writingRepo } from '@ryan/db'
import type { WritingDoc, WritingGenre } from '@ryan/db'
import { useWritingStore } from './writingStore'
import NewDocModal from './NewDocModal'
import EditWritingPromptModal from './EditWritingPromptModal'
import PanelHeader from '../../components/PanelHeader'
import PanelEmpty from '../../components/PanelEmpty'
import { docMatchesGenre } from './cambridgeCatalog'
import {
  IELTS_DOC_TYPE_OPTIONS,
  TYPE_LABEL,
  type DocTypeOption,
} from './writingTypes'

export default function DocListPanel({
  filterTypes,
  filterGenre,
  filterDoc,
  docTypeOptions = IELTS_DOC_TYPE_OPTIONS,
  panelTitle = 'Bài viết',
  createTitle = 'Tạo bài viết mới',
  emptyMessage = 'Chưa có bài viết nào',
  showSearch = false,
  fixedType,
  fixedGenre,
}: {
  filterTypes?: WritingDoc['type'][]
  filterGenre?: WritingGenre
  filterDoc?: (doc: WritingDoc) => boolean
  docTypeOptions?: DocTypeOption[]
  panelTitle?: string
  createTitle?: string
  emptyMessage?: string
  showSearch?: boolean
  fixedType?: WritingDoc['type']
  fixedGenre?: WritingGenre
}) {
  const [query, setQuery] = useState('')
  const filterKey = `${filterTypes?.join(',') ?? 'all'}:${filterGenre ?? ''}:${filterDoc ? '1' : '0'}`
  const docs = useLiveQuery(async () => {
    const all = await db.writingDocs.orderBy('updatedAt').reverse().toArray()
    let list = all
    if (filterTypes?.length) list = list.filter(d => filterTypes.includes(d.type))
    if (filterDoc) list = list.filter(filterDoc)
    else if (filterGenre) list = list.filter(d => docMatchesGenre(d, filterGenre))
    return list
  }, [filterKey])

  const visibleDocs = useMemo(() => {
    if (!docs) return docs
    const q = query.trim().toLowerCase()
    if (!q) return docs
    return docs.filter(d => d.prompt.toLowerCase().includes(q) || d.text.toLowerCase().includes(q))
  }, [docs, query])
  const { activeDocId, setActiveDoc, clearGuide, guideDocId } = useWritingStore()
  const [showCreate, setShowCreate] = useState(false)
  const [editPromptId, setEditPromptId] = useState<string | null>(null)
  const editDoc = useLiveQuery(
    () => editPromptId ? db.writingDocs.get(editPromptId) : undefined,
    [editPromptId],
  )

  useEffect(() => {
    if (!visibleDocs?.length) return
    const activeInList = activeDocId != null && visibleDocs.some(d => d.id === activeDocId)
    if (!activeInList) setActiveDoc(visibleDocs[0].id)
  }, [visibleDocs, activeDocId, setActiveDoc])

  return (
    <div
      className="w-60 flex flex-col shrink-0 border-r"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <PanelHeader
        title={panelTitle}
        subtitle={visibleDocs ? `${visibleDocs.length} bài` : undefined}
        actions={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ color: 'var(--color-primary)' }}
            title="Tạo bài viết mới"
          >
            <Plus size={16} />
          </button>
        }
      />

      {showSearch && (
        <div className="px-3 pb-2">
          <label className="relative block">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm đề bài…"
              className="w-full pl-8 pr-3 py-2 rounded-lg text-xs border outline-none"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </label>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {!visibleDocs?.length ? (
          <PanelEmpty
            icon={PenLine}
            message={query.trim() ? 'Không tìm thấy bài phù hợp' : emptyMessage}
            action={{ label: '+ Tạo bài viết', onClick: () => setShowCreate(true) }}
          />
        ) : (
          visibleDocs.map(doc => (
            <DocItem
              key={doc.id}
              doc={doc}
              active={doc.id === activeDocId}
              onSelect={() => setActiveDoc(doc.id)}
              onDelete={async () => {
                if (!confirm('Xóa bài viết này? Lịch sử chấm điểm cũng sẽ bị xóa.')) return
                await writingRepo.deleteDoc(doc.id)
                if (activeDocId === doc.id) setActiveDoc(null)
                if (guideDocId === doc.id) clearGuide()
              }}
              onEditPrompt={() => setEditPromptId(doc.id)}
            />
          ))
        )}
      </div>

      {showCreate && (
        <NewDocModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => setActiveDoc(id)}
          docTypeOptions={docTypeOptions}
          title={createTitle}
          fixedType={fixedType}
          fixedGenre={fixedGenre}
        />
      )}

      {editPromptId && editDoc && (
        <EditWritingPromptModal
          initialPrompt={editDoc.prompt}
          onClose={() => setEditPromptId(null)}
          onSave={async (prompt) => {
            await writingRepo.updateDoc(editPromptId, { prompt })
            setEditPromptId(null)
          }}
        />
      )}
    </div>
  )
}

function DocItem({
  doc, active, onSelect, onDelete, onEditPrompt,
}: {
  doc: WritingDoc
  active: boolean
  onSelect: () => void
  onDelete: () => void
  onEditPrompt: () => void
}) {
  const wordCount = doc.text.trim() ? doc.text.trim().split(/\s+/).length : 0
  const typeInfo = TYPE_LABEL[doc.type] ?? { label: doc.type, color: 'var(--text-muted)' }
  const preview = doc.prompt?.trim().slice(0, 36) || 'Bài viết mới'

  return (
    <div
      className="group flex items-center rounded-lg mb-0.5 transition-colors"
      style={{ background: active ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'transparent' }}
    >
      <div className="flex-1 min-w-0 px-3 py-2.5">
        <div className="flex items-center gap-1 min-w-0">
          <button
            type="button"
            onClick={onSelect}
            className="text-sm font-medium truncate flex-1 min-w-0 text-left"
            style={{ color: active ? 'var(--color-primary)' : 'var(--text-primary)' }}
          >
            {preview}{doc.prompt?.length > 36 ? '…' : ''}
          </button>
          <button
            type="button"
            onClick={onEditPrompt}
            className="p-1 rounded shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: active ? 'var(--color-primary)' : 'var(--text-muted)' }}
            title="Sửa đề bài"
          >
            <Pencil size={11} />
          </button>
        </div>
        <button type="button" onClick={onSelect} className="w-full text-left mt-0.5">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: `${typeInfo.color}22`, color: typeInfo.color }}
          >
            {typeInfo.label}
          </span>
          {doc.promptImage && (
            <span title="Có ảnh đề" className="inline-flex">
              <ImageIcon size={10} style={{ color: 'var(--text-muted)' }} aria-hidden />
            </span>
          )}
          <span className="text-xs" style={{ color: active ? 'var(--color-primary)' : 'var(--text-muted)' }}>
            {wordCount} từ
          </span>
        </div>
        </button>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="mr-1 p-1.5 rounded opacity-60 hover:opacity-100 transition-opacity hover:bg-[color-mix(in_srgb,#ef4444_12%,transparent)]"
        style={{ color: 'var(--text-muted)' }}
        title="Xóa bài viết"
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}
