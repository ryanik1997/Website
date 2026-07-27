import { useLiveQuery } from 'dexie-react-hooks'
import type { CambridgeWritingLevel, CambridgeWritingTask, CambridgeWritingTest } from '@ryan/catalog'
import { useIsAdmin } from '../auth/useIsAdmin'
import { cambridgeWritingTestRepo } from './cambridgeWritingTestRepo'

type CollectionResult = {
  tests: CambridgeWritingTest[]
  testCount: number
  taskCount: number
  errors: string[]
}

type TestResult = {
  test: CambridgeWritingTest | null
  errors: string[]
}

type TaskResult = {
  test: CambridgeWritingTest | null
  task: CambridgeWritingTask | null
  errors: string[]
}

export function useCambridgeWritingCollection(level: CambridgeWritingLevel) {
  const isAdmin = useIsAdmin()
  const includeDrafts = isAdmin === true

  return useLiveQuery(async (): Promise<CollectionResult> => {
    const result = await cambridgeWritingTestRepo.listByLevel(level, { includeDrafts })
    return {
      tests: result.tests,
      testCount: result.tests.length,
      taskCount: result.tests.reduce((sum, test) => sum + test.tasks.length, 0),
      errors: result.errors,
    }
  }, [level, includeDrafts])
}

export function useCambridgeWritingTest(level: CambridgeWritingLevel, testId: string | undefined) {
  const isAdmin = useIsAdmin()
  const includeDrafts = isAdmin === true

  return useLiveQuery(async (): Promise<TestResult> => {
    if (!testId) return { test: null, errors: [] }
    return cambridgeWritingTestRepo.getTest(level, testId, { includeDrafts })
  }, [level, testId, includeDrafts])
}

export function useCambridgeWritingTask(level: CambridgeWritingLevel, testId: string | undefined, taskId: string | undefined) {
  const isAdmin = useIsAdmin()
  const includeDrafts = isAdmin === true

  return useLiveQuery(async (): Promise<TaskResult> => {
    if (!testId || !taskId) return { test: null, task: null, errors: [] }
    return cambridgeWritingTestRepo.getTask(level, testId, taskId, { includeDrafts })
  }, [level, testId, taskId, includeDrafts])
}
