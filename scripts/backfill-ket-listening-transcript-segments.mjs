#!/usr/bin/env node
/**
 * Generate Whisper segment timestamps for published KET A2 Listening exams.
 *
 * Usage:
 *   pnpm ket:segments -- --list-only
 *   pnpm ket:segments -- --yes
 *   pnpm ket:segments -- --yes --force
 *   pnpm ket:segments -- --yes --only listening-import-ket-a2-practice-16
 *
 * Auth: SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_ACCESS_TOKEN in .env.deploy.
 * Runtime: Python with faster-whisper installed.
 */
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PROJECT_REF = 'ntcagvtkwxwsmlxlumfo'
const BUCKET = 'exam-media'
const DEFAULT_URL = `https://${PROJECT_REF}.supabase.co`
const WORKER_PATH = path.join(ROOT, 'server', 'python', 'whisper_stt_batch.py')
const require = createRequire(import.meta.url)
const { createClient } = require(require.resolve('@supabase/supabase-js', {
  paths: [path.join(ROOT, 'apps', 'web'), ROOT],
}))

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const value = line.trim()
    if (!value || value.startsWith('#')) continue
    const separator = value.indexOf('=')
    if (separator < 0) continue
    const key = value.slice(0, separator).trim()
    let content = value.slice(separator + 1).trim()
    if (
      (content.startsWith('"') && content.endsWith('"'))
      || (content.startsWith("'") && content.endsWith("'"))
    ) {
      content = content.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = content
  }
}

loadEnvFile(path.join(ROOT, '.env.deploy'))
loadEnvFile(path.join(ROOT, 'apps', 'web', '.env.local'))
loadEnvFile(path.join(ROOT, '.env.local'))

function resolveDefaultPython() {
  const candidates = [
    process.env.WHISPER_PYTHON,
    'C:\\Users\\lindv\\whisper\\.venv\\Scripts\\python.exe',
    'D:\\App-English-Ryan\\ProjectGitHub\\App English_P15.8.302\\dist\\win-unpacked\\resources\\whisper\\.venv\\Scripts\\python.exe',
    'D:\\App-English-Ryan\\ProjectGitHub\\App English_P15.8.302\\dist_admin_lifetime\\win-unpacked\\resources\\whisper\\.venv\\Scripts\\python.exe',
  ]
  const existing = candidates.find(candidate => candidate?.trim() && existsSync(candidate.trim()))
  return existing?.trim() || (process.platform === 'win32' ? 'python' : 'python3')
}

