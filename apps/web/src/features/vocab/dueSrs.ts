import { isSrsReviewDue } from '@ryan/core'
import { db, type Srs } from '@ryan/db'

/** Due SRS rows that still point to a real card and deck (ignore orphaned sync rows). */
export async function getValidDueSrsRows(now = Date.now()): Promise<Srs[]> {
  const rows = (await db.srs.where('dueAt').belowOrEqual(now).toArray())
    .filter(row => isSrsReviewDue(row, now))
  if (rows.length === 0) return []

  const [cards, decks] = await Promise.all([
    db.cards.bulkGet(rows.map(row => row.cardId)),
    db.decks.bulkGet([...new Set(rows.map(row => row.deckId))]),
  ])
  const validCardIds = new Set(cards.flatMap(card => card ? [card.id] : []))
  const validDeckIds = new Set(decks.flatMap(deck => deck ? [deck.id] : []))
  return rows.filter(row => validCardIds.has(row.cardId) && validDeckIds.has(row.deckId))
}

export async function countValidDueSrs(now = Date.now()): Promise<number> {
  return (await getValidDueSrsRows(now)).length
}
