import { db } from '../schema'

const HARD_AUDIO_CACHE_LIMIT_BYTES = 400 * 1024 * 1024
const STORAGE_QUOTA_FRACTION = 0.2

async function audioCacheBudget(): Promise<number> {
  try {
    const quota = typeof navigator === 'undefined'
      ? undefined
      : (await navigator.storage?.estimate())?.quota
    if (quota && Number.isFinite(quota)) {
      return Math.min(HARD_AUDIO_CACHE_LIMIT_BYTES, Math.floor(quota * STORAGE_QUOTA_FRACTION))
    }
  } catch { /* browser storage estimates are best-effort */ }
  return HARD_AUDIO_CACHE_LIMIT_BYTES
}

async function pruneToBudget(protectedKey?: string): Promise<number> {
  const entries = await db.audioBlobs.orderBy('lastAccessedAt').toArray()
  const budget = await audioCacheBudget()
  let total = entries.reduce((sum, entry) => sum + (entry.bytes ?? entry.blob.size), 0)
  const toDelete: string[] = []
  for (const entry of entries) {
    if (total <= budget) break
    if (entry.key === protectedKey) continue
    total -= entry.bytes ?? entry.blob.size
    toDelete.push(entry.key)
  }
  if (toDelete.length) await db.audioBlobs.bulkDelete(toDelete)
  return toDelete.length
}

export const audioRepo = {
  async put(key: string, blob: Blob) {
    const budget = await audioCacheBudget()
    if (blob.size > budget) {
      await db.audioBlobs.delete(key)
      return
    }
    const now = Date.now()
    await db.audioBlobs.put({ key, blob, bytes: blob.size, createdAt: now, lastAccessedAt: now })
    await pruneToBudget(key)
  },
  async get(key: string) {
    const entry = await db.audioBlobs.get(key)
    if (entry) void db.audioBlobs.update(key, { lastAccessedAt: Date.now() })
    return entry
  },
  listKeysByPrefix: async (prefix: string) => {
    const keys = await db.audioBlobs.where('key').startsWith(prefix).primaryKeys()
    return keys as string[]
  },
  delete: (key: string) => db.audioBlobs.delete(key),
  prune: () => pruneToBudget(),
  budget: () => audioCacheBudget(),
  lessonKey: (lessonId: string) => `lesson:${lessonId}`,
}
