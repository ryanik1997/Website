import { db } from '../schema'

const CACHE_TTL_MS = 30 * 86_400_000 // 30 ngày

export const dictRepo = {
  async get(word: string) {
    return db.dictionaryCache.get(word.toLowerCase().trim())
  },

  async isFresh(word: string): Promise<boolean> {
    const entry = await db.dictionaryCache.get(word.toLowerCase().trim())
    if (!entry) return false
    return Date.now() - entry.fetchedAt < CACHE_TTL_MS
  },

  async save(word: string, data: unknown): Promise<void> {
    await db.dictionaryCache.put({
      word: word.toLowerCase().trim(),
      data,
      fetchedAt: Date.now(),
    })
  },

  delete: (word: string) =>
    db.dictionaryCache.delete(word.toLowerCase().trim()),

  recent: (limit = 20) =>
    db.dictionaryCache.orderBy('fetchedAt').reverse().limit(limit).toArray(),
}
