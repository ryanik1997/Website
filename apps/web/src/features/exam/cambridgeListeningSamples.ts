import type { CambridgeLevelSlug } from './cambridgeExamLevels'
import {
  cambridgeListeningBandHint,
} from './cambridgeExamFormats'
import {
  countListeningQuestions,
  listeningPartFromGaps,
  listeningPartFromMc,
} from './cambridgeSampleBuilders'
import type { ListeningExam, ListeningPart } from './listeningExamData'

type McTuple = [string, [string, string, string], 'A' | 'B' | 'C', string]

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
    durationMinutes: 30,
    bandHint: cambridgeListeningBandHint('a2', countListeningQuestions(parts)),
    examType: 'ket',
    examMode: 'practice',
    parts,
  }
}

function buildPetListening(): ListeningExam {
  const examId = 'pet-listening-sample-01'
  const parts: ListeningPart[] = [
    listeningPartFromMc(examId, 'pet', 1, 1, [
      ['Why is the man calling?', ['To book a table', 'To change an appointment', 'To ask about prices'], 'B', 'He wants to move his dentist appointment.'],
      ['What does the woman need to buy?', ['A birthday card', 'A train ticket', 'A phone case'], 'A', 'Her friend\'s birthday is tomorrow.'],
      ['Where are the speakers going next?', ['The library', 'The sports centre', 'The café'], 'C', 'They decide to get a drink.'],
      ['How does the boy feel about the concert?', ['Disappointed', 'Excited', 'Worried'], 'B', 'It was better than he expected.'],
      ['What problem does the woman have?', ['She lost her keys', 'Her laptop won\'t start', 'She missed the bus'], 'B', 'Her laptop screen stays black.'],
      ['What does the man recommend?', ['A documentary', 'A comedy show', 'A podcast'], 'A', 'He says the science documentary is excellent.'],
    ], 'You will hear people talking in different situations. Choose A, B or C.', 'Part 1. Listen to six short extracts.'),
    listeningPartFromMc(examId, 'pet', 2, 7, [
      ['The main purpose of the event is to', ['raise money', 'celebrate an anniversary', 'launch a product'], 'A', 'All profits go to the local hospital.'],
      ['Speakers should arrive by', ['8:15', '8:45', '9:15'], 'B', 'Registration closes at eight forty-five.'],
      ['Lunch will be', ['included', 'optional', 'cancelled'], 'A', 'The ticket price covers lunch.'],
      ['Parking is available at', ['the front entrance', 'the rear car park', 'the station'], 'B', 'Use the rear car park on Hill Road.'],
      ['The best contact method is', ['email', 'text message', 'phone call'], 'C', 'Call the office if you are delayed.'],
      ['Participants must bring', ['their own laptop', 'photo ID', 'sports equipment'], 'B', 'Security checks photo ID at the door.'],
    ], 'Choose the correct answer A, B or C.', 'Part 2. You will hear a coordinator explaining an event.'),
    listeningPartFromGaps(examId, 'pet', 3, 13, [
      ['Course level:', 'intermediate', 'She wants the intermediate class.'],
      ['Day of lessons:', 'tuesday', 'Classes are on Tuesday evenings.'],
      ['Course length:', 'ten weeks', 'The course runs for ten weeks.'],
      ['Teacher\'s name:', 'sandra mills', 'Sandra Mills teaches the evening group.'],
      ['Price per month:', '95', 'Monthly fee is ninety-five pounds.'],
      ['Registration deadline:', 'friday', 'Sign up by Friday at the desk.'],
    ], 'Complete the notes. Write NO MORE THAN TWO WORDS AND/OR A NUMBER.', 'Part 3. You will hear a woman leaving a message about a language course.'),
    listeningPartFromMc(examId, 'pet', 4, 19, [
      ['The speaker\'s first job was', ['in a bookshop', 'on a farm', 'at a hotel'], 'C', 'She washed dishes at a seaside hotel.'],
      ['She decided to study', ['biology', 'journalism', 'engineering'], 'B', 'A travel article inspired her to study journalism.'],
      ['Her biggest challenge was', ['learning shorthand', 'working night shifts', 'moving abroad'], 'A', 'Shorthand classes were demanding.'],
      ['She advises young people to', ['avoid unpaid work', 'try different experiences', 'focus on one skill'], 'B', 'Trying different jobs builds confidence.'],
      ['Her next project is', ['a radio series', 'a photography book', 'a charity website'], 'A', 'She is recording a radio series about coastal towns.'],
      ['The talk is mainly about', ['how careers develop', 'how to write fiction', 'how to learn languages'], 'A', 'She describes how her career developed over time.'],
      ['The audience is mostly', ['university students', 'retired teachers', 'primary pupils'], 'A', 'The talk is for university students.'],
    ], 'Choose the correct answer A, B or C.', 'Part 4. You will hear a journalist giving a talk.'),
  ]
  return {
    id: examId,
    title: 'B1 PET Sample Test — Listening',
    durationMinutes: 30,
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

export const CAMBRIDGE_LISTENING_SAMPLES: ListeningExam[] = [
  buildA2Listening(),
  buildPetListening(),
  multiPartListening('b2', 'fce', 'fce-listening-sample-01', 'B2 FCE Sample Test — Listening'),
  multiPartListening('c1', 'cae', 'cae-listening-sample-01', 'C1 CAE Sample Test — Listening'),
  multiPartListening('c2', 'cpe', 'cpe-listening-sample-01', 'C2 CPE Sample Test — Listening'),
]