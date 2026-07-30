#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const DATA = path.join(ROOT, 'packages/catalog/data')
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const META = path.join(DATA, 'catalog-reading-meta.json')
const MANIFEST = path.join(DATA, 'manifest.json')
const FROM = 14
const TO = 51

const topics = [
  ['community gardens', 'local gardeners', 'shared plots', 'water-saving'],
  ['repair cafés', 'volunteers', 'broken appliances', 'reuse'],
  ['night markets', 'visitors', 'street food', 'local traders'],
  ['cycle routes', 'commuters', 'safe paths', 'weather'],
  ['school libraries', 'students', 'reading corners', 'quiet study'],
  ['wildlife walks', 'young naturalists', 'woodland trails', 'careful observation'],
  ['street murals', 'artists', 'public walls', 'neighbourhood stories'],
  ['weekend workshops', 'new learners', 'practical skills', 'friendly advice'],
]

const letters = 'ABCDEFGH'.split('')
const option = (id, label) => ({ id, label })
const q = (id, number, type, prompt, options = []) => ({ id, number, type, prompt, options, answerConfidence: 'key' })
const partId = (n, p) => `catalog-reading-pet-b1-test${n}-part-${p}`
const questionId = (n, p, number) => `${partId(n, p)}-q${number}`
const range = (start, end) => `Questions ${start}–${end}`

function part1(n, topic) {
  const [subject, people, object] = topic
  const items = [
    [`${subject[0].toUpperCase()}${subject.slice(1)} notice`, `The ${subject} team needs helpers on Saturday. Bring gloves and arrive before nine.`, 'What should volunteers do?', ['Bring gloves and arrive early.', 'Pay for equipment at the gate.', 'Work there every morning.'], 'A'],
    ['Message from a friend', `I have booked the ${object} session for Tuesday, but I may arrive late. Please start without me and save a place.`, 'What does the writer ask the friend to do?', ['Wait until Tuesday evening.', 'Begin the session if necessary.', 'Cancel the booking.'], 'B'],
    ['Information sign', `Visitors to the ${subject} may use the tools, but they must return them before leaving.`, 'What must visitors do?', ['Take the tools home.', 'Use the tools only outdoors.', 'Return the tools after use.'], 'C'],
    ['Short announcement', `The ${people} meeting has moved from Room 2 to Room 4 because the first room is being painted.`, 'Why has the meeting moved?', ['The original room is unavailable.', 'The meeting has finished early.', 'More people have joined the group.'], 'A'],
    ['Notice for members', `Members can borrow one ${object} guide for a week. Ask at the desk if you need another copy.`, 'What is the rule about guides?', ['Members may keep one for a week.', 'Only visitors may borrow one.', 'All copies must be returned that day.'], 'A'],
  ]
  return { id: partId(n, 1), partNumber: 1, renderMode: 'html-css', rangeLabel: range(1, 5), passageTitle: 'Part 1 – Short texts', passage: items.map(([title, text]) => ({ text: `${title}\n${text}` })), questionGroups: [{ id: `${partId(n, 1)}-g0`, range: range(1, 5), instruction: 'For each question, choose the correct answer A, B or C.', type: 'multiple-choice', questions: items.map((x, i) => q(questionId(n, 1, i + 1), i + 1, 'multiple-choice', x[2], x[3].map((label, j) => option(String.fromCharCode(65 + j), label)))) }], _answers: items.map((x, i) => [questionId(n, 1, i + 1), { answer: x[4], explanation: `The text says: ${items[i][1]}` }]) }
}

