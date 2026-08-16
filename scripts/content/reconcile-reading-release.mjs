/**
 * Reconcile the Reading release set — single source of truth.
 *
 * The runtime body JSON + `.answers.json` vaults under
 * apps/web/public/catalog/exams/reading/ ARE the content source of truth.
 * manifest.json and catalog-reading-meta.json are derived indexes that were
 * found to drift (163 / 166 / 169). This script makes manifest == meta ==
 * runtime release bodies (166) with targeted, idempotent edits:
 *
 *   1. Add release IDs missing from manifest:
 *        catalog-cam-11-2-reading          (real IELTS test, full TID bundle)
 *        catalog-reading-pet-b1-test2      (real PET test, full vault)
 *        catalog-reading-pet-b1-test3      (real PET test, full vault)
 *   2. Remove from meta (documented release exclusions; bodies stay on disk):
 *        catalog-ket-a2-generated-01       (EXCLUDE_FIXTURE)
 *        catalog-ket-cam1-test1            (BLOCKED_DUPLICATE of catalog-reading-ket-a2-test1)
 *      (catalog-reading-cae-c1-test24 -> BLOCKED_MISSING_VAULT, never in meta)
 *   3. Repair IELTS meta stubs: questionCount + part ranges derived from the
 *      authoritative TID bundle instead of the intentionally-empty public stub.
 *   4. Add meta stubs for catalog-reading-pet-b1-test2/test3 derived from their
 *      runtime bodies (full vaults, 32 questions each).
 *
 * All other meta/manifest entries are preserved verbatim. No runtime body or
 * vault is written, moved or deleted.
 *
 * Exclusions are shared with validate-reading-release-set.mjs — keep in sync.
 *
 * Run:
 *   node scripts/content/reconcile-reading-release.mjs
 *   node scripts/content/reconcile-reading-release.mjs --dry-run   # no writes
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

const DRY_RUN = process.argv.includes('--dry-run')

// Keep in sync with validate-reading-release-set.mjs.
const RELEASE_EXCLUSIONS = new Set([
  'catalog-ket-a2-generated-01',
  'catalog-ket-cam1-test1',
  'catalog-reading-cae-c1-test24',
])

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))

function isIeltsId(id) {
  return /^catalog-cam-\d+-\d+-reading$/.test(id)
}

function collectBodyQuestions(body) {
  const out = []
  for (const part of body.parts ?? []) {
    for (const q of part.questions ?? []) out.push(q)
    for (const g of part.questionGroups ?? []) for (const q of g.questions ?? []) out.push(q)
  }
  return out
}

function loadTid(slug) {
  const file = path.join(TID_DIR, `reading-${slug}.json`)
  if (!fs.existsSync(file)) return null
  const tid = read(file)
  return tid.default ?? tid
}

function ieltsSlugFromId(id) {
  const m = id.match(/cam-(\d+)-(\d+)-reading/)
  return m ? `cam-${Number(m[1])}-${Number(m[2])}` : null
}

function cambridgeSlugFromId(id, body) {
  if (body?.catalogSlug) return body.catalogSlug
  return id.replace(/^catalog-reading-/, '').replace(/^catalog-/, '')
}

/* ------------------------------------------------------------------ *
 * Load current state
 * ------------------------------------------------------------------ */
const manifest = read(MANIFEST_PATH)
const meta = read(META_PATH)

const runtimeBodyIds = fs.readdirSync(RUNTIME_DIR)
  .filter(f => f.endsWith('.json') && !f.endsWith('.answers.json'))
  .map(f => f.replace(/\.json$/, ''))
const releaseIds = runtimeBodyIds.filter(id => !RELEASE_EXCLUSIONS.has(id))
const releaseSet = new Set(releaseIds)

const existingManifest = Array.isArray(manifest.reading) ? manifest.reading : []
const manifestById = new Map(existingManifest.map(e => [e.id, e]))
const existingMetaById = new Map(meta.map(e => [e.id, e]))

/* ------------------------------------------------------------------ *
 * 1. Manifest — add missing release IDs (preserve all existing entries).
 * ------------------------------------------------------------------ */
for (const id of releaseIds) {
  if (manifestById.has(id)) continue
  const body = read(path.join(RUNTIME_DIR, `${id}.json`))
  const slug = body.catalogSlug
    ?? (isIeltsId(id) ? `ielts-${ieltsSlugFromId(id)?.replace('-', 'test')}` : cambridgeSlugFromId(id, body))
  manifestById.set(id, { id, slug, title: body.title })
}

/* ------------------------------------------------------------------ *
 * 2. Meta — drop exclusions, keep every release ID.
 * ------------------------------------------------------------------ */
const nextMetaById = new Map()
for (const entry of meta) {
  if (RELEASE_EXCLUSIONS.has(entry.id)) continue
  nextMetaById.set(entry.id, entry)
}

/* ------------------------------------------------------------------ *
 * 4. Meta — add stubs for release IDs not yet present.
 * ------------------------------------------------------------------ */
