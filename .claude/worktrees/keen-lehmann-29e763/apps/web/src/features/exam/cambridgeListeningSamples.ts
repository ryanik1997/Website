import type { CambridgeLevelSlug } from './cambridgeExamLevels'
import {
  cambridgeListeningBandHint,
} from './cambridgeExamFormats'
import {
  countListeningQuestions,
  listeningGap,
  listeningMc,
  listeningPartFromGaps,
  listeningPartFromMc,
} from './cambridgeSampleBuilders'
import { PET_LISTENING_DURATION_MINUTES } from './listeningPetPartLayout'
import type { ListeningExam, ListeningPart, ListeningQuestion, ListeningQuestionOption } from './listeningExamData'

type McTuple = [string, [string, string, string], 'A' | 'B' | 'C', string]

function listeningMcOptions(
  examType: string,
  partNum: number,
  num: number,
  prompt: string,
  labels: string[],
  answer: string,
  explanation: string,
): ListeningQuestion {
  const ids = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  return {
    id: `${examType}-l-p${partNum}-q${num}`,
    number: num,
    type: 'multiple-choice',
    prompt,
    options: labels.map((label, i) => ({ id: ids[i] ?? `O${i + 1}`, label })),
    answer,
    explanation,
    ttsText: prompt,
  }
}

function listeningMatching(
  examType: string,
  partNum: number,
  num: number,
  prompt: string,
  options: ListeningQuestionOption[],
  answer: string,
  explanation: string,
): ListeningQuestion {
  return {
    id: `${examType}-l-p${partNum}-q${num}`,
    number: num,
    type: 'matching',
    prompt,
    options,
    answer,
    explanation,
    ttsText: prompt,
  }
}

