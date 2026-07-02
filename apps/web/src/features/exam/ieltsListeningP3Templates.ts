import type { ListeningImportPayload } from './importListeningUtils'

type Q = ListeningImportPayload['parts'][0]['questions'][0]

function mc(
  number: number,
  prompt: string,
  a: string,
  b: string,
  c: string,
  answer: string,
  extra?: Partial<Q>,
): Q {
  return {
    number,
    type: 'multiple-choice',
    prompt,
    options: [
      { id: 'A', label: a },
      { id: 'B', label: b },
      { id: 'C', label: c },
    ],
    answer,
    explanation: 'Chọn theo audio.',
    ...extra,
  }
}

function chooseTwo(
  start: number,
  prompt: string,
  options: Array<{ id: string; label: string }>,
  extra?: Partial<Q>,
): Q[] {
  return [start, start + 1].map(number => ({
    number,
    type: 'matching' as const,
    prompt,
    options,
    answer: 'A/E',
    explanation: 'Choose TWO.',
    ...extra,
  }))
}

/** c1 — MC 21–22 + sentence completion 23–25 + notes 26–30. */
export function ieltsListeningP3C1Part() {
  return {
    partNumber: 3,
    rangeLabel: 'Questions 21–30',
    instruction:
      'Questions 21–22: Choose A, B or C. Questions 23–25: Complete sentences (ONE WORD). '
      + 'Questions 26–30: Complete notes (NO MORE THAN THREE WORDS AND/OR A NUMBER).',
    audioFile: 'listening.mp3',
    notePassageLayout: 'form' as const,
    notePassageSections: [
      {
        gapNumbers: [23, 24, 25],
        instruction: 'Complete the sentences below. Write ONE WORD ONLY for each answer.',
        blocks: [
          { type: 'static' as const, text: 'Kira says that lecturers are easier to' },
          { type: 'gap' as const, number: 23 },
          { type: 'static' as const, text: 'than those in her home country.' },
          { type: 'static' as const, text: 'Paul suggests that Kira may be more' },
          { type: 'gap' as const, number: 24 },
          { type: 'static' as const, text: 'than when she was studying before.' },
          { type: 'static' as const, text: 'Kira says that students want to discuss things that worry them or that' },
          { type: 'gap' as const, number: 25 },
          { type: 'static' as const, text: 'them very much.' },
        ],
      },
      {
        gapNumbers: [26, 27, 28, 29, 30],
        instruction:
          'Complete the notes below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
        blocks: [
          { type: 'static' as const, text: 'How did the students do their practical sessions?' },
          { type: 'gap' as const, number: 26 },
          { type: 'static' as const, text: 'In the second semester how often did Kira work in a hospital?' },
          { type: 'gap' as const, number: 27 },
          { type: 'static' as const, text: 'How much full-time work did Kira do during the year?' },
          { type: 'gap' as const, number: 28 },
          { type: 'static' as const, text: 'Having completed the year, how does Kira feel?' },
          { type: 'gap' as const, number: 29 },
          { type: 'static' as const, text: 'In addition to the language, what do overseas students need to become familiar with?' },
          { type: 'gap' as const, number: 30 },
        ],
      },
    ],
    questions: [
      mc(21, 'In her home country, Kira had', 'completed a course', 'done two years of a course', 'found her course difficult', 'C', {
        sectionRange: 'Questions 21 – 22',
        sectionInstruction: 'Choose the correct letter A, B or C.',
      }),
      mc(22, 'To succeed with assignments, Kira had to', 'read faster', 'write faster', 'change her way of thinking', 'C'),
      {
        number: 23, type: 'gap-fill' as const, prompt: 'Lecturers easier to:', options: [], answer: 'understand',
        wordLimit: 1, sectionRange: 'Questions 23 – 25',
        sectionInstruction: 'Complete the sentences below. Write ONE WORD ONLY for each answer.',
      },
      { number: 24, type: 'gap-fill' as const, prompt: 'More:', options: [], answer: 'mature', wordLimit: 1 },
      { number: 25, type: 'gap-fill' as const, prompt: 'Affect them:', options: [], answer: 'affect', wordLimit: 1 },
      {
        number: 26, type: 'gap-fill' as const, prompt: 'Practical sessions:', options: [], answer: 'in small groups',
        wordLimit: 3, sectionRange: 'Questions 26 – 30',
        sectionInstruction: 'Complete the notes below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
      },
      { number: 27, type: 'gap-fill' as const, prompt: 'Hospital work frequency:', options: [], answer: 'every other day', wordLimit: 3 },
      { number: 28, type: 'gap-fill' as const, prompt: 'Full-time work:', options: [], answer: 'two days', wordLimit: 2 },
      { number: 29, type: 'gap-fill' as const, prompt: 'How Kira feels:', options: [], answer: 'much more confident', wordLimit: 3 },
      { number: 30, type: 'gap-fill' as const, prompt: 'Become familiar with:', options: [], answer: 'the education system', wordLimit: 3 },
    ],
  }
}

