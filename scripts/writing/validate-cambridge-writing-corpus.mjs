#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { CAMBRIDGE_WRITING_LEVELS, getLevelConfig } from './cambridge-writing-level-config.mjs'
import { contentHash } from './cambridge-writing-ai-provider.mjs'
import { bannedPhraseFindings, similarityPairs, taskText } from './cambridge-writing-similarity.mjs'
import { ROOT, TMP_ROOT, TestSchema, assertIdentity, listGeneratedFiles, parseArgs, readJson, writeJson } from './cambridge-writing-runtime.mjs'

function countWords(text) { return String(text).trim().split(/\s+/).filter(Boolean).length }
function blocks(task, type) { return (task.promptBlocks ?? []).filter(block => block.type === type) }
function panels(task, variant) { return (task.promptBlocks ?? []).filter(block => block.type === 'panel' && block.variant === variant) }

function validateStrings(value, pathName = 'test', errors = []) {
  if (typeof value === 'string') {
    if (!value.trim()) errors.push(`${pathName}: empty string`)
    if (/```/.test(value)) errors.push(`${pathName}: raw Markdown fence`)
    if (/<\/?(?:script|iframe|form)\b/i.test(value)) errors.push(`${pathName}: forbidden HTML`)
    if (/\{\{[^}]+\}\}|\[INSERT[^\]]*\]|\bTBD\b|Lorem ipsum/i.test(value)) errors.push(`${pathName}: unresolved placeholder`)
    if (/As an AI|AI-generated|official Cambridge/i.test(value)) errors.push(`${pathName}: forbidden phrase`)
    if (/According to the information above/i.test(value)) errors.push(`${pathName}: unresolved reference phrase`)
  } else if (Array.isArray(value)) value.forEach((item, index) => validateStrings(item, `${pathName}.${index}`, errors))
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) validateStrings(item, `${pathName}.${key}`, errors)
  return errors
}

function levelChecks(test) {
  const errors = []
  const [q1, q2, q3, q4] = test.tasks
  if (test.level === 'b1') {
    const notes = panels(q1, 'notes')[0]
    if (blocks(q1, 'email').length !== 1 || notes?.listItems?.length !== 4) errors.push('B1 Q1 requires one email block and exactly four notes')
    const articleText = taskText(q2)
    if ((articleText.match(/\?/g) ?? []).length < 2 || !articleText.includes('Write your article.')) errors.push('B1 Q2 needs at least two questions and final instruction')
    const storyText = taskText(q3)
    if (!storyText.includes('Write your story.')) errors.push('B1 Q3 missing final instruction')
  }
  if (test.level === 'b2') {
    const notes = panels(q1, 'notes')[0]?.listItems ?? []
    if (notes.length !== 3 || !notes[2]?.includes('your own idea')) errors.push('B2 Q1 notes invalid')
    if (panels(q2, 'announcement').length !== 1 || panels(q3, 'announcement').length !== 1 || blocks(q4, 'email').length !== 1) errors.push('B2 Part 2 prompt blocks invalid')
  }
  if (test.level === 'c1') {
    if (panels(q1, 'notes')[0]?.listItems?.length !== 3 || panels(q1, 'opinions')[0]?.paragraphs?.length !== 3) errors.push('C1 Q1 needs three notes and three opinions')
  }
  if (test.level === 'c2') {
    const sources = blocks(q1, 'source-text')
    if (sources.length !== 2) errors.push('C2 Q1 needs exactly two source texts')
    for (const source of sources) { const words = countWords(source.text); if (words < 110 || words > 160) errors.push(`${source.id}: source text has ${words} words`) }
  }
  return errors
}

export async function validateCorpus(level = 'all') {
  const files = await listGeneratedFiles(level)
  const tests = []
  const failures = []
  const ids = new Set()
  for (const file of files) {
    try {
      const test = TestSchema.parse(await readJson(file))
      assertIdentity(test)
      const errors = [...validateStrings(test), ...levelChecks(test)]
      if (!test.provenance) errors.push('missing provenance')
      else {
        if (test.provenance.reviewStatus !== 'ai-verified' && test.provenance.reviewStatus !== 'human-approved') errors.push('provenance is not verified')
        if (contentHash(test) !== test.provenance.contentHash) errors.push('content hash mismatch')
        if ((test.provenance.qualityScore ?? 0) < 88) errors.push('quality score below 88')
      }
      for (const id of [test.id, ...test.tasks.map(task => task.id)]) { if (ids.has(id)) errors.push(`duplicate ID: ${id}`); ids.add(id) }
      const banned = bannedPhraseFindings(test)
      if (banned.length) errors.push(...banned.map(item => `${item.taskId}: banned phrase ${item.phrase}`))
      if (errors.length) failures.push({ file: path.relative(ROOT, file).replaceAll('\\', '/'), testId: test.id, errors })
      tests.push(test)
    } catch (error) { failures.push({ file: path.relative(ROOT, file).replaceAll('\\', '/'), errors: [error instanceof Error ? error.message : String(error)] }) }
  }
  const similarity = similarityPairs(tests)
  const counts = Object.fromEntries(CAMBRIDGE_WRITING_LEVELS.map(current => [current, { tests: tests.filter(test => test.level === current).length, tasks: tests.filter(test => test.level === current).reduce((sum, test) => sum + test.tasks.length, 0) }]))
  for (const levelName of CAMBRIDGE_WRITING_LEVELS) {
    const config = getLevelConfig(levelName)
    const expectedTasks = config.newTestCount * config.testTaskCount
    if (counts[levelName].tests !== config.newTestCount) failures.push({ file: levelName, errors: [`expected ${config.newTestCount} generated tests, got ${counts[levelName].tests}`] })
    if (counts[levelName].tasks !== expectedTasks) failures.push({ file: levelName, errors: [`expected ${expectedTasks} generated tasks, got ${counts[levelName].tasks}`] })
  }
  return { generatedAt: Date.now(), files: files.length, tests: tests.length, tasks: tests.reduce((sum, test) => sum + test.tasks.length, 0), counts, failures, similarity, valid: failures.length === 0 && similarity.failures.length === 0 }
}

async function main() {
  const args = parseArgs()
  const report = await validateCorpus(args.level ?? 'all')
  await writeJson(path.join(TMP_ROOT, 'cambridge-writing-validation-report.json'), report)
  await writeJson(path.join(TMP_ROOT, 'cambridge-writing-similarity-report.json'), report.similarity)
  await fs.writeFile(path.join(TMP_ROOT, 'cambridge-writing-similarity-report.md'), `# Cambridge Writing Similarity Report\n\n- Comparisons reported: ${report.similarity.comparisons.length}\n- Warnings: ${report.similarity.warnings.length}\n- Hard failures: ${report.similarity.failures.length}\n`)
  console.log(JSON.stringify({ valid: report.valid, tests: report.tests, tasks: report.tasks, failures: report.failures.length, similarityHardFailures: report.similarity.failures.length }, null, 2))
  if (!report.valid) process.exitCode = 1
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
