/**
 * Convert KET A2 practice CSV + media → exam.json + ZIP (flat bundle).
 *
 * Usage:
 *   node scripts/ket-practice-csv-to-exam.mjs 1
 *   node scripts/ket-practice-csv-to-exam.mjs 1-5
 *   node scripts/ket-practice-csv-to-exam.mjs all
 *
 * Source root (override with KET_IMPORT_ROOT):
 *   D:\App-English-Ryan\Crawl\Import_KET_A2_Listening\test-NN\
 */
import fs from 'node:fs/promises'
import { createWriteStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const require = createRequire(import.meta.url)

const DEFAULT_ROOT = 'D:\\App-English-Ryan\\Crawl\\Import_KET_A2_Listening'
const ROOT = process.env.KET_IMPORT_ROOT || DEFAULT_ROOT

const PART_META = {
  1: {
    rangeLabel: 'Questions 1–5',
    instruction: 'For each question, choose the correct answer.',
    type: 'picture-mc',
  },
  2: {
    rangeLabel: 'Questions 6–10',
    instruction: 'You will hear a teacher talking about a school club. For each question, write the correct answer in the gap.',
    type: 'gap-fill',
  },
  3: {
    rangeLabel: 'Questions 11–15',
    instruction: 'For each question, choose the correct answer.',
    type: 'multiple-choice',
  },
  4: {
    rangeLabel: 'Questions 16–20',
    instruction: 'For each question, choose the correct answer.',
    type: 'multiple-choice',
  },
  5: {
    rangeLabel: 'Questions 21–25',
    instruction: 'For each question, choose the correct answer. You will hear people talking about jobs.',
    type: 'matching',
  },
}

function parseArgs(argv) {
  const arg = argv[2] || '1'
  if (arg === 'all') return Array.from({ length: 44 }, (_, i) => i + 1)
  if (/^\d+-\d+$/.test(arg)) {
    const [a, b] = arg.split('-').map(Number)
    const out = []
    for (let i = a; i <= b; i++) out.push(i)
    return out
  }
  return [Number(arg)]
}

/** Minimal RFC4180 CSV parser (quoted fields, commas, newlines). */
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let i = 0
  let inQuotes = false
  // strip BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)

  while (i < text.length) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += c
      i++
      continue
    }
    if (c === '"') {
      inQuotes = true
      i++
      continue
    }
    if (c === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (c === '\r') {
      i++
      continue
    }
    if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += c
    i++
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  if (!rows.length) return []
  const headers = rows[0].map(h => h.trim())
  return rows.slice(1).filter(r => r.some(cell => cell?.trim())).map(r => {
    const obj = {}
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? '').trim()
    })
    return obj
  })
}

function normalizeAnswer(raw, type) {
  let a = String(raw || '').trim()
  // strip parenthetical hints e.g. "4:20 (any convention)"
  const paren = a.match(/^(.*?)\s*\(([^)]*)\)\s*$/)
  let hint = ''
  if (paren) {
    a = paren[1].trim()
    hint = paren[2].trim().toLowerCase()
  }
  if (type === 'picture-mc' || type === 'multiple-choice' || type === 'matching') {
    a = a.toUpperCase()
    // single letter or letter at start
    const m = a.match(/^([A-H])\b/)
    if (m) a = m[1]
  }
  if (type === 'gap-fill') {
    a = a.trim()
  }
  return { answer: a, hint }
}

