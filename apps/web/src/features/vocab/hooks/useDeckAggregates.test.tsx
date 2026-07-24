import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Card, Srs } from '@ryan/db'

const mocks = vi.hoisted(() => ({
  cardsToArray: vi.fn(),
  srsToArray: vi.fn(),
}))

vi.mock('@ryan/db', () => ({
  db: {
    cards: { toArray: mocks.cardsToArray },
    srs: { toArray: mocks.srsToArray },
  },
}))

vi.mock('dexie', () => ({
  liveQuery: (query: () => Promise<unknown>) => ({
    subscribe: (observer: { next: (value: unknown) => void; error: (error: unknown) => void }) => {
      let active = true
      void query().then(
        value => {
          if (active) observer.next(value)
        },
        error => {
          if (active) observer.error(error)
        },
      )
      return { unsubscribe: () => { active = false } }
    },
  }),
}))

import { buildDeckAggregates, useDeckAggregates } from './useDeckAggregates'
import { useVocabStore } from '../vocabStore'

const NOW = 10_000

function card(id: string, deckId: string, phrase: string): Card {
  return {
    id,
    deckId,
    phrase,
    meaning: phrase,
    createdAt: 1,
    updatedAt: 1,
  }
}

function srs(
  cardId: string,
  deckId: string,
  overrides: Partial<Srs> = {},
): Srs {
  return {
    cardId,
    deckId,
    ease: 2.5,
    interval: 1,
    reps: 0,
    lapses: 0,
    dueAt: NOW,
    state: 'new',
    ...overrides,
  }
}

describe('buildDeckAggregates', () => {
  it('preserves unit-kind, mastered, and review-due semantics', () => {
    const cards = [
      card('single-mastered', 'deck-a', 'word'),
      card('single-new', 'deck-a', 'term'),
      card('phrase-future', 'deck-a', 'look after'),
      card('single-due', 'deck-b', 'other'),
    ]
    const srsRows = [
      srs('single-mastered', 'deck-a', { reps: 3, state: 'review', dueAt: NOW }),
      srs('single-new', 'deck-a'),
      srs('phrase-future', 'deck-a', { reps: 4, state: 'review', dueAt: NOW + 1 }),
      srs('single-due', 'deck-b', { reps: 1, state: 'learning', dueAt: NOW - 1 }),
    ]

    const singles = buildDeckAggregates(cards, srsRows, 'single', NOW)
    expect(singles.get('deck-a')).toEqual({ total: 2, mastered: 1, dueCount: 1 })
    expect(singles.get('deck-b')).toEqual({ total: 1, mastered: 0, dueCount: 1 })

    const phrases = buildDeckAggregates(cards, srsRows, 'phrase', NOW)
    expect(phrases.get('deck-a')).toEqual({ total: 1, mastered: 1, dueCount: 0 })
  })
})

function Probe({ renderId }: { renderId: number }) {
  const { statsMap, loading, error } = useDeckAggregates()
  const total = [...statsMap.values()].reduce((sum, stat) => sum + stat.total, 0)
  return <output>{`${renderId}:${loading}:${error?.message ?? 'ok'}:${total}`}</output>
}

describe('useDeckAggregates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useVocabStore.setState({ unitKind: 'single' })
    mocks.cardsToArray.mockResolvedValue([
      card('single', 'deck-a', 'word'),
      card('phrase-a', 'deck-a', 'look after'),
      card('phrase-b', 'deck-b', 'carry on'),
    ])
    mocks.srsToArray.mockResolvedValue([
      srs('single', 'deck-a'),
      srs('phrase-a', 'deck-a'),
      srs('phrase-b', 'deck-b'),
    ])
  })

  it('queries both tables once and filters cached rows after rerender or unit change', async () => {
    const view = render(<Probe renderId={1} />)
    await screen.findByText('1:false:ok:1')

    view.rerender(<Probe renderId={2} />)
    await screen.findByText('2:false:ok:1')

    act(() => useVocabStore.getState().setUnitKind('phrase'))
    await waitFor(() => expect(screen.getByText('2:false:ok:2')).toBeTruthy())

    expect(mocks.cardsToArray).toHaveBeenCalledOnce()
    expect(mocks.srsToArray).toHaveBeenCalledOnce()
  })
})
