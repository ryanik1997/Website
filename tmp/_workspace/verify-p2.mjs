import fs from 'node:fs'
import { compilePart2 } from '../../scripts/reading/pet-b1/compile/compile-exam.mjs'
const n = 41
const bp = (await import(`../../scripts/reading/pet-b1/blueprints/test-${n}.mjs`)).default
const p2 = compilePart2(n, bp)
const cur = JSON.parse(fs.readFileSync(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.json`, 'utf8'))
console.log('COMPILED P2 passage[0]:', JSON.stringify(p2.passage[0]))
console.log('CURRENT  P2 passage[0]:', JSON.stringify(cur.parts[1].passage[0]))
console.log('\nCOMPILED feature[0]:', JSON.stringify(p2.questionGroups[0].features[0]).slice(0,120))
console.log('CURRENT  feature[0]:', JSON.stringify(cur.parts[1].questionGroups[0].features[0]).slice(0,120))
console.log('\nCOMPILED profile[0]:', JSON.stringify(p2.questionGroups[0].questions[0]).slice(0,160))
console.log('CURRENT  profile[0]:', JSON.stringify(cur.parts[1].questionGroups[0].questions[0]).slice(0,160))
const ansCur = JSON.parse(fs.readFileSync(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.answers.json`, 'utf8')).answers
console.log('\nCOMPILED p2 answers:', Object.entries(p2._answers).map(([k,v])=>k.split('-q')[1]+'='+v.answer).join(' '))
console.log('CURRENT  p2 answers:', Object.entries(ansCur).filter(([k])=>k.includes('-part-2')).map(([k,v])=>k.split('-q')[1]+'='+v.answer).join(' '))
