#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { buildPlan, validatePlan } from './plan-cambridge-writing-corpus.mjs'
import { getLevelConfig, getTaskId, getTestId, getTestTitle } from './cambridge-writing-level-config.mjs'
import { callCambridgeWritingAi, contentHash, getAiIdentity, isAiConfigured } from './cambridge-writing-ai-provider.mjs'
import { buildGeneratorPrompt, GENERATOR_SYSTEM_PROMPT } from './cambridge-writing-prompts.mjs'
import { buildGenerationCacheKey, cachedGenerationMatches, PROMPT_VERSION, sha256 } from './cambridge-writing-ai-contracts.mjs'
import { originalityGate, taskFingerprint, taskText } from './cambridge-writing-similarity.mjs'
import { DATA_ROOT, ROOT, TMP_ROOT, TestSchema, assertIdentity, exactSchemaDescription, parseArgs, readJson, selectedLevels, sourcePathFor, testPath, writeJson } from './cambridge-writing-runtime.mjs'

const PLAN_FILE = path.join(TMP_ROOT, 'cambridge-writing-generation-plan.json')
const STAGING_ROOT = path.join(TMP_ROOT, 'cambridge-writing-staging')
const REVIEW_ROOT = path.join(TMP_ROOT, 'cambridge-writing-design-reviews')
const CACHE_ROOT = path.join(TMP_ROOT, 'cambridge-writing-cache')
const FAILED_ROOT = path.join(TMP_ROOT, 'cambridge-writing-failed')
const SEED_ROOT = path.join(ROOT, 'packages/catalog/src/cambridge/writing')

function numberArg(value, fallback) {
  const result = value === undefined ? fallback : Number.parseInt(String(value), 10)
  if (!Number.isInteger(result) || result < 1) throw new Error(`Expected positive integer, got ${value}`)
  return result
}

function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length
}

function conciseSummary(test, planRow = null) {
  return {
    testId: test.id,
    level: test.level,
    topicFamily: planRow?.topicFamily ?? null,
    designFingerprint: planRow?.designFingerprint ?? null,
    tasks: test.tasks.map(task => ({ taskId: task.id, genre: task.genre, summary: taskText(task).slice(0, 800), fingerprint: taskFingerprint(task) })),
  }
}

async function baselineTests() {
  const tests = []
  for (const level of ['b1', 'b2', 'c1', 'c2']) tests.push(await readJson(path.join(SEED_ROOT, level, `${level}-test-01.json`)))
  return tests
}

async function existingOutsideRange(from, to, planByTestId) {
  const tests = []
  for (const level of ['b1', 'b2', 'c1', 'c2']) {
    let names = []
    try { names = await fs.readdir(path.join(DATA_ROOT, level)) } catch (error) { if (error.code !== 'ENOENT') throw error }
    for (const name of names.filter(value => value.endsWith('.json'))) {
      const test = TestSchema.parse(await readJson(path.join(DATA_ROOT, level, name)))
      if (test.testNumber >= from && test.testNumber <= to) continue
      tests.push(conciseSummary(test, planByTestId.get(test.id)))
    }
  }
  return tests
}

async function resumable(level, testNumber) {
  try {
    const test = TestSchema.parse(await readJson(testPath(level, testNumber)))
    return test.provenance?.reviewStatus === 'ai-verified' && contentHash(test) === test.provenance.contentHash
  } catch {
    return false
  }
}

function sanitizePromptBlocks(promptBlocks) {
  if (!Array.isArray(promptBlocks)) return promptBlocks
  const TYPE_MAP = { 'final_instruction': 'final-instruction', 'final instruction': 'final-instruction', 'finalInstruction': 'final-instruction', 'finalinstruction': 'final-instruction', 'source_text': 'source-text', 'source text': 'source-text', 'sourceText': 'source-text', 'sourcetext': 'source-text', 'text': 'paragraph', 'paragraphs': 'paragraph', 'final': 'final-instruction' }
  const PANEL_VARIANTS = ['notes', 'announcement', 'opinions', 'generic']
  return promptBlocks.map(block => {
    if (!block || typeof block.type !== 'string') return block
    const normalized = TYPE_MAP[block.type] ?? block.type
    if (PANEL_VARIANTS.includes(normalized)) return { ...block, type: 'panel', variant: normalized }
    return { ...block, type: normalized }
  })
}

