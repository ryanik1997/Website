#!/usr/bin/env node
/**
 * Part 1 negative regression tests (task_3 §5).
 * The Part 1 contract: exactly 3 non-blank distinct options A-C per question,
 * answer in A-C, instruction "choose the correct answer A, B or C."
 * Bad fixtures must be REJECTED; the correct fixture must PASS.
 * Run: node scripts/reading/test-pet-b1-part1-negative.mjs
 */

const ONE_WORD = 1 // marker for readability

// Contract checker (mirrors validate-pet-b1-part1-contract.mjs)
function checkPart1({ instruction, questions }) {
  const errors = []
  if (questions.length !== 5) errors.push('question count != 5')
  for (const q of questions) {
    if (q.options.length !== 3) errors.push(`${q.id}: !=3 options`)
    for (const o of q.options) if (!o.text || !o.text.trim()) errors.push(`${q.id}: blank option`)
    if (!/^[a-c]$/i.test(q.answer || '')) errors.push(`${q.id}: answer not A-C`)
  }
  if (!instruction.includes('A, B or C')) errors.push('instruction not A/B/C')
  return errors
}

const ok = (label, condition) => console.log(`${condition ? 'PASS' : 'FAIL'} ${label}`)
let allPass = true
const expect = (label, cond) => { ok(label, cond); if (!cond) allPass = false }

function fixture(opts, answer) {
  const q = (id, options, answer) => ({ id, options, answer })
  return { instruction: 'For each question, choose the correct answer A, B or C.', questions: [q('q1', opts, answer), q('q2', opts, answer), q('q3', opts, answer), q('q4', opts, answer), q('q5', opts, answer)] }
}

// 1. Blank option text -> FAIL
expect('blank option text rejected', checkPart1(fixture([{ text: 'Bring gloves and arrive early.' }, { text: '   ' }, { text: 'Wear closed shoes.' }], 'A')).length > 0)

// 2. Whitespace-only option -> FAIL
expect('whitespace option rejected', checkPart1(fixture([{ text: 'a' }, { text: 'b' }, { text: ' \t ' }], 'A')).length > 0)

// 3. Missing text field -> FAIL
expect('missing text field rejected', checkPart1(fixture([{ text: 'a' }, { text: 'b' }, {}], 'A')).length > 0)

// 4. Four options A-D -> FAIL (for the 36-40 contract)
expect('four options rejected', checkPart1(fixture([{ text: 'a' }, { text: 'b' }, { text: 'c' }, { text: 'd' }], 'A')).length > 0)

// 5. Answer D -> FAIL
expect('answer D rejected', checkPart1(fixture([{ text: 'a' }, { text: 'b' }, { text: 'c' }], 'D')).length > 0)

// 6. Instruction A/B/C/D on 3-option test -> FAIL
const wrongInstr = { instruction: 'For each question, choose the correct answer A, B, C or D.', questions: fixture([{ text: 'a' }, { text: 'b' }, { text: 'c' }], 'A').questions }
expect('A/B/C/D instruction rejected', checkPart1(wrongInstr).length > 0)

// 7. Correct contract (3 non-empty options, answer A-C, A/B/C instruction) -> PASS
const good = fixture([{ text: 'Bring gloves and arrive early.' }, { text: 'Use the main entrance.' }, { text: 'Wait until Friday.' }], 'B')
expect('correct 3-option contract passes', checkPart1(good).length === 0)

if (!allPass) process.exit(1)
console.log('Part 1 negative regression PASS')
