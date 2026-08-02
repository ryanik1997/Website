#!/usr/bin/env node
/**
 * Import 22 crawled CAE C1 Reading & Use of English tests into the app catalog.
 * Source: D:/App-English-Ryan/Crawl/IELTS_Bank/output/cae-reading-use-of-english/test-XX/test.json
 * Mapping: source test N -> app test N+1 (2..23). Existing test-1 is preserved.
 *
 * Usage:
 *   node scripts/reading/import-cae-c1-reading.mjs --dry-run
 *   node scripts/reading/import-cae-c1-reading.mjs --apply
 *   node scripts/reading/import-cae-c1-reading.mjs --dry-run --only 1,22
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const DEFAULT_INPUT = 'D:/App-English-Ryan/Crawl/IELTS_Bank/output/cae-reading-use-of-english'
const PACKAGE_DATA = path.join(ROOT, 'packages', 'catalog', 'data')
const PUBLIC_CATALOG = path.join(ROOT, 'apps', 'web', 'public', 'catalog')
const TMP_DIR = path.join(ROOT, 'tmp')
const DOTS = '........'
const ELLIPSIS = '\u2026'.repeat(4)
const TOTAL_TESTS = 22
const PART_QUESTION_COUNTS = { 1: 8, 2: 8, 3: 8, 4: 6, 5: 6, 6: 4, 7: 6, 8: 10 }
const PART_TYPES = { 1: 'multiple-choice', 2: 'gap-fill', 3: 'gap-fill', 4: 'gap-fill', 5: 'multiple-choice', 6: 'matching-features', 7: 'matching-features', 8: 'matching-features' }

function stableJson(value, compact = false) {
  return `${JSON.stringify(value, null, compact ? 0 : 2)}${compact ? '' : '\n'}`
}

function sha256(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(typeof value === 'string' ? value : stableJson(value))
  return createHash('sha256').update(buffer).digest('hex')
}

function readJsonIfExists(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function upsertById(items, entry) {
  return [...items.filter(item => item?.id !== entry.id), entry]
    .sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }))
}

function comparePlanned(filePath, content) {
  if (!fs.existsSync(filePath)) return { status: 'new', existingHash: null, plannedHash: sha256(content) }
  const existing = fs.readFileSync(filePath)
  const existingHash = sha256(existing)
  const plannedHash = sha256(content)
  return { status: existingHash === plannedHash ? 'identical' : 'conflict', existingHash, plannedHash }
}

function atomicWrite(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const temporary = `${filePath}.tmp-${process.pid}`
  fs.writeFileSync(temporary, content)
  fs.renameSync(temporary, filePath)
}

/* ---------------- conversion helpers ---------------- */

const PAGINATION_ARTIFACT_RE = /^Pages?\s*:\s*(?:\d+\s*){2,}$/i
const TRAILING_PAGINATION_RE = /\s*Pages?\s*:\s*(?:\d+\s*){2,}$/i

function isPaginationArtifact(value) {
  if (typeof value !== 'string') return false
  const normalized = value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  return PAGINATION_ARTIFACT_RE.test(normalized)
}

function stripTrailingPagination(value) {
  if (typeof value !== 'string') return value
  const normalized = value.replace(/\u00a0/g, ' ')
  const trailing = normalized.match(TRAILING_PAGINATION_RE)
  if (!trailing) return value
  return value.slice(0, trailing.index).replace(/\s+$/, '').trimEnd()
}

function cleanText(value) {
  const text = String(value ?? '')
  const idx = text.search(/<[a-zA-Z][a-zA-Z0-9]*(\s|>)/)
  return (idx < 0 ? text : text.slice(0, idx)).trim()
}

function textFromBlock(block) {
  if (block.type === 'heading') return cleanText(block.text)
  const segs = block.segments ?? []
  let out = ''
  for (const s of segs) {
    if (s.type === 'gap') out += `(${s.questionNumber}) ${DOTS}`
    else {
      out += cleanText(s.text) // cleanText strips standalone + inline HTML fragments
    }
  }
  return out.trim()
}

const INSTRUCTION_RE = /^(For questions|You are going to read|Use the word given)/i

