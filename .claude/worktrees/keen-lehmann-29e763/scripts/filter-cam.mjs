#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'

const input = process.argv[2] ?? 'reading_passages.json'
const output = process.argv[3] ?? 'reading_filtered.json'
const rows = JSON.parse(await readFile(input, 'utf8'))
if (!Array.isArray(rows)) throw new Error(`${input} must contain a JSON array`)

const re = /^cam-(9|1[0-9]|20)-[1-4]-[1-3]$/
const filtered = rows.filter(row => re.test(String(row.youpass_id ?? '')))
const matrix = new Map()
for (const row of filtered) {
  const [, book, test, passage] = String(row.youpass_id).match(/^cam-(\d+)-(\d+)-(\d+)$/)
  const key = `Cam ${book} Test ${test}`
  const set = matrix.get(key) ?? new Set()
  set.add(Number(passage))
  matrix.set(key, set)
}

const missing = []
for (let book = 9; book <= 20; book += 1) {
  for (let test = 1; test <= 4; test += 1) {
    const key = `Cam ${book} Test ${test}`
    const passages = [...(matrix.get(key) ?? new Set())].sort((a, b) => a - b)
    const absent = [1, 2, 3].filter(n => !passages.includes(n))
    console.log(`${key.padEnd(16)} ${passages.length}/3  ${passages.length ? passages.join(',') : '-'}${absent.length ? `  MISSING: ${absent.join(',')}` : ''}`)
    if (absent.length) missing.push({ book, test, missing: absent })
  }
}

await writeFile(output, JSON.stringify(filtered, null, 2), 'utf8')
console.log(`\nFiltered: ${filtered.length} rows -> ${output}`)
console.log(`Complete tests: ${48 - missing.length}/48`)
if (missing.length) console.log(`Missing: ${missing.map(x => `Cam ${x.book} Test ${x.test} [${x.missing.join(',')}]`).join('; ')}`)
