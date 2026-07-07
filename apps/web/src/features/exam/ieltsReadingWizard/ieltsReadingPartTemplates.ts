import {
  READING_EXAMS,
  YNNG_OPTIONS,
  type ReadingNotePassageBlock,
  type ReadingNoteTable,
  type ReadingPart,
  type ReadingQuestion,
  type ReadingQuestionGroup,
} from '../examData'
import type { ReadingImportPartJson } from '../importReadingManualUtils'
import type { IeltsReadingPassageNumber, IeltsReadingWizardTemplateKind } from './ieltsReadingWizardConfig'

const MOCK = READING_EXAMS.find(e => e.id === 'ielts-reading-01')!
const DEMO = READING_EXAMS.find(e => e.id === 'ielts-reading-types-demo')!

const TFNG_OPTIONS = [
  { id: 'true', label: 'TRUE' },
  { id: 'false', label: 'FALSE' },
  { id: 'not-given', label: 'NOT GIVEN' },
]

function partToImportJson(part: ReadingPart): ReadingImportPartJson {
  return {
    partNumber: part.partNumber,
    rangeLabel: part.rangeLabel,
    passageTitle: part.passageTitle,
    passageSubtitle: part.passageSubtitle,
    passage: part.passage.map(block => ({
      label: block.label,
      text: block.text,
    })),
    questionGroups: part.questionGroups.map(group => ({
      range: group.range,
      instruction: group.instruction,
      note: group.note,
      imageFile: group.imageFile,
      noteTable: group.noteTable,
      notePassage: group.notePassage,
      notesTitle: group.notesTitle,
      type: group.type,
      paragraphLetters: group.paragraphLetters,
      headings: group.headings,
      features: group.features,
      wordBank: group.wordBank,
      questions: group.questions.map(q => ({
        number: q.number,
        type: q.type,
        prompt: q.prompt,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
      })),
    })),
  }
}

function stripQuestionIds(questions: ReadingQuestion[], start: number, count?: number): ReadingImportPartJson['questionGroups'][0]['questions'] {
  const slice = count != null ? questions.slice(0, count) : questions
  return slice.map((q, i) => ({
    number: start + i,
    type: q.type,
    prompt: q.prompt,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }))
}

function renumberGroup(
  group: ReadingQuestionGroup,
  range: string,
  start: number,
  count?: number,
): ReadingImportPartJson['questionGroups'][0] {
  return {
    range,
    instruction: group.instruction,
    note: group.note,
    imageFile: group.imageFile,
    noteTable: group.noteTable,
    notePassage: group.notePassage,
    notesTitle: group.notesTitle,
    type: group.type,
    paragraphLetters: group.paragraphLetters,
    headings: group.headings,
    features: group.features,
    wordBank: group.wordBank,
    questions: stripQuestionIds(group.questions, start, count),
  }
}

function gapQuestions(start: number, items: Array<{ prompt: string; answer: string; explanation: string }>) {
  return items.map((item, i) => ({
    number: start + i,
    type: 'gap-fill' as const,
    prompt: item.prompt,
    options: [],
    answer: item.answer,
    explanation: item.explanation,
  }))
}

function sentenceQuestions(start: number, items: Array<{ prompt: string; answer: string; explanation: string }>) {
  return items.map((item, i) => ({
    number: start + i,
    type: 'sentence-completion' as const,
    prompt: item.prompt,
    options: [],
    answer: item.answer,
    explanation: item.explanation,
  }))
}

/** Cam10 T1 — TFNG + MC */
export function ieltsReadingP1R1Part(): ReadingImportPartJson {
  return partToImportJson(MOCK.parts[0])
}

/** Cam10 T1 — bảng Stepwells Q9–13 */
export const CAM10_T1_STEPWELLS_TABLE: ReadingNoteTable = {
  headers: ['Stepwells', 'Date', 'Features', 'Other notes'],
  gapNumbers: [9, 10, 11, 12, 13],
  rows: [
    {
      cells: [
        [{ type: 'static', text: 'Rani Ki Vav' }],
        [{ type: 'static', text: 'Late 11th century' }],
        [{ type: 'static', text: 'As many as 500 sculptures decorate the monument' }],
        [
          { type: 'static', text: 'Restored in the 1990s' },
          { type: 'break' },
          { type: 'static', text: 'Excellent condition, despite the ' },
          { type: 'gap', number: 9 },
          { type: 'static', text: ' of 2001.' },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Surya Kund' }],
        [{ type: 'static', text: '1026' }],
        [
          { type: 'static', text: 'Steps on the ' },
          { type: 'gap', number: 10 },
          { type: 'static', text: ' produce a geometric pattern' },
          { type: 'break' },
          { type: 'static', text: 'Carved shrines.' },
        ],
        [
          { type: 'static', text: 'Looks more like a ' },
          { type: 'gap', number: 11 },
          { type: 'static', text: ' than a well.' },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Raniji Ki Baori' }],
        [{ type: 'static', text: '1699' }],
        [{ type: 'static', text: 'Intricately carved monument' }],
        [{ type: 'static', text: 'One of 21 baoris in the area commissioned by Queen Nathavatji' }],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Chand Baori' }],
        [{ type: 'static', text: '850 AD' }],
        [{ type: 'static', text: 'Steps take you down 11 storeys to the bottom' }],
        [
          { type: 'static', text: 'Old, deep and very dramatic' },
          { type: 'break' },
          { type: 'static', text: 'Has ' },
          { type: 'gap', number: 12 },
          { type: 'static', text: ' which provide a view of the steps.' },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'Neemrana Ki Baori' }],
        [{ type: 'static', text: '1700' }],
        [
          { type: 'static', text: 'Has two ' },
          { type: 'gap', number: 13 },
          { type: 'static', text: ' levels.' },
        ],
        [{ type: 'static', text: 'Used by public today' }],
      ],
    },
  ],
}

/** Cam10 T1 — TFNG Q1–5 + gap Q6–8 + table Q9–13 */
export function ieltsReadingP1TfngGapTablePart(): ReadingImportPartJson {
  const base = MOCK.parts[0]
  const tfng = base.questionGroups[0]

  return {
    ...partToImportJson(base),
    passageTitle: 'Stepwells',
    passageSubtitle: 'A millennium ago, stepwells were fundamental to life in the driest parts of India.',
    questionGroups: [
      {
        range: 'Questions 1–5',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.',
        type: 'tfng',
        questions: tfng.questions.slice(0, 5).map((q, i) => ({
          number: 1 + i,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        })),
      },
      {
        range: 'Questions 6–8',
        instruction: 'Answer the questions below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(6, [
          { prompt: 'Which part of some stepwells provided shade for people?', answer: 'pavilions', explanation: 'Pavilions che nắng cho du khách.' },
          { prompt: 'What type of serious climatic event, which took place in southern Rajasthan, is mentioned?', answer: 'drought', explanation: 'Hạn hán 8 năm 1996–2004.' },
          { prompt: 'Who are frequent visitors to stepwells nowadays?', answer: 'tourists', explanation: 'Du khách đến chiêm ngưỡng các công trình cổ.' },
        ]),
      },
      {
        range: 'Questions 9–13',
        instruction: 'Complete the table below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.',
        type: 'gap-fill',
        noteTable: CAM10_T1_STEPWELLS_TABLE,
        questions: gapQuestions(9, [
          { prompt: 'Gap (9)', answer: 'earthquake', explanation: 'Sống sót sau động đất 7.6 Richter năm 2001.' },
          { prompt: 'Gap (10)', answer: '4 sides|four sides', explanation: 'Bốn cạnh bậc thang tạo hình học.' },
          { prompt: 'Gap (11)', answer: 'tank', explanation: 'Giống hồ chứa (kund) hơn giếng.' },
          { prompt: 'Gap (12)', answer: 'verandas', explanation: 'Hành lang verandas nhìn xuống bậc.' },
          { prompt: 'Gap (13)', answer: 'underwater', explanation: 'Hai tầng dưới nước.' },
        ]),
      },
    ],
  }
}

