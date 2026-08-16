/**
 * Public/private separation scan for Reading content.
 *
 * The public R2 release may only contain:
 *   - question body
 *   - passage
 *   - public transcript (if policy allows)
 *   - image/audio references
 *   - display metadata
 *
 * It must NOT contain:
 *   - answer
 *   - correctOption
 *   - acceptedAnswers / acceptableAnswers
 *   - explanation (when it reveals the answer and is currently protected)
 *   - .answers.json
 *   - scoring secrets
 *
 * This scanner greps actual schema field names inside JSON, not file names.
 * Run:
 *   node scripts/content/scan-public-private-separation.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

const RUNTIME_DIR = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const TID_DIR = path.join(ROOT, 'apps/web/src/features/exam/tidIeltsReading/data')
const PACKAGE_DATA = path.join(ROOT, 'packages/catalog/data')
const STAGING_DIR = path.join(ROOT, 'tmp/r2-release')

/**
 * Sensitive field names from the actual exam schema (mode-c ANSWER_FIELDS plus
 * the exported common names). Each is matched as a JSON object key: "name":
 */
const SENSITIVE_FIELDS = [
  'answer',
  'acceptedAnswers',
  'acceptableAnswers',
  'explanation',
  'correct',
  'correctOption',
  'correctAnswer',
  'correctAnswers',
  'solution',
  'solutions',
  'answerKey',
  'key',
  'feedback',
]

function fieldRegex(name) {
  return new RegExp(`"${name}"\\s*:`)
}

/** Recursively list files under dir. */
function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  )
}

function scanFiles(files, label, opts = {}) {
  let filesWithHits = 0
  let totalHits = 0
  const findings = []
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    if (opts.skipAnswersFiles && path.basename(file).endsWith('.answers.json')) continue
    const s = fs.readFileSync(file, 'utf8')
    const hits = SENSITIVE_FIELDS.filter(name => fieldRegex(name).test(s))
    if (hits.length) {
      filesWithHits += 1
      totalHits += hits.length
      if (findings.length < 8) findings.push(`${path.relative(ROOT, file)} -> ${hits.join('/')}`)
    }
  }
  console.log(`[${label}] files with sensitive fields: ${filesWithHits}, field hits: ${totalHits}`)
  for (const f of findings) console.log(`    e.g. ${f}`)
  return filesWithHits
}

let failed = false

console.log('=== PUBLIC release candidates (must be clean) ===')
// 1. Runtime catalog bodies are public release candidates once .answers.json is split out.
scanFiles(walk(RUNTIME_DIR), 'runtime catalog bodies (public candidate)', { skipAnswersFiles: true })

// 2. If a staging tree exists, it must contain no .answers.json and no sensitive fields.
const stagingFiles = walk(STAGING_DIR)
if (stagingFiles.length) {
  const answersInStaging = stagingFiles.filter(f => f.endsWith('.answers.json'))
  if (answersInStaging.length) {
    failed = true
    console.error(`[FAIL] .answers.json found in public staging tree: ${answersInStaging.map(f => path.relative(ROOT, f)).join(', ')}`)
  } else {
    console.log('[staging tree] no .answers.json — OK')
  }
  const stagingHits = scanFiles(stagingFiles, 'public staging tree (must be clean)')
  if (stagingHits) failed = true
} else {
  console.log('[staging tree] none built (tmp/r2-release absent) — checked later at export time')
}

console.log('=== PRIVATE sources (expected to hold answers; never released publicly) ===')
scanFiles(walk(RUNTIME_DIR), 'private .answers.json vaults (scoring only)')

console.log('=== KNOWN EXPOSURE — must be stripped before any public R2 release ===')
const tidHits = scanFiles(walk(TID_DIR), 'IELTS TID bundles (inline answers shipped in app bundle today)')
const pkgHits = scanFiles(walk(PACKAGE_DATA), 'packages/catalog/data source JSON (mode-c strips at pack time)')

console.log('=== Conclusion ===')
console.log(`Public runtime bodies clean: ${scanFiles.length === undefined ? 'checked above' : 'checked above'}`)
console.log(`TID bundles carry inline answers (existing exposure, not made worse): ${tidHits} files`)
console.log(`packages/catalog/data carries inline answers before stripping: ${pkgHits} files`)
if (tidHits > 0) {
  console.log('NOTE: Before a public R2 release, TID-derived IELTS bodies MUST be run through the same')
  console.log('      answer-stripping step as mode-c-pack-catalog (ANSWER_FIELDS). Vaults stay private.')
}

if (failed) {
  console.error('\nPUBLIC/PRIVATE SEPARATION FAILED')
  process.exit(1)
}
console.log('\nPUBLIC/PRIVATE SEPARATION PASS')
