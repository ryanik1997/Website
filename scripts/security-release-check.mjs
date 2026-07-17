import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const failures = []
const passes = []

function read(path) {
  return readFileSync(join(root, path), 'utf8')
}

function check(label, condition, detail) {
  if (condition) passes.push(label)
  else failures.push(`${label}: ${detail}`)
}

const vite = read('apps/web/vite.config.ts')
const vercel = read('vercel.json')
const vercelIgnore = read('.vercelignore')
const gitignore = read('.gitignore')
const strip = read('scripts/strip-public-media-from-dist.mjs')

check(
  'Production source maps disabled',
  /sourcemap:\s*false/.test(vite),
  'vite.config.ts must keep build.sourcemap=false',
)
check(
  'Protected app is not indexed',
  vercel.includes('"source": "/app/(.*)"') &&
    vercel.includes('"X-Robots-Tag", "value": "noindex, nofollow"'),
  'vercel.json must send X-Robots-Tag noindex on /app',
)
check(
  'Anti-framing headers enabled',
  vercel.includes('"X-Frame-Options", "value": "DENY"') &&
    vercel.includes("frame-ancestors 'none'"),
  'DENY and CSP frame-ancestors none are both required',
)
check(
  'CSP blocks eval and inline scripts',
  !vercel.includes("'unsafe-eval'") &&
    !/script-src[^;]*'unsafe-inline'/.test(vercel),
  "script-src must not allow 'unsafe-eval' or 'unsafe-inline'",
)
check(
  'Private media omitted from deploy input',
  ['catalog', 'data', 'books', 'ielts-wizard'].every((name) =>
    vercelIgnore.includes(`apps/web/public/${name}`),
  ),
  '.vercelignore must exclude every proprietary public media root',
)
check(
  'Private media stripped from build output',
  ['catalog', 'data', 'books', 'ielts-wizard'].every((name) =>
    strip.includes(`'${name}'`),
  ),
  'strip-public-media-from-dist.mjs must remove every proprietary root',
)
check(
  'Deploy secrets ignored',
  gitignore.includes('.env.deploy'),
  '.env.deploy must remain ignored',
)
check(
  'Critical security migrations present',
  ['020_harden_published_exams.sql', '021_content_access_daily_quota.sql', '022_legal_consent.sql']
    .every((name) => existsSync(join(root, 'supabase', 'migrations', name))),
  'migrations 020-022 are required',
)

const sourceFiles = [
  'apps/web/src',
  'apps/web/.env.example',
  'package.json',
]

function collectText(path) {
  const absolute = join(root, path)
  if (!existsSync(absolute)) return ''
  if (!statSync(absolute).isDirectory()) return readFileSync(absolute, 'utf8')
  return walk(absolute)
    .filter((file) => /\.(ts|tsx|js|mjs|json|env|example)$/.test(file))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n')
}

function walk(path) {
  const files = []
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const target = join(path, entry.name)
    if (entry.isDirectory()) files.push(...walk(target))
    else files.push(target)
  }
  return files
}

const publicSource = sourceFiles.map(collectText).join('\n')

check(
  'No service-role secret in client variables',
  !/VITE_[A-Z0-9_]*SERVICE_ROLE/i.test(publicSource),
  'never expose SUPABASE_SERVICE_ROLE_KEY through a VITE_* variable',
)

for (const pass of passes) console.log(`PASS  ${pass}`)
for (const failure of failures) console.error(`FAIL  ${failure}`)
console.log(`\nSecurity release check: ${passes.length} passed, ${failures.length} failed`)

if (failures.length > 0) process.exitCode = 1
