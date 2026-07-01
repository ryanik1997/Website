import { db } from '../schema'
import type { Deck } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => Date.now()

async function ensureDefaultGroup() {
  const exists = await db.groups.get('default')
  if (!exists) {
    await db.groups.add({ id: 'default', name: 'Mặc định', order: 0, createdAt: now() })
  }
}

export const deckRepo = {
  all: () => db.decks.orderBy('updatedAt').reverse().toArray(),
  get: (id: string) => db.decks.get(id),

  async create(name: string, opts?: { book?: string; unit?: string }): Promise<Deck> {
    await ensureDefaultGroup()
    const d: Deck = {
      id: uid(), groupId: 'default', name,
      book: opts?.book, unit: opts?.unit,
      createdAt: now(), updatedAt: now(),
    }
    await db.decks.add(d)
    return d
  },

  update: (id: string, patch: Partial<Pick<Deck, 'name' | 'book' | 'unit'>>) =>
    db.decks.update(id, { ...patch, updatedAt: now() }),

  async delete(id: string): Promise<void> {
    const cardIds = (await db.cards.where('deckId').equals(id).primaryKeys()) as string[]
    await db.srs.bulkDelete(cardIds)
    await db.reviewLog.where('cardId').anyOf(cardIds).delete()
    await db.cards.where('deckId').equals(id).delete()
    await db.decks.delete(id)
  },
}