function buildA2Listening(): ListeningExam {
  const examId = 'ket-listening-sample-01'
  const parts: ListeningPart[] = [
    listeningPartFromMc(examId, 'ket', 1, 1, [
      ['Where will Claire meet Alex?', ['In the classroom', 'In the corridor', 'In the café'], 'B', 'They agree to meet in the corridor outside Room 12.'],
      ['What will the man buy for the party?', ['Drinks', 'Cakes', 'Balloons'], 'A', 'He will get juice and water for everyone.'],
      ['How will they get to the museum?', ['By bus', 'By train', 'On foot'], 'C', 'The museum is a ten-minute walk away.'],
      ['Which sport does the boy want to try?', ['Tennis', 'Swimming', 'Cycling'], 'B', 'He has never tried swimming in the sea.'],
      ['What time does the shop close on Saturdays?', ['5 p.m.', '6 p.m.', '7 p.m.'], 'B', 'The shop shuts at six on Saturdays.'],
    ], 'For each question, choose the correct answer A, B or C.', 'Part 1. Listen and choose the correct answer.', 'picture-mc'),
    listeningPartFromMc(examId, 'ket', 2, 6, [
      ['Why is the woman late?', ['Her bus broke down', 'She missed her train', 'There was heavy traffic'], 'C', 'Roads were very busy this morning.'],
      ['What does the girl need for school tomorrow?', ['A calculator', 'A science book', 'Sports shoes'], 'B', 'She must bring her science book for the test.'],
      ['Who is the man going to visit?', ['His cousin', 'His grandmother', 'His teacher'], 'B', 'He is taking the train to see his grandmother.'],
      ['What is the weather like now?', ['Rainy', 'Windy', 'Sunny'], 'A', 'The speaker says it has just started raining.'],
      ['Where are the keys?', ['On the kitchen table', 'In the coat pocket', 'Under the sofa'], 'A', 'They were left on the kitchen table.'],
    ], 'Choose the correct answer A, B or C.', 'Part 2. You will hear five short conversations.'),
    listeningPartFromMc(examId, 'ket', 3, 11, [
      ['The concert tickets cost', ['£12', '£15', '£18'], 'B', 'Each ticket is fifteen pounds.'],
      ['The train leaves at', ['9:15', '9:45', '10:15'], 'C', 'The next train departs at ten fifteen.'],
      ['The café is on', ['King Street', 'Park Road', 'Mill Lane'], 'A', 'It is on King Street next to the bank.'],
      ['The homework is due on', ['Monday', 'Wednesday', 'Friday'], 'C', 'The teacher wants it on Friday morning.'],
      ['The film starts at', ['6:30', '7:00', '7:30'], 'B', 'Doors open at seven o\'clock.'],
    ], 'Choose the correct answer A, B or C.', 'Part 3. You will hear people talking about plans.'),
    listeningPartFromMc(examId, 'ket', 4, 16, [
      ['The best gift for Tom is', ['a book', 'a game', 'a T-shirt'], 'A', 'He loves reading adventure stories.'],
      ['The library opens at', ['8 a.m.', '9 a.m.', '10 a.m.'], 'B', 'It opens at nine on weekdays.'],
      ['The woman\'s job is', ['a nurse', 'a teacher', 'a chef'], 'C', 'She works in a restaurant kitchen.'],
      ['They will meet at the', ['bus station', 'swimming pool', 'sports centre'], 'C', 'The sports centre is easy to find.'],
      ['The cat is called', ['Milo', 'Oscar', 'Luna'], 'A', 'The neighbour\'s cat is named Milo.'],
    ], 'Choose the correct answer A, B or C.', 'Part 4. You will hear longer conversations.'),
    listeningPartFromMc(examId, 'ket', 5, 21, [
      ['The tour lasts', ['one hour', 'two hours', 'three hours'], 'B', 'The guided tour takes two hours.'],
      ['Visitors should bring', ['a map', 'a camera', 'an umbrella'], 'B', 'Photos are allowed in most rooms.'],
      ['Lunch is served at', ['12:00', '12:30', '1:00'], 'C', 'Lunch begins at one o\'clock.'],
      ['The group will visit the', ['garden first', 'museum shop first', 'café first'], 'A', 'The guide starts in the garden.'],
      ['Tickets can be bought', ['online only', 'at the door', 'by phone only'], 'B', 'You can also pay at the entrance.'],
    ], 'Choose the correct answer A, B or C.', 'Part 5. You will hear a guide talking to a group.'),
  ]
  return {
    id: examId,
    title: 'A2 KET Sample Test — Listening',
    durationMinutes: 25,
    bandHint: cambridgeListeningBandHint('a2', countListeningQuestions(parts)),
    examType: 'ket',
    examMode: 'practice',
    parts,
  }
}

