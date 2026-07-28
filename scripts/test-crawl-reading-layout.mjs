import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { crawlRowsToPayload } from './crawl-reading-to-payload.mjs'

const source = JSON.parse(await fs.readFile('Tainguyen/Crawl/Reading_ITELTS/Cam20_Test2.json', 'utf8'))
const payload = crawlRowsToPayload(source, 20, 2, () => {})

assert.equal(payload.parts.length, 3)
for (const [index, part] of payload.parts.entries()) {
  assert.ok(part.passage.length > 3, `Passage ${index + 1} collapsed into too few blocks`)
  assert.ok(part.passage.every(block => block.text && !/<\/?p\b/i.test(block.text)))
}

const groups = payload.parts.flatMap(part => part.questionGroups)
const note = groups.find(group => group.range.includes('1-6'))
assert.ok(note?.notePassage?.some(block => block.type === 'section'), 'Notes lost section blocks')
assert.deepEqual(note.notePassage.filter(block => block.type === 'gap').map(block => block.number), [1, 2, 3, 4, 5, 6])
assert.equal(note.note, undefined, 'noteContent must not be dumped into group.note')

const summary = groups.find(group => group.range.includes('33-37'))
assert.ok(summary?.notePassage?.some(block => block.type === 'static'), 'Summary lost flowing text')
assert.deepEqual(summary.notePassage.filter(block => block.type === 'gap').map(block => block.number), [33, 34, 35, 36, 37])
assert.ok(!/^Questions?\s+33/i.test(summary.instruction), 'Question range must not be duplicated inside instruction')

const bank = summary.wordBank
assert.ok(bank?.length, 'phraseOptions were dropped')
assert.ok(bank.every(option => option.id && option.label && option.id !== option.label), 'wordBank labels must contain real option text')

const tablePayload = crawlRowsToPayload([{ youpass_id: 'cam-20-2-1', title: 'Table', content_html: '<p>A.</p><p>Body</p>', questions: [{
  id: 9, displayType: 'table-completion', type: 'fill-blank', blockId: 'table', answer: 'earthquake',
  _blockConfig: { type: 'table-completion', qStart: 9, qEnd: 9, tableTitle: 'Stepwells', tableHeaders: ['Place', 'Notes'], tableRows: [['Rani Ki Vav', 'Despite the [9]']], tableShowHeaders: true },
}] }], 20, 2, () => {})
const table = tablePayload.parts[0].questionGroups[0].noteTable
assert.deepEqual(table.headers, ['Place', 'Notes'])
assert.deepEqual(table.gapNumbers, [9])
assert.deepEqual(table.rows[0].cells[1], [{ type: 'static', text: 'Despite the ' }, { type: 'gap', number: 9 }])

const cam18 = JSON.parse(await fs.readFile('Tainguyen/Crawl/Reading_ITELTS/Cam18_Test1.json', 'utf8'))
const cam18Payload = crawlRowsToPayload(cam18, 18, 1, () => {})
const cam18Table = cam18Payload.parts[0].questionGroups.find(group => group.range === 'Questions 4-7')?.noteTable
assert.equal(cam18Table.title, 'Intensive farming versus aeroponic urban farming')
assert.deepEqual(cam18Table.headers, ['', 'Growth', 'Selection', 'Sale'])
assert.deepEqual(cam18Table.gapNumbers, [4, 5, 6, 7])
assert.equal(cam18Table.rows.length, 2)
assert.deepEqual(cam18Table.rows[0].cells[1], [
  { type: 'static', text: '• wide range of ' }, { type: 'gap', number: 4 },
  { type: 'static', text: ' used' }, { type: 'break' }, { type: 'static', text: '• techniques pollute air' },
])
const q40Group = cam18Payload.parts[2].questionGroups.find(group => group.questions.some(question => question.number === 40))
assert.equal(q40Group.type, 'matching-features')
assert.equal(q40Group.range, 'Questions 36-40')
assert.deepEqual(q40Group.questions.map(question => question.number), [36, 37, 38, 39, 40])
assert.equal(q40Group.questions.at(-1).prompt, 'There is a risk we will not be able to undo the damage that occurs in space.')

const cam9 = JSON.parse(await fs.readFile('Tainguyen/Crawl/Reading_ITELTS/Cam9_Test4.json', 'utf8'))
const cam9Payload = crawlRowsToPayload(cam9, 9, 4, () => {})
assert.deepEqual(cam9Payload.parts.flatMap(part => part.questionGroups).map(group => group.questions.map(q => q.number)), [
  [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13],
  [14, 15, 16, 17, 18, 19], [20, 21, 22, 23], [24, 25, 26],
  [27, 28, 29, 30], [31, 32, 33, 34, 35, 36], [37, 38, 39, 40],
])

console.log('PASS crawl layout: Cam20 + Cam18 Q40 + Cam9 Test4 grouping')
