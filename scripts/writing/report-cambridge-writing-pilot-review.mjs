#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const staging = path.join(root, 'tmp/cambridge-writing-staging')
const rows = []
for (const level of ['b1','b2','c1','c2']) {
  for (let n = 7; n <= 11; n++) {
    const file = path.join(staging, level, `${level}-test-${String(n).padStart(2,'0')}.json`)
    try {
      const test = JSON.parse(await fs.readFile(file, 'utf8'))
      rows.push({ testId: test.id, level, testNumber: n, status: 'PASS', tasks: test.tasks.map(task => ({ taskId: task.id, genre: task.genre, promptBlocks: task.promptBlocks, wordLimit: task.wordLimit })) })
    } catch { rows.push({ testId: `${level}-test-${String(n).padStart(2,'0')}`, level, testNumber: n, status: 'QUARANTINED', tasks: [] }) }
  }
}
await fs.writeFile(path.join(root, 'tmp/cambridge-writing-pilot-07-11-review.json'), `${JSON.stringify({ generatedAt: Date.now(), tests: rows }, null, 2)}\n`)
const lines = ['# Cambridge Writing pilot review 07-11', '', `- Tests present: ${rows.filter(row => row.status === 'PASS').length}/20`, '', '| Test | Level | Status |', '|---|---|---|']
for (const row of rows) lines.push(`| ${row.testId} | ${row.level.toUpperCase()} | ${row.status} |`)
for (const row of rows.filter(row => row.status === 'PASS')) for (const task of row.tasks) lines.push(`\n### ${task.taskId}\n\n${task.promptBlocks?.map(block => block.text || block.heading || block.label || '').join('\n\n') || '(no prompt blocks)'}`)
await fs.writeFile(path.join(root, 'tmp/cambridge-writing-pilot-07-11-review.md'), `${lines.join('\n')}\n`)
console.log(`Pilot review written: ${rows.filter(row => row.status === 'PASS').length}/20 present.`)
