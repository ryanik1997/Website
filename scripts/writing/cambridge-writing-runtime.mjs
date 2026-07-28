import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { CambridgeWritingTestSchema } from '../../packages/catalog/src/cambridge/writing/schema.ts'
import { CAMBRIDGE_WRITING_LEVELS, formatNumber, getLevelConfig, getTaskId, getTestId, getTestTitle } from './cambridge-writing-level-config.mjs'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const DATA_ROOT = path.join(ROOT, 'packages/catalog/data/cambridge-writing')
export const TMP_ROOT = path.join(ROOT, 'tmp')

const require = createRequire(path.join(ROOT, 'packages/catalog/package.json'))
const { z } = require('zod')

export const TestSchema = CambridgeWritingTestSchema

export const VerificationSchema = z.object({
  valid: z.boolean(), overallScore: z.number().min(0).max(100),
  dimensionScores: z.object({ formatAccuracy: z.number(), levelAppropriacy: z.number(), clarity: z.number(), answerability: z.number(), genreAuthenticity: z.number(), topicOriginality: z.number(), culturalFairness: z.number(), internalConsistency: z.number() }),
  issues: z.array(z.object({ severity: z.enum(['warning', 'error']), taskId: z.string().optional(), code: z.string(), message: z.string(), suggestedAction: z.string() })),
  duplicateRisk: z.object({ highRisk: z.boolean(), similarToTestIds: z.array(z.string()) }),
  approvedForDraftCatalog: z.boolean(),
})

export function parseArgs(argv = process.argv.slice(2)) {
  const args = {}
  for (const token of argv) {
    if (!token.startsWith('--')) continue
    const [key, value] = token.slice(2).split('=', 2)
    args[key] = value ?? true
  }
  return args
}

export function selectedLevels(value = 'all') {
  if (value === 'all') return CAMBRIDGE_WRITING_LEVELS
  if (!CAMBRIDGE_WRITING_LEVELS.includes(value)) throw new Error(`Invalid --level=${value}`)
  return [value]
}

export function testPath(level, testNumber) {
  return path.join(DATA_ROOT, level, `${getTestId(level, testNumber)}.json`)
}

export async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'))
}

export async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`)
}

export async function listGeneratedFiles(level = 'all') {
  const levels = selectedLevels(level)
  const files = []
  for (const current of levels) {
    try {
      for (const name of await fs.readdir(path.join(DATA_ROOT, current))) {
        if (/^[a-z][0-9]-test-\d+\.json$/.test(name)) files.push(path.join(DATA_ROOT, current, name))
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  return files.sort()
}

export function passVerification(review) {
  return review.valid === true
    && review.overallScore >= 88
    && review.approvedForDraftCatalog === true
    && review.duplicateRisk.highRisk === false
    && !review.issues.some(issue => issue.severity === 'error')
    && Object.values(review.dimensionScores).every(score => score >= 80)
}

export function assertIdentity(test) {
  const config = getLevelConfig(test.level)
  const errors = []
  if (test.id !== getTestId(test.level, test.testNumber)) errors.push('test ID does not match level/testNumber')
  if (test.title !== getTestTitle(test.level, test.testNumber)) errors.push('title does not match canonical title')
  if (test.tasks.length !== config.testTaskCount) errors.push(`expected ${config.testTaskCount} tasks`)
  config.tasks.forEach((expected, index) => {
    const task = test.tasks[index]
    if (!task) return
    if (task.id !== getTaskId(test.level, test.testNumber, expected.taskNumber)) errors.push(`task ${index + 1} ID mismatch`)
    if (task.partNumber !== expected.partNumber || task.taskNumber !== expected.taskNumber) errors.push(`task ${index + 1} numbering mismatch`)
    if (task.genre !== expected.genre) errors.push(`task ${index + 1} genre mismatch`)
    if (task.metadata?.compulsory !== expected.compulsory) errors.push(`task ${index + 1} compulsory flag mismatch`)
    const min = expected.wordLimit?.min ?? expected.minWords
    const max = expected.wordLimit?.max ?? expected.maxWords
    if (task.wordLimit?.min !== min || task.wordLimit?.max !== max) errors.push(`task ${index + 1} word limit mismatch`)
    if (!expected.compulsory && test.level !== 'b1' && task.presentation?.selectionRequired !== 1) errors.push(`task ${index + 1} selectionRequired must be 1`)
  })
  if (test.status !== 'draft' && test.status !== 'published') errors.push('generated test status must be draft or published')
  if (test.sourceUrl !== undefined) errors.push('AI-generated test sourceUrl must be undefined')
  if (errors.length) throw new Error(`${test.id}: ${errors.join('; ')}`)
}

export function sourcePathFor(level, testNumber) {
  return `packages/catalog/data/cambridge-writing/${level}/${getTestId(level, testNumber)}.json`
}

export function exactSchemaDescription() {
  return {
    test: { required: ['id', 'level', 'testNumber', 'title', 'status', 'version', 'sourceFile', 'tasks'], forbidden: ['sourceUrl', 'sampleAnswers'] },
    task: { required: ['id', 'partNumber', 'taskNumber', 'title', 'genre', 'instruction', 'wordLimit', 'metadata'], optional: ['promptText', 'promptBlocks', 'presentation'] },
    promptBlockTypes: ['paragraph', 'panel', 'email', 'source-text', 'final-instruction'],
  }
}

export { formatNumber }