/** Cam10 T4 — notes Wildfires Q1–6 */
export const CAM10_T4_WILDFIRES_NOTE_PASSAGE: ReadingNotePassageBlock[] = [
  {
    type: 'section',
    text: '• Characteristics of wildfires and wildfire conditions today compared to the past:',
  },
  { type: 'static', text: '– occurrence: more frequent' },
  { type: 'static', text: '– temperature: hotter' },
  { type: 'static', text: '– speed: faster' },
  { type: 'static', text: '– movement: ' },
  { type: 'gap', number: 1 },
  { type: 'static', text: ' more unpredictable' },
  { type: 'static', text: '– size of fires: ' },
  { type: 'gap', number: 2 },
  { type: 'static', text: ' greater on average than two decades ago' },
  {
    type: 'section',
    text: '• Reasons wildfires cause more damage today compared to the past:',
  },
  { type: 'static', text: '– rainfall: ' },
  { type: 'gap', number: 3 },
  { type: 'static', text: ' average' },
  { type: 'static', text: '– more brush to act as ' },
  { type: 'gap', number: 4 },
  { type: 'static', text: '– increase in yearly temperature' },
  { type: 'static', text: '– extended fire ' },
  { type: 'gap', number: 5 },
  { type: 'static', text: '– more building of ' },
  { type: 'gap', number: 6 },
  { type: 'static', text: ' in vulnerable places' },
]

/** Cam10 T4 — notes Q1–6 (notePassage) + TFNG Q7–13 */
export function ieltsReadingP1NotesTfngPart(): ReadingImportPartJson {
  const base = MOCK.parts[0]

  return {
    ...partToImportJson(base),
    passageTitle: 'The megafires of California',
    passageSubtitle: 'Drought, housing expansion, and oversupply of tinder make for bigger, hotter fires in the western United States.',
    questionGroups: [
      {
        range: 'Questions 1–6',
        instruction: 'Complete the notes below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.',
        type: 'gap-fill',
        notesTitle: 'Wildfires',
        notePassage: CAM10_T4_WILDFIRES_NOTE_PASSAGE,
        questions: gapQuestions(1, [
          { prompt: 'Gap (1)', answer: 'spread', explanation: 'Cháy lan không ổn định hơn (spread more erratically).' },
          { prompt: 'Gap (2)', answer: '10 times|ten times', explanation: 'Megafire gấp 10 lần cháy rừng trung bình 20 năm trước.' },
          { prompt: 'Gap (3)', answer: 'below', explanation: 'Lượng mưa dưới mức bình thường.' },
          { prompt: 'Gap (4)', answer: 'fuel', explanation: 'Underbrush là nhiên liệu chính.' },
          { prompt: 'Gap (5)', answer: 'seasons', explanation: 'Mùa cháy dài hơn 78 ngày.' },
          { prompt: 'Gap (6)', answer: 'homes', explanation: 'Xây nhà trong vùng dễ cháy.' },
        ]),
      },
      {
        range: 'Questions 7–13',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.',
        type: 'tfng',
        questions: [
          { number: 7, type: 'true-false-not-given', prompt: 'The amount of open space in California has diminished over the last ten years.', options: TFNG_OPTIONS, answer: 'true', explanation: 'Đất trống thành nhà ở — tăng >600.000/người/năm.' },
          { number: 8, type: 'true-false-not-given', prompt: 'Many experts believe California has made little progress in readying itself to fight fires.', options: TFNG_OPTIONS, answer: 'false', explanation: 'Nhiều chuyên gia đánh giá cao tiến bộ chuẩn bị.' },
          { number: 9, type: 'true-false-not-given', prompt: 'Personnel in the past have been criticised for mishandling fire containment.', options: TFNG_OPTIONS, answer: 'true', explanation: 'Từng bị chỉ trích vì để cháy lan.' },
          { number: 10, type: 'true-false-not-given', prompt: 'California has replaced a range of firefighting tools.', options: TFNG_OPTIONS, answer: 'true', explanation: 'Cung cấp máy, xe, trực thăng mới hơn.' },
          { number: 11, type: 'true-false-not-given', prompt: 'More firefighters have been hired to improve fire-fighting capacity.', options: TFNG_OPTIONS, answer: 'not-given', explanation: 'Tăng ngân sách — không nói tuyển thêm lính cứu hỏa.' },
          { number: 12, type: 'true-false-not-given', prompt: 'Citizens and government groups disapprove of the efforts of different states and agencies working together.', options: TFNG_OPTIONS, answer: 'false', explanation: 'Phối hợp liên bang hiệu quả hơn trước.' },
          { number: 13, type: 'true-false-not-given', prompt: 'Randy Jacobs believes that loss of life from fires will continue at the same levels, despite changes made.', options: TFNG_OPTIONS, answer: 'false', explanation: 'Ông tin sẽ không còn mất mạng như trước.' },
        ],
      },
    ],
  }
}

/** Cam9 T1 — TFNG Q1–7 + gap-fill Q8–13 */
export function ieltsReadingP1TfngGapPart(): ReadingImportPartJson {
  const base = MOCK.parts[0]
  const tfng = base.questionGroups[0]
  const tfngQs = [
    ...tfng.questions,
    {
      ...tfng.questions[0],
      prompt: 'The kākāpō can live for up to 100 years.',
      answer: 'true',
      explanation: 'The passage states they can live for up to 100 years.',
    },
  ]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 1–7',
        instruction: tfng.instruction,
        type: 'tfng',
        questions: tfngQs.slice(0, 7).map((q, i) => ({
          number: 1 + i,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        })),
      },
      {
        range: 'Questions 8–13',
        instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(8, [
          { prompt: 'The kākāpō is described as a ___ parrot.', answer: 'flightless', explanation: 'Passage mô tả nocturnal, flightless parrot.' },
          { prompt: 'Female kākāpō lay eggs when ___ is plentiful.', answer: 'food', explanation: 'Breeding phụ thuộc abundant food supplies.' },
          { prompt: 'Polynesian settlers introduced animals such as ___', answer: 'dogs', explanation: 'Polynesian settlers brought dogs and rats.' },
          { prompt: 'European colonisation caused widespread ___', answer: 'habitat loss', explanation: 'European colonisation gây habitat loss.' },
          { prompt: 'In 1894 the government made its first attempt to ___ the kākāpō.', answer: 'save', explanation: 'First attempt to save the kākāpō.' },
          { prompt: 'Conservationists created ___ where birds could breed safely.', answer: 'predator-free islands', explanation: 'Predator-free islands cho breeding.' },
        ]),
      },
    ],
  }
}

