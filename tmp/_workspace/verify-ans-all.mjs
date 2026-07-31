import fs from 'node:fs'
import { compilePart1, compilePart2 } from '../../scripts/reading/pet-b1/compile/compile-exam.mjs'
for (const n of [41, 42, 43, 44, 45, 46, 47, 48, 49, 50]) {
  const bp = (await import(`../../scripts/reading/pet-b1/blueprints/test-${n}.mjs`)).default
  const p2 = compilePart2(n, bp)
  const p1 = compilePart1(n, bp)
  const ansCur = JSON.parse(fs.readFileSync(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.answers.json`, 'utf8')).answers
  const p1ans = Object.fromEntries(p1._answers), p2ans = Object.fromEntries(p2._answers)
  const p2Keys = Object.keys(ansCur).filter(k => k.includes('-part-2'))
  const p2OK = p2Keys.every(k => JSON.stringify(p2ans[k]) === JSON.stringify(ansCur[k]))
  const p1Keys = Object.keys(ansCur).filter(k => k.includes('-part-1'))
  const p1lettersOK = p1Keys.every(k => p1ans[k]?.answer === ansCur[k]?.answer)
  const p1explSame = p1Keys.every(k => p1ans[k]?.explanation === ansCur[k]?.explanation)
  console.log(`test ${n}: P2 answers ${p2OK ? 'OK' : 'DIFF'} | P1 letters ${p1lettersOK ? 'OK' : 'DIFF'} | P1 explanations ${p1explSame ? 'SAME' : 'DIFFER'}`)
}
