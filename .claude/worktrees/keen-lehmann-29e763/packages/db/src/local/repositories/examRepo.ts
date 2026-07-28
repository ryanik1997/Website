import { db, type ReadingExamRecord } from '../schema'

function now() {
  return Date.now()
}

export const examRepo = {
  async list(): Promise<ReadingExamRecord[]> {
    return db.readingExams.orderBy('updatedAt').reverse().toArray()
  },

  async get(id: string): Promise<ReadingExamRecord | undefined> {
    return db.readingExams.get(id)
  },

  async create(
    input: Omit<ReadingExamRecord, 'createdAt' | 'updatedAt'>,
  ): Promise<ReadingExamRecord> {
    const ts = now()
    const record: ReadingExamRecord = {
      ...input,
      createdAt: ts,
      updatedAt: ts,
    }
    await db.readingExams.put(record)
    return record
  },

  async update(
    id: string,
    patch: Partial<Pick<ReadingExamRecord, 'title' | 'durationMinutes' | 'bandHint' | 'parts'>>,
  ): Promise<void> {
    await db.readingExams.update(id, { ...patch, updatedAt: now() })
  },

  async delete(id: string): Promise<void> {
    await db.readingExams.delete(id)
  },

  async count(): Promise<number> {
    return db.readingExams.count()
  },
}