/** Cam11 T3 — Matching headings Q1–7 + MC Q8–13 */
export function ieltsReadingP1HeadingsMcPart(): ReadingImportPartJson {
  const headingsPart = DEMO.parts[0]
  const mcGroup = MOCK.parts[0].questionGroups[1]

  return {
    ...partToImportJson(headingsPart),
    rangeLabel: 'Read the text and answer questions 1–13.',
    questionGroups: [
      renumberGroup(headingsPart.questionGroups[0], 'Questions 1–7', 1),
      renumberGroup(mcGroup, 'Questions 8–13', 8, 6),
    ],
  }
}

/** Sentence completion Q1–8 + MC Q9–13 */
export function ieltsReadingP1SentenceMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[0]
  const mcGroup = base.questionGroups[1]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 1–8',
        instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'sentence-completion',
        questions: sentenceQuestions(1, [
          { prompt: 'The kākāpō is a ___ parrot found only in New Zealand.', answer: 'flightless', explanation: 'Passage mô tả flightless parrot.' },
          { prompt: 'Kākāpō can live for up to ___ years.', answer: '100', explanation: 'Có thể sống tới 100 năm.' },
          { prompt: 'Females alone ___ the eggs.', answer: 'incubate', explanation: 'Females incubate eggs.' },
          { prompt: 'Breeding depends on abundant ___ supplies.', answer: 'food', explanation: 'Abundant food supplies.' },
          { prompt: 'Polynesian settlers brought ___ and rats.', answer: 'dogs', explanation: 'Dogs and rats introduced.' },
          { prompt: 'European colonisation caused habitat ___', answer: 'loss', explanation: 'Widespread habitat loss.' },
          { prompt: 'The first government rescue attempt was in ___', answer: '1894', explanation: '1894 first attempt.' },
          { prompt: 'Birds breed on predator-free ___', answer: 'islands', explanation: 'Predator-free islands.' },
        ]),
      },
      renumberGroup(mcGroup, 'Questions 9–13', 9, 5),
    ],
  }
}

/** Matching headings Q1–7 + gap Q8–13 */
export function ieltsReadingP1HeadingsGapPart(): ReadingImportPartJson {
  const headingsPart = DEMO.parts[0]

  return {
    ...partToImportJson(headingsPart),
    rangeLabel: 'Read the text and answer questions 1–13.',
    questionGroups: [
      renumberGroup(headingsPart.questionGroups[0], 'Questions 1–7', 1),
      {
        range: 'Questions 8–13',
        instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(8, [
          { prompt: 'City planners now treat parks as essential ___', answer: 'infrastructure', explanation: 'Green space as essential infrastructure.' },
          { prompt: 'Residents near parks reported lower ___ levels.', answer: 'stress', explanation: 'Lower stress levels.' },
          { prompt: 'Some councils resist projects because of maintenance ___', answer: 'budgets', explanation: 'Maintenance budgets strained.' },
          { prompt: 'Volunteer groups create community ___', answer: 'gardens', explanation: 'Community gardens from abandoned lots.' },
          { prompt: 'Victorian cities invested in public ___', answer: 'parks', explanation: 'Investment in public parks.' },
          { prompt: 'The link between greenery and economic growth remains ___', answer: 'debated', explanation: 'Relationship remains debated.' },
        ]),
      },
    ],
  }
}

/** Gap-fill Q1–6 + MC Q7–13 */
export function ieltsReadingP1GapMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[0]
  const mcGroup = base.questionGroups[1]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 1–6',
        instruction: 'Complete the notes below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(1, [
          { prompt: 'Type of parrot: ___', answer: 'flightless', explanation: 'Flightless parrot.' },
          { prompt: 'Maximum lifespan: ___ years', answer: '100', explanation: 'Up to 100 years.' },
          { prompt: 'Diet: completely ___', answer: 'vegetarian', explanation: 'Completely vegetarian diet.' },
          { prompt: 'Chicks produced when food is ___', answer: 'plentiful', explanation: 'When food plentiful.' },
          { prompt: 'Predators introduced by settlers: dogs and ___', answer: 'rats', explanation: 'Dogs and rats.' },
          { prompt: 'Safe breeding areas: predator-free ___', answer: 'islands', explanation: 'Predator-free islands.' },
        ]),
      },
      renumberGroup(mcGroup, 'Questions 7–13', 7, 7),
    ],
  }
}

/** Cam10 T1 — Match paragraph + features + MC */
export function ieltsReadingP2R2Part(): ReadingImportPartJson {
  return partToImportJson(MOCK.parts[1])
}

/** Cam10 T4 — YNNG + match paragraph + features + MC */
export function ieltsReadingP2YnngMatchPart(): ReadingImportPartJson {
  const origP2 = MOCK.parts[1]
  const ynngGroup = DEMO.parts[1].questionGroups[0]

  return {
    ...partToImportJson(origP2),
    questionGroups: [
      renumberGroup(ynngGroup, 'Questions 14–18', 14, 5),
      renumberGroup(origP2.questionGroups[0], 'Questions 19–22', 19, 4),
      renumberGroup(origP2.questionGroups[1], 'Questions 23–25', 23, 3),
      renumberGroup(origP2.questionGroups[2], 'Questions 26', 26, 1),
    ],
  }
}

/** Cam9 T1 — Headings Q14–17 + gap Q18–20 + YNNG Q21–26 */
export function ieltsReadingP2HeadingsYnngPart(): ReadingImportPartJson {
  const headingsPart = DEMO.parts[0]
  const ynngGroup = DEMO.parts[1].questionGroups[0]
  const ynngExtra = {
    ...ynngGroup.questions[0],
    prompt: 'The writer believes reintroducing elms is straightforward and inexpensive.',
    answer: 'no',
    explanation: 'Passage nêu nhiều khó khăn và tranh luận.',
  }

  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: headingsPart.passageTitle,
    passage: headingsPart.passage.slice(0, 4).map(block => ({ label: block.label, text: block.text })),
    questionGroups: [
      {
        range: 'Questions 14–17',
        instruction: 'Reading Passage 2 has four paragraphs, A–D. Choose the correct heading for each paragraph.',
        note: 'There are more headings than paragraphs, so you will not use all of them.',
        type: 'matching-headings',
        headings: headingsPart.questionGroups[0].headings,
        questions: stripQuestionIds(headingsPart.questionGroups[0].questions, 14, 4),
      },
      {
        range: 'Questions 18–20',
        instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(18, [
          { prompt: 'Dutch elm disease is spread by ___', answer: 'bark beetles', explanation: 'Beetles spread the fungus between trees.' },
          { prompt: 'Young elms become vulnerable when trunks reach ___ in diameter.', answer: '10–15 cm', explanation: 'Paragraph C nêu 10–15 cm.' },
          { prompt: 'A Scottish valley has remained free of the disease because of its ___', answer: 'isolation', explanation: 'Isolation and climate giúp tránh disease.' },
        ]),
      },
      {
        range: 'Questions 21–26',
        instruction: 'Do the following statements agree with the views of the writer in Reading Passage 2? Write YES, NO or NOT GIVEN.',
        type: 'ynng',
        questions: [...ynngGroup.questions, ynngExtra].slice(0, 6).map((q, i) => ({
          number: 21 + i,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        })),
      },
    ],
  }
}

