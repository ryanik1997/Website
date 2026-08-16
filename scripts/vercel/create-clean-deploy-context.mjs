import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const OUT = path.join(os.tmpdir(), `ryanenglish-vercel-preview-${stamp}`)
const excluded = [
  /^\.git(?:\\|\/|$)/, /^node_modules(?:\\|\/|$)/, /^dist(?:\\|\/|$)/,
  /^tmp(?:\\|\/|$)/, /^coverage(?:\\|\/|$)/, /^playwright-report(?:\\|\/|$)/,
  /^test-results(?:\\|\/|$)/, /^logs(?:\\|\/|$)/, /^evidence(?:\\|\/|$)/,
  /^\.playwright-mcp(?:\\|\/|$)/, /^\.hermes(?:\\|\/|$)/, /^\.codex(?:\\|\/|$)/,
  /^\.agents(?:\\|\/|$)/, /^apps[\\/]web[\\/]dist(?:\\|\/|$)/,
  /^\.cxpak(?:\\|\/|$)/, /^\.claude(?:\\|\/|$)/, /^\.kilo(?:\\|\/|$)/,
  /^\.serena(?:\\|\/|$)/, /^\.pnpm-store(?:\\|\/|$)/, /^\.tmp(?:\\|\/|$)/,
  /^server[\\/]\.cache(?:\\|\/|$)/, /^apps[\\/]web[\\/]\.run-session(?:\\|\/|$)/,
  /^apps[\\/]web[\\/]public[\\/](catalog|data|books|ielts-wizard)(?:\\|\/|$)/,
]
const ignoredFile = rel => rel.split(/[\\/]/).includes('node_modules') || excluded.some(re => re.test(rel)) ||
  (path.basename(rel).startsWith('.env') && !['.env.example'].includes(path.basename(rel)))
const inventory = []
function copyDir(src, dst, prefix = '') {
  fs.mkdirSync(dst, { recursive: true })
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${ent.name}` : ent.name
    if (ignoredFile(rel)) continue
    const from = path.join(src, ent.name), to = path.join(dst, ent.name)
    if (ent.isDirectory()) copyDir(from, to, rel)
    else if (ent.isFile()) { fs.copyFileSync(from, to); inventory.push({ path: rel.replace(/\\/g, '/'), bytes: fs.statSync(from).size }) }
  }
}
copyDir(ROOT, OUT)
const secretValues = fs.readFileSync(path.join(ROOT, '.env.r2.local'), 'utf8').split(/\r?\n/).flatMap(line => {
  const [key, ...rest] = line.split('=')
  return /SECRET|ACCESS_KEY|TOKEN|PASSWORD/i.test(key) ? [rest.join('=').trim()] : []
}).filter(value => value.length > 12)
const hits = []
for (const item of inventory) {
  if (item.bytes > 2 * 1024 * 1024 || !/\.(c?m?js|ts|tsx|jsx|json|ya?ml|toml|env|txt|md|css|html)$/i.test(item.path)) continue
  const body = fs.readFileSync(path.join(OUT, item.path), 'utf8')
  if (secretValues.some(value => body.includes(value))) hits.push(item.path)
}
if (hits.length) throw new Error(`Secret-like identifiers in clean context: ${hits.join(', ')}`)
const summary = { root: OUT, files: inventory.length, bytes: inventory.reduce((n, x) => n + x.bytes, 0), excludedRules: excluded.map(String), secretMatches: 0, inventory }
fs.writeFileSync(path.join(OUT, 'deploy-context-inventory.json'), JSON.stringify(summary, null, 2))
console.log(JSON.stringify({ root: OUT, files: summary.files, bytes: summary.bytes, secretMatches: 0 }))
