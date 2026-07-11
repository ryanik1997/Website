import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { db, deckRepo } from '@ryan/db'
import type { Deck } from '@ryan/db'
import { GROUP_LABELS, PRESET_GROUP_IDS, type PresetGroupId } from './vocabSeedDecks'
import './deckCards.css'

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'ielts', label: 'IELTS' },
  { id: 'oxford', label: 'Oxford' },
  { id: 'toeic', label: 'TOEIC' },
  { id: 'academic', label: 'Học thuật' },
  { id: 'sat', label: 'SAT' },
  { id: 'toefl', label: 'TOEFL' },
  { id: 'default', label: 'Của tôi' },
] as const

type FilterId = (typeof FILTERS)[number]['id']

function isPresetGroup(id: string): id is PresetGroupId {
  return (PRESET_GROUP_IDS as readonly string[]).includes(id)
}

interface Props {
  onSelectDeck: (id: string) => void
  onCreateDeck: (defaultGroupId?: string) => void
}

export default function DeckGrid({ onSelectDeck, onCreateDeck }: Props) {
  const decks = useLiveQuery(() => db.decks.toArray(), []) ?? []
  const [filter, setFilter] = useState<FilterId>('all')

  const presetDecks = useMemo(
    () => decks.filter(d => isPresetGroup(d.groupId)),
    [decks],
  )
  const userDefaultDecks = useMemo(() => decks.filter(d => d.groupId === 'default'), [decks])
  const personalDeck = userDefaultDecks[0] ?? null

  const counts = useMemo(() => {
    const byGroup = Object.fromEntries(
      PRESET_GROUP_IDS.map(id => [id, decks.filter(d => d.groupId === id).length]),
    ) as Record<PresetGroupId, number>
    return {
      all: decks.length,
      ...byGroup,
      default: userDefaultDecks.length,
    } satisfies Record<FilterId, number>
  }, [decks, userDefaultDecks.length])

  const filteredDecks = useMemo(() => {
    if (filter === 'default') {
      return userDefaultDecks.filter(d => d.id !== personalDeck?.id)
    }
    if (filter === 'all') {
      return decks.filter(d => d.id !== personalDeck?.id)
    }
    if (isPresetGroup(filter)) {
      return decks.filter(d => d.groupId === filter)
    }
    return presetDecks
  }, [filter, decks, presetDecks, userDefaultDecks, personalDeck?.id])

  const createDefaultGroup = filter !== 'all' ? filter : undefined

  async function handleDeleteDeck(deck: Deck) {
    if (deck.origin === 'preset') return
    if (!confirm(`Xóa bộ thẻ "${deck.name}"? Tất cả từ trong bộ này sẽ bị xóa.`)) return
    try {
      await deckRepo.delete(deck.id)
    } catch (err) {
      console.error(err)
      alert('Không thể xóa bộ thẻ này.')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={{
                background: active ? 'var(--color-primary)' : 'var(--bg-card)',
                color: active ? 'var(--color-on-primary, #fff)' : 'var(--text-muted)',
                border: active ? 'none' : '1px solid var(--border-color)',
              }}
            >
              {f.label}
              <span className="ml-1.5 opacity-80">· {counts[f.id]}</span>
            </button>
          )
        })}
      </div>

      <div className="vocab-deck-grid">
        <PersonalDeckCard
          deck={personalDeck}
          onSelect={() => (personalDeck ? onSelectDeck(personalDeck.id) : onCreateDeck('default'))}
          onCreate={() => onCreateDeck(createDefaultGroup)}
        />

        {filteredDecks.map(deck => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onSelect={() => onSelectDeck(deck.id)}
            onDelete={() => handleDeleteDeck(deck)}
          />
        ))}
      </div>
    </div>
  )
}

function deckGroupLabel(groupId: string): string {
  if (isPresetGroup(groupId)) return GROUP_LABELS[groupId]
  if (groupId === 'default') return 'Của tôi'
  return groupId
}

