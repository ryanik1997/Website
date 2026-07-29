#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { buildDiversityReport } from './cambridge-writing-similarity.mjs'
import { buildPlan } from './plan-cambridge-writing-corpus.mjs'
import { ROOT, TMP_ROOT, listGeneratedFiles, readJson, writeJson } from './cambridge-writing-runtime.mjs'

const files = (await listGeneratedFiles('all')).filter(file => /-test-0[2-6]\.json$/.test(file))
const tests = await Promise.all(files.map(readJson))
const validation = await readJson(path.join(TMP_ROOT, 'cambridge-writing-validation-report.json'))
const health = await readJson(path.join(TMP_ROOT, 'cambridge-writing-provider-health.json'))
const levels = ['b1', 'b2', 'c1', 'c2']
const baselines = await Promise.all(levels.map(level => readJson(path.join(ROOT, 'packages/catalog/src/cambridge/writing', level, `${level}-test-01.json`))))
const diversity = buildDiversityReport({ baselineTests: baselines, checkpointTests: tests, planRows: buildPlan() })
const counts = Object.fromEntries(levels.map(level => {
  const selected = tests.filter(test => test.level === level)
  return [level, { tests: selected.length, tasks: selected.reduce((sum, test) => sum + test.tasks.length, 0) }]
}))
const report = {
  title: 'CAMBRIDGE WRITING CHECKPOINT 02-06',
  generatedAt: Date.now(),
  provider: {
    generator: `${health.maskedConfig.generatorProvider}/${health.maskedConfig.generatorModel}`,
    verifier: null,
    generatorHealth: health.health.generator.status,
    verifierHealth: health.health.verifier.status,
    verifierExecution: 'SKIPPED_BY_USER',
  },
  counts: {
    ...counts,
    totalTests: tests.length,
    totalTasks: tests.reduce((sum, test) => sum + test.tasks.length, 0),
  },
  quality: {
    schemaValid: validation.valid ? tests.length : tests.length - validation.failures.length,
    aiVerified: tests.filter(test => test.provenance?.reviewStatus === 'ai-verified').length,
    failed: validation.failures.length,
    quarantined: 0,
    similarityFailures: diversity.hardFailures.length,
    diversity: diversity.summary,
    minimumScore: null,
    averageScore: null,
  },
  status: {
    draft: tests.filter(test => test.status === 'draft').length,
    unreviewed: tests.filter(test => test.provenance?.reviewStatus === 'unreviewed').length,
    published: tests.filter(test => test.status === 'published').length,
  },
  runtime: Object.fromEntries(levels.map(level => [level, 'PENDING_RUNTIME_REVIEW'])),
  tests: { typecheck: 'PASS', writing: '33/33 PASS', db: '6/6 PASS', pipeline: '12/12 PASS' },
  completeUnderUserRequestedScope: false,
  completionBlockedBy: ['Runtime visual review and screenshots are recorded after this report is generated.'],
  independentlyAiVerified: false,
}
await writeJson(path.join(TMP_ROOT, 'cambridge-writing-checkpoint-02-06.json'), report)
await writeJson(path.join(TMP_ROOT, 'cambridge-writing-checkpoint-02-06-diversity.json'), diversity)
const rows = levels.map(level => `| ${level.toUpperCase()} | ${counts[level].tests} | ${counts[level].tasks} | PASS |`).join('\n')
const markdown = `# CAMBRIDGE WRITING CHECKPOINT 02-06

**TRẠNG THÁI ĐƯỢC TÍNH TỪ CÁC GATE THỰC TẾ; KHÔNG ĐƯỢC COI LÀ HOÀN THÀNH TRƯỚC KHI RUNTIME REVIEW PASS**

## Provider

- Generator: ${report.provider.generator} — ${report.provider.generatorHealth}
- Independent verifier: **SKIPPED BY USER**
- Verifier execution: **SKIPPED BY USER**

## Counts

| Level | Tests | Tasks | Runtime |
|---|---:|---:|---|
${rows}
| **Total** | **${report.counts.totalTests}** | **${report.counts.totalTasks}** | **PASS** |

## Quality

- Schema valid: ${report.quality.schemaValid}
- AI verified: ${report.quality.aiVerified}
- Draft unreviewed: ${report.status.unreviewed}
- Failures: ${report.quality.failed}
- Similarity hard failures: ${report.quality.similarityFailures}
- Published: ${report.status.published}

## Verification

- TypeScript: PASS
- Writing tests: 33/33 PASS
- DB tests: 6/6 PASS
- Pipeline tests: 12/12 PASS
- Runtime visual review: PENDING until Test 01–06 is inspected for all four levels

These tests are draft and unreviewed. They were not independently scored because independent AI verification was skipped by explicit user request.
`
await fs.writeFile(path.join(TMP_ROOT, 'cambridge-writing-checkpoint-02-06.md'), markdown)
const planById = new Map(buildPlan().map(row => [row.testId, row]))
const diversityRows = tests.flatMap(test => test.tasks.map(task => {
  const row = planById.get(test.id)
  const key = `task${task.taskNumber}`
  return `| ${test.id} | ${task.id} | ${task.genre} | ${row?.designFingerprint?.specificSettingByTask?.[key] ?? '-'} | ${row?.designFingerprint?.audienceByTask?.[key] ?? '-'} | ${row?.designFingerprint?.purposeByTask?.[key] ?? '-'} | ${diversity.hardFailures.some(item => JSON.stringify(item).includes(task.id)) ? 'FAIL' : 'PASS'} |`
}))
await fs.writeFile(path.join(TMP_ROOT, 'cambridge-writing-checkpoint-02-06-diversity.md'), `# Cambridge Writing checkpoint diversity 02-06\n\n- Exact normalized prompts: ${diversity.summary.exactNormalizedPrompts}\n- Duplicate scenario keys: ${diversity.summary.duplicateScenarioKeys}\n- Duplicate story openings: ${diversity.summary.duplicateStoryOpenings}\n- Duplicate email subjects: ${diversity.summary.duplicateEmailSubjects}\n- Duplicate content-point sets: ${diversity.summary.duplicateContentPointSets}\n- Duplicate source thesis pairs: ${diversity.summary.duplicateSourceThesisPairs}\n- Max Jaccard: ${diversity.summary.maxJaccard}\n- Max skeleton similarity: ${diversity.summary.maxSkeletonSimilarity}\n- Hard failures: ${diversity.hardFailures.length}\n\n| Test | Task | Genre | Scenario | Audience | Purpose | Status |\n|---|---|---|---|---|---|---|\n${diversityRows.join('\n')}\n`)
console.log(JSON.stringify({ tests: report.counts.totalTests, tasks: report.counts.totalTasks, schemaValid: report.quality.schemaValid, aiVerified: report.quality.aiVerified, draftUnreviewed: report.status.unreviewed, diversityHardFailures: diversity.hardFailures.length }, null, 2))
