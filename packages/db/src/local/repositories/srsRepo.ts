import { isSrsNew, isSrsReviewDue } from '@ryan/core'
import { db } from '../schema'
import type { Srs } from '../schema'

const now = () => Date.now()

export const srsRepo = {
  /** Thẻ đến hạn ôn lại (đã học trước đó) — không gồm thẻ new seed. */
  dueByDeck: (deckId: string, limit = 50) =>
    db.srs
      .where('[deckId+dueAt]')
      .between([deckId, 0], [deckId, now()])
      .and(s => isSrsReviewDue(s, now()))
      .limit(limit)
      .toArray(),

  byDeck: (deckId: string) => db.srs.where('deckId').equals(deckId).toArray(),

  get: (cardId: string) => db.srs.get(cardId),

  update: (s: Srs) => db.srs.put({ ...s, updatedAt: now() }),

  log: (cardId: string, rating: number, mode: string) =>
    db.reviewLog.add({ cardId, rating, mode, at: now() }),

  async stats(deckId: string) {
    const all = await db.srs.where('deckId').equals(deckId).toArray()
    const t = now()
    const due = all.filter(s => isSrsReviewDue(s, t)).length
    const newCount = all.filter(s => isSrsNew(s)).length
    return { total: all.length, due, new: newCount }
  },
}