function part2(n, topic) {
  const [subject, people, object] = topic
  const options = [
    `A morning course about ${object}, with equipment supplied.`,
    `An evening club for people who prefer meeting local experts.`,
    `A weekend event offering practical activities in small groups.`,
    `A low-cost programme near the town centre, open to beginners.`,
    `A quiet project where members can work independently.`,
    `A short course that includes advice from experienced ${people}.`,
    `A family activity held outdoors when the weather is suitable.`,
    `A longer programme combining study with social events.`,
  ]
  const peopleTexts = [
    `Mia has only one free morning and wants to learn about ${object}.`,
    `Noah works late, so he needs an activity that starts in the evening.`,
    `Aisha is new to ${subject} and wants friendly expert advice.`,
    `Leo has little money and would like somewhere easy to reach.`,
    `Sara dislikes crowds and would rather work quietly on her own.`,
  ]
  const answers = ['A', 'B', 'F', 'D', 'E']
  const passage = [{ text: `The people below all want to take part in ${subject}. Decide which option would be most suitable.` }, ...options.map((text, i) => ({ label: letters[i], text, imageSlotId: `${partId(n, 2)}-option-${letters[i].toLowerCase()}-image`, imageRequired: false }))]
  const questions = peopleTexts.map((text, i) => q(questionId(n, 2, i + 6), i + 6, 'matching-features', text, []))
  return { id: partId(n, 2), partNumber: 2, rangeLabel: range(6, 10), passageTitle: 'Part 2 – Matching', passage, questionGroups: [{ id: `${partId(n, 2)}-g0`, range: range(6, 10), instruction: 'For each question, choose the most suitable option.', type: 'matching-features', features: options.map((text, i) => ({ id: letters[i].toLowerCase(), name: text })), questions }], _answers: questions.map((x, i) => [x.id, { answer: answers[i], explanation: `Option ${answers[i]} matches the stated requirement.` }]) }
}

function part3(n, topic) {
  const [subject, people, object, detail] = topic
  const passage = `When the ${people} in our town started a ${subject} project, few residents expected it to grow so quickly. At first, the organisers met in a small room and planned one simple activity involving ${object}. They soon discovered that people were more willing to join when they could see a clear benefit for the neighbourhood. The organisers therefore published a short timetable and invited local businesses to offer practical help.\n\nThe project was not completely easy. Some volunteers were worried that the work would take too much time, while others wanted to change the plan every week. The team solved this by giving each person one small responsibility and reviewing the results together. This made the project feel manageable, and it also meant that new volunteers could contribute without special experience.\n\nLooking back, the organiser says the most important lesson was not the final result but the way people learned to cooperate. The group still has problems, especially when the weather affects outdoor work, yet members now discuss solutions rather than blaming one another. For this reason, the project has become a useful example of how a modest local idea can create lasting connections.`
  const questions = [
    ['What was one reason more residents joined the project?', ['They could understand its practical value.', 'They were promised paid work.', 'They wanted to compete with local businesses.', 'They were required to attend.'], 'A'],
    ['What problem did some volunteers have at the beginning?', ['They disagreed about how often to change the plan.', 'They could not find a suitable meeting room.', 'They lacked permission to contact businesses.', 'They had no interest in outdoor work.'], 'A'],
    ['How did the team make participation easier?', ['It divided the work into smaller responsibilities.', 'It removed the timetable completely.', 'It asked only experienced people to help.', 'It stopped reviewing the results.'], 'A'],
    ['What does the organiser value most about the project?', ['The cooperation that developed among residents.', 'The money earned by local businesses.', 'The speed at which the first activity finished.', 'The number of changes made to the timetable.'], 'A'],
    ['What is the writer’s main point?', ['A small local project can strengthen a community.', 'Outdoor projects are always more successful than indoor ones.', 'Volunteers should avoid changing their plans.', 'Businesses should organise neighbourhood activities.'], 'A'],
  ]
  const qs = questions.map((x, i) => q(questionId(n, 3, i + 11), i + 11, 'multiple-choice', x[0], x[1].map((label, j) => option(String.fromCharCode(65 + j), label))))
  return { id: partId(n, 3), partNumber: 3, rangeLabel: range(11, 15), passageTitle: `Part 3 – ${subject}`, passage: passage.split('\n\n').map(text => ({ text })), questionGroups: [{ id: `${partId(n, 3)}-g0`, range: range(11, 15), instruction: 'Read the text and choose the correct answer A, B, C or D.', type: 'multiple-choice', questions: qs }], _answers: qs.map((x, i) => [x.id, { answer: questions[i][2], explanation: 'The answer is supported by the corresponding paragraph.' }]) }
}