function normalizeTest(envelope, row, batchId, cacheMeta) {
  const config = getLevelConfig(row.level)
  const identity = getAiIdentity('generation')
  const normalizedTasks = config.tasks.map((expected, index) => {
    const generated = envelope.test?.tasks?.[index] ?? {}
    const min = expected.wordLimit?.min ?? expected.minWords
    const max = expected.wordLimit?.max ?? expected.maxWords
    const template = expected.template ?? (expected.genre === 'email' ? 'email' : expected.genre === 'article' ? 'announcement' : 'plain')
    const normalized = {
      ...generated,
      id: getTaskId(row.level, row.testNumber, expected.taskNumber),
      partNumber: expected.partNumber,
      taskNumber: expected.taskNumber,
      genre: expected.genre,
      promptBlocks: sanitizePromptBlocks(generated.promptBlocks),
      wordLimit: { ...generated.wordLimit, min, max, ...(expected.wordLimit?.displayText ? { displayText: expected.wordLimit.displayText } : {}) },
      metadata: { ...generated.metadata, compulsory: expected.compulsory },
      presentation: {
        ...(typeof generated.presentation === 'object' && generated.presentation !== null ? generated.presentation : {}),
        template,
        ...(!expected.compulsory && row.level !== 'b1' ? { selectionRequired: 1 } : {}),
      },
    }
    if (row.level === 'c2' && index === 0 && Array.isArray(normalized.promptBlocks)) {
    }
    return normalized
  })
  const test = {
    ...envelope.test,
    id: getTestId(row.level, row.testNumber),
    level: row.level,
    testNumber: row.testNumber,
    title: getTestTitle(row.level, row.testNumber),
    tasks: normalizedTasks,
    sourceUrl: undefined,
    sourceFile: sourcePathFor(row.level, row.testNumber),
    status: 'draft',
    version: 1,
    provenance: {
      origin: 'ai-generated', provider: identity.provider, model: identity.model, promptVersion: PROMPT_VERSION,
      generationBatchId: batchId, generatedAt: Date.now(), contentHash: '', promptHash: cacheMeta.inputHash,
      cacheKey: cacheMeta.cacheKey, inputHash: cacheMeta.inputHash, reviewStatus: 'unreviewed',
    },
  }
  const parsed = TestSchema.parse(test)
  assertIdentity(parsed)
  // Hash the canonical schema output so defaults/normalization cannot invalidate draft integrity.
  parsed.provenance.contentHash = contentHash(parsed)
  return parsed
}

async function cacheFile(cacheKey) {
  return path.join(CACHE_ROOT, `${sha256(cacheKey)}.json`)
}

async function loadCached(cacheMeta, request) {
  try {
    const cached = await readJson(await cacheFile(cacheMeta.cacheKey))
    if (!cachedGenerationMatches(cached, { ...request, inputHash: cacheMeta.inputHash })) return null
    return { test: TestSchema.parse(cached.test), designReview: cached.designReview ?? {}, source: 'cache' }
  } catch {
    return null
  }
}

async function quarantineFailure(row, error, details = {}) {
  await writeJson(path.join(FAILED_ROOT, row.level, `${row.testId}.generation.json`), {
    failedAt: Date.now(), testId: row.testId, level: row.level, error: error instanceof Error ? error.message : String(error), ...details,
  })
}

