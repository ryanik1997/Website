import {
  CambridgeWritingCollectionSchema,
  CambridgeWritingManifestSchema,
  type CambridgeWritingCollection,
  type CambridgeWritingLevel,
  type CambridgeWritingManifest,
} from './schema.ts'
import { CAMBRIDGE_WRITING_GENERATED_TESTS } from './generatedData.ts'
import ketReadingBook4Test2 from '../../../data/reading-ket-a2-book4-test2.json'

const ketA2Book4Test2 = ketReadingBook4Test2 as {
  id: string
  parts: Array<{
    id: string
    partNumber: number
    passage: Array<{ text?: string; imageUrl?: string }>
    questionGroups?: Array<{
      instruction?: string
      questions?: Array<{ prompt: string; minWords?: number }>
    }>
  }>
}

const a2Part6 = ketA2Book4Test2.parts.find((part) => part.partNumber === 6)!
const a2Part7 = ketA2Book4Test2.parts.find((part) => part.partNumber === 7)!

const collections = [
  {
    level: 'a2',
    examName: 'KET',
    title: 'KET · A2 Writing Seed Collection',
    testCount: 1,
    tests: [
      {
        id: 'ket-a2-book4-test2',
        level: 'a2',
        testNumber: 1,
        title: 'KET A2 Writing · Book 4 · Test 2',
        sourceFile: 'packages/catalog/data/reading-ket-a2-book4-test2.json',
        status: 'published',
        version: 1,
        tasks: [
          {
            id: 'ket-a2-book4-test2-task-31',
            partNumber: 6,
            taskNumber: 31,
            title: 'Question 31',
            genre: 'email',
            instruction: a2Part6.questionGroups?.[0]?.instruction ?? 'Write 25 words or more.',
            promptText: a2Part6.passage.map((block) => block.text ?? '').filter(Boolean).join('\n\n'),
            wordLimit: {
              min: a2Part6.questionGroups?.[0]?.questions?.[0]?.minWords ?? 25,
              displayText: a2Part6.questionGroups?.[0]?.instruction ?? '25 words or more',
            },
            metadata: {
              compulsory: true,
              sourceQuestionNumber: '31',
              ketSourcePartId: a2Part6.id,
              ketQuestionPrompt: a2Part6.questionGroups?.[0]?.questions?.[0]?.prompt ?? '',
            },
          },
          {
            id: 'ket-a2-book4-test2-task-32',
            partNumber: 7,
            taskNumber: 32,
            title: 'Question 32',
            genre: 'story',
            instruction: a2Part7.questionGroups?.[0]?.instruction ?? 'Write 35 words or more.',
            promptText: a2Part7.questionGroups?.[0]?.questions?.[0]?.prompt ?? '',
            wordLimit: {
              min: a2Part7.questionGroups?.[0]?.questions?.[0]?.minWords ?? 35,
              displayText: a2Part7.questionGroups?.[0]?.instruction ?? '35 words or more',
            },
            metadata: {
              compulsory: true,
              sourceQuestionNumber: '32',
              ketSourcePartId: a2Part7.id,
              ketQuestionPrompt: a2Part7.questionGroups?.[0]?.questions?.[0]?.prompt ?? '',
              ketImageUrls: a2Part7.passage.map((block) => block.imageUrl ?? '').filter(Boolean),
            },
          },
        ],
      },
    ],
  },
  {
    level: 'b1',
    examName: 'PET',
    title: 'PET · B1 Writing Seed Collection',
    testCount: 1,
    tests: [
      {
        id: 'b1-test-01',
        level: 'b1',
        testNumber: 1,
        title: 'PET B1 Digital Sample Test 1',
        sourceUrl: 'https://ceq.inspera.com/player/?assessmentRunId=146726796&context=exam#/section/4128591741313/question/143865262',
        sourceFile: 'docs/research/ceq.inspera.com/writing/b1.questions.json',
        status: 'published',
        version: 1,
        tasks: [
          {
            id: 'b1-test-01-task-01',
            partNumber: 1,
            taskNumber: 1,
            title: 'Question 1',
            genre: 'email',
            instruction: 'You must answer this question. Write your answer in about 100 words.',
            promptText: [
              'Read this email from your English-speaking friend Sandy and the notes you have made.',
              'Write your email to Sandy using all the notes.',
            ].join('\n\n'),
            promptBlocks: [
              { id: 'b1-test-01-task-01-lead', type: 'paragraph', text: 'Read this email from your English-speaking friend Sandy and the notes you have made.' },
              { id: 'b1-test-01-task-01-email', type: 'email', from: 'Sandy', subject: 'Your visit!', greeting: 'Hi,', paragraphs: ["I'm so excited that you're coming to stay with me for a week!", "On your first evening here, there's a rock concert in our town. Would you like to go to the concert or would you prefer us to relax at home?", 'Also, shall we go climbing in the mountains while you\'re here?', 'Let me know if you have any questions.'], closing: 'See you soon', sender: 'Sandy' },
              { id: 'b1-test-01-task-01-notes', type: 'panel', variant: 'notes', listItems: ['Me too!', 'Say which I prefer', 'No, because ...', 'Ask Sandy ...'] },
              { id: 'b1-test-01-task-01-final', type: 'final-instruction', text: 'Write your email to Sandy using all the notes.' },
            ],
            presentation: { template: 'email' },
            wordLimit: { min: 100, max: 100, displayText: 'about 100 words' },
            metadata: { compulsory: true, sourceQuestionNumber: '1', noteParagraphIndexes: [0, 1, 2, 3] },
          },
          {
            id: 'b1-test-01-task-02',
            partNumber: 2,
            taskNumber: 2,
            title: 'Question 2',
            genre: 'article',
            instruction: 'Answer one of these questions. Write your answer in about 100 words.',
            promptText: [
              'You see this notice on an English-language website.',
              'Articles wanted',
              'FILMS',
              'What kind of films do you enjoy?',
              'Do you prefer watching them at the cinema or at home? Why?',
              'Write an article answering these questions and we will put it on our website!',
              'Write your article.',
            ].join('\n'),
            promptBlocks: [
              { id: 'b1-test-01-task-02-lead', type: 'paragraph', text: 'You see this notice on an English-language website.' },
              { id: 'b1-test-01-task-02-announcement', type: 'panel', variant: 'announcement', heading: 'Articles wanted', paragraphs: ['FILMS', 'What kind of films do you enjoy?', 'Do you prefer watching them at the cinema or at home? Why?', 'Write an article answering these questions and we will put it on our website!'] },
              { id: 'b1-test-01-task-02-final', type: 'final-instruction', text: 'Write your article.' },
            ],
            presentation: { template: 'announcement' },
            wordLimit: { min: 100, max: 100, displayText: 'about 100 words' },
            metadata: { compulsory: false, sourceQuestionNumber: '2' },
          },
          {
            id: 'b1-test-01-task-03',
            partNumber: 2,
            taskNumber: 3,
            title: 'Question 3',
            genre: 'story',
            instruction: 'Answer one of these questions. Write your answer in about 100 words.',
            promptText: [
              'Your English teacher has asked you to write a story.',
              'Your story must begin with this sentence.',
              'As the plane flew lower, Lou saw the golden beaches of the island below.',
              'Write your story.',
            ].join('\n'),
            promptBlocks: [
              { id: 'b1-test-01-task-03-lead', type: 'paragraph', text: 'Your English teacher has asked you to write a story.' },
              { id: 'b1-test-01-task-03-source', type: 'source-text', label: 'Your story must begin with this sentence', text: 'As the plane flew lower, Lou saw the golden beaches of the island below.' },
              { id: 'b1-test-01-task-03-final', type: 'final-instruction', text: 'Write your story.' },
            ],
            presentation: { template: 'plain' },
            wordLimit: { min: 100, max: 100, displayText: 'about 100 words' },
            metadata: { compulsory: false, sourceQuestionNumber: '3' },
          },
        ],
      },
    ],
  },
  {
    level: 'b2',
    examName: 'FCE',
    title: 'FCE · B2 Writing Seed Collection',
    testCount: 1,
    tests: [
      {
        id: 'b2-test-01',
        level: 'b2',
        testNumber: 1,
        title: 'FCE B2 Digital Sample Test 1',
        sourceUrl: 'https://ceq.inspera.com/player/?assessmentRunId=146732614&context=exam#/section/4060115584647/question/143372237',
        sourceFile: 'docs/research/ceq.inspera.com/writing/b2.questions.json',
        status: 'published',
        version: 1,
        tasks: [
          {
            id: 'b2-test-01-task-01',
            partNumber: 1,
            taskNumber: 1,
            title: 'Question 1',
            genre: 'essay',
            instruction: 'You must answer this question. Write 140-190 words in an appropriate style.',
            promptText: [
              'In your English class you have been talking about the environment. Now, your English teacher has asked you to write an essay.',
              'Write an essay using all the notes and giving reasons for your point of view.',
            ].join('\n\n'),
            promptBlocks: [
              { id: 'b2-q1-p1', type: 'paragraph', text: 'In your English class you have been talking about the environment. Now, your English teacher has asked you to write an essay.' },
              { id: 'b2-q1-p2', type: 'paragraph', text: 'Write an essay using all the notes and giving reasons for your point of view.' },
              {
                id: 'b2-q1-notes',
                type: 'panel',
                variant: 'notes',
                paragraphs: ['Every country in the world has problems with pollution and damage to the environment. Do you think these problems can be solved?'],
                heading: 'Notes',
                listItems: ['transport', 'rivers and seas', '......................... (your own idea)'],
              },
            ],
            presentation: { template: 'essay-notes' },
            wordLimit: { min: 140, max: 190, displayText: '140-190 words' },
            metadata: { compulsory: true, sourceQuestionNumber: '1' },
          },
          {
            id: 'b2-test-01-task-02',
            partNumber: 2,
            taskNumber: 2,
            title: 'Question 2',
            genre: 'review',
            instruction: 'Answer one of these questions. Write 140-190 words in an appropriate style.',
            promptText: 'You see this announcement in your college English-language magazine.',
            promptBlocks: [
              { id: 'b2-q2-p1', type: 'paragraph', text: 'You see this announcement in your college English-language magazine.' },
              {
                id: 'b2-q2-announcement',
                type: 'panel',
                variant: 'announcement',
                heading: 'Book reviews wanted',
                paragraphs: [
                  'Have you read a book in which the main character behaved in a surprising way?',
                  'Write us a review of the book, explaining what the main character did and why it was surprising.',
                  'Tell us whether or not you would recommend this book to other people.',
                ],
                footer: 'The best reviews will be published in the magazine.',
              },
              { id: 'b2-q2-final', type: 'final-instruction', text: 'Write your review.' },
            ],
            presentation: { template: 'announcement', selectionRequired: 1 },
            wordLimit: { min: 140, max: 190, displayText: '140-190 words' },
            metadata: { compulsory: false, sourceQuestionNumber: '2' },
          },
          {
            id: 'b2-test-01-task-03',
            partNumber: 2,
            taskNumber: 3,
            title: 'Question 3',
            genre: 'article',
            instruction: 'Answer one of these questions. Write 140-190 words in an appropriate style.',
            promptText: 'You see this announcement on an English-language website.',
            promptBlocks: [
              { id: 'b2-q3-p1', type: 'paragraph', text: 'You see this announcement on an English-language website.' },
              {
                id: 'b2-q3-announcement',
                type: 'panel',
                variant: 'announcement',
                heading: 'Articles wanted',
                paragraphs: [
                  'The most useful thing I have ever learned',
                  'What is the most useful thing you have learned?',
                  'Who did you learn it from? Why is it useful?',
                  'Write us an article answering these questions.',
                ],
                footer: 'We will publish the best articles on our website.',
              },
              { id: 'b2-q3-final', type: 'final-instruction', text: 'Write your article.' },
            ],
            presentation: { template: 'announcement', selectionRequired: 1 },
            wordLimit: { min: 140, max: 190, displayText: '140-190 words' },
            metadata: { compulsory: false, sourceQuestionNumber: '3' },
          },
          {
            id: 'b2-test-01-task-04',
            partNumber: 2,
            taskNumber: 4,
            title: 'Question 4',
            genre: 'email',
            instruction: 'Answer one of these questions. Write 140-190 words in an appropriate style.',
            promptText: 'You have received this email from your English-speaking friend David.',
            promptBlocks: [
              { id: 'b2-q4-p1', type: 'paragraph', text: 'You have received this email from your English-speaking friend David.' },
              {
                id: 'b2-q4-email',
                type: 'email',
                from: 'David',
                subject: 'touring holiday',
                paragraphs: [
                  'Some college friends of mine are visiting your area soon for a week\'s touring holiday.',
                  'They would like to travel around and learn about your local area and its history.',
                  'Can you tell me about some of the places they could visit? What\'s the best way to travel around - car, bike or coach?',
                ],
                closing: 'Thanks,',
                sender: 'David',
              },
              { id: 'b2-q4-final', type: 'final-instruction', text: 'Write your email.' },
            ],
            presentation: { template: 'email', selectionRequired: 1 },
            wordLimit: { min: 140, max: 190, displayText: '140-190 words' },
            metadata: { compulsory: false, sourceQuestionNumber: '4' },
          },
        ],
      },
    ],
  },
  {
    level: 'c1',
    examName: 'CAE',
    title: 'CAE · C1 Writing Seed Collection',
    testCount: 1,
    tests: [
      {
        id: 'c1-test-01',
        level: 'c1',
        testNumber: 1,
        title: 'CAE C1 Digital Sample Test 2',
        sourceUrl: 'https://ceq.inspera.com/player/?assessmentRunId=415313797&context=exam#/section/7937623297746/question/406033127/scorableItem/1',
        sourceFile: 'docs/research/ceq.inspera.com/writing/c1.questions.json',
        status: 'published',
        version: 1,
        tasks: [
          {
            id: 'c1-test-01-task-01',
            partNumber: 1,
            taskNumber: 1,
            title: 'Question 1',
            genre: 'essay',
            instruction: 'You must answer this question. Write 220-260 words in an appropriate style.',
            promptText: 'Your class has listened to a radio discussion programme about facilities which should receive money from local authorities. You have made the notes below:',
            promptBlocks: [
              { id: 'c1-q1-p1', type: 'paragraph', text: 'Your class has listened to a radio discussion programme about facilities which should receive money from local authorities. You have made the notes below:' },
              {
                id: 'c1-q1-notes',
                type: 'panel',
                variant: 'notes',
                heading: 'Which facilities should receive money from local authorities?',
                listItems: ['museums', 'sports centres', 'public gardens'],
              },
              {
                id: 'c1-q1-opinions',
                type: 'panel',
                variant: 'opinions',
                heading: 'Some opinions expressed in the discussion:',
                paragraphs: [
                  '"Museums aren\'t popular with everybody!"',
                  '"Sports centres mean healthier people."',
                  '"A town needs green spaces - parks are great for everybody."',
                ],
              },
              { id: 'c1-q1-p2', type: 'paragraph', text: 'Write an essay for your tutor discussing two of the facilities in your notes. You should explain which facility it is more important for your local authorities to give money to, giving reasons in support of your answer.' },
              { id: 'c1-q1-p3', type: 'paragraph', text: 'You may, if you wish, make use of the opinions expressed in the discussion, but you should use your own words as far as possible.' },
            ],
            presentation: { template: 'essay-notes-opinions' },
            wordLimit: { min: 220, max: 260, displayText: '220-260 words' },
            metadata: { compulsory: true, sourceQuestionNumber: '1' },
          },
          {
            id: 'c1-test-01-task-02',
            partNumber: 2,
            taskNumber: 2,
            title: 'Question 2',
            genre: 'proposal',
            instruction: 'Answer one of these questions. Write 220-260 words in an appropriate style.',
            promptText: [
              'The international college where you study would like to organise a series of events to encourage student interaction with the local community.',
              'It has invited students to suggest ideas for this.',
              'You decide to send in a proposal in which you outline the kind of events that you think would be most effective,',
              'how to get the widest number of students involved, and what you think the main benefits of these events will be,',
              'to both the students and the local community.',
              'Write your proposal.',
            ].join('\n'),
            presentation: { template: 'plain', selectionRequired: 1 },
            wordLimit: { min: 220, max: 260, displayText: '220-260 words' },
            metadata: { compulsory: false, sourceQuestionNumber: '2' },
          },
          {
            id: 'c1-test-01-task-03',
            partNumber: 2,
            taskNumber: 3,
            title: 'Question 3',
            genre: 'email',
            instruction: 'Answer one of these questions. Write 220-260 words in an appropriate style.',
            promptText: [
              'You recently attended a course which did not provide everything that was promised in its publicity.',
              'Write an email to the organizer of the course.',
              'In your email you should evaluate the course overall, and complain about the inaccuracy of the publicity material, justifying your opinions.',
              'You should also recommend the action that you believe the course organizer should take.',
              'Write your email.',
            ].join('\n'),
            presentation: { template: 'plain', selectionRequired: 1 },
            wordLimit: { min: 220, max: 260, displayText: '220-260 words' },
            metadata: { compulsory: false, sourceQuestionNumber: '3' },
          },
          {
            id: 'c1-test-01-task-04',
            partNumber: 2,
            taskNumber: 4,
            title: 'Question 4',
            genre: 'review',
            instruction: 'Answer one of these questions. Write 220-260 words in an appropriate style.',
            promptText: 'You see this announcement on an English-language lifestyle website:',
            promptBlocks: [
              { id: 'c1-q4-p1', type: 'paragraph', text: 'You see this announcement on an English-language lifestyle website:' },
              {
                id: 'c1-q4-announcement',
                type: 'panel',
                variant: 'announcement',
                heading: 'Digital detox',
                paragraphs: [
                  'Have you ever done a digital detox where you intentionally did not use devices like your smartphone or laptop for a period of time?',
                  'If so, we would love to receive a review about your experience.',
                  'In your review, briefly say why you decided to do this, evaluate how worthwhile it was for you and explain whether you would recommend this to others.',
                ],
              },
              { id: 'c1-q4-final', type: 'final-instruction', text: 'Write your review.' },
            ],
            presentation: { template: 'announcement', selectionRequired: 1 },
            wordLimit: { min: 220, max: 260, displayText: '220-260 words' },
            metadata: { compulsory: false, sourceQuestionNumber: '4' },
          },
        ],
      },
    ],
  },
  {
    level: 'c2',
    examName: 'CPE',
    title: 'CPE · C2 Writing Seed Collection',
    testCount: 1,
    tests: [
      {
        id: 'c2-test-01',
        level: 'c2',
        testNumber: 1,
        title: 'CPE C2 Digital Sample Test 1',
        sourceUrl: 'https://ceq.inspera.com/player/?assessmentRunId=146745736&context=exam#/section/7185437720868/question/143372866/scorableItem/1',
        sourceFile: 'docs/research/ceq.inspera.com/writing/c2.questions.json',
        status: 'published',
        version: 1,
        tasks: [
          {
            id: 'c2-test-01-task-01',
            partNumber: 1,
            taskNumber: 1,
            title: 'Question 1',
            genre: 'essay',
            instruction: 'You must answer this question. Write an essay summarising and evaluating the key points from both texts in 240-280 words.',
            promptText: 'Use your own words throughout as far as possible, and include your own ideas in your answers.',
            promptBlocks: [
              {
                id: 'c2-q1-text1',
                type: 'source-text',
                label: 'Text 1',
                title: 'Shifting sands: behavioural change',
                text: 'Nowadays, in some cultures there may often be confusion between generations about what is acceptable behaviour in certain situations. Older people sometimes complain, for example, about the real or imagined rudeness of others, such as in the use of electronic devices in public places. However, the younger generation do not regard electronic communication as intrusive, but rather as fundamental to their way of life. Only increased mutual understanding is likely to resolve potential conflict or confusion in any society. In this case, as in all others, it pays to be aware of other people\'s points of view.',
              },
              {
                id: 'c2-q1-text2',
                type: 'source-text',
                label: 'Text 2',
                title: 'Follow my leader?',
                text: 'Should we always aim to do what society expects of us? No, what society needs is individuality. Worrying about what other people think inhibits enthusiasm and creativity. Nothing new is ever achieved by conforming to expected social norms. This is not only true for society\'s innovators: everybody needs a strong sense of their own worth as an individual. This is essential for psychological well-being and the ability to function effectively in one\'s personal and professional life. Paying too much attention to society\'s conventions can be counter-productive in these and other ways.',
              },
              { id: 'c2-q1-final', type: 'final-instruction', text: 'Write your essay.' },
            ],
            presentation: {
              template: 'source-texts',
              headerInstruction: 'You must answer this question. Write an essay summarising and evaluating the key points from both texts in 240-280 words. Use your own words throughout as far as possible, and include your own ideas in your answers.',
            },
            wordLimit: { min: 240, max: 280, displayText: '240-280 words' },
            metadata: { compulsory: true, sourceQuestionNumber: '1' },
          },
          {
            id: 'c2-test-01-task-02',
            partNumber: 2,
            taskNumber: 2,
            title: 'Question 2',
            genre: 'review',
            instruction: 'Answer one of these questions. Write 280-320 words in an appropriate style.',
            promptText: [
              'A literary magazine is running a series of reviews of books that people enjoyed reading as a child and would recommend for children today.',
              'You decide to send in a review in which you describe a book you enjoyed and the attractions it had for you as a child.',
              'You should also explain why you feel it remains relevant for children today.',
              'Write your review.',
            ].join('\n'),
            presentation: { template: 'plain', selectionRequired: 1 },
            wordLimit: { min: 280, max: 320, displayText: '280-320 words' },
            metadata: { compulsory: false, sourceQuestionNumber: '2' },
          },
          {
            id: 'c2-test-01-task-03',
            partNumber: 2,
            taskNumber: 3,
            title: 'Question 3',
            genre: 'report',
            instruction: 'Answer one of these questions. Write 280-320 words in an appropriate style.',
            promptText: [
              'A jobs fair was recently held in your town for international organisations and companies to promote careers available for young people.',
              'You have been asked to write a report of the jobs fair for your college website.',
              'You should briefly describe the event and identify two or three promotions of particular interest and relevance.',
              'You should also evaluate the extent to which such events can open young people\'s minds to new challenges and career opportunities.',
              'Write your report.',
            ].join('\n'),
            presentation: { template: 'plain', selectionRequired: 1 },
            wordLimit: { min: 280, max: 320, displayText: '280-320 words' },
            metadata: { compulsory: false, sourceQuestionNumber: '3' },
          },
          {
            id: 'c2-test-01-task-04',
            partNumber: 2,
            taskNumber: 4,
            title: 'Question 4',
            genre: 'article',
            instruction: 'Answer one of these questions. Write 280-320 words in an appropriate style.',
            promptText: [
              'An international travel magazine is running a series of articles on alternatives to travelling by plane.',
              'The magazine has invited readers to send in articles briefly describing a memorable long-distance train or bus journey they have made.',
              'The article should explain the advantages of travelling a long distance by train or bus and consider whether in general travelling to your destination more slowly may result in a more satisfying travel experience.',
              'Write your article.',
            ].join('\n'),
            presentation: { template: 'plain', selectionRequired: 1 },
            wordLimit: { min: 280, max: 320, displayText: '280-320 words' },
            metadata: { compulsory: false, sourceQuestionNumber: '4' },
          },
        ],
      },
    ],
  },
] satisfies CambridgeWritingCollection[]

