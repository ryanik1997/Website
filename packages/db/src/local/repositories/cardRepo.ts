import { db } from '../schema'
import type { Card } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => Date.now()

export const cardRepo = {
  byDeck: (deckId: string) => db.cards.where('deckId').equals(deckId).toArray(),
  count:  (deckId: string) => db.cards.where('deckId').equals(deckId).count(),

  async add(
    deckId: string,
    data: Pick<Card, 'phrase' | 'meaning' | 'example' | 'ipaUS' | 'ipaUK' | 'pos'>,
  ): Promise<Card> {
    const card: Card = { id: uid(), deckId, ...data, createdAt: now(), updatedAt: now() }
    await db.cards.add(card)
    // Init SRS state — new cards are immediately due
    await db.srs.add({
      cardId: card.id, deckId,
      ease: 2.5, interval: 0, reps: 0, lapses: 0,
      dueAt: now(), state: 'new',
    })
    await db.decks.update(deckId, { updatedAt: now() })
    return card
  },

  update: (
    id: string,
    patch: Partial<Pick<Card, 'phrase' | 'meaning' | 'example' | 'ipaUS' | 'ipaUK' | 'pos'>>,
  ) => db.cards.update(id, { ...patch, updatedAt: now() }),

  async delete(id: string): Promise<void> {
    await db.srs.delete(id)
    await db.cards.delete(id)
  },
}
