import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { db, deckRepo } from '@ryan/db'
import type { Deck } from '@ryan/db'
import { GROUP_LABELS, PRESET_GROUP_IDS, type PresetGroupId } from './vocabConstants'
import { matchesUnitKind, type VocabUnitKind } from './vocabUnitKind'
import './deckCards.css'
import { useI18n } from '../../lib/language'

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

type DeckUnitStat = { count: number; mastered: number }

function isPresetGroup(id: string): id is PresetGroupId {
  return (PRESET_GROUP_IDS as readonly string[]).includes(id)
}

interface Props {
  unitKind: VocabUnitKind
  onSelectDeck: (id: string) => void
  onCreateDeck: (defaultGroupId?: string) => void
}

/**
 * Một query gộp cho toàn bộ thẻ/SRS theo unitKind — tránh N× useLiveQuery
 * (100+ deck) làm main thread treo → trang trắng/không phản hồi.
 */
function useDeckUnitStats(unitKind: VocabUnitKind): Record<string, DeckUnitStat> {
  return (
    useLiveQuery(async () => {
      const [cards, srsRows] = await Promise.all([db.cards.toArray(), db.srs.toArray()])
      const srsByCard = new Map(srsRows.map(s => [s.cardId, s]))
      const out: Record<string, DeckUnitStat> = {}
      for (const c of cards) {
        if (!matchesUnitKind(c.phrase, unitKind, c.pos)) continue
        const st = out[c.deckId] ?? (out[c.deckId] = { count: 0, mastered: 0 })
        st.count++
        const s = srsByCard.get(c.id)
        if (s && s.reps >= 3) st.mastered++
      }
      return out
    }, [unitKind]) ?? {}
  )
}

export default function DeckGrid({ unitKind, onSelectDeck, onCreateDeck }: Props) {
  const { t } = useI18n()
  const decks = useLiveQuery(() => db.decks.toArray(), []) ?? []
  const statsByDeck = useDeckUnitStats(unitKind)
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
      return userDefaultDecks
    }
    if (filter === 'all') {
      return decks
    }
    if (isPresetGroup(filter)) {
      return decks.filter(d => d.groupId === filter)
    }
    return presetDecks
  }, [filter, decks, presetDecks, userDefaultDecks])

  const createDefaultGroup = filter !== 'all' ? filter : undefined
  const personalStat = personalDeck ? statsByDeck[personalDeck.id] : undefined

  async function handleDeleteDeck(deck: Deck) {
    if (deck.origin === 'preset') return
    if (!confirm(t('vocab.deleteConfirm').replace('{name}', deck.name))) return
    try {
      await deckRepo.delete(deck.id)
    } catch (err) {
      console.error(err)
      alert(t('vocab.deleteError'))
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
              {f.id === 'all' ? t('vocab.all') : f.id === 'default' ? t('vocab.mine') : f.label}
              <span className="ml-1.5 opacity-80">· {counts[f.id]}</span>
            </button>
          )
        })}
      </div>

      <div className="vocab-deck-grid">
        <PersonalDeckCard
          deck={personalDeck}
          cardCount={personalStat?.count ?? 0}
          masteredCount={personalStat?.mastered ?? 0}
          onSelect={() => (personalDeck ? onSelectDeck(personalDeck.id) : onCreateDeck('default'))}
          onCreate={() => onCreateDeck(createDefaultGroup)}
        />

        {filteredDecks.map(deck => {
          const st = statsByDeck[deck.id]
          return (
            <DeckCard
              key={deck.id}
              deck={deck}
              unitKind={unitKind}
              cardCount={st?.count ?? 0}
              masteredCount={st?.mastered ?? 0}
              onSelect={() => onSelectDeck(deck.id)}
              onDelete={() => handleDeleteDeck(deck)}
            />
          )
        })}
      </div>
    </div>
  )
}

function deckGroupLabel(groupId: string): string {
  if (isPresetGroup(groupId)) return GROUP_LABELS[groupId]
  if (groupId === 'default') return 'My'
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
  unitKind,
  cardCount,
  masteredCount,
  onSelect,
  onDelete,
}: {
  deck: Deck
  unitKind: VocabUnitKind
  cardCount: number
  masteredCount: number
  onSelect: () => void
  onDelete: () => void
}) {
  const pct = cardCount > 0 ? Math.round((masteredCount / cardCount) * 100) : 0
  const color = deck.color ?? '#6366f1'
  const canDelete = deck.origin !== 'preset'
  const blurb = (deck.description ?? deck.book ?? '').trim()
  const icon = deck.icon?.trim() || (deck.origin === 'user' ? '📚' : '📖')
  const unitLabel = unitKind === 'phrase' ? 'cụm' : 'từ'

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
            {deckGroupLabel(deck.groupId)} · {cardCount} {unitLabel}
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
  cardCount,
  masteredCount,
  onSelect,
  onCreate,
}: {
  deck: Deck | null
  cardCount: number
  masteredCount: number
  onSelect: () => void
  onCreate: () => void
}) {
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
