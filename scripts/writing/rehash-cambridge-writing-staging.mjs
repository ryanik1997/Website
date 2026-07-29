#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { ROOT, TMP_ROOT, TestSchema, readJson } from './cambridge-writing-runtime.mjs'
import { contentHash } from './cambridge-writing-ai-provider.mjs'

const root = path.join(TMP_ROOT, 'cambridge-writing-staging')
const report = []
const contentSnapshot = test => test.tasks.map(task => ({ id: task.id, promptText: task.promptText, promptBlocks: task.promptBlocks, instruction: task.instruction, presentation: task.presentation, wordLimit: task.wordLimit, metadata: task.metadata }))
const diff = (before, after, prefix = '') => {
  const paths = []
  if (JSON.stringify(before) !== JSON.stringify(after)) paths.push(prefix || 'root')
  return paths
}
for (const level of ['b1', 'b2', 'c1', 'c2']) for (let number = 7; number <= 11; number += 1) {
  const name = `${level}-test-${String(number).padStart(2, '0')}.json`
  const file = path.join(root, level, name)
  const input = await readJson(file)
  const oldContentHash = input.provenance?.contentHash ?? null
  const before = contentSnapshot(TestSchema.parse(input))
  const canonical = TestSchema.parse(input)
  canonical.provenance.contentHash = ''
  const newContentHash = contentHash(canonical)
  canonical.provenance.contentHash = newContentHash
  const output = TestSchema.parse(canonical)
  const changedPaths = diff(before, contentSnapshot(output), 'tasks')
  if (changedPaths.length) throw new Error(`${output.id}: task content changed during canonical rehash: ${changedPaths.join(', ')}`)
  const temp = `${file}.tmp-${process.pid}`
  await fs.writeFile(temp, `${JSON.stringify(output, null, 2)}\n`)
  await fs.rename(temp, file)
  report.push({ testId: output.id, oldContentHash, newContentHash, taskContentUnchanged: true, changedPaths: [] })
}
await fs.writeFile(path.join(TMP_ROOT, 'cambridge-writing-pilot-canonical-rehash.json'), `${JSON.stringify({ generatedAt: Date.now(), files: report }, null, 2)}\n`)
console.log(`Canonical rehash complete: ${report.length} files.`)
