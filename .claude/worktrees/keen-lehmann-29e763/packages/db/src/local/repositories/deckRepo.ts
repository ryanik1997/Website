import { db } from '../schema'
import type { Deck } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => Date.now()

async function ensureGroup(groupId: string) {
  const exists = await db.groups.get(groupId)
  if (!exists) {
    const name = groupId === 'default' ? 'Mặc định' : groupId
    await db.groups.add({ id: groupId, name, order: 0, createdAt: now() })
  }
}

export const deckRepo = {
  all: () => db.decks.orderBy('updatedAt').reverse().toArray(),
  get: (id: string) => db.decks.get(id),

  async create(
    name: string,
    opts?: {
      book?: string
      unit?: string
      groupId?: string
      description?: string
      color?: string
      icon?: string
    },
  ): Promise<Deck> {
    const groupId = opts?.groupId?.trim() || 'default'
    await ensureGroup(groupId)
    const d: Deck = {
      id: uid(), groupId, name,
      book: opts?.book, unit: opts?.unit,
      description: opts?.description?.trim() || undefined,
      color: opts?.color,
      icon: opts?.icon,
      origin: 'user',
      createdAt: now(), updatedAt: now(),
    }
    await db.decks.add(d)
    return d
  },

  update: (
    id: string,
    patch: Partial<Pick<Deck, 'name' | 'book' | 'unit' | 'groupId' | 'description' | 'color' | 'icon'>>,
  ) => db.decks.update(id, { ...patch, updatedAt: now() }),

  async delete(id: string): Promise<void> {
    const deck = await db.decks.get(id)
    if (deck && deck.origin === 'preset') {
      throw new Error('preset-deck-not-deletable')
    }
    const cardIds = (await db.cards.where('deckId').equals(id).primaryKeys()) as string[]
    await db.transaction(
      'rw',
      db.decks, db.cards, db.srs, db.reviewLog, db.deckTombstones,
      async () => {
        // Tombstone trước → sync sau đó hard-delete cloud (cards + srs cascade)
        await db.deckTombstones.put({ id, deletedAt: now() })
        await db.srs.bulkDelete(cardIds)
        await db.reviewLog.where('cardId').anyOf(cardIds).delete()
        await db.cards.where('deckId').equals(id).delete()
        await db.decks.delete(id)
      },
    )
  },
}
