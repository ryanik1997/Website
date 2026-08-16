/**
 * Build the Reading release set as a local dry-run under tmp/r2-release/.
 *
 * Structure (immutable release root; production manifest published last):
 *   tmp/r2-release/<release-id>/
 *     releases/<release-id>/
 *       ielts/reading/academic/catalog.json
 *       ielts/reading/academic/<stable-id>.json        (answer-stripped TID content)
 *       cambridge/reading/{a2|b1|b2|c1|c2}/<stable-id>.json   (already stripped)
 *       assets/cambridge/reading/<slug>/<file>         (referenced local images)
 *     manifests/releases/<release-id>.json             (release manifest + inventory)
 *
 * Validation (fails the build):
 *   - every JSON parses
 *   - object count matches the canonical release set (166 reading tests)
 *   - no private answer fields in the public tree
 *   - referenced local images exist (or are approved external URLs)
 *   - no local Windows paths, no zero-byte assets
 *   - no duplicate object keys, no case-collision object keys
 *
 * Run:
 *   node scripts/content/build-reading-release.mjs            # writes tmp/r2-release/<id>/
 *   node scripts/content/build-reading-release.mjs --id r2    # custom release id
 *   node scripts/content/build-reading-release.mjs --report   # print full inventory
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

const RUNTIME_DIR = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const MEDIA_DIR = path.join(ROOT, 'apps/web/public/catalog/reading')
const TID_DIR = path.join(ROOT, 'apps/web/src/features/exam/tidIeltsReading/data')
const RELEASE_ROOT = path.join(ROOT, 'tmp/r2-release')

// Keep in sync with the drift guard / reconciler.
const RELEASE_EXCLUSIONS = new Set([
  'catalog-ket-a2-generated-01',
  'catalog-ket-cam1-test1',
  'catalog-reading-cae-c1-test24',
])

const ANSWER_FIELDS = new Set([
  'answer', 'acceptedAnswers', 'acceptableAnswers', 'explanation', 'correct',
  'correctAnswer', 'correctAnswers', 'solution', 'solutions', 'answerKey',
  'key', 'feedback',
])

const RELEASE_ID = (() => {
  const idx = process.argv.indexOf('--id')
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1]
  return 'exam-content-r1-20260804'
})()
const SHOW_REPORT = process.argv.includes('--report')

const REL = `releases/${RELEASE_ID}`
const OUT_REL = path.join(RELEASE_ROOT, REL)
const OUT_MANIFESTS = path.join(RELEASE_ROOT, 'manifests/releases')

const CT = {
  '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
}
const IMMUTABLE = 'public, max-age=31536000, immutable'

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex')
}

function stripAnswers(obj) {
  if (Array.isArray(obj)) return obj.map(stripAnswers)
  if (!obj || typeof obj !== 'object') return obj
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (ANSWER_FIELDS.has(k)) continue
    out[k] = stripAnswers(v)
  }
  return out
}

function collectQuestions(body) {
  const out = []
  for (const part of body.parts ?? []) {
    for (const q of part.questions ?? []) out.push(q)
    for (const g of part.questionGroups ?? []) for (const q of g.questions ?? []) out.push(q)
  }
  return out
}

function isIeltsId(id) {
  return /^catalog-cam-\d+-\d+-reading$/.test(id)
}

function ieltsSlug(id) {
  const m = id.match(/cam-(\d+)-(\d+)-reading/)
  return m ? `cam-${Number(m[1])}-${Number(m[2])}` : null
}

const inventory = [] // { key, source, bytes, sha256, contentType, cacheControl, classification }

function addObject(key, localPath, classification = 'public') {
  const buf = fs.readFileSync(localPath)
  if (buf.length === 0) throw new Error(`zero-byte asset: ${key} (${localPath})`)
  const ext = path.extname(localPath).toLowerCase()
  inventory.push({
    objectKey: key,
    source: path.relative(ROOT, localPath).replace(/\\/g, '/'),
    bytes: buf.length,
    sha256: sha256(buf),
    contentType: CT[ext] ?? 'application/octet-stream',
    cacheControl: IMMUTABLE,
    classification,
  })
}

const failures = []
const fail = (m) => { failures.push(m) }

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }) }

async function main() {
  if (fs.existsSync(path.join(RELEASE_ROOT, REL))) {
    fs.rmSync(path.join(RELEASE_ROOT, REL), { recursive: true, force: true })
    fs.rmSync(path.join(RELEASE_ROOT, 'manifests'), { recursive: true, force: true })
  }

  const bodyIds = fs.readdirSync(RUNTIME_DIR)
    .filter(f => f.endsWith('.json') && !f.endsWith('.answers.json'))
    .map(f => f.replace(/\.json$/, ''))
  const releaseIds = bodyIds.filter(id => !RELEASE_EXCLUSIONS.has(id)).sort()
  const ieltsIds = releaseIds.filter(isIeltsId)
  const cambridgeIds = releaseIds.filter(id => !isIeltsId(id))

  // ---- IELTS reading: answer-stripped TID bodies + catalog ----
  const ieltsCatalog = []
  for (const id of ieltsIds) {
    const slug = ieltsSlug(id)
    const tidFile = path.join(TID_DIR, `reading-${slug}.json`)
    if (!fs.existsSync(tidFile)) { fail(`IELTS TID missing for ${id}`); continue }
    const tid = JSON.parse(fs.readFileSync(tidFile, 'utf8'))
    const mod = tid.default ?? tid
    const stripped = stripAnswers(mod)
    const body = {
      ...stripped,
      id,
      catalogSlug: `ielts-${slug.replace('-', 'test')}`,
      catalogBase: `/catalog/reading/ielts-${slug.replace('-', 'test')}`,
      release: { module: 'ielts', skill: 'reading', level: 'academic', id },
    }
    const key = `${REL}/ielts/reading/academic/${id}.json`
    const local = path.join(OUT_REL, 'ielts/reading/academic', `${id}.json`)
    ensureDir(path.dirname(local))
    fs.writeFileSync(local, JSON.stringify(body))
    addObject(key, local)
    const qc = collectQuestions(body).length
    ieltsCatalog.push({ id, slug, title: body.title ?? id, questions: qc, objectKey: `${REL}/ielts/reading/academic/${id}.json` })
  }
  const ieltsCatalogPath = path.join(OUT_REL, 'ielts/reading/academic/catalog.json')
  ensureDir(path.dirname(ieltsCatalogPath))
  fs.writeFileSync(ieltsCatalogPath, JSON.stringify({ module: 'ielts', skill: 'reading', level: 'academic', count: ieltsCatalog.length, tests: ieltsCatalog }, null, 2))
  addObject(`${REL}/ielts/reading/academic/catalog.json`, ieltsCatalogPath)

  // ---- Cambridge reading: already-stripped runtime bodies + referenced images ----
  for (const id of cambridgeIds) {
    const bodyFile = path.join(RUNTIME_DIR, `${id}.json`)
    const body = JSON.parse(fs.readFileSync(bodyFile, 'utf8'))
    const level = body.cambridgeLevel ?? 'unknown'
    const key = `${REL}/cambridge/reading/${level}/${id}.json`
    const local = path.join(OUT_REL, 'cambridge/reading', level, `${id}.json`)
    ensureDir(path.dirname(local))
    fs.writeFileSync(local, JSON.stringify(body))
    addObject(key, local)

    // referenced local images
    const refs = new Set()
    const walk = (obj) => {
      if (!obj || typeof obj !== 'object') return
      if (Array.isArray(obj)) { obj.forEach(walk); return }
      for (const [k, v] of Object.entries(obj)) {
        if (k === 'imageUrl' && typeof v === 'string' && /^\/(catalog\/reading\/)/.test(v)) refs.add(v)
        else walk(v)
      }
    }
    walk(body)
    for (const ref of refs) {
      const relFile = ref.replace(/^\/catalog\/reading\//, '') // slug/file
      const localImg = path.join(MEDIA_DIR, relFile)
      if (fs.existsSync(localImg)) {
        const imgKey = `${REL}/assets/cambridge/reading/${relFile}`
        const imgLocal = path.join(RELEASE_ROOT, imgKey)
        ensureDir(path.dirname(imgLocal))
        fs.copyFileSync(localImg, imgLocal)
        addObject(imgKey, imgLocal)
      } else {
        fail(`[${id}] referenced image missing locally: ${ref}`)
      }
    }
  }

  // ---- Release manifest ----
  const manifestLocal = path.join(OUT_MANIFESTS, `${RELEASE_ID}.json`)
  ensureDir(OUT_MANIFESTS)
  const releaseManifest = {
    releaseId: RELEASE_ID,
    builtAt: new Date().toISOString(),
    source: 'generated canonical release set (data reconciliation PASS 2026-08-04)',
    modules: { reading: { total: releaseIds.length, ielts: ieltsIds.length, cambridge: cambridgeIds.length } },
    objects: inventory,
  }
  fs.writeFileSync(manifestLocal, JSON.stringify(releaseManifest, null, 2))
  addObject(`manifests/releases/${RELEASE_ID}.json`, manifestLocal, 'release-manifest')

  // ---- Validation ----
  // 1. JSON parse + private fields
  for (const it of inventory) {
    if (!it.objectKey.endsWith('.json')) continue
    const local = path.join(RELEASE_ROOT, it.objectKey)
    try {
      const parsed = JSON.parse(fs.readFileSync(local, 'utf8'))
      const s = JSON.stringify(parsed)
      for (const field of ANSWER_FIELDS) {
        if (new RegExp(`"${field}"\\s*:`).test(s)) fail(`private field "${field}" in public object ${it.objectKey}`)
      }
    } catch (e) {
      fail(`JSON parse error in ${it.objectKey}: ${e.message}`)
    }
  }
  // 2. Counts
  if (releaseIds.length !== 166) fail(`release count ${releaseIds.length} != 166`)
  if (ieltsIds.length !== 48) fail(`IELTS release count ${ieltsIds.length} != 48`)
  if (cambridgeIds.length !== 118) fail(`Cambridge release count ${cambridgeIds.length} != 118`)
  // 3. Windows paths / zero bytes / duplicate keys / case collision
  for (const it of inventory) {
    if (it.objectKey.includes('\\')) fail(`local Windows path in object key: ${it.objectKey}`)
    if (it.source.includes('\\')) fail(`local Windows path in source: ${it.source}`)
    if (it.bytes === 0) fail(`zero-byte asset: ${it.objectKey}`)
  }
  const keys = inventory.map(i => i.objectKey)
  const dupKeys = keys.filter((k, i) => keys.indexOf(k) !== i)
  if (dupKeys.length) fail(`duplicate object keys: ${[...new Set(dupKeys)].join(', ')}`)
  const lower = new Map()
  for (const k of keys) {
    const l = k.toLowerCase()
    if (lower.has(l) && lower.get(l) !== k) fail(`case-collision object keys: ${lower.get(l)} vs ${k}`)
    lower.set(l, k)
  }
  // 4. No .answers.json in public tree
  const answersInRelease = keys.filter(k => k.endsWith('.answers.json'))
  if (answersInRelease.length) fail(`.answers.json in release tree: ${answersInRelease.join(', ')}`)

  // ---- Report ----
  console.log(`Release ID:    ${RELEASE_ID}`)
  console.log(`Reading tests: ${releaseIds.length} (IELTS ${ieltsIds.length}, Cambridge ${cambridgeIds.length})`)
  console.log(`Objects:       ${inventory.length}`)
  console.log(`  JSON bodies: ${inventory.filter(i => i.objectKey.endsWith('.json')).length}`)
  console.log(`  images:      ${inventory.filter(i => !i.objectKey.endsWith('.json')).length}`)
  console.log(`Total bytes:   ${inventory.reduce((n, i) => n + i.bytes, 0)}`)

  if (SHOW_REPORT) {
    console.log('\nInventory:')
    for (const it of inventory) {
      console.log(`  ${it.objectKey}  ${it.bytes}B  ${it.contentType}  ${it.classification}`)
    }
  }

  if (failures.length) {
    console.error(`\nRELEASE BUILD FAILED (${failures.length})`)
    for (const f of failures) console.error('  ✗ ' + f)
    process.exit(1)
  }
  console.log('\nRELEASE BUILD OK')
  console.log(`Staged at: ${path.relative(ROOT, path.join(RELEASE_ROOT, REL)).replace(/\\/g, '/')}`)
  console.log(`Manifest:  ${path.relative(ROOT, manifestLocal).replace(/\\/g, '/')}`)
}

main().catch(err => { console.error(err); process.exit(1) })
