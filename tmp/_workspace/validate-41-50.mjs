#!/usr/bin/env node
/** Contract validator for regenerated PET B1 Tests 41-50 (task_7). */
import fs from 'node:fs'

const dir = 'apps/web/public/catalog/exams/reading/'
const wc = t => (t ? String(t).split(/\s+/).filter(Boolean).length : 0)
const GENERIC = new Set(['Multiple-choice cloze', 'Open cloze', 'Gapped text'])
const tests = [41, 42, 43, 44, 45]

let allOK = true
for (const n of tests) {
  const j = JSON.parse(fs.readFileSync(`${dir}catalog-reading-pet-b1-test${n}.json`, 'utf8'))
  const issues = []
  const [p1, p2, p3, p4, p5, p6] = j.parts

  // P1: 5 questions, 3 options each, no blanks, A/B/C instruction
  const p1opts = p1.questionGroups[0].questions.map(q => q.options.length)
  if (p1opts.length !== 5 || !p1opts.every(c => c === 3)) issues.push(`P1 options ${p1opts.join(',')} (need 5×3)`)
  if (!/A, B or C/.test(p1.questionGroups[0].instruction)) issues.push('P1 instruction not A/B/C')
  if (p1.questionGroups[0].questions.some(q => q.options.some(o => !o.label.trim()))) issues.push('P1 blank option')

  // P2: 8 features, 5 profiles, word ranges, distinct openings
  const p2g = p2.questionGroups[0]
  if ((p2g.features || []).length !== 8) issues.push(`P2 options ${p2g.features.length} (need 8)`)
  if ((p2g.questions || []).length !== 5) issues.push(`P2 profiles ${p2g.questions.length} (need 5)`)
  const p2optWc = p2g.features.map(f => wc(f.name))
  if (p2optWc.some(w => w < 45 || w > 75)) issues.push(`P2 option words out of 45-75: ${p2optWc.join(',')}`)
  const p2profWc = p2g.questions.map(q => wc(q.prompt))
  if (p2profWc.some(w => w < 25 || w > 45)) issues.push(`P2 profile words out of 25-45: ${p2profWc.join(',')}`)

  // P3: words 300-380, 5 questions, 4 options each
  const p3text = p3.passage.map(b => b.text || '').join(' ')
  const p3w = wc(p3text)
  if (p3w < 300 || p3w > 380) issues.push(`P3 words ${p3w} (need 300-380)`)
  const p3q = p3.questionGroups[0].questions
  if (p3q.length !== 5 || p3q.some(q => q.options.length !== 4)) issues.push('P3 question/option count wrong')
  if (p3text.split(/[.!?]/).filter(s => s.trim()).length < 12) issues.push(`P3 sentences <12 (${p3text.split(/[.!?]/).filter(s=>s.trim()).length})`)
  const paras3 = p3.passage.filter(b => b.text).length
  if (paras3 < 4) issues.push(`P3 paragraphs <4 (${paras3})`)

  // P4: words 300-360, 5 paragraphs, 5 gaps, 8 options
  const p4blocks = p4.passage.filter(b => b.text && !b.label).map(b => b.text).join(' ')
  const p4w = wc(p4blocks)
  if (p4w < 300 || p4w > 360) issues.push(`P4 words ${p4w} (need 300-360)`)
  const p4paras = p4.passage.filter(b => b.text && !b.label).length
  if (p4paras !== 5) issues.push(`P4 paragraphs ${p4paras} (need 5)`)
  const p4gaps = p4.passage.filter(b => b.text && !b.label).map(b => (b.text.match(/\((\d+)\)/g) || [])).flat()
  if (p4gaps.length !== 5 || !['(16)', '(17)', '(18)', '(19)', '(20)'].every((g, i) => p4gaps[i] === g)) issues.push(`P4 gaps ${p4gaps.join(',')}`)
  const p4opts = p4.passage.filter(b => b.label)
  if (p4opts.length !== 8) issues.push(`P4 options ${p4opts.length} (need 8)`)
  const correct = p4opts.filter(o => o.correctForGap).length
  if (correct !== 5) issues.push(`P4 correct options ${correct} (need 5)`)

  // P5: words 180-220, 6 gaps, 4 single-word options each
  const p5text = p5.passage[0].text
  const p5w = wc(p5text.replace(/\(\d+\)/g, '').replace(/\.{3,}/g, ''))
  if (p5w < 180 || p5w > 220) issues.push(`P5 words ${p5w} (need 180-220)`)
  const p5q = p5.questionGroups[0].questions
  if (p5q.length !== 6) issues.push(`P5 questions ${p5q.length} (need 6)`)
  const p5bad = p5q.flatMap((q, i) => q.options.length !== 4 ? [`Q${21 + i} has ${q.options.length} opts`] : []).filter(Boolean)
  if (p5bad.length) issues.push('P5 option counts: ' + p5bad.join(','))
  const p5phrase = p5q.flatMap((q, i) => q.options.map(o => o.label).filter(l => !/^[a-z][a-z'-]*$/i.test(l.trim())).map(l => `Q${21 + i}: "${l}"`))
  if (p5phrase.length) issues.push('P5 non-single-word options: ' + p5phrase.join(', '))

  // P6: words 160-200, 6 gaps, single lowercase answers
  const p6text = p6.passage[0].text
  const p6w = wc(p6text.replace(/\(\d+\)/g, '').replace(/\.{3,}/g, ''))
  if (p6w < 160 || p6w > 200) issues.push(`P6 words ${p6w} (need 160-200)`)
  const ansFile = JSON.parse(fs.readFileSync(`${dir}catalog-reading-pet-b1-test${n}.answers.json`, 'utf8'))
  const p6answers = Object.entries(ansFile.answers).filter(([k]) => k.includes('-part-6')).map(([, v]) => v.answer)
  if (p6answers.length !== 6) issues.push(`P6 answers ${p6answers.length} (need 6)`)
  const p6bad = p6answers.filter(a => !/^[a-z]+$/.test(a))
  if (p6bad.length) issues.push('P6 non-lowercase-word answers: ' + p6bad.join(','))

  // Titles P3/P4/P5/P6
  for (const pn of [3, 4, 5, 6]) {
    const t = (j.parts[pn - 1].passageTitle || '').replace(/^Part\s*[3456]\s*[—–-]\s*/i, '').trim()
    if (!t || GENERIC.has(t) || wc(t) < 3 || wc(t) > 8) issues.push(`P${pn} title "${t}" (need 3-8 words, non-generic)`)
  }

  console.log(`test ${n}: ${issues.length ? 'FAIL' : 'PASS'}`)
  if (issues.length) { allOK = false; issues.forEach(i => console.log(`   - ${i}`)) }
  console.log(`   P3=${p3w}w P4=${p4w}w P5=${p5w}w P6=${p6w}w`)
}
console.log(allOK ? '\nALL BATCH 6 CONTRACTS PASS' : '\nFAILURES PRESENT')
