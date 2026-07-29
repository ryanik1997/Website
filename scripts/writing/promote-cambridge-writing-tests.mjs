#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { contentHash } from './cambridge-writing-ai-provider.mjs'
import { buildPlan } from './plan-cambridge-writing-corpus.mjs'
import { originalityGate } from './cambridge-writing-similarity.mjs'
import { ROOT, TMP_ROOT, TestSchema, assertIdentity, parseArgs, passVerification, readJson, selectedLevels, testPath, writeJson } from './cambridge-writing-runtime.mjs'

function numberArg(value, fallback) {
  const parsed = value === undefined ? fallback : Number.parseInt(String(value), 10)
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`Invalid number: ${value}`)
  return parsed
}

async function main() {
  const args = parseArgs()
  const levels = selectedLevels(args.level ?? 'all')
  const from = numberArg(args.from, 2)
  const to = numberArg(args.to, Number.MAX_SAFE_INTEGER)
  const promoted = []
  const acceptedCheckpoint = []
  const baselines = await Promise.all(['b1', 'b2', 'c1', 'c2'].map(level => readJson(path.join(ROOT, 'packages/catalog/src/cambridge/writing', level, `${level}-test-01.json`))))
  const planRows = buildPlan()
  for (const level of levels) {
    let names = []
    try { names = await fs.readdir(path.dirname(testPath(level, 2))) } catch (error) { if (error.code !== 'ENOENT') throw error }
    for (const name of names.filter(value => value.endsWith('.json'))) {
      const file = path.join(path.dirname(testPath(level, 2)), name)
      const test = TestSchema.parse(await readJson(file))
      if (test.testNumber < from || test.testNumber > to) continue
      assertIdentity(test)
      const originality = originalityGate(test, { baselineTests: baselines, checkpointTests: acceptedCheckpoint, planRows })
      if (!originality.valid) throw new Error(`${test.id}: deterministic originality gate does not pass promotion: ${originality.failures.map(item => item.reason).join(', ')}`)
      const verificationFile = path.join(TMP_ROOT, 'cambridge-writing-verification', level, `${test.id}.round-0.json`)
      let review
      try { review = await readJson(verificationFile) } catch { throw new Error(`${test.id}: verification report missing`) }
      if (!passVerification(review)) throw new Error(`${test.id}: verification does not pass promotion gate`)
      if (test.provenance?.reviewStatus !== 'ai-verified') throw new Error(`${test.id}: provenance is not ai-verified`)
      if (contentHash(test) !== test.provenance.contentHash) throw new Error(`${test.id}: content hash mismatch`)
      test.status = 'published'
      test.provenance.contentHash = contentHash(test)
      await writeJson(file, test)
      acceptedCheckpoint.push(test)
      promoted.push(test.id)
    }
  }
  console.log(JSON.stringify({ promoted }, null, 2))
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
