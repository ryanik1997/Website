/**
 * Restore KET A2 Listening Books 1–3 from Tainguyen ZIP bundles.
 * Uploads media to private exam-media and upserts published exam rows.
 */
import { createRequire } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const require = createRequire(import.meta.url)
const { unzipSync } = require(require.resolve('fflate', { paths: [path.join(ROOT, 'apps', 'web')] }))
const { createClient } = require(require.resolve('@supabase/supabase-js', { paths: [path.join(ROOT, 'apps', 'web')] }))

const PROJECT_REF = 'ntcagvtkwxwsmlxlumfo'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`
const BUCKET = 'exam-media'
const STORAGE_PREFIX = 'catalog/listening-publish'
const SOURCE_ROOT = process.env.KET_TAINGUYEN_ROOT
  || 'D:\\App-English-Ryan\\Tainguyen\\Import Cambridge\\KET_A2\\Listening'

const BUNDLES = [
  { book: 1, test: 1, id: 'listening-import-ket-a2-book1-test1', zip: 'Cam 1/ket-listening-test1.zip' },
  { book: 1, test: 2, id: 'listening-import-1784117248907', zip: 'Cam 1/ket-listening-test2.zip' },
  { book: 1, test: 3, id: 'listening-import-1784119115451', zip: 'Cam 1/ket-listening-test3/ket-listening-test3.zip' },
  { book: 1, test: 4, id: 'listening-import-1784119340172', zip: 'Cam 1/ket-listening-test4/ket-listening-test4.zip' },
  { book: 2, test: 1, id: 'listening-import-1784120116128', zip: 'Cam 2/Test 1/ket-cam2-test1-listening.zip' },
  { book: 2, test: 2, id: 'listening-import-1784121431515', zip: 'Cam 2/Test 2/cam2-ket-listening-test2.zip' },
  { book: 2, test: 3, id: 'listening-import-1784121543057', zip: 'Cam 2/Test 3/cam2-ket-listening-test3.zip' },
  { book: 2, test: 4, id: 'listening-import-1784121681680', zip: 'Cam 2/Test 4/cam2-ket-listening-test4.zip' },
  { book: 3, test: 1, id: 'listening-import-ket-a2-book3-test1', zip: 'Cam 3/Test 1/cam3-listening-test1.zip' },
  { book: 3, test: 2, id: 'listening-import-1784121868992', zip: 'Cam 3/Test 2/cam3-listening-test2.zip' },
]

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const text = line.trim()
    if (!text || text.startsWith('#')) continue
    const split = text.indexOf('=')
    if (split < 0) continue
    const key = text.slice(0, split).trim()
    let value = text.slice(split + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile(path.join(ROOT, '.env.deploy'))

async function getServiceRoleKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY
  const token = process.env.SUPABASE_ACCESS_TOKEN
  if (!token) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ACCESS_TOKEN')
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(`Management API keys failed: ${response.status}`)
  const keys = await response.json()
  const serviceRole = keys.find(key => key.name === 'service_role' || key.type === 'service_role')
  if (!serviceRole?.api_key) throw new Error('service_role key not found')
  return serviceRole.api_key
}

function normalizedEntries(zipPath) {
  const unpacked = unzipSync(new Uint8Array(readFileSync(zipPath)))
  return Object.entries(unpacked)
    .filter(([name]) => !name.endsWith('/'))
    .map(([name, bytes]) => ({ name: name.replace(/\\/g, '/'), bytes }))
}

function baseName(name) {
  return name.split('/').pop()?.toLowerCase() || ''
}

function chooseExamEntry(entries) {
  const candidates = entries
    .filter(entry => baseName(entry.name) === 'exam.json')
    .sort((a, b) => a.name.split('/').length - b.name.split('/').length)
  if (!candidates[0]) throw new Error('exam.json not found')
  return candidates[0]
}

function findMedia(entries, names) {
  for (const name of names) {
    const hit = entries.find(entry => baseName(entry.name) === name.toLowerCase())
    if (hit) return hit
  }
  return null
}

function mimeType(name) {
  const lower = name.toLowerCase()
  if (lower.endsWith('.mp3')) return 'audio/mpeg'
  if (lower.endsWith('.wav')) return 'audio/wav'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.png')) return 'image/png'
  return 'image/jpeg'
}

async function upload(supabase, objectPath, entry) {
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, entry.bytes, {
    upsert: true,
    contentType: mimeType(entry.name),
  })
  if (error) throw new Error(`upload ${objectPath}: ${error.message}`)
  return `/${objectPath}`
}

async function publishBundle(supabase, bundle) {
  const zipPath = path.join(SOURCE_ROOT, ...bundle.zip.split('/'))
  if (!existsSync(zipPath)) throw new Error(`Missing ZIP: ${zipPath}`)
  const entries = normalizedEntries(zipPath)
  const examEntry = chooseExamEntry(entries)
  const sourceExam = JSON.parse(Buffer.from(examEntry.bytes).toString('utf8'))
  const audio = findMedia(entries, ['listening.mp3', 'audio.mp3', 'audio.wav'])
  if (!audio) throw new Error('Missing shared audio')

  const mediaRoot = `${STORAGE_PREFIX}/${bundle.id}`
  const audioExt = path.extname(audio.name).toLowerCase() || '.mp3'
  const audioUrl = await upload(supabase, `${mediaRoot}/listening${audioExt}`, audio)
  const pictureUrls = new Map()
  for (let question = 1; question <= 5; question += 1) {
    const image = findMedia(entries, [`q${question}.jpg`, `q${question}.jpeg`, `q${question}.png`, `q${question}.webp`])
    if (!image) throw new Error(`Missing q${question} image`)
    const ext = path.extname(image.name).toLowerCase()
    pictureUrls.set(question, await upload(supabase, `${mediaRoot}/part1-q${question}-pic${ext}`, image))
  }

  const parts = (sourceExam.parts || []).map(part => ({
    ...part,
    id: `${bundle.id}-part-${part.partNumber}`,
    audioKey: undefined,
    audioUrl,
    questions: (part.questions || []).map(question => ({
      ...question,
      id: `${bundle.id}-q-${question.number}`,
      audioKey: undefined,
      pictureImageKey: undefined,
      pictureImageUrl: question.type === 'picture-mc'
        ? pictureUrls.get(question.number)
        : question.pictureImageUrl,
    })),
  }))

  const title = `KET A2 Listening — Book ${bundle.book} — Test ${bundle.test}`
  const payload = {
    id: bundle.id,
    title,
    duration_minutes: sourceExam.durationMinutes ?? 30,
    band_hint: sourceExam.bandHint || 'A2 Key Listening · 5 parts · 25 câu',
    exam_type: 'ket',
    exam_mode: sourceExam.examMode || 'practice',
    parts,
    source: 'import',
    source_filename: path.basename(zipPath),
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from('listening_exam_published').upsert(payload, { onConflict: 'id' })
  if (error) throw new Error(`DB upsert: ${error.message}`)
  return { title, audioBytes: audio.bytes.length, images: pictureUrls.size, questions: parts.flatMap(part => part.questions).length }
}

async function main() {
  const serviceRole = await getServiceRoleKey()
  const supabase = createClient(SUPABASE_URL, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  let completed = 0
  for (const bundle of BUNDLES) {
    process.stdout.write(`… Book ${bundle.book} Test ${bundle.test} `)
    const result = await publishBundle(supabase, bundle)
    completed += 1
    console.log(`✓ ${result.questions}q · audio ${result.audioBytes} bytes · ${result.images} images`)
  }
  console.log(`Done: ${completed}/${BUNDLES.length} bundles published`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
