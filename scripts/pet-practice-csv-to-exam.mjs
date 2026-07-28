/**
 * Convert PET B1 practice CSV + media → exam.json (+ optional Tainguyen publish).
 *
 * Usage:
 *   node scripts/pet-practice-csv-to-exam.mjs all
 *   node scripts/pet-practice-csv-to-exam.mjs 1-10
 *   node scripts/pet-practice-csv-to-exam.mjs 1
 *
 * Source: D:\App-English-Ryan\Crawl\Import_PET_B1_Listening\test-NN\
 * Override: PET_IMPORT_ROOT
 *
 * Book mapping (default PET_EXISTING_COUNT=4 → practice starts Book 2):
 *   practice 1 → Book 2 Test 1 … practice 32 → Book 9 Test 4
 */
import fs from 'node:fs/promises'
import { existsSync, readFileSync, readdirSync, copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEBSITE = path.resolve(__dirname, '..')

const DEFAULT_ROOT = 'D:\\App-English-Ryan\\Crawl\\Import_PET_B1_Listening'
const ROOT = process.env.PET_IMPORT_ROOT || DEFAULT_ROOT
const TAINGUYEN = process.env.TAINGUYEN_PATH || path.join(WEBSITE, 'Tainguyen')

const PART_META = {
  1: {
    rangeLabel: 'Questions 1–7',
    instruction: 'For each question, choose the correct answer.',
    type: 'picture-mc',
    expected: 7,
  },
  2: {
    rangeLabel: 'Questions 8–13',
    instruction: 'For each question, choose the correct answer.',
    type: 'multiple-choice',
    expected: 6,
  },
  3: {
    rangeLabel: 'Questions 14–19',
    instruction: 'For each question, write the correct answer in the gap. Write one or two words or a number or a date or a time.',
    type: 'gap-fill',
    expected: 6,
  },
  4: {
    rangeLabel: 'Questions 20–25',
    instruction: 'For each question, choose the correct answer.',
    type: 'multiple-choice',
    expected: 6,
  },
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function parseArgs(argv) {
  const arg = argv[2] || 'all'
  if (arg === 'all') return Array.from({ length: 32 }, (_, i) => i + 1)
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
  for (const enc of ['utf8', 'utf-8-sig', 'utf16le', 'latin1']) {
    try {
      if (enc === 'utf-8-sig') {
        const t = buf.toString('utf8')
        return t.charCodeAt(0) === 0xfeff ? t.slice(1) : t
      }
      return buf.toString(enc === 'utf8' ? 'utf8' : enc)
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

  // Auto-detect tab vs comma (first header line)
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
  let hint = ''
  if (paren) {
    a = paren[1].trim()
    hint = paren[2].trim().toLowerCase()
  }
  if (type === 'picture-mc' || type === 'multiple-choice') {
    a = a.toUpperCase()
    const m = a.match(/^([A-H])\b/)
    if (m) a = m[1]
  }
  if (type === 'gap-fill') {
    // keep primary before slash for answer; acceptable via buildAcceptable
    if (a.includes('/')) a = a.split('/')[0].trim()
  }
  return { answer: a, hint, raw: String(raw || '').trim() }
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
  const rest = list.filter(x => x !== primary && x.toLowerCase() !== String(primary || '').toLowerCase())
  return rest.length ? rest : undefined
}

function parseMcOptions(optionsRaw) {
  const raw = String(optionsRaw || '').trim()
  if (!raw) return []
  if (/picture options/i.test(raw) || /^A\s*\|\s*B\s*\|\s*C\s*$/i.test(raw)) {
    return [
      { id: 'A', label: 'A' },
      { id: 'B', label: 'B' },
      { id: 'C', label: 'C' },
    ]
  }
  // YES / NO
  if (/\bYES\b/i.test(raw) && /\bNO\b/i.test(raw)) {
    return [
      { id: 'A', label: 'YES' },
      { id: 'B', label: 'NO' },
    ]
  }
  const parts = raw.split('|').map(s => s.trim()).filter(Boolean)
  const byId = new Map()
  for (const p of parts) {
    const m = p.match(/^([A-Ha-h])[.)]\s*(.*)$/)
    if (m) {
      const id = m[1].toUpperCase()
      const label = (m[2] || '').trim() || id
      byId.set(id, { id, label })
      continue
    }
    const m2 = p.match(/^([A-Ha-h])\s+(.*)$/)
    if (m2) {
      const id = m2[1].toUpperCase()
      const label = (m2[2] || '').trim() || id
      byId.set(id, { id, label })
      continue
    }
    // bare letter
    const m3 = p.match(/^([A-Ha-h])$/)
    if (m3) {
      const id = m3[1].toUpperCase()
      byId.set(id, { id, label: id })
    }
  }
  // Ensure A–C when partial crawl (e.g. only "A." or "B.")
  if (byId.size > 0 && byId.size < 3) {
    for (const id of ['A', 'B', 'C']) {
      if (!byId.has(id)) byId.set(id, { id, label: id })
    }
  }
  return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    .filter(id => byId.has(id))
    .map(id => byId.get(id))
}

function resolveImageExt(dir, base) {
  for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
    if (existsSync(path.join(dir, base + ext))) return base + ext
  }
  return null
}

function resolveAudio(dir, partNum) {
  for (const name of [`part${partNum}.mp3`, `part-${partNum}.mp3`, `Part${partNum}.mp3`]) {
    if (existsSync(path.join(dir, name))) return name
  }
  return null
}

/** practice 1 with existingCount 4 → Book 2 Test 1 */
function practiceSlotToBookTest(practiceNum, existingCount = 4) {
  const globalIndex = existingCount + practiceNum
  const book = Math.ceil(globalIndex / 4)
  const test = ((globalIndex - 1) % 4) + 1
  return { book, test, globalIndex }
}

function convertOne(testNum) {
  const nn = pad2(testNum)
  const dir = path.join(ROOT, `test-${nn}`)
  const csvPath = path.join(dir, `b1-test-${nn}.csv`)
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
  if (rows.length !== 25) {
    report.warnings.push(`Expected 25 rows, got ${rows.length}`)
  }

  for (let p = 1; p <= 4; p++) {
    if (!resolveAudio(dir, p)) report.errors.push(`Missing part${p}.mp3`)
  }
  // Part 1 images: warn missing, don't hard-fail entire test (some tests miss 1–2)
  let imgOk = 0
  for (let q = 1; q <= 7; q++) {
    if (resolveImageExt(dir, `q${q}`)) imgOk++
    else report.warnings.push(`Missing q${q}.jpg`)
  }
  if (imgOk < 5) report.errors.push(`Too few Part 1 images (${imgOk}/7)`)

  const byPart = new Map()
  for (const row of rows) {
    const part = Number(row.part)
    const qn = Number(row.question_number)
    if (!byPart.has(part)) byPart.set(part, [])
    byPart.get(part).push({ ...row, part, question_number: qn })
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

      let options = parseMcOptions(q.options || '')
      if (options.length < 2) {
        report.warnings.push(`Q${q.question_number}: sparse options, using A/B/C — ${q.options}`)
        options = [
          { id: 'A', label: 'A' },
          { id: 'B', label: 'B' },
          { id: 'C', label: 'C' },
        ]
      }
      return { ...base, options }
    })

    parts.push({
      partNumber: partNum,
      rangeLabel: meta.rangeLabel,
      instruction: meta.instruction,
      audioFile,
      ...(partScript ? { ttsText: partScript } : {}),
      questions,
    })
  }

  if (report.errors.length) return report

  const existingCount = Number(process.env.PET_EXISTING_COUNT || 4)
  const slot = practiceSlotToBookTest(testNum, existingCount)
  const title = `PET B1 Listening \u2014 Book ${slot.book} \u2014 Test ${slot.test}`

  const exam = {
    version: 1,
    title,
    durationMinutes: 30,
    bandHint: 'B1 Preliminary Listening · 4 parts · 25 câu',
    examType: 'pet',
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

  // Publish into Tainguyen for build-catalog
  const dest = path.join(
    TAINGUYEN,
    'Import Cambridge',
    'PET_B1',
    'Listening',
    `PET B1_Cam ${slot.book}`,
    `Test ${slot.test}`,
  )
  mkdirSync(dest, { recursive: true })
  writeFileSync(path.join(dest, 'exam.json'), JSON.stringify(exam, null, 2) + '\n', 'utf8')
  writeFileSync(path.join(dest, 'answer-key.txt'), keyLines.join('\n') + '\n', 'utf8')
  for (let p = 1; p <= 4; p++) {
    const a = resolveAudio(dir, p)
    if (a) copyFileSync(path.join(dir, a), path.join(dest, a))
  }
  for (let q = 1; q <= 7; q++) {
    const img = resolveImageExt(dir, `q${q}`)
    if (img) copyFileSync(path.join(dir, img), path.join(dest, img))
  }

  report.ok = true
  report.title = title
  report.book = slot.book
  report.testSlot = slot.test
  report.dest = dest
  report.questionCount = parts.reduce((s, p) => s + p.questions.length, 0)
  return report
}

async function main() {
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

main().catch(err => {
  console.error(err)
  process.exit(1)
})
