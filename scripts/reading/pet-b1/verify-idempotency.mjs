/**
 * Verify that modular blueprints produce identical output to the original generator.
 * Usage: node scripts/reading/pet-b1/verify-idempotency.mjs
 */
import { createHash } from 'node:crypto'
import { compileExam } from './compile/compile-exam.mjs'
import test14 from './blueprints/test-14.mjs'
import test30 from './blueprints/test-30.mjs'
import test51 from './blueprints/test-51.mjs'

const blueprints = [test14, test30, test51]

// Import the original generator's makeExam by evaluating it
// We'll compare against the actual generated files on disk instead
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const DATA = path.join(ROOT, 'packages/catalog/data')
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')

function sha256(obj) {
  return createHash('sha256').update(JSON.stringify(obj, null, 2)).digest('hex').slice(0, 16)
}

let allPass = true

for (const bp of blueprints) {
  const n = bp.testNumber
  const exam = compileExam(bp)

  // Compare body
  const runtimePath = path.join(PUBLIC, `${exam.body.id}.json`)
  const diskBody = JSON.parse(await fs.readFile(runtimePath, 'utf8'))
  const bodyMatch = JSON.stringify(exam.body) === JSON.stringify(diskBody)

  // Compare answers
  const answersPath = path.join(PUBLIC, `${exam.body.id}.answers.json`)
  const diskAnswers = JSON.parse(await fs.readFile(answersPath, 'utf8'))
  const answersMatch = JSON.stringify(exam.answers) === JSON.stringify(diskAnswers)

  const status = bodyMatch && answersMatch ? 'PASS' : 'FAIL'
  if (status === 'FAIL') allPass = false

  console.log(`Test ${n}: ${status}`)
  if (!bodyMatch) {
    console.log(`  Body SHA new: ${sha256(exam.body)}`)
    console.log(`  Body SHA disk: ${sha256(diskBody)}`)
    // Find first difference
    const newParts = exam.body.parts
    const oldParts = diskBody.parts
    for (let i = 0; i < 6; i++) {
      if (JSON.stringify(newParts[i]) !== JSON.stringify(oldParts[i])) {
        console.log(`  First diff in Part ${i + 1}`)
        const ns = JSON.stringify(newParts[i], null, 2).split('\n')
        const os = JSON.stringify(oldParts[i], null, 2).split('\n')
        for (let j = 0; j < Math.max(ns.length, os.length); j++) {
          if (ns[j] !== os[j]) {
            console.log(`    Line ${j}: NEW=${(ns[j] || '').slice(0, 100)}`)
            console.log(`    Line ${j}: OLD=${(os[j] || '').slice(0, 100)}`)
            break
          }
        }
        break
      }
    }
  }
  if (!answersMatch) {
    console.log(`  Answers SHA new: ${sha256(exam.answers)}`)
    console.log(`  Answers SHA disk: ${sha256(diskAnswers)}`)
  }
}

console.log(allPass ? '\nAll golden samples PASS idempotency.' : '\nFAILED - fix differences before proceeding.')
process.exitCode = allPass ? 0 : 1
