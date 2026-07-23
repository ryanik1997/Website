import { db } from '../schema'
import type { TranslationSet, TranslationSentence } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => Date.now()

const defaultSrs = () => ({ ease: 2.5, interval: 0, dueAt: now(), reps: 0 })

export const translationRepo = {
  all: () => db.translationSets.orderBy('createdAt').reverse().toArray(),
  get: (id: string) => db.translationSets.get(id),
  count: () => db.translationSets.count(),

  async create(data: Pick<TranslationSet, 'title' | 'category' | 'sentences' | 'genre'>): Promise<TranslationSet> {
    const set: TranslationSet = { id: uid(), ...data, createdAt: now() }
    await db.translationSets.add(set)
    return set
  },

  delete: (id: string) => db.translationSets.delete(id),

  updateTitle: (id: string, title: string) =>
    db.translationSets.update(id, { title: title.trim() }),

  async addSentence(
    setId: string,
    data: Pick<TranslationSentence, 'vi' | 'en' | 'hint' | 'difficulty'>,
  ): Promise<void> {
    const set = await db.translationSets.get(setId)
    if (!set) return
    const sentence: TranslationSentence = {
      id: uid(),
      ...data,
      srsState: defaultSrs(),
    }
    await db.translationSets.update(setId, { sentences: [...set.sentences, sentence] })
  },

  async deleteSentence(setId: string, sentenceId: string): Promise<void> {
    const set = await db.translationSets.get(setId)
    if (!set) return
    await db.translationSets.update(setId, {
      sentences: set.sentences.filter(s => s.id !== sentenceId),
    })
  },

  async updateSrsState(
    setId: string,
    sentenceId: string,
    srsState: NonNullable<TranslationSentence['srsState']>,
  ): Promise<void> {
    const set = await db.translationSets.get(setId)
    if (!set) return
    const sentences = set.sentences.map(s =>
      s.id === sentenceId ? { ...s, srsState } : s,
    )
    await db.translationSets.update(setId, { sentences })
  },

  async markTranslated(setId: string, sentenceId: string): Promise<void> {
    const set = await db.translationSets.get(setId)
    if (!set) return
    const sentences = set.sentences.map(s => {
      if (s.id !== sentenceId || s.srsState?.translatedAt) return s
      return { ...s, srsState: { ...(s.srsState ?? defaultSrs()), translatedAt: now() } }
    })
    await db.translationSets.update(setId, { sentences })
  },
}