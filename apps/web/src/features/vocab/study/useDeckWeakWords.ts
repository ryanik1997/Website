import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@ryan/db'
import type { Card, Srs } from '@ryan/db'
import { isWeakWord, weakScore } from './weakWords'
import { useVocabStore } from '../vocabStore'
import { filterCardsByUnitKind } from '../vocabUnitKind'

export interface WeakWordRow {
  card: Card
  srs: Srs
  score: number
}

export function useDeckWeakWords(deckId: string | null): WeakWordRow[] | undefined {
  const unitKind = useVocabStore(s => s.unitKind)
  return useLiveQuery(async () => {
    if (!deckId) return []
    const [allCards, srsRows] = await Promise.all([
      db.cards.where('deckId').equals(deckId).toArray(),
      db.srs.where('deckId').equals(deckId).toArray(),
    ])
    const cards = filterCardsByUnitKind(allCards, unitKind)
    const srsMap = new Map(srsRows.map(s => [s.cardId, s]))
    const rows: WeakWordRow[] = []
    for (const card of cards) {
      const srs = srsMap.get(card.id)
      if (!srs || !isWeakWord(srs)) continue
      rows.push({ card, srs, score: weakScore(srs) })
    }
    rows.sort((a, b) => b.score - a.score)
    return rows
  }, [deckId, unitKind])
}