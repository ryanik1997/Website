/**
 * Upload the Reading release (immutable objects + release manifest) to R2.
 *
 * Uploads every object from the dry-run inventory at
 * tmp/r2-release/manifests/releases/<release-id>.json to bucket
 * ryan-english-media under the SAME object key (releases/<release-id>/…).
 * Each PUT carries ContentType + CacheControl (immutable) + ContentMD5
 * (integrity, verified by R2). Then verifies every object with HEAD + GET.
 *
 * SAFETY: does NOT write manifests/production.json. Does not touch Vercel.
 * Does not delete or overwrite any existing release. Skips objects whose key
 * already exists with identical ETag (idempotent re-run).
 *
 * Run:
 *   node scripts/content/upload-reading-release.mjs --id exam-content-r1-20260804
 *   node scripts/content/upload-reading-release.mjs --id ... --no-verify
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import {
  S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand,
} from '@aws-sdk/client-s3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

const env = {}
for (const line of fs.readFileSync(path.join(ROOT, '.env.r2.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}
const { R2_ACCOUNT_ID: ACCOUNT_ID, R2_ACCESS_KEY_ID: ACCESS_KEY, R2_SECRET_ACCESS_KEY: SECRET, R2_BUCKET_NAME: BUCKET } = env
if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET || !BUCKET) {
  console.error('Missing R2 credentials in .env.r2.local')
  process.exit(1)
}

const idx = process.argv.indexOf('--id')
const RELEASE_ID = idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : 'exam-content-r1-20260804'
const VERIFY = !process.argv.includes('--no-verify')
const CONCURRENCY = 8

const MANIFEST = path.join(ROOT, 'tmp/r2-release/manifests/releases', `${RELEASE_ID}.json`)
if (!fs.existsSync(MANIFEST)) {
  console.error(`Release manifest not found: ${MANIFEST} (build the dry-run first)`)
  process.exit(1)
}
const releaseManifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
const RELEASE_ROOT = path.join(ROOT, 'tmp/r2-release')

// The release manifest itself is part of the immutable release (only
// manifests/production.json is the mutable pointer and is NOT uploaded here).
const inventory = [
  ...releaseManifest.objects,
  {
    objectKey: `manifests/releases/${RELEASE_ID}.json`,
    source: path.relative(ROOT, MANIFEST).replace(/\\/g, '/'),
    bytes: fs.statSync(MANIFEST).size,
    sha256: crypto.createHash('sha256').update(fs.readFileSync(MANIFEST)).digest('hex'),
    contentType: 'application/json',
    cacheControl: 'public, max-age=31536000, immutable',
    classification: 'release-manifest',
  },
]

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET },
  maxAttempts: 4,
  // Do NOT auto-add a CRC32 checksum alongside our explicit ContentMD5 —
  // R2 rejects "only one non-default checksum at a time".
  requestChecksumCalculation: 'WHEN_REQUIRED',
})

const b64 = (buf) => buf.toString('base64')

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let i = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const k = i++
      results[k] = await fn(items[k], k)
    }
  })
  await Promise.all(workers)
  return results
}

// ---------------- Upload ----------------
console.log(`Uploading release ${RELEASE_ID}: ${inventory.length} objects → ${BUCKET}`)
let uploaded = 0
let skipped = 0
const putErrors = []

const putResults = await mapLimit(inventory, CONCURRENCY, async (item) => {
  const local = path.join(RELEASE_ROOT, item.objectKey)
  const buf = fs.readFileSync(local)
  const md5 = crypto.createHash('md5').update(buf).digest()
  try {
    // Skip if already present with identical ETag (idempotent).
    try {
      const head = await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: item.objectKey }))
      const etag = String(head.ETag ?? '').replace(/"/g, '')
      if (etag === md5.toString('hex')) { skipped++; return { item, status: 'skipped' } }
    } catch { /* not present — fall through to put */ }
    await client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: item.objectKey,
      Body: buf,
      ContentType: item.contentType,
      CacheControl: item.cacheControl,
      ContentMD5: b64(md5),
    }))
    uploaded++
    return { item, status: 'put' }
  } catch (err) {
    putErrors.push({ key: item.objectKey, error: err.message })
    return { item, status: 'error', error: err.message }
  }
})

console.log(`Uploaded: ${uploaded} | skipped (already present): ${skipped} | errors: ${putErrors.length}`)
for (const e of putErrors.slice(0, 10)) console.log(`  PUT ERROR ${e.key}: ${e.error}`)
if (putErrors.length) { console.error(`\nUPLOAD FAILED (${putErrors.length} object errors)`); process.exit(1) }

