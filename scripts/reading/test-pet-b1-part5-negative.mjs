#!/usr/bin/env node
/**
 * Part 5 one-word negative regression tests (task_3 §15).
 * Contract: every Q21-26 has exactly 4 unique single-word options (no
 * whitespace / phrase / clause / sentence), answer a-d, no duplicate.
 * Bad fixtures must be REJECTED; the proper one-word set must PASS.
 * Run: node scripts/reading/test-pet-b1-part5-negative.mjs
 */

// Contract checker (mirrors validate-pet-b1-part5-oneword.mjs)
const ONE_WORD = /^[a-z][a-z'-]*$/i
function checkGap(options, answer) {
  const errors = []
  if (options.length !== 4) errors.push('!=4 options')
  const lower = new Set(options.map(t => t.toLowerCase()))
  if (lower.size !== options.length) errors.push('duplicate options')
  for (const t of options) {
    if (!t || !t.trim()) errors.push('empty option')
    else if (/\s/.test(t.trim())) errors.push(`multi-word "${t}"`)
    else if (!ONE_WORD.test(t.trim())) errors.push(`not single word "${t}"`)
  }
  if (!/^[a-d]$/.test(answer || '')) errors.push('answer not a-d')
  return errors
}

let allPass = true
const expect = (label, cond) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${label}`); if (!cond) allPass = false }

// 1. Multi-word option -> FAIL
expect('multi-word option rejected', checkGap(['conducted', 'created', 'built up', 'produced'], 'a').length > 0)

// 2. Phrase with whitespace -> FAIL
expect('phrase with whitespace rejected', checkGap(['conducted', 'in order', 'created', 'built'], 'a').length > 0)

// 3. Empty option -> FAIL
expect('empty option rejected', checkGap(['conducted', '', 'created', 'built'], 'a').length > 0)

// 4. Duplicate options -> FAIL
expect('duplicate options rejected', checkGap(['made', 'made', 'did', 'took'], 'a').length > 0)

// 5. More than four options -> FAIL
expect('five options rejected', checkGap(['a', 'b', 'c', 'd', 'e'], 'a').length > 0)

// 6. Fewer than four options -> FAIL
expect('three options rejected', checkGap(['a', 'b', 'c'], 'a').length > 0)

// 7. Correct answer absent from options -> FAIL (answer not in set)
expect('answer outside options rejected', checkGap(['made', 'did', 'took', 'held'], 'z').length > 0)

// 8. Answer is a phrase -> FAIL
expect('phrase answer rejected', checkGap(['made', 'did', 'took', 'held'], 'so that').length > 0)

// 9. Proper one-word set -> PASS
expect('proper one-word set passes', checkGap(['made', 'did', 'took', 'held'], 'a').length === 0)

// 10. Natural apostrophe allowed -> PASS
expect("apostrophe word allowed", checkGap(["didn't", 'would', 'could', 'should'], 'a').length === 0)

if (!allPass) process.exit(1)
console.log('Part 5 negative regression PASS')
