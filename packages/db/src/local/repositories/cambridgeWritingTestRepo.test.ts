import Dexie from 'dexie'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../schema'
import { cambridgeWritingTestLocalRepo } from './cambridgeWritingTestRepo'

function payload(id: string, level: 'a2' | 'b1' | 'b2' | 'c1' | 'c2', testNumber: number) {
  return {
    id,
    level,
    testNumber,
    title: `${level.toUpperCase()} Test ${testNumber}`,
    status: 'draft',
    version: 1,
    tasks: [
      {
        id: `${id}-task-01`,
        partNumber: 1,
        taskNumber: 1,
        title: 'Question 1',
        genre: 'email',
        instruction: 'Write something.',
      },
    ],
  }
}

beforeEach(async () => {
  Object.assign(globalThis, { indexedDB, IDBKeyRange })
  Dexie.dependencies.indexedDB = indexedDB
  Dexie.dependencies.IDBKeyRange = IDBKeyRange
  Object.assign((db as unknown as { _deps: { indexedDB?: IDBFactory; IDBKeyRange?: typeof IDBKeyRange } })._deps, {
    indexedDB,
    IDBKeyRange,
  })
  db.close()
  await db.delete()
  await db.open()
})

describe('cambridgeWritingTestLocalRepo', () => {
  it('create/read/list/update/archive/delete draft', async () => {
    const created = await cambridgeWritingTestLocalRepo.create({
      id: 'pet-b1-test-99',
      contentKey: 'cambridge-writing:b1:pet-b1-test-99',
      level: 'b1',
      testNumber: 99,
      payload: payload('pet-b1-test-99', 'b1', 99),
    })

    expect(created.status).toBe('draft')
    expect(created.source).toBe('admin_local')
    expect((await cambridgeWritingTestLocalRepo.getById(created.id))?.id).toBe(created.id)
    expect((await cambridgeWritingTestLocalRepo.listByLevel('b1')).map(record => record.id)).toContain(created.id)

    const updated = await cambridgeWritingTestLocalRepo.update(created.id, {
      payload: payload('pet-b1-test-99', 'b1', 99),
      createdBy: 'admin-1',
    })
    expect(updated.createdBy).toBe('admin-1')

    const archived = await cambridgeWritingTestLocalRepo.archive(created.id)
    expect(archived.status).toBe('archived')

    await expect(cambridgeWritingTestLocalRepo.deleteDraft(created.id)).rejects.toThrow(/Only local drafts/)

    const freshDraft = await cambridgeWritingTestLocalRepo.create({
      id: 'pet-b1-test-98',
      contentKey: 'cambridge-writing:b1:pet-b1-test-98',
      level: 'b1',
      testNumber: 98,
      payload: payload('pet-b1-test-98', 'b1', 98),
    })
    await cambridgeWritingTestLocalRepo.deleteDraft(freshDraft.id)
    expect(await cambridgeWritingTestLocalRepo.getById(freshDraft.id)).toBeUndefined()
  })

  it('rejects duplicate id and contentKey', async () => {
    await cambridgeWritingTestLocalRepo.create({
      id: 'ket-a2-test-02',
      contentKey: 'cambridge-writing:a2:ket-a2-test-02',
      level: 'a2',
      testNumber: 2,
      payload: payload('ket-a2-test-02', 'a2', 2),
    })

    await expect(cambridgeWritingTestLocalRepo.create({
      id: 'ket-a2-test-02',
      contentKey: 'cambridge-writing:a2:ket-a2-test-03',
      level: 'a2',
      testNumber: 3,
      payload: payload('ket-a2-test-02', 'a2', 3),
    })).rejects.toThrow(/id already exists/)

    await expect(cambridgeWritingTestLocalRepo.create({
      id: 'ket-a2-test-03',
      contentKey: 'cambridge-writing:a2:ket-a2-test-02',
      level: 'a2',
      testNumber: 3,
      payload: payload('ket-a2-test-03', 'a2', 3),
    })).rejects.toThrow(/contentKey already exists/)
  })

  it('increments version only when payload changes', async () => {
    const created = await cambridgeWritingTestLocalRepo.create({
      id: 'fce-b2-test-07',
      contentKey: 'cambridge-writing:b2:fce-b2-test-07',
      level: 'b2',
      testNumber: 7,
      payload: payload('fce-b2-test-07', 'b2', 7),
    })

    const samePayload = await cambridgeWritingTestLocalRepo.update(created.id, {
      createdBy: 'admin-2',
    })
    expect(samePayload.version).toBe(1)

    const changedPayload = await cambridgeWritingTestLocalRepo.update(created.id, {
      payload: {
        ...payload('fce-b2-test-07', 'b2', 7),
        title: 'Changed title',
      },
    })
    expect(changedPayload.version).toBe(2)
  })

  it('detects test number conflicts', async () => {
    await cambridgeWritingTestLocalRepo.create({
      id: 'cae-c1-test-03',
      contentKey: 'cambridge-writing:c1:cae-c1-test-03',
      level: 'c1',
      testNumber: 3,
      payload: payload('cae-c1-test-03', 'c1', 3),
    })

    expect(await cambridgeWritingTestLocalRepo.findConflictingTestNumber('c1', 3)).toBeTruthy()

    await expect(cambridgeWritingTestLocalRepo.create({
      id: 'cae-c1-test-04',
      contentKey: 'cambridge-writing:c1:cae-c1-test-04',
      level: 'c1',
      testNumber: 3,
      payload: payload('cae-c1-test-04', 'c1', 3),
    })).rejects.toThrow(/testNumber already exists/)
  })
})
