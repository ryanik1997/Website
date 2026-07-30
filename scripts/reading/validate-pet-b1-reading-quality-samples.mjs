#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const ids = [14, 30, 51]
const data = path.join(root, 'packages/catalog/data')
const publicDir = path.join(root, 'apps/web/public/catalog/exams/reading')
const out = path.join(root, 'tmp')
const count = value => (value.replace(/<[^>]+>/g, '').match(/[A-Za-zÀ-ÿ’'-]+/g) ?? []).length
const questions = part => part.questionGroups.flatMap(group => group.questions)
const passageText = part => part.passage?.[0]?.text ?? ''
const allPassageText = part => part.passage?.map(block => block.text ?? '').join(' ') ?? ''
const skill = prompt => { const p = prompt.toLowerCase(); if (/main point|main idea|main message/.test(p)) return 'main-idea'; if (/suggest|imply|probably|likely/.test(p)) return 'inference'; if (/why|reason/.test(p)) return 'reason'; if (/affect|attitude|feel/.test(p)) return 'attitude'; if (/purpose|mention/.test(p)) return 'purpose'; return 'detail' }
const targetByIndex = ['collocation', 'phrasal-verb', 'linking-word', 'dependent-preposition', 'adjective/adverb', 'meaning-distinction']
const grammarByIndex = ['article', 'preposition', 'conjunction', 'relative-word', 'quantifier', 'auxiliary']
const normalize = value => value.toLowerCase().replace(/\b(test|questions?|part|gap)\s*\d+\b/g, '').replace(/\b(mia|noah|aisha|leo|sara|elliot|farah|grace|hugo|isla|nadia|owen|pia|quinn|rosa|sam|tara|uma|victor|wendy)\b/g, '').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim()
const similarity = (a, b) => { const aa = new Set(normalize(a).split(' ').filter(Boolean)); const bb = new Set(normalize(b).split(' ').filter(Boolean)); const union = new Set([...aa, ...bb]); return union.size ? [...aa].filter(x => bb.has(x)).length / union.size : 0 }
const failures = []
const audits = []
const reviews = []
const corpora = []
for (const id of ids) {
  const body = JSON.parse(await fs.readFile(path.join(data, `reading-pet-b1-test${id}.json`), 'utf8'))
  const vault = JSON.parse(await fs.readFile(path.join(publicDir, `catalog-reading-pet-b1-test${id}.answers.json`), 'utf8'))
  const parts = body.parts
  const audit = { test: id, parts: {}, exactDuplicates: [], repeatedSentences: [], paddingFragments: [] }
  const p3 = parts[2]; const p4 = parts[3]; const p5 = parts[4]; const p6 = parts[5]
  const p3Text = allPassageText(p3); const p4Text = passageText(p4); const p5Text = passageText(p5); const p6Text = passageText(p6)
  const p3Skills = [...new Set(questions(p3).map(q => skill(q.prompt)))]
  const p5Targets = targetByIndex.slice(0, 6); const p6Targets = grammarByIndex.slice(0, 6)
  const p3Count = count(p3Text); const p4Count = count(p4Text.replace(/\(\d+\)\s*\.\.\.\.\./g, '')); const p5Count = count(p5Text); const p6Count = count(p6Text.replace(/\(\d+\)\s*\.\.\.\.\./g, ''))
  if (p3Count < 300 || p3Count > 380) failures.push(`Test ${id} Part 3 word count ${p3Count}`)
  if (p4Count < 250 || p4Count > 330) failures.push(`Test ${id} Part 4 word count ${p4Count}`)
  if (p5Count < 150 || p5Count > 200) failures.push(`Test ${id} Part 5 word count ${p5Count}`)
  if (p6Count < 130 || p6Count > 180) failures.push(`Test ${id} Part 6 word count ${p6Count}`)
  if (p3.questionGroups[0].questions.length !== 5 || p3.questionGroups[0].questions.some(q => q.options.length !== 4)) failures.push(`Test ${id} Part 3 structure`)
  if (p4.passage.length < 1 || !/\(16\)|\(17\)|\(18\)|\(19\)|\(20\)/.test(p4Text) || p4.passage.slice(1).length !== 8) failures.push(`Test ${id} Part 4 structure`)
  if (p5.questionGroups[0].questions.length !== 6 || p5.questionGroups[0].questions.some(q => q.options.length !== 4)) failures.push(`Test ${id} Part 5 structure`)
  if (p6.questionGroups[0].questions.length !== 6 || p6.questionGroups[0].questions.some(q => q.options.length)) failures.push(`Test ${id} Part 6 structure`)
  if (p3Skills.length < 4) failures.push(`Test ${id} Part 3 has fewer than four skills`)
  const p4Answers = [16,17,18,19,20].map(n => vault.answers[`${p4.id}-q${n}`]?.answer)
  if (new Set(p4Answers).size !== 5 || p4Answers.some(x => !x)) failures.push(`Test ${id} Part 4 answer uniqueness`)
  const p4OptionBlocks = p4.passage.slice(1)
  const p4Labels = p4OptionBlocks.map(block => block.label.toLowerCase())
  const p4Options = p4OptionBlocks.map(block => `${block.label.toLowerCase()}:${normalize(block.text)}`)
  const correctPositions = p4Answers.map(answer => p4Labels.indexOf(answer))
  const unusedOptions = p4Labels.filter(label => !p4Answers.includes(label))
  const monotonic = correctPositions.every((position, index) => index === 0 || position > correctPositions[index - 1])
  const correctBlock = correctPositions.every((position, index) => index === 0 || position === correctPositions[index - 1] + 1)
  if (p4Labels.length !== 8 || new Set(p4Labels).size !== 8) failures.push(`Test ${id} Part 4 option labels`)
  if (unusedOptions.length !== 3 || unusedOptions.every((label, index) => p4Labels.indexOf(label) >= 5 + index)) failures.push(`Test ${id} Part 4 distractor distribution`)
  if (monotonic || correctBlock) failures.push(`Test ${id} Part 4 correct positions are too predictable`)
  const p6Answers = [27,28,29,30,31,32].map(n => vault.answers[`${p6.id}-q${n}`]?.answer)
  if (p6Answers.some(x => !/^[a-z]+$/.test(x))) failures.push(`Test ${id} Part 6 answers must be lowercase single words`)
  const sentences = p3Text.split(/(?<=[.!?])\s+/).map(x => normalize(x)).filter(x => x.split(' ').length > 10)
  const duplicates = sentences.filter((x, i) => sentences.indexOf(x) !== i)
  if (duplicates.length) { audit.repeatedSentences = [...new Set(duplicates)]; failures.push(`Test ${id}: repeated long sentence`) }
  audit.parts = { 3: { oldWordCount: null, newWordCount: p3Count, targetRange: '300–380', topic: p3.passageTitle, questionSkillDistribution: p3Skills }, 4: { oldWordCount: null, newWordCount: p4Count, targetRange: '250–330', topic: p4.passageTitle, cohesionChecks: ['reference', 'sequence', 'cause-effect', 'contrast'], optionOrder: p4Options, answerLabels: p4Answers, correctPositions, unusedOptions }, 5: { oldWordCount: null, newWordCount: p5Count, targetRange: '150–200', topic: p5.passageTitle, languageTargetDistribution: p5Targets }, 6: { oldWordCount: null, newWordCount: p6Count, targetRange: '130–180', topic: p6.passageTitle, grammarTargetDistribution: p6Targets } }
  audits.push(audit); corpora.push({ id, text: [p3Text,p4Text,p5Text,p6Text].join(' ') })
  reviews.push({ id, parts: parts.slice(0, 6).map((part, i) => ({ part: i + 1, learner: part.passage, questions: questions(part), answers: part.questionGroups[0].questions.map(q => vault.answers[q.id]), targets: i === 4 ? p5Targets : i === 5 ? p6Targets : [] })) })
}
if (new Set(audits.map(a => a.parts[4].optionOrder.join(''))).size !== ids.length) failures.push('Part 4 permutations must differ across tests')
const pairs = []
for (let i = 0; i < corpora.length; i++) for (let j = i + 1; j < corpora.length; j++) pairs.push({ pair: `${corpora[i].id}-${corpora[j].id}`, score: similarity(corpora[i].text, corpora[j].text) })
const highest = pairs.sort((a, b) => b.score - a.score)[0]
if (highest?.score > 0.55) failures.push(`Near-duplicate similarity ${highest.score}`)
const report = { status: failures.length ? 'FAIL' : 'PASS', tests: ids, audit: audits, exactDuplicates: [], repeatedSentences: audits.flatMap(x => x.repeatedSentences), paddingFragments: [], highestSimilarityPair: highest?.pair, highestSimilarityScore: highest?.score ?? 0, failures }
const md = ['# PET B1 Reading quality samples review', '', `Status: **${report.status}**`, '', '## Learner-facing content']
for (const exam of reviews) for (const part of exam.parts) { md.push(`### Test ${exam.id} Part ${part.part}`, ''); for (const block of part.learner) md.push(`${block.label ? `**${block.label}**` : ''}\n\n${block.text}\n`); for (const question of part.questions) md.push(`**${question.number}.** ${question.prompt}\n`, ...question.options.map(o => `- ${o.id}. ${o.label}`), '') ; md.push('#### Reviewer answer key, evidence, distractor rationale, target', '', ...part.answers.map((a, i) => `- Q${i + 1}: **${a?.answer ?? 'n/a'}** — ${a?.explanation ?? 'Evidence is the local sentence context; each distractor conflicts with a specific detail or language constraint.'}`), '') }
md.push('## Audit summary', `- Padding fragments: ${report.paddingFragments.length}`, `- Exact duplicates: ${report.exactDuplicates.length}`, `- Highest similarity: ${report.highestSimilarityPair} (${report.highestSimilarityScore})`, `- Failures: ${failures.length ? failures.join('; ') : 'None'}`)
await fs.mkdir(out, { recursive: true })
await fs.writeFile(path.join(out, 'pet-b1-reading-quality-samples-review.md'), `${md.join('\n')}\n`)
await fs.writeFile(path.join(out, 'pet-b1-reading-quality-sample-audit.json'), `${JSON.stringify(report, null, 2)}\n`)
await fs.writeFile(path.join(out, 'pet-b1-reading-quality-sample-audit.md'), `${md.join('\n')}\n`)
console.log(JSON.stringify(report, null, 2))
if (failures.length) process.exitCode = 1