/** c2 — Notes 21–23 + table 24–28 + notes 29–30. */
export function ieltsListeningP3C2Part() {
  return {
    partNumber: 3,
    rangeLabel: 'Questions 21–30',
    instruction: 'Complete the notes and table. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
    audioFile: 'listening.mp3',
    notePassageSections: [
      {
        gapNumbers: [21, 22, 23],
        instruction:
          'Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
        title: 'Study Skills Tutorial – Caroline Benning',
        blocks: [
          { type: 'static' as const, text: 'Dissertation topic: the' },
          { type: 'gap' as const, number: 21 },
          { type: 'section' as const, text: 'Strengths:' },
          { type: 'gap' as const, number: 22 },
          { type: 'static' as const, text: 'computer modelling' },
          { type: 'section' as const, text: 'Weaknesses:' },
          { type: 'static' as const, text: 'lack of background information' },
          { type: 'static' as const, text: 'poor' },
          { type: 'gap' as const, number: 23 },
          { type: 'static' as const, text: 'skills' },
        ],
      },
      {
        gapNumbers: [29, 30],
        instruction:
          'Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
        blocks: [
          { type: 'section' as const, text: 'Recommendations:' },
          { type: 'static' as const, text: 'use a card index' },
          { type: 'static' as const, text: 'read all notes' },
          { type: 'gap' as const, number: 29 },
          { type: 'static' as const, text: 'Next tutorial date:' },
          { type: 'gap' as const, number: 30 },
          { type: 'static' as const, text: 'January' },
        ],
      },
    ],
    noteTables: [
      {
        gapNumbers: [24, 25, 26, 27, 28],
        instruction:
          'Complete the table below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
        title: 'Study Strategies',
        headers: ['Possible strategy', 'Benefits', 'Problems'],
        rows: [
          {
            cells: [
              [{ type: 'static' as const, text: 'peer group discussion' }],
              [
                { type: 'static' as const, text: 'increases' },
                { type: 'gap' as const, number: 24 },
              ],
              [
                { type: 'static' as const, text: 'dissertations tend to contain the same' },
                { type: 'gap' as const, number: 25 },
              ],
            ],
          },
          {
            cells: [
              [
                { type: 'static' as const, text: 'use the' },
                { type: 'gap' as const, number: 26 },
                { type: 'static' as const, text: 'service' },
              ],
              [{ type: 'static' as const, text: 'provides structured programme' }],
              [
                { type: 'static' as const, text: 'limited' },
                { type: 'gap' as const, number: 27 },
              ],
            ],
          },
          {
            cells: [
              [{ type: 'static' as const, text: 'consult study skills books' }],
              [{ type: 'static' as const, text: 'are a good source of reference' }],
              [
                { type: 'static' as const, text: 'can be too' },
                { type: 'gap' as const, number: 28 },
              ],
            ],
          },
        ],
      },
    ],
    questions: [
      { number: 21, type: 'gap-fill' as const, prompt: 'Dissertation topic:', options: [], answer: 'city', wordLimit: 2 },
      { number: 22, type: 'gap-fill' as const, prompt: 'Strength:', options: [], answer: 'data analysis', wordLimit: 2 },
      { number: 23, type: 'gap-fill' as const, prompt: 'Weakness:', options: [], answer: 'writing', wordLimit: 1 },
      { number: 24, type: 'gap-fill' as const, prompt: 'Benefit:', options: [], answer: 'motivation', wordLimit: 1 },
      { number: 25, type: 'gap-fill' as const, prompt: 'Problem:', options: [], answer: 'ideas', wordLimit: 1 },
      { number: 26, type: 'gap-fill' as const, prompt: 'Service:', options: [], answer: 'library', wordLimit: 1 },
      { number: 27, type: 'gap-fill' as const, prompt: 'Limited:', options: [], answer: 'time', wordLimit: 1 },
      { number: 28, type: 'gap-fill' as const, prompt: 'Too:', options: [], answer: 'general', wordLimit: 1 },
      { number: 29, type: 'gap-fill' as const, prompt: 'Read notes:', options: [], answer: 'carefully', wordLimit: 1 },
      { number: 30, type: 'gap-fill' as const, prompt: 'Tutorial date:', options: [], answer: '21st', wordLimit: 1 },
    ],
  }
}

