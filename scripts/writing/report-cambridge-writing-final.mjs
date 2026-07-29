#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CAMBRIDGE_WRITING_LEVELS } from './cambridge-writing-level-config.mjs'
import { TMP_ROOT, listGeneratedFiles, readJson, writeJson } from './cambridge-writing-runtime.mjs'

async function countFiles(directory) {
  try { return (await fs.readdir(directory)).filter(name => name.endsWith('.json')).length }
  catch (error) { if (error.code === 'ENOENT') return 0; throw error }
}

export function countSchemaValid(discoveredTests, validation) {
  const schemaFailures = (validation?.records ?? []).filter(record => record.schemaValid === false).length
  if (validation?.records) return validation.records.filter(record => record.schemaValid === true).length
  return Math.max(0, discoveredTests - schemaFailures)
}

export async function buildFinalReport() {
  const files = await listGeneratedFiles('all')
  const tests = await Promise.all(files.map(readJson))
  let validation = null
  let similarity = null
  try { validation = await readJson(path.join(TMP_ROOT, 'cambridge-writing-validation-report.json')) } catch {}
  try { similarity = await readJson(path.join(TMP_ROOT, 'cambridge-writing-similarity-report.json')) } catch {}
  const perLevel = Object.fromEntries(CAMBRIDGE_WRITING_LEVELS.map(level => {
    const subset = tests.filter(test => test.level === level)
    const scores = subset.map(test => test.provenance?.qualityScore).filter(Number.isFinite)
    return [level, { tests: subset.length, tasks: subset.reduce((sum, test) => sum + test.tasks.length, 0), averageQuality: scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : null, minQuality: scores.length ? Math.min(...scores) : null, similarityWarnings: similarity?.warnings?.filter(item => item.leftTaskId.startsWith(level) || item.rightTaskId.startsWith(level)).length ?? 0 }]
  }))
  const report = {
    title: 'CAMBRIDGE WRITING AI CORPUS REPORT', generatedAt: Date.now(),
    scope: { a2Generated: 0, ...Object.fromEntries(CAMBRIDGE_WRITING_LEVELS.map(level => [`${level}Generated`, perLevel[level].tests])), totalGenerated: tests.length, totalTasks: tests.reduce((sum, test) => sum + test.tasks.length, 0) },
    quality: { schemaValid: countSchemaValid(tests.length, validation), aiVerified: tests.filter(test => test.provenance?.reviewStatus === 'ai-verified').length, failed: validation?.failures?.length ?? 0, quarantined: await countFiles(path.join(TMP_ROOT, 'cambridge-writing-failed')), duplicatePrompts: similarity?.failures?.filter(item => item.exact).length ?? null, similarityHardFailures: similarity?.failures?.length ?? null },
    status: { draft: tests.filter(test => test.status === 'draft').length, published: tests.filter(test => test.status === 'published').length, humanApproved: tests.filter(test => test.provenance?.reviewStatus === 'human-approved').length },
    perLevel,
    complete: tests.length === 200 && tests.reduce((sum, test) => sum + test.tasks.length, 0) === 750 && validation?.valid === true,
  }
  await writeJson(path.join(TMP_ROOT, 'cambridge-writing-final-report.json'), report)
  const rows = CAMBRIDGE_WRITING_LEVELS.map(level => `| ${level.toUpperCase()} | ${perLevel[level].tests} | ${perLevel[level].tasks} | ${perLevel[level].averageQuality ?? '-'} | ${perLevel[level].minQuality ?? '-'} | ${perLevel[level].similarityWarnings} |`)
  const markdown = `# CAMBRIDGE WRITING AI CORPUS REPORT\n\n**${report.complete ? 'HOÀN THÀNH' : 'CHƯA HOÀN THÀNH'}**\n\n## Scope\n\n- A2 generated: 0\n- B1-C2 generated: ${report.scope.totalGenerated}\n- Total tasks: ${report.scope.totalTasks}\n\n## Per level\n\n| Level | Tests | Tasks | Avg quality | Min quality | Similarity warnings |\n|---|---:|---:|---:|---:|---:|\n${rows.join('\n')}\n\n## Quality\n\n- AI verified: ${report.quality.aiVerified}\n- Failed validation records: ${report.quality.failed}\n- Similarity hard failures: ${report.quality.similarityHardFailures ?? 'not run'}\n- Draft: ${report.status.draft}\n- Published: ${report.status.published}\n`
  await fs.writeFile(path.join(TMP_ROOT, 'cambridge-writing-final-report.md'), markdown)
  console.log(report.complete ? 'HOÀN THÀNH' : 'CHƯA HOÀN THÀNH')
  return report
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildFinalReport().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
}
