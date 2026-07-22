/**
 * Publish KET A2 practice Listening (Import_KET_A2_Listening) → Supabase:
 *   - Private Storage bucket `exam-media` (signed by content-sign)
 *   - Table `listening_exam_published`
 *
 * So mọi user thấy đề trong Luyện thi (không cần import ZIP tay).
 *
 * Usage:
 *   node scripts/publish-ket-practice-listening.mjs           # 2-44 (skip pilot 01)
 *   node scripts/publish-ket-practice-listening.mjs 2-10
 *   node scripts/publish-ket-practice-listening.mjs all       # 1-44
 *   node scripts/publish-ket-practice-listening.mjs 5
 *
 * Auth: SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_ACCESS_TOKEN in .env.deploy
 *        (fetches service_role via Management API).
 */
import { createRequire } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const require = createRequire(import.meta.url)
const supabaseJsPath = require.resolve('@supabase/supabase-js', {
  paths: [path.join(ROOT, 'apps', 'web'), ROOT],
})
const { createClient } = require(supabaseJsPath)
const DEFAULT_IMPORT_ROOT = 'D:\\App-English-Ryan\\Crawl\\Import_KET_A2_Listening'
const IMPORT_ROOT = process.env.KET_IMPORT_ROOT || DEFAULT_IMPORT_ROOT
const PROJECT_REF = 'afryrzlcmieedcndyeug'
const BUCKET = 'exam-media'
const STORAGE_PREFIX = 'catalog/listening-publish'
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  `https://${PROJECT_REF}.supabase.co`

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return
  const text = readFileSync(filePath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 0) continue
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvFile(path.join(ROOT, '.env.deploy'))
loadEnvFile(path.join(ROOT, 'apps', 'web', '.env.local'))
loadEnvFile(path.join(ROOT, '.env.local'))

function pad2(n) {
  return String(n).padStart(2, '0')
}

function parseArgs(argv) {
  const arg = argv[2] || '2-44'
  if (arg === 'all') return Array.from({ length: 44 }, (_, i) => i + 1)
  if (/^\d+-\d+$/.test(arg)) {
    const [a, b] = arg.split('-').map(Number)
    const out = []
    for (let i = a; i <= b; i++) out.push(i)
    return out
  }
  return [Number(arg)]
}

function stableExamId(testNum) {
  return `listening-import-ket-a2-practice-${pad2(testNum)}`
}

function contentType(name) {
  const lower = name.toLowerCase()
  if (lower.endsWith('.mp3')) return 'audio/mpeg'
  if (lower.endsWith('.wav')) return 'audio/wav'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  return 'application/octet-stream'
}

function resolveMedia(dir, base, exts) {
  for (const ext of exts) {
    const name = base + ext
    if (existsSync(path.join(dir, name))) return name
  }
  return null
}

async function getServiceRoleKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY
  }
  const token = process.env.SUPABASE_ACCESS_TOKEN
  if (!token) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ACCESS_TOKEN (.env.deploy)',
    )
  }
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) {
    throw new Error(`Management API keys failed: ${res.status} ${await res.text()}`)
  }
  const keys = await res.json()
  const sr = keys.find(k => k.name === 'service_role' || k.type === 'service_role')
  if (!sr?.api_key) throw new Error('service_role key not found in project api-keys')
  return sr.api_key
}

async function uploadFile(supabase, examId, storageName, localPath) {
  const buf = readFileSync(localPath)
  const storagePath = `${STORAGE_PREFIX}/${examId}/${storageName}`
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buf, {
    upsert: true,
    contentType: contentType(storageName),
  })
  if (error) throw new Error(`upload ${storagePath}: ${error.message}`)
  return `/${storagePath}`
}

