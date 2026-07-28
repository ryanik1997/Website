import { db, type CambridgeWritingRecordLevel, type CambridgeWritingRecordSource, type CambridgeWritingRecordStatus, type CambridgeWritingTestRecord } from '../schema'

function now() {
  return Date.now()
}

function stableStringify(value: unknown) {
  return JSON.stringify(value)
}

type CreateInput = {
  id: string
  contentKey: string
  level: CambridgeWritingRecordLevel
  testNumber: number
  payload: unknown
  status?: CambridgeWritingRecordStatus
  source?: CambridgeWritingRecordSource
  version?: number
  publishedAt?: number
  createdBy?: string
}

type PutInput = CambridgeWritingTestRecord

type UpdatePatch = Partial<Pick<
  CambridgeWritingTestRecord,
  'contentKey' | 'testNumber' | 'status' | 'source' | 'payload' | 'publishedAt' | 'createdBy'
>>

async function ensureNoDuplicateKeys(record: Pick<CambridgeWritingTestRecord, 'id' | 'contentKey'>) {
  const sameId = await db.cambridgeWritingTests.get(record.id)
  if (sameId) throw new Error(`Cambridge Writing test id already exists: ${record.id}`)

  const sameContentKey = await db.cambridgeWritingTests.where('contentKey').equals(record.contentKey).first()
  if (sameContentKey) throw new Error(`Cambridge Writing contentKey already exists: ${record.contentKey}`)
}

async function ensureNoTestNumberConflict(level: CambridgeWritingRecordLevel, testNumber: number, excludeId?: string) {
  const rows = await db.cambridgeWritingTests.where('[level+testNumber]').equals([level, testNumber]).toArray()
  const conflict = rows.find(record => record.id !== excludeId)
  if (conflict) {
    throw new Error(`Cambridge Writing testNumber already exists for ${level}: ${testNumber}`)
  }
}

async function ensureNoDuplicateKeysForOther(record: Pick<CambridgeWritingTestRecord, 'id' | 'contentKey'>) {
  const sameContentKey = await db.cambridgeWritingTests.where('contentKey').equals(record.contentKey).first()
  if (sameContentKey && sameContentKey.id !== record.id) {
    throw new Error(`Cambridge Writing contentKey already exists: ${record.contentKey}`)
  }
}

export const cambridgeWritingTestLocalRepo = {
  listAll(): Promise<CambridgeWritingTestRecord[]> {
    return db.cambridgeWritingTests.orderBy('updatedAt').reverse().toArray()
  },

  async listByLevel(level: CambridgeWritingRecordLevel): Promise<CambridgeWritingTestRecord[]> {
    const rows = await db.cambridgeWritingTests.where('level').equals(level).sortBy('updatedAt')
    return rows.reverse()
  },

  async listByLevelAndSource(level: CambridgeWritingRecordLevel, source: CambridgeWritingRecordSource): Promise<CambridgeWritingTestRecord[]> {
    const rows = await db.cambridgeWritingTests.where('level').equals(level).toArray()
    return rows
      .filter(record => record.source === source)
      .sort((a, b) => b.updatedAt - a.updatedAt)
  },

  getById(id: string): Promise<CambridgeWritingTestRecord | undefined> {
    return db.cambridgeWritingTests.get(id)
  },

  getByContentKey(contentKey: string): Promise<CambridgeWritingTestRecord | undefined> {
    return db.cambridgeWritingTests.where('contentKey').equals(contentKey).first()
  },

  async create(input: CreateInput): Promise<CambridgeWritingTestRecord> {
    await ensureNoDuplicateKeys(input)
    await ensureNoTestNumberConflict(input.level, input.testNumber)
    const ts = now()
    const record: CambridgeWritingTestRecord = {
      id: input.id,
      contentKey: input.contentKey,
      level: input.level,
      testNumber: input.testNumber,
      status: input.status ?? 'draft',
      source: input.source ?? 'admin_local',
      version: input.version ?? 1,
      payload: input.payload,
      createdAt: ts,
      updatedAt: ts,
      publishedAt: input.publishedAt,
      createdBy: input.createdBy,
    }
    await db.cambridgeWritingTests.add(record)
    return record
  },

  async put(input: PutInput): Promise<CambridgeWritingTestRecord> {
    const existing = await db.cambridgeWritingTests.get(input.id)
    if (!existing) {
      await ensureNoDuplicateKeys(input)
      await ensureNoTestNumberConflict(input.level, input.testNumber)
      const ts = now()
      const record: CambridgeWritingTestRecord = {
        ...input,
        createdAt: input.createdAt ?? ts,
        updatedAt: ts,
      }
      await db.cambridgeWritingTests.put(record)
      return record
    }

    await ensureNoDuplicateKeysForOther(input)
    await ensureNoTestNumberConflict(input.level, input.testNumber, input.id)
    const payloadChanged = stableStringify(existing.payload) !== stableStringify(input.payload)
    const record: CambridgeWritingTestRecord = {
      ...existing,
      ...input,
      version: payloadChanged ? existing.version + 1 : input.version,
      createdAt: existing.createdAt,
      updatedAt: now(),
    }
    await db.cambridgeWritingTests.put(record)
    return record
  },

  async update(id: string, patch: UpdatePatch): Promise<CambridgeWritingTestRecord> {
    const existing = await db.cambridgeWritingTests.get(id)
    if (!existing) throw new Error(`Cambridge Writing test not found: ${id}`)
    const nextContentKey = patch.contentKey ?? existing.contentKey
    const nextLevel = existing.level
    const nextTestNumber = patch.testNumber ?? existing.testNumber
    await ensureNoDuplicateKeysForOther({ id, contentKey: nextContentKey })
    await ensureNoTestNumberConflict(nextLevel, nextTestNumber, id)
    const payloadChanged = patch.payload !== undefined
      && stableStringify(existing.payload) !== stableStringify(patch.payload)
    const record: CambridgeWritingTestRecord = {
      ...existing,
      ...patch,
      contentKey: nextContentKey,
      testNumber: nextTestNumber,
      version: payloadChanged ? existing.version + 1 : existing.version,
      updatedAt: now(),
    }
    await db.cambridgeWritingTests.put(record)
    return record
  },

  async archive(id: string): Promise<CambridgeWritingTestRecord> {
    return this.update(id, { status: 'archived' })
  },

  async deleteDraft(id: string): Promise<void> {
    const existing = await db.cambridgeWritingTests.get(id)
    if (!existing) return
    if (!(existing.source === 'admin_local' && existing.status === 'draft')) {
      throw new Error(`Only local drafts can be deleted: ${id}`)
    }
    await db.cambridgeWritingTests.delete(id)
  },

  async findConflictingTestNumber(level: CambridgeWritingRecordLevel, testNumber: number, excludeId?: string): Promise<CambridgeWritingTestRecord | undefined> {
    const rows = await db.cambridgeWritingTests.where('[level+testNumber]').equals([level, testNumber]).toArray()
    return rows.find(record => record.id !== excludeId)
  },
}
