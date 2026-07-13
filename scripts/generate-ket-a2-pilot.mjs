import fs from 'node:fs/promises'

const id = 'catalog-ket-a2-generated-01'
const sets = [
  ['Library club', 'The town library has started a Saturday club for children. Members can borrow two extra books each week and meet a writer once a month.', 1, ['Saturday', 'two extra books', 'a writer', 'children', 'each week', 'once a month']],
  ['Message board', 'Sam, your blue jacket is in a bag behind the front desk at the sports centre. Please collect it before Friday because the centre is closed at the weekend.', 7, ['blue jacket', 'behind the front desk', 'before Friday', 'sports centre', 'Friday', 'weekend']],
  ['School garden', 'The school garden is behind the music room. Class 6 planted tomatoes in April and picked the first ones in July. Children must ask a teacher before visiting the pond. The garden is open on Fridays.', 14, ['behind the music room', 'Class 6', 'April', 'July', 'a teacher', 'Fridays']],
  ['Day at the lake', 'Mia and Ben went to the lake by bus. The water was too cold for swimming, so they hired two boats for an hour. After lunch they visited the bird house.', 19, ['by bus', 'the lake', 'too cold', 'two', 'an hour', 'the bird house']],
]
const stems = [
  'What does the notice say?',
  'Where can you find this information?',
  'When does this happen?',
  'Who is this message for?',
  'What should the reader do?',
  'Why is this information included?',
]
const make = (n, answer, type = 'multiple-choice') => ({
  id: `${id}-q${n}`,
  number: n,
  type,
  prompt: type === 'gap-fill' ? `Complete the sentence with one word from the text.` : stems[(n - 1) % stems.length],
  options: type === 'gap-fill' ? [] : [
    { id: 'A', label: answer },
    { id: 'B', label: n % 2 ? 'next weekend' : 'at a different place' },
    { id: 'C', label: n % 3 ? 'a different activity' : 'another person' },
  ],
  answer: type === 'gap-fill' ? answer : 'a',
  explanation: `The passage gives this information directly: ${answer}.`,
  answerConfidence: 'key',
})
const parts = sets.map(([title, passage, start, answers], i) => ({ id: `${id}-part-${i + 1}`, partNumber: i + 1, rangeLabel: '', passageTitle: title, passage: [{ text: passage }], questionGroups: [{ id: `${id}-part-${i + 1}-g0`, range: `Questions ${start}-${start + answers.length - 1}`, instruction: 'Choose the correct answer.', type: 'multiple-choice', questions: answers.map((answer, j) => make(start + j, answer)) }] }))
const answers = ['clean', 'visit', 'make', 'cake', 'flour', 'Saturday']
parts.push({ id: `${id}-part-5`, partNumber: 5, rangeLabel: '', passageTitle: 'Weekend plans', passage: [{ text: 'This weekend I am going to clean my room, visit my grandmother and make a cake. I need to buy flour before Saturday.' }], questionGroups: [{ id: `${id}-part-5-g0`, range: 'Questions 25-30', instruction: 'Complete the sentences. Write ONE WORD ONLY.', type: 'gap-fill', questions: answers.map((answer, i) => make(25 + i, answer, 'gap-fill')) }] })
parts.push({ id: `${id}-part-6`, partNumber: 6, rangeLabel: 'Writing task', passageTitle: 'Part 6 — Email', passage: [], questionGroups: [{ id: `${id}-part-6-g0`, range: 'Writing task', instruction: 'Write an email to your English friend. Write 25 words or more.', type: 'writing-task', questions: [{ id: `${id}-writing-6`, number: 31, type: 'writing-task', prompt: 'Write an email to your friend Alex. Tell Alex where you are going on Saturday, who you are going with and what you are going to do there.', options: [], answer: '', explanation: 'A successful answer covers all three points and uses an appropriate informal email style.', answerConfidence: 'key', minWords: 25, modelAnswer: 'Hi Alex, On Saturday I am going to the town park with my sister. We are going to have a picnic and play tennis. Would you like to come? Best wishes, Sam' }] }] })
parts.push({ id: `${id}-part-7`, partNumber: 7, rangeLabel: 'Writing task', passageTitle: 'Part 7 — Story', passage: [], questionGroups: [{ id: `${id}-part-7-g0`, range: 'Writing task', instruction: 'Write a story based on the pictures. Write 35 words or more.', type: 'writing-task', questions: [{ id: `${id}-writing-7`, number: 32, type: 'writing-task', prompt: 'Write a short story about a child who finds a lost dog, looks after it and finally finds its owner.', options: [], answer: '', explanation: 'A successful answer tells a clear story with a beginning, middle and ending.', answerConfidence: 'key', minWords: 35, modelAnswer: 'Tom found a small dog near the station. He gave it some water and looked at its collar. Then he called the owner. The owner arrived soon and thanked Tom.' }] }] })
const exam = { id, title: 'KET A2 Reading — Generated Pilot 01', durationMinutes: 60, bandHint: 'A2 Key Reading · generated-review-required', parts, examTrack: 'cambridge', cambridgeLevel: 'a2' }
exam.catalogSlug = 'ket-a2-generated-01'
exam.catalogBase = '/catalog/reading/ket-a2-generated-01'
exam.parts[6].questionGroups[0].questions[0].prompt = ''
exam.parts[5].questionGroups[0].questions[0].prompt = ''
delete exam.parts[5].questionGroups[0].questions[0].modelAnswer
delete exam.parts[6].questionGroups[0].questions[0].modelAnswer
await fs.writeFile('packages/catalog/data/reading-ket-a2-generated-01.json', `${JSON.stringify(exam, null, 2)}\n`)
console.log(`Generated ${exam.id}`)
