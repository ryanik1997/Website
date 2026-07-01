import { db, type ListeningExamRecord } from '../schema'

function now() {
  return Date.now()
}

export const listeningExamRepo = {
  async list(): Promise<ListeningExamRecord[]> {
    return db.listeningExams.orderBy('updatedAt').reverse().toArray()
  },

  async get(id: string): Promise<ListeningExamRecord | undefined> {
    return db.listeningExams.get(id)
  },

  async create(
    input: Omit<ListeningExamRecord, 'createdAt' | 'updatedAt'>,
  ): Promise<ListeningExamRecord> {
    const ts = now()
    const record: ListeningExamRecord = {
      ...input,
      createdAt: ts,
      updatedAt: ts,
    }
    await db.listeningExams.put(record)
    return record
  },

  async update(
    id: string,
    patch: Partial<Pick<ListeningExamRecord, 'title' | 'durationMinutes' | 'bandHint' | 'examMode' | 'parts'>>,
  ): Promise<void> {
    await db.listeningExams.update(id, { ...patch, updatedAt: now() })
  },

  async delete(id: string): Promise<void> {
    await db.listeningExams.delete(id)
  },

  async count(): Promise<number> {
    return db.listeningExams.count()
  },
}