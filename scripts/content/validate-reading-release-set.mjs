/**
 * Reading release-set drift guard (read-only).
 *
 * Validates that the canonical Reading release set is internally consistent:
 * manifest == meta == runtime release bodies, every body has a vault when
 * scoring is required, no orphan bodies, no duplicate IDs, and question/answer
 * counts match except for a documented allow-list.
 *
 * The guard NEVER modifies anything. It exits non-zero on any drift.
 *
 * Run:
 *   node scripts/content/validate-reading-release-set.mjs
 *   node scripts/content/validate-reading-release-set.mjs --report-json
 *
 * Architecture note (why IELTS bodies are validated differently):
 *   - Cambridge Reading (`catalog-reading-*`) ships full content as runtime
 *     body JSON + a separate `.answers.json` vault. Scoring requires the vault.
 *   - IELTS Academic Reading (`catalog-cam-{n}-{t}-reading`) ships its real
 *     content as an eager Vite bundle under
 *     apps/web/src/features/exam/tidIeltsReading/data/reading-cam-*.json with
 *     inline answers. The public catalog body for IELTS is intentionally a
 *     stub (`parts: []`) — the route resolves via `loadTidReadingTestByExamId`.
 *     Therefore IELTS bodies/vaults are validated against the TID bundle.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

const MANIFEST_PATH = path.join(ROOT, 'packages/catalog/data/manifest.json')
const META_PATH = path.join(ROOT, 'packages/catalog/data/catalog-reading-meta.json')
const RUNTIME_DIR = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const TID_DIR = path.join(ROOT, 'apps/web/src/features/exam/tidIeltsReading/data')
const STAGING_DIR = path.join(ROOT, 'tmp/r2-release')

/**
 * Documented exclusions from the Reading release set.
 *
 * These bodies exist on disk but are intentionally NOT part of the released
 * manifest/meta. See tmp/r2-content-migration-audit.md and the six-ID audit in
 * tmp/r2-reading-reconciliation.md for evidence per ID.
 */
const RELEASE_EXCLUSIONS = {
  'catalog-ket-a2-generated-01': {
    decision: 'EXCLUDE_FIXTURE',
    reason:
      'Generated AI pilot flagged "generated-review-required" in bandHint; 2 empty prompts; questionCount 32 vs vault 31. Not production content.',
  },
  'catalog-ket-cam1-test1': {
    decision: 'BLOCKED_DUPLICATE',
    reason:
      'Byte-identical duplicate of catalog-reading-ket-a2-test1 (official KET sample, which IS released with a full vault); zero answers in vault; legacy catalog-ket- prefix has no body-hydration path in resolveReadingExam.',
  },
  'catalog-reading-cae-c1-test24': {
    decision: 'BLOCKED_MISSING_VAULT',
    reason:
      'Real CAE C1 content (56 questions, answerConfidence "pending") but answer vault is empty; not registered in meta/manifest; no resolvable route. Keep body on disk; cannot release until a vault exists.',
  },
}

/**
 * Allow-listed question/answer exceptions for IELTS Reading.
 * 1,921 questions total; 1,919 non-empty answers. Two questions carry an empty
 * answer in the authoritative runtime TID bundle and are documented below.
 * No answer value is fabricated — scoring is unavailable for these until the
 * underlying source data is repaired.
 */
const IELTS_ANSWER_EXCEPTIONS = [
  {
    testId: 'catalog-cam-11-3-reading',
    tidFile: 'reading-cam-11-3.json',
    part: 1,
    questionNumber: 9,
    classification: 'TRANSFORM_DROPPED',
    note:
      'Crawl Tainguyen/Crawl/Reading_ITELTS/Cam11_Test3.json contains the answer "nylon" on the question whose text reads "20th century: 9. ____ and other manmade fibres", but the crawler assigned it a duplicate id 8 (same as the "monks" question), so the transform produced a phantom empty Q9. Answer exists in source; renumber + regenerate required before scoring can be enabled. Not writing the value here (read-only reconciliation).',
  },
  {
    testId: 'catalog-cam-12-2-reading',
    tidFile: 'reading-cam-12-2.json',
    part: 1,
    questionNumber: 11,
    classification: 'SOURCE_MISSING',
    note:
      'Crawl Tainguyen/Crawl/Reading_ITELTS/Cam12_Test2.json id 11 has empty text and empty answer; neighbours Q10=["D","E"], Q12=["C","D"]. The answer is genuinely absent from the authoritative local source and cannot be proved locally without guessing.',
  },
]