function DeckCardLayers() {
  return (
    <>
      <div className="vocab-deck-card__surface" aria-hidden />
      <div className="vocab-deck-card__orb vocab-deck-card__orb--a" aria-hidden />
      <div className="vocab-deck-card__orb vocab-deck-card__orb--b" aria-hidden />
      <div className="vocab-deck-card__sheen" aria-hidden />
      <div className="vocab-deck-card__grain" aria-hidden />
    </>
  )
}

function DeckCard({
  deck,
  onSelect,
  onDelete,
}: {
  deck: Deck
  onSelect: () => void
  onDelete: () => void
}) {
  const cardCount = useLiveQuery(() => db.cards.where('deckId').equals(deck.id).count(), [deck.id]) ?? 0
  const masteredCount = useLiveQuery(
    () => db.srs.where('deckId').equals(deck.id).and(s => s.reps >= 3).count(),
    [deck.id],
  ) ?? 0
  const pct = cardCount > 0 ? Math.round((masteredCount / cardCount) * 100) : 0
  const color = deck.color ?? '#6366f1'
  const canDelete = deck.origin !== 'preset'
  const blurb = (deck.description ?? deck.book ?? '').trim()
  const icon = deck.icon?.trim() || (deck.origin === 'user' ? '📚' : '📖')

  return (
    <div
      className="vocab-deck-card group"
      style={{ ['--deck-accent' as string]: color }}
    >
      <DeckCardLayers />
      <button type="button" onClick={onSelect} className="vocab-deck-card__hit">
        <span className="vocab-deck-card__icon" aria-hidden>
          {icon}
        </span>
        <div className="vocab-deck-card__body">
          <p className="vocab-deck-card__meta">
            {deckGroupLabel(deck.groupId)} · {cardCount} từ
            {deck.origin === 'user' ? ' · Của tôi' : ''}
          </p>
          <h3 className="vocab-deck-card__title">{deck.name}</h3>
          {blurb ? <p className="vocab-deck-card__desc">{blurb}</p> : null}
          <div className="vocab-deck-card__progress">
            <div className="vocab-deck-card__track" aria-hidden>
              <div className="vocab-deck-card__fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="vocab-deck-card__pct">{pct}% thuộc</span>
          </div>
        </div>
      </button>
      {canDelete && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            onDelete()
          }}
          className="vocab-deck-card__delete"
          title="Xóa bộ thẻ"
          aria-label="Xóa bộ thẻ"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

function PersonalDeckCard({
  deck,
  onSelect,
  onCreate,
}: {
  deck: Deck | null
  onSelect: () => void
  onCreate: () => void
}) {
  const cardCount = useLiveQuery(
    () => (deck ? db.cards.where('deckId').equals(deck.id).count() : 0),
    [deck?.id],
  ) ?? 0
  const masteredCount = useLiveQuery(
    () => (deck ? db.srs.where('deckId').equals(deck.id).and(s => s.reps >= 3).count() : 0),
    [deck?.id],
  ) ?? 0
  const pct = cardCount > 0 ? Math.round((masteredCount / cardCount) * 100) : 0

  return (
    <div className="vocab-deck-card vocab-deck-card--personal">
      <div className="vocab-deck-card__hit" style={{ cursor: 'default' }}>
        <span className="vocab-deck-card__icon" aria-hidden>
          <Pencil size={18} strokeWidth={2} />
        </span>
        <div className="vocab-deck-card__body">
          <p className="vocab-deck-card__meta">Của bản thân · {cardCount} từ</p>
          <h3 className="vocab-deck-card__title">Bộ từ của bản thân</h3>
          <p className="vocab-deck-card__desc">
            Tự thêm và ôn tập từ vựng của riêng bạn.
          </p>
          {deck && cardCount > 0 && (
            <div className="vocab-deck-card__progress">
              <div className="vocab-deck-card__track" aria-hidden>
                <div className="vocab-deck-card__fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="vocab-deck-card__pct">{pct}% thuộc</span>
            </div>
          )}
          <div className="vocab-deck-card__actions">
            <button type="button" className="vocab-deck-card__btn vocab-deck-card__btn--primary" onClick={onCreate}>
              <Plus size={14} />
              Thêm từ của bạn
            </button>
            {deck && (
              <button type="button" className="vocab-deck-card__btn vocab-deck-card__btn--ghost" onClick={onSelect}>
                Mở bộ thẻ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