/** c3 — Choose TWO ×2 + MC 25–30 (Heyerdahl — giống cấu trúc Cam20 P3). */
export function ieltsListeningP3C3Part() {
  const hobbies = [
    { id: 'A', label: 'camping' },
    { id: 'B', label: 'climbing' },
    { id: 'C', label: 'collecting' },
    { id: 'D', label: 'hunting' },
    { id: 'E', label: 'reading' },
  ]
  const island = [
    { id: 'A', label: 'to examine ancient carvings' },
    { id: 'B', label: 'to experience an isolated place' },
    { id: 'C', label: 'to formulate a new theory' },
    { id: 'D', label: 'to learn survival skills' },
    { id: 'E', label: 'to study the impact of an extreme environment' },
  ]

  return {
    partNumber: 3,
    rangeLabel: 'Questions 21–30',
    instruction:
      'Questions 21–24: Choose TWO letters A–E. Questions 25–30: Choose A, B or C.',
    audioFile: 'listening.mp3',
    questions: [
      ...chooseTwo(21, 'Which TWO hobbies was Thor Heyerdahl very interested in as a youth?', hobbies, {
        sectionRange: 'Questions 21 – 22',
        sectionInstruction: 'Choose TWO letters, A–E.',
      }),
      ...chooseTwo(23, 'Which do the speakers say are the TWO reasons why Heyerdahl went to live on an island?', island, {
        sectionRange: 'Questions 23 – 24',
        sectionInstruction: 'Choose TWO letters, A–E.',
      }),
      mc(25, 'According to Victor and Olivia, academics thought that Polynesian migration from the east was impossible due to', 'the fact that Eastern countries were far away', 'the lack of materials for boat building', 'the direction of the winds and currents', 'B', {
        sectionRange: 'Questions 25 – 30',
        sectionInstruction: 'Choose the correct letter A, B or C.',
        sectionTitle: 'THE LATER LIFE OF THOR HEYERDAHL',
      }),
      mc(26, 'Which do the speakers agree was the main reason for Heyerdahl\'s raft journey?', 'to overcome a research setback', 'to demonstrate a personal quality', 'to test a new theory', 'C'),
      mc(27, 'What was most important to Heyerdahl about his raft journey?', 'the fact that he was the first person to do it', 'the speed of crossing the Pacific', 'the use of authentic construction methods', 'C'),
      mc(28, 'Why did Heyerdahl go to Easter Island?', 'to build a stone statue', 'to sail a reed boat', 'to learn the local language', 'B'),
      mc(29, 'In Olivia\'s opinion, Heyerdahl\'s greatest influence was on', 'theories about Polynesian origins', 'the development of archaeological methodology', 'establishing archaeology as an academic subject', 'B'),
      mc(30, 'What criticism do the speakers make of William Oliver\'s textbook?', 'Its style is out of date', 'Its content is over simplified', 'Its methodology is flawed', 'B'),
    ],
  }
}

