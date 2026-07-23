import { db } from '../schema'
import type { NotebookEntry } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => Date.now()

export function phraseKeyOf(phrase: string): string {
  return phrase.trim().toLowerCase().replace(/\s+/g, ' ')
}

export type NotebookSaveInput = {
  phrase: string
  meaning: string
  example?: string
  ipaUS?: string
  ipaUK?: string
  pos?: string
  note?: string
  sourceCardId?: string
  sourceDeckId?: string
  source?: NotebookEntry['source']
}

export const notebookRepo = {
  all: () => db.notebookEntries.orderBy('createdAt').reverse().toArray(),

  get: (id: string) => db.notebookEntries.get(id),

  byPhrase: (phrase: string) =>
    db.notebookEntries.where('phraseKey').equals(phraseKeyOf(phrase)).first(),

  byCardId: (cardId: string) =>
    db.notebookEntries.where('sourceCardId').equals(cardId).first(),

  count: () => db.notebookEntries.count(),

  /**
   * Lưu hoặc cập nhật theo phrase (không tạo bản ghi trùng).
   * Trả về entry + flag `created`.
   */
  async save(data: NotebookSaveInput): Promise<{ entry: NotebookEntry; created: boolean }> {
    const phrase = data.phrase.trim()
    if (!phrase) throw new Error('phrase is required')
    const key = phraseKeyOf(phrase)
    const existing = await db.notebookEntries.where('phraseKey').equals(key).first()
    const t = now()

    if (existing) {
      const patch: Partial<NotebookEntry> = {
        phrase,
        meaning: data.meaning.trim() || existing.meaning,
        updatedAt: t,
      }
      if (data.example !== undefined) patch.example = data.example
      if (data.ipaUS !== undefined) patch.ipaUS = data.ipaUS
      if (data.ipaUK !== undefined) patch.ipaUK = data.ipaUK
      if (data.pos !== undefined) patch.pos = data.pos
      if (data.note !== undefined) patch.note = data.note
      if (data.sourceCardId !== undefined) patch.sourceCardId = data.sourceCardId
      if (data.sourceDeckId !== undefined) patch.sourceDeckId = data.sourceDeckId
      if (data.source !== undefined) patch.source = data.source
      await db.notebookEntries.update(existing.id, patch)
      const entry = { ...existing, ...patch } as NotebookEntry
      return { entry, created: false }
    }

    const entry: NotebookEntry = {
      id: uid(),
      phraseKey: key,
      phrase,
      meaning: data.meaning.trim(),
      example: data.example,
      ipaUS: data.ipaUS,
      ipaUK: data.ipaUK,
      pos: data.pos,
      note: data.note,
      sourceCardId: data.sourceCardId,
      sourceDeckId: data.sourceDeckId,
      source: data.source ?? 'manual',
      createdAt: t,
      updatedAt: t,
    }
    await db.notebookEntries.add(entry)
    return { entry, created: true }
  },

  updateNote: (id: string, note: string) =>
    db.notebookEntries.update(id, { note, updatedAt: now() }),

  update: (
    id: string,
    patch: Partial<Pick<NotebookEntry, 'phrase' | 'meaning' | 'example' | 'ipaUS' | 'ipaUK' | 'pos' | 'note'>>,
  ) => {
    const next = { ...patch, updatedAt: now() } as Partial<NotebookEntry>
    if (patch.phrase !== undefined) {
      next.phrase = patch.phrase.trim()
      next.phraseKey = phraseKeyOf(patch.phrase)
    }
    return db.notebookEntries.update(id, next)
  },

  delete: (id: string) => db.notebookEntries.delete(id),
}
