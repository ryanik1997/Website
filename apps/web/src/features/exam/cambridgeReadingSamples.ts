import type { CambridgeLevelSlug } from './cambridgeExamLevels'
import { cambridgeReadingBandHint } from './cambridgeExamFormats'
import {
  countReadingQuestions,
  mcOpts,
  readingGap,
  readingGroup,
  readingMc,
  readingPart,
  readingTfng,
} from './cambridgeSampleBuilders'
import type { ReadingExam, ReadingPart } from './examData'

function buildA2Reading(): ReadingExam {
  const examId = 'cambridge-a2-reading-sample-01'
  const parts: ReadingPart[] = [
    readingPart(examId, 1, 'Part 1 — Questions 1–6', 'Signs and notices',
      [{ text: 'Look at the six signs and notices. For questions 1–6, choose the correct answer A, B or C.' }],
      [readingGroup(`${examId}-g1`, 'Questions 1–6', 'multiple-choice',
        'Choose the correct answer A, B or C.',
        [
          readingMc(1, 'a2-q1', 'CLOSED FOR CLEANING — We reopen on Monday at 9 a.m. When can you visit?', mcOpts(['Today', 'On Monday morning', 'On Sunday evening']), 'b', 'The sign says reopening Monday at 9 a.m.'),
          readingMc(2, 'a2-q2', 'STAFF ONLY — No entry beyond this point. Who may enter?', mcOpts(['Customers', 'Employees', 'Students on a tour']), 'b', 'Staff only means employees.'),
          readingMc(3, 'a2-q3', 'BIKE PARKING — Maximum stay 2 hours. How long can you leave a bike?', mcOpts(['One hour', 'Two hours', 'All day']), 'b', 'Maximum stay is two hours.'),
          readingMc(4, 'a2-q4', 'FREE WIFI — Ask at the desk for the password. What must you do?', mcOpts(['Pay five pounds', 'Ask for the password', 'Buy a drink']), 'b', 'Password is available at the desk.'),
          readingMc(5, 'a2-q5', 'MEETING ROOM 3 — Bookings before 5 p.m. only. When can you book?', mcOpts(['After 5 p.m.', 'Before 5 p.m.', 'At any time']), 'b', 'Bookings only before 5 p.m.'),
          readingMc(6, 'a2-q6', 'DOG OWNERS — Please keep dogs on a lead. What is the rule?', mcOpts(['Dogs are not allowed', 'Dogs must be on a lead', 'Dogs can run freely']), 'b', 'Dogs must be on a lead.'),
        ])],
    ),
    readingPart(examId, 2, 'Part 2 — Questions 7–11', 'Matching people to texts',
      [{ text: 'Five people want to find a suitable activity. Read the descriptions and match each person (7–11) to A–E.' }],
      [readingGroup(`${examId}-g2`, 'Questions 7–11', 'matching-features',
        'Which activity (A–E) is best for each person?',
        [
          readingMc(7, 'a2-q7', 'Mia wants to learn to swim.', mcOpts(['A', 'B', 'C', 'D', 'E']), 'b', 'Activity B is swimming lessons.'),
          readingMc(8, 'a2-q8', 'Jon needs help with maths homework.', mcOpts(['A', 'B', 'C', 'D', 'E']), 'd', 'Activity D is homework club.'),
          readingMc(9, 'a2-q9', 'Eva enjoys painting.', mcOpts(['A', 'B', 'C', 'D', 'E']), 'a', 'Activity A is art class.'),
          readingMc(10, 'a2-q10', 'Leo wants to play football after school.', mcOpts(['A', 'B', 'C', 'D', 'E']), 'c', 'Activity C is football training.'),
          readingMc(11, 'a2-q11', 'Sara wants a quiet place to read.', mcOpts(['A', 'B', 'C', 'D', 'E']), 'e', 'Activity E is library reading hour.'),
        ],
        {
          features: [
            { id: 'a', name: 'Art class on Wednesdays' },
            { id: 'b', name: 'Swimming lessons for beginners' },
            { id: 'c', name: 'Football training 4–6 p.m.' },
            { id: 'd', name: 'Homework club with tutors' },
            { id: 'e', name: 'Library reading hour' },
          ],
        })],
    ),
    readingPart(examId, 3, 'Part 3 — Questions 12–16', 'Conversation gap-fill',
      [{ text: 'Tom is talking to the youth club receptionist. Complete the conversation.' }],
      [readingGroup(`${examId}-g3`, 'Questions 12–16', 'gap-fill',
        'Write ONE WORD for each answer.',
        [
          readingGap(12, 'a2-q12', 'Tom\'s surname: ___', 'wilson', 'He spells Wilson.'),
          readingGap(13, 'a2-q13', 'Age: ___', '14', 'He is fourteen.'),
          readingGap(14, 'a2-q14', 'Favourite activity: ___', 'football', 'He wants to join football.'),
          readingGap(15, 'a2-q15', 'Day to visit: ___', 'friday', 'He can come on Friday.'),
          readingGap(16, 'a2-q16', 'Fee per month: ___ pounds', '8', 'Membership is eight pounds.'),
        ])],
    ),
    readingPart(examId, 4, 'Part 4 — Questions 17–21', 'Riverside Youth Club',
      [
        { text: 'Riverside Youth Club opened ten years ago next to the town library. It is open weekdays from 3 p.m. to 8 p.m. for ages 11–16.' },
        { text: 'Members can join football, art, or homework groups. Parents must complete a form before the first visit.' },
        { text: 'This summer the club offers a camping trip to Lakefield Park. Register at the desk by Friday.' },
      ],
      [readingGroup(`${examId}-g4`, 'Questions 17–21', 'multiple-choice',
        'Choose the correct answer A, B or C.',
        [
          readingMc(17, 'a2-q17', 'The club is next to', mcOpts(['the library', 'the lake', 'the stadium']), 'a', 'It is next to the town library.'),
          readingMc(18, 'a2-q18', 'It is open on', mcOpts(['weekdays only', 'weekends only', 'every day']), 'a', 'Open weekdays 3–8 p.m.'),
          readingMc(19, 'a2-q19', 'Before attending, parents must', mcOpts(['pay online', 'complete a form', 'call the manager']), 'b', 'Parents complete a form first.'),
          readingMc(20, 'a2-q20', 'The summer trip goes to', mcOpts(['Lakefield Park', 'the sports centre', 'the museum']), 'a', 'Camping at Lakefield Park.'),
          readingMc(21, 'a2-q21', 'To join the trip, students should', mcOpts(['register by Friday', 'bring tents', 'pay on the bus']), 'a', 'Register by Friday.'),
        ])],
    ),
    readingPart(examId, 5, 'Part 5 — Questions 22–26', 'Open cloze',
      [{ text: 'Our club helps young people stay active and make friends. We believe sport and art build confidence. Volunteers are always welcome.' }],
      [readingGroup(`${examId}-g5`, 'Questions 22–26', 'gap-fill',
        'Write ONE WORD for each gap in the text.',
        [
          readingGap(22, 'a2-q22', 'The club helps young people stay ___', 'active', 'Stay active.'),
          readingGap(23, 'a2-q23', 'Sport and art build ___', 'confidence', 'Build confidence.'),
          readingGap(24, 'a2-q24', 'The club opened ten ___ ago', 'years', 'Ten years ago.'),
          readingGap(25, 'a2-q25', 'Camping places are ___', 'limited', 'Places are limited.'),
          readingGap(26, 'a2-q26', '___ are always welcome', 'volunteers', 'Volunteers welcome.'),
        ])],
    ),
  ]
  return {
    id: examId,
    title: 'A2 KET Sample Test — Reading (Parts 1–5)',
    durationMinutes: 60,
    bandHint: cambridgeReadingBandHint('a2', countReadingQuestions(parts)),
    examTrack: 'cambridge',
    cambridgeLevel: 'a2',
    parts,
  }
}

