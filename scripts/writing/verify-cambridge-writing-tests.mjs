#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { buildPlan } from './plan-cambridge-writing-corpus.mjs'
import { getLevelConfig } from './cambridge-writing-level-config.mjs'
import { callCambridgeWritingAi, contentHash, getAiIdentity, isAiConfigured } from './cambridge-writing-ai-provider.mjs'
import { buildRevisionPrompt, buildVerifierPrompt, VERIFIER_SYSTEM_PROMPT } from './cambridge-writing-prompts.mjs'
import { buildDiversityReport, originalityGate, taskFingerprint, taskText } from './cambridge-writing-similarity.mjs'
import { DATA_ROOT, ROOT, TMP_ROOT, TestSchema, VerificationSchema, assertIdentity, listGeneratedFiles, parseArgs, passVerification, readJson, selectedLevels, writeJson } from './cambridge-writing-runtime.mjs'

const STAGING_ROOT = path.join(TMP_ROOT, 'cambridge-writing-staging')
const FAILED_ROOT = path.join(TMP_ROOT, 'cambridge-writing-failed')
const VERIFICATION_ROOT = path.join(TMP_ROOT, 'cambridge-writing-verification')
const SEED_ROOT = path.join(ROOT, 'packages/catalog/src/cambridge/writing')

async function stagingFiles(levelArg, from = 2, to = Number.MAX_SAFE_INTEGER) {
  const files = []
  for (const level of selectedLevels(levelArg)) {
    try {
      for (const name of await fs.readdir(path.join(STAGING_ROOT, level))) {
        const match = name.match(/-test-(\d+)\.json$/)
        if (match && Number(match[1]) >= from && Number(match[1]) <= to) files.push(path.join(STAGING_ROOT, level, name))
      }
    } catch (error) { if (error.code !== 'ENOENT') throw error }
  }
  return files.sort((left, right) => {
    const numberDiff = Number(left.match(/-test-(\d+)/)?.[1]) - Number(right.match(/-test-(\d+)/)?.[1])
    if (numberDiff) return numberDiff
    return ['b1', 'b2', 'c1', 'c2'].findIndex(level => left.includes(`${path.sep}${level}${path.sep}`)) - ['b1', 'b2', 'c1', 'c2'].findIndex(level => right.includes(`${path.sep}${level}${path.sep}`))
  })
}

async function seedTests() {
  return Promise.all(['b1', 'b2', 'c1', 'c2'].map(level => readJson(path.join(SEED_ROOT, level, `${level}-test-01.json`))))
}

async function productionOutsideCheckpoint(excludeId, from, to) {
  const files = await listGeneratedFiles('all')
  const tests = []
  for (const file of files) {
    const test = TestSchema.parse(await readJson(file))
    if (test.id !== excludeId && (test.testNumber < from || test.testNumber > to)) tests.push(test)
  }
  return tests
}

function corpusSummary(test) {
  return {
    testId: test.id,
    level: test.level,
    tasks: test.tasks.map(task => ({ genre: task.genre, summary: taskText(task), fingerprint: taskFingerprint(task) })),
  }
}

async function verify(test, acceptedCheckpoint, from, to, planRows) {
  const baselines = await seedTests()
  const corpus = await productionOutsideCheckpoint(test.id, from, to)
  const deterministic = buildDiversityReport({ baselineTests: baselines, checkpointTests: [...acceptedCheckpoint, test], planRows })
  const review = VerificationSchema.parse(await callCambridgeWritingAi({
    role: 'verification', systemPrompt: VERIFIER_SYSTEM_PROMPT,
    userPrompt: buildVerifierPrompt({
      config: getLevelConfig(test.level), test,
      corpusSummaries: [...baselines, ...corpus, ...acceptedCheckpoint].map(corpusSummary),
      similarity: deterministic,
      designFingerprint: planRows.find(row => row.testId === test.id)?.designFingerprint,
    }),
    temperature: 0.2, timeoutMs: 120000, maxRetries: 2, maxTokens: 2200,
  }))
  return { review, deterministic }
}

async function revise(test, review, acceptedCheckpoint, planRows) {
  const issueTaskIds = new Set(review.issues.map(issue => issue.taskId).filter(Boolean))
  const affectedTasks = issueTaskIds.size ? test.tasks.filter(task => issueTaskIds.has(task.id)) : test.tasks
  const row = planRows.find(item => item.testId === test.id)
  const avoidanceCorpus = [...await seedTests(), ...acceptedCheckpoint].map(corpusSummary)
  const response = await callCambridgeWritingAi({
    role: 'generation', systemPrompt: VERIFIER_SYSTEM_PROMPT,
    userPrompt: buildRevisionPrompt({ config: getLevelConfig(test.level), testId: test.id, designFingerprint: row?.designFingerprint, avoidanceCorpus, affectedTasks, issues: review.issues }),
    temperature: 0.45, timeoutMs: 120000, maxRetries: 2, maxTokens: 5000,
  })
  const revisedById = new Map((response.tasks ?? []).map(task => [task.id, task]))
  const revised = {
    ...test,
    tasks: test.tasks.map(task => {
      const candidate = revisedById.get(task.id)
      if (!candidate) return task
      return { ...task, ...candidate, id: task.id, partNumber: task.partNumber, taskNumber: task.taskNumber, genre: task.genre, wordLimit: task.wordLimit, metadata: task.metadata, presentation: task.presentation }
    }),
  }
  revised.provenance.contentHash = contentHash(revised)
  assertIdentity(TestSchema.parse(revised))
  return revised
}