function numberToWord(value) {
  const map = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten' }
  return map[value]
}
const EXAMPLE_LABEL_RE = /^Example:/i
const P1_EXAMPLE_OPTIONS_RE = /^[A-D]\s*[a-z]/ // crawler artifact "A damagingB interfering..."
const P3_STEMS_RE = /^\d+\.\s*[A-Z]{2,}/

function buildPart(examId, part) {
  const pn = part.partNumber
  const partId = `${examId}-part-${pn}`
  const range = part.questionRange || { start: 1, end: 1 }
  const rangeLabel = `Questions ${range.start}–${range.end}`

  let instruction = ''
  let heading = ''
  const bodyBlocks = []
  const passageBlocks = []

  if (pn === 6) {
    instruction = `For questions ${range.start}–${range.end}, choose from the reviews (A–D). The reviews may be chosen more than once.`
    for (const t of part.texts ?? []) {
      passageBlocks.push({ label: String(t.label ?? '').replace(/^Review\s+/i, '').trim(), text: cleanText(t.text) })
    }
  } else if (pn === 8) {
    instruction = `For questions ${range.start}–${range.end}, choose from the consultants (A–E). The consultants may be chosen more than once.`
    for (const s of part.sections ?? []) {
      passageBlocks.push({ label: String(s.label ?? '').replace(/^Consultant\s+/i, '').trim(), text: cleanText(s.text) })
    }
  } else if (pn === 4) {
    const wl = part.questions?.[0]?.wordLimit ?? { min: 3, max: 6 }
    const minWord = numberToWord(wl.min) ?? String(wl.min)
    const maxWord = numberToWord(wl.max) ?? String(wl.max)
    instruction = `Write only the missing words. Use between ${minWord} and ${maxWord} words, including the word given.`
    passageBlocks.push({ text: `Complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Use between ${minWord} and ${maxWord} words, including the word given.` })
  } else {
    const blocks = part.passage?.blocks ?? []
    for (const block of blocks) {
      const raw = textFromBlock(block)
      if (!raw) continue
      if (block.type === 'heading' && !heading) {
        heading = raw
        continue
      }
      if (INSTRUCTION_RE.test(raw) && !instruction) {
        instruction = raw
        continue
      }
      if (EXAMPLE_LABEL_RE.test(raw)) continue
      if (pn === 1 && P1_EXAMPLE_OPTIONS_RE.test(raw)) continue
      if (pn === 3 && P3_STEMS_RE.test(raw)) continue
      if (isPaginationArtifact(raw)) continue
      bodyBlocks.push(raw)
    }
    if (heading) passageBlocks.push({ text: heading })
    for (const raw of bodyBlocks) passageBlocks.push({ text: raw })
    if (pn === 7) {
      for (const p of part.paragraphOptions ?? []) {
        passageBlocks.push({ label: p.label, text: cleanText(p.text) })
      }
    }
  }

  const passageTitle = heading ? `Part ${pn} — ${heading}` : (part.title || `Part ${pn}`)

  const questions = buildQuestions(examId, partId, part)
  const group = {
    id: `${partId}-g0`,
    range: rangeLabel,
    instruction,
    type: PART_TYPES[pn],
    questions,
  }

  return { id: partId, partNumber: pn, rangeLabel, passageTitle, passage: passageBlocks, questionGroups: [group] }
}