/** c4 — MC 21–25 + matching 26–30. */
export function ieltsListeningP3C4Part() {
  const yearAbroad = [
    { id: 'A', label: 'be on time' },
    { id: 'B', label: 'get a letter of recommendation' },
    { id: 'C', label: 'plan for the final year' },
    { id: 'D', label: 'make sure the institution\'s focus is relevant' },
    { id: 'E', label: 'show ability in Theatre Studies' },
    { id: 'F', label: 'make travel arrangements and bookings' },
    { id: 'G', label: 'ask for help' },
  ]

  return {
    partNumber: 3,
    rangeLabel: 'Questions 21–30',
    instruction: 'Questions 21–25: Choose A, B or C. Questions 26–30: Matching A–G.',
    audioFile: 'listening.mp3',
    questions: [
      mc(21, 'What helped Rob to prepare to play the character of a doctor?', 'the stories his grandfather told him', 'the times when he watched his grandfather working', 'the way he imagined his grandfather at work', 'C', {
        sectionRange: 'Questions 21 – 25',
        sectionInstruction: 'Choose the correct letter A, B or C.',
      }),
      mc(22, 'In the play\'s first scene, the boredom of village life was suggested by', 'repetition of words and phrases', 'scenery painted in dull colours', 'long pauses within conversations', 'A'),
      mc(23, 'What has Rob learned about himself through working in a group?', 'He likes to have clear guidelines', 'He copes well with stress', 'He thinks he is a good leader', 'A'),
      mc(24, 'To support the production, research material was used which described', 'political developments', 'changing social attitudes', 'economic transformations', 'B'),
      mc(25, 'What problem did the students overcome in the final rehearsal?', 'one person forgetting their words', 'an equipment failure', 'the injury of one character', 'B'),
      {
        number: 26, type: 'matching' as const, prompt: 'in the second year of the course',
        options: yearAbroad, answer: 'C',
        sectionRange: 'Questions 26 – 30',
        sectionInstruction:
          'What action is needed for each of the following stages in doing the \'year abroad\' option? '
          + 'Choose FIVE answers from the box and write the correct letter A–G next to questions 26–30.',
        sectionTitle: 'YEAR ABROAD OPTION',
      },
      { number: 27, type: 'matching' as const, prompt: 'when first choosing where to go', options: yearAbroad, answer: 'D' },
      { number: 28, type: 'matching' as const, prompt: 'when sending in your choices', options: yearAbroad, answer: 'B' },
      { number: 29, type: 'matching' as const, prompt: 'when writing your personal statement', options: yearAbroad, answer: 'E' },
      { number: 30, type: 'matching' as const, prompt: 'when doing the year abroad', options: yearAbroad, answer: 'F' },
    ],
  }
}

/** c5 — Choose TWO ×2 + matching 25–30. */
export function ieltsListeningP3C5Part() {
  const skills = [
    { id: 'A', label: 'communication' },
    { id: 'B', label: 'design' },
    { id: 'C', label: 'IT' },
    { id: 'D', label: 'marketing' },
    { id: 'E', label: 'organisation' },
  ]
  const benefits = [
    { id: 'A', label: 'updates for its software' },
    { id: 'B', label: 'cost savings' },
    { id: 'C', label: 'an improved image' },
    { id: 'D', label: 'new clients' },
    { id: 'E', label: 'a growth in sales' },
  ]
  const sources = [
    { id: 'A', label: 'company manager' },
    { id: 'B', label: 'company\'s personnel department' },
    { id: 'C', label: 'personal tutor' },
    { id: 'D', label: 'psychology department' },
    { id: 'E', label: 'mentor' },
    { id: 'F', label: 'university careers officer' },
    { id: 'G', label: 'internet' },
  ]

  return {
    partNumber: 3,
    rangeLabel: 'Questions 21–30',
    instruction: 'Questions 21–24: Choose TWO A–E. Questions 25–30: Matching A–G.',
    audioFile: 'listening.mp3',
    questions: [
      ...chooseTwo(21, 'Which TWO skills did Laura improve as a result of her work placement?', skills, {
        sectionRange: 'Questions 21 – 22',
        sectionInstruction: 'Choose TWO letters, A–E.',
      }),
      ...chooseTwo(23, 'Which TWO immediate benefits did the company get from Laura\'s work placement?', benefits, {
        sectionRange: 'Questions 23 – 24',
        sectionInstruction: 'Choose TWO letters, A–E.',
      }),
      {
        number: 25, type: 'matching' as const, prompt: 'obtaining booklet',
        options: sources, answer: 'F',
        sectionRange: 'Questions 25 – 30',
        sectionInstruction:
          'What source of information should Tim use at each of the following stages of the work placement? '
          + 'Choose SIX answers from the box and write the correct letter A–G next to questions 25–30.',
        sectionTitle: 'WORK PLACEMENT SOURCES',
      },
      { number: 26, type: 'matching' as const, prompt: 'discussing options', options: sources, answer: 'C' },
      { number: 27, type: 'matching' as const, prompt: 'getting updates', options: sources, answer: 'E' },
      { number: 28, type: 'matching' as const, prompt: 'responding to invitation for interview', options: sources, answer: 'B' },
      { number: 29, type: 'matching' as const, prompt: 'informing about outcome of interview', options: sources, answer: 'B' },
      { number: 30, type: 'matching' as const, prompt: 'requesting a reference', options: sources, answer: 'C' },
    ],
  }
}

