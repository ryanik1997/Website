import Dexie from 'dexie'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db, cambridgeWritingTestLocalRepo } from '@ryan/db'
import type { CambridgeWritingTest } from '@ryan/catalog'
import {
  useCambridgeWritingCollection,
  useCambridgeWritingTask,
  useCambridgeWritingTest,
} from './useCambridgeWritingTests'

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
        promptText: 'Seed prompt',
        wordLimit: { min: 100, max: 100, displayText: '100 words' },
      },
    ],
  } satisfies CambridgeWritingTest
}

async function resetDb() {
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
}

beforeEach(async () => {
  await resetDb()
})

describe('useCambridgeWriting* hooks', () => {
  it('loads seed collection through the merged repo', async () => {
    const { result } = renderHook(() => useCambridgeWritingCollection('a2'))

    await waitFor(() => {
      expect(result.current?.tests.length).toBeGreaterThan(0)
    })

    expect(result.current?.testCount).toBeGreaterThan(0)
    expect(result.current?.taskCount).toBeGreaterThan(0)
    expect(result.current?.errors).toEqual([])
  })

  it('shows drafts for admin and hides them for users', async () => {
    await cambridgeWritingTestLocalRepo.create({
      id: 'pet-b1-test-99',
      contentKey: 'cambridge-writing:b1:pet-b1-test-99',
      level: 'b1',
      testNumber: 99,
      status: 'draft',
      source: 'admin_local',
      payload: makeTest('b1', 'pet-b1-test-99', 99, 'Admin draft'),
    })

    const userView = renderHook(() => useCambridgeWritingCollection('b1'))
    await waitFor(() => {
      expect(userView.result.current).toBeDefined()
    })
    expect(userView.result.current?.tests.some((test) => test.id === 'pet-b1-test-99')).toBe(false)

    await db.settings.put({ key: 'is_admin', value: true })

    const adminView = renderHook(() => useCambridgeWritingCollection('b1'))
    await waitFor(() => {
      expect(adminView.result.current?.tests.some((test) => test.id === 'pet-b1-test-99')).toBe(true)
    })
  })

  it('rerenders after Dexie mutations', async () => {
    await db.settings.put({ key: 'is_admin', value: true })
    const { result } = renderHook(() => useCambridgeWritingCollection('c1'))

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
    const before = result.current?.tests.length ?? 0

    await cambridgeWritingTestLocalRepo.create({
      id: 'c1-test-88',
      contentKey: 'cambridge-writing:c1:c1-test-88',
      level: 'c1',
      testNumber: 88,
      status: 'draft',
      source: 'admin_local',
      payload: makeTest('c1', 'c1-test-88', 88, 'Fresh draft'),
    })

    await waitFor(() => {
      expect(result.current?.tests.length).toBe(before + 1)
    })
  })

  it('returns safe errors for invalid payloads', async () => {
    await db.settings.put({ key: 'is_admin', value: true })
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

    const collection = renderHook(() => useCambridgeWritingCollection('c2'))
    await waitFor(() => {
      expect(collection.result.current?.errors.length).toBeGreaterThan(0)
    })
    expect(collection.result.current?.tests.some((test) => test.id === 'broken-c2-test')).toBe(false)

    const test = renderHook(() => useCambridgeWritingTest('c2', 'broken-c2-test'))
    await waitFor(() => {
      expect(test.result.current?.test).toBeNull()
    })

    const task = renderHook(() => useCambridgeWritingTask('c2', 'broken-c2-test', 'broken-task'))
    await waitFor(() => {
      expect(task.result.current?.task).toBeNull()
    })
  })
})
