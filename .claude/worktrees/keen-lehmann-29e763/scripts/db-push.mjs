#!/usr/bin/env node
/**
 * Push supabase/migrations/*.sql lên project remote (một lần cho toàn bộ user).
 *
 * Cần một trong hai cách auth:
 *   A) SUPABASE_ACCESS_TOKEN + SUPABASE_DB_PASSWORD
 *   B) SUPABASE_DB_URL (connection string đầy đủ, percent-encoded nếu có ký tự đặc biệt)
 *
 * Lấy token: https://supabase.com/dashboard/account/tokens
 * DB password: Project Settings → Database → Database password
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJECT_REF = 'ntcagvtkwxwsmlxlumfo'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Load .env.deploy if present (not committed). */
function loadDeployEnv() {
  const path = join(ROOT, '.env.deploy')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!process.env[key] && value) process.env[key] = value
  }
}

loadDeployEnv()
const SUPABASE_BIN = join(
  ROOT,
  'node_modules',
  'supabase',
  process.platform === 'win32' ? 'bin/supabase.exe' : 'bin/supabase',
)

const dryRun = process.argv.includes('--dry-run')

function run(cmd, args, env = process.env, { softFail = false } = {}) {
  const bin = existsSync(SUPABASE_BIN) ? SUPABASE_BIN : 'npx'
  const finalArgs = existsSync(SUPABASE_BIN) ? [cmd, ...args] : ['supabase', cmd, ...args]
  const result = spawnSync(bin, finalArgs, {
    cwd: ROOT,
    stdio: 'inherit',
    env,
    shell: process.platform === 'win32',
  })
  if (result.status !== 0 && !softFail) process.exit(result.status ?? 1)
  return result.status ?? 0
}

const LINKED_REF = join(ROOT, 'supabase', '.temp', 'project-ref')

function ensureAuth() {
  const token = process.env.SUPABASE_ACCESS_TOKEN
  const dbUrl = process.env.SUPABASE_DB_URL
  const dbPassword = process.env.SUPABASE_DB_PASSWORD

  if (dbUrl) return { mode: 'url', token, dbUrl }
  if (token && dbPassword) return { mode: 'link', token, dbPassword }
  if (token) {
    console.error(
      'Thiếu SUPABASE_DB_PASSWORD hoặc SUPABASE_DB_URL.\n' +
        '  • Cách A: SUPABASE_ACCESS_TOKEN + SUPABASE_DB_PASSWORD\n' +
        '  • Cách B: SUPABASE_DB_URL (connection string từ Dashboard → Database)\n' +
        'Copy .env.deploy.example → .env.deploy và điền giá trị.',
    )
    process.exit(1)
  }

  console.error(
    'Thiếu biến môi trường deploy.\n' +
      '  • SUPABASE_ACCESS_TOKEN — https://supabase.com/dashboard/account/tokens\n' +
      '  • SUPABASE_DB_PASSWORD hoặc SUPABASE_DB_URL\n' +
      'Chạy: copy .env.deploy.example .env.deploy rồi điền, hoặc export biến trước khi pnpm db:push',
  )
  process.exit(1)
}

const auth = ensureAuth()
const env = { ...process.env, SUPABASE_ACCESS_TOKEN: auth.token }
const pushFlags = ['--yes', ...(dryRun ? ['--dry-run'] : [])]

console.log(`→ Supabase db push (${dryRun ? 'dry-run' : 'apply'}) — project ${PROJECT_REF}`)

if (auth.mode === 'url') {
  run('db', ['push', '--db-url', auth.dbUrl, ...pushFlags], env)
} else {
  // link đôi khi exit 1 do PostHog timeout dù đã link OK — kiểm tra file project-ref
  run('link', ['--project-ref', PROJECT_REF, '-p', auth.dbPassword, '--yes'], env, { softFail: true })
  if (!existsSync(LINKED_REF)) {
    console.error('✗ Không link được project — kiểm tra SUPABASE_ACCESS_TOKEN và SUPABASE_DB_PASSWORD.')
    process.exit(1)
  }
  run('db', ['push', '--linked', ...pushFlags], env)
}

if (dryRun) {
  console.log('✓ Dry-run xong — không có thay đổi trên database.')
} else {
  console.log('✓ Migrations đã push — mọi user dùng schema mới.')
}