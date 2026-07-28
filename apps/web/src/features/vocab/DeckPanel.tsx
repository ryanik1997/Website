import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, BookOpen, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { isSrsReviewDue } from '@ryan/core'
import { db, deckRepo } from '@ryan/db'
import type { Deck } from '@ryan/db'
import PanelHeader from '../../components/PanelHeader'
import PanelEmpty from '../../components/PanelEmpty'
import { useVocabStore } from './vocabStore'
import DeckEditorModal from './DeckEditorModal'

export default function DeckPanel() {
  const decks = useLiveQuery(() => db.decks.orderBy('updatedAt').reverse().toArray(), [])
  const { activeDeckId, setActiveDeck } = useVocabStore()
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div
      className="w-60 flex flex-col shrink-0 border-r"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <PanelHeader
        title="Bộ thẻ"
        subtitle={decks?.length ? `${decks.length} bộ thẻ` : undefined}
        actions={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ color: 'var(--color-primary)' }}
            title="Tạo bộ thẻ mới"
          >
            <Plus size={16} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-2">
        {!decks?.length ? (
          <PanelEmpty
            icon={BookOpen}
            message="Chưa có bộ thẻ nào"
            action={{ label: '+ Tạo bộ thẻ', onClick: () => setShowCreate(true) }}
          />
        ) : (
          decks.map(deck => (
            <DeckItem
              key={deck.id}
              deck={deck}
              active={deck.id === activeDeckId}
              onSelect={() => setActiveDeck(deck.id)}
              onDelete={async () => {
                if (deck.origin === 'preset') {
                  alert('Bộ thẻ mặc định của app không thể xóa.')
                  return
                }
                if (!confirm(`Xóa bộ thẻ "${deck.name}"? Tất cả từ sẽ bị xóa.`)) return
                await deckRepo.delete(deck.id)
                if (activeDeckId === deck.id) setActiveDeck(null)
              }}
            />
          ))
        )}
      </div>

      {showCreate && <DeckEditorModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

function DeckItem({
  deck, active, onSelect, onDelete,
}: {
  deck: Deck; active: boolean; onSelect: () => void; onDelete: () => void
}) {
  const count = useLiveQuery(() => db.cards.where('deckId').equals(deck.id).count(), [deck.id]) ?? 0
  const due = useLiveQuery(async () => {
    const t = Date.now()
    const rows = await db.srs.where('deckId').equals(deck.id).and(s => s.dueAt <= t).toArray()
    // Chỉ thẻ đã ôn + đến hạn (không đếm seed "new")
    return rows.filter(s => isSrsReviewDue(s, t)).length
  }, [deck.id]) ?? 0
  const canDelete = deck.origin !== 'preset'

  return (
    <div
      className="group flex items-center rounded-lg mb-0.5 transition-colors"
      style={{ background: active ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'transparent' }}
    >
      <button
        onClick={onSelect}
        className="flex-1 text-left px-3 py-2.5 min-w-0"
      >
        <p
          className="text-sm font-medium truncate"
          style={{ color: active ? 'var(--color-primary)' : 'var(--text-primary)' }}
        >
          {deck.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: active ? 'var(--color-primary)' : 'var(--text-muted)' }}>
            {count} từ
          </span>
          {due > 0 && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: '#f9731622', color: '#f97316' }}
            >
              {due} ôn
            </span>
          )}
        </div>
      </button>
      {canDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="mr-1 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ef444422]"
          style={{ color: 'var(--text-muted)' }}
          title="Xóa bộ thẻ"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  )
}
