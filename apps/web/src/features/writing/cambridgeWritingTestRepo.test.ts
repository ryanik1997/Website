import Dexie from 'dexie'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
import { beforeEach, describe, expect, it } from 'vitest'
import { db, cambridgeWritingTestLocalRepo } from '@ryan/db'
import type { CambridgeWritingTest } from '@ryan/catalog'
import { cambridgeWritingTestRepo } from './cambridgeWritingTestRepo'

function makeTest(level: 'a2' | 'b1' | 'b2' | 'c1' | 'c2', id: string, testNumber: number, title = `${level.toUpperCase()} custom`) {
  return {
    id,
    level,
    testNumber,
    title,
    status: 'draft',
    version: 1,
    tasks: [
      {
        id: `${id}-task-01`,
        partNumber: 1,
        taskNumber: 1,
        title: 'Question 1',
        genre: 'email',
        instruction: 'Write your answer.',
      },
    ],
  } satisfies CambridgeWritingTest
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

describe('cambridgeWritingTestRepo merge', () => {
  it('shows seed tests for A2-C2 through the same code path', async () => {
    for (const level of ['a2', 'b1', 'b2', 'c1', 'c2'] as const) {
      const result = await cambridgeWritingTestRepo.listByLevel(level)
      expect(result.tests.length).toBeGreaterThan(0)
      expect(result.errors).toEqual([])
    }
  })

  it('published_sync overrides seed, admin_local overrides published_sync', async () => {
    await cambridgeWritingTestLocalRepo.create({
      id: 'ket-a2-book4-test2',
      contentKey: 'cambridge-writing:a2:ket-a2-book4-test2',
      level: 'a2',
      testNumber: 1,
      status: 'published',
      source: 'published_sync',
      payload: makeTest('a2', 'ket-a2-book4-test2', 1, 'Published override'),
    })

    let result = await cambridgeWritingTestRepo.getTest('a2', 'ket-a2-book4-test2')
    expect(result.test?.title).toBe('Published override')

    await cambridgeWritingTestLocalRepo.update('ket-a2-book4-test2', {
      status: 'draft',
      source: 'admin_local',
      payload: makeTest('a2', 'ket-a2-book4-test2', 1, 'Admin override'),
    })

    result = await cambridgeWritingTestRepo.getTest('a2', 'ket-a2-book4-test2', { includeDrafts: true })
    expect(result.test?.title).toBe('Admin override')
  })

  it('hides drafts from normal users and shows them for admin mode', async () => {
    await cambridgeWritingTestRepo.createDraft(makeTest('b1', 'pet-b1-test-99', 99))

    const normal = await cambridgeWritingTestRepo.listByLevel('b1')
    expect(normal.tests.some(test => test.id === 'pet-b1-test-99')).toBe(false)

    const admin = await cambridgeWritingTestRepo.listByLevel('b1', { includeDrafts: true })
    expect(admin.tests.some(test => test.id === 'pet-b1-test-99')).toBe(true)
  })

  it('archived records hide lower-precedence content', async () => {
    await cambridgeWritingTestLocalRepo.create({
      id: 'b1-test-01',
      contentKey: 'cambridge-writing:b1:b1-test-01',
      level: 'b1',
      testNumber: 1,
      status: 'archived',
      source: 'admin_local',
      payload: makeTest('b1', 'b1-test-01', 1),
    })

    const result = await cambridgeWritingTestRepo.listByLevel('b1', { includeDrafts: true })
    expect(result.tests.some(test => test.id === 'b1-test-01')).toBe(false)
  })

  it('reports invalid payloads without crashing', async () => {
    await db.cambridgeWritingTests.add({
      id: 'broken-c2-test',
      contentKey: 'cambridge-writing:c2:broken-c2-test',
      level: 'c2',
      testNumber: 55,
      status: 'published',
      source: 'published_sync',
      version: 1,
      payload: { nope: true },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const result = await cambridgeWritingTestRepo.listByLevel('c2')
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.tests.some(test => test.id === 'broken-c2-test')).toBe(false)
  })
})
