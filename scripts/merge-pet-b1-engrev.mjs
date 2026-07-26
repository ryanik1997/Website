#!/usr/bin/env node

/**
 * merge-pet-b1-engrev.mjs
 *
 * Merge 6 fragment JSONs (Part 1–6) into 5 complete PET B1 Reading exams,
 * outputting ZIP files compatible with the batch importer (batchReadingZipImport.ts).
 *
 * Usage:
 *   node scripts/merge-pet-b1-engrev.mjs [--source <path>] [--out <dir>]
 *
 * Default source:  D:\App-English-Ryan\Crawl\PET_B1_Reading\Import_PET_B1_Reading
 * Default out:     pet-reading-bundles/
 */

import fs from 'node:fs'
import path from 'node:path'
import { zipSync, strToU8 } from '../apps/web/node_modules/fflate/esm/browser.js'
// fflate uses TextEncoder internally via the browser ESM entry

/* ── Configuration ── */

const DEFAULT_SOURCE = 'D:\\App-English-Ryan\\Crawl\\PET_B1_Reading\\Import_PET_B1_Reading'
const DEFAULT_OUT = 'pet-reading-bundles'

const TESTS = ['test14', 'test15', 'test16', 'test17', 'test18']
const ENGREV_INDEX = [1, 2, 3, 4, 5]
const PART_NAMES = ['Part1', 'Part2', 'Part3', 'Part4', 'Part5', 'Part6']

const PART_CONFIG = [
  { part: 1, localStart: 1, globalStart: 1,  count: 5, hasImages: true,  gapFormat: 'none' },
  { part: 2, localStart: 1, globalStart: 6,  count: 5, hasImages: false, gapFormat: 'none' },
  { part: 3, localStart: 1, globalStart: 11, count: 5, hasImages: false, gapFormat: 'none' },
  { part: 4, localStart: 1, globalStart: 16, count: 5, hasImages: false, gapFormat: 'part4' },
  { part: 5, localStart: 1, globalStart: 21, count: 6, hasImages: false, gapFormat: 'part56' },
  { part: 6, localStart: 1, globalStart: 27, count: 6, hasImages: false, gapFormat: 'part56' },
]

/* ── CLI ── */

const args = process.argv.slice(2)
const sourceDir = args.includes('--source') ? args[args.indexOf('--source') + 1] : DEFAULT_SOURCE
const outDir = args.includes('--out') ? args[args.indexOf('--out') + 1] : DEFAULT_OUT

/* ── Helpers ── */

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function stripLetterPrefix(name) {
  return name.replace(/^[A-H]\)\s*/u, '')
}

function makeExamId(engrevN) {
  const testIndex = ENGREV_INDEX.indexOf(engrevN)
  return `catalog-reading-pet-b1-${TESTS[testIndex]}`
}

function makePartId(examId, partNumber) {
  return `${examId}-part-${partNumber}`
}

function makeGroupId(partId) {
  return `${partId}-g0`
}

function makeQuestionId(partId, globalNum) {
  return `${partId}-q${globalNum}`
}

/* ── Passage gap marker transformations ── */

function fixPart4GapMarkers(text, localStart, globalStart, count) {
  // Part 4: "{n}) (_____)" → "({global_n}) ______"
  let result = text
  for (let i = 0; i < count; i++) {
    const localNum = localStart + i
    const globalNum = globalStart + i
    const pattern = new RegExp(String.raw`${localNum}\)\s*\(_{3,}\)`, 'g')
    result = result.replace(pattern, `(${globalNum}) ______`)
  }
  return result
}

function fixPart56GapMarkers(text, localStart, globalStart, count) {
  // Part 5/6: "({n}) ..." → "({global_n}) ______"
  let result = text
  for (let i = 0; i < count; i++) {
    const localNum = localStart + i
    const globalNum = globalStart + i
    const pattern = new RegExp(String.raw`\(${localNum}\)\s*\.{3,}`, 'g')
    result = result.replace(pattern, `(${globalNum}) ______`)
  }
  return result
}

function fixPassageGaps(text, partNumber, localStart, globalStart, count) {
  if (!text || typeof text !== 'string') return text
  if (partNumber === 4) return fixPart4GapMarkers(text, localStart, globalStart, count)
  if (partNumber === 5 || partNumber === 6) return fixPart56GapMarkers(text, localStart, globalStart, count)
  return text
}

