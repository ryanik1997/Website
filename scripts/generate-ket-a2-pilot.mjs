import fs from 'node:fs/promises'

const id = 'catalog-ket-a2-generated-01'
const sets = [
  ['Library club', 'The town library has started a Saturday club for children aged eight to twelve. Members can borrow two extra books each week and meet a writer once a month. The club meets upstairs beside the computers, and children can get homework help on Monday afternoons.', 1, ['Saturday', 'two extra books', 'a writer', 'children', 'each week', 'once a month']],
  ['Message board', 'Sam, we found your blue jacket after football practice yesterday. It is in a labelled bag behind the front desk at the sports centre. Please collect it before Friday afternoon because the centre is closed at the weekend while workers repair the changing rooms. The receptionist has written your name on the bag and will ask for your membership card. If you cannot come yourself, please send an adult with a note. The centre opens again on Monday morning, but unclaimed clothes will then be taken to the lost-property office. Thank you for helping us keep the reception area tidy.', 7, ['blue jacket', 'behind the front desk', 'before Friday', 'sports centre', 'Friday', 'weekend']],
  ['School garden', 'The school garden is behind the music room near the small playground. Class 6 planted tomatoes in April and picked the first ones in July. The gardening club meets every Friday after lunch. Children must ask a teacher before visiting the pond and should wear old shoes when the ground is wet. This term the pupils are growing beans, carrots and sunflowers, and they record the height of each plant in a notebook. Visitors may look at the garden from the path, but they must not pick flowers or feed the fish. On rainy days the club works inside, making labels and planning the next season. Last year the pupils sold their vegetables at the summer fair and used the money to buy tools. The head teacher says the garden is a good place to learn about nature, teamwork and healthy food.', 14, ['behind the music room', 'Class 6', 'April', 'July', 'a teacher', 'Fridays']],
  ['Day at the lake', 'Mia and Ben went to the lake by bus because their father was working. They planned to swim, but the water was too cold, so they hired two small boats for an hour instead. After lunch they walked along the nature path and visited the bird house before taking the bus home. Mia brought sandwiches and a camera, while Ben carried a map of the walking routes. They stopped at the visitor centre to learn about ducks and took photographs from a wooden bridge. Before leaving, they bought postcards for their parents and checked the bus timetable carefully. The weather changed in the afternoon, so they put on their jackets and stayed close to the shore. Ben wanted to fish, but fishing was not allowed there. They agreed to return in summer when the water would be warmer.', 19, ['by bus', 'the lake', 'too cold', 'two', 'an hour', 'the bird house']],
]
sets[1][1] += ' The sports centre has recently changed its collection system because several coats were left without names. Staff now keep clothing in clear bags and write the date on each label. Sam can telephone the centre if he needs another person to collect the jacket. The phone is answered from nine until five on weekdays. Please use the side entrance while the changing rooms are repaired. Remember to check the bag carefully before leaving, and tell the receptionist if anything is missing. The manager hopes this simple system will help families find their belongings quickly and keep the busy centre organised.'
sets[2][1] += ' In science lessons the children measure rainwater and compare soil in sunny and shady places. They make signs so younger pupils know which plants are safe to touch. A bench stands beside the path for visitors. Parents can visit on the open afternoon in June, when pupils explain how they planted and cared for the vegetables. Everyone must wash their hands before returning to class.'
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
parts.push({ id: `${id}-part-5`, partNumber: 5, rangeLabel: '', passageTitle: 'Weekend plans', passage: [{ text: 'Dear Lucy, I am writing to tell you about my plans for this weekend. On Saturday morning I am going to clean my room because my cousins are coming to stay with us. After lunch I will visit my grandmother, who lives in the next town. She has promised to teach me how to make a chocolate cake. I must buy flour and eggs before Saturday, so I am going to the market with Dad on Friday evening. On Sunday we may go for a walk if the weather is fine. I hope you have a good weekend too. Write soon! Best wishes, Sam' }], questionGroups: [{ id: `${id}-part-5-g0`, range: 'Questions 25-30', instruction: 'Complete the sentences. Write ONE WORD ONLY.', type: 'gap-fill', questions: answers.map((answer, i) => make(25 + i, answer, 'gap-fill')) }] })
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