/** c6 — MC 21–25 + flow-chart 26–30. */
export function ieltsListeningP3C6Part() {
  const flowOpts = [
    { id: 'A', label: 'bullet points' },
    { id: 'B', label: 'film' },
    { id: 'C', label: 'notes' },
    { id: 'D', label: 'structure' },
    { id: 'E', label: 'student paper' },
    { id: 'F', label: 'textbook' },
    { id: 'G', label: 'documentary' },
  ]

  return {
    partNumber: 3,
    rangeLabel: 'Questions 21–30',
    instruction: 'Questions 21–25: Choose A, B or C. Questions 26–30: Complete the flow-chart A–G.',
    audioFile: 'listening.mp3',
    questions: [
      mc(21, 'James chose to take Scandinavian Studies because when he was a child', 'he was often taken to Denmark', 'his mother spoke to him in Danish', 'a number of Danish people visited his family', 'B', {
        sectionRange: 'Questions 21 – 25',
        sectionInstruction: 'Choose the correct letter A, B or C.',
      }),
      mc(22, 'When he graduates, James would like to', 'take a postgraduate course', 'work in the media', 'become a translator', 'B'),
      mc(23, 'Which course will end this term?', 'Swedish cinema', 'Danish television programmes', 'Scandinavian literature', 'C'),
      mc(24, 'They agree that James\'s literature paper this term will be on', '19th century playwrights', 'the Icelandic sagas', 'modern Scandinavian novels', 'B'),
      mc(25, 'Beth recommends that James\'s paper should be', 'a historical overview of the genre', 'an in-depth analysis of a single writer', 'a study of the social background to the literature', 'C'),
      {
        number: 26, type: 'matching' as const, prompt: '',
        options: flowOpts, answer: 'G', flowChart: true,
        flowChartEnd: 'He\'ll write the complete paper.',
        gapLead: 'He\'ll read', gapTrail: 'and choose his topic.',
        sectionRange: 'Questions 26 – 30',
        sectionInstruction:
          'Complete the flow-chart below. Choose FIVE answers from the box and write the correct letter A–G next to questions 26–30.',
        sectionTitle: 'How James will write his paper on the Vikings',
      },
      { number: 27, type: 'matching' as const, prompt: '', options: flowOpts, answer: 'F', flowChart: true, gapLead: 'He\'ll borrow a', gapTrail: 'from Beth.' },
      { number: 28, type: 'matching' as const, prompt: '', options: flowOpts, answer: 'D', flowChart: true, gapLead: 'He\'ll plan the', gapTrail: 'of the paper.' },
      { number: 29, type: 'matching' as const, prompt: '', options: flowOpts, answer: 'C', flowChart: true, gapLead: 'He\'ll read some source material and write', gapTrail: '' },
      { number: 30, type: 'matching' as const, prompt: '', options: flowOpts, answer: 'A', flowChart: true, gapLead: 'He\'ll write the paper using', gapTrail: '' },
    ],
  }
}