function part4(n, topic) {
  const [subject, people] = topic
  const options = [
    'This was the first sign that the idea might work.', 'For that reason, the group changed its meeting place.', 'As a result, several people offered to help.', 'The organisers had not expected such a quick response.', 'Even so, the original aim remained the same.', 'They later used the same method in another area.', 'This made the final decision much easier.', 'In the end, everyone agreed to continue.'
  ]
  const text = `The ${people} began their ${subject} plan with one short meeting. (16) ..... The next week, more residents arrived than expected. (17) ..... They wanted to keep the activity useful rather than simply make it larger. (18) ..... The organisers therefore asked members to choose one task each. (19) ..... The work became easier to manage, and new volunteers quickly understood what to do. (20) ..... The project now meets regularly and welcomes anyone who wants to take part.`
  const answers = ['D', 'C', 'E', 'G', 'H']
  const qs = Array.from({ length: 5 }, (_, i) => q(questionId(n, 4, i + 16), i + 16, 'gap-fill', `Gap ${i + 16}`, []))
  return { id: partId(n, 4), partNumber: 4, rangeLabel: range(16, 20), passageTitle: `Part 4 – ${subject}`, passage: [{ text }, ...options.map((x, i) => ({ label: letters[i], text: x }))], questionGroups: [{ id: `${partId(n, 4)}-g0`, range: range(16, 20), instruction: 'Choose the sentence which fits each gap.', type: 'matching-features', features: options.map((x, i) => ({ id: letters[i].toLowerCase(), name: x })), questions: qs }], _answers: qs.map((x, i) => [x.id, { answer: answers[i], explanation: `Sentence ${answers[i]} fits the reference and sequence at gap ${i + 16}.` }]) }
}

function part5(n, topic) {
  const [subject, people, object] = topic
  const data = [
    [`The ${people} usually meet (21) ........ Saturday.`, ['every', 'each', 'whole', 'all'], 'A', 'every'],
    [`New members are shown how to (22) ........ the equipment.`, ['use', 'make', 'bring', 'hold'], 'A', 'use'],
    [`They can ask for advice if they are (23) ........ about a task.`, ['uncertain', 'narrow', 'single', 'empty'], 'A', 'uncertain'],
    [`The group works together (24) ........ everyone can learn.`, ['so that', 'unless', 'although', 'before'], 'A', 'so that'],
    [`Members often share ideas (25) ........ the session.`, ['during', 'between', 'inside', 'through'], 'A', 'during'],
    [`The project has become a popular way to meet (26) ........ people.`, ['local', 'private', 'silent', 'rare'], 'A', 'local'],
  ]
  const qs = data.map((x, i) => q(questionId(n, 5, i + 21), i + 21, 'multiple-choice', `Gap (${i + 21})`, x[1].map((label, j) => option(String.fromCharCode(65 + j), label))))
  return { id: partId(n, 5), partNumber: 5, rangeLabel: range(21, 26), passageTitle: `Part 5 – ${subject}`, passage: [{ text: data.map(x => x[0]).join(' ') }], questionGroups: [{ id: `${partId(n, 5)}-g0`, range: range(21, 26), instruction: 'For each question, choose the correct answer A, B, C or D.', type: 'multiple-choice', questions: qs }], _answers: qs.map((x, i) => [x.id, { answer: data[i][2], explanation: `The correct collocation is “${data[i][3]}”.` }]) }
}

function part6(n, topic) {
  const [subject, people, object, detail] = topic
  const words = ['each', 'how', 'but', 'from', 'where', 'to']
  const passage = `The ${people} meet (27) ........ week to plan activities. New members learn (28) ........ to use the ${object} safely. They can join the work, (29) ........ they should follow the group’s instructions. The project has kept useful materials (30) ........ being thrown away. It is a place (31) ........ people can exchange ideas. Remember (32) ........ ask for help when you need it.`
  const qs = words.map((_, i) => q(questionId(n, 6, i + 27), i + 27, 'gap-fill', `Gap (${i + 27})`, []))
  return { id: partId(n, 6), partNumber: 6, rangeLabel: range(27, 32), passageTitle: `Part 6 – ${subject}`, passage: [{ text: passage }], questionGroups: [{ id: `${partId(n, 6)}-g0`, range: range(27, 32), instruction: 'Write one word for each gap.', type: 'gap-fill', questions: qs }], _answers: qs.map((x, i) => [x.id, { answer: words[i], explanation: `The word “${words[i]}” completes the sentence.` }]) }
}

function makeExam(n) {
  const topic = topics[(n - FROM) % topics.length]
  const parts = [part1(n, topic), part2(n, topic), part3(n, topic), part4(n, topic), part5(n, topic), part6(n, topic)]
  const answers = Object.fromEntries(parts.flatMap(p => p._answers))
  for (const part of parts) delete part._answers
  return { body: { id: `catalog-reading-pet-b1-test${n}`, title: `PET B1 Reading – Test ${n}`, durationMinutes: 45, bandHint: 'B1 Preliminary Reading – 6 parts', examTrack: 'cambridge', cambridgeLevel: 'b1', catalogCanonical: true, parts }, answers: { examId: `catalog-reading-pet-b1-test${n}`, version: 1, mode: 'answers-vault', answers } }
}

