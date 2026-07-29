import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const ids = ['catalog-reading-pet-b1-test1', 'catalog-reading-pet-b1-test13']
const ALLOWED_IDS = new Set(ids)
const source = id => path.join(root, 'apps/web/public/catalog/exams/reading', `${id}.json`)
const answerFile = id => path.join(root, 'apps/web/public/catalog/exams/reading', `${id}.answers.json`)

const designs = {
  'catalog-reading-pet-b1-test1': {
    p5: ['Choosing a Community Garden', 'Joining a community garden can be a rewarding way to spend your free time. New members usually (21) ........ a small plot and agree to look after it. Before planting, it is useful to (22) ........ advice from an experienced gardener. Some crops need plenty of sunlight, while others grow well in (23) ........ places. Gardeners often (24) ........ their vegetables with neighbours, which helps everyone feel part of the community. At the end of the season, you may even (25) ........ enough food to make a meal for your family. The best gardens are those where people work (26) ........ to solve problems and share ideas.', [['receive','borrow','keep','carry'],['ask for','take','make','put'],['shady','silent','closed','empty'],['share','divide','send','lend'],['produce','prepare','create','build'],['together','nearby','already','instead']], ['a','a','a','a','a','a'], ['receive a plot','ask for advice','shady places','share vegetables','produce food','work together']],
    p6: ['A Weekend Repair Club', 'Our local repair club meets (27) ........ Saturday morning in a room above the library. People bring broken lamps, toys and small appliances, and volunteers show them (28) ........ to fix the problem. You do not need to be an expert, (29) ........ you should be willing to learn and work carefully. The club has saved many useful objects (30) ........ being thrown away. It is also a friendly place (31) ........ people can meet neighbours and exchange ideas. If you have something that no longer works, bring it along and we will see (32) ........ we can help.', ['every','how','but','from','where','whether'], ['time expression','question word','contrast linker','preposition','relative place','indirect question']]
  },
  'catalog-reading-pet-b1-test13': {
    p5: ['Learning to Cook Under Pressure', 'When Maya first worked in a busy kitchen, she found the speed rather (21) ........ . Orders arrived constantly, and she had to (22) ........ several jobs at once. Her trainer told her to stay calm and (23) ........ attention to each instruction. After a few weeks, Maya began to (24) ........ confidence and could organise her work more effectively. She also learned to (25) ........ mistakes quickly instead of hiding them. This experience taught her that good cooking depends as much on teamwork (26) ........ it does on technical skill.', [['demanding','careful','ordinary','peaceful'],['handle','avoid','cancel','refuse'],['pay','give','hold','keep'],['gain','catch','bring','draw'],['admit','allow','promise','suppose'],['as','than','that','when']], ['a','a','a','a','a','a'], ['demanding work','handle jobs','pay attention','gain confidence','admit mistakes','as much as']],
    p6: ['Planning a Wildlife Walk', 'Before setting out, check (27) ........ the path is open and tell someone where you are going. Take a map (28) ........ a fully charged phone, because weather can change quickly. You should walk quietly (29) ........ you do not frighten the animals. If the ground is wet, wear boots (30) ........ have a good grip. Keep food in a sealed bag, and take all your rubbish (31) ........ you when you leave. Most importantly, remember (32) ........ watch from a safe distance.', ['whether','and','so that','which','with','to'], ['indirect question','addition','purpose','relative clause','accompaniment','infinitive']]
  }
}

function part5(id, [title, text, optionSets, answers, targets]) {
  const q = optionSets.map((options, i) => ({ id: `${id}-part-5-q${i + 21}`, number: i + 21, type: 'multiple-choice', prompt: `Gap (${i + 21})`, options: options.map((label, j) => ({ id: String.fromCharCode(65 + j), label })), answerConfidence: 'key' }))
  return { id: `${id}-part-5`, partNumber: 5, rangeLabel: 'Questions 21–26', passageTitle: `Part 5 — ${title}`, passage: [{ text: title }, { text }], questionGroups: [{ id: `${id}-part-5-g0`, range: 'Questions 21–26', instruction: 'For each question, choose the correct answer.', type: 'multiple-choice', questions: q }], _answers: Object.fromEntries(answers.map((answer, i) => [`${id}-part-5-q${i + 21}`, { answer, explanation: `Đáp án ${answer.toUpperCase()}: ${targets[i]}.`, answerConfidence: 'key' }])) }
}
function part6(id, [title, text, answers, targets]) {
  const q = answers.map((_, i) => ({ id: `${id}-part-6-q${i + 27}`, number: i + 27, type: 'gap-fill', prompt: `Gap (${i + 27})`, options: [], answerConfidence: 'key' }))
  return { id: `${id}-part-6`, partNumber: 6, rangeLabel: 'Questions 27–32', passageTitle: `Part 6 — ${title}`, passage: [{ text: title }, { text }], questionGroups: [{ id: `${id}-part-6-g0`, range: 'Questions 27–32', instruction: 'Write ONE word for each gap.', type: 'gap-fill', questions: q }], _answers: Object.fromEntries(answers.map((answer, i) => [`${id}-part-6-q${i + 27}`, { answer, explanation: `Đáp án '${answer}': ${targets[i]}.`, answerConfidence: 'key' }])) }
}

for (const id of ids) {
  if (!ALLOWED_IDS.has(id)) throw new Error(`Refusing to modify non-real PET B1 test: ${id}`)
  const value = JSON.parse(await fs.readFile(source(id), 'utf8'))
  const design = designs[id]
  if (id.endsWith('test13')) {
    design.p5[1] = design.p5[1].replace('After a few weeks, Maya began to', 'At the beginning, Maya wrote short notes beside every order and checked them before passing a plate to the dining room. She sometimes felt nervous when three customers asked for changes at the same time, but the other cooks showed her how to divide the work. After a few weeks, Maya began to').replace('This experience taught her that good cooking depends', 'By the end of the season, she understood that a busy kitchen is not only about speed. It is about listening, helping colleagues and keeping a clear plan. This experience taught her that good cooking depends')
    design.p6[1] = design.p6[1].replace('Before setting out, check', 'A wildlife walk is more enjoyable when you prepare carefully. Before setting out, check').replace('because weather can change quickly.', 'because weather can change quickly and some paths have poor signal. Wear comfortable clothes and carry water, even if the walk is short.').replace('Keep food in a sealed bag,', 'Stop often to look and listen instead of rushing from one place to another. Keep food in a sealed bag,').replace('Most importantly, remember', 'Never follow an animal or try to touch it. Most importantly, remember').replace('watch from a safe distance.', 'watch from a safe distance. Good planning protects both visitors and wildlife.')
  }
  const p5 = part5(id, design.p5); const p6 = part6(id, design.p6)
  value.parts = value.parts.filter(part => part.partNumber < 5).concat([{ ...p5, _answers: undefined }, { ...p6, _answers: undefined }])
  const vault = JSON.parse(await fs.readFile(answerFile(id), 'utf8'))
  vault.answers = { ...Object.fromEntries(Object.entries(vault.answers).filter(([key]) => !key.includes('-part-5-') && !key.includes('-part-6-'))), ...p5._answers, ...p6._answers }
  await fs.writeFile(source(id), `${JSON.stringify(value, null, 2)}\n`)
  await fs.writeFile(answerFile(id), `${JSON.stringify(vault)}\n`)
  if (id.endsWith('test1')) await fs.writeFile(path.join(root, 'packages/catalog/data/reading-pet-b1-test1.json'), `${JSON.stringify(value, null, 2)}\n`)
}
console.log(`Rebuilt Part 5/6 for ${ids.length} real PET B1 tests.`)
