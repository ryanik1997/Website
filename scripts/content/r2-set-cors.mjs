/**
 * Configure R2 bucket CORS for the exam-content public release.
 *
 * Applies exactly the production minimum from the migration spec:
 *   Origins : https://ryanenglishv2.vercel.app   (no wildcard; preview added only on request)
 *   Methods : GET, HEAD
 *   Headers : Range, Content-Type
 *   Expose  : Content-Length, Content-Range, ETag, Accept-Ranges
 *   Credentials: none (no wildcard credentials policy)
 *
 * Audio range playback + browser fetch of JSON bodies require these headers.
 * Run:
 *   node scripts/content/r2-set-cors.mjs            # apply
 *   node scripts/content/r2-set-cors.mjs --dry-run  # show what would be applied
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3'

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

const DRY_RUN = process.argv.includes('--dry-run')

// Extra origins via repeated --add-origin <url> (e.g. a Vercel preview URL).
const EXTRA_ORIGINS = []
{
  const idxs = []
  process.argv.forEach((arg, i) => { if (arg === '--add-origin') idxs.push(i) })
  for (const i of idxs) if (process.argv[i + 1]) EXTRA_ORIGINS.push(process.argv[i + 1])
}

const CORS = {
  CORSRules: [
    {
      AllowedOrigins: ['https://ryanenglishv2.vercel.app', ...EXTRA_ORIGINS],
      AllowedMethods: ['GET', 'HEAD'],
      AllowedHeaders: ['Range', 'Content-Type'],
      ExposeHeaders: ['Content-Length', 'Content-Range', 'ETag', 'Accept-Ranges'],
      MaxAgeSeconds: 3600,
    },
  ],
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET },
})

console.log(`Bucket: ${BUCKET} | mode: ${DRY_RUN ? 'DRY-RUN' : 'APPLY'}`)
console.log('CORS to apply:')
console.log(JSON.stringify(CORS, null, 2))

if (DRY_RUN) {
  console.log('\n(dry-run — nothing applied)')
  process.exit(0)
}

try {
  await client.send(new PutBucketCorsCommand({ Bucket: BUCKET, CORSConfiguration: CORS }))
  console.log('\nPutBucketCors OK')
} catch (err) {
  console.error('PutBucketCors FAILED:', err.message)
  process.exit(1)
}

// verify
try {
  const cors = await client.send(new GetBucketCorsCommand({ Bucket: BUCKET }))
  console.log('\nVerification — current CORS rules:')
  console.log(JSON.stringify(cors.CORSRules, null, 2))
  console.log('\nCORS SET OK')
} catch (err) {
  console.error('Re-read CORS FAILED:', err.message)
  process.exit(1)
}