function fixPart2RangeRef(text, localStart, globalStart) {
  // "in 1-5" → "in 6-10"
  if (!text || typeof text !== 'string') return text
  return text.replace(
    new RegExp(String.raw`\b${localStart}\s*[–—\-]\s*${localStart + 4}\b`),
    `${globalStart}–${globalStart + 4}`
  )
}

/* ── Read fragments ── */

function readFragment(sourceDir, partName, testLabel, engrevN) {
  let jsonPath, answersPath, images

  if (partName === 'Part1') {
    const dir = path.join(sourceDir, 'Part1', testLabel)
    jsonPath = path.join(dir, `catalog-reading-pet-b1-engrev-${engrevN}.json`)
    answersPath = path.join(dir, `catalog-reading-pet-b1-engrev-${engrevN}.answers.json`)
    images = []
    for (let i = 1; i <= 5; i++) {
      for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
        const imgPath = path.join(dir, `part1-q${i}${ext}`)
        if (fs.existsSync(imgPath)) {
          images.push({ index: i, path: imgPath, ext })
          break
        }
      }
    }
  } else {
    const dir = path.join(sourceDir, partName)
    jsonPath = path.join(dir, `catalog-reading-pet-b1-engrev-${engrevN}.json`)
    answersPath = path.join(dir, `catalog-reading-pet-b1-engrev-${engrevN}.answers.json`)
    images = []
  }

  if (!fs.existsSync(jsonPath)) throw new Error(`Thiếu file: ${jsonPath}`)
  if (!fs.existsSync(answersPath)) throw new Error(`Thiếu file: ${answersPath}`)

  return { body: readJson(jsonPath), answers: readJson(answersPath), images }
}

/* ── Build one merged exam ── */

function buildMergedExam(fragments, testIndex) {
  const engrevN = ENGREV_INDEX[testIndex]
  const testLabel = TESTS[testIndex]
  const examId = makeExamId(engrevN)

  const parts = []
  const allAnswers = {}
  const warnings = []
  let totalQuestions = 0

  for (const cfg of PART_CONFIG) {
    const frag = fragments[cfg.part - 1]
    const fragPart = frag.body.parts[0]
    const fragAnswers = frag.answers.answers || {}

    const partId = makePartId(examId, cfg.part)
    const groupId = makeGroupId(partId)
    const rangeLabel = `Questions ${cfg.globalStart}–${cfg.globalStart + cfg.count - 1}`

    // Transform passage blocks
    const passage = fragPart.passage.map((block, blockIdx) => {
      const nb = { ...block }
      if (nb.text) {
        nb.text = fixPassageGaps(nb.text, cfg.part, cfg.localStart, cfg.globalStart, cfg.count)
        nb.text = fixPart2RangeRef(nb.text, cfg.localStart, cfg.globalStart)
      }
      // Part 1: add imageUrl
      if (cfg.part === 1) {
        const imgAsset = frag.images.find(img => img.index === blockIdx + 1)
        if (imgAsset) nb.imageUrl = `/catalog/reading/pet-b1-${testLabel}/part1-q${blockIdx + 1}${imgAsset.ext}`
      }
      return nb
    })

    // Transform question group
    const qg = { ...fragPart.questionGroups[0] }
    qg.id = groupId
    qg.range = rangeLabel

    // Strip letter prefix from features (Part 2 & 4)
    if ((cfg.part === 2 || cfg.part === 4) && qg.features) {
      qg.features = qg.features.map(f => ({ ...f, name: stripLetterPrefix(f.name) }))
    }

    // Transform questions
    qg.questions = qg.questions.map((q, qi) => {
      const globalNum = cfg.globalStart + qi
      const newQId = makeQuestionId(partId, globalNum)
      let prompt = q.prompt
      if (cfg.part === 4 || cfg.part === 5 || cfg.part === 6) {
        prompt = prompt.replace(/\((\d+)\)/g, (m, ln) => {
          const offset = parseInt(ln, 10) - cfg.localStart
          if (offset >= 0 && offset < cfg.count) return `(${cfg.globalStart + offset})`
          return m
        })
      }
      return { ...q, id: newQId, number: globalNum, prompt }
    })

    parts.push({
      id: partId,
      partNumber: cfg.part,
      rangeLabel,
      passageTitle: fragPart.passageTitle,
      passageSubtitle: fragPart.passageSubtitle,
      passage,
      questionGroups: [qg],
    })

    totalQuestions += qg.questions.length

    // Collect answers: match by position within same Part
    const fragQs = fragPart.questionGroups[0].questions
    for (let qi = 0; qi < cfg.count; qi++) {
      const globalNum = cfg.globalStart + qi
      const newQId = makeQuestionId(partId, globalNum)
      const oldQId = fragQs[qi].id
      const answerEntry = fragAnswers[oldQId]
      if (answerEntry) {
        allAnswers[newQId] = { ...answerEntry }
      } else {
        warnings.push(`MISSING_ANSWER: ${oldQId} (${examId} P${cfg.part} Q${globalNum})`)
      }
    }
  }

  // Title display name
  const titleMap = { test14: 'Test 14', test15: 'Test 15', test16: 'Test 16', test17: 'Test 17', test18: 'Test 18' }

  const catalogSlug = `pet-b1-${testLabel}`

  return {
    body: {
      id: examId,
      title: `PET B1 Reading — ${titleMap[testLabel]}`,
      durationMinutes: 45,
      bandHint: 'B1 Preliminary Reading — 6 parts',
      examTrack: 'cambridge',
      cambridgeLevel: 'b1',
      catalogSlug,
      catalogBase: `/catalog/reading/${catalogSlug}`,
      parts,
    },
    answers: {
      examId,
      version: 1,
      mode: 'answers-vault',
      answers: allAnswers,
    },
    totalQuestions,
    warnings,
  }
}