function buildQuestions(examId, partId, part) {
  const pn = part.partNumber
  return (part.questions ?? []).map(q => {
    const number = q.questionNumber
    const id = `${examId}-part-${pn}-q${number}`
    const base = { id, number, type: PART_TYPES[pn], answerConfidence: 'key' }
    if (pn === 1) {
      return { ...base, prompt: `Gap (${number})`, options: (q.options ?? []).map(o => ({ id: o.label, label: cleanText(o.text) })) }
    }
    if (pn === 2) {
      return { ...base, prompt: `Gap (${number})`, options: [] }
    }
    if (pn === 3) {
      return { ...base, prompt: `Gap (${number}) — ${q.baseWord ?? ''}`.trim(), options: [] }
    }
    if (pn === 4) {
      const prompt = `${cleanText(q.originalSentence)}\n\n${cleanText(q.keyWord)} → ${cleanText(q.completionBefore)}${ELLIPSIS}${cleanText(q.completionAfter)}`
      return { ...base, prompt, options: [] }
    }
    if (pn === 5) {
      return { ...base, prompt: cleanText(q.questionText), options: (q.options ?? []).map(o => ({ id: o.label, label: cleanText(o.text) })) }
    }
    if (pn === 6) {
      return { ...base, prompt: q.questionText ?? '', options: (q.options ?? []).map(o => ({ id: o.label, label: `Reviewer ${o.label}` })) }
    }
    if (pn === 7) {
      const bank = (part.paragraphOptions ?? []).map(p => ({ id: p.label, label: p.label }))
      return { ...base, prompt: `Gap (${number})`, options: bank }
    }
    if (pn === 8) {
      return { ...base, prompt: q.questionText ?? '', options: (q.options ?? []).map(o => ({ id: o.label, label: `Consultant ${o.label}` })) }
    }
    return base
  })
}

