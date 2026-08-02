#!/usr/bin/env node
/**
 * Idempotent migration: remove source-website pagination artifacts
 * ("Pages: 1 2 3 4 5 6 7 8 9 10") from CAE C1 Reading data.
 *
 * Scope:
 *   - Only CAE C1 Reading test JSON files (catalog-reading-cae-c1-test*.json)
 *   - Only Parts 1–3 (passage blocks + answer explanation fields)
 *   - Does NOT touch Parts 4–8, FCE/PET/KET/CPE, question IDs, answer keys, route slugs
 *
 * Usage:
 *   node scripts/reading/clean-cae-c1-pagination.mjs           # apply
 *   node scripts/reading/clean-cae-c1-pagination.mjs --dry-run  # preview
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const CATALOG_DIR = path.join(ROOT, 'apps', 'web', 'public', 'catalog', 'exams', 'reading')

const PAGINATION_LINE_PATTERN = /^Pages?\s*:\s*(?:\d+\s*){2,}$/i
const TRAILING_PAGINATION_PATTERN = /\s*Pages?\s*:\s*(?:\d+\s*){2,}$/i

function isPaginationArtifact(value) {
  if (typeof value !== 'string') return false
  const normalized = value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  return PAGINATION_LINE_PATTERN.test(normalized)
}

function stripTrailingPagination(value) {
  if (typeof value !== 'string') return value
  const normalized = value.replace(/\u00a0/g, ' ')
  const trailing = normalized.match(TRAILING_PAGINATION_PATTERN)
  if (!trailing) return value
  return value.slice(0, trailing.index).replace(/\s+$/, '').trimEnd()
}

const isDryRun = process.argv.includes('--dry-run')
const stats = {
  filesScanned: 0,
  testsScanned: 0,
  partsScanned: 0,
  passageArtifactsRemoved: 0,
  explanationArtifactsRemoved: 0,
  filesChanged: 0,
}

function findCaeTestFiles() {
  const all = fs.readdirSync(CATALOG_DIR)
  return all
    .filter(f => /^catalog-reading-cae-c1-test\d+\.json$/.test(f))
    .sort((a, b) => {
      const na = Number(a.match(/test(\d+)/)?.[1] ?? 0)
      const nb = Number(b.match(/test(\d+)/)?.[1] ?? 0)
      return na - nb
    })
    .map(f => ({
      filePath: path.join(CATALOG_DIR, f),
      fileName: f,
      testNumber: Number(f.match(/test(\d+)/)?.[1] ?? 0),
    }))
}

function findCaeAnswerFiles() {
  const all = fs.readdirSync(CATALOG_DIR)
  return all
    .filter(f => /^catalog-reading-cae-c1-test\d+\.answers\.json$/.test(f))
    .sort((a, b) => {
      const na = Number(a.match(/test(\d+)/)?.[1] ?? 0)
      const nb = Number(b.match(/test(\d+)/)?.[1] ?? 0)
      return na - nb
    })
    .map(f => ({
      filePath: path.join(CATALOG_DIR, f),
      fileName: f,
      testNumber: Number(f.match(/test(\d+)/)?.[1] ?? 0),
    }))
}

function cleanTestFile(entry) {
  stats.filesScanned += 1
  stats.testsScanned += 1

  const raw = fs.readFileSync(entry.filePath, 'utf8')
  const exam = JSON.parse(raw)
  let changed = false

  for (const part of exam.parts ?? []) {
    const pn = part.partNumber
    if (pn < 1 || pn > 3) continue
    stats.partsScanned += 1

    const passage = part.passage ?? []
    const cleanedPassage = passage.filter(block => {
      const text = typeof block?.text === 'string' ? block.text : ''
      if (isPaginationArtifact(text)) {
        stats.passageArtifactsRemoved += 1
        return false
      }
      return true
    })

    if (cleanedPassage.length !== passage.length) {
      part.passage = cleanedPassage
      changed = true
    }
  }

  if (changed) {
    if (!isDryRun) {
      fs.writeFileSync(entry.filePath, JSON.stringify(exam) + '\n')
    }
    stats.filesChanged += 1
    console.log(`  ${isDryRun ? '[DRY] ' : ''}CLEANED: ${entry.fileName}`)
  }
}

function cleanAnswerFile(entry) {
  stats.filesScanned += 1

  const raw = fs.readFileSync(entry.filePath, 'utf8')
  const vault = JSON.parse(raw)
  let changed = false

  for (const [key, val] of Object.entries(vault.answers ?? {})) {
    const explanation = val?.explanation
    if (typeof explanation !== 'string') continue
    const cleaned = stripTrailingPagination(explanation)
    if (cleaned !== explanation) {
      stats.explanationArtifactsRemoved += 1
      vault.answers[key].explanation = cleaned
      changed = true
    }
  }

  if (changed) {
    if (!isDryRun) {
      fs.writeFileSync(entry.filePath, JSON.stringify(vault) + '\n')
    }
    stats.filesChanged += 1
    console.log(`  ${isDryRun ? '[DRY] ' : ''}CLEANED: ${entry.fileName}`)
  }
}

console.log('=== CAE C1 Reading Pagination Cleanup ===')
console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'APPLY'}`)
console.log('')

console.log('Scanning test files...')
const testFiles = findCaeTestFiles()
for (const entry of testFiles) {
  cleanTestFile(entry)
}

console.log('')
console.log('Scanning answer files...')
const answerFiles = findCaeAnswerFiles()
for (const entry of answerFiles) {
  cleanAnswerFile(entry)
}

console.log('')
console.log('=== Summary ===')
console.log(`Files scanned:          ${stats.filesScanned}`)
console.log(`Tests scanned:          ${stats.testsScanned}`)
console.log(`Parts scanned (1-3):    ${stats.partsScanned}`)
console.log(`Passage artifacts:      ${stats.passageArtifactsRemoved}`)
console.log(`Explanation artifacts:  ${stats.explanationArtifactsRemoved}`)
console.log(`Files changed:          ${stats.filesChanged}`)
console.log(`Total artifacts removed: ${stats.passageArtifactsRemoved + stats.explanationArtifactsRemoved}`)