/* ── Validation (mirrors validateBundle from batchReadingZipImport) ── */

function validate(body, answers, meta) {
  const errors = []
  const warnings = []

  const examQuestions = []
  for (const part of body.parts)
    for (const group of part.questionGroups)
      for (const q of group.questions)
        examQuestions.push(q)

  if (!body.id?.trim()) errors.push('Body thiếu id.')
  if (!body.id.startsWith('catalog-reading-')) warnings.push('Body id không bắt đầu bằng "catalog-reading-".')
  if (!body.title?.trim()) errors.push('Body thiếu title.')
  if (!(body.durationMinutes > 0)) errors.push('durationMinutes phải > 0.')
  if (!Array.isArray(body.parts) || body.parts.length === 0) errors.push('Body thiếu parts.')
  if (answers.examId !== body.id) errors.push('answers.examId không khớp body.id.')

  const ids = examQuestions.map(q => q.id)
  const uniqueIds = new Set(ids)
  if (uniqueIds.size !== ids.length) errors.push('Body có duplicate question.id.')

  const answerMap = answers.answers || {}
  for (const q of examQuestions) {
    const entry = answerMap[q.id]
    if (!entry) { errors.push(`Thiếu answer: ${q.id}`); continue }
    if (typeof entry.answer !== 'string' || !entry.answer.trim()) errors.push(`Answer rỗng: ${q.id}`)
    if (typeof entry.explanation !== 'string' || !entry.explanation.trim()) warnings.push(`Q${q.number}: explanation rỗng.`)
  }

  for (const key of Object.keys(answerMap)) {
    if (!uniqueIds.has(key)) errors.push(`answers có key dư: ${key}`)
  }

  if (meta.questionCount !== examQuestions.length)
    errors.push(`Meta questionCount (${meta.questionCount}) ≠ câu thực tế (${examQuestions.length}).`)

  // PET B1
  const expectedCounts = [5, 5, 5, 5, 6, 6]
  if (body.parts.length !== 6) errors.push('PET B1 phải có 6 parts.')
  if (examQuestions.length !== 32) errors.push(`PET B1 phải có 32 câu, hiện có ${examQuestions.length}.`)
  body.parts.forEach((part, idx) => {
    const count = part.questionGroups.reduce((s, g) => s + g.questions.length, 0)
    if (expectedCounts[idx] != null && count !== expectedCounts[idx])
      errors.push(`Part ${part.partNumber} phải có ${expectedCounts[idx]} câu, hiện có ${count}.`)
  })
  const nums = examQuestions.map(q => q.number).sort((a, b) => a - b)
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== i + 1) { errors.push('Số câu không liên tục 1–32.'); break }
  }

  return { errors, warnings }
}

/* ── Main ── */