async function generateOne(row, batchId, options, context) {
  if (!options.forceRegenerate && await resumable(row.level, row.testNumber)) return { testId: row.testId, status: 'skipped_verified' }
  const stagingFile = path.join(STAGING_ROOT, row.level, `${row.testId}.json`)
  if (options.onlyMissing && !options.forceRegenerate) {
    try { TestSchema.parse(await readJson(stagingFile)); return { testId: row.testId, status: 'skipped_staging' } } catch {}
  }
  const config = getLevelConfig(row.level)
  const avoidanceCorpus = [...context.baselineSummaries, ...context.existingSummaries, ...context.acceptedSummaries]
  const identity = getAiIdentity('generation')
  const cacheMeta = buildGenerationCacheKey({
    promptVersion: PROMPT_VERSION, provider: identity.provider, model: identity.model, level: row.level, testId: row.testId,
    testNumber: row.testNumber, planRow: row, levelContract: config, avoidanceCorpus,
  })
  const requestIdentity = { testId: row.testId, level: row.level, testNumber: row.testNumber }
  let candidate = options.forceRegenerate ? null : await loadCached(cacheMeta, requestIdentity)
  let lastFailure = null
  for (let designAttempt = 0; designAttempt <= options.designRetries; designAttempt += 1) {
    try {
      let test
      let designReview
      if (candidate) {
        test = candidate.test
        designReview = candidate.designReview
      } else {
        const retryFeedback = lastFailure ? [{
          testId: row.testId,
          originalityFailure: lastFailure.failures,
          mandatoryAction: 'Redesign every affected task from the first sentence onward. Change the lead-in, candidate role, requested reasoning, content-point order, and closing context while preserving the required genre and plan fingerprint. Do not make a topic-noun substitution.',
        }] : []
        const response = await callCambridgeWritingAi({
          role: 'generation', systemPrompt: GENERATOR_SYSTEM_PROMPT,
          userPrompt: buildGeneratorPrompt({ level: row.level, config, planRow: row, existingSummaries: [...avoidanceCorpus, ...retryFeedback], schemaDescription: exactSchemaDescription() }),
          temperature: 0.45, timeoutMs: options.requestTimeout, maxRetries: options.maxRetries, maxTokens: row.level === 'c2' ? 8000 : 6000,
        })
        const envelope = response?.test ? response : { test: response, designReview: {} }
        test = normalizeTest(envelope, row, batchId, cacheMeta)
        designReview = envelope.designReview ?? {}
      }
      const gate = originalityGate(test, { baselineTests: context.baselines, checkpointTests: context.acceptedTests, planRows: context.planRows })
      if (!gate.valid) {
        lastFailure = gate
        candidate = null
        if (designAttempt >= options.designRetries) throw new Error(`${row.testId}: deterministic originality gate failed: ${gate.failures.map(item => item.reason).join(', ')}`)
        continue
      }
      await writeJson(stagingFile, test)
      await writeJson(path.join(REVIEW_ROOT, row.level, `${row.testId}.review.json`), { ...designReview, deterministicOriginality: { valid: true, fingerprintHash: gate.report.fingerprintHash } })
      await writeJson(await cacheFile(cacheMeta.cacheKey), { inputHash: cacheMeta.inputHash, cacheKey: cacheMeta.cacheKey, test, designReview, cachedAt: Date.now() })
      context.acceptedTests.push(test)
      context.acceptedSummaries.push(conciseSummary(test, row))
      return { testId: row.testId, status: candidate?.source === 'cache' ? 'cached_validated' : 'generated', inputHash: cacheMeta.inputHash }
    } catch (error) {
      candidate = null
      if (designAttempt >= options.designRetries) {
        await quarantineFailure(row, error, { originality: lastFailure?.failures ?? [] })
        throw error
      }
    }
  }
  throw new Error(`${row.testId}: generation attempts exhausted`)
}

async function invalidateCheckpointCache() {
  await fs.rm(CACHE_ROOT, { recursive: true, force: true })
  await fs.mkdir(CACHE_ROOT, { recursive: true })
}

