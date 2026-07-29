#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPlan, buildTopicCoverageReport, validatePlan } from './plan-cambridge-writing-corpus.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const rows = buildPlan()
validatePlan(rows)
const report = buildTopicCoverageReport(rows)
await fs.mkdir(path.join(root, 'tmp'), { recursive: true })
await fs.writeFile(path.join(root, 'tmp/cambridge-writing-topic-coverage.json'), `${JSON.stringify({ generatedAt: Date.now(), report }, null, 2)}\n`)
const lines = ['# Cambridge Writing topic coverage', '', '| Level | Tests | Unique families | Max family share |', '|---|---:|---:|---:|']
for (const [level, value] of Object.entries(report)) lines.push(`| ${level.toUpperCase()} | ${value.tests} | ${value.uniqueTopicFamilies} | ${(value.maxFamilyShare * 100).toFixed(1)}% |`)
await fs.writeFile(path.join(root, 'tmp/cambridge-writing-topic-coverage.md'), `${lines.join('\n')}\n`)
console.log('Cambridge Writing topic coverage written.')