/** Cam10 T1 — TFNG + MC */
export function ieltsReadingP3R3Part(): ReadingImportPartJson {
  return partToImportJson(MOCK.parts[2])
}

/** Cam9 T1 — Gap Q27–30 + TFNG Q31–33 + flow/summary Q34–39 + MC Q40 */
export function ieltsReadingP3GapTfngFlowMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[2]
  const tfngGroup = base.questionGroups[0]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 27–30',
        instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(27, [
          { prompt: 'Sleep has long been linked to ___', answer: 'memory', explanation: 'Opening sentence links sleep and memory.' },
          { prompt: 'During slow-wave sleep the brain replays experiences from the ___', answer: 'day', explanation: 'Brain replays experiences from the day.' },
          { prompt: 'REM sleep is associated with ___ forms of problem solving.', answer: 'creative', explanation: 'REM linked to creative problem solving.' },
          { prompt: 'Some experiments use small ___', answer: 'sample sizes', explanation: 'Limitation: small sample sizes.' },
        ]),
      },
      {
        range: 'Questions 31–33',
        instruction: tfngGroup.instruction,
        type: 'tfng',
        questions: stripQuestionIds(tfngGroup.questions, 31, 3),
      },
      {
        range: 'Questions 34–39',
        instruction: 'Complete the flow-chart below. Choose SIX answers from the box and write the correct letter A–G next to questions 34–39.',
        type: 'summary-completion',
        wordBank: [
          { id: 'a', label: 'slow-wave sleep' },
          { id: 'b', label: 'REM sleep' },
          { id: 'c', label: 'neural connections' },
          { id: 'd', label: 'laboratory' },
          { id: 'e', label: 'productivity' },
          { id: 'f', label: 'revision' },
          { id: 'g', label: 'motor skills' },
        ],
        questions: [
          { number: 34, type: 'summary-completion', prompt: 'Stage 1: experiences replayed during ___', options: [], answer: 'a', explanation: 'Slow-wave sleep replays experiences.' },
          { number: 35, type: 'summary-completion', prompt: 'Stage 2: useful ___ strengthened', options: [], answer: 'c', explanation: 'Neural connections strengthened.' },
          { number: 36, type: 'summary-completion', prompt: 'Stage 3: creative solving linked to ___', options: [], answer: 'b', explanation: 'REM sleep for creative solving.' },
          { number: 37, type: 'summary-completion', prompt: 'Students who sleep after ___ perform better', options: [], answer: 'f', explanation: 'Sleep after revision improves tests.' },
          { number: 38, type: 'summary-completion', prompt: 'Different stages support ___ and factual recall', options: [], answer: 'g', explanation: 'Motor skills and factual recall.' },
          { number: 39, type: 'summary-completion', prompt: 'Cutting sleep reduces ___ and retention', options: [], answer: 'e', explanation: 'Reduces productivity and retention.' },
        ],
      },
      {
        range: 'Questions 40',
        instruction: 'Choose the correct letter, A, B, C or D.',
        type: 'multiple-choice',
        questions: stripQuestionIds(base.questionGroups[1].questions, 40, 1),
      },
    ],
  }
}

/** TFNG Q14–18 + match paragraph + features + MC */
export function ieltsReadingP2TfngMatchPart(): ReadingImportPartJson {
  const origP2 = MOCK.parts[1]
  const tfngGroup = MOCK.parts[0].questionGroups[0]

  return {
    ...partToImportJson(origP2),
    questionGroups: [
      renumberGroup(tfngGroup, 'Questions 14–18', 14, 5),
      renumberGroup(origP2.questionGroups[0], 'Questions 19–22', 19, 4),
      renumberGroup(origP2.questionGroups[1], 'Questions 23–25', 23, 3),
      renumberGroup(origP2.questionGroups[2], 'Questions 26', 26, 1),
    ],
  }
}

/** Cam10 T4 — summary đoạn văn liền Q14–18 */
export const CAM10_T4_P2_SUMMARY_NOTE = [
  'Psychologists have traditionally believed that a personality 14________ was impossible and that by a 15________ '
  + "a person's character tends to be fixed. This is not true according to positive psychologists, who say that our "
  + 'personal qualities can be seen as habitual behaviour. One of the easiest qualities to acquire is 16________. '
  + 'However, regardless of the quality, it is necessary to learn a wide variety of different 17________ in order '
  + 'for a new quality to develop; for example, a person must understand and feel some 18________ in order to '
  + 'increase their happiness.',
].join('\n')

const CAM10_T4_SECOND_NATURE_FEATURES = [
  { id: 'a', name: 'Christopher Peterson' },
  { id: 'b', name: 'David Fajgenbaum' },
  { id: 'c', name: 'Suzanne Segerstrom' },
  { id: 'd', name: 'Tanya Streeter' },
  { id: 'e', name: 'Todd Kashdan' },
  { id: 'f', name: 'Kenneth Pedeleose' },
  { id: 'g', name: 'Cynthia Pury' },
]