for (const id of releaseIds) {
  if (nextMetaById.has(id)) continue
  const body = read(path.join(RUNTIME_DIR, `${id}.json`))
  if (isIeltsId(id)) {
    const slug = ieltsSlugFromId(id)
    const tid = slug ? loadTid(slug) : null
    nextMetaById.set(id, buildIeltsStub(id, tid, body))
  } else {
    nextMetaById.set(id, buildCambridgeStub(id, body))
  }
}

/* ------------------------------------------------------------------ *
 * 3. IELTS meta — repair questionCount + parts from the TID bundle.
 * ------------------------------------------------------------------ */
let ieltsRepaired = 0
for (const id of releaseIds) {
  if (!isIeltsId(id)) continue
  const entry = nextMetaById.get(id)
  const slug = ieltsSlugFromId(id)
  const tid = slug ? loadTid(slug) : null
  if (!tid) continue
  const parts = Array.isArray(tid.parts) ? tid.parts : []
  const qc = parts.reduce((n, p) => {
    for (const g of p.questionGroups ?? []) n += g.questions?.length ?? 0
    for (const q of p.questions ?? []) n += 1
    return n
  }, 0)
  if (entry.questionCount !== qc || entry.parts?.length !== parts.length) {
    entry.questionCount = qc
    entry.parts = parts.map(p => ({
      id: `${id}-part-${p.partNumber}`,
      partNumber: p.partNumber,
      rangeLabel: p.rangeLabel ?? '',
      questions: [],
    }))
    ieltsRepaired += 1
  }
}

/* ------------------------------------------------------------------ *
 * Sort + write
 * ------------------------------------------------------------------ */
const newManifest = {
  ...manifest,
  builtAt: DRY_RUN ? manifest.builtAt : new Date().toISOString(),
  reading: [...manifestById.values()].sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true })),
}
const newMeta = [...nextMetaById.values()].sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }))

const manifestAdded = newManifest.reading.filter(e => !existingManifest.some(x => x.id === e.id)).map(e => e.id)
const metaAdded = newMeta.filter(e => !existingMetaById.has(e.id)).map(e => e.id)
const metaRemoved = meta.filter(e => RELEASE_EXCLUSIONS.has(e.id)).map(e => e.id)

console.log(`Release IDs:              ${releaseIds.length}`)
console.log(`Manifest reading entries: ${newManifest.reading.length}`)
console.log(`Meta entries:             ${newMeta.length}`)
console.log(`Manifest entries added:   ${manifestAdded.join(', ') || 'none'}`)
console.log(`Meta entries removed:     ${metaRemoved.join(', ') || 'none'}`)
console.log(`Meta entries added:       ${metaAdded.join(', ') || 'none'}`)
console.log(`IELTS meta repaired:      ${ieltsRepaired}`)
console.log(`Mode: ${DRY_RUN ? 'DRY-RUN (no writes)' : 'WRITE'}`)

if (!DRY_RUN) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(newManifest, null, 2), 'utf8')
  fs.writeFileSync(META_PATH, JSON.stringify(newMeta, null, 2) + '\n', 'utf8')
  console.log('\nWrote:')
  console.log('  packages/catalog/data/manifest.json')
  console.log('  packages/catalog/data/catalog-reading-meta.json')
}

/* ------------------------------------------------------------------ *
 * Stub builders
 * ------------------------------------------------------------------ */
function buildCambridgeStub(id, body) {
  const parts = Array.isArray(body.parts) ? body.parts : []
  return {
    id,
    title: body.title,
    durationMinutes: body.durationMinutes ?? 30,
    bandHint: body.bandHint ?? '',
    examMode: body.examMode ?? 'practice',
    examTrack: body.examTrack ?? 'cambridge',
    cambridgeLevel: body.cambridgeLevel,
    questionCount: collectBodyQuestions(body).length,
    bodyPath: `catalog/exams/reading/${id}.json`,
    answersPath: `catalog/exams/reading/${id}.answers.json`,
    bodyRemote: true,
    answersRemote: true,
    parts: parts.map(p => ({
      id: p.id,
      partNumber: p.partNumber,
      rangeLabel: p.rangeLabel ?? '',
      questions: [],
    })),
  }
}

function buildIeltsStub(id, tid, body) {
  const parts = Array.isArray(tid?.parts) ? tid.parts : []
  const qc = parts.reduce((n, p) => {
    for (const g of p.questionGroups ?? []) n += g.questions?.length ?? 0
    for (const q of p.questions ?? []) n += 1
    return n
  }, 0)
  return {
    id,
    title: body?.title ?? tid?.title ?? id,
    durationMinutes: body?.durationMinutes ?? tid?.durationMinutes ?? 60,
    bandHint: body?.bandHint ?? tid?.bandHint ?? 'Cambridge Reading',
    examMode: 'practice',
    examTrack: 'ielts',
    questionCount: qc,
    bodyPath: `catalog/exams/reading/${id}.json`,
    answersPath: `catalog/exams/reading/${id}.answers.json`,
    bodyRemote: true,
    answersRemote: true,
    parts: parts.map(p => ({
      id: `${id}-part-${p.partNumber}`,
      partNumber: p.partNumber,
      rangeLabel: p.rangeLabel ?? '',
      questions: [],
    })),
  }
}
