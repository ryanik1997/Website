import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'packages', 'catalog', 'data')
const PUB_DIR = path.join(ROOT, 'apps', 'web', 'public', 'catalog', 'exams')
const FCE_IDS = Array.from({ length: 27 }, (_, i) => `catalog-reading-fce-b2-test${i + 1}`)

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function getFceReadingMeta() {
  const metaPath = path.join(DATA_DIR, 'catalog-reading-meta.json')
  const meta = readJson(metaPath)
  return meta.filter(item => FCE_IDS.includes(item.id))
}

function getFceReadingManifest() {
  const manifestPath = path.join(DATA_DIR, 'manifest.json')
  const manifest = readJson(manifestPath)
  return (manifest.reading ?? []).filter(item => FCE_IDS.includes(item.id))
}

function getFceReadingBodies() {
  return FCE_IDS.map(id => {
    const name = `reading-${id.replace('catalog-reading-', '')}.json`
    const filePath = path.join(DATA_DIR, name)
    if (!fs.existsSync(filePath)) {
      return { id, name, missing: true }
    }
    return { id, name, exam: readJson(filePath) }
  })
}

function iterReadingQuestions(exam) {
  const out = []
  for (const part of Array.isArray(exam.parts) ? exam.parts : []) {
    for (const group of part.questionGroups ?? []) {
      for (const question of group.questions ?? []) {
        out.push({ part, group, question })
      }
    }
  }
  return out
}

function validateReadingRuntime() {
  const errors = []
  const manifest = getFceReadingManifest()
  const meta = getFceReadingMeta()
  const manifestIds = new Set(manifest.map(item => item.id))
  const metaIds = new Set(meta.map(item => item.id))
  const seenQuestionIds = new Set()
  let bodyCount = 0
  let answerVaultCount = 0

  for (const id of FCE_IDS) {
    if (!manifestIds.has(id)) errors.push(`manifest missing ${id}`)
    if (!metaIds.has(id)) errors.push(`meta missing ${id}`)
  }

  if (manifestIds.size !== FCE_IDS.length) {
    errors.push(`manifest must contain exactly 27 FCE B2 reading exams, got ${manifestIds.size}`)
  }
  if (metaIds.size !== FCE_IDS.length) {
    errors.push(`meta must contain exactly 27 FCE B2 reading exams, got ${metaIds.size}`)
  }

  for (const { id, name, missing, exam } of getFceReadingBodies()) {
    if (missing || !exam) {
      errors.push(`missing body ${name}`)
      continue
    }

    bodyCount += 1
    const bodyPath = path.join(PUB_DIR, 'reading', `${id}.json`)
    const answersPath = path.join(PUB_DIR, 'reading', `${id}.answers.json`)
    if (!fs.existsSync(bodyPath)) errors.push(`missing runtime body ${bodyPath}`)
    if (!fs.existsSync(answersPath)) errors.push(`missing answer vault ${answersPath}`)
    if (!exam?.id) {
      errors.push(`${name}: missing exam.id`)
      continue
    }
    if (exam.id !== id) {
      errors.push(`${name}: exam.id mismatch ${exam.id} != ${id}`)
    }
    if (exam.examTrack !== 'cambridge') {
      errors.push(`${id}: examTrack must be cambridge`)
    }
    if (exam.cambridgeLevel !== 'b2') {
      errors.push(`${id}: cambridgeLevel must be b2`)
    }
    if (!Array.isArray(exam.parts) || exam.parts.length !== 7) {
      errors.push(`${id}: parts.length must be 7`)
    }

    const questions = iterReadingQuestions(exam)
    if (questions.length !== 52) {
      errors.push(`${id}: question count must be 52, got ${questions.length}`)
    }

    const vaultPath = path.join(PUB_DIR, 'reading', `${id}.answers.json`)
    if (fs.existsSync(vaultPath)) {
      answerVaultCount += 1
      const vault = readJson(vaultPath)
      if (vault.examId !== id) {
        errors.push(`${id}: answer vault examId must match exam.id`)
      }
      const vaultKeys = Object.keys(vault.answers ?? {})
      if (vaultKeys.length !== 52) {
        errors.push(`${id}: answer vault must contain 52 answers, got ${vaultKeys.length}`)
      }
      const questionIds = questions.map(item => item.question.id)
      const questionIdSet = new Set(questionIds)
      if (questionIdSet.size !== questionIds.length) {
        errors.push(`${id}: duplicate question ids within exam body`)
      }
      for (const q of questions) {
        const { part, group, question } = q
        const partPrefix = `${id}-part-${part.partNumber}`
        const groupPrefix = `${partPrefix}-g`
        const questionPrefix = `${partPrefix}-q`
        if (part.id !== partPrefix) {
          errors.push(`${id}: part id mismatch ${part.id} != ${partPrefix}`)
        }
        if (!group.id.startsWith(groupPrefix)) {
          errors.push(`${id}: group id must start with ${groupPrefix}, got ${group.id}`)
        }
        if (!question.id.startsWith(questionPrefix)) {
          errors.push(`${id}: question id must start with ${questionPrefix}, got ${question.id}`)
        }
        if (!Object.prototype.hasOwnProperty.call(vault.answers ?? {}, question.id)) {
          errors.push(`${id}: vault missing answer for ${question.id}`)
        }
        if (seenQuestionIds.has(question.id)) {
          errors.push(`duplicate question id across catalog: ${question.id}`)
        }
        seenQuestionIds.add(question.id)
      }
      for (const key of vaultKeys) {
        if (!questionIdSet.has(key)) {
          errors.push(`${id}: vault has extraneous key ${key}`)
        }
      }
    }
  }

  for (const id of FCE_IDS) {
    if (!manifestIds.has(id)) continue
    if (!metaIds.has(id)) continue
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'))
  }

  return {
    manifestCount: manifestIds.size,
    metaCount: metaIds.size,
    bodyCount,
    answerVaultCount,
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