function buildAcceptable(answer, type, hint) {
  if (type !== 'gap-fill') return undefined
  const set = new Set()
  const add = v => {
    const t = String(v || '').trim()
    if (t) set.add(t)
  }
  add(answer)
  add(answer.toLowerCase())
  // slash variants in answer itself
  for (const part of answer.split('/')) add(part)

  // time variants for 4:20 style
  const time = answer.match(/^(\d{1,2})[:.](\d{2})$/)
  if (time || hint.includes('any convention') || hint.includes('time')) {
    const h = time?.[1] || answer
    const m = time?.[2] || '00'
    if (time) {
      add(`${h}:${m}`)
      add(`${h}.${m}`)
      add(`${Number(h)}:${m}`)
      add(`${h}${m}`)
      if (m === '20') {
        add('twenty past four')
        add('20 past 4')
        add('20 past four')
        add('four twenty')
      }
    }
  }
  // phone: digits only + spaced
  if (/^\d{8,}$/.test(answer.replace(/\D/g, '')) && answer.replace(/\D/g, '').length >= 8) {
    const digits = answer.replace(/\D/g, '')
    add(digits)
    add(digits.replace(/^0/, ''))
  }
  const list = [...set].filter(x => x && x !== answer)
  return list.length ? list : undefined
}

function parseMcOptions(optionsRaw) {
  // "A. foo | B. bar | C. baz" or "A. actor | B. coach | ..."
  const parts = optionsRaw.split('|').map(s => s.trim()).filter(Boolean)
  const options = []
  for (const p of parts) {
    const m = p.match(/^([A-Ha-h])[.)]\s*(.+)$/)
    if (m) {
      options.push({ id: m[1].toUpperCase(), label: m[2].trim() })
      continue
    }
    // bare "Picture A" style — skip non letter options from picture placeholder
    if (/^A\s*\|\s*B\s*\|\s*C/i.test(optionsRaw) || /picture options/i.test(optionsRaw)) {
      return [
        { id: 'A', label: 'Picture A' },
        { id: 'B', label: 'Picture B' },
        { id: 'C', label: 'Picture C' },
      ]
    }
  }
  if (options.length >= 2) return options
  // picture options whole field
  if (/picture options/i.test(optionsRaw) || /^A\s*\|/i.test(optionsRaw)) {
    return [
      { id: 'A', label: 'Picture A' },
      { id: 'B', label: 'Picture B' },
      { id: 'C', label: 'Picture C' },
    ]
  }
  return options
}

function resolveImageExt(dir, base) {
  for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
    const p = path.join(dir, base + ext)
    if (existsSync(p)) return base + ext
  }
  return null
}

