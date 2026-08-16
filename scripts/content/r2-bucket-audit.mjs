/**
 * R2 bucket audit (read-only by default).
 *
 * Loads credentials from .env.r2.local and verifies, via the S3-compatible API:
 *   - account identity (ListBuckets)
 *   - bucket existence + access (HeadBucket)
 *   - read permission (ListObjectsV2 on a small prefix)
 *   - current CORS (GetBucketCors)
 *   - object read (GetObject on a small object, if any exist)
 *
 * NEVER prints secret values. Masked identity only.
 * Writes nothing. To probe PUT permission use --probe-put (creates + deletes a
 * tiny marker object); requires explicit intent.
 *
 * Run:
 *   node scripts/content/r2-bucket-audit.mjs
 *   node scripts/content/r2-bucket-audit.mjs --probe-put
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { S3Client, ListBucketsCommand, HeadBucketCommand, GetBucketCorsCommand, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

const env = {}
for (const line of fs.readFileSync(path.join(ROOT, '.env.r2.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}

const ACCOUNT_ID = env.R2_ACCOUNT_ID
const ACCESS_KEY = env.R2_ACCESS_KEY_ID
const SECRET = env.R2_SECRET_ACCESS_KEY
const BUCKET = env.R2_BUCKET_NAME
const ENDPOINT = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`

if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET || !BUCKET) {
  console.error('Missing R2 credentials in .env.r2.local')
  process.exit(1)
}

const PROBE = process.argv.includes('--probe-put')
const mask = (s) => (s && s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-4)}` : '(set)')

const client = new S3Client({
  region: 'auto',
  endpoint: ENDPOINT,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET },
})

const failures = []
const ok = (label) => console.log(`  PASS  ${label}`)
const bad = (label, err) => {
  console.log(`  FAIL  ${label}: ${err?.message ?? err}`)
  failures.push(label)
}

console.log('=== R2 bucket audit ===')
console.log(`Account ID:   ${mask(ACCOUNT_ID)}`)
console.log(`Access key:   ${mask(ACCESS_KEY)}`)
console.log(`Endpoint:     ${ENDPOINT}`)
console.log(`Bucket:       ${BUCKET}`)

// 1. Account identity + bucket existence
try {
  const buckets = await client.send(new ListBucketsCommand({}))
  const names = (buckets.Buckets ?? []).map(b => b.Name)
  console.log(`\nBuckets visible: ${names.length}`)
  if (names.includes(BUCKET)) ok(`bucket "${BUCKET}" exists`)
  else {
    bad(`bucket "${BUCKET}" NOT in list`)
    console.log('  available:', names.slice(0, 20).join(', ') || '(none)')
  }
} catch (err) {
  bad('ListBuckets (account identity)', err)
}

// 2. Head bucket
try {
  await client.send(new HeadBucketCommand({ Bucket: BUCKET }))
  ok('HeadBucket (bucket accessible)')
} catch (err) {
  bad('HeadBucket', err)
}

// 3. Current CORS
try {
  const cors = await client.send(new GetBucketCorsCommand({ Bucket: BUCKET }))
  const rules = cors.CORSRules ?? []
  console.log(`\nCORS rules: ${rules.length}`)
  for (const r of rules) {
    console.log(`  - ${(r.AllowedOrigins ?? []).join(' ')} | methods ${(r.AllowedMethods ?? []).join('/')} | headers ${(r.AllowedHeaders ?? []).join(' ')} | expose ${(r.ExposeHeaders ?? []).join(' ')}`)
  }
} catch (err) {
  if (err.name === 'NoSuchCORSConfiguration' || /CORS/i.test(err.message)) {
    ok('No CORS configuration set (bucket is default-deny for browser cross-origin)')
  } else {
    bad('GetBucketCors', err)
  }
}

// 4. List a small prefix (read permission)
let listed = []
try {
  const list = await client.send(new ListObjectsV2Command({ Bucket: BUCKET, MaxKeys: 50 }))
  listed = (list.Contents ?? []).map(o => o.Key)
  ok(`ListObjectsV2 (read) — ${listed.length} keys in first page`)
  console.log('  sample:', listed.slice(0, 8).join(', ') || '(empty bucket)')
} catch (err) {
  bad('ListObjectsV2 (read permission)', err)
}

// 5. Object read (first object)
if (listed.length) {
  const target = listed[0]
  try {
    const obj = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: target, Range: 'bytes=0-31' }))
    ok(`GetObject (${target}) — status ok`)
  } catch (err) {
    bad(`GetObject (${target})`, err)
  }
}

// 6. Optional PUT probe (explicitly requested)
if (PROBE) {
  const key = `_r2-permission-probe-${Date.now()}.txt`
  try {
    await client.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: 'probe\n' }))
    ok(`PutObject probe (${key})`)
    await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
    ok('DeleteObject probe (cleaned up)')
  } catch (err) {
    bad('PutObject probe (write permission)', err)
  }
} else {
  console.log('\n  (write probe skipped — rerun with --probe-put to test PUT)')
}

if (failures.length) {
  console.error(`\nBUCKET AUDIT FAILED (${failures.length}): ${failures.join(', ')}`)
  process.exit(1)
}
console.log('\nBUCKET AUDIT PASS')
