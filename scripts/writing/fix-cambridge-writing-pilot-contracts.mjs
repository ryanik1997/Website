#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { TMP_ROOT, TestSchema, readJson } from './cambridge-writing-runtime.mjs'
import { contentHash } from './cambridge-writing-ai-provider.mjs'
const changes = []
async function update(file, mutate) {
  const input = await readJson(file); const test = TestSchema.parse(input); const before = JSON.stringify(test.tasks)
  mutate(test); const canonical = TestSchema.parse(test); canonical.provenance.contentHash = ''; canonical.provenance.contentHash = contentHash(canonical)
  await fs.writeFile(file, `${JSON.stringify(TestSchema.parse(canonical), null, 2)}\n`)
  changes.push({ testId: test.id, taskContentChanged: before !== JSON.stringify(canonical.tasks) })
}
await update(path.join(TMP_ROOT, 'cambridge-writing-staging/b1/b1-test-07.json'), test => {
  const task = test.tasks[1]; const panel = task.promptBlocks.find(block => block.type === 'panel' && block.variant === 'announcement')
  panel.paragraphs[1] = 'Which activity from an exchange visit was especially effective, what did students learn from it, and why would you recommend it to other coordinators?'
})
await update(path.join(TMP_ROOT, 'cambridge-writing-staging/b2/b2-test-07.json'), test => {
  const task = test.tasks[0]; const panel = task.promptBlocks.find(block => block.type === 'panel' && block.variant === 'notes')
  panel.listItems = panel.paragraphs.slice(1); delete panel.paragraphs
})
await fs.writeFile(path.join(TMP_ROOT, 'cambridge-writing-pilot-contract-fixes.json'), `${JSON.stringify({ generatedAt: Date.now(), changes }, null, 2)}\n`)
console.log('Fixed deterministic B1/B2 pilot contract structure.')