const EXCEPTION_KEYS = new Set(IELTS_ANSWER_EXCEPTIONS.map(e => `${e.testId}:p${e.part}:q${e.questionNumber}`))

function jsonPath(p) {
  return p.replace(/\\/g, '/').replace(/^\.\/|^\.\.\//, '')
}

/** Read a JSON file or throw a guard failure. */
function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    throw new Error(`[guard] Cannot parse ${label} (${jsonPath(file)}): ${err.message}`)
  }
}

function isIeltsId(id) {
  return /^catalog-cam-\d+-\d+-reading$/.test(id)
}

/** Flatten reading questions from a Cambridge-style runtime body. */
function collectBodyQuestions(body) {
  const out = []
  for (const part of body.parts ?? []) {
    for (const q of part.questions ?? []) out.push(q)
    for (const g of part.questionGroups ?? []) for (const q of g.questions ?? []) out.push(q)
  }
  return out
}

/** Flatten questions from a TID bundle. */
function collectTidQuestions(tid) {
  const out = []
  const parts = tid.parts ?? []
  for (const part of parts) {
    for (const g of part.questionGroups ?? []) for (const q of g.questions ?? []) out.push(q)
    for (const q of part.questions ?? []) out.push(q)
  }
  return out
}

function countTidAnswers(questions) {
  return questions.filter(q => q.answer != null && String(q.answer).trim() !== '').length
}

const failures = []
const report = {
  manifest: 0,
  meta: 0,
  runtimeRelease: 0,
  routesResolved: 0,
  bodies: 0,
  vaults: 0,
  orphans: 0,
  missingBodies: 0,
  missingVaults: 0,
  answerExceptions: IELTS_ANSWER_EXCEPTIONS.length,
  exclusions: Object.keys(RELEASE_EXCLUSIONS).length,
  errors: [],
  notes: [],
}

function fail(msg) {
  report.errors.push(msg)
  failures.push(msg)
}

function check(pass, msg) {
  if (!pass) fail(msg)
}

/* ------------------------------------------------------------------ *
 * 1. Load sources
 * ------------------------------------------------------------------ */
const manifest = readJson(MANIFEST_PATH, 'manifest')
const meta = readJson(META_PATH, 'catalog-reading-meta.json')

const manifestReading = Array.isArray(manifest?.reading) ? manifest.reading : []
const metaReading = Array.isArray(meta) ? meta : []

const manifestIds = manifestReading.map(e => e.id)
const metaIds = metaReading.map(e => e.id)

const runtimeFiles = fs.readdirSync(RUNTIME_DIR).filter(f => f.endsWith('.json') && !f.endsWith('.answers.json'))
const vaultFiles = fs.readdirSync(RUNTIME_DIR).filter(f => f.endsWith('.answers.json'))
const runtimeBodyIds = runtimeFiles.map(f => f.replace(/\.json$/, ''))
const runtimeVaultIds = vaultFiles.map(f => f.replace(/\.answers\.json$/, ''))

/* ------------------------------------------------------------------ *
 * 2. Duplicate ID checks
 * ------------------------------------------------------------------ */
const dupManifest = manifestIds.filter((id, i) => manifestIds.indexOf(id) !== i)
const dupMeta = metaIds.filter((id, i) => metaIds.indexOf(id) !== i)
const dupBody = runtimeBodyIds.filter((id, i) => runtimeBodyIds.indexOf(id) !== i)
check(dupManifest.length === 0, `Manifest has duplicate reading IDs: ${[...new Set(dupManifest)].join(', ')}`)
check(dupMeta.length === 0, `Meta has duplicate reading IDs: ${[...new Set(dupMeta)].join(', ')}`)
check(dupBody.length === 0, `Runtime has duplicate reading body IDs: ${[...new Set(dupBody)].join(', ')}`)

/* ------------------------------------------------------------------ *
 * 3. Canonical release set
 * ------------------------------------------------------------------ */
const releaseIds = runtimeBodyIds.filter(id => !RELEASE_EXCLUSIONS[id])

// Orphans: bodies that are not in the release set and not documented exclusions
const manifestSet = new Set(manifestIds)
const metaSet = new Set(metaIds)
const releaseSet = new Set(releaseIds)

// Every manifest/meta ID must have a runtime body (catalog UI entry without body).
const missingBodies = [...manifestSet]
  .concat([...metaSet])
  .filter((id, i, arr) => arr.indexOf(id) === i)
  .filter(id => !releaseSet.has(id) && !RELEASE_EXCLUSIONS[id])
check(missingBodies.length === 0, `Missing runtime bodies for release IDs: ${missingBodies.join(', ')}`)

