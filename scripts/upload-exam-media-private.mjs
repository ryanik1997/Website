/**
 * Mode A — upload public/catalog + public/data → Supabase Storage private bucket exam-media
 *
 * Requires env (from .env.deploy or shell):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/upload-exam-media-private.mjs
 *   node scripts/upload-exam-media-private.mjs --dry-run
 *   node scripts/upload-exam-media-private.mjs --only catalog/listening/ielts-cam20-test1
 *   node scripts/upload-exam-media-private.mjs --concurrency 4
 */
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')
const require = createRequire(join(ROOT, 'apps/web/package.json'))
const { createClient } = require('@supabase/supabase-js')

// Load .env.deploy if present
function loadEnvFile(name) {
  const p = join(ROOT, name)
  if (!existsSync(p)) return
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 0) continue
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (!process.env[k]) process.env[k] = v
  }
}
loadEnvFile('.env.deploy')
loadEnvFile('.env.local')
loadEnvFile('apps/web/.env.local')

const BUCKET = 'exam-media'
const MAX_BUCKET_FILE_BYTES = 50 * 1024 * 1024
const PUBLIC_ROOT = join(ROOT, 'apps/web/public')
const SOURCES = [
  join(PUBLIC_ROOT, 'catalog'),
  join(PUBLIC_ROOT, 'data'),
  join(PUBLIC_ROOT, 'books'),
]

const MIME = {
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.txt': 'text/plain',
}

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const onlyIdx = args.indexOf('--only')
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null
const concIdx = args.indexOf('--concurrency')
const concurrency = Math.max(1, Number(concIdx >= 0 ? args[concIdx + 1] : 3) || 3)
const skipOversize = args.includes('--skip-oversize')

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if ((!url || !serviceKey) && !dryRun) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (set in .env.deploy)')
  process.exit(1)
}

const supabase = url && serviceKey
  ? createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null

function walk(dir, base, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, base, out)
    else out.push(full)
  }
  return out
}

function objectPathFromFile(file) {
  // apps/web/public/catalog/... → catalog/...
  // apps/web/public/data/... → data/...
  const rel = relative(PUBLIC_ROOT, file).replace(/\\/g, '/')
  return rel
}

async function ensureBucket() {
  if (!supabase) throw new Error('Supabase service role is required for upload')
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = (buckets ?? []).some(b => b.id === BUCKET || b.name === BUCKET)
  if (!exists) {
    console.log('Creating bucket', BUCKET, '(private)')
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: MAX_BUCKET_FILE_BYTES,
    })
    if (error && !/already exists/i.test(error.message)) {
      throw error
    }
  } else {
    // force private
    await supabase.storage.updateBucket(BUCKET, { public: false })
  }
}

async function uploadOne(file) {
  const path = objectPathFromFile(file)
  if (only && !path.startsWith(only.replace(/^\//, ''))) {
    return { path, skipped: true }
  }
  const ext = extname(file).toLowerCase()
  const contentType = MIME[ext] || 'application/octet-stream'
  const body = readFileSync(file)
  if (dryRun) {
    return { path, bytes: body.length, dry: true }
  }
  if (!supabase) throw new Error('Supabase service role is required for upload')
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    upsert: true,
    contentType,
  })
  if (error) throw new Error(`${path}: ${error.message}`)
  return { path, bytes: body.length }
}

async function mapPool(items, limit, fn) {
  let i = 0
  let ok = 0
  let fail = 0
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++
      const item = items[idx]
      try {
        const r = await fn(item)
        if (!r.skipped) {
          ok++
          if (ok % 25 === 0 || dryRun) {
            console.log(`  [${ok}/${items.length}] ${r.path} (${r.bytes ?? 0})`)
          }
        }
      } catch (e) {
        fail++
        console.error('FAIL', item, e.message || e)
      }
    }
  })
  await Promise.all(workers)
  return { ok, fail }
}

async function main() {
  console.log('Mode A upload → bucket', BUCKET)
  console.log('dryRun=', dryRun, 'concurrency=', concurrency, 'only=', only || '(all)')
  if (!dryRun) await ensureBucket()

  const files = []
  for (const src of SOURCES) {
    if (!existsSync(src)) {
      console.warn('Skip missing', src)
      continue
    }
    walk(src, src, files)
  }
  // filter empty / junk
  const list = files.filter(f => {
    const n = f.toLowerCase()
    return !n.endsWith('.ds_store') && !n.endsWith('thumbs.db')
  })
  const oversize = list.filter(file => statSync(file).size > MAX_BUCKET_FILE_BYTES)
  if (oversize.length > 0) {
    console.error(`Files over ${MAX_BUCKET_FILE_BYTES} bytes:`)
    for (const file of oversize) {
      console.error(
        `  ${objectPathFromFile(file)} (${statSync(file).size} bytes)`,
      )
    }
    if (!skipOversize) {
      console.error('Re-run with --skip-oversize only if these files may remain unavailable.')
      process.exit(1)
    }
  }

  const uploadable = list.filter(file => !oversize.includes(file))
  console.log('Files to upload:', uploadable.length)

  const { ok, fail } = await mapPool(uploadable, concurrency, uploadOne)
  console.log(JSON.stringify({
    ok,
    fail,
    total: list.length,
    oversizeSkipped: oversize.length,
    dryRun,
  }, null, 2))
  if (fail) process.exit(1)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
