/**
 * Convert FCE B2 practice CSV + media → exam.json + Tainguyen publish.
 *
 * Source: D:\App-English-Ryan\Crawl\Import_FCE_B2_Listening\test-NN\
 * Tests available: 10–36 (27 tests)
 *
 * Usage:
 *   node scripts/fce-practice-csv-to-exam.mjs all
 *   node scripts/fce-practice-csv-to-exam.mjs 10-20
 *   node scripts/fce-practice-csv-to-exam.mjs 10
 *
 * Book mapping (FCE_EXISTING_COUNT=4 → practice starts Book 2):
 *   test-10 → practice #1 → Book 2 Test 1
 *   test-36 → practice #27 → Book 8 Test 3
 */
import { existsSync, readFileSync, copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEBSITE = path.resolve(__dirname, '..')

const DEFAULT_ROOT = 'D:\\App-English-Ryan\\Crawl\\Import_FCE_B2_Listening'
const ROOT = process.env.FCE_IMPORT_ROOT || DEFAULT_ROOT
const TAINGUYEN = process.env.TAINGUYEN_PATH || path.join(WEBSITE, 'Tainguyen')

const PART_META = {
  1: {
    rangeLabel: 'Questions 1–8',
    instruction:
      'You will hear people talking in eight different situations. For questions 1–8, choose the best answer (A, B or C).',
    type: 'multiple-choice',
    expected: 8,
  },
  2: {
    rangeLabel: 'Questions 9–18',
    instruction:
      'For questions 9–18, complete the sentences with a word or short phrase.',
    type: 'gap-fill',
    expected: 10,
  },
  3: {
    rangeLabel: 'Questions 19–23',
    instruction:
      'You will hear five short extracts. For questions 19–23, choose from the list (A–H) what each speaker says. Use the letters only once. There are three extra letters which you do not need to use.',
    type: 'matching',
    expected: 5,
  },
  4: {
    rangeLabel: 'Questions 24–30',
    instruction: 'For questions 24–30, choose the best answer (A, B or C).',
    type: 'multiple-choice',
    expected: 7,
  },
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function parseArgs(argv) {
  const arg = argv[2] || 'all'
  if (arg === 'all') {
    // Available folders test-10 … test-36
    return Array.from({ length: 27 }, (_, i) => i + 10)
  }
  if (/^\d+-\d+$/.test(arg)) {
    const [a, b] = arg.split('-').map(Number)
    const out = []
    for (let i = a; i <= b; i++) out.push(i)
    return out
  }
  return [Number(arg)]
}

function readTextFile(filePath) {
  const buf = readFileSync(filePath)
  for (const enc of ['utf8', 'latin1']) {
    try {
      const t = buf.toString(enc)
      return t.charCodeAt(0) === 0xfeff ? t.slice(1) : t
    } catch {
      // continue
    }
  }
  return buf.toString('latin1')
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let i = 0
  let inQuotes = false
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)

  const firstLine = text.split(/\r?\n/, 1)[0] || ''
  const tabCount = (firstLine.match(/\t/g) || []).length
  const commaCount = (firstLine.match(/,/g) || []).length
  const delim = tabCount > commaCount ? '\t' : ','

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
    if (c === delim) {
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
  return rows
    .slice(1)
    .filter(r => r.some(cell => cell?.trim()))
    .map(r => {
      const obj = {}
      headers.forEach((h, idx) => {
        obj[h] = (r[idx] ?? '').trim()
      })
      return obj
    })
}

function normalizeAnswer(raw, type) {
  let a = String(raw || '').trim()
  const paren = a.match(/^(.*?)\s*\(([^)]*)\)\s*$/)
  if (paren) a = paren[1].trim()
  if (type === 'multiple-choice' || type === 'matching') {
    a = a.toUpperCase()
    const m = a.match(/^([A-H])\b/)
    if (m) a = m[1]
  }
  if (type === 'gap-fill' && a.includes('/')) {
    a = a.split('/')[0].trim()
  }
  return { answer: a, raw: String(raw || '').trim() }
}

function buildAcceptable(rawAnswer, type) {
  if (type !== 'gap-fill') return undefined
  const set = new Set()
  const add = v => {
    const t = String(v || '').trim()
    if (t) {
      set.add(t)
      set.add(t.toLowerCase())
    }
  }
  for (const part of String(rawAnswer || '').split('/')) add(part)
  const list = [...set]
  const primary = list[0]
  return list.filter(x => x !== primary && x.toLowerCase() !== String(primary || '').toLowerCase())
}

function parseLetterOptions(optionsRaw) {
  const raw = String(optionsRaw || '').trim()
  if (!raw) return []
  const parts = raw.split('|').map(s => s.trim()).filter(Boolean)
  const byId = new Map()
  for (const p of parts) {
    const m = p.match(/^([A-Ha-h])[.)]\s*(.*)$/)
    if (!m) continue
    const id = m[1].toUpperCase()
    let label = (m[2] || '').trim()
    // Drop instruction garbage on last option
    if (
      /use the letters only once/i.test(label)
      || /there are three extra/i.test(label)
      || /\[Audio/i.test(label)
      || label.length > 120
    ) {
      // keep letter with short fallback
      label = label.split(/Use the letters/i)[0].trim() || id
      if (label.length > 80) label = id
    }
    byId.set(id, { id, label: label || id })
  }
  return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    .filter(id => byId.has(id))
    .map(id => byId.get(id))
}

function resolveAudio(dir, partNum) {
  for (const name of [`part${partNum}.mp3`, `part-${partNum}.mp3`, `Part${partNum}.mp3`]) {
    if (existsSync(path.join(dir, name))) return name
  }
  if (existsSync(path.join(dir, 'listening.mp3'))) return 'listening.mp3'
  return null
}

/** test-10 = practice index 1 when existingCount=4 → Book 2 Test 1 */
function practiceSlotToBookTest(practiceNum, existingCount = 4) {
  const globalIndex = existingCount + practiceNum
  const book = Math.ceil(globalIndex / 4)
  const test = ((globalIndex - 1) % 4) + 1
  return { book, test, globalIndex }
}

function testNumToPracticeIndex(testNum) {
  // Folders start at 10
  return testNum - 9
}

function convertOne(testNum) {
  const nn = pad2(testNum)
  const dir = path.join(ROOT, `test-${nn}`)
  const csvPath = path.join(dir, `b2-test-${nn}.csv`)
  const report = { test: nn, ok: false, errors: [], warnings: [] }

  if (!existsSync(dir)) {
    report.errors.push(`Missing ${dir}`)
    return report
  }
  if (!existsSync(csvPath)) {
    report.errors.push(`Missing ${csvPath}`)
    return report
  }

  const rows = parseCsv(readTextFile(csvPath))
  if (rows.length !== 30) {
    report.warnings.push(`Expected 30 rows, got ${rows.length}`)
  }

  for (let p = 1; p <= 4; p++) {
    if (!resolveAudio(dir, p)) report.errors.push(`Missing part${p}.mp3`)
  }

  const byPart = new Map()
  for (const row of rows) {
    const part = Number(row.part)
    const qn = Number(row.question_number)
    if (!byPart.has(part)) byPart.set(part, [])
    byPart.get(part).push({ ...row, part, question_number: qn })
  }

  // Part 3: build shared A–H option bank from all rows
  const p3rows = byPart.get(3) || []
  let matchingBank = []
  for (const r of p3rows) {
    const opts = parseLetterOptions(r.options || '')
    if (opts.length > matchingBank.length) matchingBank = opts
  }
  // Ensure A–H slots for matching UI
  if (matchingBank.length > 0 && matchingBank.length < 8) {
    for (const id of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
      if (!matchingBank.find(o => o.id === id)) {
        matchingBank.push({ id, label: id })
      }
    }
    matchingBank.sort((a, b) => a.id.localeCompare(b.id))
  }

  const parts = []
  const audioscriptChunks = []

  for (let partNum = 1; partNum <= 4; partNum++) {
    const meta = PART_META[partNum]
    const qs = (byPart.get(partNum) || []).sort((a, b) => a.question_number - b.question_number)
    if (qs.length !== meta.expected) {
      report.errors.push(`Part ${partNum}: expected ${meta.expected} questions, got ${qs.length}`)
    }

    const audioFile = resolveAudio(dir, partNum) || `part${partNum}.mp3`
    const partScript = qs.find(q => q.audioscript)?.audioscript || ''
    if (partScript) audioscriptChunks.push(`=== Part ${partNum} ===\n${partScript}`)

    // Part 2 title: first question text often has topic name
    let passageTitle
    if (partNum === 2 && qs[0]?.question_text) {
      const t = qs[0].question_text
      // e.g. "Guy Fawkes Night', an annual..."
      const m = t.match(/^["']?([^"',.]+)/)
      if (m) passageTitle = m[1].replace(/^["']|["']$/g, '').trim()
      if (passageTitle && passageTitle.length > 60) passageTitle = passageTitle.slice(0, 60)
    }

    const questions = qs.map(q => {
      const type = meta.type
      const { answer, raw } = normalizeAnswer(q.answer, type)
      const base = {
        number: q.question_number,
        type,
        prompt: (q.question_text || `Question ${q.question_number}`).replace(/\s+/g, ' ').trim(),
        answer,
        ttsText: q.audioscript || undefined,
      }
      const acc = buildAcceptable(raw, type)
      if (acc?.length) base.acceptableAnswers = acc

      if (type === 'gap-fill') {
        return { ...base, wordLimit: 3, options: [] }
      }

      if (type === 'matching') {
        const options = matchingBank.length >= 5 ? matchingBank : parseLetterOptions(q.options || '')
        if (options.length < 2) {
          report.warnings.push(`Q${q.question_number}: sparse matching options`)
        }
        // Speaker N prompts
        let prompt = base.prompt
        if (!/^speaker/i.test(prompt)) {
          const idx = q.question_number - 18
          prompt = `Speaker ${idx}`
        }
        return { ...base, prompt, options }
      }

      // multiple-choice
      let options = parseLetterOptions(q.options || '')
      if (options.length < 2) {
        report.warnings.push(`Q${q.question_number}: sparse options — ${String(q.options).slice(0, 60)}`)
        options = [
          { id: 'A', label: 'A' },
          { id: 'B', label: 'B' },
          { id: 'C', label: 'C' },
        ]
      }
      return { ...base, options }
    })

    const part = {
      partNumber: partNum,
      rangeLabel: meta.rangeLabel,
      instruction: meta.instruction,
      audioFile,
      ...(partScript ? { ttsText: partScript } : {}),
      ...(passageTitle ? { passageTitle } : {}),
      questions,
    }
    parts.push(part)
  }

  if (report.errors.length) return report

  const existingCount = Number(process.env.FCE_EXISTING_COUNT || 4)
  const practiceIdx = testNumToPracticeIndex(testNum)
  const slot = practiceSlotToBookTest(practiceIdx, existingCount)
  const title = `FCE B2 Listening \u2014 Book ${slot.book} \u2014 Test ${slot.test}`

  const exam = {
    version: 1,
    title,
    durationMinutes: 40,
    bandHint: 'B2 First Listening · 4 parts · 30 câu',
    examType: 'fce',
    examMode: 'practice',
    parts,
  }

  writeFileSync(path.join(dir, 'exam.json'), JSON.stringify(exam, null, 2) + '\n', 'utf8')
  writeFileSync(path.join(dir, 'audioscript.txt'), audioscriptChunks.join('\n\n') + '\n', 'utf8')
  const keyLines = []
  for (const part of parts) {
    for (const q of part.questions) keyLines.push(`${q.number}. ${q.answer}`)
  }
  writeFileSync(path.join(dir, 'answer-key.txt'), keyLines.join('\n') + '\n', 'utf8')

  const dest = path.join(
    TAINGUYEN,
    'Import Cambridge',
    'FCE_B2',
    'Listening',
    `FCE B2_Cam ${slot.book}`,
    `Test ${slot.test}`,
  )
  mkdirSync(dest, { recursive: true })
  writeFileSync(path.join(dest, 'exam.json'), JSON.stringify(exam, null, 2) + '\n', 'utf8')
  writeFileSync(path.join(dest, 'answer-key.txt'), keyLines.join('\n') + '\n', 'utf8')
  for (let p = 1; p <= 4; p++) {
    const a = resolveAudio(dir, p)
    if (a) copyFileSync(path.join(dir, a), path.join(dest, a))
  }

  report.ok = true
  report.title = title
  report.book = slot.book
  report.testSlot = slot.test
  report.dest = dest
  report.questionCount = parts.reduce((s, p) => s + p.questions.length, 0)
  return report
}

function main() {
  const tests = parseArgs(process.argv)
  console.log(`Root: ${ROOT}`)
  console.log(`Tainguyen: ${TAINGUYEN}`)
  console.log(`Tests: ${tests.map(pad2).join(', ')}`)

  let ok = 0
  for (const t of tests) {
    const r = convertOne(t)
    if (r.ok) {
      ok++
      console.log(`✓ test-${r.test} → "${r.title}" (${r.questionCount} q)`)
      console.log(`    ${r.dest}`)
      r.warnings.forEach(w => console.log(`  ! ${w}`))
    } else {
      console.log(`✗ test-${r.test}`)
      r.errors.forEach(e => console.log(`  - ${e}`))
      r.warnings.forEach(w => console.log(`  ! ${w}`))
    }
  }
  console.log(`\nDone: ${ok}/${tests.length}`)
  process.exit(ok === tests.length ? 0 : 1)
}

main()
