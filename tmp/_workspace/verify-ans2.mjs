import fs from 'node:fs'
import { compilePart1 } from '../../scripts/reading/pet-b1/compile/compile-exam.mjs'
const n = 41
const bp = (await import(`../../scripts/reading/pet-b1/blueprints/test-${n}.mjs`)).default
const p1 = compilePart1(n, bp)
const ansCur = JSON.parse(fs.readFileSync(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.answers.json`, 'utf8')).answers
console.log('NEW q1:', JSON.stringify(Object.fromEntries(p1._answers)['catalog-reading-pet-b1-test41-part-1-q1']))