/** Cam10 T4 — summary Q14–18 (note inline) + match people Q19–22 + match para Q23–26 */
export function ieltsReadingP2GapMatchPart(): ReadingImportPartJson {
  return {
    partNumber: 2,
    rangeLabel: 'Read the text and answer questions 14–26.',
    passageTitle: 'Second nature',
    passageSubtitle: "Your personality isn't necessarily set in stone.",
    passage: [
      {
        label: 'A',
        text: 'Psychologists have long held that a person\'s character cannot undergo a transformation in any meaningful way and that the key traits of personality are determined at a very young age. However, researchers have begun looking more closely at ways we can change. Positive psychologists have identified 24 qualities we admire, such as loyalty and kindness, and are studying them to find out why they come so naturally to some people.',
      },
      {
        label: 'B',
        text: '\'The evidence is good that most personality traits can be altered,\' says Christopher Peterson, professor of psychology at the University of Michigan, who cites himself as an example. Inherently introverted, he realised early on that as an academic, his reticence would prove disastrous in the lecture hall. So he learned to be more outgoing and to entertain his classes.',
      },
      {
        label: 'C',
        text: 'David Fajgenbaum had to make a similar transition. He was preparing for university, when he had an accident that put an end to his sports career. On campus, he quickly found that beyond ordinary counselling, the university had no services for students who were undergoing physical rehabilitation and suffering from depression like him. He therefore launched a support group to help others in similar situations.',
      },
      {
        label: 'D',
        text: 'Suzanne Segerstrom, professor of psychology at the University of Kentucky, believes that the key to increasing optimism is through cultivating optimistic behaviour, rather than positive thinking. She recommends you train yourself to pay attention to good fortune by writing down three positive things that come about each day.',
      },
      {
        label: 'E',
        text: 'You can recognise a person who is passionate about a pursuit by the way they are so strongly involved in it. Tanya Streeter\'s passion is freediving — the sport of plunging deep into the water without tanks or other breathing equipment. Streeter learned to untangle her fears from her judgment of what her body and mind could do.',
      },
      {
        label: 'F',
        text: 'Finding a pursuit that excites you can improve anyone\'s life. Psychologist Todd Kashdan has this advice for those people taking up a new passion: \'As a newcomer, you also have to tolerate and laugh at your own ignorance. You must be willing to accept the negative feelings that come your way,\' he says.',
      },
      {
        label: 'G',
        text: 'In 2004, physician-scientist Mauro Zappaterra began his PhD research at Harvard Medical School. Unfortunately, he was miserable as his research wasn\'t compatible with his curiosity about healing. He finally took a break and during eight months in Santa Fe, Zappaterra learned about alternative healing techniques not taught at Harvard. When he got back, he switched labs.',
      },
      {
        label: 'H',
        text: 'Usually, we think of courage in physical terms but ordinary life demands something else. For marketing executive Kenneth Pedeleose, it meant speaking out against something he thought was ethically wrong. According to Cynthia Pury, a psychologist at Clemson University, Pedeleose\'s story proves the point that courage is not motivated by fearlessness, but by moral obligation.',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 14–18',
        instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        note: CAM10_T4_P2_SUMMARY_NOTE,
        questions: gapQuestions(14, [
          { prompt: 'Gap (14)', answer: 'transformation', explanation: 'Tính cách không thể thay đổi có ý nghĩa.' },
          { prompt: 'Gap (15)', answer: 'young age', explanation: 'Đặc điểm hình thành từ rất sớm.' },
          { prompt: 'Gap (16)', answer: 'optimism', explanation: 'Lạc quan dễ phát triển hơn.' },
          { prompt: 'Gap (17)', answer: 'skills', explanation: 'Cần nhiều kỹ năng đa dạng.' },
          { prompt: 'Gap (18)', answer: 'negative emotions', explanation: 'Phải chấp nhận cảm xúc tiêu cực để có niềm vui.' },
        ]),
      },
      {
        range: 'Questions 19–22',
        instruction: 'Look at the following statements and the list of people below. Match each statement with the correct person, A–G.',
        type: 'matching-features',
        features: CAM10_T4_SECOND_NATURE_FEATURES,
        questions: [
          { number: 19, type: 'matching-features', prompt: 'People must accept that they do not know much when first trying something new.', options: [], answer: 'e', explanation: 'Kashdan — chấp nhận ngu dốt khi bắt đầu.' },
          { number: 20, type: 'matching-features', prompt: 'It is important for people to actively notice when good things happen.', options: [], answer: 'c', explanation: 'Segerstrom — ghi 3 điều tích cực mỗi ngày.' },
          { number: 21, type: 'matching-features', prompt: 'Courage can be learned once its origins in a sense of responsibility are understood.', options: [], answer: 'g', explanation: 'Pury — can đảm từ nghĩa vụ đạo đức.' },
          { number: 22, type: 'matching-features', prompt: 'It is possible to overcome shyness when faced with the need to speak in public.', options: [], answer: 'a', explanation: 'Peterson — học hướng ngoại cho giảng dạy.' },
        ],
      },
      {
        range: 'Questions 23–26',
        instruction: 'Reading Passage 2 has eight sections, A–H. Which section contains the following information?',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        questions: [
          { number: 23, type: 'matching-paragraph', prompt: 'a mention of how rational thinking enabled someone to achieve physical goals', options: [], answer: 'd', explanation: 'Streeter tách nỗi sợ khỏi phán đoán thể chất.' },
          { number: 24, type: 'matching-paragraph', prompt: 'an account of how someone overcame a sad experience', options: [], answer: 'b', explanation: 'Fajgenbaum vượt qua tai nạn, trầm cảm.' },
          { number: 25, type: 'matching-paragraph', prompt: 'a description of how someone decided to rethink their academic career path', options: [], answer: 'g', explanation: 'Zappaterra đổi lab, học healing.' },
          { number: 26, type: 'matching-paragraph', prompt: 'an example of how someone risked his career out of a sense of duty', options: [], answer: 'f', explanation: 'Pedeleose tố cáo sếp dù mất việc.' },
        ],
      },
    ],
  }
}

/** Summary (word bank) + YNNG + MC */
export function ieltsReadingP2SummaryYnngMcPart(): ReadingImportPartJson {
  const origP2 = MOCK.parts[1]
  const ynngGroup = DEMO.parts[1].questionGroups[0]
  const wordBank = [
    { id: 'a', label: 'productivity' },
    { id: 'b', label: 'hybrid models' },
    { id: 'c', label: 'structured check-ins' },
    { id: 'd', label: 'physical space' },
    { id: 'e', label: 'communication habits' },
    { id: 'f', label: 'office redesign' },
    { id: 'g', label: 'salary differences' },
  ]

  return {
    ...partToImportJson(origP2),
    questionGroups: [
      {
        range: 'Questions 14–17',
        instruction: 'Complete the summary below. Choose FOUR answers from the box and write the correct letter A–G next to questions 14–17.',
        type: 'summary-completion',
        wordBank,
        questions: [
          { number: 14, type: 'summary-completion', prompt: 'Remote work exposed weak ___', options: [], answer: 'e', explanation: 'Weak communication habits.' },
          { number: 15, type: 'summary-completion', prompt: 'Marsh favours ___ over monitoring hours', options: [], answer: 'c', explanation: 'Structured check-ins.' },
          { number: 16, type: 'summary-completion', prompt: 'Ortiz says brainstorming needs shared ___', options: [], answer: 'd', explanation: 'Shared physical space.' },
          { number: 17, type: 'summary-completion', prompt: 'He predicts ___ will dominate', options: [], answer: 'b', explanation: 'Hybrid models.' },
        ],
      },
      renumberGroup(ynngGroup, 'Questions 18–22', 18, 5),
      renumberGroup(origP2.questionGroups[2], 'Questions 23–26', 23, 4),
    ],
  }
}

