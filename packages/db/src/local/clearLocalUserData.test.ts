import Dexie from 'dexie'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearLocalUserData } from './clearLocalUserData'
import { db } from './schema'

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
  localStorage.clear()
})

describe('clearLocalUserData', () => {
  it('clears cambridgeWritingTests along with existing tables', async () => {
    await db.settings.put({ key: 'x', value: 1 })
    await db.cambridgeWritingTests.put({
      id: 'pet-b1-test-12',
      contentKey: 'cambridge-writing:b1:pet-b1-test-12',
      level: 'b1',
      testNumber: 12,
      status: 'draft',
      source: 'admin_local',
      version: 1,
      payload: { ok: true },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await clearLocalUserData()

    expect(await db.settings.count()).toBe(0)
    expect(await db.cambridgeWritingTests.count()).toBe(0)
  })
})
