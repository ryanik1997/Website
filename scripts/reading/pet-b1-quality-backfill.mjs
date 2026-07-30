/**
 * PET B1 Quality Backfill — word-count helper, validator, and audit for Tests 20-29 Part 4-6.
 * Run: node scripts/reading/pet-b1-quality-backfill.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..')

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'))
}

/* ── Word-count helper ────────────────────────────────── */

export function countLearnerFacingWords(text) {
  if (!text) return 0
  // Remove gap markers: (16) ..... or (16) ...
  let cleaned = text.replace(/\(\d+\)\s*\.{2,}/g, ' ')
  // Remove standalone dots/ellipsis
  cleaned = cleaned.replace(/\.{2,}/g, ' ')
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, ' ')
  // Remove question numbers at start of segments
  cleaned = cleaned.replace(/\b\d+\s*\.\s*/g, ' ')
  // Collapse whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  return cleaned ? cleaned.split(' ').filter(w => w.length > 0).length : 0
}

export function countLearnerFacingWordsFromBlock(block) {
  return countLearnerFacingWords(block.text || '')
}

/* ── Part 4 audit ─────────────────────────────────────── */

function auditPart4(pkg) {
  const p4 = (pkg.parts || []).find(p => p.partNumber === 4)
  if (!p4) return null

  const textBlocks = (p4.passage || []).filter(b => !b.label && b.text)
  const labeledBlocks = (p4.passage || []).filter(b => b.label && (b.text || b.text === ''))
  const features = p4.questionGroups?.[0]?.features || []
  const questions = p4.questionGroups?.[0]?.questions || []

  const wordsEachBlock = textBlocks.map(b => countLearnerFacingWords(b.text))
  const totalWords = wordsEachBlock.reduce((a, b) => a + b, 0)
  const gapCount = questions.length

  const gapMatches = textBlocks.map(b => {
    const text = b.text || ''
    const gaps = [...text.matchAll(/\((\d+)\)\s*\.{2,}/g)]
    return gaps.map(g => ({ number: parseInt(g[1]), blockIndex: textBlocks.indexOf(b) }))
  }).flat()

  const wordsBeforeQ16 = countLearnerFacingWords(textBlocks[0]?.text?.split(/\(16\)\s*\.{2,}/)[0] || '')
  const wordsAfterQ20 = countLearnerFacingWords(textBlocks[textBlocks.length - 1]?.text?.split(/\(20\)\s*\.{2,}/)?.slice(-1)[0] || '')

  // Words between consecutive gaps
  const gapsSorted = gapMatches.sort((a, b) => a.number - b.number)
  const wordsBetweenGaps = []
  for (let i = 0; i < gapsSorted.length - 1; i++) {
    const current = gapsSorted[i]
    const next = gapsSorted[i + 1]
    if (current.blockIndex === next.blockIndex) {
      const blockText = textBlocks[current.blockIndex].text
      const afterCurrent = blockText.split(new RegExp(`\\(${current.number}\\)\\s*\\.{2,}`))[1] || ''
      const beforeNext = afterCurrent.split(new RegExp(`\\(${next.number}\\)\\s*\\.{2,}`))[0] || ''
      wordsBetweenGaps.push(countLearnerFacingWords(beforeNext))
    } else {
      // Different blocks: text after current gap in its block + text before next gap in next block
      const afterCurrentInBlock = countLearnerFacingWords(
        textBlocks[current.blockIndex].text.split(new RegExp(`\\(${current.number}\\)\\s*\\.{2,}`))[1] || ''
      )
      const beforeNextInBlock = countLearnerFacingWords(
        textBlocks[next.blockIndex].text.split(new RegExp(`\\(${next.number}\\)\\s*\\.{2,}`))[0] || ''
      )
      wordsBetweenGaps.push(afterCurrentInBlock + beforeNextInBlock)
    }
  }

  return {
    totalWords,
    paragraphCount: textBlocks.length,
    gapCount,
    optionCount: labeledBlocks.length,
    featureCount: features.length,
    wordsPerBlock: wordsEachBlock,
    gapMatches: gapsSorted,
    wordsBeforeQ16,
    wordsAfterQ20,
    wordsBetweenGaps,
  }
}

/* ── Part 5 audit ─────────────────────────────────────── */

function auditPart5(pkg) {
  const p5 = (pkg.parts || []).find(p => p.partNumber === 5)
  if (!p5) return null

  const textBlock = (p5.passage || []).find(b => !b.label && b.text)
  const questions = p5.questionGroups?.[0]?.questions || []
  const totalWords = countLearnerFacingWords(textBlock?.text || '')
  const gapMatches = [...(textBlock?.text || '').matchAll(/\((\d+)\)\s*\.{2,}/g)]

  const optionsPerQuestion = questions.map(q => (q.options || []).length)

  return {
    totalWords,
    gapCount: gapMatches.length,
    questionCount: questions.length,
    optionsPerQuestion,
    allHave4Options: optionsPerQuestion.every(n => n === 4),
  }
}

