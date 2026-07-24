import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { db, deckRepo } from '@ryan/db'
import type { Deck } from '@ryan/db'
import { GROUP_LABELS, PRESET_GROUP_IDS, type PresetGroupId } from './vocabConstants'
import type { VocabUnitKind } from './vocabUnitKind'
import type { DeckAggregate } from './hooks/useDeckAggregates'
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

function isPresetGroup(id: string): id is PresetGroupId {
  return (PRESET_GROUP_IDS as readonly string[]).includes(id)
}

interface Props {
  unitKind: VocabUnitKind
  statsMap: Map<string, DeckAggregate>
  scrollElementRef: RefObject<HTMLDivElement>
  onSelectDeck: (id: string) => void
  onCreateDeck: (defaultGroupId?: string) => void
}

type GridItem =
  | { kind: 'personal' }
  | { kind: 'deck'; deck: Deck }

function getColumnCount() {
  return typeof window !== 'undefined' && window.matchMedia?.('(min-width: 700px)').matches
    ? 2
    : 1
}

export default function DeckGrid({
  unitKind,
  statsMap,
  scrollElementRef,
  onSelectDeck,
  onCreateDeck,
}: Props) {
  const { t } = useI18n()
  const decks = useLiveQuery(() => db.decks.toArray(), []) ?? []
  const [filter, setFilter] = useState<FilterId>('all')
  const [columnCount, setColumnCount] = useState(getColumnCount)
  const [scrollMargin, setScrollMargin] = useState(0)
  const virtualListRef = useRef<HTMLDivElement>(null)
  const previousFilterRef = useRef(filter)

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
  const personalStat = personalDeck ? statsMap.get(personalDeck.id) : undefined
  const gridItems = useMemo<GridItem[]>(
    () => [{ kind: 'personal' }, ...filteredDecks.map(deck => ({ kind: 'deck' as const, deck }))],
    [filteredDecks],
  )

  const virtualizer = useVirtualizer({
    count: gridItems.length,
    getScrollElement: () => scrollElementRef.current,
    getItemKey: index => {
      const item = gridItems[index]
      return item?.kind === 'deck' ? `deck-${item.deck.id}` : 'personal-deck'
    },
    estimateSize: () => 184,
    gap: 16,
    lanes: columnCount,
    overscan: 5,
    scrollMargin,
  })

  useEffect(() => {
    const media = window.matchMedia?.('(min-width: 700px)')
    if (!media) return
    const update = () => setColumnCount(media.matches ? 2 : 1)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useLayoutEffect(() => {
    const scrollElement = scrollElementRef.current
    const virtualList = virtualListRef.current
    if (!scrollElement || !virtualList) return

    const update = () => {
      const scrollRect = scrollElement.getBoundingClientRect()
      const listRect = virtualList.getBoundingClientRect()
      const nextMargin = listRect.top - scrollRect.top + scrollElement.scrollTop
      setScrollMargin(current => (Math.abs(current - nextMargin) < 0.5 ? current : nextMargin))
    }

    update()
    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(scrollElement)
    if (virtualList.parentElement) resizeObserver.observe(virtualList.parentElement)
    window.addEventListener('resize', update)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [scrollElementRef])

  useLayoutEffect(() => {
    const scrollElement = scrollElementRef.current
    if (previousFilterRef.current !== filter && scrollElement && scrollElement.scrollTop > scrollMargin) {
      scrollElement.scrollTo({ top: scrollMargin, behavior: 'auto' })
    }
    previousFilterRef.current = filter
  }, [filter, scrollElementRef, scrollMargin])

  useLayoutEffect(() => {
    virtualizer.measure()
  }, [columnCount, virtualizer])

  const handleDeleteDeck = useCallback(async (deck: Deck) => {
    if (deck.origin === 'preset') return
    if (!confirm(t('vocab.deleteConfirm').replace('{name}', deck.name))) return
    try {
      await deckRepo.delete(deck.id)
    } catch (err) {
      console.error(err)
      alert(t('vocab.deleteError'))
    }
  }, [t])
  const handlePersonalSelect = useCallback(
    () => (personalDeck ? onSelectDeck(personalDeck.id) : onCreateDeck('default')),
    [onCreateDeck, onSelectDeck, personalDeck],
  )
  const handlePersonalCreate = useCallback(
    () => onCreateDeck(createDefaultGroup),
    [createDefaultGroup, onCreateDeck],
  )

  return (
    <div>
      <div className="vocab-library-filters flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className="vocab-library-filter px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
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

      <div
        ref={virtualListRef}
        className="vocab-deck-virtual-list"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => {
          const item = gridItems[virtualItem.index]
          if (!item) return null
          const width = columnCount === 1 ? '100%' : 'calc((100% - 1rem) / 2)'
          const left = columnCount === 1 || virtualItem.lane === 0
            ? '0'
            : 'calc(50% + 0.5rem)'

          return (
            <div
              key={virtualItem.key}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              className="vocab-deck-grid-item"
              style={{
                left,
                width,
                transform: `translateY(${virtualItem.start - scrollMargin}px)`,
              }}
            >
              {item.kind === 'personal' ? (
                <PersonalDeckCard
                  deck={personalDeck}
                  cardCount={personalStat?.total ?? 0}
                  masteredCount={personalStat?.mastered ?? 0}
                  onSelect={handlePersonalSelect}
                  onCreate={handlePersonalCreate}
                />
              ) : (
                <DeckCard
                  deck={item.deck}
                  unitKind={unitKind}
                  cardCount={statsMap.get(item.deck.id)?.total ?? 0}
                  masteredCount={statsMap.get(item.deck.id)?.mastered ?? 0}
                  onSelectDeck={onSelectDeck}
                  onDeleteDeck={handleDeleteDeck}
                />
              )}
            </div>
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

const DeckCard = memo(function DeckCard({
  deck,
  unitKind,
  cardCount,
  masteredCount,
  onSelectDeck,
  onDeleteDeck,
}: {
  deck: Deck
  unitKind: VocabUnitKind
  cardCount: number
  masteredCount: number
  onSelectDeck: (id: string) => void
  onDeleteDeck: (deck: Deck) => void
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
      <button type="button" onClick={() => onSelectDeck(deck.id)} className="vocab-deck-card__hit">
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
            onDeleteDeck(deck)
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
})

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
