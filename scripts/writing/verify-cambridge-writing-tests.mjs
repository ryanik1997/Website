#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { getLevelConfig } from './cambridge-writing-level-config.mjs'
import { callCambridgeWritingAi, contentHash, getAiIdentity, isAiConfigured } from './cambridge-writing-ai-provider.mjs'
import { buildRevisionPrompt, buildVerifierPrompt, VERIFIER_SYSTEM_PROMPT } from './cambridge-writing-prompts.mjs'
import { similarityPairs } from './cambridge-writing-similarity.mjs'
import { DATA_ROOT, ROOT, TMP_ROOT, TestSchema, VerificationSchema, assertIdentity, listGeneratedFiles, parseArgs, passVerification, readJson, selectedLevels, writeJson } from './cambridge-writing-runtime.mjs'

const STAGING_ROOT = path.join(TMP_ROOT, 'cambridge-writing-staging')
const FAILED_ROOT = path.join(TMP_ROOT, 'cambridge-writing-failed')
const VERIFICATION_ROOT = path.join(TMP_ROOT, 'cambridge-writing-verification')

async function stagingFiles(levelArg) {
  const files = []
  for (const level of selectedLevels(levelArg)) {
    try {
      for (const name of await fs.readdir(path.join(STAGING_ROOT, level))) if (name.endsWith('.json')) files.push(path.join(STAGING_ROOT, level, name))
    } catch (error) { if (error.code !== 'ENOENT') throw error }
  }
  return files.sort()
}

async function corpusTests(excludeId) {
  const files = await listGeneratedFiles('all')
  const tests = []
  for (const file of files) {
    const test = TestSchema.parse(await readJson(file))
    if (test.id !== excludeId) tests.push(test)
  }
  return tests
}

async function verify(test) {
  const corpus = await corpusTests(test.id)
  const similarity = similarityPairs([...corpus, test])
  const review = VerificationSchema.parse(await callCambridgeWritingAi({
    role: 'verification', systemPrompt: VERIFIER_SYSTEM_PROMPT,
    userPrompt: buildVerifierPrompt({ config: getLevelConfig(test.level), test, corpusSummaries: corpus.map(item => ({ testId: item.id, tasks: item.tasks.map(task => ({ genre: task.genre, promptText: task.promptText })) })), similarity }),
    temperature: 0.2, timeoutMs: 120000, maxRetries: 2,
  }))
  return review
}

async function revise(test, review) {
  const issueTaskIds = new Set(review.issues.map(issue => issue.taskId).filter(Boolean))
  const affectedTasks = issueTaskIds.size ? test.tasks.filter(task => issueTaskIds.has(task.id)) : test.tasks
  const response = await callCambridgeWritingAi({
    role: 'generation', systemPrompt: VERIFIER_SYSTEM_PROMPT,
    userPrompt: buildRevisionPrompt({ config: getLevelConfig(test.level), affectedTasks, issues: review.issues }),
    temperature: 0.4, timeoutMs: 120000, maxRetries: 2,
  })
  const revisedById = new Map((response.tasks ?? []).map(task => [task.id, task]))
  const revised = { ...test, tasks: test.tasks.map(task => revisedById.get(task.id) ?? task) }
  revised.provenance.contentHash = contentHash(revised)
  assertIdentity(TestSchema.parse(revised))
  return revised
}

async function processFile(file, reviseFailed) {
  let test = TestSchema.parse(await readJson(file))
  let review
  for (let round = 0; round <= 2; round += 1) {
    review = await verify(test)
    await writeJson(path.join(VERIFICATION_ROOT, test.level, `${test.id}.round-${round}.json`), review)
    if (passVerification(review)) {
      const verifier = getAiIdentity('verification')
      test.provenance = { ...test.provenance, reviewStatus: 'ai-verified', verifierProvider: verifier.provider, verifierModel: verifier.model, verifiedAt: Date.now(), qualityScore: review.overallScore, qualityIssues: review.issues.map(issue => `${issue.code}: ${issue.message}`) }
      test.provenance.contentHash = contentHash(test)
      await writeJson(path.join(DATA_ROOT, test.level, `${test.id}.json`), test)
      return { testId: test.id, status: 'verified', qualityScore: review.overallScore }
    }
    if (!reviseFailed || round === 2) break
    test = await revise(test, review)
    await writeJson(file, test)
  }
  test.provenance = { ...test.provenance, reviewStatus: 'rejected', qualityScore: review?.overallScore, qualityIssues: review?.issues.map(issue => `${issue.code}: ${issue.message}`) ?? [] }
  test.provenance.contentHash = contentHash(test)
  await writeJson(path.join(FAILED_ROOT, test.level, `${test.id}.json`), { test, verification: review })
  return { testId: test.id, status: 'failed', qualityScore: review?.overallScore }
}

async function main() {
  const args = parseArgs()
  if (!isAiConfigured('verification')) throw new Error('Verification AI is not configured. Set CAMBRIDGE_WRITING_VERIFY_PROVIDER, CAMBRIDGE_WRITING_VERIFY_MODEL, and CAMBRIDGE_WRITING_VERIFY_KEY.')
  const files = await stagingFiles(args.level ?? 'all')
  const results = []
  for (const file of files) results.push(await processFile(file, args.revise === true))
  await writeJson(path.join(TMP_ROOT, 'cambridge-writing-verification-report.json'), { generatedAt: Date.now(), results })
  console.log(JSON.stringify({ files: files.length, results }, null, 2))
  if (results.some(item => item.status === 'failed')) process.exitCode = 1
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
