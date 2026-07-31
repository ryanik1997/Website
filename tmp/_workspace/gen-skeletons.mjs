#!/usr/bin/env node
/**
 * Generate canonical blueprint skeletons for PET B1 Tests 41-50.
 * Ports existing Part 1 (3-option cards) and Part 2 (features/profiles)
 * from the committed public JSON into the full compileExam blueprint format.
 * Part 3-6 are left as structured authoring sections for content agents.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const OUT = path.join(ROOT, 'scripts/reading/pet-b1/blueprints')
const tests = [41, 42, 43, 44, 45, 46, 47, 48, 49, 50]

function readJson(f) { return JSON.parse(fs.readFileSync(f, 'utf8')) }

function lettersOf(n) { return 'ABCDEFGH'.slice(0, n).split('') }

for (const n of tests) {
  const j = readJson(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.json`))
  const ans = readJson(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.answers.json`))
  const vault = ans.answers

  // ── Part 1: cards ──
  const p1 = j.parts[0]
  const p1q = p1.questionGroups[0].questions
  const cards = p1.passage.map((block, i) => {
    const raw = (block.text || '').split('\n')
    const title = raw[0]?.trim() || `Card ${i + 1}`
    const text = raw.slice(1).join('\n').trim()
    const q = p1q[i]
    const opts = q.options.map(o => ({ key: o.id.toLowerCase(), text: o.label }))
    const answerLetter = vault[`${q.id}`]?.answer ?? vault[`catalog-reading-pet-b1-test${n}-part-1-q${i + 1}`]?.answer
    const correct = opts.find(o => o.key === answerLetter.toLowerCase())
    const vaultAnswer = vault[`catalog-reading-pet-b1-test${n}-part-1-q${i + 1}`]
    return {
      key: `p1-${i + 1}`,
      template: 'generic',
      title,
      text,
      explanation: vaultAnswer?.explanation ?? undefined,
      question: {
        stem: q.prompt,
        options: opts,
        correctOptionKey: correct ? correct.key : opts[0].key,
      },
    }
  })

  // ── Part 2: options + profiles ──
  const p2 = j.parts[1]
  const p2g = p2.questionGroups[0]
  const features = p2g.features || []
  const profilesQ = p2g.questions || []
  const domainMatch = (p2.passage?.[0]?.text || '').match(/choose from (.+?)\./i)
  const domain = domainMatch ? domainMatch[1].trim() : 'local activities'
  const options = features.map((f, i) => {
    const parts = (f.name || '').split(/\s*—\s*|\s*–\s*/).map(s => s.trim())
    const title = parts[0] || `Option ${lettersOf(8)[i]}`
    const description = parts.slice(1).join(' — ') || title
    const letter = lettersOf(8)[i]
    return {
      key: f.id || `option-${letter.toLowerCase()}`,
      title,
      description,
      constraints: [],
      openingStyle: 'other',
      imageSlotKey: `option-${letter.toLowerCase()}`,
    }
  })
  const profiles = profilesQ.map((q, i) => {
    const letter = vault[`catalog-reading-pet-b1-test${n}-part-2-q${i + 6}`]?.answer?.toLowerCase()
    const match = features.find(f => f.id === letter)
    return { text: q.prompt, correctOptionKey: match ? match.id : `option-${letter}` }
  })

  const bp = `/**\n * PET B1 Reading Test ${n} — canonical blueprint\n * Domain: ${domain}\n */\nexport default {\n  testNumber: ${n},\n  id: 'catalog-reading-pet-b1-test${n}',\n  title: 'PET B1 Reading Test ${n}',\n  level: 'B1',\n  examType: 'cambridge',\n  timeLimitMinutes: 45,\n  totalQuestions: 32,\n  parts: [1, 2, 3, 4, 5, 6],\n\n  part1: ${JSON.stringify({ cards }, null, 2)},\n\n  part2: ${JSON.stringify({ domain, options, profiles }, null, 2)},\n\n  part3: ${JSON.stringify({
    title: 'PLACEHOLDER_AUTHOR_ME',
    paragraphs: [],
    buildExtension: '',
    questions: [],
  }, null, 2)},\n\n  part4: ${JSON.stringify({
    title: 'PLACEHOLDER_AUTHOR_ME',
    layoutParagraphs: [],
    layoutExtensions: [],
    layoutClosers: [],
    options: [],
    displayOrder: [0, 1, 2, 3, 4, 5, 6, 7],
  }, null, 2)},\n\n  part5: ${JSON.stringify({
    title: 'PLACEHOLDER_AUTHOR_ME',
    text: '',
    extra: '',
    specs: [],
  }, null, 2)},\n\n  part6: ${JSON.stringify({
    title: 'PLACEHOLDER_AUTHOR_ME',
    text: '',
    extra: '',
    tail: '',
    answers: [],
    targets: [],
  }, null, 2)},\n}\n`

  fs.writeFileSync(path.join(OUT, `test-${n}.mjs`), bp)
  console.log(`skeleton test-${n}.mjs written (domain: ${domain})`)
}