function main() {
  console.log('═══════════════════════════════════════════')
  console.log(' PET B1 Reading — EngRev Merge Script')
  console.log(` Source: ${sourceDir}`)
  console.log(` Output: ${outDir}/`)
  console.log('═══════════════════════════════════════════\n')

  if (!fs.existsSync(sourceDir)) {
    console.error(`ERROR: ${sourceDir} không tồn tại.`)
    process.exit(1)
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  let totalErrors = 0
  let totalWarnings = 0
  const outputFiles = []

  for (let testIndex = 0; testIndex < TESTS.length; testIndex++) {
    const engrevN = ENGREV_INDEX[testIndex]
    const testLabel = TESTS[testIndex]
    const examId = makeExamId(engrevN)

    console.log(`\n── ${testLabel} (engrev-${engrevN}) ──`)

    const fragments = []
    let readFail = false
    for (const partName of PART_NAMES) {
      try {
        const frag = readFragment(sourceDir, partName, testLabel, engrevN)
        fragments.push(frag)
        const pt = frag.body.parts[0]
        console.log(`  ✓ ${partName}: ${pt.passageTitle || '(no title)'}`)
      } catch (err) {
        console.error(`  ✗ ${partName}: ${err.message}`)
        readFail = true
      }
    }

    if (readFail || fragments.length < 6) {
      console.error(`  ✗ SKIP: chỉ có ${fragments.length}/6 fragments.`)
      totalErrors++
      continue
    }

    const { body, answers, totalQuestions, warnings: buildWarnings } = buildMergedExam(fragments, testIndex)

    const meta = {
      id: examId,
      title: body.title,
      durationMinutes: 45,
      bandHint: 'B1 Preliminary Reading — 6 parts',
      examMode: 'practice',
      examTrack: 'cambridge',
      cambridgeLevel: 'b1',
      questionCount: totalQuestions,
      bodyPath: `catalog/exams/reading/${examId}.json`,
      answersPath: `catalog/exams/reading/${examId}.answers.json`,
      bodyRemote: true,
      answersRemote: true,
      parts: body.parts.map(p => ({
        id: p.id, partNumber: p.partNumber, rangeLabel: p.rangeLabel, questions: [],
      })),
    }

    const { errors, warnings: valWarnings } = validate(body, answers, meta)
    const allWarnings = [...buildWarnings, ...valWarnings]

    if (errors.length > 0) {
      console.error(`  ✗ VALIDATION FAILED:`)
      errors.forEach(e => console.error(`    - ${e}`))
      totalErrors++
      continue
    }

    if (allWarnings.length > 0) {
      console.log(`  ⚠ ${allWarnings.length} warning(s):`)
      allWarnings.forEach(w => console.log(`    - ${w}`))
      totalWarnings += allWarnings.length
    }

    // Build ZIP
    const prefix = `${testLabel}-import`
    const entries = {}
    entries[`${prefix}/apps/web/public/catalog/exams/reading/${examId}.json`] = strToU8(JSON.stringify(body, null, 2))
    entries[`${prefix}/apps/web/public/catalog/exams/reading/${examId}.answers.json`] = strToU8(JSON.stringify(answers, null, 2))
    entries[`${prefix}/meta-entry-to-paste-into-catalog-reading-meta.json`] = strToU8(JSON.stringify(meta, null, 2))

    let imageCount = 0
    for (const img of fragments[0].images) {
      const data = fs.readFileSync(img.path)
      entries[`${prefix}/apps/web/public/catalog/reading/pet-b1-${testLabel}/part1-q${img.index}${img.ext}`] = new Uint8Array(data)
      imageCount++
    }

    const zipBytes = zipSync(entries, { level: 9 })
    const zipPath = path.join(outDir, `${testLabel}-import.zip`)
    fs.writeFileSync(zipPath, Buffer.from(zipBytes))
    outputFiles.push(zipPath)

    const answerCount = Object.keys(answers.answers).length
    console.log(`  ✓ ${testLabel}: ${totalQuestions} câu, ${answerCount} answer, ${imageCount} ảnh → ${path.basename(zipPath)}`)
  }

  console.log('\n═══════════════════════════════════════════')
  console.log(' KẾT QUẢ')
  console.log(`  ✓ ${outputFiles.length} ZIP files created`)
  console.log(`  ✗ ${totalErrors} errors`)
  console.log(`  ⚠ ${totalWarnings} warnings`)
  console.log('═══════════════════════════════════════════\n')

  if (outputFiles.length > 0) {
    console.log('Files:')
    for (const f of outputFiles) {
      const s = fs.statSync(f)
      console.log(`  ${f} (${(s.size / 1024).toFixed(1)} KB)`)
    }
    console.log('\nImport: /app/exam/track/cambridge/b1/reading → Import hàng loạt Reading')
  }

  if (totalErrors > 0) process.exit(1)
}

main()
