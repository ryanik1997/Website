#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { buildPlan, validatePlan } from './plan-cambridge-writing-corpus.mjs'
import { getLevelConfig, getTestId } from './cambridge-writing-level-config.mjs'
import { callCambridgeWritingAi, contentHash, getAiIdentity, isAiConfigured } from './cambridge-writing-ai-provider.mjs'
import { buildGeneratorPrompt, GENERATOR_SYSTEM_PROMPT } from './cambridge-writing-prompts.mjs'
import { ROOT, TMP_ROOT, TestSchema, assertIdentity, exactSchemaDescription, parseArgs, readJson, selectedLevels, sourcePathFor, testPath, writeJson } from './cambridge-writing-runtime.mjs'

const PLAN_FILE = path.join(TMP_ROOT, 'cambridge-writing-generation-plan.json')
const STAGING_ROOT = path.join(TMP_ROOT, 'cambridge-writing-staging')
const REVIEW_ROOT = path.join(TMP_ROOT, 'cambridge-writing-design-reviews')

function numberArg(value, fallback) {
  const result = value === undefined ? fallback : Number.parseInt(String(value), 10)
  if (!Number.isInteger(result) || result < 1) throw new Error(`Expected positive integer, got ${value}`)
  return result
}

async function existingSummaries(level) {
  const summaries = []
  for (let number = 1; number < 1000; number += 1) {
    try {
      const test = await readJson(testPath(level, number))
      summaries.push({ testId: test.id, tasks: test.tasks.map(task => ({ genre: task.genre, summary: task.promptText ?? task.instruction })) })
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      if (number > getLevelConfig(level).newTestCount + 1) break
    }
  }
  return summaries
}

async function resumable(level, testNumber) {
  try {
    const test = TestSchema.parse(await readJson(testPath(level, testNumber)))
    return test.provenance?.reviewStatus === 'ai-verified' && contentHash(test) === test.provenance.contentHash
  } catch {
    return false
  }
}

async function generateOne(row, batchId, options) {
  if (!options.force && await resumable(row.level, row.testNumber)) return { testId: row.testId, status: 'skipped_verified' }
  const stagingFile = path.join(STAGING_ROOT, row.level, `${row.testId}.json`)
  if (options.onlyMissing && !options.force) {
    try {
      TestSchema.parse(await readJson(stagingFile))
      return { testId: row.testId, status: 'skipped_staging' }
    } catch {}
  }
  const config = getLevelConfig(row.level)
  const summaries = await existingSummaries(row.level)
  const response = await callCambridgeWritingAi({
    role: 'generation',
    systemPrompt: GENERATOR_SYSTEM_PROMPT,
    userPrompt: buildGeneratorPrompt({ level: row.level, config, planRow: row, existingSummaries: summaries, schemaDescription: exactSchemaDescription() }),
    temperature: row.level === 'c2' ? 0.5 : 0.6,
    timeoutMs: options.requestTimeout,
    maxRetries: options.maxRetries,
  })
  const envelope = response?.test ? response : { test: response, designReview: {} }
  const identity = getAiIdentity('generation')
  const test = {
    ...envelope.test,
    id: getTestId(row.level, row.testNumber),
    level: row.level,
    testNumber: row.testNumber,
    sourceUrl: undefined,
    sourceFile: sourcePathFor(row.level, row.testNumber),
    status: 'draft',
    version: 1,
    provenance: {
      origin: 'ai-generated', provider: identity.provider, model: identity.model, promptVersion: 1, generationBatchId: batchId, generatedAt: Date.now(), contentHash: '', reviewStatus: 'unreviewed',
    },
  }
  test.provenance.contentHash = contentHash(test)
  const parsed = TestSchema.parse(test)
  assertIdentity(parsed)
  await writeJson(stagingFile, parsed)
  await writeJson(path.join(REVIEW_ROOT, row.level, `${row.testId}.review.json`), envelope.designReview ?? {})
  return { testId: row.testId, status: 'generated' }
}

async function runPool(rows, concurrency, worker) {
  const results = new Array(rows.length)
  let cursor = 0
  async function run() {
    while (cursor < rows.length) {
      const index = cursor
      cursor += 1
      try { results[index] = await worker(rows[index]) }
      catch (error) { results[index] = { testId: rows[index].testId, status: 'failed', error: error instanceof Error ? error.message : String(error) } }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, rows.length) }, run))
  return results
}

async function main() {
  const args = parseArgs()
  if (!isAiConfigured('generation')) throw new Error('Generation AI is not configured. Set CAMBRIDGE_WRITING_AI_PROVIDER, CAMBRIDGE_WRITING_AI_MODEL, and CAMBRIDGE_WRITING_AI_KEY.')
  let plan
  try { plan = (await readJson(PLAN_FILE)).rows }
  catch { plan = buildPlan(); validatePlan(plan) }
  const levels = selectedLevels(args.level ?? 'all')
  const defaultTo = Math.max(...levels.map(level => getLevelConfig(level).newTestCount + 1))
  const from = numberArg(args.from, 2)
  const to = numberArg(args.to, defaultTo)
  const concurrency = numberArg(args.concurrency, 2)
  const batchSize = numberArg(args['batch-size'], 5)
  const options = { force: args.force === true, onlyMissing: args['only-missing'] === true, requestTimeout: numberArg(args['request-timeout'], 120000), maxRetries: numberArg(args['max-retries'], 2) }
  const rows = plan.filter(row => levels.includes(row.level) && row.testNumber >= from && row.testNumber <= to)
  const allResults = []
  for (let start = 0; start < rows.length; start += batchSize) {
    const chunk = rows.slice(start, start + batchSize)
    const batchId = `${chunk[0].testId}-to-${chunk.at(-1).testId}-${Date.now()}`
    const results = await runPool(chunk, concurrency, row => generateOne(row, batchId, options))
    allResults.push(...results)
    const report = { batchId, generatedAt: Date.now(), requested: chunk.length, results, failed: results.filter(item => item.status === 'failed').length }
    await writeJson(path.join(TMP_ROOT, 'cambridge-writing-batches', batchId, 'report.json'), report)
    await fs.writeFile(path.join(TMP_ROOT, 'cambridge-writing-batches', batchId, 'report.md'), `# Cambridge Writing batch ${batchId}\n\n- Requested: ${report.requested}\n- Failed: ${report.failed}\n`)
    for (const level of levels) {
      const levelResults = results.filter((_, index) => chunk[index]?.level === level)
      if (levelResults.length && levelResults.filter(item => item.status === 'failed').length / levelResults.length > 0.2) throw new Error(`${level.toUpperCase()} failed more than 20% in batch ${batchId}; generation stopped.`)
    }
  }
  console.log(JSON.stringify({ requested: rows.length, results: allResults }, null, 2))
  if (allResults.some(item => item.status === 'failed')) process.exitCode = 1
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