async function deterministicGate(test, acceptedCheckpoint, planRows) {
  const baselines = await seedTests()
  return originalityGate(test, { baselineTests: baselines, checkpointTests: acceptedCheckpoint, planRows })
}

async function processFile(file, reviseFailed, acceptedCheckpoint, from, to, planRows) {
  let test = TestSchema.parse(await readJson(file))
  let review
  for (let round = 0; round <= 2; round += 1) {
    const gate = await deterministicGate(test, acceptedCheckpoint, planRows)
    if (!gate.valid) {
      review = { valid: false, overallScore: 0, issues: gate.failures.map(item => ({ severity: 'error', code: `DETERMINISTIC_${item.reason}`, message: JSON.stringify(item), suggestedAction: 'Redesign the affected task using its design fingerprint.' })) }
      if (!reviseFailed || round === 2) break
      test = await revise(test, review, acceptedCheckpoint, planRows)
      await writeJson(file, test)
      continue
    }
    const verified = await verify(test, acceptedCheckpoint, from, to, planRows)
    review = verified.review
    await writeJson(path.join(VERIFICATION_ROOT, test.level, `${test.id}.round-${round}.json`), { ...review, deterministicOriginality: { valid: true, fingerprintHash: verified.deterministic.fingerprintHash } })
    if (passVerification(review)) {
      const verifier = getAiIdentity('verification')
      test.provenance = { ...test.provenance, reviewStatus: 'ai-verified', verifierProvider: verifier.provider, verifierModel: verifier.model, verifiedAt: Date.now(), qualityScore: review.overallScore, qualityIssues: review.issues.map(issue => `${issue.code}: ${issue.message}`) }
      test.provenance.contentHash = contentHash(test)
      acceptedCheckpoint.push(test)
      return { test, result: { testId: test.id, status: 'verified', qualityScore: review.overallScore } }
    }
    if (!reviseFailed || round === 2) break
    test = await revise(test, review, acceptedCheckpoint, planRows)
    await writeJson(file, test)
  }
  test.provenance = { ...test.provenance, reviewStatus: 'rejected', qualityScore: review?.overallScore, qualityIssues: review?.issues?.map(issue => `${issue.code}: ${issue.message}`) ?? [] }
  test.provenance.contentHash = contentHash(test)
  await writeJson(path.join(FAILED_ROOT, test.level, `${test.id}.json`), { test, verification: review })
  return { test, result: { testId: test.id, status: 'failed', qualityScore: review?.overallScore } }
}

async function promoteWithoutAiVerification(files, planRows) {
  const results = []
  const acceptedCheckpoint = []
  const acceptedTests = []
  for (const file of files) {
    const test = TestSchema.parse(await readJson(file))
    assertIdentity(test)
    const gate = await deterministicGate(test, acceptedCheckpoint, planRows)
    if (!gate.valid) throw new Error(`${test.id}: deterministic originality gate failed: ${gate.failures.map(item => item.reason).join(', ')}`)
    test.provenance = { ...test.provenance, reviewStatus: 'unreviewed', qualityIssues: ['Independent AI verification skipped by explicit user request; deterministic originality gates passed.'] }
    delete test.provenance.verifierProvider
    delete test.provenance.verifierModel
    delete test.provenance.verifiedAt
    delete test.provenance.qualityScore
    test.provenance.contentHash = contentHash(test)
    acceptedCheckpoint.push(test)
    acceptedTests.push(test)
    results.push({ testId: test.id, status: 'draft_unreviewed', deterministicOriginality: 'PASS' })
  }
  for (const test of acceptedTests) await writeJson(path.join(DATA_ROOT, test.level, `${test.id}.json`), test)
  return results
}

async function main() {
  const args = parseArgs()
  const from = args.from === undefined ? 2 : Number.parseInt(String(args.from), 10)
  const to = args.to === undefined ? Number.MAX_SAFE_INTEGER : Number.parseInt(String(args.to), 10)
  const files = await stagingFiles(args.level ?? 'all', from, to)
  const planRows = buildPlan()
  if (args['skip-ai'] === true) {
    const results = await promoteWithoutAiVerification(files, planRows)
    await writeJson(path.join(TMP_ROOT, 'cambridge-writing-verification-report.json'), { generatedAt: Date.now(), skippedByUser: true, deterministicGatesRequired: true, results })
    console.log(JSON.stringify({ files: files.length, skippedByUser: true, results }, null, 2))
    return
  }
  if (!isAiConfigured('verification')) throw new Error('Verification AI is not configured. Set CAMBRIDGE_WRITING_VERIFY_PROVIDER, CAMBRIDGE_WRITING_VERIFY_MODEL, and CAMBRIDGE_WRITING_VERIFY_KEY.')
  const results = []
  const acceptedCheckpoint = []
  const acceptedTests = []
  for (const file of files) {
    const processed = await processFile(file, args.revise === true, acceptedCheckpoint, from, to, planRows)
    results.push(processed.result)
    if (processed.result.status === 'verified') acceptedTests.push(processed.test)
    else break
  }
  if (!results.some(item => item.status === 'failed') && acceptedTests.length === files.length) {
    for (const test of acceptedTests) await writeJson(path.join(DATA_ROOT, test.level, `${test.id}.json`), test)
  }
  await writeJson(path.join(TMP_ROOT, 'cambridge-writing-verification-report.json'), { generatedAt: Date.now(), results })
  console.log(JSON.stringify({ files: files.length, results }, null, 2))
  if (results.length !== files.length || results.some(item => item.status === 'failed')) process.exitCode = 1
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