function cleanP4Answer(value) {
  return String(value ?? '').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

function buildVault(examId, sourceParts) {
  const answers = {}
  for (const part of sourceParts) {
    const pn = part.partNumber
    for (const q of part.questions ?? []) {
      const id = `${examId}-part-${pn}-q${q.questionNumber}`
      let answer
      if (pn === 1 || pn === 5 || pn === 6 || pn === 7 || pn === 8) answer = cleanText(String(q.correctAnswer ?? '').toLowerCase())
      else if (pn === 4) answer = cleanText(cleanP4Answer(q.correctAnswer))
      else answer = cleanText(q.correctAnswer)
      answers[id] = { answer, explanation: stripTrailingPagination(cleanText(q.explanation)), answerConfidence: 'key' }
    }
  }
  return { examId, version: 1, mode: 'answers-vault', answers }
}

function buildStub(examId, title, parts) {
  return {
    id: examId,
    title,
    durationMinutes: 90,
    bandHint: 'C1 Advanced Reading & Use of English — 8 parts — 8 parts',
    examMode: 'practice',
    examTrack: 'cambridge',
    cambridgeLevel: 'c1',
    questionCount: 56,
    bodyPath: `catalog/exams/reading/${examId}.json`,
    answersPath: `catalog/exams/reading/${examId}.answers.json`,
    bodyRemote: true,
    answersRemote: true,
    parts: parts.map(p => ({ id: p.id, partNumber: p.partNumber, rangeLabel: p.rangeLabel, questions: [] })),
  }
}

function buildBody(examId, title, parts, slug) {
  return {
    id: examId,
    title,
    durationMinutes: 90,
    bandHint: 'C1 Advanced Reading & Use of English — 8 parts — 8 parts',
    parts,
    examTrack: 'cambridge',
    cambridgeLevel: 'c1',
    catalogSlug: slug,
    catalogBase: `/catalog/reading/${slug}`,
    answersPath: `catalog/exams/reading/${examId}.answers.json`,
    answersRemote: true,
    bodyRemote: true,
  }
}

/* ---------------- plan ---------------- */

function discoverInputs(inputRoot, onlyList) {
  const testDirs = []
  for (let n = 1; n <= TOTAL_TESTS; n += 1) {
    if (onlyList && !onlyList.includes(n)) continue
    const dir = path.join(inputRoot, `test-${String(n).padStart(2, '0')}`)
    if (!fs.existsSync(dir)) {
      throw new Error(`Missing source test dir: ${dir}`)
    }
    testDirs.push(dir)
  }
  return testDirs
}

function buildPlan(inputRoot, onlyList) {
  const testDirs = discoverInputs(inputRoot, onlyList)
  const entries = []

  for (const testDir of testDirs) {
    const sourceNumber = Number(path.basename(testDir).match(/test-(\d+)/)[1])
    const appNumber = sourceNumber + 1
    if (appNumber <= 1) throw new Error(`Refusing to map source test-${sourceNumber} to app test ${appNumber}: app test 1 is protected (existing CAE C1 Reading test).`)
    const examId = `catalog-reading-cae-c1-test${appNumber}`
    const slug = `cae-c1-test${appNumber}`
    const title = `CAE C1 Reading & Use of English — Test ${appNumber}`

    const payload = JSON.parse(fs.readFileSync(path.join(testDir, 'test.json'), 'utf8'))
    const parts = payload.parts.map(p => buildPart(examId, p))

    // validate counts
    const counts = {}
    for (const p of parts) counts[p.partNumber] = p.questionGroups[0].questions.length
    for (const [pn, expected] of Object.entries(PART_QUESTION_COUNTS)) {
      if ((counts[Number(pn)] ?? 0) !== expected) {
        throw new Error(`test-${String(sourceNumber).padStart(2, '0')} part ${pn}: expected ${expected} questions, got ${counts[Number(pn)]}`)
      }
    }

    const body = buildBody(examId, title, parts, slug)
    const vault = buildVault(examId, payload.parts)
    const stub = buildStub(examId, title, parts)

    const bodyPath = path.join(PUBLIC_CATALOG, 'exams', 'reading', `${examId}.json`)
    const vaultPath = path.join(PUBLIC_CATALOG, 'exams', 'reading', `${examId}.answers.json`)
    const outputs = [
      { kind: 'body', path: bodyPath, content: stableJson(body, true) },
      { kind: 'vault', path: vaultPath, content: stableJson(vault, true) },
    ]
    for (const output of outputs) Object.assign(output, comparePlanned(output.path, output.content))

    entries.push({
      sourceTestNumber: sourceNumber,
      appTestNumber: appNumber,
      examId,
      slug,
      title,
      sourceDir: path.basename(testDir),
      questions: parts.reduce((sum, p) => sum + p.questionGroups[0].questions.length, 0),
      answers: Object.keys(vault.answers).length,
      body,
      vault,
      stub,
      outputs,
      conflicts: outputs.filter(o => o.status === 'conflict').map(o => o.path),
    })
  }

  const manifestPath = path.join(PACKAGE_DATA, 'manifest.json')
  const metaPath = path.join(PACKAGE_DATA, 'catalog-reading-meta.json')
  const existingManifest = readJsonIfExists(manifestPath, { version: 2, builtAt: null, reading: [], listening: [] })
  const existingMeta = readJsonIfExists(metaPath, [])

  let plannedManifest = { ...existingManifest, reading: existingManifest.reading ?? [] }
  let plannedMeta = existingMeta
  for (const entry of entries) {
    plannedManifest = {
      ...plannedManifest,
      reading: upsertById(plannedManifest.reading, { id: entry.examId, slug: entry.slug, title: entry.title }),
    }
    plannedMeta = upsertById(plannedMeta, entry.stub)
  }
  const manifestContent = stableJson(plannedManifest)
  const metaContent = stableJson(plannedMeta)
  const indexOutputs = [
    { kind: 'manifest', path: manifestPath, content: manifestContent, ...(comparePlanned(manifestPath, manifestContent)) },
    { kind: 'meta', path: metaPath, content: metaContent, ...(comparePlanned(metaPath, metaContent)) },
  ]

  // Index files (manifest + meta) are intentionally updated (upsert of new entries),
  // so their 'conflict' status must NOT block apply. Only body/vault conflicts block.
  const conflicts = entries.flatMap(e => e.conflicts)
  return {
    ok: conflicts.length === 0,
    entries,
    indexOutputs,
    conflicts,
    totals: {
      tests: entries.length,
      questions: entries.reduce((s, e) => s + e.questions, 0),
      answers: entries.reduce((s, e) => s + e.answers, 0),
    },
  }
}

function applyPlan(plan) {
  if (!plan.ok) throw new Error('Refusing to apply a plan with conflicts. Review conflicts and fix targets (e.g. delete stale generated files) before re-running --apply.')
  for (const entry of plan.entries) {
    for (const output of entry.outputs) {
      if (output.status !== 'identical') atomicWrite(output.path, output.content)
    }
  }
  for (const output of plan.indexOutputs) {
    if (output.status !== 'identical') atomicWrite(output.path, output.content)
  }
  const written = plan.entries.flatMap(e => e.outputs).filter(o => o.status !== 'identical').length
    + plan.indexOutputs.filter(o => o.status !== 'identical').length
  return { applied: plan.entries.length, written }
}

function writeMappingFiles(plan, mode) {
  fs.mkdirSync(TMP_DIR, { recursive: true })
  const mapping = {
    existingAppTests: [1],
    sourceTests: { start: 1, end: 22 },
    targetAppTests: { start: 2, end: 23 },
    offset: 1,
    mappings: plan.entries.map(e => ({
      sourceTest: e.sourceTestNumber,
      targetAppTest: e.appTestNumber,
      sourceDir: e.sourceDir,
      targetSlug: e.examId,
      sourceUrl: `https://engexam.info/cae-reading-and-use-of-english-practice-tests/cae-reading-and-use-of-english-practice-test-${e.sourceTestNumber}/`,
    })),
  }
  const mapJsonPath = path.join(TMP_DIR, 'cae-c1-reading-import-map.json')
  fs.writeFileSync(mapJsonPath, `${stableJson(mapping, true)}\n`)

  const md = [
    '# CAE C1 Reading Import Map',
    '',
    `Mode: ${mode}`,
    `Existing app tests protected: 1 (catalog-reading-cae-c1-test1)`,
    `Source range: 1–22 → App range: 2–23 (offset +1)`,
    '',
    '| Source Test | App Test | Exam ID | Source Dir |',
    '|---|---|---|---|',
    ...plan.entries.map(e => `| ${e.sourceTestNumber} | ${e.appTestNumber} | ${e.examId} | ${e.sourceDir} |`),
    '',
  ].join('\n')
  fs.writeFileSync(path.join(TMP_DIR, 'cae-c1-reading-import-map.md'), md)
}

function parseCliArgs(argv = process.argv.slice(2)) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--dry-run') args['dry-run'] = true
    else if (token === '--apply') args.apply = true
    else if (token === '--input') { args.input = argv[i + 1]; i += 1 }
    else if (token === '--only') {
      args.only = String(argv[i + 1]).split(',').map(s => Number(s.trim())).filter(Number.isInteger)
      i += 1
    }
  }
  return args
}

