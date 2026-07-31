import fs from 'node:fs'
import { compileExam } from '../../scripts/reading/pet-b1/compile/compile-exam.mjs'
const n = Number(process.argv[2])
const bp = (await import(`../../scripts/reading/pet-b1/blueprints/test-${n}.mjs`)).default
const exam = compileExam(bp)
const wc = t => (t ? String(t).split(/\s+/).filter(Boolean).length : 0)
const [p3, p4, p5, p6] = exam.body.parts.slice(2)
const p3w = wc(p3.passage.map(b => b.text).join(' '))
const p4w = wc(p4.passage.filter(b => b.text && !b.label).map(b => b.text).join(' '))
const p5w = wc(p5.passage[0].text.replace(/\(\d+\)/g, '').replace(/\.{3,}/g, ''))
const p6w = wc(p6.passage[0].text.replace(/\(\d+\)/g, '').replace(/\.{3,}/g, ''))
const p5opts = p5.questionGroups[0].questions.flatMap(q => q.options.map(o => o.label))
const p6ans = Object.entries(exam.answers.answers).filter(([k]) => k.includes('-part-6')).map(([, v]) => v.answer)
const p4correct = p4.passage.filter(b => b.label && b.correctForGap).length
const p4gaps = p4.passage.filter(b => b.text && !b.label).map(b => (b.text.match(/\((\d+)\)/g) || [])).flat().join(',')
const p3q = p3.questionGroups[0].questions.length
console.log(`test ${n}: P3=${p3w}w(${p3q}q) P4=${p4w}w(correct ${p4correct}/5, gaps ${p4gaps}) P5=${p5w}w P6=${p6w}w`)
console.log(`  P5 single-word: ${p5opts.every(o => /^[a-z][a-z'-]*$/i.test(o))} | P6 lowercase: ${p6ans.every(a => /^[a-z]+$/.test(a))} | total Q: ${exam.body.parts.flatMap(p => p.questionGroups.flatMap(g => g.questions)).length}`)