function buildPetReading(): ReadingExam {
  const examId = 'cambridge-b1-reading-sample-01'
  const passage = [
    { text: 'Remote working became common after 2020. Many employees now split their week between home and the office.' },
    { text: 'Surveys show faster project completion, though junior staff sometimes miss informal mentoring in the office kitchen.' },
    { text: 'Companies now run monthly workshops and mentor programmes for new hires.' },
  ]
  const parts: ReadingPart[] = [
    readingPart(examId, 1, 'Part 1 — Questions 1–5', 'Signs and messages', [{ text: 'Choose the best meaning for each sign (1–5).' }],
      [readingGroup(`${examId}-g1`, 'Questions 1–5', 'multiple-choice', 'Choose A, B or C.',
        [
          readingMc(1, 'b1-q1', 'OUT OF ORDER — Please use machine on floor 2.', mcOpts(['Wait here', 'Go to floor 2', 'Call security']), 'b', 'Use floor 2.'),
          readingMc(2, 'b1-q2', 'SILENCE PLEASE — Examination in progress.', mcOpts(['Make noise', 'Be quiet', 'Leave bags']), 'b', 'Silence required.'),
          readingMc(3, 'b1-q3', 'PUSH — Automatic door, no handle.', mcOpts(['Pull the door', 'Push the door', 'Knock first']), 'b', 'Sign says push.'),
          readingMc(4, 'b1-q4', 'LAST ADMISSION 5:30 p.m.', mcOpts(['Enter after 5:30', 'Enter before 5:30', 'Free entry all day']), 'b', 'Last entry 5:30.'),
          readingMc(5, 'b1-q5', 'LIFTS TO FLOORS 1–4 ONLY.', mcOpts(['Floor 5 by lift', 'Floors 1–4 by lift', 'No lifts available']), 'b', 'Lifts serve floors 1–4.'),
        ])]),
    readingPart(examId, 2, 'Part 2 — Questions 6–10', 'Matching', [{ text: 'Match people 6–10 to descriptions A–E.' }],
      [readingGroup(`${examId}-g2`, 'Questions 6–10', 'matching-features', 'Choose A–E.',
        [6, 7, 8, 9, 10].map((n, i) => readingMc(n, `b1-q${n}`, `Person ${n} needs option ${['A', 'B', 'C', 'D', 'E'][i]}.`, mcOpts(['A', 'B', 'C', 'D', 'E']), ['a', 'b', 'c', 'd', 'e'][i], 'Sample matching key.')),
        { features: [{ id: 'a', name: 'Evening language course' }, { id: 'b', name: 'Weekend hiking group' }, { id: 'c', name: 'Cooking for beginners' }, { id: 'd', name: 'City cycling tour' }, { id: 'e', name: 'Photography club' }] },
      )]),
    readingPart(examId, 3, 'Part 3 — Questions 11–15', 'Gap-fill text', [{ text: 'Complete the text with one word per gap.' }],
      [readingGroup(`${examId}-g3`, 'Questions 11–15', 'gap-fill', 'ONE WORD only.',
        [11, 12, 13, 14, 15].map((n, i) => readingGap(n, `b1-q${n}`, `Gap ${n}: ___`, ['remote', 'office', 'mentors', 'workshops', 'confidence'][i], 'Sample gap answer.')),
      )]),
    readingPart(examId, 4, 'Part 4 — Questions 16–20', 'Working from Home', passage,
      [readingGroup(`${examId}-g4`, 'Questions 16–20', 'multiple-choice', 'Choose A, B or C.',
        [
          readingMc(16, 'b1-q16', 'Many employees now', mcOpts(['work only at home', 'split home and office', 'avoid all meetings']), 'b', 'Split week between home and office.'),
          readingMc(17, 'b1-q17', 'Projects are often completed', mcOpts(['more slowly', 'faster', 'at the same speed']), 'b', 'Surveys show faster completion.'),
          readingMc(18, 'b1-q18', 'Junior staff may miss', mcOpts(['salary bonuses', 'informal mentoring', 'holiday pay']), 'b', 'Miss mentoring in the kitchen.'),
          readingMc(19, 'b1-q19', 'Companies organise', mcOpts(['monthly workshops', 'daily exams', 'online games']), 'a', 'Monthly workshops for new hires.'),
          readingMc(20, 'b1-q20', 'The text is mainly about', mcOpts(['remote work changes', 'office decoration', 'school exams']), 'a', 'About remote working trends.'),
        ])]),
    readingPart(examId, 5, 'Part 5 — Questions 21–25', 'Word bank', [{ text: 'Complete with words A–H.' }],
      [readingGroup(`${examId}-g5`, 'Questions 21–25', 'summary-completion', 'Choose word A–H.',
        [21, 22, 23, 24, 25].map((n, i) => readingMc(n, `b1-q${n}`, `Gap ${n}`, mcOpts(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']), ['a', 'b', 'c', 'd', 'e'][i], 'Word bank sample.')),
        { wordBank: [{ id: 'a', label: 'flexible' }, { id: 'b', label: 'training' }, { id: 'c', label: 'commute' }, { id: 'd', label: 'mentor' }, { id: 'e', label: 'productivity' }] },
      )]),
    readingPart(examId, 6, 'Part 6 — Questions 26–32', 'Open cloze', passage,
      [readingGroup(`${examId}-g6`, 'Questions 26–32', 'gap-fill', 'Write ONE WORD.',
        [26, 27, 28, 29, 30, 31, 32].map((n, i) => readingGap(n, `b1-q${n}`, `Gap ${n}: ___`, ['common', 'between', 'faster', 'sometimes', 'monthly', 'programmes', 'hires'][i], 'PET Part 6 style gap.')),
      )]),
  ]
  return {
    id: examId,
    title: 'B1 PET Sample Test — Reading (6 parts)',
    durationMinutes: 45,
    bandHint: cambridgeReadingBandHint('b1', countReadingQuestions(parts)),
    examTrack: 'cambridge',
    cambridgeLevel: 'b1',
    parts,
  }
}

function buildLevelReading(
  slug: CambridgeLevelSlug,
  examId: string,
  title: string,
  partCount: number,
  questionsPerPart: number,
  passageTitle: string,
  passage: { text: string }[],
): ReadingExam {
  const parts: ReadingPart[] = []
  let qNum = 1
  for (let p = 1; p <= partCount; p++) {
    const groupType = p % 3 === 1 ? 'tfng' as const : p % 3 === 2 ? 'multiple-choice' as const : 'gap-fill' as const
    const questions = Array.from({ length: questionsPerPart }, (_, i) => {
      const n = qNum++
      if (groupType === 'tfng') {
        return readingTfng(n, `${slug}-q${n}`, `Statement ${n}: The text supports idea ${i + 1}.`, i % 3 === 0 ? 'true' : i % 3 === 1 ? 'false' : 'not-given', 'Sample TFNG explanation.')
      }
      if (groupType === 'multiple-choice') {
        return readingMc(n, `${slug}-q${n}`, `Question ${n}: What does the writer suggest?`, mcOpts(['Option A', 'Option B', 'Option C', 'Option D']), 'b', 'Sample MC explanation.')
      }
      return readingGap(n, `${slug}-q${n}`, `Gap ${n}: ___`, ['policy', 'evidence', 'urban', 'research', 'balance', 'funding', 'language', 'archive'][i % 8], 'Sample gap answer.')
    })
    const instruction = groupType === 'tfng'
      ? 'Do the statements agree with the text? TRUE / FALSE / NOT GIVEN.'
      : groupType === 'multiple-choice'
        ? 'Choose the correct letter A, B, C or D.'
        : 'Write ONE WORD for each answer.'
    parts.push(readingPart(
      examId,
      p,
      `Part ${p} — Questions ${qNum - questionsPerPart}–${qNum - 1}`,
      p === 1 ? passageTitle : `${passageTitle} — Part ${p}`,
      p === 1 ? passage : [{ text: passage[p % passage.length]?.text ?? passage[0].text }],
      [readingGroup(`${examId}-g${p}`, `Questions ${qNum - questionsPerPart}–${qNum - 1}`, groupType, instruction, questions)],
    ))
  }
  const durationMinutes = slug === 'b2' ? 75 : 90
  return {
    id: examId,
    title,
    durationMinutes,
    bandHint: cambridgeReadingBandHint(slug, countReadingQuestions(parts)),
    examTrack: 'cambridge',
    cambridgeLevel: slug,
    parts,
  }
}

const NIGHT_TRAINS = [
  { text: 'After decades of decline, overnight rail services are reappearing across Europe. Rising air fares and concern about emissions have encouraged investment in sleeper routes.' },
  { text: 'Modern carriages offer private cabins, Wi-Fi, and quiet zones. Catering has improved with regional dishes instead of airline-style trays.' },
  { text: 'Critics say journey times remain slow on routes over eight hundred kilometres, but operators argue travellers value sleeping while travelling into city centres.' },
]

const URBAN_NOISE = [
  { text: 'City planners have traditionally treated noise as an inevitable by-product of growth. Regulations focus on airports and factories, not cumulative traffic and nightlife in residential areas.' },
  { text: 'Studies link moderate noise to cardiovascular stress and reduced concentration among schoolchildren. Unpredictable sirens can disturb more than steady background hum.' },
  { text: 'Some cities trial dynamic zoning and subsidised soundproofing. Critics say measures burden small businesses; advocates argue healthier cities retain skilled workers.' },
]

const PRESERVATION = [
  { text: 'Digitisation was meant to rescue fragile manuscripts, yet files from twenty years ago may rely on obsolete software, forcing costly repeated migration.' },
  { text: 'Scholars advocate keeping high-resolution scans and originals, arguing material qualities carry information pixels cannot convey. Others prioritise online access over physical aura.' },
  { text: 'Metadata standards and community projects can extend digital life while keeping artefacts available. Funding for long-term stewardship remains unresolved.' },
]

export const CAMBRIDGE_READING_SAMPLES: ReadingExam[] = [
  buildA2Reading(),
  buildPetReading(),
  buildLevelReading('b2', 'cambridge-b2-reading-sample-01', 'B2 FCE Sample — Reading & Use of English (7 parts)', 7, 4, 'The Return of Night Trains', NIGHT_TRAINS),
  buildLevelReading('c1', 'cambridge-c1-reading-sample-01', 'C1 CAE Sample — Reading & Use of English (8 parts)', 8, 4, 'Rethinking Urban Noise Policy', URBAN_NOISE),
  buildLevelReading('c2', 'cambridge-c2-reading-sample-01', 'C2 CPE Sample — Reading & Use of English (7 parts)', 7, 4, 'The Paradox of Preservation', PRESERVATION),
]