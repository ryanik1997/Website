import fs from 'node:fs'
import { compilePart1, compilePart2 } from '../../scripts/reading/pet-b1/compile/compile-exam.mjs'
const cmp = (a, b) => JSON.stringify(a) === JSON.stringify(b)
let allOK = true
for (const n of [41, 42, 43, 44, 45, 46, 47, 48, 49, 50]) {
  const bp = (await import(`../../scripts/reading/pet-b1/blueprints/test-${n}.mjs`)).default
  const p1 = compilePart1(n, bp), p2 = compilePart2(n, bp)
  const cur = JSON.parse(fs.readFileSync(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.json`, 'utf8'))
  const ansCur = JSON.parse(fs.readFileSync(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.answers.json`, 'utf8')).answers
  const ok1 = cmp(p1.passage, cur.parts[0].passage) && cmp(p1.questionGroups[0].questions, cur.parts[0].questionGroups[0].questions)
  const ok2 = cmp(p2.passage, cur.parts[1].passage) && cmp(p2.questionGroups[0].features, cur.parts[1].questionGroups[0].features) && cmp(p2.questionGroups[0].questions, cur.parts[1].questionGroups[0].questions)
  const p1ans = Object.fromEntries(p1._answers), p2ans = Object.fromEntries(p2._answers)
  const keys = Object.keys(ansCur).filter(k => k.includes('-part-1') || k.includes('-part-2'))
  const okA = keys.every(k => cmp((p1ans[k] ?? p2ans[k]), ansCur[k]))
  console.log(`test ${n}: P1=${ok1 ? 'OK' : 'DIFF'} P2=${ok2 ? 'OK' : 'DIFF'} answers=${okA ? 'OK' : 'DIFF'}`)
  if (!ok1 || !ok2 || !okA) allOK = false
}
console.log(allOK ? '\nALL P1/P2 PORTS BYTE-IDENTICAL' : '\nPORT MISMATCH FOUND')
