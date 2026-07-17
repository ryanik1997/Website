/**
 * Convert Practice B2 Listening series 01–68 → exam.json + Tainguyen catalog source.
 *
 * Source layout:
 *   D:\App-English-Ryan\Crawl\B2_Listening\Practice_B2_01_68\B2_MP3\TestNN\
 *     Part1.mp3 … Part4.mp3
 *     b2-test-NN.csv  (or practice-b2-test-NN.csv)
 *
 * Book mapping (avoids FCE import series Book 2–8):
 *   test-01 → Book 9 Test 1 … test-68 → Book 25 Test 4
 *
 * Usage:
 *   node scripts/practice-b2-series-csv-to-exam.mjs all
 *   node scripts/practice-b2-series-csv-to-exam.mjs 1-10
 *   node scripts/practice-b2-series-csv-to-exam.mjs 18
 */
import { existsSync, readFileSync, copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEBSITE = path.resolve(__dirname, '..')

const DEFAULT_ROOT =
  'D:\\App-English-Ryan\\Crawl\\B2_Listening\\Practice_B2_01_68\\B2_MP3'
const ROOT = process.env.PRACTICE_B2_ROOT || DEFAULT_ROOT
const TAINGUYEN = process.env.TAINGUYEN_PATH || path.join(WEBSITE, 'Tainguyen')

/** Start after FCE practice series (Book 2–8). */
const START_BOOK = Number(process.env.PRACTICE_B2_START_BOOK || 9)

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
  if (arg === 'all') return Array.from({ length: 68 }, (_, i) => i + 1)
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
  try {
    const t = buf.toString('utf8')
    return t.charCodeAt(0) === 0xfeff ? t.slice(1) : t
  } catch {
    return buf.toString('latin1')
  }
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let i = 0
  let inQuotes = false
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const firstLine = text.split(/\r?\n/, 1)[0] || ''
  const delim =
    (firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length
      ? '\t'
      : ','

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
  // YES/NO tasks (some B2 Part 4) → A/B for MC UI
  const yu = a.toUpperCase()
  if (yu === 'YES' || yu === 'Y') a = 'A'
  else if (yu === 'NO' || yu === 'N') a = 'B'
  if (type === 'multiple-choice' || type === 'matching') {
    a = a.toUpperCase()
    const m = a.match(/^([A-H])\b/)
    if (m) a = m[1]
  }
  if (type === 'gap-fill' && a.includes('/')) a = a.split('/')[0].trim()
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
  return list.filter(
    x => x !== primary && x.toLowerCase() !== String(primary || '').toLowerCase(),
  )
}

function parseLetterOptions(optionsRaw) {
  const raw = String(optionsRaw || '').trim()
  if (!raw) return []
  // Bare A|B|C with YES/NO answers handled separately; YES/NO bank:
  if (/\bYES\b/i.test(raw) && /\bNO\b/i.test(raw)) {
    return [
      { id: 'A', label: 'YES' },
      { id: 'B', label: 'NO' },
    ]
  }
  // Placeholder "A | B | C" without labels — treat as incomplete
  if (/^A\s*\|\s*B\s*\|\s*C\s*$/i.test(raw)) {
    return []
  }
  const parts = raw.split('|').map(s => s.trim()).filter(Boolean)
  const byId = new Map()
  for (const p of parts) {
    const m = p.match(/^([A-Ha-h])[.)]\s*(.*)$/)
    if (!m) continue
    const id = m[1].toUpperCase()
    let label = (m[2] || '').trim()
    if (
      /use the letters only once/i.test(label)
      || /there are three extra/i.test(label)
      || /\[Audio/i.test(label)
      || label.length > 120
    ) {
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
  for (const name of [
    `part${partNum}.mp3`,
    `Part${partNum}.mp3`,
    `part-${partNum}.mp3`,
    `Part-${partNum}.mp3`,
  ]) {
    if (existsSync(path.join(dir, name))) return name
  }
  return null
}

function resolveCsv(dir, nn) {
  for (const name of [`b2-test-${nn}.csv`, `practice-b2-test-${nn}.csv`]) {
    if (existsSync(path.join(dir, name))) return path.join(dir, name)
  }
  return null
}

/** practice 1 → Book START_BOOK Test 1 */
function practiceToBookTest(practiceNum) {
  const idx = practiceNum - 1
  const book = START_BOOK + Math.floor(idx / 4)
  const test = (idx % 4) + 1
  return { book, test }
}

function convertOne(testNum) {
  const nn = pad2(testNum)
  const dir = path.join(ROOT, `Test${nn}`)
  const report = { test: nn, ok: false, errors: [], warnings: [] }

  if (!existsSync(dir)) {
    report.errors.push(`Missing ${dir}`)
    return report
  }
  const csvPath = resolveCsv(dir, nn)
  if (!csvPath) {
    report.errors.push(`Missing CSV in ${dir}`)
    return report
  }

  const rows = parseCsv(readTextFile(csvPath))
  if (rows.length !== 30) {
    report.warnings.push(`Expected 30 rows, got ${rows.length}`)
  }

  for (let p = 1; p <= 4; p++) {
    if (!resolveAudio(dir, p)) report.errors.push(`Missing Part${p}.mp3 / part${p}.mp3`)
  }

  const byPart = new Map()
  for (const row of rows) {
    const part = Number(row.part)
    const qn = Number(row.question_number)
    if (!byPart.has(part)) byPart.set(part, [])
    byPart.get(part).push({ ...row, part, question_number: qn })
  }

  const p3rows = byPart.get(3) || []
  let matchingBank = []
  for (const r of p3rows) {
    const opts = parseLetterOptions(r.options || '')
    if (opts.length > matchingBank.length) matchingBank = opts
  }
  if (matchingBank.length > 0 && matchingBank.length < 8) {
    for (const id of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
      if (!matchingBank.find(o => o.id === id)) matchingBank.push({ id, label: id })
    }
    matchingBank.sort((a, b) => a.id.localeCompare(b.id))
  }

  const parts = []
  const audioscriptChunks = []

  for (let partNum = 1; partNum <= 4; partNum++) {
    const meta = PART_META[partNum]
    const qs = (byPart.get(partNum) || []).sort(
      (a, b) => a.question_number - b.question_number,
    )
    if (qs.length !== meta.expected) {
      report.errors.push(
        `Part ${partNum}: expected ${meta.expected} questions, got ${qs.length}`,
      )
    }

    const audioSrc = resolveAudio(dir, partNum)
    // Normalize catalog filename to partN.mp3
    const audioFile = `part${partNum}.mp3`
    const partScript = qs.find(q => q.audioscript)?.audioscript || ''
    if (partScript) audioscriptChunks.push(`=== Part ${partNum} ===\n${partScript}`)

    let passageTitle
    if (partNum === 2 && qs[0]?.question_text) {
      const t = qs[0].question_text
      const m = t.match(/^["']?([^"',.]+)/)
      if (m) passageTitle = m[1].replace(/^["']|["']$/g, '').trim()
      if (passageTitle && passageTitle.length > 60) {
        passageTitle = passageTitle.slice(0, 60)
      }
    }

    const questions = qs.map(q => {
      const type = meta.type
      const { answer, raw } = normalizeAnswer(q.answer, type)
      const base = {
        number: q.question_number,
        type,
        prompt: (q.question_text || `Question ${q.question_number}`)
          .replace(/\s+/g, ' ')
          .trim(),
        answer,
        ttsText: q.audioscript || undefined,
      }
      const acc = buildAcceptable(raw, type)
      if (acc?.length) base.acceptableAnswers = acc

      if (type === 'gap-fill') {
        return { ...base, wordLimit: 3, options: [] }
      }
      if (type === 'matching') {
        const options =
          matchingBank.length >= 5 ? matchingBank : parseLetterOptions(q.options || '')
        let prompt = base.prompt
        if (!/^speaker/i.test(prompt)) {
          prompt = `Speaker ${q.question_number - 18}`
        }
        return { ...base, prompt, options }
      }
      let options = parseLetterOptions(q.options || '')
      const rawAns = String(q.answer || '').trim().toUpperCase()
      // YES/NO Part 4 (views expressed) — options often crawled as bare "A | B | C"
      if (
        options.length < 2
        && (rawAns === 'YES' || rawAns === 'NO' || rawAns === 'Y' || rawAns === 'N'
          || /\bYES\b/i.test(String(q.options || '')))
      ) {
        options = [
          { id: 'A', label: 'YES' },
          { id: 'B', label: 'NO' },
        ]
        if (rawAns.startsWith('Y')) base.answer = 'A'
        else if (rawAns.startsWith('N')) base.answer = 'B'
      }
      if (options.length < 2) {
        report.warnings.push(`Q${q.question_number}: sparse options`)
        options = [
          { id: 'A', label: 'A' },
          { id: 'B', label: 'B' },
          { id: 'C', label: 'C' },
        ]
      }
      return { ...base, options }
    })

    let instruction = meta.instruction
    // Detect YES/NO Part 4 (views expressed / not expressed)
    if (
      partNum === 4
      && questions.every(
        q =>
          Array.isArray(q.options)
          && q.options.length === 2
          && q.options.some(o => /^YES$/i.test(o.label))
          && q.options.some(o => /^NO$/i.test(o.label)),
      )
    ) {
      instruction =
        'You will hear a discussion. For questions 24–30, decide which views are expressed by any of the speakers and which are not. Choose YES for views which are expressed, and NO for views which are not expressed.'
    }

    parts.push({
      partNumber: partNum,
      rangeLabel: meta.rangeLabel,
      instruction,
      audioFile,
      ...(partScript ? { ttsText: partScript } : {}),
      ...(passageTitle ? { passageTitle } : {}),
      questions,
      // keep source name for copy
      _audioSrc: audioSrc,
    })
  }

  if (report.errors.length) return report

  const slot = practiceToBookTest(testNum)
  const title = `FCE B2 Listening \u2014 Book ${slot.book} \u2014 Test ${slot.test}`

  // strip internal _audioSrc before write exam
  const examParts = parts.map(({ _audioSrc, ...rest }) => rest)
  const exam = {
    version: 1,
    title,
    durationMinutes: 40,
    bandHint: 'B2 First Listening · 4 parts · 30 câu · Practice series',
    examType: 'fce',
    examMode: 'practice',
    parts: examParts,
  }

  const keyLines = []
  for (const part of examParts) {
    for (const q of part.questions) keyLines.push(`${q.number}. ${q.answer}`)
  }

  writeFileSync(path.join(dir, 'exam.json'), JSON.stringify(exam, null, 2) + '\n', 'utf8')
  writeFileSync(path.join(dir, 'answer-key.txt'), keyLines.join('\n') + '\n', 'utf8')
  writeFileSync(
    path.join(dir, 'audioscript.txt'),
    audioscriptChunks.join('\n\n') + '\n',
    'utf8',
  )

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
    const srcName = parts[p - 1]._audioSrc
    if (srcName) {
      copyFileSync(path.join(dir, srcName), path.join(dest, `part${p}.mp3`))
    }
  }

  report.ok = true
  report.title = title
  report.book = slot.book
  report.testSlot = slot.test
  report.dest = dest
  report.questionCount = examParts.reduce((s, p) => s + p.questions.length, 0)
  return report
}

function main() {
  const tests = parseArgs(process.argv)
  console.log(`Root: ${ROOT}`)
  console.log(`Tainguyen: ${TAINGUYEN}`)
  console.log(`START_BOOK=${START_BOOK}`)
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
    }
  }
  console.log(`\nDone: ${ok}/${tests.length}`)
  process.exit(ok === tests.length ? 0 : 1)
}

main()
