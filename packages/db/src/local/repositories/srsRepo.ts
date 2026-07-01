import { db } from '../schema'
import type { Srs } from '../schema'

const now = () => Date.now()

export const srsRepo = {
  dueByDeck: (deckId: string, limit = 50) =>
    db.srs.where('deckId').equals(deckId).and(s => s.dueAt <= now()).limit(limit).toArray(),

  byDeck: (deckId: string) => db.srs.where('deckId').equals(deckId).toArray(),

  get: (cardId: string) => db.srs.get(cardId),

  update: (s: Srs) => db.srs.put(s),

  log: (cardId: string, rating: number, mode: string) =>
    db.reviewLog.add({ cardId, rating, mode, at: now() }),

  async stats(deckId: string) {
    const all = await db.srs.where('deckId').equals(deckId).toArray()
    const due = all.filter(s => s.dueAt <= now()).length
    const newCount = all.filter(s => s.state === 'new').length
    return { total: all.length, due, new: newCount }
  },
}
