#!/usr/bin/env node
/**
 * Phase 1 — Missing-content analysis for FCE B2 Reading tests 1–26.
 *
 * Scans all 26 source tests (tests 1–26) and identifies which fields are
 * missing or truncated per Part 1–7. Outputs a repair plan JSON.
 *
 * Run: node scripts/reading/analyze-fce-b2-missing-content.mjs
 *
 * Decision: No need to restore EngExam 1:1. Missing content can be AI-repaired.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..', '..')
const TAINGUYEN = process.env.TAINGUYEN_PATH || path.join(REPO_ROOT, 'Tainguyen')
const FCE_ROOT = path.join(TAINGUYEN, 'Import Cambridge', 'FCE_B2', 'Reading')
const OUT_PATH = path.resolve('tmp/fce-b2-ai-repair-plan.json')

const PART_SPECS = {
  1: { count: 8, start: 1, type: 'multiple-choice', requiresMarkers: true, labels: 'inline-options' },
  2: { count: 8, start: 9, type: 'gap-fill', requiresMarkers: true, labels: 'inline-input' },
  3: { count: 8, start: 17, type: 'gap-fill', requiresMarkers: true, labels: 'word-formation', requiresBaseWord: true },
  4: { count: 6, start: 25, type: 'gap-fill', requiresMarkers: false, requiresSourceSentence: true, requiresKeyword: true, requiresTargetSentence: true },
  5: { count: 6, start: 31, type: 'multiple-choice', requiresMarkers: false, requiresPassage: true },
  6: { count: 6, start: 37, type: 'matching-features', requiresMarkers: true, requiresFeatures: true },
  7: { count: 10, start: 43, type: 'matching-features', requiresMarkers: false, requiresSections: true },
}

const MARKER_RE = /\(\s*(\d+)\s*\)\s*\.\.\.\.\./g
const LETTERS = ['a', 'b', 'c', 'd']
const FEATURE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

function hasRawEntity(text) {
  return /&(?:#\d+|#x[0-9a-f]+|[a-z]+);/i.test(text)
}

function countMarkers(text) {
  const counts = new Map()
  let m
  while ((m = MARKER_RE.exec(text)) !== null) {
    const n = Number(m[1])
    counts.set(n, (counts.get(n) || 0) + 1)
  }
  return counts
}

function sampleText(value, max = 500) {
  const text = String(value ?? '')
  return text.length > max ? text.slice(0, max) + '...' : text
}

function analyzePart1(page) {
  const missing = []
  const usable = {}
  const html = String(page.passageTextHtml ?? '')

  if (!html || html.length < 50) {
    missing.push('passageTextHtml')
  } else {
    usable.passageTextHtmlLength = html.length
    usable.passageTextHtmlSample = sampleText(html)

    const markerCounts = countMarkers(html)
    for (let n = 1; n <= 8; n++) {
      const count = markerCounts.get(n) ?? 0
      if (count !== 1) missing.push(`marker_${n}`)
    }

    // Check if options are embedded as select elements
    if (!html.includes('<select') && !html.includes('<input')) {
      missing.push('inline_options_widget')
    }
  }

  const questions = page.questions ?? []
  for (const q of questions) {
    const opts = q.options ?? []
    if (opts.length < 4 || opts.some(o => !(o.text ?? o.label ?? '').trim())) {
      missing.push(`Q${q.number}_options`)
    }
  }

  // Check for answers
  return { missing: [...new Set(missing)], usable }
}

function analyzePart2(page) {
  const missing = []
  const usable = {}
  const html = String(page.passageTextHtml ?? '')

  if (!html || html.length < 50) {
    missing.push('passageTextHtml')
  } else {
    usable.passageTextHtmlLength = html.length
    usable.passageTextHtmlSample = sampleText(html)

    const markerCounts = countMarkers(html)
    for (let n = 9; n <= 16; n++) {
      const count = markerCounts.get(n) ?? 0
      if (count !== 1) missing.push(`marker_${n}`)
    }

    if (!html.includes('<input') && !html.includes('<select')) {
      missing.push('inline_input_widget')
    }
  }

  return { missing: [...new Set(missing)], usable }
}

function analyzePart3(page) {
  const missing = []
  const usable = {}
  const html = String(page.passageTextHtml ?? '')

  if (!html || html.length < 50) {
    missing.push('passageTextHtml')
  } else {
    usable.passageTextHtmlLength = html.length
    usable.passageTextHtmlSample = sampleText(html)

    const markerCounts = countMarkers(html)
    for (let n = 17; n <= 24; n++) {
      const count = markerCounts.get(n) ?? 0
      if (count !== 1) missing.push(`marker_${n}`)
    }
  }

  const questions = page.questions ?? []
  // Check for base word stems (e.g. "17. ENTERTAINMENT")
  const wordStemsFound = html.match(/(\d+)\.\s*([A-Z]+)/g) ?? []
  if (wordStemsFound.length < 8) {
    // Fall back to question-level baseWord
    for (const q of questions) {
      if (!q.baseWord && !q.prompt) {
        missing.push(`Q${q.number}_baseWord`)
      }
    }
  }

  return { missing, usable }
}

function analyzePart4(page) {
  const missing = []
  const usable = {}

  const questions = page.questions ?? []
  for (const q of questions) {
    const n = q.number
    if (!q.keyword) missing.push(`Q${n}_keyword`)
    if (!q.prompt || q.prompt.trim().length < 5) {
      missing.push(`Q${n}_prompt`)
    } else {
      usable[`Q${n}_prompt`] = sampleText(q.prompt)
    }
  }

  const html = String(page.passageTextHtml ?? page.rawHtmlSample ?? '')
  if (!html || html.length < 50) {
    missing.push('passageTextHtml(rawHtmlSample)')
  } else {
    usable.rawHtmlLength = html.length
    // Check for target sentences (input fields for the transformation)
    const inputCount = (html.match(/<input/g) ?? []).length
    if (inputCount < 6) missing.push('target_input_widgets')
  }

  return { missing, usable }
}

function analyzePart5(page) {
  const missing = []
  const usable = {}

  const html = String(page.passageTextHtml ?? '')
  if (!html || html.length < 50) {
    missing.push('passageTextHtml')
  } else {
    usable.passageTextHtmlLength = html.length
    usable.passageTextHtmlSample = sampleText(html)
  }

  const questions = page.questions ?? []
  for (const q of questions) {
    if (!q.questionText || q.questionText.trim().length < 5) {
      missing.push(`Q${q.number}_prompt`)
    }
    const opts = q.options ?? []
    if (opts.length < 4 || opts.some(o => !(o.text ?? o.label ?? '').trim())) {
      missing.push(`Q${q.number}_options`)
    }
  }

  return { missing: [...new Set(missing)], usable }
}

function analyzePart6(page) {
  const missing = []
  const usable = {}

  const html = String(page.passageTextHtml ?? '')
  if (!html || html.length < 50) {
    missing.push('passageTextHtml')
  } else {
    usable.passageTextHtmlLength = html.length
    usable.passageTextHtmlSample = sampleText(html)

    const markerCounts = countMarkers(html)
    for (let n = 37; n <= 42; n++) {
      const count = markerCounts.get(n) ?? 0
      if (count !== 1) missing.push(`marker_${n}`)
    }

    // Check for feature sentences (A-G)
    const featureMatches = [...html.matchAll(/<strong>\s*([A-G])\s*<\/strong>/gi)]
    if (featureMatches.length < 7) {
      missing.push('feature_sentences_A_G')
    }
  }

  const questions = page.questions ?? []
  for (const q of questions) {
    if (!q.questionText || q.questionText.trim().length < 5) {
      missing.push(`Q${q.number}_prompt`)
    }
  }

  return { missing: [...new Set(missing)], usable }
}

function analyzePart7(page) {
  const missing = []
  const usable = {}

  const html = String(page.passageTextHtml ?? '')
  if (!html || html.length < 50) {
    missing.push('passageTextHtml')
    usable.passageTextHtmlSample = sampleText(html)
  } else {
    usable.passageTextHtmlLength = html.length
    usable.passageTextHtmlSample = sampleText(html)

    // Check for section labels A-D
    const sectionMatches = [...html.matchAll(/<strong>\s*([A-D])\s*<\/strong>/gi)]
    if (sectionMatches.length < 4) {
      missing.push('section_labels_A_D')
    }
  }

  const questions = page.questions ?? []
  for (const q of questions) {
    if (!q.questionText || q.questionText.trim().length < 5) {
      missing.push(`Q${q.number}_prompt`)
    }
  }

  return { missing: [...new Set(missing)], usable }
}

function analyzePart(page) {
  const partNumber = Number(page.partNumber)
  switch (partNumber) {
    case 1: return analyzePart1(page)
    case 2: return analyzePart2(page)
    case 3: return analyzePart3(page)
    case 4: return analyzePart4(page)
    case 5: return analyzePart5(page)
    case 6: return analyzePart6(page)
    case 7: return analyzePart7(page)
    default: return { missing: [`unsupported_part_${partNumber}`], usable: {} }
  }
}

function determineRepairMode(missing) {
  if (!missing.length) return 'deterministic'
  // If only markers missing but passage exists → ai-partial
  const onlyMarkers = missing.every(m => /^marker_\d+$/.test(m))
  if (onlyMarkers) return 'ai-partial'
  // Core content missing (passage, options, features, sections) → ai-full-part
  return 'ai-full-part'
}

async function main() {
  console.log('[analyze] FCE B2 Reading missing-content analysis')
  console.log(`[analyze] Source: ${FCE_ROOT}`)

  const sourceTests = []
  for (let i = 1; i <= 26; i++) {
    sourceTests.push(i)
  }

  const parts = []

  for (const sourceTestNumber of sourceTests) {
    const filePath = path.join(FCE_ROOT, `fce-reading-test${sourceTestNumber}`, 'exam', 'exam.json')
    let raw
    try {
      raw = JSON.parse(await fs.readFile(filePath, 'utf8'))
    } catch {
      console.warn(`[analyze] WARN: Could not read test ${sourceTestNumber} at ${filePath}`)
      parts.push({
        sourceTestNumber,
        appTestNumber: sourceTestNumber + 1,
        partNumber: null,
        status: 'source_missing',
        missing: ['exam.json'],
        usable: {},
        repairMode: 'ai-full-part',
      })
      continue
    }

    const pages = Array.isArray(raw.pages) ? raw.pages : []
    const partPages = pages.filter(p => {
      const pn = Number(p.partNumber)
      return Number.isInteger(pn) && pn >= 1 && pn <= 7
    })

    console.log(`[analyze] Test ${sourceTestNumber} → App ${sourceTestNumber + 1}: ${partPages.length} part pages`)

    for (const page of partPages) {
      const partNumber = Number(page.partNumber)
      const analysis = analyzePart(page)
      const repairMode = determineRepairMode(analysis.missing)

      // Check if this is a known-low-quality source
      const htmlLength = String(page.passageTextHtml ?? '').length
      const rawHtmlLength = String(page.rawHtmlSample ?? '').length
      const isTruncated = rawHtmlLength >= 2000 && rawHtmlLength < 3000 // truncated at ~2000 chars

      parts.push({
        sourceTestNumber,
        appTestNumber: sourceTestNumber + 1,
        partNumber,
        status: analysis.missing.length === 0 ? 'complete' : 'missing_content',
        missing: analysis.missing,
        usableFragments: analysis.usable,
        repairMode,
        sourceHtmlLength: htmlLength,
        rawHtmlSampleLength: rawHtmlLength,
        isTruncated,
      })
    }

    // Check for missing parts
    const foundParts = new Set(partPages.map(p => Number(p.partNumber)))
    for (let pn = 1; pn <= 7; pn++) {
      if (!foundParts.has(pn)) {
        parts.push({
          sourceTestNumber,
          appTestNumber: sourceTestNumber + 1,
          partNumber: pn,
          status: 'part_page_missing',
          missing: ['entire_part_page'],
          usable: {},
          repairMode: 'ai-full-part',
        })
      }
    }
  }

  // Summary
  const byRepairMode = {}
  for (const p of parts) {
    byRepairMode[p.repairMode] = (byRepairMode[p.repairMode] || 0) + 1
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totalSourceTests: sourceTests.length,
    totalParts: parts.length,
    summary: {
      byRepairMode,
      totalDeterministic: byRepairMode.deterministic ?? 0,
      totalAiPartial: byRepairMode['ai-partial'] ?? 0,
      totalAiFullPart: byRepairMode['ai-full-part'] ?? 0,
    },
    parts,
  }

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true })
  await fs.writeFile(OUT_PATH, JSON.stringify(report, null, 2), 'utf8')
  console.log(`\n[analyze] Report written to ${OUT_PATH}`)
  console.log(`[analyze] Total parts: ${parts.length}`)
  console.log(`[analyze]   deterministic: ${byRepairMode.deterministic ?? 0}`)
  console.log(`[analyze]   ai-partial:    ${byRepairMode['ai-partial'] ?? 0}`)
  console.log(`[analyze]   ai-full-part:  ${byRepairMode['ai-full-part'] ?? 0}`)

  // Summarize missing fields
  const fieldCounts = {}
  for (const p of parts) {
    for (const m of p.missing) {
      fieldCounts[m] = (fieldCounts[m] || 0) + 1
    }
  }
  console.log('\n[analyze] Top missing fields:')
  const sorted = Object.entries(fieldCounts).sort((a, b) => b[1] - a[1])
  for (const [field, count] of sorted.slice(0, 20)) {
    console.log(`  ${field}: ${count}`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