function buildPetListening(): ListeningExam {
  const examId = 'pet-listening-sample-01'
  const parts: ListeningPart[] = [
    {
      id: `${examId}-part-1`,
      partNumber: 1,
      rangeLabel: 'Questions 1–7',
      instruction: 'For each question, choose the correct answer.',
      ttsText: 'Part 1. For each question, choose the correct answer.',
      questions: [
        listeningMc('pet', 1, 1, 'What is the man doing?', ['Waiting for a bus', 'Buying a ticket', 'Reading a map'], 'B', 'He is at the ticket office.', 'picture-mc'),
        listeningMc('pet', 1, 2, 'Where are the speakers?', ['In a café', 'At school', 'In a shop'], 'A', 'They are discussing drinks in a café.', 'picture-mc'),
        listeningMc('pet', 1, 3, 'What does the woman need?', ['A pen', 'Her phone', 'An umbrella'], 'C', 'It has started to rain.', 'picture-mc'),
        listeningMc('pet', 1, 4, 'How will they travel?', ['By car', 'By train', 'On foot'], 'B', 'The train leaves in ten minutes.', 'picture-mc'),
        listeningMc('pet', 1, 5, 'What time is it?', ['Half past two', 'Quarter to three', 'Three o\'clock'], 'A', 'The clock shows two thirty.', 'picture-mc'),
        listeningMc('pet', 1, 6, 'What is the boy holding?', ['A ball', 'A book', 'A bag'], 'C', 'He is carrying his sports bag.', 'picture-mc'),
        listeningMc('pet', 1, 7, 'Where should the girl go next?', ['To the library', 'To the sports hall', 'To the office'], 'B', 'Her coach is waiting in the sports hall.', 'picture-mc'),
      ],
    },
    {
      id: `${examId}-part-2`,
      partNumber: 2,
      rangeLabel: 'Questions 8–13',
      instruction: 'For each question, choose the correct answer.',
      ttsText: 'Part 2. For each question, choose the correct answer.',
      questions: [
        listeningMc('pet', 2, 8, 'What does the girl say about it?', ['The staff are helpful.', 'It only has the latest fashions.', 'Prices are reduced at the moment.'], 'A', 'She says the assistants were friendly.', 'multiple-choice', { context: 'You will hear two friends talking about a new clothes shop.' }),
        listeningMc('pet', 2, 9, 'They think the site would be better if', ['its information was up to date.', 'it was easier to buy concert tickets.', 'the band members answered messages.'], 'A', 'Some tour dates on the site are wrong.', 'multiple-choice', { context: 'You will hear two friends talking about a pop band\'s website.' }),
        listeningMc('pet', 2, 10, 'How does she feel about it?', ['upset that the prize isn\'t valuable', 'excited that the judges liked her picture', 'disappointed that she can\'t use the prize'], 'B', 'She is thrilled the judges chose her work.', 'multiple-choice', { context: 'You will hear a woman telling a friend about an art competition she\'s won.' }),
        listeningMc('pet', 2, 11, 'The girl thinks that her flatmate', ['is too untidy.', 'talks too much.', 'plays music too loud.'], 'C', 'She cannot study because of the noise.', 'multiple-choice', { context: 'You will hear two friends talking about the girl\'s flatmate.' }),
        listeningMc('pet', 2, 12, 'What does the man decide to do?', ['leave work early', 'take a different route', 'call a taxi'], 'B', 'Roadworks mean his usual road is closed.', 'multiple-choice', { context: 'You will hear a man telling a colleague about his journey to work.' }),
        listeningMc('pet', 2, 13, 'What do they agree about?', ['the topic is too difficult', 'they need more time', 'the teacher will help them'], 'B', 'They both think the deadline is too soon.', 'multiple-choice', { context: 'You will hear two students discussing a homework project.' }),
      ],
    },
    {
      id: `${examId}-part-3`,
      partNumber: 3,
      rangeLabel: 'Questions 14–19',
      instruction: 'For each question, write the correct answer in the gap. Write one or two words or a number or a date or a time.',
      audioIntro: 'You will hear a radio presenter called Anita talking about her holiday in Cuba.',
      passageTitle: 'ANITA\'S HOLIDAY IN CUBA:',
      ttsText: 'Part 3. You will hear Anita talking about her holiday in Cuba.',
      questions: [
        listeningGap('pet', 3, 14, 'National Gardens attraction', 'fountain', 'The fountain attracted crowds in the gardens.', 2, { gapLead: 'In the National Gardens, the', gapTrail: 'was the thing that attracted most people.' }),
        listeningGap('pet', 3, 15, 'Swimming trip safety', 'sharks', 'Electronic armbands kept sharks away.', 2, { gapLead: 'On the swimming trip, electronic armbands kept the', gapTrail: 'away.' }),
        listeningGap('pet', 3, 16, 'Countryside accident', 'horse', 'She nearly fell off a horse in the countryside.', 2, { gapLead: 'On the day in the countryside, Anita almost fell off a', gapTrail: '.' }),
        listeningGap('pet', 3, 17, 'Capital city theatre', 'play', 'She saw a play in a theatre in the capital.', 2, { gapLead: 'In the capital city, Anita saw a', gapTrail: 'in a theatre.' }),
        listeningGap('pet', 3, 18, 'Farm product', 'sugar', 'The farm produced sugar.', 2, { gapLead: 'Anita enjoyed visiting a farm where', gapTrail: 'is produced.' }),
        listeningGap('pet', 3, 19, 'Gifts', 'jewellery', 'She bought jewellery as gifts.', 2, { gapLead: 'Anita bought some', gapTrail: 'as gifts.' }),
      ],
    },
    {
      id: `${examId}-part-4`,
      partNumber: 4,
      rangeLabel: 'Questions 20–25',
      instruction: 'For each question, choose the correct answer.',
      audioIntro: 'You will hear an interview with a woman called Vicky Prince, a champion swimmer who now works as a swimming coach.',
      ttsText: 'Part 4. You will hear an interview with Vicky Prince.',
      questions: [
        listeningMc('pet', 4, 20, 'Vicky first went in for competitions because', ['she had joined a swimming club.', 'her parents were keen on swimming.', 'her swimming teacher encouraged her.'], 'C', 'Her teacher suggested she should enter races.', 'multiple-choice'),
        listeningMc('pet', 4, 21, 'As a teenager, Vicky\'s training involved', ['exercising on land as well as in the water.', 'going without meals during the day.', 'travelling to a pool once a day.'], 'A', 'She did gym work as well as pool sessions.', 'multiple-choice'),
        listeningMc('pet', 4, 22, 'What did Vicky find hard about her training programme?', ['She couldn\'t go on school trips.', 'She lost some of her friends.', 'She missed lots of parties.'], 'C', 'She had to miss parties because of early training.', 'multiple-choice'),
        listeningMc('pet', 4, 23, 'What helped Vicky to do well in the national finals?', ['She was not expected to win.', 'She trained harder than usual.', 'She wanted to take a cup home.'], 'B', 'She put in extra hours before the finals.', 'multiple-choice'),
        listeningMc('pet', 4, 24, 'As a swimming coach, Vicky thinks she\'s best at teaching people', ['to deal with failure.', 'to improve their technique.', 'to get swimming qualifications.'], 'A', 'She helps swimmers learn from mistakes.', 'multiple-choice'),
        listeningMc('pet', 4, 25, 'Why has Vicky started doing long-distance swimming?', ['She needed to get fit again.', 'She thought it would be fun.', 'She wanted to do some travelling.'], 'C', 'She can combine swimming with visiting new places.', 'multiple-choice'),
      ],
    },
  ]
  return {
    id: examId,
    title: 'B1 PET Sample Test — Listening',
    durationMinutes: PET_LISTENING_DURATION_MINUTES,
    bandHint: cambridgeListeningBandHint('b1', countListeningQuestions(parts)),
    examType: 'pet',
    examMode: 'practice',
    parts,
  }
}