async function main() {
  const args = parseArgs()
  if (!isAiConfigured('generation')) throw new Error('Generation AI is not configured. Set CAMBRIDGE_WRITING_AI_PROVIDER, CAMBRIDGE_WRITING_AI_MODEL, and CAMBRIDGE_WRITING_AI_KEY.')
  let plan
  try { plan = (await readJson(PLAN_FILE)).rows; validatePlan(plan) } catch { plan = buildPlan(); validatePlan(plan) }
  const levels = selectedLevels(args.level ?? 'all')
  const defaultTo = Math.max(...levels.map(level => getLevelConfig(level).newTestCount + 1))
  const from = numberArg(args.from, 2)
  const to = numberArg(args.to, defaultTo)
  const checkpoint = from === 2 && to === 6
  const forceRegenerate = args['force-regenerate'] === true || args.force === true
  if (args['invalidate-cache'] === true) await invalidateCheckpointCache()
  const options = {
    forceRegenerate, onlyMissing: args['only-missing'] === true, requestTimeout: numberArg(args['request-timeout'], 120000),
    maxRetries: numberArg(args['max-retries'], 2), designRetries: numberArg(args['design-retries'], 2),
  }
  const levelOrder = new Map(['b1', 'b2', 'c1', 'c2'].map((level, index) => [level, index]))
  const rows = plan.filter(row => levels.includes(row.level) && row.testNumber >= from && row.testNumber <= to)
    .sort((left, right) => left.testNumber - right.testNumber || levelOrder.get(left.level) - levelOrder.get(right.level))
  if (checkpoint && args.concurrency !== undefined && numberArg(args.concurrency, 1) !== 1) throw new Error('Checkpoint 02-06 requires --concurrency=1')
  if (checkpoint && args['batch-size'] !== undefined && numberArg(args['batch-size'], 1) !== 1) throw new Error('Checkpoint 02-06 requires --batch-size=1')
  const baselines = await baselineTests()
  const planByTestId = new Map(plan.map(row => [row.testId, row]))
  const context = {
    baselines,
    baselineSummaries: baselines.map(test => conciseSummary(test, null)),
    existingSummaries: await existingOutsideRange(from, to, planByTestId),
    acceptedTests: [], acceptedSummaries: [], planRows: plan,
  }
  if (options.onlyMissing && !options.forceRegenerate) {
    for (const row of rows) {
      try {
        const staged = TestSchema.parse(await readJson(path.join(STAGING_ROOT, row.level, `${row.testId}.json`)))
        const gate = originalityGate(staged, { baselineTests: baselines, checkpointTests: context.acceptedTests, planRows: plan })
        if (!gate.valid) throw new Error(`${row.testId}: existing staging failed deterministic originality: ${gate.failures.map(item => item.reason).join(', ')}`)
        context.acceptedTests.push(staged)
        context.acceptedSummaries.push(conciseSummary(staged, row))
      } catch (error) {
        if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) {
          if (String(error).includes('existing staging failed deterministic originality')) throw error
        }
      }
    }
  }
  const results = []
  for (const row of rows) {
    const batchId = `${row.testId}-${Date.now()}`
    let result
    try { result = await generateOne(row, batchId, options, context) }
    catch (error) { result = { testId: row.testId, status: 'failed', error: error instanceof Error ? error.message : String(error) } }
    results.push(result)
    const report = { batchId, generatedAt: Date.now(), requested: 1, results: [result], failed: result.status === 'failed' ? 1 : 0 }
    await writeJson(path.join(TMP_ROOT, 'cambridge-writing-batches', batchId, 'report.json'), report)
    await fs.writeFile(path.join(TMP_ROOT, 'cambridge-writing-batches', batchId, 'report.md'), `# Cambridge Writing batch ${batchId}\n\n- Requested: 1\n- Failed: ${report.failed}\n`)
    if (result.status === 'failed') break
  }
  console.log(JSON.stringify({ requested: rows.length, completed: results.length, results }, null, 2))
  if (results.length !== rows.length || results.some(item => item.status === 'failed')) process.exitCode = 1
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
