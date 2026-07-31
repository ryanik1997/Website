import fs from 'node:fs'
import { compileExam } from '../../scripts/reading/pet-b1/compile/compile-exam.mjs'
const n = 44
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
console.log(`test ${n}: P3=${p3w}w P4=${p4w}w (correct opts ${p4correct}) P5=${p5w}w P6=${p6w}w`)
console.log('P5 all single-word:', p5opts.every(o => /^[a-z][a-z'-]*$/i.test(o)))
console.log('P6 answers:', p6ans.join(','), '| all lowercase single:', p6ans.every(a => /^[a-z]+$/.test(a)))
console.log('questions total:', exam.body.parts.flatMap(p => p.questionGroups.flatMap(g => g.questions)).length)