function multiPartListening(
  slug: CambridgeLevelSlug,
  examType: 'fce' | 'cae' | 'cpe',
  examId: string,
  title: string,
): ListeningExam {
  const p1 = [
    ['You hear a woman talking to a colleague. Why is she annoyed?', ['A meeting was cancelled without notice', 'Her report was lost', 'The printer is broken'], 'A', 'Nobody told her the client meeting would not take place.'],
    ['You hear a man on the radio. What is he doing?', ['Reviewing a film', 'Advertising a festival', 'Interviewing a musician'], 'B', 'He describes dates and ticket prices for a festival.'],
    ['You hear two friends discussing a holiday. They agree that', ['the hotel was too expensive', 'they should have stayed longer', 'the weather was perfect'], 'B', 'A week was not enough.'],
    ['You hear a student asking for advice. He is worried about', ['his pronunciation', 'his presentation timing', 'his visa application'], 'B', 'His presentation may exceed the time limit.'],
    ['You hear a shop assistant talking. She is explaining', ['how to use a refund policy', 'why a product is discounted', 'when new stock arrives'], 'A', 'She explains how customers can return items.'],
    ['You hear a man leaving a voicemail. He wants to', ['reschedule a meeting', 'cancel an order', 'confirm a delivery address'], 'C', 'He asks someone to confirm the delivery address.'],
    ['You hear a woman talking about exercise. She believes', ['team sports are overrated', 'short daily walks are valuable', 'gyms are too crowded'], 'B', 'She walks thirty minutes every day.'],
  ] satisfies McTuple[]

  const parts: ListeningPart[] = [
    listeningPartFromMc(examId, examType, 1, 1, p1,
      'You will hear short extracts. Choose the best answer A, B or C.',
      `Part 1. ${examType.toUpperCase()} Listening — short extracts.`),
    listeningPartFromGaps(examId, examType, 2, 8, [
      ['Project started in:', '2019', 'The charity launched the scheme in 2019.'],
      ['Volunteers mainly help with:', 'food delivery', 'They deliver meals to elderly residents.'],
      ['Training session day:', 'saturday', 'New volunteers attend Saturday morning training.'],
      ['Minimum age:', '18', 'Volunteers must be at least eighteen.'],
      ['Team leader name:', 'helen ross', 'Helen Ross coordinates the volunteers.'],
      ['Weekly hours required:', 'four', 'Most volunteers work four hours a week.'],
      ['Main sponsor:', 'city council', 'The city council provides core funding.'],
      ['Contact email:', 'help@foodlink.org', 'Email help@foodlink.org for details.'],
    ], 'Complete the notes. Write NO MORE THAN TWO WORDS AND/OR A NUMBER.',
      'Part 2. You will hear a talk about a volunteer project.'),
    listeningPartFromMc(examId, examType, 3, 16, [
      ['The lecturer\'s main argument is that', ['technology isolates communities', 'local archives deserve funding', 'tourism damages historic sites'], 'B', 'She argues archives preserve community memory.'],
      ['Students must submit their outline by', ['Thursday', 'Friday', 'Monday'], 'B', 'Outlines are due on Friday at noon.'],
      ['The reading list is available', ['on the library website', 'at the bookshop', 'in the canteen'], 'A', 'All articles are on the library website.'],
      ['The next seminar will focus on', ['research ethics', 'public speaking', 'data visualisation'], 'A', 'Next week covers ethical research practice.'],
      ['The speaker recommends taking notes because', ['exam questions repeat lectures', 'it improves critical thinking', 'laptops are banned'], 'B', 'Note-taking helps students analyse ideas.'],
      ['Office hours are held in', ['Room 214', 'Room 302', 'the main hall'], 'A', 'She meets students in Room 214 on Thursdays.'],
      ['The assignment word limit is', ['1,500', '2,000', '2,500'], 'C', 'Essays must not exceed 2,500 words.'],
      ['Late submissions lose', ['ten percent', 'twenty percent', 'all marks'], 'A', 'Ten percent is deducted per day late.'],
    ], 'Choose the correct answer A, B or C.', 'Part 3. You will hear a university lecturer.'),
    listeningPartFromMc(examId, examType, 4, 24, [
      ['The speaker\'s primary concern is', ['data storage limits', 'language loss', 'urban noise pollution'], slug === 'c2' ? 'B' : 'C', slug === 'c2' ? 'Younger speakers shift to dominant languages.' : 'Noise affects health and learning.'],
      ['Evidence comes mainly from', ['laboratory experiments', 'long-term field studies', 'social media surveys'], 'B', 'Researchers collected data over fifteen years.'],
      ['One successful intervention involved', ['community radio', 'tax incentives', 'building taller walls'], 'A', 'A local radio station broadcasts in the minority language.'],
      ['Critics argue the policy', ['burdens small businesses', 'ignores rural areas', 'copies foreign models'], 'A', 'Small firms must pay for soundproofing.'],
      ['The speaker concludes that', ['further debate is pointless', 'balanced regulation is possible', 'technology will solve the issue'], 'B', 'She believes pragmatic rules can protect residents.'],
      ['The tone of the lecture is', ['cautiously optimistic', 'strongly dismissive', 'humorous'], 'A', 'She acknowledges problems but cites progress.'],
    ], 'Choose the correct answer A, B or C.', 'Part 4. You will hear an academic lecture.'),
  ]

  return {
    id: examId,
    title,
    durationMinutes: 40,
    bandHint: cambridgeListeningBandHint(slug, countListeningQuestions(parts)),
    examType,
    examMode: 'practice',
    parts,
  }
}

