import { db } from '../schema'
import type { SentenceStructure } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => Date.now()

export const sentenceStructureRepo = {
  count: () => db.sentenceStructures.count(),

  all: () => db.sentenceStructures.orderBy('updatedAt').reverse().toArray(),

  get: (id: string) => db.sentenceStructures.get(id),

  async create(
    data: Omit<SentenceStructure, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<SentenceStructure> {
    const item: SentenceStructure = {
      id: uid(),
      ...data,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.sentenceStructures.add(item)
    return item
  },

  update: (id: string, patch: Partial<Omit<SentenceStructure, 'id' | 'createdAt'>>) =>
    db.sentenceStructures.update(id, { ...patch, updatedAt: now() }),

  delete: (id: string) => db.sentenceStructures.delete(id),

  toggleStar: async (id: string) => {
    const item = await db.sentenceStructures.get(id)
    if (!item) return
    await db.sentenceStructures.update(id, { starred: !item.starred, updatedAt: now() })
  },
}