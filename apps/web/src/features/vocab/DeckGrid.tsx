import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil, Plus } from 'lucide-react'
import { db } from '@ryan/db'
import type { Deck } from '@ryan/db'
import { GROUP_LABELS, PRESET_GROUP_IDS, type PresetGroupId } from './vocabSeedDecks'

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
  onCreateDeck: () => void
}

export default function DeckGrid({ onSelectDeck, onCreateDeck }: Props) {
  const decks = useLiveQuery(() => db.decks.toArray(), []) ?? []
  const [filter, setFilter] = useState<FilterId>('all')

  const presetDecks = useMemo(
    () => decks.filter(d => isPresetGroup(d.groupId)),
    [decks],
  )
  const userDecks = useMemo(() => decks.filter(d => d.groupId === 'default'), [decks])
  const personalDeck = userDecks[0] ?? null

  const counts = useMemo(() => {
    const byGroup = Object.fromEntries(
      PRESET_GROUP_IDS.map(id => [id, decks.filter(d => d.groupId === id).length]),
    ) as Record<PresetGroupId, number>
    return {
      all: presetDecks.length + userDecks.length,
      ...byGroup,
      default: userDecks.length,
    } satisfies Record<FilterId, number>
  }, [decks, presetDecks.length, userDecks.length])

  const filteredDecks = useMemo(() => {
    if (filter === 'default') {
      return userDecks.filter(d => d.id !== personalDeck?.id)
    }
    if (filter === 'all') return presetDecks
    if (isPresetGroup(filter)) {
      return decks.filter(d => d.groupId === filter)
    }
    return presetDecks
  }, [filter, decks, presetDecks, userDecks, personalDeck?.id])

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
                color: active ? 'var(--bg-primary)' : 'var(--text-muted)',
                border: active ? 'none' : '1px solid var(--border-color)',
              }}
            >
              {f.label}
              <span className="ml-1.5 opacity-80">· {counts[f.id]}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <PersonalDeckCard
          deck={personalDeck}
          onSelect={() => personalDeck ? onSelectDeck(personalDeck.id) : onCreateDeck()}
          onCreate={onCreateDeck}
        />

        {filteredDecks.map(deck => (
          <DeckCard key={deck.id} deck={deck} onSelect={() => onSelectDeck(deck.id)} />
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

function DeckCard({ deck, onSelect }: { deck: Deck; onSelect: () => void }) {
  const cardCount = useLiveQuery(() => db.cards.where('deckId').equals(deck.id).count(), [deck.id]) ?? 0
  const masteredCount = useLiveQuery(
    () => db.srs.where('deckId').equals(deck.id).and(s => s.reps >= 3).count(),
    [deck.id],
  ) ?? 0
  const pct = cardCount > 0 ? Math.round((masteredCount / cardCount) * 100) : 0
  const color = deck.color ?? 'var(--color-primary)'

  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative rounded-2xl p-5 text-left overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0 w-full"
      style={{ background: color, minHeight: '160px' }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {deck.icon && (
        <div className="absolute top-4 right-4 text-2xl opacity-80">
          {deck.icon}
        </div>
      )}

      <div className="relative z-10">
        <p className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">
          {deckGroupLabel(deck.groupId)} · {cardCount} từ
        </p>
        <h3 className="text-lg font-bold text-white mb-1 leading-snug">
          {deck.name}
        </h3>
        {deck.book && (
          <p className="text-xs text-white/70 mb-3 line-clamp-2">{deck.book}</p>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-white/30">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-white/80">{pct}% thuộc</span>
        </div>
      </div>
    </button>
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
    <div
      className="relative rounded-2xl p-5 text-left overflow-hidden w-full flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: '2px dashed var(--border-color)',
        minHeight: '160px',
      }}
    >
      <div className="absolute top-4 right-4 opacity-60" style={{ color: 'var(--text-muted)' }}>
        <Pencil size={20} />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Của bản thân · {cardCount} từ
        </p>
        <h3 className="text-lg font-bold mb-1 leading-snug" style={{ color: 'var(--text-primary)' }}>
          Bộ từ của bản thân
        </h3>
        <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
          Tự thêm và ôn tập từ vựng của riêng bạn.
        </p>

        {deck && cardCount > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--bg-secondary)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: 'var(--color-primary)' }}
              />
            </div>
            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
              {pct}% thuộc
            </span>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
          >
            <Plus size={14} />
            Thêm từ của bạn
          </button>
          {deck && (
            <button
              type="button"
              onClick={onSelect}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              }}
            >
              Mở bộ thẻ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}