/* ── Part 6 audit ─────────────────────────────────────── */

function auditPart6(pkg) {
  const p6 = (pkg.parts || []).find(p => p.partNumber === 6)
  if (!p6) return null

  const textBlock = (p6.passage || []).find(b => !b.label && b.text)
  const questions = p6.questionGroups?.[0]?.questions || []
  const totalWords = countLearnerFacingWords(textBlock?.text || '')
  const gapMatches = [...(textBlock?.text || '').matchAll(/\((\d+)\)\s*\.{2,}/g)]

  return {
    totalWords,
    gapCount: gapMatches.length,
    questionCount: questions.length,
  }
}

/* ── Answer vault Part 4 helper ──────────────────────── */

function buildAnswerVaultPart4(testId, qIdPrefix, gapMapping) {
  // gapMapping: { 16: 'feature-id', 17: 'feature-id', ... }
  const vault = {}
  for (const [qNum, featureId] of Object.entries(gapMapping)) {
    const qId = `${qIdPrefix}-q${qNum}`
    vault[qId] = { answer: featureId, explanation: `Sentence ${featureId.toUpperCase()} fits gap ${qNum}.` }
  }
  return vault
}

/* ── Report ───────────────────────────────────────────── */

export function auditRange(start, end) {
  const results = []
  for (let n = start; n <= end; n++) {
    const p = resolve(ROOT, `packages/catalog/data/reading-pet-b1-test${n}.json`)
    if (!existsSync(p)) continue
    const pkg = readJson(p)
    const p4 = auditPart4(pkg)
    const p5 = auditPart5(pkg)
    const p6 = auditPart6(pkg)
    results.push({ test: n, part4: p4, part5: p5, part6: p6 })
  }
  return results
}

function main() {
  const results = auditRange(20, 29)
  console.log('Test | P4 words | P4 paras | P4 gaps | P5 words | P5 gaps | P5 qs | P6 words | P6 gaps | P6 qs')
  console.log('-'.repeat(90))
  for (const r of results) {
    console.log(
      `${r.test} | ${r.part4?.totalWords ?? '-'} | ${r.part4?.paragraphCount ?? '-'} | ${r.part4?.gapCount ?? '-'} | ` +
      `${r.part5?.totalWords ?? '-'} | ${r.part5?.gapCount ?? '-'} | ${r.part5?.questionCount ?? '-'} | ` +
      `${r.part6?.totalWords ?? '-'} | ${r.part6?.gapCount ?? '-'} | ${r.part6?.questionCount ?? '-'}`
    )
  }

  // Save audit
  const tmp = resolve(ROOT, 'tmp')
  if (!existsSync(tmp)) { mkdirSync(tmp, { recursive: true }) }
  writeFileSync(resolve(tmp, 'pet-b1-reading-quality-backfill-20-29-audit.json'), JSON.stringify(results, null, 2))

  // Markdown report
  let md = '# PET B1 Quality Backfill — Audit\n\n'
  md += '## Word counts\n\n'
  md += '| Test | P4 words | P4 paras | P4 gaps | P5 words | P5 gaps | P5 qs | P6 words | P6 gaps | P6 qs |\n'
  md += '|------|----------|---------|---------|---------|---------|-------|---------|---------|-------|\n'
  for (const r of results) {
    md += `| ${r.test} | ${r.part4?.totalWords ?? '-'} | ${r.part4?.paragraphCount ?? '-'} | ${r.part4?.gapCount ?? '-'} | ` +
      `${r.part5?.totalWords ?? '-'} | ${r.part5?.gapCount ?? '-'} | ${r.part5?.questionCount ?? '-'} | ` +
      `${r.part6?.totalWords ?? '-'} | ${r.part6?.gapCount ?? '-'} | ${r.part6?.questionCount ?? '-'} |\n`
  }

  // Targets
  md += '\n## Targets\n\n'
  md += '- Part 4: 270–320 words, 5 paragraphs, 5 gaps, 8 options\n'
  md += '- Part 5: 165–190 words, 6 gaps, 4 options/question, 4+ language targets\n'
  md += '- Part 6: 145–170 words, 6 gaps, 5+ grammar categories\n'

  writeFileSync(resolve(tmp, 'pet-b1-reading-quality-backfill-20-29-audit.md'), md)
  console.log('\nAudit saved to tmp/pet-b1-reading-quality-backfill-20-29-audit.json')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
