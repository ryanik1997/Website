import fs from 'node:fs'
import { compilePart2 } from '../../scripts/reading/pet-b1/compile/compile-exam.mjs'
const n = 41
const bp = (await import(`../../scripts/reading/pet-b1/blueprints/test-${n}.mjs`)).default
const p2 = compilePart2(n, bp)
const ansCur = JSON.parse(fs.readFileSync(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.answers.json`, 'utf8')).answers
const newAns = Object.fromEntries(p2._answers)
console.log('profile correctOptionKeys:', bp.part2.profiles.map(p => p.correctOptionKey))
console.log('option keys:', bp.part2.options.map(o => o.key))
console.log('NEW answers:', ['6','7','8','9','10'].map(q => newAns[`catalog-reading-pet-b1-test41-part-2-q${q}`]?.answer).join(' '))
console.log('CUR answers:', ['6','7','8','9','10'].map(q => ansCur[`catalog-reading-pet-b1-test41-part-2-q${q}`]?.answer).join(' '))
