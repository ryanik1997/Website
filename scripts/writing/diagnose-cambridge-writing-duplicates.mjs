#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPlan } from './plan-cambridge-writing-corpus.mjs'
import {
  buildDiversityReport,
  extractEmailSubject,
  extractStoryOpening,
  normalizeText,
  taskFingerprint,
  taskText,
} from './cambridge-writing-similarity.mjs'
import { ROOT, TMP_ROOT, parseArgs, readJson, writeJson } from './cambridge-writing-runtime.mjs'
import { sha256 } from './cambridge-writing-ai-contracts.mjs'

const LEVELS = ['b1', 'b2', 'c1', 'c2']
const QUARANTINE_ROOT = path.join(TMP_ROOT, 'cambridge-writing-quarantine', 'duplicate-checkpoint-02-06')
const JSON_REPORT = path.join(TMP_ROOT, 'cambridge-writing-duplicate-diagnosis.json')
const MD_REPORT = path.join(TMP_ROOT, 'cambridge-writing-duplicate-diagnosis.md')
const HASH_REPORT = path.join(TMP_ROOT, 'cambridge-writing-test01-sha256.json')

function seedPath(level) {
  return path.join(ROOT, 'packages/catalog/src/cambridge/writing', level, `${level}-test-01.json`)
}

function generatedPath(level, number) {
  return path.join(ROOT, 'packages/catalog/data/cambridge-writing', level, `${level}-test-${String(number).padStart(2, '0')}.json`)
}

async function fileSha256(file) {
  return sha256(await fs.readFile(file))
}

function summary(test) {
  return {
    level: test.level,
    testId: test.id,
    testNumber: test.testNumber,
    provider: test.provenance?.provider ?? null,
    model: test.provenance?.model ?? null,
    generationTimestamp: test.provenance?.generatedAt ?? null,
    promptHash: test.provenance?.promptHash ?? null,
    cacheKey: test.provenance?.cacheKey ?? null,
    inputHash: test.provenance?.inputHash ?? null,
    tasks: test.tasks.map(task => ({
      taskId: task.id,
      genre: task.genre,
      summary: taskText(task).slice(0, 500),
      normalizedPrompt: normalizeText(taskText(task)),
      emailSubject: extractEmailSubject(task),
      storyOpening: extractStoryOpening(task),
      fingerprint: taskFingerprint(task),
    })),
  }
}

function planDuplicateGroups(rows) {
  const checkpoint = rows.filter(row => row.testNumber >= 2 && row.testNumber <= 6)
  const groups = new Map()
  for (const row of checkpoint) {
    const key = sha256({
      topicFamily: row.topicFamily,
      subtopics: row.subtopics,
      scenarioSeeds: row.scenarioSeeds,
      audiences: row.audiences,
      communicativePurposes: row.communicativePurposes,
    })
    const values = groups.get(key) ?? []
    values.push(row.testId)
    groups.set(key, values)
  }
  return [...groups.entries()].filter(([, ids]) => ids.length > 1).map(([fingerprint, testIds]) => ({ fingerprint, testIds }))
}