function parseArgs(argv) {
  const args = {
    yes: false,
    force: false,
    listOnly: false,
    only: null,
    limit: null,
    model: process.env.WHISPER_MODEL || 'base.en',
    python: resolveDefaultPython(),
  }
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--yes') args.yes = true
    else if (arg === '--force') args.force = true
    else if (arg === '--list-only' || arg === '--dry-run') args.listOnly = true
    else if (arg === '--only') args.only = argv[++index] || null
    else if (arg === '--limit') args.limit = Number(argv[++index])
    else if (arg === '--model') args.model = argv[++index] || args.model
    else if (arg === '--python') args.python = argv[++index] || args.python
    else if (arg === '--help' || arg === '-h') {
      console.log(`
Backfill KET A2 Listening transcript segments

  pnpm ket:segments -- --list-only
  pnpm ket:segments -- --yes [--force] [--limit N] [--only EXAM_ID]

Options:
  --list-only   List matching exams and segment coverage; do not run Whisper.
  --yes         Required before updating Supabase.
  --force       Regenerate Parts that already contain transcriptSegments.
  --limit N     Process only the first N matching exams.
  --only ID     Process one published exam ID.
  --model NAME  faster-whisper model (default: base.en).
  --python BIN  Python executable.
`)
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  return args
}

function validSegments(value) {
  return Array.isArray(value) && value.some(segment => (
    segment
    && Number.isFinite(Number(segment.start))
    && Number.isFinite(Number(segment.end))
    && Number(segment.end) > Number(segment.start)
    && typeof segment.text === 'string'
    && segment.text.trim()
  ))
}

function normalizeStoragePath(audioUrl) {
  if (!audioUrl || typeof audioUrl !== 'string') return null
  if (/^https?:\/\//i.test(audioUrl)) return { url: audioUrl }
  let storagePath = audioUrl.split(/[?#]/, 1)[0].replace(/^\/+/, '')
  storagePath = storagePath.replace(/^exam-media\//, '')
  return storagePath ? { storagePath } : null
}

function mediaExtension(audioUrl) {
  const clean = String(audioUrl || '').split(/[?#]/, 1)[0]
  const extension = path.extname(clean)
  return extension && extension.length <= 6 ? extension : '.audio'
}

async function getServiceRoleKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY
  const token = process.env.SUPABASE_ACCESS_TOKEN
  if (!token) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ACCESS_TOKEN in .env.deploy')
  }
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!response.ok) {
    throw new Error(`Management API keys failed: ${response.status} ${await response.text()}`)
  }
  const keys = await response.json()
  const serviceRole = keys.find(key => key.name === 'service_role' || key.type === 'service_role')
  if (!serviceRole?.api_key) throw new Error('service_role key not found')
  return serviceRole.api_key
}

async function downloadAudio(supabase, audioUrl, targetPath) {
  const source = normalizeStoragePath(audioUrl)
  if (!source) throw new Error('Part has no audioUrl')
  let buffer
  if (source.storagePath) {
    const { data, error } = await supabase.storage.from(BUCKET).download(source.storagePath)
    if (error) throw new Error(`Storage download ${source.storagePath}: ${error.message}`)
    buffer = Buffer.from(await data.arrayBuffer())
  } else {
    const response = await fetch(source.url)
    if (!response.ok) throw new Error(`Audio download HTTP ${response.status}: ${source.url}`)
    buffer = Buffer.from(await response.arrayBuffer())
  }
  if (buffer.length < 8000) throw new Error(`Audio too small: ${buffer.length} bytes`)
  writeFileSync(targetPath, buffer)
}

function startWhisperWorker(options) {
  const child = spawn(options.python, [
    WORKER_PATH,
    '--model', options.model,
    '--language', 'en',
    '--device', 'cpu',
    '--compute', 'int8',
    '--beam', '1',
  ], {
    cwd: ROOT,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  })
  const pending = new Map()
  let readyResolve
  let readyReject
  const ready = new Promise((resolve, reject) => {
    readyResolve = resolve
    readyReject = reject
  })
  const stderr = []

  createInterface({ input: child.stdout }).on('line', line => {
    let payload
    try {
      payload = JSON.parse(line)
    } catch {
      return
    }
    if (Object.hasOwn(payload, 'ready')) {
      if (payload.ready) readyResolve(payload)
      else readyReject(new Error(payload.error || 'Whisper worker failed to start'))
      return
    }
    const request = pending.get(payload.id)
    if (!request) return
    pending.delete(payload.id)
    if (payload.ok) request.resolve(payload)
    else request.reject(new Error(payload.error || 'Whisper transcription failed'))
  })
  createInterface({ input: child.stderr }).on('line', line => {
    stderr.push(line)
    if (stderr.length > 20) stderr.shift()
  })
  child.on('error', readyReject)
  child.on('exit', code => {
    const error = new Error(`Whisper worker exited (${code}): ${stderr.join('\n')}`)
    readyReject(error)
    for (const request of pending.values()) request.reject(error)
    pending.clear()
  })

  let requestId = 0
  return {
    ready,
    transcribe: audio => new Promise((resolve, reject) => {
      const id = String(++requestId)
      pending.set(id, { resolve, reject })
      child.stdin.write(`${JSON.stringify({ id, audio })}\n`)
    }),
    close: () => child.stdin.end(),
  }
}

async function listKetExams(supabase, options) {
  let query = supabase
    .from('listening_exam_published')
    .select('id, title, exam_type, parts, updated_at')
    .eq('exam_type', 'ket')
    .order('id')
  if (options.only) query = query.eq('id', options.only)
  if (options.limit) query = query.limit(options.limit)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data || []
}

async function main() {
  const options = parseArgs(process.argv)
  const serviceRole = await getServiceRoleKey()
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_URL,
    serviceRole,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
  const exams = await listKetExams(supabase, options)
  const coverage = exams.map(exam => {
    const parts = Array.isArray(exam.parts) ? exam.parts : []
    return {
      id: exam.id,
      title: exam.title,
      parts: parts.length,
      ready: parts.filter(part => validSegments(part.transcriptSegments)).length,
    }
  })

  console.log(`KET exams matched: ${coverage.length}`)
  for (const item of coverage) {
    console.log(`- ${item.id}: ${item.ready}/${item.parts} Parts timed`)
  }
  if (options.listOnly) return
  if (!options.yes) {
    throw new Error('Refusing cloud updates without --yes. Run --list-only first.')
  }
  if (!existsSync(WORKER_PATH)) throw new Error(`Missing worker: ${WORKER_PATH}`)

  const tempRoot = path.join(os.tmpdir(), `ryan-ket-segments-${process.pid}`)
  mkdirSync(tempRoot, { recursive: true })
  const worker = startWhisperWorker(options)
  await worker.ready
  const resultCache = new Map()
  let updatedExams = 0
  let updatedParts = 0
  let failedParts = 0

  try {
    for (const exam of exams) {
      const parts = Array.isArray(exam.parts) ? exam.parts : []
      let changed = false
      const nextParts = []
      console.log(`\n[${exam.id}] ${exam.title}`)

      for (const part of parts) {
        if (!options.force && validSegments(part.transcriptSegments)) {
          console.log(`  Part ${part.partNumber}: skip (already timed)`)
          nextParts.push(part)
          continue
        }
        if (!part.audioUrl) {
          console.log(`  Part ${part.partNumber}: FAIL missing audioUrl`)
          failedParts += 1
          nextParts.push(part)
          continue
        }

        try {
          let transcript = resultCache.get(part.audioUrl)
          if (!transcript) {
            const targetPath = path.join(
              tempRoot,
              `${exam.id}-part-${part.partNumber}${mediaExtension(part.audioUrl)}`,
            )
            console.log(`  Part ${part.partNumber}: download`)
            await downloadAudio(supabase, part.audioUrl, targetPath)
            console.log(`  Part ${part.partNumber}: Whisper ${options.model}`)
            transcript = await worker.transcribe(targetPath)
            resultCache.set(part.audioUrl, transcript)
            rmSync(targetPath, { force: true })
          } else {
            console.log(`  Part ${part.partNumber}: reuse shared-audio transcript`)
          }
          if (!validSegments(transcript.segments)) {
            throw new Error('Whisper returned zero valid segments')
          }
          nextParts.push({
            ...part,
            transcript: transcript.text || part.transcript,
            transcriptSegments: transcript.segments,
          })
          changed = true
          updatedParts += 1
          console.log(`  Part ${part.partNumber}: OK ${transcript.segments.length} segments`)
        } catch (error) {
          failedParts += 1
          nextParts.push(part)
          console.log(`  Part ${part.partNumber}: FAIL ${error instanceof Error ? error.message : error}`)
        }
      }

      if (!changed) continue
      const { error } = await supabase
        .from('listening_exam_published')
        .update({ parts: nextParts, updated_at: new Date().toISOString() })
        .eq('id', exam.id)
      if (error) throw new Error(`Update ${exam.id}: ${error.message}`)
      updatedExams += 1
      console.log(`  Published timing: ${exam.id}`)
    }
  } finally {
    worker.close()
    rmSync(tempRoot, { recursive: true, force: true })
  }

  console.log(`\nDone: ${updatedExams}/${exams.length} exams updated, ${updatedParts} Parts timed, ${failedParts} Parts failed.`)
  if (failedParts > 0) process.exitCode = 1
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
