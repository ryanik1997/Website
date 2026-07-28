#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..', '..')
const AUDIT_PATH = path.join(REPO_ROOT, 'tmp', 'fce-b2-corpus-audit.json')
const CRAWLER_PATH = path.join(REPO_ROOT, 'scripts', 'crawl-fce-engexam.mjs')

const args = process.argv.slice(2)

function optionNumber(name) {
  const equals = args.find(value => value.startsWith(`${name}=`))
  if (equals) return Number(equals.slice(name.length + 1))
  const index = args.indexOf(name)
  return index === -1 ? null : Number(args[index + 1])
}

const testFilter = optionNumber('--test')
const partFilter = optionNumber('--part')
const dryRun = args.includes('--dry-run')
const onlyMissing = args.includes('--only-missing')

if (testFilter != null && (!Number.isInteger(testFilter) || testFilter < 1 || testFilter > 26)) {
  throw new Error(`Invalid --test value: ${testFilter}`)
}
if (partFilter != null && (!Number.isInteger(partFilter) || partFilter < 1 || partFilter > 7)) {
  throw new Error(`Invalid --part value: ${partFilter}`)
}

function rawSourceIncomplete(row) {
  if (row.status === 'RECRAWL_REQUIRED') return true
  return (row.failures ?? []).some(failure => (
    failure.startsWith('raw ')
    || failure.startsWith('missing raw ')
    || failure.includes('raw Part 7')
  ))
}

const audit = JSON.parse(await fs.readFile(AUDIT_PATH, 'utf8'))
const rows = (audit.rows ?? []).filter(row => (
  (!testFilter || row.sourceTestNumber === testFilter)
  && (!partFilter || row.partNumber === partFilter)
  && (!onlyMissing || rawSourceIncomplete(row))
))

const pagesByTest = new Map()
for (const row of rows) {
  if (!pagesByTest.has(row.sourceTestNumber)) pagesByTest.set(row.sourceTestNumber, new Set())
  pagesByTest.get(row.sourceTestNumber).add(row.partNumber)
}

if (!pagesByTest.size) {
  console.log('FCE B2 recrawl: no matching source pages')
  process.exit(0)
}

console.log(`FCE B2 recrawl plan: ${rows.length} audit row(s), ${pagesByTest.size} test(s)`)
for (const [testNumber, pageSet] of [...pagesByTest].sort(([a], [b]) => a - b)) {
  const pages = [...pageSet].sort((a, b) => a - b)
  console.log(`- Source Test ${testNumber}: Part ${pages.join(', ')}`)
  if (dryRun) continue

  const result = spawnSync(process.execPath, [
    CRAWLER_PATH,
    '--test', String(testNumber),
    '--pages', pages.join(','),
    '--delay', '250',
  ], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: 'inherit',
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`Recrawl failed for Source Test ${testNumber} with exit code ${result.status}`)
  }
}

console.log(dryRun ? 'FCE B2 recrawl dry run complete' : 'FCE B2 recrawl complete')