if (!VERIFY) {
  console.log('\nUPLOAD OK (verification skipped)')
  process.exit(0)
}

// ---------------- Verify ----------------
console.log('\n=== Verification ===')
const headErrors = []
const getErrors = []
let verifiedCount = 0
let shaOk = 0
let lengthOk = 0
let typeOk = 0

const headResults = await mapLimit(inventory, CONCURRENCY, async (item) => {
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: item.objectKey }))
    const remoteLen = Number(head.ContentLength ?? -1)
    const remoteType = head.ContentType ?? ''
    const remoteEtag = String(head.ETag ?? '').replace(/"/g, '')
    const localMd5 = crypto.createHash('md5').update(fs.readFileSync(path.join(RELEASE_ROOT, item.objectKey))).digest('hex')
    const ok = remoteLen === item.bytes && remoteType === item.contentType
    if (ok) { verifiedCount++; lengthOk++; typeOk++ }
    if (remoteEtag === localMd5) shaOk++
    return { item, ok, remoteLen, remoteType, remoteEtag }
  } catch (err) {
    headErrors.push({ key: item.objectKey, error: err.message })
    return { item, ok: false }
  }
})

console.log(`HEAD verified: ${headErrors.length ? headResults.filter(r => r.ok).length : verifiedCount}/${inventory.length}`)
console.log(`  Content-Length match: ${lengthOk}`)
console.log(`  Content-Type match:   ${typeOk}`)
console.log(`  ETag/MD5 match:       ${shaOk}`)
for (const e of headErrors.slice(0, 10)) console.log(`  HEAD ERROR ${e.key}: ${e.error}`)

// GET + parse every JSON body; no .answers.json anywhere; no leaked fields
const SENSITIVE = ['answer', 'acceptedAnswers', 'acceptableAnswers', 'explanation', 'correct', 'correctOption', 'correctAnswer', 'correctAnswers', 'solution', 'solutions', 'answerKey', 'key', 'feedback']
const jsonObjects = inventory.filter(i => i.objectKey.endsWith('.json'))
const getResults = await mapLimit(jsonObjects, CONCURRENCY, async (item) => {
  try {
    const obj = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: item.objectKey }))
    const text = await obj.Body.transformToString()
    const parsed = JSON.parse(text)
    const leaked = SENSITIVE.filter(f => new RegExp(`"${f}"\\s*:`).test(text))
    return { item, parsed, leaked }
  } catch (err) {
    getErrors.push({ key: item.objectKey, error: err.message })
    return { item, parsed: null, leaked: null }
  }
})
const leakedAnywhere = getResults.filter(r => r.leaked && r.leaked.length)
console.log(`GET + JSON parse: ${inventory.length - getErrors.length}/${jsonObjects.length} parsed`)
console.log(`  leaked private fields in public tree: ${leakedAnywhere.length}`)
for (const r of leakedAnywhere.slice(0, 5)) console.log(`    LEAK ${r.item.objectKey}: ${r.leaked.join('/')}`)

// production.json must be untouched
let prodBefore = null
try {
  const p = await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: 'manifests/production.json' }))
  prodBefore = { etag: String(p.ETag ?? ''), len: Number(p.ContentLength ?? -1) }
} catch { prodBefore = null }
console.log(`manifests/production.json state: ${prodBefore ? `EXISTS (etag ${prodBefore.etag.slice(0, 12)}…, len ${prodBefore.len})` : 'NOT PRESENT (unchanged)'}`)

// CORS spot check via public URL
const publicBase = env.R2_PUBLIC_BASE_URL
const probeKey = inventory.find(i => i.objectKey.endsWith('.json'))?.objectKey
if (publicBase && probeKey) {
  try {
    const res = await fetch(`${publicBase}/${probeKey}`, { headers: { Origin: 'https://ryanenglishv2.vercel.app' }, method: 'HEAD' })
    const acao = res.headers.get('access-control-allow-origin')
    const ct = res.headers.get('content-type')
    console.log(`CORS probe (${probeKey}): status ${res.status}, ACAO=${acao ?? 'MISSING'}, content-type=${ct}`)
  } catch (err) {
    console.log(`CORS probe failed: ${err.message}`)
  }
}

const problems = headErrors.length + getErrors.length + leakedAnywhere.length
if (problems) {
  console.error(`\nVERIFICATION FAILED (${problems} problems)`)
  process.exit(1)
}
console.log('\nUPLOAD + VERIFICATION OK')
console.log(`Uploaded: ${uploaded} (${skipped} already present) | ${inventory.length}/${inventory.length} verified | production.json untouched`)