for (const collection of collections) {
  if (collection.level === 'a2') continue
  const generated = CAMBRIDGE_WRITING_GENERATED_TESTS[collection.level]
  const seenNumbers = new Set(collection.tests.map(test => test.testNumber))
  for (const test of generated) {
    if (seenNumbers.has(test.testNumber)) {
      throw new Error(`Duplicate Cambridge Writing test number for ${collection.level}: ${test.testNumber}`)
    }
    collection.tests.push(test as never)
    seenNumbers.add(test.testNumber)
  }
  collection.tests.sort((left, right) => left.testNumber - right.testNumber)
  collection.testCount = collection.tests.length
}

export const CAMBRIDGE_WRITING_COLLECTIONS = collections.map((collection) =>
  CambridgeWritingCollectionSchema.parse(collection),
)

export const CAMBRIDGE_WRITING_COLLECTION_MAP = Object.fromEntries(
  CAMBRIDGE_WRITING_COLLECTIONS.map((collection) => [collection.level, collection]),
) as Record<CambridgeWritingLevel, CambridgeWritingCollection>

export const CAMBRIDGE_WRITING_MANIFEST = CambridgeWritingManifestSchema.parse(Object.fromEntries(
  CAMBRIDGE_WRITING_COLLECTIONS.map(collection => [collection.level, {
    examName: collection.examName,
    displayName: `${collection.examName} · ${collection.level.toUpperCase()}`,
    testCount: collection.tests.length,
    taskCount: collection.tests.reduce((sum, test) => sum + test.tasks.length, 0),
    genres: [...new Set(collection.tests.flatMap(test => test.tasks.map(task => task.genre)))],
  }]),
)) satisfies CambridgeWritingManifest
