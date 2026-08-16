/**
 * Verify the R2 Reading data path exactly as the frontend loader executes it,
 * WITHOUT a browser: manifest → reading catalog → body, from the preview origin.
 *
 * This proves the bytes the preview app would consume are correct + CORS-enabled.
 * (Full browser UI E2E is separately blocked by Vercel Deployment Protection.)
 *
 * Run:
 *   node scripts/content/verify-r2-loader-path.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

const env = {}
for (const line of fs.readFileSync(path.join(ROOT, '.env.r2.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}
const BASE = env.R2_PUBLIC_BASE_URL.replace(/\/+$/, '')
const ORIGIN = 'https://ryanenglishv2-fkhhmt16d-ryanenglish.vercel.app' // preview
const SENSITIVE = ['answer', 'correctOption', 'acceptedAnswers', 'acceptableAnswers', 'explanation', 'correct', 'correctAnswer', 'solution', 'answerKey', 'feedback']

const mask = (u) => u.replace(/https:\/\/[^/]+/, 'https://…').replace(/([?&](?:token|key|sig|auth)=)[^&]*/g, '$1…')
const failures = []

async function getJson(url, label) {
  const res = await fetch(url, { headers: { Origin: ORIGIN, Accept: 'application/json' } })
  const acao = res.headers.get('access-control-allow-origin')
  const body = await res.text()
  let parsed = null
  try { parsed = JSON.parse(body) } catch { failures.push(`${label}: JSON parse FAILED (${url})`) }
  return { res, acao, parsed, url }
}

console.log('=== R2 Reading data path (preview origin) ===')
console.log(`base:   ${mask(BASE)}`)
console.log(`origin: ${ORIGIN}`)

// 1. staging manifest (VITE_EXAM_CONTENT_MANIFEST resolved against base)
const manifest = await getJson(`${BASE}/manifests/staging.json`, 'staging-manifest')
console.log(`\n1) staging.json   ${manifest.res.status}  acao=${manifest.acao ?? 'MISSING'}  parses=${!!manifest.parsed}`)
if (!manifest.parsed) process.exit(1)
const { schemaVersion, releaseId, baseUrl, modules } = manifest.parsed
console.log(`   schemaVersion=${schemaVersion} releaseId=${releaseId} baseOk=${baseUrl === BASE} reading.catalog=${modules?.reading?.catalogPath ?? 'MISSING'}`)
if (schemaVersion !== 1 || !modules?.reading?.catalogPath) { failures.push('staging manifest invalid'); process.exit(1) }

// 2. reading catalog
const catalog = await getJson(`${BASE}/${modules.reading.catalogPath}`, 'reading-catalog')
console.log(`2) catalog        ${catalog.res.status}  acao=${catalog.acao ?? 'MISSING'}  parses=${!!catalog.parsed}`)
if (!catalog.parsed) process.exit(1)
console.log(`   count=${catalog.parsed.count}  module=${catalog.parsed.module}`)
const tests = catalog.parsed.tests ?? []
if (tests.length !== 166) failures.push(`catalog count ${tests.length} != 166`)

// 3. representative bodies: IELTS + every Cambridge level
const wantLevels = { ielts: 'catalog-cam-11-2-reading', a2: null, b1: null, b2: null, c1: null, c2: null }
for (const t of tests) { if (wantLevels[t.level] == null) wantLevels[t.level] = t.id }
const sampleIds = Object.values(wantLevels).filter(Boolean)
const first = [...new Set(sampleIds)]
console.log(`\n3) body fetch (${first.length} representative tests)`)
for (const id of first) {
  const t = tests.find(x => x.id === id)
  const body = await getJson(`${BASE}/${t.objectKey}`, `body:${id}`)
  const qc = body.parsed ? JSON.stringify(body.parsed).match(/"(number|id)"/g)?.length ?? 0 : 0
  const leaked = body.parsed ? SENSITIVE.filter(f => new RegExp(`"${f}"\\s*:`).test(JSON.stringify(body.parsed))) : ['PARSE_FAIL']
  console.log(`   ${id} (${t.level}) ${body.res.status} acao=${body.acao ?? 'MISSING'} leaked=${leaked.join('/') || 'none'}`)
  if (leaked.length) failures.push(`leaked fields in ${id}: ${leaked.join(',')}`)
}

// 4. never fetch an answer vault
const vaultProbe = tests[0].objectKey.replace(/\.json$/, '.answers.json')
const vault = await fetch(`${BASE}/${vaultProbe}`, { headers: { Origin: ORIGIN } })
console.log(`\n4) vault probe (${mask(vaultProbe)}) — should NOT be fetched by loader; status ${vault.status}`)

if (failures.length) {
  console.error(`\nR2 LOADER PATH VERIFY FAILED:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
console.log('\nR2 LOADER PATH VERIFY PASS')