/** Gap Q27–31 + YNNG Q32–36 + MC Q37–40 */
export function ieltsReadingP3GapYnngMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[2]
  const ynngGroup = DEMO.parts[1].questionGroups[0]
  const mcGroup = base.questionGroups[1]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(27, [
          { prompt: 'Sleep has long been linked to ___', answer: 'memory', explanation: 'Sleep linked to memory.' },
          { prompt: 'During slow-wave sleep the brain replays experiences from the ___', answer: 'day', explanation: 'Experiences from the day.' },
          { prompt: 'REM sleep supports ___ problem solving.', answer: 'creative', explanation: 'Creative problem solving.' },
          { prompt: 'Some studies use small ___', answer: 'sample sizes', explanation: 'Small sample sizes.' },
          { prompt: 'Cutting sleep reduces ___ and retention.', answer: 'productivity', explanation: 'Reduces productivity.' },
        ]),
      },
      renumberGroup(ynngGroup, 'Questions 32–36', 32, 5),
      renumberGroup(mcGroup, 'Questions 37–40', 37, 4),
    ],
  }
}

const CAM10_T2_P3_SUMMARY_NOTE = [
  'The value attached to original works of art',
  '',
  'People go to art museums because they accept the value of seeing an original work of art. '
  + 'But they do not go to museums to read original manuscripts of novels, perhaps because the availability '
  + 'of novels has depended on 27________ for so long, and also because with novels, the 28________ '
  + 'are the most important thing.',
  '',
  'However, in historical times artists such as Leonardo were happy to instruct 29________ to produce '
  + 'copies of their work and these days new methods of reproduction allow excellent replication of '
  + 'surface relief features as well as colour and 30________',
  '',
  'It is regrettable that museums still promote the superiority of original works of art, since this '
  + 'may not be in the interests of the 31________',
].join('\n')

/** Summary đoạn văn liền (note) + MC + YNNG — Cam10 Test 2 P3 */
export function ieltsReadingP3SummaryMcYnngPart(): ReadingImportPartJson {
  const base = MOCK.parts[2]
  const ynngGroup = DEMO.parts[1].questionGroups[0]
  const mcGroup = base.questionGroups[1]
  const wordBank = [
    { id: 'a', label: 'institution' },
    { id: 'b', label: 'mass production' },
    { id: 'c', label: 'mechanical processes' },
    { id: 'd', label: 'public' },
    { id: 'e', label: 'paints' },
    { id: 'f', label: 'artist' },
    { id: 'g', label: 'size' },
    { id: 'h', label: 'underlying ideas' },
    { id: 'i', label: 'basic technology' },
    { id: 'j', label: 'readers' },
    { id: 'k', label: 'picture frames' },
    { id: 'l', label: 'assistants' },
  ]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Complete the summary using the list of phrases, A–L, below.',
        type: 'summary-completion',
        note: CAM10_T2_P3_SUMMARY_NOTE,
        wordBank,
        questions: [
          { number: 27, type: 'summary-completion', prompt: 'Gap (27)', options: [], answer: 'b', explanation: 'Tiểu thuyết nhờ sản xuất hàng loạt (in ấn).' },
          { number: 28, type: 'summary-completion', prompt: 'Gap (28)', options: [], answer: 'h', explanation: 'Ý nghĩa từ ngữ quan trọng hơn hình thức in.' },
          { number: 29, type: 'summary-completion', prompt: 'Gap (29)', options: [], answer: 'l', explanation: 'Học viên xưởng sao chép tác phẩm.' },
          { number: 30, type: 'summary-completion', prompt: 'Gap (30)', options: [], answer: 'g', explanation: 'Sao chép cả kích thước (scale).' },
          { number: 31, type: 'summary-completion', prompt: 'Gap (31)', options: [], answer: 'd', explanation: 'Không có lợi cho công chúng.' },
        ],
      },
      renumberGroup(mcGroup, 'Questions 32–35', 32, 4),
      renumberGroup(ynngGroup, 'Questions 36–40', 36, 5),
    ],
  }
}

/** Summary (word bank) + YNNG + MC */
export function ieltsReadingP3SummaryYnngMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[2]
  const ynngGroup = DEMO.parts[1].questionGroups[0]
  const mcGroup = base.questionGroups[1]
  const wordBank = [
    { id: 'a', label: 'slow-wave sleep' },
    { id: 'b', label: 'REM sleep' },
    { id: 'c', label: 'neural connections' },
    { id: 'd', label: 'sample sizes' },
    { id: 'e', label: 'creative solving' },
    { id: 'f', label: 'productivity' },
    { id: 'g', label: 'factual recall' },
  ]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Complete the summary below. Choose FIVE answers from the box and write the correct letter A–G next to questions 27–31.',
        type: 'summary-completion',
        wordBank,
        questions: [
          { number: 27, type: 'summary-completion', prompt: 'Experiences replayed during ___', options: [], answer: 'a', explanation: 'Slow-wave sleep.' },
          { number: 28, type: 'summary-completion', prompt: 'Useful ___ are strengthened', options: [], answer: 'c', explanation: 'Neural connections.' },
          { number: 29, type: 'summary-completion', prompt: 'REM linked to ___', options: [], answer: 'e', explanation: 'Creative solving.' },
          { number: 30, type: 'summary-completion', prompt: 'Studies limited by small ___', options: [], answer: 'd', explanation: 'Sample sizes.' },
          { number: 31, type: 'summary-completion', prompt: 'Sleep loss hurts ___', options: [], answer: 'f', explanation: 'Productivity.' },
        ],
      },
      renumberGroup(ynngGroup, 'Questions 32–36', 32, 5),
      renumberGroup(mcGroup, 'Questions 37–40', 37, 4),
    ],
  }
}

/** Cam11 T1 — bảng geo-engineering Q30–36 */
export const CAM11_T1_GEO_ENGINEERING_TABLE: ReadingNoteTable = {
  title: 'GEO-ENGINEERING PROJECTS',
  headers: ['Procedure', 'Aim'],
  gapNumbers: [30, 31, 32, 33, 34, 35, 36],
  rows: [
    {
      cells: [
        [{ type: 'static', text: 'put a large number of tiny spacecraft into orbit far above Earth' }],
        [
          { type: 'static', text: 'to create a ' },
          { type: 'gap', number: 30 },
          { type: 'static', text: ' that would reduce the amount of light reaching Earth' },
        ],
      ],
    },
    {
      cells: [
        [
          { type: 'static', text: 'place ' },
          { type: 'gap', number: 31 },
          { type: 'static', text: ' in the sea' },
        ],
        [
          { type: 'static', text: 'to encourage ' },
          { type: 'gap', number: 32 },
          { type: 'static', text: ' to form' },
        ],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'release aerosol sprays into the stratosphere' }],
        [
          { type: 'static', text: 'to create ' },
          { type: 'gap', number: 33 },
          { type: 'static', text: ' that would reduce the amount of light reaching Earth' },
        ],
      ],
    },
    {
      cells: [
        [
          { type: 'static', text: 'fix strong ' },
          { type: 'gap', number: 34 },
          { type: 'static', text: ' to Greenland ice sheets' },
        ],
        [{ type: 'static', text: 'to prevent icebergs moving into the sea' }],
      ],
    },
    {
      cells: [
        [{ type: 'static', text: 'plant trees in Russian Arctic that would lose their leaves in winter' }],
        [
          { type: 'static', text: 'to allow the ' },
          { type: 'gap', number: 35 },
          { type: 'static', text: ' to reflect radiation' },
        ],
      ],
    },
    {
      cells: [
        [
          { type: 'static', text: 'change the direction of ' },
          { type: 'gap', number: 36 },
        ],
        [{ type: 'static', text: 'to bring more cold water into ice-forming areas' }],
      ],
    },
  ],
}