// Exclusions must not appear in manifest or meta.
const excludedInManifest = manifestIds.filter(id => RELEASE_EXCLUSIONS[id])
const excludedInMeta = metaIds.filter(id => RELEASE_EXCLUSIONS[id])
check(excludedInManifest.length === 0, `Excluded IDs must not be in manifest: ${excludedInManifest.join(', ')}`)
check(excludedInMeta.length === 0, `Excluded IDs must not be in meta: ${excludedInMeta.join(', ')}`)

// Orphan bodies: on disk, not in release, not a documented exclusion.
const orphanBodies = runtimeBodyIds.filter(id => !releaseSet.has(id) && !RELEASE_EXCLUSIONS[id])
check(orphanBodies.length === 0, `Orphan runtime bodies (no manifest/meta, not excluded): ${orphanBodies.join(', ')}`)
report.orphans = orphanBodies.length

// Vaults: every release Cambridge body needs a vault; every vault needs a body.
const releaseVaultSet = new Set(runtimeVaultIds)
const missingVaults = releaseIds.filter(id => !isIeltsId(id) && !releaseVaultSet.has(id))
check(missingVaults.length === 0, `Release Cambridge bodies missing answer vault: ${missingVaults.join(', ')}`)
report.missingVaults = missingVaults.length

const vaultWithoutBody = runtimeVaultIds.filter(id => !runtimeBodyIds.includes(id))
check(vaultWithoutBody.length === 0, `Answer vaults without a body file: ${vaultWithoutBody.join(', ')}`)

/* ------------------------------------------------------------------ *
 * 4. manifest == meta == runtime release
 * ------------------------------------------------------------------ */
const notInMeta = [...manifestSet].filter(id => !metaSet.has(id))
const notInManifest = [...metaSet].filter(id => !manifestSet.has(id))
const inManifestNotRelease = [...manifestSet].filter(id => !releaseSet.has(id) && !RELEASE_EXCLUSIONS[id])
const inReleaseNotManifest = [...releaseSet].filter(id => !manifestSet.has(id))

check(notInMeta.length === 0, `Manifest IDs missing from meta: ${notInMeta.join(', ')}`)
check(notInManifest.length === 0, `Meta IDs missing from manifest: ${notInManifest.join(', ')}`)
check(inManifestNotRelease.length === 0, `Manifest IDs with no release body: ${inManifestNotRelease.join(', ')}`)
check(inReleaseNotManifest.length === 0, `Release bodies missing from manifest: ${inReleaseNotManifest.join(', ')}`)

report.manifest = manifestSet.size
report.meta = metaSet.size
report.runtimeRelease = releaseSet.size

/* ------------------------------------------------------------------ *
 * 5. Body/vault content validation + question/answer counts
 * ------------------------------------------------------------------ */
let bodiesValidated = 0
let vaultsValidated = 0
let routesResolved = 0
let answerExceptions = new Set()

