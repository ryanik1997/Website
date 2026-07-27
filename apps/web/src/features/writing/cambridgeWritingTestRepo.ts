import {
  CambridgeWritingTestSchema,
  getCambridgeWritingCollection,
  type CambridgeWritingLevel,
  type CambridgeWritingTask,
  type CambridgeWritingTest,
} from '@ryan/catalog'
import {
  cambridgeWritingTestLocalRepo,
  type CambridgeWritingRecordLevel,
  type CambridgeWritingTestRecord,
} from '@ryan/db'

type MergeOptions = {
  includeDrafts?: boolean
}

type ValidationResult =
  | { ok: true; test: CambridgeWritingTest }
  | { ok: false; errors: string[] }

type ListResult = {
  tests: CambridgeWritingTest[]
  errors: string[]
}

const SOURCE_RANK = {
  seed: 0,
  published_sync: 1,
  admin_local: 2,
} as const

function toContentKey(level: CambridgeWritingRecordLevel, id: string) {
  return `cambridge-writing:${level}:${id}`
}

function seedTests(level: CambridgeWritingLevel) {
  return getCambridgeWritingCollection(level).tests
}

export function validateRecord(record: CambridgeWritingTestRecord): ValidationResult {
  const parsed = CambridgeWritingTestSchema.safeParse(record.payload)
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map(issue => `${record.id}: ${issue.path.join('.') || 'payload'} ${issue.message}`),
    }
  }

  const test = parsed.data
  const errors: string[] = []
  if (test.id !== record.id) errors.push(`${record.id}: payload.id mismatch`)
  if (test.level !== record.level) errors.push(`${record.id}: payload.level mismatch`)
  if (test.testNumber !== record.testNumber) errors.push(`${record.id}: payload.testNumber mismatch`)

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, test }
}

async function mergedTests(level: CambridgeWritingLevel, options: MergeOptions = {}): Promise<ListResult> {
  const includeDrafts = options.includeDrafts === true
  const testsById = new Map<string, CambridgeWritingTest>(seedTests(level).map(test => [test.id, test]))
  const errors: string[] = []
  const records = await cambridgeWritingTestLocalRepo.listByLevel(level)

  const ordered = [...records].sort((a, b) => {
    const rankDiff = SOURCE_RANK[a.source] - SOURCE_RANK[b.source]
    if (rankDiff !== 0) return rankDiff
    return a.updatedAt - b.updatedAt
  })

  for (const record of ordered) {
    const validated = validateRecord(record)
    if (!validated.ok) {
      errors.push(...validated.errors)
      continue
    }
    if (record.status === 'draft' && !includeDrafts) continue
    if (record.status === 'archived') {
      testsById.delete(record.id)
      continue
    }
    testsById.set(record.id, validated.test)
  }

  const tests = [...testsById.values()].sort((a, b) => a.testNumber - b.testNumber || a.title.localeCompare(b.title))
  return { tests, errors }
}

export const cambridgeWritingTestRepo = {
  listByLevel(level: CambridgeWritingLevel, options?: MergeOptions): Promise<ListResult> {
    return mergedTests(level, options)
  },

  async getTest(level: CambridgeWritingLevel, testId: string, options?: MergeOptions): Promise<{ test: CambridgeWritingTest | null; errors: string[] }> {
    const { tests, errors } = await mergedTests(level, options)
    return {
      test: tests.find(test => test.id === testId) ?? null,
      errors,
    }
  },

  async getTask(level: CambridgeWritingLevel, testId: string, taskId: string, options?: MergeOptions): Promise<{ task: CambridgeWritingTask | null; test: CambridgeWritingTest | null; errors: string[] }> {
    const { test, errors } = await this.getTest(level, testId, options)
    return {
      test,
      task: test?.tasks.find(task => task.id === taskId) ?? null,
      errors,
    }
  },

  async createDraft(test: CambridgeWritingTest): Promise<CambridgeWritingTestRecord> {
    const parsed = CambridgeWritingTestSchema.parse(test)
    return cambridgeWritingTestLocalRepo.create({
      id: parsed.id,
      contentKey: toContentKey(parsed.level, parsed.id),
      level: parsed.level,
      testNumber: parsed.testNumber,
      payload: parsed,
      status: 'draft',
      source: 'admin_local',
    })
  },

  async updateDraft(testId: string, test: CambridgeWritingTest): Promise<CambridgeWritingTestRecord> {
    const parsed = CambridgeWritingTestSchema.parse(test)
    return cambridgeWritingTestLocalRepo.update(testId, {
      contentKey: toContentKey(parsed.level, parsed.id),
      testNumber: parsed.testNumber,
      payload: parsed,
      status: 'draft',
      source: 'admin_local',
    })
  },

  archiveTest(testId: string): Promise<CambridgeWritingTestRecord> {
    return cambridgeWritingTestLocalRepo.archive(testId)
  },

  deleteDraft(testId: string): Promise<void> {
    return cambridgeWritingTestLocalRepo.deleteDraft(testId)
  },

  validateRecord,
}