async function main() {
  const args = parseArgs()
  const test01Hashes = {}
  const seeds = []
  for (const level of LEVELS) {
    const file = seedPath(level)
    test01Hashes[level] = { file: path.relative(ROOT, file).replaceAll('\\', '/'), sha256: await fileSha256(file) }
    seeds.push(await readJson(file))
  }
  let baselineHashReport = null
  try { baselineHashReport = await readJson(HASH_REPORT) } catch {}
  if (baselineHashReport?.test01) {
    const changed = LEVELS.filter(level => baselineHashReport.test01[level]?.sha256 !== test01Hashes[level]?.sha256)
    if (changed.length) throw new Error(`Test 01 SHA256 changed for: ${changed.join(', ')}`)
  } else {
    await writeJson(HASH_REPORT, { generatedAt: Date.now(), test01: test01Hashes })
  }

  const plan = buildPlan()
  const generated = []
  const records = []
  for (const level of LEVELS) {
    for (let number = 2; number <= 6; number += 1) {
      const source = generatedPath(level, number)
      const test = await readJson(source)
      generated.push(test)
      const destination = path.join(QUARANTINE_ROOT, level, path.basename(source))
      await fs.mkdir(path.dirname(destination), { recursive: true })
      try { await fs.access(destination) } catch { await fs.copyFile(source, destination) }
      records.push({
        ...summary(test),
        sourceFile: path.relative(ROOT, source).replaceAll('\\', '/'),
        quarantineFile: path.relative(ROOT, destination).replaceAll('\\', '/'),
        sha256: await fileSha256(source),
        topicFamily: plan.find(row => row.testId === test.id)?.topicFamily ?? null,
        scenario: plan.find(row => row.testId === test.id)?.scenarioSeeds ?? null,
      })
    }
  }

  const diversity = buildDiversityReport({ baselineTests: seeds, checkpointTests: generated, planRows: plan })
  const planDuplicates = planDuplicateGroups(plan)
  const report = {
    generatedAt: Date.now(),
    scope: { levels: LEVELS, from: 2, to: 6, tests: generated.length, tasks: generated.reduce((sum, test) => sum + test.tasks.length, 0) },
    test01Hashes,
    records,
    planDuplicateGroups: planDuplicates,
    diversity,
    diagnosis: {
      A_fullTest01JsonUsedAsContentExample: false,
      B_test01SpreadOrClone: false,
      C_fallbackToTest01OnFailure: false,
      D_cacheKeyOnlyUsesTestNumber: false,
      E_cacheKeyMissingLevel: false,
      F_cacheKeyMissingCompletePlanRow: true,
      G_test02ResponseReusedFor03To06: false,
      H_revisionPromptSameGenericTaskForManyTests: true,
      I_planRowsAcrossLevelsShareSameScenarios: planDuplicates.length > 0,
      J_similarityValidatorRunsAfterAcceptance: true,
      notes: [
        'No Cambridge Writing response cache existed before this fix, so cache isolation metadata and CLI invalidation were missing rather than a wrong active cache hit.',
        'The confirmed primary cause is cross-level plan reuse plus one-anchor-per-test planning and weak post-acceptance similarity gates.',
        'Raw same-level Test 01 prompt summaries were sent to the generator; this exposed seed wording even though the full Test 01 JSON was not cloned.',
      ],
    },
    clean: planDuplicates.length === 0 && diversity.hardFailures.length === 0,
  }
  await writeJson(JSON_REPORT, report)
  const markdown = `# Cambridge Writing duplicate diagnosis\n\n- Generated tests inspected: ${report.scope.tests}\n- Generated tasks inspected: ${report.scope.tasks}\n- Cross-level duplicate plan groups: ${planDuplicates.length}\n- Diversity hard failures: ${diversity.hardFailures.length}\n- Exact normalized prompts: ${diversity.summary.exactNormalizedPrompts}\n- Duplicate scenario keys: ${diversity.summary.duplicateScenarioKeys}\n- Skeleton hard failures: ${diversity.summary.skeletonHardFailures}\n\n## Root cause\n\nThe generation plan reused the same scenario families and sentence-frame anchors across B1, B2, C1 and C2 for Test 02-06. The validator only compared same-genre trigram overlap at a 0.72 threshold after content had already been accepted, so placeholder variation passed as unique.\n\n## Safety\n\n- Test 01 SHA256 baseline saved to \`${path.relative(ROOT, HASH_REPORT).replaceAll('\\', '/')}\`.\n- Test 02-06 copied to \`${path.relative(ROOT, QUARANTINE_ROOT).replaceAll('\\', '/')}\`.\n`
  await fs.writeFile(MD_REPORT, markdown)
  console.log(JSON.stringify({ clean: report.clean, planDuplicateGroups: planDuplicates.length, hardFailures: diversity.hardFailures.length, report: path.relative(ROOT, JSON_REPORT) }, null, 2))
  if (args['assert-clean'] === true && !report.clean) process.exitCode = 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
}
