/**
 * Publish the Preview staging manifest + Reading catalog to R2.
 *
 * 1. Builds releases/<release-id>/reading/catalog.json — a flat index of every
 *    Reading test in the release (id, level, title, objectKey) — from the
 *    local dry-run tree (source of truth for the uploaded release).
 * 2. Uploads it (immutable cache).
 * 3. Builds manifests/staging.json pointing at the release + reading catalog.
 * 4. Uploads it with a LOW cache (max-age=60) so it is easy to update during
 *    the preview window.
 *
 * SAFETY: does NOT touch manifests/production.json. Does not change Vercel.
 *
 * Run:
 *   node scripts/content/publish-staging.mjs --id exam-content-r1-20260804
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

const env = {}
for (const line of fs.readFileSync(path.join(ROOT, '.env.r2.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}
const { R2_ACCOUNT_ID: ACCOUNT_ID, R2_ACCESS_KEY_ID: ACCESS_KEY, R2_SECRET_ACCESS_KEY: SECRET, R2_BUCKET_NAME: BUCKET, R2_PUBLIC_BASE_URL: BASE_URL } = env
if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET || !BUCKET || !BASE_URL) {
  console.error('Missing R2 credentials / base URL in .env.r2.local')
  process.exit(1)
}

const idx = process.argv.indexOf('--id')
const RELEASE_ID = idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : 'exam-content-r1-20260804'
const widx = process.argv.indexOf('--writing-id')
const WRITING_ID = widx >= 0 && process.argv[widx + 1] ? process.argv[widx + 1] : 'exam-content-writing-r1-20260810'
const REL = `releases/${RELEASE_ID}`

const RELEASE_ROOT = path.join(ROOT, 'tmp/r2-release')
const RELEASE_DIR = path.join(RELEASE_ROOT, REL)
const WRITING_ROOT = path.join(ROOT, 'tmp/r2-writing-release')
const WRITING_REL = `releases/${WRITING_ID}`
const base = BASE_URL.replace(/\/+$/, '')

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET },
  maxAttempts: 4,
  requestChecksumCalculation: 'WHEN_REQUIRED',
})

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))

// ---------------- Build Reading catalog ----------------
const ieltsDir = path.join(RELEASE_DIR, 'ielts/reading/academic')
const ieltsCatalog = read(path.join(ieltsDir, 'catalog.json'))
const cambridgeRoot = path.join(RELEASE_DIR, 'cambridge/reading')

const tests = []
for (const t of ieltsCatalog.tests ?? []) {
  tests.push({ id: t.id, level: 'ielts', title: t.title ?? t.id, objectKey: t.objectKey })
}
for (const level of ['a2', 'b1', 'b2', 'c1', 'c2']) {
  const dir = path.join(cambridgeRoot, level)
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const id = f.replace(/\.json$/, '')
    const body = read(path.join(dir, f))
    tests.push({ id, level, title: body.title ?? id, objectKey: `${REL}/cambridge/reading/${level}/${f}` })
  }
}
tests.sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }))

const catalog = { module: 'reading', releaseId: RELEASE_ID, count: tests.length, tests }
const catalogKey = `${REL}/reading/catalog.json`
const catalogLocal = path.join(RELEASE_DIR, 'reading/catalog.json')
fs.mkdirSync(path.dirname(catalogLocal), { recursive: true })
fs.writeFileSync(catalogLocal, JSON.stringify(catalog, null, 2))

// ---------------- Staging manifest ----------------
const staging = {
  schemaVersion: 1,
  releaseId: RELEASE_ID,
  baseUrl: base,
  modules: {
    reading: { catalogPath: catalogKey },
    writing: { catalogPath: `${WRITING_REL}/ielts/writing/catalog.json` },
    listening: { source: 'legacy' },
    speaking: { source: 'legacy' },
  },
  notes: 'preview-only staging pointer; production.json is intentionally not published',
}
const stagingKey = 'manifests/staging.json'
const stagingLocal = path.join(RELEASE_ROOT, 'manifests/staging.json')
fs.mkdirSync(path.dirname(stagingLocal), { recursive: true })
fs.writeFileSync(stagingLocal, JSON.stringify(staging, null, 2))

// ---------------- Upload ----------------
const md5b64 = (p) => crypto.createHash('md5').update(fs.readFileSync(p)).digest().toString('base64')

async function put(key, local, cacheControl) {
  await client.send(new PutObjectCommand({
    Bucket: BUCKET, Key: key, Body: fs.readFileSync(local),
    ContentType: 'application/json', CacheControl: cacheControl, ContentMD5: md5b64(local),
  }))
  console.log(`PUT ${key}  (${fs.statSync(local).size}B, ${cacheControl})`)
}

await put(catalogKey, catalogLocal, 'public, max-age=31536000, immutable')
const writingCatalogKey = `${WRITING_REL}/ielts/writing/catalog.json`
const writingCatalogLocal = path.join(WRITING_ROOT, writingCatalogKey)
if (!fs.existsSync(writingCatalogLocal)) throw new Error(`Writing release catalog missing: ${writingCatalogLocal}`)
await put(writingCatalogKey, writingCatalogLocal, 'public, max-age=31536000, immutable')
await put(stagingKey, stagingLocal, 'public, max-age=60, must-revalidate')

// ---------------- Verify ----------------
console.log('\n=== Verify ===')
const head = async (key) => {
  const h = await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
  return { len: Number(h.ContentLength), type: h.ContentType, etag: String(h.ETag ?? '').replace(/"/g, '') }
}
for (const [key, expectCt] of [[catalogKey, 'application/json'], [stagingKey, 'application/json']]) {
  const h = await head(key)
  console.log(`HEAD ${key}: length=${h.len}, type=${h.type}, ct-ok=${h.type === expectCt}`)
}
// public fetch checks
for (const key of [stagingKey, catalogKey, writingCatalogKey]) {
  const res = await fetch(`${base}/${key}`, { headers: { Origin: 'https://ryanenglishv2.vercel.app' } })
  const body = await res.json()
  const acao = res.headers.get('access-control-allow-origin')
  console.log(`GET ${key}: status=${res.status}, acao=${acao ?? 'MISSING'}, parses=${!!body}`)
}
// reading catalog count + all referenced body objects reachable (all 166 by HEAD, concurrent)
const cat = read(catalogLocal)
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length); let i = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const k = i++; results[k] = await fn(items[k], k) }
  })
  await Promise.all(workers)
  return results
}
let missing = 0
await mapLimit(cat.tests, 8, async (t) => {
  try { await head(t.objectKey) } catch { missing++; console.log(`  MISSING body: ${t.objectKey}`) }
})
console.log(`Reading catalog: ${cat.count} tests; body objects reachable: ${cat.count - missing}/${cat.count}`)

// production.json must still be absent
let prod = 'present'
try { await head('manifests/production.json') } catch { prod = 'not-present' }
console.log(`manifests/production.json: ${prod}`)

if (missing > 0 || prod !== 'not-present') {
  console.error('\nSTAGING PUBLISH FAILED')
  process.exit(1)
}
console.log('\nSTAGING PUBLISH OK')
console.log(`staging.json:   ${base}/${stagingKey}`)
console.log(`reading catalog: ${base}/${catalogKey}`)