function resolveAudio(dir, partNum) {
  const candidates = [
    `part${partNum}.mp3`,
    `part-${partNum}.mp3`,
    `part_${partNum}.mp3`,
    `Part${partNum}.mp3`,
  ]
  for (const name of candidates) {
    if (existsSync(path.join(dir, name))) return name
  }
  if (existsSync(path.join(dir, 'listening.mp3'))) return 'listening.mp3'
  return null
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

/**
 * App đã có 10 đề KET Listening:
 *   Book 1 Test 1–4, Book 2 Test 1–4, Book 3 Test 1–2
 * Folder practice test-NN tiếp nối slot:
 *   test-01 → Book 3 Test 3, test-02 → Book 3 Test 4, test-03 → Book 4 Test 1, …
 * Override: file meta.json trong folder { "book": 3, "test": 3 }
 * hoặc env KET_EXISTING_COUNT (default 10).
 */
function practiceSlotToBookTest(practiceNum, existingCount = 10) {
  const globalIndex = existingCount + practiceNum // 1-based exam index in series
  const book = Math.ceil(globalIndex / 4)
  const test = ((globalIndex - 1) % 4) + 1
  return { book, test, globalIndex }
}

function readFolderMeta(dir) {
  const p = path.join(dir, 'meta.json')
  if (!existsSync(p)) return null
  try {
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch {
    return null
  }
}

async function convertOne(testNum) {
  const nn = pad2(testNum)
  const dir = path.join(ROOT, `test-${nn}`)
  const csvPath = path.join(dir, `ket-a2-test-${nn}.csv`)
  const report = { test: nn, ok: false, errors: [], warnings: [], files: {} }

  if (!existsSync(dir)) {
    report.errors.push(`Missing folder ${dir}`)
    return report
  }
  if (!existsSync(csvPath)) {
    report.errors.push(`Missing CSV ${csvPath}`)
    return report
  }

  const rows = parseCsv(readFileSync(csvPath, 'utf8'))
  if (rows.length !== 25) {
    report.warnings.push(`Expected 25 rows, got ${rows.length}`)
  }

  // media check
  for (let p = 1; p <= 5; p++) {
    const audio = resolveAudio(dir, p)
    report.files[`part${p}Audio`] = audio
    if (!audio) report.errors.push(`Missing part${p}.mp3`)
  }
  for (let q = 1; q <= 5; q++) {
    const img = resolveImageExt(dir, `q${q}`)
    report.files[`q${q}`] = img
    if (!img) report.errors.push(`Missing q${q}.jpg (or webp/png)`)
  }

  const byPart = new Map()
  for (const row of rows) {
    const part = Number(row.part)
    const qn = Number(row.question_number)
    if (!byPart.has(part)) byPart.set(part, [])
    byPart.get(part).push({ ...row, part, question_number: qn })
  }

  const parts = []
  const audioscriptChunks = []

  for (let partNum = 1; partNum <= 5; partNum++) {
    const meta = PART_META[partNum]
    const qs = (byPart.get(partNum) || []).sort((a, b) => a.question_number - b.question_number)
    if (qs.length !== 5) {
      report.errors.push(`Part ${partNum}: expected 5 questions, got ${qs.length}`)
    }

    const audioFile = resolveAudio(dir, partNum) || `part${partNum}.mp3`
    // one script sample per part (first non-empty)
    const partScript = qs.find(q => q.audioscript)?.audioscript || ''
    if (partScript) {
      audioscriptChunks.push(`=== Part ${partNum} ===\n${partScript}`)
    }

    const questions = qs.map(q => {
      const type = meta.type
      const { answer, hint } = normalizeAnswer(q.answer, type)
      const acceptableAnswers = buildAcceptable(answer, type, hint)
      const base = {
        number: q.question_number,
        type,
        prompt: q.question_text || `Question ${q.question_number}`,
        answer,
        ttsText: q.audioscript || undefined,
      }
      if (acceptableAnswers?.length) base.acceptableAnswers = acceptableAnswers

      if (type === 'picture-mc') {
        const imageFile = resolveImageExt(dir, `q${q.question_number}`)
        return {
          ...base,
          ...(imageFile ? { imageFile } : {}),
          options: [
            { id: 'A', label: 'Picture A' },
            { id: 'B', label: 'Picture B' },
            { id: 'C', label: 'Picture C' },
          ],
        }
      }

      if (type === 'gap-fill') {
        return {
          ...base,
          wordLimit: 3,
        }
      }

      // MC + matching
      const options = parseMcOptions(q.options || '')
      if (options.length < 2) {
        report.errors.push(`Q${q.question_number}: failed to parse options: ${q.options}`)
      }
      return {
        ...base,
        options,
      }
    })

    // Part 2: enrich instruction with form lines from prompts
    let instruction = meta.instruction
    if (partNum === 2) {
      const formLines = questions.map(q => q.prompt).join('\n')
      instruction = `${meta.instruction}\n\n${formLines}`
    }

    parts.push({
      partNumber: partNum,
      rangeLabel: meta.rangeLabel,
      instruction,
      audioFile,
      ...(partScript ? { ttsText: partScript } : {}),
      questions,
    })
  }

  if (report.errors.length) {
    return report
  }

  const existingCount = Number(process.env.KET_EXISTING_COUNT || 10)
  const folderMeta = readFolderMeta(dir)
  const slot =
    folderMeta?.book != null && folderMeta?.test != null
      ? { book: Number(folderMeta.book), test: Number(folderMeta.test) }
      : practiceSlotToBookTest(testNum, existingCount)

  // Title format app group: parseCambridgeBookNumber / parseCambridgeTestNumber
  // → "CAMBRIDGE KET {book}" · Test {test}
  // Em dash (U+2014) — cùng format Cam 1–3 đã import (group Book/Test trong library)
  const title = `KET A2 Listening \u2014 Book ${slot.book} \u2014 Test ${slot.test}`
  report.book = slot.book
  report.testSlot = slot.test
  report.title = title

  const exam = {
    version: 1,
    title,
    durationMinutes: 25,
    bandHint: 'A2 Key Listening · 5 parts · 25 câu',
    examType: 'ket',
    examMode: 'practice',
    parts,
  }

  const examPath = path.join(dir, 'exam.json')
  await fs.writeFile(examPath, JSON.stringify(exam, null, 2), 'utf8')
  report.files.examJson = 'exam.json'

  const scriptPath = path.join(dir, 'audioscript.txt')
  await fs.writeFile(scriptPath, audioscriptChunks.join('\n\n') + '\n', 'utf8')
  report.files.audioscript = 'audioscript.txt'

  // answer-key.txt
  const keyLines = []
  for (const part of parts) {
    for (const q of part.questions) {
      keyLines.push(`${q.number}. ${q.answer}`)
    }
  }
  await fs.writeFile(path.join(dir, 'answer-key.txt'), keyLines.join('\n') + '\n', 'utf8')

  // ZIP flat (exam.json + media only — no csv/readme)
  const zipPath = path.join(ROOT, `ket-practice-test-${nn}.zip`)
  const zipEntries = ['exam.json', 'audioscript.txt', 'answer-key.txt']
  for (let p = 1; p <= 5; p++) {
    const a = resolveAudio(dir, p)
    if (a) zipEntries.push(a)
  }
  for (let q = 1; q <= 5; q++) {
    const img = resolveImageExt(dir, `q${q}`)
    if (img) zipEntries.push(img)
  }

  await writeZipFlat(dir, zipPath, [...new Set(zipEntries)])
  report.files.zip = zipPath
  report.ok = true
  report.questionCount = parts.reduce((s, p) => s + p.questions.length, 0)
  return report
}

async function writeZipFlat(dir, zipPath, names) {
  // Prefer fflate if available in monorepo
  let zipSync
  try {
    ;({ zipSync } = await import('fflate'))
  } catch {
    zipSync = null
  }

  if (zipSync) {
    const files = {}
    for (const name of names) {
      const buf = readFileSync(path.join(dir, name))
      files[name] = new Uint8Array(buf)
    }
    const zipped = zipSync(files, { level: 6 })
    await fs.writeFile(zipPath, Buffer.from(zipped))
    return
  }

  // Fallback: PowerShell Compress-Archive (may nest folder on some PS — use .NET)
  const { execFileSync } = await import('node:child_process')
  const tmp = path.join(dir, '_zip_stage')
  await fs.rm(tmp, { recursive: true, force: true })
  await fs.mkdir(tmp, { recursive: true })
  for (const name of names) {
    await fs.copyFile(path.join(dir, name), path.join(tmp, name))
  }
  if (existsSync(zipPath)) await fs.unlink(zipPath)
  execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `Compress-Archive -Path (Join-Path '${tmp.replace(/'/g, "''")}' '*') -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`,
    ],
    { stdio: 'inherit' },
  )
  await fs.rm(tmp, { recursive: true, force: true })
}

async function main() {
  const tests = parseArgs(process.argv)
  console.log(`Root: ${ROOT}`)
  console.log(`Tests: ${tests.map(pad2).join(', ')}`)

  const results = []
  for (const t of tests) {
    const r = await convertOne(t)
    results.push(r)
    if (r.ok) {
      console.log(
        `✓ test-${r.test} → "${r.title}" (${r.questionCount} q) → ${r.files.zip}`,
      )
      if (r.warnings.length) r.warnings.forEach(w => console.log(`  ! ${w}`))
    } else {
      console.log(`✗ test-${r.test}`)
      r.errors.forEach(e => console.log(`  - ${e}`))
      r.warnings.forEach(w => console.log(`  ! ${w}`))
    }
  }

  const ok = results.filter(r => r.ok).length
  console.log(`\nDone: ${ok}/${results.length} OK`)
  if (ok < results.length) process.exitCode = 1
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
