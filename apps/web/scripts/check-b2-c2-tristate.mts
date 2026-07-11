/**
 * One-off: verify B2–C2 (and A2/B1) reading exams are not falsely coerced to YNNG/TFNG.
 * Run: pnpm exec tsx scripts/check-b2-c2-tristate.mts
 */
import { sanitizeReadingExam } from '../src/features/exam/readingExamSanitize.ts'
import fs from 'node:fs'
import path from 'node:path'

// Prefer cwd (pnpm exec from apps/web or repo root)
function findRepoRoot(): string {
  let dir = process.cwd()
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, 'packages/catalog/data/reading-fce-b2-test1.json'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return path.resolve(process.cwd(), '../..')
}
const repoRoot = findRepoRoot()
const paths = [
  'packages/catalog/data/reading-ket-a2-test1.json',
  'packages/catalog/data/reading-pet-b1-test1.json',
  'packages/catalog/data/reading-fce-b2-test1.json',
  'packages/catalog/data/reading-cae-c1-test1.json',
  'packages/catalog/data/reading-cpe-c2-test1.json',
  'Tainguyen/Import Cambridge/FCE_B2/fce-reading-test1/exam.json',
  'Tainguyen/Import Cambridge/CAE_C1/Test1/exam.json',
  'Tainguyen/Import Cambridge/KET_A2/Reading/KET A2_Cam 1/Test 1/exam.json',
  'Tainguyen/Import Cambridge/PET_B1/Cam 1/Test 1/exam.json',
].map(rel => path.join(repoRoot, rel))
console.log('repoRoot', repoRoot)

type Flip = { part: number; from: string; to: string; sample?: string }
type Mc3 = { part: number; type: string; opts: string[] }

let failed = false

for (const p of paths) {
  if (!fs.existsSync(p)) {
    console.log('MISS', p)
    continue
  }
  const raw = JSON.parse(fs.readFileSync(p, 'utf8'))
  const exam = sanitizeReadingExam(raw)
  const flips: Flip[] = []
  const mc3: Mc3[] = []

  for (let i = 0; i < (raw.parts?.length ?? 0); i++) {
    const bp = raw.parts[i]
    const ap = exam.parts[i]
    for (let g = 0; g < (bp.questionGroups?.length ?? 0); g++) {
      const bg = bp.questionGroups[g]
      const ag = ap.questionGroups[g]
      if (!bg || !ag) continue
      if (bg.type !== ag.type) {
        const opts = bg.questions?.[0]?.options ?? []
        flips.push({
          part: bp.partNumber,
          from: bg.type,
          to: ag.type,
          sample: opts.map((o: { id?: string; label?: string }) => `${o.id}:${String(o.label ?? '').slice(0, 24)}`).join(' | '),
        })
      }
      const o = bg.questions?.[0]?.options ?? []
      if (
        (ag.type === 'multiple-choice' || bg.type === 'multiple-choice')
        && o.length > 0
        && o.length <= 3
      ) {
        mc3.push({
          part: bp.partNumber,
          type: ag.type,
          opts: o.map((x: { id?: string; label?: string }) => `${x.id}:${String(x.label ?? '').slice(0, 28)}`),
        })
      }
    }
  }

  // Bad flips: real Cambridge MC forced to ynng/tfng with non-tri-state labels
  const bad = flips.filter(f => {
    if (f.to !== 'ynng' && f.to !== 'tfng') return false
    if (!f.sample) return true
    const looksTri = /yes:|no:|true:|false:|not given/i.test(f.sample)
      || /:(YES|NO|TRUE|FALSE|NOT GIVEN)/i.test(f.sample)
    return !looksTri
  })

  console.log('\n===', path.basename(path.dirname(p)) + '/' + path.basename(p))
  console.log('  flips:', flips.length ? JSON.stringify(flips) : 'none')
  console.log('  mc≤3 kept as:', mc3.length ? mc3.map(m => `P${m.part}=${m.type}`).join(', ') : 'none')
  if (bad.length) {
    failed = true
    console.log('  BAD false-positive:', JSON.stringify(bad))
  }
}

// Synthetic B2-style 3-opt short names (same bug class as KET)
const b2Style = sanitizeReadingExam({
  id: 'syn-b2',
  title: 'syn',
  durationMinutes: 75,
  bandHint: '',
  examTrack: 'cambridge',
  cambridgeLevel: 'b2',
  parts: [{
    id: 'p5',
    partNumber: 5,
    rangeLabel: 'Q31-36',
    passageTitle: 'Part 5',
    passage: [{ text: 'passage' }],
    questionGroups: [{
      id: 'g',
      range: 'Questions 31–36',
      type: 'multiple-choice',
      instruction: 'For each question, choose the correct answer.',
      questions: [31, 32, 33].map(n => ({
        id: `q${n}`,
        number: n,
        type: 'multiple-choice' as const,
        prompt: `Question ${n}`,
        options: [
          { id: 'A', label: 'Ann' },
          { id: 'B', label: 'Bob' },
          { id: 'C', label: 'Cat' },
        ],
        answer: 'a',
        explanation: '',
      })),
    }],
  }],
} as never)

const synType = b2Style.parts[0].questionGroups[0].type
console.log('\n=== synthetic B2 3-opt short names →', synType)
if (synType !== 'multiple-choice') {
  failed = true
  console.log('  BAD: expected multiple-choice')
}

// Real YNNG must still coerce
const realYnng = sanitizeReadingExam({
  id: 'syn-ynng',
  title: 'syn',
  durationMinutes: 60,
  bandHint: '',
  parts: [{
    id: 'p',
    partNumber: 3,
    rangeLabel: 'Q',
    passageTitle: 'P',
    passage: [{ text: 'x' }],
    questionGroups: [{
      id: 'g',
      range: 'Q',
      type: 'multiple-choice',
      instruction: 'Do the following statements agree with the claims of the writer? YES if … NOT GIVEN if …',
      questions: [{
        id: 'q1',
        number: 37,
        type: 'multiple-choice',
        prompt: 'Statement',
        options: [
          { id: 'A', label: 'YES' },
          { id: 'B', label: 'NO' },
          { id: 'C', label: 'NOT GIVEN' },
        ],
        answer: 'A',
        explanation: '',
      }],
    }],
  }],
} as never)
const yType = realYnng.parts[0].questionGroups[0].type
console.log('=== synthetic real YNNG MC shell →', yType)
if (yType !== 'ynng') {
  failed = true
  console.log('  BAD: expected ynng')
}

if (failed) {
  console.error('\nFAILED')
  process.exit(1)
}
console.log('\nOK — no B2–C2 false-positive YNNG; real YNNG still works')
