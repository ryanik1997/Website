import { db } from '../schema'
import type { Lesson } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => Date.now()

type CreateLessonInput = Pick<Lesson, 'category' | 'title' | 'sentences'> &
  Partial<Pick<Lesson, 'book' | 'bookNum' | 'test' | 'part' | 'topic' | 'source' | 'sourceExamId' | 'sourceExamPartId' | 'linkedAudioKey' | 'linkedAudioUrl'>>

function newSentence(text: string) {
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    ease: 2.5,
    interval: 0,
    reps: 0,
    lapses: 0,
    dueAt: Date.now(),
    state: 'new' as const,
  }
}

export const lessonRepo = {
  all: () => db.lessons.orderBy('createdAt').reverse().toArray(),
  byCategory: (cat: 'user' | 'cambridge') =>
    db.lessons.where('category').equals(cat).reverse().sortBy('createdAt'),
  get: (id: string) => db.lessons.get(id),
  count: () => db.lessons.count(),
  countByCategory: (cat: 'user' | 'cambridge') =>
    db.lessons.where('category').equals(cat).count(),

  async create(data: CreateLessonInput): Promise<Lesson> {
    const lesson: Lesson = { id: uid(), ...data, createdAt: now() }
    await db.lessons.add(lesson)
    return lesson
  },

  update: (id: string, patch: Partial<Pick<Lesson, 'title' | 'sentences' | 'book' | 'bookNum' | 'test' | 'part' | 'topic' | 'source' | 'sourceExamId' | 'sourceExamPartId' | 'linkedAudioKey' | 'linkedAudioUrl'>>) =>
    db.lessons.update(id, patch),

  async appendSentences(id: string, texts: string[]): Promise<Lesson | undefined> {
    const lesson = await db.lessons.get(id)
    if (!lesson) return undefined
    const trimmed = texts.map(t => t.trim()).filter(Boolean)
    if (!trimmed.length) return lesson
    const existing = Array.isArray(lesson.sentences) ? lesson.sentences : []
    await db.lessons.update(id, { sentences: [...existing, ...trimmed.map(newSentence)] })
    return db.lessons.get(id)
  },

  delete: (id: string) => db.lessons.delete(id),

  async existsStructured(book: string, test: number, part: number): Promise<boolean> {
    const all = await db.lessons.where('category').equals('cambridge').toArray()
    return all.some(l => l.book === book && l.test === test && l.part === part)
  },
}