function reportFromPlan(plan, mode, applied = null) {
  return {
    ok: plan.ok,
    mode,
    totals: plan.totals,
    conflicts: plan.conflicts,
    entries: plan.entries.map(e => ({
      sourceTestNumber: e.sourceTestNumber,
      appTestNumber: e.appTestNumber,
      examId: e.examId,
      slug: e.slug,
      sourceDir: e.sourceDir,
      questions: e.questions,
      answers: e.answers,
      outputs: e.outputs.map(o => ({ kind: o.kind, path: o.path, status: o.status })),
    })),
    indexOutputs: plan.indexOutputs.map(o => ({ kind: o.kind, path: o.path, status: o.status })),
    ...(applied ? { applied } : {}),
  }
}

function main() {
  const args = parseCliArgs()
  const dryRun = args['dry-run'] === true
  const apply = args.apply === true
  if (dryRun === apply) throw new Error('Use exactly one of --dry-run or --apply.')
  const inputRoot = args.input || DEFAULT_INPUT
  if (!fs.existsSync(inputRoot)) throw new Error(`Crawl input root not found: ${inputRoot}`)

  const plan = buildPlan(inputRoot, args.only)
  let applied = null
  if (apply && plan.ok) applied = applyPlan(plan)

  fs.mkdirSync(TMP_DIR, { recursive: true })
  const report = reportFromPlan(plan, dryRun ? 'dry-run' : 'apply', applied)
  const reportPath = path.join(TMP_DIR, dryRun ? 'cae-c1-reading-import-dry-run.json' : 'cae-c1-reading-import-apply.json')
  fs.writeFileSync(reportPath, `${stableJson(report, true)}\n`)
  writeMappingFiles(plan, dryRun ? 'dry-run' : 'apply')

  console.log(JSON.stringify(report, null, 2))
  if (!plan.ok) process.exitCode = 1

  // Surface intentional index updates in the report for auditability.
  const indexUpdates = plan.indexOutputs.filter(o => o.status !== 'identical').map(o => ({ kind: o.kind, status: o.status }))
  if (indexUpdates.length) {
    console.log(JSON.stringify({ indexUpdates }, null, 2))
  }
}

main()
