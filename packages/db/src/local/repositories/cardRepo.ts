import { db } from '../schema'
import type { Card } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => Date.now()

export const cardRepo = {
  byDeck: (deckId: string) => db.cards.where('deckId').equals(deckId).toArray(),
  count:  (deckId: string) => db.cards.where('deckId').equals(deckId).count(),

  async add(
    deckId: string,
    data: Pick<
      Card,
      'phrase' | 'meaning' | 'example' | 'ipaUS' | 'ipaUK' | 'pos' | 'sourceKind' | 'sourceExamId' | 'sourceLabel'
    >,
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

  /**
   * Thêm thẻ nếu chưa có phrase trùng trong deck (so khớp không phân biệt hoa thường).
   * Trả về card mới hoặc card đã có.
   */
  async addUnique(
    deckId: string,
    data: Pick<
      Card,
      'phrase' | 'meaning' | 'example' | 'ipaUS' | 'ipaUK' | 'pos' | 'sourceKind' | 'sourceExamId' | 'sourceLabel'
    >,
  ): Promise<{ card: Card; created: boolean }> {
    const phraseKey = data.phrase.trim().toLowerCase()
    const existing = await db.cards
      .where('deckId')
      .equals(deckId)
      .filter(c => c.phrase.trim().toLowerCase() === phraseKey)
      .first()
    if (existing) {
      // Bổ sung example/source nếu thẻ cũ thiếu
      const patch: Partial<Card> = {}
      if (!existing.example && data.example) patch.example = data.example
      if (!existing.sourceLabel && data.sourceLabel) patch.sourceLabel = data.sourceLabel
      if (!existing.sourceExamId && data.sourceExamId) patch.sourceExamId = data.sourceExamId
      if (Object.keys(patch).length) {
        await db.cards.update(existing.id, { ...patch, updatedAt: now() })
        return { card: { ...existing, ...patch }, created: false }
      }
      return { card: existing, created: false }
    }
    const card = await cardRepo.add(deckId, data)
    return { card, created: true }
  },

  update: (
    id: string,
    patch: Partial<Pick<Card, 'phrase' | 'meaning' | 'example' | 'ipaUS' | 'ipaUK' | 'pos' | 'sourceKind' | 'sourceExamId' | 'sourceLabel'>>,
  ) => db.cards.update(id, { ...patch, updatedAt: now() }),

  async delete(id: string): Promise<void> {
    await db.srs.delete(id)
    await db.cards.delete(id)
  },
}
