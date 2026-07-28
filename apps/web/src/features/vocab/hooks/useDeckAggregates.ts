import { useEffect, useMemo, useRef, useState } from 'react'
import { isSrsReviewDue } from '@ryan/core'
import { db, type Card, type Srs } from '@ryan/db'
import { liveQuery } from 'dexie'
import { matchesUnitKind, type VocabUnitKind } from '../vocabUnitKind'
import { useVocabStore } from '../vocabStore'

export interface DeckAggregate {
  total: number
  mastered: number
  dueCount: number
}

interface DeckAggregateSnapshot {
  cards: Card[]
  srsRows: Srs[]
}

export function buildDeckAggregates(
  cards: Card[],
  srsRows: Srs[],
  unitKind: VocabUnitKind,
  now = Date.now(),
): Map<string, DeckAggregate> {
  const srsByCard = new Map<string, Srs>()
  for (const srs of srsRows) srsByCard.set(srs.cardId, srs)

  const statsMap = new Map<string, DeckAggregate>()
  for (const card of cards) {
    if (!matchesUnitKind(card.phrase, unitKind, card.pos)) continue

    let aggregate = statsMap.get(card.deckId)
    if (!aggregate) {
      aggregate = { total: 0, mastered: 0, dueCount: 0 }
      statsMap.set(card.deckId, aggregate)
    }

    aggregate.total++
    const srs = srsByCard.get(card.id)
    if (!srs) continue
    if (srs.reps >= 3) aggregate.mastered++
    if (isSrsReviewDue(srs, now)) aggregate.dueCount++
  }

  return statsMap
}

function normalizeError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}

export function useDeckAggregates(): {
  statsMap: Map<string, DeckAggregate>
  loading: boolean
  error: Error | null
} {
  const unitKind = useVocabStore(state => state.unitKind)
  const snapshotRef = useRef<DeckAggregateSnapshot | null>(null)
  const [snapshotRevision, setSnapshotRevision] = useState(0)
  const [dueNow, setDueNow] = useState(() => Date.now())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const subscription = liveQuery(async (): Promise<DeckAggregateSnapshot> => {
      const [cards, srsRows] = await Promise.all([
        db.cards.toArray(),
        db.srs.toArray(),
      ])
      return { cards, srsRows }
    }).subscribe({
      next: snapshot => {
        snapshotRef.current = snapshot
        setSnapshotRevision(revision => revision + 1)
        setLoading(false)
        setError(null)
      },
      error: queryError => {
        setLoading(false)
        setError(normalizeError(queryError))
      },
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setDueNow(Date.now()), 15_000)
    return () => window.clearInterval(timer)
  }, [])

  const statsMap = useMemo(() => {
    const snapshot = snapshotRef.current
    if (!snapshot) return new Map<string, DeckAggregate>()
    return buildDeckAggregates(snapshot.cards, snapshot.srsRows, unitKind, dueNow)
  }, [snapshotRevision, unitKind, dueNow])

  return { statsMap, loading, error }
}
