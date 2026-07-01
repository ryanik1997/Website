import { db } from '../schema'
import type { WritingDoc, WritingGenre, WritingHistory } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => Date.now()

async function hashText(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.trim())
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 20)
}

export const writingRepo = {
  allDocs: () => db.writingDocs.orderBy('updatedAt').reverse().toArray(),
  getDoc: (id: string) => db.writingDocs.get(id),

  async createDoc(
    type: WritingDoc['type'],
    prompt: string,
    promptImage?: string,
    genre?: WritingGenre,
  ): Promise<WritingDoc> {
    const doc: WritingDoc = { id: uid(), type, genre, prompt, text: '', promptImage, updatedAt: now() }
    await db.writingDocs.add(doc)
    return doc
  },

  updateDoc: (id: string, patch: Partial<Pick<WritingDoc, 'text' | 'prompt' | 'promptImage' | 'genre'>>) =>
    db.writingDocs.update(id, { ...patch, updatedAt: now() }),

  async deleteDoc(id: string): Promise<void> {
    await db.writingHistory.where('docId').equals(id).delete()
    await db.writingDocs.delete(id)
  },

  getHistory: (docId: string) =>
    db.writingHistory.where('docId').equals(docId).reverse().sortBy('at'),

  async getCachedScore(text: string): Promise<WritingHistory | undefined> {
    const hash = await hashText(text)
    return db.writingHistory.where('textHash').equals(hash).first()
  },

  async saveScore(docId: string, text: string, score: unknown): Promise<void> {
    const hash = await hashText(text)
    await db.writingHistory.add({ docId, textHash: hash, score, at: now() })
  },

  async recordImprovements(improvements: string[]): Promise<void> {
    for (const raw of improvements) {
      const title = raw.trim()
      if (!title) continue
      const signature = title.toLowerCase().replace(/\s+/g, ' ').slice(0, 120)
      const existing = await db.errorBank.where('signature').equals(signature).first()
      if (existing?.id != null) {
        await db.errorBank.update(existing.id, { count: existing.count + 1 })
      } else {
        await db.errorBank.add({ signature, title, count: 1 })
      }
    }
  },

  // AI usage tracking
  async getTodayUsage(feature: string): Promise<number> {
    const today = new Date().toISOString().slice(0, 10)
    const u = await db.aiUsage.get([today, feature])
    return u?.count ?? 0
  },

  async recordUsage(feature: string, tokens: number): Promise<void> {
    const today = new Date().toISOString().slice(0, 10)
    const existing = await db.aiUsage.get([today, feature])
    if (existing) {
      await db.aiUsage.put({ day: today, feature, count: existing.count + 1, tokens: existing.tokens + tokens })
    } else {
      await db.aiUsage.put({ day: today, feature, count: 1, tokens })
    }
  },

  // Settings key-value store
  getSetting: async (key: string): Promise<unknown> => {
    const s = await db.settings.get(key)
    return s?.value
  },

  setSetting: (key: string, value: unknown) =>
    db.settings.put({ key, value }),
}