const CAM11_T1_GEO_SCIENTISTS = [
  { id: 'a', name: 'Roger Angel' },
  { id: 'b', name: 'Phil Rasch' },
  { id: 'c', name: 'Dan Lunt' },
  { id: 'd', name: 'Martin Sommerkorn' },
]

/** Cam11 T1 — match para Q27–29 + table Q30–36 + match người Q37–40 */
export function ieltsReadingP3MatchTableFeaturesPart(): ReadingImportPartJson {
  return {
    partNumber: 3,
    rangeLabel: 'Read the text and answer questions 27–40.',
    passageTitle: 'Reducing the Effects of Climate Change',
    passageSubtitle: 'Mark Rowe reports on the increasingly ambitious geo-engineering projects being explored by scientists',
    passage: [
      {
        label: 'A',
        text: 'Such is our dependence on fossil fuels, and such is the volume of carbon dioxide already released into the atmosphere, that many experts agree that significant global warming is now inevitable. They believe that the best we can do is keep it at a reasonable level, and at present the only serious option for doing this is cutting back on our carbon emissions. But while a few countries are making major strides in this regard, the majority are having great difficulty even stemming the rate of increase, let alone reversing it. Consequently, an increasing number of scientists are beginning to explore the alternative of geo-engineering — a term which generally refers to the intentional large-scale manipulation of the environment. According to its proponents, geo-engineering is the equivalent of a backup generator: if Plan A — reducing our dependency on fossil fuels — fails, we require a Plan B, employing grand schemes to slow down or reverse the process of global warming.',
      },
      {
        label: 'B',
        text: 'Geo-engineering has been shown to work, at least on a small localised scale. For decades, May Day parades in Moscow have taken place under clear blue skies, aircraft having deposited dry ice, silver iodide and cement powder to disperse clouds. Many of the schemes now suggested look to do the opposite, and reduce the amount of sunlight reaching the planet. The most eye-catching idea of all is suggested by Professor Roger Angel of the University of Arizona. His scheme would employ up to 16 trillion minute spacecraft, each weighing about one gram, to form a transparent, sunlight-refracting sunshade in an orbit 1.5 million km above the Earth. This could, argues Angel, reduce the amount of light reaching the Earth by two per cent.',
      },
      {
        label: 'C',
        text: 'The majority of geo-engineering projects so far carried out — which include planting forests in deserts and depositing iron in the ocean to stimulate the growth of algae — have focused on achieving a general cooling of the Earth. But some look specifically at reversing the melting at the poles, particularly the Arctic. The reasoning is that if you replenish the ice sheets and frozen waters of the high latitudes, more light will be reflected back into space, so reducing the warming of the oceans and atmosphere.',
      },
      {
        label: 'D',
        text: 'The concept of releasing aerosol sprays into the stratosphere above the Arctic has been proposed by several scientists. This would involve using sulphur or hydrogen sulphide aerosols so that sulphur dioxide would form clouds, which would, in turn, lead to a global dimming. The idea is modelled on historic volcanic explosions, such as that of Mount Pinatubo in the Philippines in 1991, which led to a short-term cooling of global temperatures by 0.5 °C. Scientists have also scrutinised whether it is possible to preserve the ice sheets of Greenland with reinforced high-tension cables, preventing icebergs from moving into the sea. Meanwhile in the Russian Arctic, geo-engineering plans include the planting of millions of birch trees. Whereas the regions native evergreen pines shade the snow and absorb radiation, birches would shed their leaves in winter, thus enabling radiation to be reflected by the snow. Re-routing Russian rivers to increase cold water flow to ice-forming areas could also be used to slow down warming, say some climate scientists.',
      },
      {
        label: 'E',
        text: 'But will such schemes ever be implemented? Generally speaking, those who are most cautious about geo-engineering are the scientists involved in the research. Angel says that his plan is "no substitute for developing renewable energy: the only permanent solution". And Dr Phil Rasch of the US-based Pacific Northwest National Laboratory is equally guarded about the role of geo-engineering: "I think all of us agree that if we were to end geo-engineering on a given day, then the planet would return to its pre-engineered condition very rapidly, and probably within ten to twenty years. That\'s certainly something to worry about."',
      },
      {
        label: 'F',
        text: 'The US National Center for Atmospheric Research has already suggested that the proposal to inject sulphur into the atmosphere might affect rainfall patterns across the tropics and the Southern Ocean. "Geo-engineering plans to inject stratospheric aerosols or to seed clouds would act to cool the planet, and act to increase the extent of sea ice," says Rasch. "But all the models suggest some impact on the distribution of precipitation."',
      },
      {
        label: 'G',
        text: 'A further risk with geo-engineering projects is that you can "overshoot", says Dr Dan Lunt, from the University of Bristol\'s School of Geophysical Sciences, who has studied the likely impacts of the sunshade and aerosol schemes on the climate. "You may bring global temperatures back to pre-industrial levels, but the risk is that the poles will still be warmer than they should be and the tropics will be cooler than before industrialisation." To avoid such a scenario, Hunt says, "Angel\'s project would have to operate at half strength; all of which reinforces his view that the best option is to avoid the need for geo-engineering altogether."',
      },
      {
        label: 'H',
        text: 'The main reason why geo-engineering is supported by many in the scientific community is that most researchers have little faith in the ability of politicians to agree — and then bring in — the necessary carbon cuts. Even leading conservation organisations see the value of investigating the potential of geo-engineering. According to Dr Martin Sommerkorn, climate change advisor for the World Wildlife Fund\'s International Arctic Programme, "Human-induced climate change has brought humanity to a position where we shouldn\'t exclude thinking thoroughly about this topic and its possibilities."',
      },
    ],
    questionGroups: [
      {
        range: 'Questions 27–29',
        instruction: 'Reading Passage 3 has eight sections, A–H. Which section contains the following information?',
        type: 'matching-paragraph',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        questions: [
          { number: 27, type: 'matching-paragraph', prompt: 'mention of a geo-engineering project based on an earlier natural phenomenon', options: [], answer: 'd', explanation: 'Mô hình theo núi lửa Pinatubo 1991.' },
          { number: 28, type: 'matching-paragraph', prompt: 'an example of a successful use of geo-engineering', options: [], answer: 'b', explanation: 'May Day Moscow — phân tán mây bằng máy bay.' },
          { number: 29, type: 'matching-paragraph', prompt: 'a common definition of geo-engineering', options: [], answer: 'a', explanation: 'Định nghĩa thao tác môi trường quy mô lớn.' },
        ],
      },
      {
        range: 'Questions 30–36',
        instruction: 'Complete the table below. Choose ONE WORD ONLY from the passage for each answer.',
        type: 'gap-fill',
        noteTable: CAM11_T1_GEO_ENGINEERING_TABLE,
        questions: gapQuestions(30, [
          { prompt: 'Gap (30)', answer: 'sunshade|shield', explanation: 'Tấm chắn ánh sáng quỹ đạo (sunshade).' },
          { prompt: 'Gap (31)', answer: 'iron', explanation: 'Rải sắt kích thích tảo.' },
          { prompt: 'Gap (32)', answer: 'algae', explanation: 'Kích thích tảo phát triển.' },
          { prompt: 'Gap (33)', answer: 'clouds', explanation: 'Aerosol tạo mây làm mờ toàn cầu.' },
          { prompt: 'Gap (34)', answer: 'cables', explanation: 'Cáp căng giữ băng Greenland.' },
          { prompt: 'Gap (35)', answer: 'snow', explanation: 'Tuyết phản xạ bức xạ.' },
          { prompt: 'Gap (36)', answer: 'rivers', explanation: 'Đổi hướng sông Nga.' },
        ]),
      },
      {
        range: 'Questions 37–40',
        instruction: 'Look at the following statements and the list of scientists below. Match each statement with the correct scientist, A–D.',
        type: 'matching-features',
        features: CAM11_T1_GEO_SCIENTISTS,
        questions: [
          { number: 37, type: 'matching-features', prompt: 'The effects of geo-engineering may not be long-lasting.', options: [], answer: 'b', explanation: 'Rasch — hiệu ứng mất sau 10–20 năm.' },
          { number: 38, type: 'matching-features', prompt: 'Geo-engineering is a topic worth exploring.', options: [], answer: 'd', explanation: 'Sommerkorn — nên nghiên cứu kỹ.' },
          { number: 39, type: 'matching-features', prompt: 'It may be necessary to limit the effectiveness of geo-engineering projects.', options: [], answer: 'c', explanation: 'Lunt — tránh overshoot, chạy 50% công suất.' },
          { number: 40, type: 'matching-features', prompt: 'Research into non-fossil-based fuels cannot be replaced by geo-engineering.', options: [], answer: 'a', explanation: 'Angel — không thay năng lượng tái tạo.' },
        ],
      },
    ],
  }
}