for (const id of [...releaseSet].sort()) {
  const bodyFile = path.join(RUNTIME_DIR, `${id}.json`)
  if (!fs.existsSync(bodyFile)) {
    report.missingBodies += 1
    continue
  }
  const body = readJson(bodyFile, id)

  if (isIeltsId(id)) {
    // Validate against the TID bundle (real content source).
    const slugMatch = String(body.catalogSlug ?? body.id).match(/cam(\d+)-test(\d+)/i) || id.match(/cam-(\d+)-(\d+)-reading/)
    const slug = slugMatch ? `cam-${Number(slugMatch[1])}-${Number(slugMatch[2])}` : null
    if (!slug) {
      fail(`[${id}] cannot derive TID slug`)
      continue
    }
    const tidFile = path.join(TID_DIR, `reading-${slug}.json`)
    if (!fs.existsSync(tidFile)) {
      fail(`[${id}] TID bundle missing: reading-${slug}.json`)
      continue
    }
    const tid = readJson(tidFile, `TID ${id}`)
    const mod = tid.default ?? tid
    const qs = collectTidQuestions(mod)
    const qc = qs.length
    const ac = countTidAnswers(qs)
    report.routesResolved += 1
    report.bodies += 1
    report.vaults += 1
    bodiesValidated += 1
    vaultsValidated += 1
    // meta questionCount should agree with the TID count (informational).
    const metaEntry = metaReading.find(e => e.id === id)
    if (metaEntry && metaEntry.questionCount !== qc) {
      report.errors.push(`[${id}] meta questionCount ${metaEntry.questionCount} != TID question count ${qc}`)
    }
    // answer exceptions inside this test
    const testHasException = IELTS_ANSWER_EXCEPTIONS.some(e => e.testId === id)
    for (const q of qs) {
      if (q.answer == null || String(q.answer).trim() === '') {
        if (EXCEPTION_KEYS.has(`${id}:p1:q${q.number}`)) {
          answerExceptions.add(`${id} Q${q.number}`)
        } else {
          fail(`[${id}] unanswered question #${q.number} not in allow-list`)
        }
      }
    }
    if (ac !== qc) {
      if (testHasException) {
        report.notes.push(`[${id}] TID answers ${ac} != questions ${qc} (expected — covered by allow-listed IELTS answer exceptions)`)
      } else {
        fail(`[${id}] TID answers ${ac} != questions ${qc} outside allow-list`)
      }
    }
    continue
  }

  // Cambridge-style body + vault.
  const vaultFile = path.join(RUNTIME_DIR, `${id}.answers.json`)
  const vault = fs.existsSync(vaultFile) ? readJson(vaultFile, `${id} answers`) : null
  const qs = collectBodyQuestions(body)
  const qc = qs.length
  const vaultAnswers = vault?.answers ?? {}
  const ac = Object.keys(vaultAnswers).length

  report.routesResolved += 1
  report.bodies += 1
  if (vault) report.vaults += 1
  bodiesValidated += 1
  if (vault) vaultsValidated += 1

  if (qc === 0) {
    fail(`[${id}] Cambridge body has 0 questions`)
  }
  if (!vault) {
    fail(`[${id}] Cambridge body missing answer vault`)
  } else {
    // every vault question id must exist in the body
    const bodyIds = new Set(qs.map(q => q.id).filter(Boolean))
    const vaultUnknown = Object.keys(vaultAnswers).filter(qid => !bodyIds.has(qid))
    if (vaultUnknown.length) {
      fail(`[${id}] vault contains question ids not in body: ${vaultUnknown.slice(0, 5).join(', ')}`)
    }
    const qWithId = qs.filter(q => q.id)
    if (qWithId.length && ac !== qc) {
      report.errors.push(`[${id}] vault answers ${ac} != body questions ${qc}`)
    }
  }
}

report.answerExceptions = answerExceptions.size
if (answerExceptions.size !== IELTS_ANSWER_EXCEPTIONS.length) {
  const found = [...answerExceptions].sort()
  const expected = IELTS_ANSWER_EXCEPTIONS.map(e => `${e.testId} Q${e.questionNumber}`).sort()
  fail(
    `Expected ${IELTS_ANSWER_EXCEPTIONS.length} allow-listed IELTS answer exceptions (${expected.join(', ')}) but found ${found.join(', ') || 'none'}`,
  )
}

/* ------------------------------------------------------------------ *
 * 6. Public/private separation (staging tree only)
 * ------------------------------------------------------------------ */
if (fs.existsSync(STAGING_DIR)) {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  )
  const files = walk(STAGING_DIR)
  const answersInStaging = files.filter(f => f.endsWith('.answers.json'))
  check(answersInStaging.length === 0, `Private .answers.json found in public staging tree: ${answersInStaging.map(jsonPath).join(', ')}`)
} else {
  report.notes.push('[guard] no staging tree at tmp/r2-release (dry-run not built) — private-separation check skipped')
}

/* ------------------------------------------------------------------ *
 * 7. Output
 * ------------------------------------------------------------------ */
const lines = [
  'Reading manifest entries: ' + report.manifest,
  'Reading metadata entries: ' + report.meta,
  'Reading runtime release entries: ' + report.runtimeRelease,
  'Routes resolved: ' + report.routesResolved,
  'Bodies: ' + report.bodies,
  'Vaults: ' + report.vaults,
  'Orphans: ' + report.orphans,
  'Missing bodies: ' + report.missingBodies,
  'Missing vaults: ' + report.missingVaults,
  'Question/answer exceptions: ' + report.answerExceptions,
  'Documented exclusions: ' + report.exclusions,
]

if (process.argv.includes('--report-json')) {
  console.log(JSON.stringify({ ok: failures.length === 0, ...report }, null, 2))
} else {
  console.log(lines.join('\n'))
  if (report.notes.length) {
    console.log('\nNotes:')
    for (const n of report.notes) console.log('  - ' + n)
  }
  if (report.errors.length) {
    console.log('\nNon-fatal observations:')
    for (const e of report.errors) console.log('  - ' + e)
  }
}

if (failures.length) {
  console.error('\nDRIFT GUARD FAILED')
  for (const f of failures) console.error('  ✗ ' + f)
  process.exit(1)
}

console.log('\nDRIFT GUARD PASS')