function buildCpeListening(): ListeningExam {
  const examId = 'cpe-listening-sample-01'
  const taskOneOptions: ListeningQuestionOption[] = [
    { id: 'A', label: "a friend's recommendation" },
    { id: 'B', label: "the company's good reputation" },
    { id: 'C', label: 'the convenience of the location' },
    { id: 'D', label: 'the chance to relate theory to practice' },
    { id: 'E', label: 'the opportunity to work outdoors' },
    { id: 'F', label: 'the international make-up of the company' },
    { id: 'G', label: 'the chance to travel' },
    { id: 'H', label: 'the opportunity to work with an expert' },
  ]
  const taskTwoOptions: ListeningQuestionOption[] = [
    { id: 'A', label: 'being given a lot of responsibility' },
    { id: 'B', label: 'making a future career decision' },
    { id: 'C', label: 'making life-long friends' },
    { id: 'D', label: 'attending high-level meetings' },
    { id: 'E', label: 'using cutting-edge technology' },
    { id: 'F', label: 'making useful contacts' },
    { id: 'G', label: 'being offered a permanent job' },
    { id: 'H', label: 'winning an award' },
  ]

  const parts: ListeningPart[] = [
    listeningPartFromMc(examId, 'cpe', 1, 1, [
      ['You hear a consultant in communication talking about business meetings.\n\nWhat is the consultant doing when he mentions mobile phones at meetings?', ['criticising the overuse of technology', "explaining how they can boost a person's image", 'warning against making them visible'], 'C', 'He warns that visible phones send the wrong signal.'],
      ['What advice does he give about talking at meetings?', ['Comment on all points made.', 'Avoid answering questions impulsively.', 'Offer strong closing contributions.'], 'B', 'He advises pausing before answering.'],
      ['You hear two colleagues discussing a training course.\n\nWhat do they agree about the course?', ['It was more practical than expected.', 'It should have been shorter.', 'It was aimed at the wrong audience.'], 'A', 'Both speakers found the course useful in practical terms.'],
      ['What does the woman imply about the trainer?', ['He encouraged too much discussion.', 'He adapted well to the group.', 'He lacked specialist knowledge.'], 'B', 'She says the trainer responded to the group effectively.'],
      ['You hear a writer talking about reviews.\n\nHow does she feel about negative reviews?', ['They can sometimes be valuable.', 'They rarely affect sales.', 'They are usually badly written.'], 'A', 'She says criticism can occasionally improve her work.'],
      ['What does she say about reading online comments?', ['She avoids them completely.', 'She reads them selectively.', 'She replies to factual errors.'], 'B', 'She checks comments only when they are likely to be useful.'],
    ], 'You will hear three different extracts. For each question, choose the correct answer. There are two questions for each extract.', 'Part 1. You will hear three different extracts.'),
    listeningPartFromGaps(examId, 'cpe', 2, 7, [
      ['The journalist comments that the ... made up the majority of the expedition team.', 'scientists', 'Scientists formed the largest group.'],
      ['To provide for the team, ... were grown in the jungle six months in advance.', 'vegetables', 'Food was prepared by growing vegetables early.'],
      ['An advance party, led by an expert on ..., went into the volcano crater before the rest of the team.', 'ropes', 'A specialist led the first group into the crater.'],
      ['The teeth of a ... found in the crater were unusual.', 'rat', 'The animal teeth were remarkable.'],
      ['Inside the volcano, butterflies the size of a ... were observed by the team.', 'plate', 'The butterflies were exceptionally large.'],
      ['A new species of caterpillar may be given a name based on the ... of a well-known politician.', 'hair', 'The caterpillar resembled the politician.'],
      ["Naturalist Steve Backshall's search for new species was concentrated around the ... inside the crater.", 'lake', 'The search centred on the crater lake.'],
      ["By using what's known as a ... the team was able to discover one of the world's largest rats.", 'camera trap', 'The rat was recorded with a camera trap.'],
      ['As part of the expedition, some members of the team tried to make a map of the ... on another island.', 'caves', 'They mapped caves on another island.'],
    ], 'You will hear a journalist reporting on a scientific expedition to a volcano in Papua New Guinea. For each question, write the correct answer in the gap. Write a word or short phrase.', 'Part 2. Scientific expedition report.'),
    {
      id: `${examId}-part-3`,
      partNumber: 3,
      rangeLabel: 'Questions 16–20',
      instruction: 'You will hear part of a discussion between two language experts, George Steadman and Angela Conti, who are talking about how advances in communication are affecting English usage. For each question, choose the correct answer.',
      ttsText: 'Part 3. You will hear a discussion between two language experts.',
      questions: [
        listeningMcOptions('cpe', 3, 16, 'What point is made about the effect of the internet on language?', ['It is making the standard written form of language obsolete.', 'It will radically alter the way grammar rules are followed.', 'It may have less serious consequences than feared.', 'It will bring about more changes than TV and radio have.'], 'C', 'The speaker suggests the impact may be less dramatic than expected.'),
        listeningMcOptions('cpe', 3, 17, 'When discussing the main criticism of text messaging, George reveals', ['his concern that there is insufficient research.', 'his understanding of the annoyance some people feel.', 'his certainty that the criticism is totally unfounded.', 'his doubt as to how widespread the criticism is.'], 'B', 'George accepts why some people are irritated by it.'),
        listeningMcOptions('cpe', 3, 18, 'What view is stated about abbreviations in texting?', ['They are mainly to be found in commercial messages.', 'Some are beginning to enter official documents.', 'Adults are just as much to blame for them as teenagers.', 'They are not as novel as many people imagine.'], 'D', 'The experts note older forms of abbreviation.'),
        listeningMcOptions('cpe', 3, 19, 'When discussing the new genre of text-poetry, both researchers agree that', ['it is unlikely to have lasting artistic value.', 'it shows how constraints can stimulate creativity.', 'it should be judged by traditional literary standards.', 'it has been exaggerated by the media.'], 'B', 'Both link the form to creative limits.'),
        listeningMcOptions('cpe', 3, 20, 'Angela and George both conclude that language change', ['should be monitored by schools.', 'is best understood through historical comparison.', 'is happening faster than ever before.', 'will reduce the importance of standard English.'], 'B', 'They compare current changes with earlier patterns.'),
      ],
    },
    {
      id: `${examId}-part-4`,
      partNumber: 4,
      rangeLabel: 'Questions 21–30',
      instruction: 'You will hear five short extracts in which students talk about doing an internship, professional work experience in a company. For Task 1, choose from the list what reason each speaker gives for choosing the internship. For Task 2, choose from the list what unexpected experience each speaker had during their internship. For each question, choose the correct answer. Complete both tasks.',
      ttsText: 'Part 4. You will hear five students talking about doing an internship.',
      matchingDualTask: true,
      taskOneInstruction: 'choose from the list what reason each speaker gives for choosing the internship.',
      taskTwoInstruction: 'choose from the list what unexpected experience each speaker had during their internship.',
      questions: [
        ...Array.from({ length: 5 }, (_, i) => listeningMatching('cpe', 4, 21 + i, `Speaker ${i + 1}`, taskOneOptions, ['D', 'B', 'A', 'H', 'F'][i], 'Task 1 matching answer.')),
        ...Array.from({ length: 5 }, (_, i) => listeningMatching('cpe', 4, 26 + i, `Speaker ${i + 1}`, taskTwoOptions, ['A', 'D', 'F', 'B', 'G'][i], 'Task 2 matching answer.')),
      ],
    },
  ]

  return {
    id: examId,
    title: 'C2 CPE Sample Test — Listening',
    durationMinutes: 40,
    bandHint: cambridgeListeningBandHint('c2', countListeningQuestions(parts)),
    examType: 'cpe',
    examMode: 'practice',
    parts,
  }
}

export const CAMBRIDGE_LISTENING_SAMPLES: ListeningExam[] = [
  buildA2Listening(),
  buildPetListening(),
  multiPartListening('b2', 'fce', 'fce-listening-sample-01', 'B2 FCE Sample Test — Listening'),
  multiPartListening('c1', 'cae', 'cae-listening-sample-01', 'C1 CAE Sample Test — Listening'),
  buildCpeListening(),
]
