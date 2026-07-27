#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'packages', 'catalog', 'data')
const PUB_DIR = path.join(ROOT, 'apps', 'web', 'public', 'catalog', 'exams')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function readingIdsFromManifest() {
  const manifestPath = path.join(DATA_DIR, 'manifest.json')
  const manifest = readJson(manifestPath)
  return new Set((manifest.reading ?? [])
    .map(item => item.id)
    .filter(id => String(id).startsWith('catalog-reading-fce-b2-')))
}

function readingIdsFromMeta() {
  const metaPath = path.join(DATA_DIR, 'catalog-reading-meta.json')
  const meta = readJson(metaPath)
  return new Set(meta.map(item => item.id).filter(id => String(id).startsWith('catalog-reading-fce-b2-')))
}

function getReadingBodies() {
  return fs.readdirSync(DATA_DIR)
    .filter(name => name.startsWith('reading-fce-b2-') && name.endsWith('.json') && !name.includes('meta') && !name.includes('answers'))
    .map(name => ({ name, exam: readJson(path.join(DATA_DIR, name)) }))
}

function validateReadingRuntime() {
  const errors = []
  const manifestIds = readingIdsFromManifest()
  const metaIds = readingIdsFromMeta()

  for (const id of manifestIds) {
    if (!metaIds.has(id)) errors.push(`catalog-reading-meta missing ${id}`)
  }

  for (const { name, exam } of getReadingBodies()) {
    if (!exam?.id) {
      errors.push(`${name}: missing id`)
      continue
    }
    if (!manifestIds.has(exam.id)) {
      errors.push(`${name}: id not present in manifest: ${exam.id}`)
    }
    if (exam.examTrack !== 'cambridge') {
      errors.push(`${exam.id}: examTrack must be cambridge`)
    }
    if (exam.cambridgeLevel !== 'b2') {
      errors.push(`${exam.id}: cambridgeLevel must be b2`)
    }
    if (Array.isArray(exam.parts) && exam.parts.length !== 7) {
      errors.push(`${exam.id}: parts.length must be 7`)
    }

    const skill = 'reading'
    const bodyPath = path.join(PUB_DIR, skill, `${exam.id}.json`)
    const answersPath = path.join(PUB_DIR, skill, `${exam.id}.answers.json`)
    if (!fs.existsSync(bodyPath)) errors.push(`missing runtime body ${bodyPath}`)
    if (!fs.existsSync(answersPath)) errors.push(`missing answer vault ${answersPath}`)
  }

  for (const id of metaIds) {
    if (!manifestIds.has(id)) errors.push(`manifest missing ${id}`)
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'))
  }

  return {
    manifestCount: manifestIds.size,
    metaCount: metaIds.size,
    bodyCount: getReadingBodies().length,
    answerVaultCount: fs.readdirSync(path.join(PUB_DIR, 'reading')).filter(name => name.endsWith('.answers.json')).length,
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const result = validateReadingRuntime()
    console.log(JSON.stringify({ ok: true, ...result }, null, 2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

export { validateReadingRuntime }
