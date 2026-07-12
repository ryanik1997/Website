import { db, type ExamBackupRecord } from '../schema'

function now() {
  return Date.now()
}

export const examBackupRepo = {
  async list(): Promise<ExamBackupRecord[]> {
    return db.examBackups.orderBy('updatedAt').reverse().toArray()
  },

  async listBySkill(skill: ExamBackupRecord['skill']): Promise<ExamBackupRecord[]> {
    const rows = await db.examBackups.where('skill').equals(skill).sortBy('updatedAt')
    return rows.reverse()
  },

  async get(id: string): Promise<ExamBackupRecord | undefined> {
    return db.examBackups.get(id)
  },

  async upsert(input: {
    id: string
    skill: ExamBackupRecord['skill']
    title: string
    sourceFilename?: string
    payload: unknown
  }): Promise<ExamBackupRecord> {
    const ts = now()
    const existing = await db.examBackups.get(input.id)
    const record: ExamBackupRecord = {
      id: input.id,
      skill: input.skill,
      title: input.title,
      sourceFilename: input.sourceFilename,
      payload: input.payload,
      createdAt: existing?.createdAt ?? ts,
      updatedAt: ts,
    }
    await db.examBackups.put(record)
    return record
  },

  async delete(id: string): Promise<void> {
    await db.examBackups.delete(id)
  },

  async count(): Promise<number> {
    return db.examBackups.count()
  },
}