/** c7 — Table 21–24 + matching 25–30. */
export function ieltsListeningP3C7Part() {
  const filmOpts = [
    { id: 'A', label: 'clearly shows the historical period' },
    { id: 'B', label: 'contains only parts of the play' },
    { id: 'C', label: 'is too similar to another kind of film' },
    { id: 'D', label: 'turned out to be unpopular with audiences' },
    { id: 'E', label: 'presents the play in a different period from the original' },
    { id: 'F', label: 'sets the original in a different country' },
    { id: 'G', label: 'incorporates a variety of art forms' },
  ]

  return {
    partNumber: 3,
    rangeLabel: 'Questions 21–30',
    instruction: 'Questions 21–24: Complete the table (ONE WORD). Questions 25–30: Matching A–G.',
    audioFile: 'listening.mp3',
    notePassageLayout: 'table' as const,
    noteTables: [
      {
        gapNumbers: [21, 22, 23, 24],
        instruction: 'Complete the table below. Write ONE WORD ONLY for each answer.',
        title: 'Presentation of film adaptations of Shakespeare\'s plays',
        headers: ['Stages of presentation', 'Work still to be done'],
        rows: [
          {
            cells: [
              [
                { type: 'static' as const, text: 'Introduce Giannetti\'s book containing a' },
                { type: 'gap' as const, number: 21 },
                { type: 'static' as const, text: 'of adaptations' },
              ],
              [{ type: 'static' as const, text: 'Organise notes' }],
            ],
          },
          {
            cells: [
              [
                { type: 'static' as const, text: 'Ask class to suggest the' },
                { type: 'gap' as const, number: 22 },
                { type: 'static' as const, text: 'adaptations' },
              ],
              [{ type: 'static' as const, text: 'No further work needed' }],
            ],
          },
          {
            cells: [
              [{ type: 'static' as const, text: 'Present Rachel Malchow\'s ideas' }],
              [
                { type: 'static' as const, text: 'Prepare some' },
                { type: 'gap' as const, number: 23 },
              ],
            ],
          },
          {
            cells: [
              [
                { type: 'static' as const, text: 'Discuss relationship between adaptations and' },
                { type: 'gap' as const, number: 24 },
                { type: 'static' as const, text: 'at the time of making the film' },
              ],
              [{ type: 'static' as const, text: 'No further work needed' }],
            ],
          },
        ],
      },
    ],
    questions: [
      { number: 21, type: 'gap-fill' as const, prompt: 'Book contains:', options: [], answer: 'collection', wordLimit: 1 },
      { number: 22, type: 'gap-fill' as const, prompt: 'Suggest:', options: [], answer: 'best', wordLimit: 1 },
      { number: 23, type: 'gap-fill' as const, prompt: 'Prepare:', options: [], answer: 'slides', wordLimit: 1 },
      { number: 24, type: 'gap-fill' as const, prompt: 'Relationship:', options: [], answer: 'politics', wordLimit: 1 },
      {
        number: 25, type: 'matching' as const, prompt: 'Ran',
        options: filmOpts, answer: 'A',
        sectionRange: 'Questions 25 – 30',
        sectionInstruction:
          'What do the speakers say about each of the following films? '
          + 'Choose SIX answers from the box and write the correct letter A–G next to questions 25–30.',
        sectionTitle: 'FILMS',
      },
      { number: 26, type: 'matching' as const, prompt: 'Much Ado About Nothing', options: filmOpts, answer: 'E' },
      { number: 27, type: 'matching' as const, prompt: 'Romeo & Juliet', options: filmOpts, answer: 'F' },
      { number: 28, type: 'matching' as const, prompt: 'Hamlet', options: filmOpts, answer: 'B' },
      { number: 29, type: 'matching' as const, prompt: 'Prospero\'s Books', options: filmOpts, answer: 'G' },
      { number: 30, type: 'matching' as const, prompt: 'Looking for Richard', options: filmOpts, answer: 'C' },
    ],
  }
}

export type IeltsListeningP3TemplateKind =
  | 'p3-c1' | 'p3-c2' | 'p3-c3' | 'p3-c4' | 'p3-c5' | 'p3-c6' | 'p3-c7'

export function buildIeltsListeningP3Template(
  kind: IeltsListeningP3TemplateKind,
): ListeningImportPayload {
  const parts = {
    'p3-c1': ieltsListeningP3C1Part,
    'p3-c2': ieltsListeningP3C2Part,
    'p3-c3': ieltsListeningP3C3Part,
    'p3-c4': ieltsListeningP3C4Part,
    'p3-c5': ieltsListeningP3C5Part,
    'p3-c6': ieltsListeningP3C6Part,
    'p3-c7': ieltsListeningP3C7Part,
  }

  const labels: Record<IeltsListeningP3TemplateKind, string> = {
    'p3-c1': 'c1 — MC + Sentences + Notes',
    'p3-c2': 'c2 — Notes + Table + Notes',
    'p3-c3': 'c3 — Choose TWO ×2 + MC',
    'p3-c4': 'c4 — MC + Matching',
    'p3-c5': 'c5 — Choose TWO ×2 + Match',
    'p3-c6': 'c6 — MC + Flow-chart',
    'p3-c7': 'c7 — Table + Matching',
  }

  return {
    version: 1,
    title: `IELTS Listening — Part 3 (${labels[kind]})`,
    durationMinutes: 30,
    bandHint: `IELTS · Part 3 · Giaodien/Part3-Listening/${kind.replace('p3-', '')}.jpg`,
    examType: 'ielts',
    examMode: 'practice',
    parts: [parts[kind]()],
  }
}

export function ieltsListeningP3TemplateFilename(kind: IeltsListeningP3TemplateKind): string {
  return `ielts-listening-${kind}-template.json`
}