function validate(exam) {
  const all = exam.body.parts.flatMap(p => p.questionGroups.flatMap(g => g.questions))
  if (exam.body.parts.length !== 6 || all.length !== 32 || Object.keys(exam.answers.answers).length !== 32) throw new Error(`${exam.body.id}: wrong counts`)
  if (new Set(all.map(x => x.id)).size !== 32 || all.some((x, i) => x.number !== i + 1)) throw new Error(`${exam.body.id}: IDs or numbering invalid`)
  for (const p of exam.body.parts) if (p.partNumber !== 1 && p.partNumber !== 2 && !p.passage.some(x => x.text?.trim())) throw new Error(`${p.id}: empty passage`)
}

async function main() {
  const args = process.argv.slice(2)
  const auditOnly = args.includes('--audit') || args.includes('--validate-only')
  const testArg = args.find(x => x.startsWith('--test='))
  const from = testArg ? Number(testArg.split('=')[1]) : Number(args.find(x => x.startsWith('--from='))?.split('=')[1] ?? FROM)
  const to = testArg ? from : Number(args.find(x => x.startsWith('--to='))?.split('=')[1] ?? TO)
  const generated = []
  for (let n = from; n <= to; n++) { if (n < FROM || n > TO) throw new Error(`PET B1 generator only accepts ${FROM}-${TO}`); const exam = makeExam(n); validate(exam); generated.push(exam) }
  if (auditOnly) { console.log(JSON.stringify({ from, to, tests: generated.length, parts: generated.length * 6, questions: generated.length * 32, answers: generated.length * 32 }, null, 2)); return }
  await fs.mkdir(DATA, { recursive: true }); await fs.mkdir(PUBLIC, { recursive: true })
  for (const exam of generated) {
    const slug = `pet-b1-test${exam.body.id.match(/test(\d+)$/)[1]}`
    const runtimePath = path.join(PUBLIC, `${exam.body.id}.json`)
    try {
      const previous = JSON.parse(await fs.readFile(runtimePath, 'utf8'))
      const previousOptions = new Map((previous.parts?.[1]?.passage ?? []).map(block => [block.imageSlotId, block]))
      for (const block of exam.body.parts[1].passage) {
        const old = previousOptions.get(block.imageSlotId)
        if (old) for (const key of ['assetId', 'alt', 'imageKey', 'imageUrl']) if (old[key] !== undefined) block[key] = old[key]
      }
    } catch {}
    await fs.writeFile(path.join(DATA, `reading-${slug}.json`), `${JSON.stringify(exam.body, null, 2)}\n`)
    await fs.writeFile(runtimePath, `${JSON.stringify(exam.body, null, 2)}\n`)
    await fs.writeFile(path.join(PUBLIC, `${exam.body.id}.answers.json`), `${JSON.stringify(exam.answers)}\n`)
  }
  const existing = JSON.parse(await fs.readFile(META, 'utf8'))
  const additions = generated.map(({ body }) => ({ id: body.id, title: body.title, durationMinutes: body.durationMinutes, bandHint: body.bandHint, examTrack: body.examTrack, cambridgeLevel: body.cambridgeLevel, bodyPath: `catalog/exams/reading/${body.id}.json`, answersPath: `catalog/exams/reading/${body.id}.answers.json`, questionCount: 32, parts: body.parts.map(p => ({ id: p.id, partNumber: p.partNumber, rangeLabel: p.rangeLabel })) }))
  const generatedRange = /^catalog-reading-pet-b1-test(?:1[4-9]|[2-4]\d|5[01])$/
  const additionIds = new Set(additions.map(item => item.id))
  const kept = existing.filter(item => !generatedRange.test(item.id) || !additionIds.has(item.id))
  await fs.writeFile(META, `${JSON.stringify([...kept, ...additions].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })), null, 2)}\n`)
  const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'))
  const manifestAdditions = additions.map(x => ({ id: x.id, slug: x.id.replace('catalog-reading-', ''), title: x.title }))
  const manifestIds = new Set(manifestAdditions.map(item => item.id))
  manifest.reading = [...(manifest.reading ?? []).filter(item => !generatedRange.test(item.id) || !manifestIds.has(item.id)), ...manifestAdditions].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
  await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Generated PET B1 Reading Tests ${from}-${to}: ${generated.length} tests, ${generated.length * 6} parts, ${generated.length * 32} questions.`)
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1 })