function buildExamFromFolder(testNum, examJson, mediaUrls) {
  const examId = stableExamId(testNum)
  const parts = (examJson.parts || []).map(part => {
    const partNum = part.partNumber
    const audioUrl = mediaUrls[`part${partNum}`] || undefined
    const questions = (part.questions || []).map(q => {
      const pictureImageUrl =
        q.type === 'picture-mc' ? mediaUrls[`q${q.number}`] || undefined : undefined
      return {
        id: `${examId}-q-${q.number}`,
        number: q.number,
        type: q.type,
        prompt: q.prompt,
        options: (q.options || []).map(o => ({
          id: o.id,
          label: o.label,
        })),
        answer: q.answer,
        ...(Array.isArray(q.acceptableAnswers) && q.acceptableAnswers.length
          ? { acceptableAnswers: q.acceptableAnswers }
          : {}),
        explanation: q.explanation || '',
        ttsText: q.ttsText,
        wordLimit: q.wordLimit,
        pictureImageUrl,
      }
    })
    return {
      id: `${examId}-part-${partNum}`,
      partNumber: partNum,
      rangeLabel: part.rangeLabel,
      instruction: part.instruction,
      audioUrl,
      ttsText: part.ttsText,
      questions,
    }
  })

  return {
    id: examId,
    title: examJson.title,
    durationMinutes: examJson.durationMinutes ?? 25,
    bandHint: examJson.bandHint ?? 'A2 Key Listening · 5 parts · 25 câu',
    examType: examJson.examType || 'ket',
    examMode: examJson.examMode || 'practice',
    parts,
  }
}

async function publishOne(supabase, testNum) {
  const nn = pad2(testNum)
  const dir = path.join(IMPORT_ROOT, `test-${nn}`)
  const examPath = path.join(dir, 'exam.json')
  const report = { test: nn, ok: false, id: stableExamId(testNum), title: '', errors: [] }

  if (!existsSync(dir)) {
    report.errors.push(`Missing folder ${dir}`)
    return report
  }
  if (!existsSync(examPath)) {
    report.errors.push(`Missing exam.json — run ket-practice-csv-to-exam.mjs first`)
    return report
  }

  const examJson = JSON.parse(readFileSync(examPath, 'utf8'))
  report.title = examJson.title

  const mediaUrls = {}
  for (let p = 1; p <= 5; p++) {
    const name = resolveMedia(dir, `part${p}`, ['.mp3', '.wav'])
    if (!name) {
      report.errors.push(`Missing part${p}.mp3`)
      continue
    }
    mediaUrls[`part${p}`] = await uploadFile(
      supabase,
      report.id,
      `part${p}-audio${path.extname(name).toLowerCase()}`,
      path.join(dir, name),
    )
  }
  for (let q = 1; q <= 5; q++) {
    const name = resolveMedia(dir, `q${q}`, ['.jpg', '.jpeg', '.png', '.webp'])
    if (!name) {
      report.errors.push(`Missing q${q}.jpg`)
      continue
    }
    mediaUrls[`q${q}`] = await uploadFile(
      supabase,
      report.id,
      `part1-q${q}-pic${path.extname(name).toLowerCase()}`,
      path.join(dir, name),
    )
  }

  if (report.errors.length) return report

  const exam = buildExamFromFolder(testNum, examJson, mediaUrls)
  const payload = {
    id: exam.id,
    title: exam.title,
    duration_minutes: exam.durationMinutes,
    band_hint: exam.bandHint,
    exam_type: exam.examType,
    exam_mode: exam.examMode,
    parts: exam.parts,
    source: 'import',
    source_filename: `ket-practice-test-${nn}.zip`,
    published_by: null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('listening_exam_published').upsert(payload, {
    onConflict: 'id',
  })
  if (error) {
    report.errors.push(`DB upsert: ${error.message}`)
    return report
  }

  report.ok = true
  report.questionCount = exam.parts.reduce((s, p) => s + p.questions.length, 0)
  return report
}

async function main() {
  const tests = parseArgs(process.argv)
  console.log(`Import root: ${IMPORT_ROOT}`)
  console.log(`Supabase: ${SUPABASE_URL}`)
  console.log(`Tests: ${tests.map(pad2).join(', ')}`)

  if (!existsSync(IMPORT_ROOT)) {
    throw new Error(`Import root not found: ${IMPORT_ROOT}`)
  }

  const serviceKey = await getServiceRoleKey()
  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const results = []
  for (const t of tests) {
    process.stdout.write(`… test-${pad2(t)} `)
    try {
      const r = await publishOne(supabase, t)
      results.push(r)
      if (r.ok) {
        console.log(`✓ ${r.title} (${r.questionCount}q) → ${r.id}`)
      } else {
        console.log(`✗`)
        r.errors.forEach(e => console.log(`  - ${e}`))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`✗ ${msg}`)
      results.push({ test: pad2(t), ok: false, errors: [msg] })
    }
  }

  const ok = results.filter(r => r.ok).length
  console.log(`\nDone: ${ok}/${results.length} published`)
  if (ok < results.length) process.exitCode = 1
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