/** Gap Q27–31 + TFNG Q32–36 + MC Q37–40 */
export function ieltsReadingP3GapTfngMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[2]
  const tfngGroup = base.questionGroups[0]
  const mcGroup = base.questionGroups[1]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 27–31',
        instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        type: 'gap-fill',
        questions: gapQuestions(27, [
          { prompt: 'Sleep is linked to ___', answer: 'memory', explanation: 'Linked to memory.' },
          { prompt: 'Brain replays experiences from the ___', answer: 'day', explanation: 'From the day.' },
          { prompt: 'REM supports ___ solving', answer: 'creative', explanation: 'Creative solving.' },
          { prompt: 'Studies may have small ___', answer: 'sample sizes', explanation: 'Small sample sizes.' },
          { prompt: 'Less sleep lowers ___', answer: 'productivity', explanation: 'Lowers productivity.' },
        ]),
      },
      renumberGroup(tfngGroup, 'Questions 32–36', 32, 5),
      renumberGroup(mcGroup, 'Questions 37–40', 37, 4),
    ],
  }
}

/** YNNG Q27–32 + MC Q33–40 */
export function ieltsReadingP3YnngMcPart(): ReadingImportPartJson {
  const base = MOCK.parts[2]
  const ynngGroup = DEMO.parts[1].questionGroups[0]
  const mcGroup = base.questionGroups[1]

  const ynngQs = [
    ...ynngGroup.questions,
    {
      ...ynngGroup.questions[0],
      prompt: 'The writer is dismissive of all sleep research findings.',
      answer: 'no',
      explanation: 'Writer presents evidence while noting limitations.',
    },
  ]

  return {
    ...partToImportJson(base),
    questionGroups: [
      {
        range: 'Questions 27–32',
        instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? Write YES, NO or NOT GIVEN.',
        type: 'ynng',
        questions: ynngQs.slice(0, 6).map((q, i) => ({
          number: 27 + i,
          type: 'yes-no-not-given' as const,
          prompt: q.prompt,
          options: YNNG_OPTIONS,
          answer: q.answer,
          explanation: q.explanation,
        })),
      },
      renumberGroup(mcGroup, 'Questions 33–40', 33, 8),
    ],
  }
}

const TEMPLATE_BUILDERS: Record<IeltsReadingWizardTemplateKind, () => ReadingImportPartJson> = {
  'p1-r1-tfng-mc': ieltsReadingP1R1Part,
  'p1-r1-tfng-gap': ieltsReadingP1TfngGapPart,
  'p1-r1-tfng-gap-table': ieltsReadingP1TfngGapTablePart,
  'p1-r1-notes-tfng': ieltsReadingP1NotesTfngPart,
  'p1-r1-headings-mc': ieltsReadingP1HeadingsMcPart,
  'p1-r1-sentence-mc': ieltsReadingP1SentenceMcPart,
  'p1-r1-headings-gap': ieltsReadingP1HeadingsGapPart,
  'p1-r1-gap-mc': ieltsReadingP1GapMcPart,
  'p2-r2-match-mc': ieltsReadingP2R2Part,
  'p2-r2-ynng-match': ieltsReadingP2YnngMatchPart,
  'p2-r2-headings-ynng': ieltsReadingP2HeadingsYnngPart,
  'p2-r2-tfng-match': ieltsReadingP2TfngMatchPart,
  'p2-r2-gap-match': ieltsReadingP2GapMatchPart,
  'p2-r2-summary-ynng-mc': ieltsReadingP2SummaryYnngMcPart,
  'p3-r3-tfng-mc': ieltsReadingP3R3Part,
  'p3-r3-gap-tfng-flow-mc': ieltsReadingP3GapTfngFlowMcPart,
  'p3-r3-ynng-mc': ieltsReadingP3YnngMcPart,
  'p3-r3-gap-ynng-mc': ieltsReadingP3GapYnngMcPart,
  'p3-r3-summary-ynng-mc': ieltsReadingP3SummaryYnngMcPart,
  'p3-r3-summary-mc-ynng': ieltsReadingP3SummaryMcYnngPart,
  'p3-r3-gap-tfng-mc': ieltsReadingP3GapTfngMcPart,
  'p3-r3-match-table-features': ieltsReadingP3MatchTableFeaturesPart,
}

export function getIeltsReadingWizardTemplatePart(
  passageNumber: IeltsReadingPassageNumber,
  kind: IeltsReadingWizardTemplateKind,
): ReadingImportPartJson {
  const part = TEMPLATE_BUILDERS[kind]()
  return { ...part, partNumber: passageNumber }
}