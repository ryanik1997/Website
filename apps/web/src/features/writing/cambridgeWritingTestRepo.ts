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

export type CambridgeWritingMergedOrigin = 'seed' | 'published_sync' | 'admin_local'

export type CambridgeWritingMergedTest = {
  test: CambridgeWritingTest
  origin: CambridgeWritingMergedOrigin
  status: 'draft' | 'published' | 'archived'
  editable: boolean
  version: number
  recordId: string
}

type ValidationResult =
  | { ok: true; test: CambridgeWritingTest }
  | { ok: false; errors: string[] }

type ListResult = {
  items: CambridgeWritingMergedTest[]
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
  const itemsById = new Map<string, CambridgeWritingMergedTest>(
    seedTests(level).map(test => [test.id, {
      test,
      origin: 'seed',
      status: test.status ?? 'published',
      editable: false,
      version: test.version ?? 1,
      recordId: test.id,
    }]),
  )
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
      itemsById.delete(record.id)
      continue
    }
    itemsById.set(record.id, {
      test: validated.test,
      origin: record.source,
      status: record.status,
      editable: record.source === 'admin_local' && record.status === 'draft',
      version: record.version,
      recordId: record.id,
    })
  }

  const items = [...itemsById.values()].sort((a, b) => a.test.testNumber - b.test.testNumber || a.test.title.localeCompare(b.test.title))
  return { items, tests: items.map(item => item.test), errors }
}

export const cambridgeWritingTestRepo = {
  listByLevel(level: CambridgeWritingLevel, options?: MergeOptions): Promise<ListResult> {
    return mergedTests(level, options)
  },

  async getTest(level: CambridgeWritingLevel, testId: string, options?: MergeOptions): Promise<{ item: CambridgeWritingMergedTest | null; test: CambridgeWritingTest | null; errors: string[] }> {
    const { items, errors } = await mergedTests(level, options)
    const item = items.find(test => test.test.id === testId) ?? null
    return {
      item,
      test: item?.test ?? null,
      errors,
    }
  },

  async getTask(level: CambridgeWritingLevel, testId: string, taskId: string, options?: MergeOptions): Promise<{ item: CambridgeWritingMergedTest | null; task: CambridgeWritingTask | null; test: CambridgeWritingTest | null; errors: string[] }> {
    const { item, test, errors } = await this.getTest(level, testId, options)
    return {
      item,
      test,
      task: test?.tasks.find(task => task.id === taskId) ?? null,
      errors,
    }
  },

  async createDraft(test: CambridgeWritingTest, options?: { createdBy?: string }): Promise<CambridgeWritingTestRecord> {
    const parsed = CambridgeWritingTestSchema.parse(test)
    return cambridgeWritingTestLocalRepo.create({
      id: parsed.id,
      contentKey: toContentKey(parsed.level, parsed.id),
      level: parsed.level,
      testNumber: parsed.testNumber,
      payload: parsed,
      status: 'draft',
      source: 'admin_local',
      createdBy: options?.createdBy,
    })
  },

  async updateDraft(testId: string, test: CambridgeWritingTest, options?: { createdBy?: string }): Promise<CambridgeWritingTestRecord> {
    const parsed = CambridgeWritingTestSchema.parse(test)
    return cambridgeWritingTestLocalRepo.update(testId, {
      contentKey: toContentKey(parsed.level, parsed.id),
      testNumber: parsed.testNumber,
      payload: parsed,
      status: 'draft',
      source: 'admin_local',
      createdBy: options?.createdBy,
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
