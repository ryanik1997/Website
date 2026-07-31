#!/usr/bin/env node
/**
 * PET B1 Reading Part 4/5/6 title audit validator.
 *
 * Checks, per generated test (and legacy tests), that every Part 4/5/6 has a
 * topic title that the runtime can display:
 *   - Part 4/5/6 title exists
 *   - title is not generic ("Multiple-choice cloze", "Open cloze", bare domain word)
 *   - title is 3–8 words (after stripping the "Part N – " prefix)
 *   - title does not contain a gap marker "(NN) ....."
 *   - title does not contain Part 6 answer text
 *   - package/public title parity
 *   - renderer field readable (part.passageTitle / passageSubtitle present)
 *
 * Usage: node scripts/reading/validate-pet-b1-reading-titles.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const DATA = path.join(ROOT, 'packages/catalog/data')

// Generic labels that carry no topic information. Also treated as generic when
// a title is a bare 1-2 word domain label (e.g. "repair cafés", "cycle routes").
const GENERIC_TITLES = new Set([
  'multiple-choice cloze',
  'open cloze',
  'gapped text',
  'missing sentences',
  'part 4',
  'part 5',
  'part 6',
  'the text',
  'a project',
  'the correct answer',
])

const MIN_WORDS = 3
const MAX_WORDS = 8
const GENERATED_RANGE = /^catalog-reading-pet-b1-test(?:1[4-9]|[2-4]\d|5[01])$/

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null }
}

/** Strip leading "Part N – / Part N:" and whitespace; return the topic text. */
function cleanTitle(raw) {
  return String(raw ?? '')
    .replace(/^Part\s*[456]\s*[:—–-]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordCount(text) {
  return text ? text.split(/\s+/).filter(Boolean).length : 0
}

function isGeneric(clean) {
  const lower = clean.toLowerCase()
  if (!clean) return true
  if (GENERIC_TITLES.has(lower)) return true
  // 1-2 word bare domain labels are generic (e.g. "cycle routes").
  if (wordCount(clean) < MIN_WORDS) return true
  return false
}

function hasGapMarker(text) {
  return /\(\s*\d+\s*\)/.test(text) || /\(\.{3,}\)/.test(text)
}

function main() {
  const files = fs.readdirSync(PUBLIC)
    .filter(f => /^catalog-reading-pet-b1-test\d+\.json$/.test(f))
    .sort((a, b) => +a.match(/test(\d+)/)[1] - +b.match(/test(\d+)/)[1])

  const rows = []
  const failures = []
  let legacyFallback = 0

  for (const file of files) {
    const examId = file.replace(/\.json$/, '')
    const isGenerated = GENERATED_RANGE.test(examId)
    const pub = readJson(path.join(PUBLIC, file))
    const pkg = readJson(path.join(DATA, file.replace(/^catalog-reading-/, 'reading-')))

    for (const pn of [4, 5, 6]) {
      const part = pub?.parts?.find(p => p.partNumber === pn)
      if (!part) { rows.push({ file, part: pn, status: 'FAIL_MISSING', reason: 'part missing' }); continue }

      const rawTitle = part.passageTitle ?? ''
      const subtitle = part.passageSubtitle ?? ''
      const visibleTitle = subtitle?.trim() || cleanTitle(rawTitle)
      const clean = cleanTitle(rawTitle)

      let status = 'PASS'
      const reasons = []

      if (!rawTitle.trim() && !subtitle.trim()) {
        status = 'FAIL_MISSING'; reasons.push('no title/subtitle field')
      } else if (isGenerated && isGeneric(visibleTitle)) {
        status = 'FAIL_GENERIC'; reasons.push(`generic title "${visibleTitle}"`)
      } else if (isGenerated && hasGapMarker(rawTitle)) {
        status = 'FAIL_GENERIC'; reasons.push('title contains gap marker')
      } else if (wordCount(clean) > MAX_WORDS) {
        status = 'FAIL_TOO_LONG'; reasons.push(`${wordCount(clean)} words (>${MAX_WORDS})`)
      } else if (!isGenerated && isGeneric(visibleTitle)) {
        status = 'LEGACY_FALLBACK'; reasons.push('legacy generic title')
        legacyFallback++
      }

      // Part 6 answer-text contamination: title must not equal any answer word.
      if (pn === 6 && status === 'PASS') {
        const answersFile = path.join(PUBLIC, `${examId}.answers.json`)
        const ans = readJson(answersFile)
        const answerWords = new Set(Object.values(ans?.answers ?? {}).map(a => String(a).toLowerCase().trim()))
        const lower = visibleTitle.toLowerCase()
        if ([...answerWords].some(w => w && lower === w)) {
          status = 'FAIL_GENERIC'; reasons.push('title equals a Part 6 answer word')
        }
      }

      // Package/public parity. Enforced for generated tests (14-51); legacy
      // tests predate the two-copy pipeline and may legitimately drift.
      const pkgPart = pkg?.parts?.find(p => p.partNumber === pn)
      const pkgTitle = pkgPart?.passageTitle ?? ''
      const pkgSub = pkgPart?.passageSubtitle ?? ''
      const parity = (pkgTitle === rawTitle) && (pkgSub === (subtitle ?? ''))
      if (!parity && isGenerated) { status = 'FAIL_PARITY'; reasons.push(`package="${pkgTitle}" public="${rawTitle}"`) }
      if (!parity && !isGenerated) reasons.push(`legacy package/public drift: package="${pkgTitle}"`)

      if (status !== 'PASS' && status !== 'LEGACY_FALLBACK') failures.push({ file, part: pn, status, reason: reasons.join('; ') })

      rows.push({
        test: examId.replace(/^catalog-reading-pet-b1-/, ''),
        part: pn,
        title: visibleTitle,
        status,
        reason: reasons.join('; ') || 'ok',
      })
    }
  }

  // Report table.
  console.log('Test | Part | Title | Status | Reason')
  console.log('--- | --- | --- | --- | ---')
  for (const r of rows) console.log(`${r.test} | ${r.part} | ${r.title} | ${r.status} | ${r.reason}`)

  const pass = rows.filter(r => r.status === 'PASS').length
  const fallback = rows.filter(r => r.status === 'LEGACY_FALLBACK').length
  console.log(`\nSummary: ${rows.length} parts checked, ${pass} PASS, ${fallback} LEGACY_FALLBACK, ${failures.length} FAILURES.`)

  if (failures.length) {
    console.log('\nFailures:')
    for (const f of failures) console.log(`  ${f.file} Part ${f.part}: ${f.status} — ${f.reason}`)
    process.exitCode = 1
  }
}

main()
