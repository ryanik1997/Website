import type { ListeningImportPayload } from './importListeningUtils'

type Q = ListeningImportPayload['parts'][0]['questions'][0]

function gap(
  number: number,
  prompt: string,
  answer: string,
  wordLimit: number,
  extra?: Partial<Q>,
): Q {
  return {
    number,
    type: 'gap-fill',
    prompt,
    options: [],
    answer,
    explanation: 'Điền theo audio.',
    wordLimit,
    ...extra,
  }
}

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

/** d1 — Lecture notes nhiều section + bullet • (Cam9 Whales, TWO WORDS). */
export function ieltsListeningP4D1Part() {
  return {
    partNumber: 4,
    rangeLabel: 'Questions 31–40',
    instruction: 'Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.',
    audioFile: 'listening.mp3',
    passageTitle: 'Mass Strandings of Whales and Dolphins',
    notePassage: [
      { type: 'static' as const, text: 'Mass strandings: situations where groups of whales, dolphins, etc. swim onto the beach and die.' },
      { type: 'gap' as const, number: 31 },
      { type: 'static' as const, text: 'Several other theories:' },
      { type: 'section' as const, text: 'Parasites' },
      { type: 'gap' as const, number: 32 },
      { type: 'section' as const, text: 'Toxins' },
      { type: 'gap' as const, number: 33 },
      { type: 'static' as const, text: 'e.g. Cape Cod (1988) — whales were killed by saxitoxin' },
      { type: 'section' as const, text: 'Accidental Strandings' },
      { type: 'static' as const, text: 'Animals may follow prey ashore, e.g. Thurston (1995)' },
      { type: 'gap' as const, number: 34 },
      { type: 'section' as const, text: 'Human Activity' },
      { type: 'gap' as const, number: 35 },
      { type: 'static' as const, text: 'The Bahamas (2000) military sonar was unusual because the whales' },
      { type: 'gap' as const, number: 36 },
      { type: 'gap' as const, number: 37 },
      { type: 'section' as const, text: 'Group Behaviour' },
      { type: 'gap' as const, number: 38 },
      { type: 'gap' as const, number: 39 },
      { type: 'section' as const, text: 'Further Reading' },
      { type: 'gap' as const, number: 40 },
    ],
    questions: [
      gap(31, 'Areas where … can change quickly:', 'tide', 1,
        { gapLead: 'Common in areas where the', gapTrail: 'can change quickly' }),
      gap(32, 'Parasites affect:', 'hearing', 1,
        { gapLead: 'e.g. some parasites can affect marine animals\'', gapTrail: ', which they depend on for navigation' }),
      gap(33, 'Toxins from:', 'plants animals', 2,
        { gapLead: 'Poisons from', gapTrail: 'or ……….. are commonly consumed by whales' }),
      gap(34, 'Accidental strandings:', 'feeding', 1,
        { gapLead: 'Unlikely because the majority of animals were not', gapTrail: 'when they stranded' }),
      gap(35, 'Noise from military tests:', 'noise', 1,
        { gapTrail: 'from military tests are linked to some recent strandings' }),
      gap(36, 'Whales were all:', 'healthy', 1, { gapLead: '• were all' }),
      gap(37, 'Were not in a:', 'group', 1, { gapLead: '• were not in a' }),
      gap(38, 'Most … species:', 'social', 1,
        { gapLead: '• More strandings in the most', gapTrail: 'species of whales' }),
      gap(39, 'Only the … was ill:', 'leader', 1,
        { gapLead: '• 1990s dolphin stranding — only the', gapTrail: 'was ill' }),
      gap(40, 'Further reading topic:', 'network', 1,
        { gapLead: 'Marine Mammals Ashore (Geraci) — gives information about strandings' }),
    ],
  }
}

/** d2 — ONE WORD, gap liên tiếp + câu tách 39–40 (Cam20 Rivers). */
export function ieltsListeningP4D2Part() {
  return {
    partNumber: 4,
    rangeLabel: 'Questions 31–40',
    instruction: 'Complete the notes below. Write ONE WORD ONLY for each answer.',
    audioFile: 'listening.mp3',
    passageTitle: 'Reclaiming urban rivers',
    notePassage: [
      { type: 'section' as const, text: 'Historical background' },
      { type: 'static' as const, text: 'Nearly all major cities were built on a river.' },
      { type: 'static' as const, text: 'Rivers were traditionally used by city dwellers for transport, fishing and recreation.' },
      { type: 'static' as const, text: 'Industrial development and rising populations later led to:' },
      { type: 'static' as const, text: 'more sewage from houses being discharged into the river' },
      { type: 'gap' as const, number: 31 },
      { type: 'gap' as const, number: 32 },
      { type: 'section' as const, text: 'Recent improvements' },
      { type: 'gap' as const, number: 33 },
      { type: 'gap' as const, number: 34 },
      { type: 'static' as const, text: 'In Los Angeles, there are plans to:' },
      { type: 'gap' as const, number: 35 },
      { type: 'gap' as const, number: 36 },
      { type: 'gap' as const, number: 37 },
      { type: 'section' as const, text: 'Transport possibilities' },
      { type: 'gap' as const, number: 38 },
      { type: 'static' as const, text: 'Changes in shopping habits mean the number of deliveries that are made is increasing.' },
      { type: 'gap' as const, number: 39 },
      { type: 'gap' as const, number: 40 },
    ],
    questions: [
      gap(31, 'Pollution source:', 'factories', 1,
        { gapLead: 'pollution from', gapTrail: 'on the river bank' }),
      gap(32, 'Thames declared biologically:', 'dead', 1,
        { gapLead: 'In 1957, the River Thames in London was declared biologically' }),
      gap(33, 'Seen in the Thames:', 'whale', 1,
        { gapLead: 'Seals and even a', gapTrail: 'have been seen in the River Thames.' }),
      gap(34, 'Warehouses converted to:', 'apartments', 1,
        { gapLead: 'Riverside warehouses are converted to restaurants and' }),
      gap(35, 'Los Angeles riverside:', 'park', 1, { gapLead: 'build a riverside' }),
      gap(36, 'Display projects:', 'art', 1, { gapLead: 'display', gapTrail: 'projects' }),
      gap(37, 'Paris summer feature:', 'beaches', 1,
        { gapLead: 'In Paris,', gapTrail: 'are created on the sides of the river every summer.' }),
      gap(38, 'Passengers travel by:', 'ferry', 1,
        { gapLead: 'Over 2 billion passengers already travel by', gapTrail: 'in cities around the world.' }),
      gap(39, 'Electric transport:', 'bikes', 1,
        { gapLead: 'goods could be transported by large freight barges and electric' }),
      gap(40, 'Future transport:', 'drone', 1,
        { gapLead: ', or in the future, by' }),
    ],
  }
}

/** d3 — Mẫu generic: section + static + gapLead/gapTrail (THREE WORDS AND/OR A NUMBER). */
export function ieltsListeningP4D3Part() {
  return {
    partNumber: 4,
    rangeLabel: 'Questions 31–40',
    instruction:
      'Complete the notes below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
    audioFile: 'listening.mp3',
    passageTitle: 'LECTURE TITLE',
    notePassage: [
      { type: 'section' as const, text: 'Introduction' },
      { type: 'static' as const, text: 'The speaker explains the main purpose of the research.' },
      { type: 'gap' as const, number: 31 },
      { type: 'static' as const, text: 'Key findings from the first study:' },
      { type: 'gap' as const, number: 32 },
      { type: 'gap' as const, number: 33 },
      { type: 'section' as const, text: 'Practical applications' },
      { type: 'static' as const, text: 'In the workplace, employees reported improved' },
      { type: 'gap' as const, number: 34 },
      { type: 'gap' as const, number: 35 },
      { type: 'section' as const, text: 'Future research' },
      { type: 'static' as const, text: 'The team plans to collect data for at least' },
      { type: 'gap' as const, number: 36 },
      { type: 'static' as const, text: 'Participants will be recruited from' },
      { type: 'gap' as const, number: 37 },
      { type: 'gap' as const, number: 38 },
      { type: 'static' as const, text: 'Results will be published in' },
      { type: 'gap' as const, number: 39 },
      { type: 'gap' as const, number: 40 },
    ],
    questions: [
      gap(31, 'Research focus:', 'climate change', 3,
        { gapLead: 'The research focuses on' }),
      gap(32, 'First finding:', 'water quality', 3,
        { gapLead: '• improved', gapTrail: 'in urban areas' }),
      gap(33, 'Second finding:', '25 percent', 3,
        { gapLead: '• costs reduced by' }),
      gap(34, 'Workplace benefit:', 'productivity', 1,
        { gapLead: 'In the workplace, employees reported improved' }),
      gap(35, 'Additional benefit:', 'morale', 1, { gapLead: 'and higher' }),
      gap(36, 'Duration:', '12 months', 3,
        { gapLead: 'The team plans to collect data for at least' }),
      gap(37, 'Recruitment source:', 'local schools', 3,
        { gapLead: 'Participants will be recruited from' }),
      gap(38, 'Sample size:', '500', 3, { gapLead: 'a sample of' }),
      gap(39, 'Publication:', 'March', 1,
        { gapLead: 'Results will be published in' }),
      gap(40, 'Year:', '2027', 3, { gapLead: '', gapTrail: '.' }),
    ],
  }
}

/** d4 — MC 31–33 + notes 34–40 ONE WORD (Cam10 Nanotechnology — Giaodien/d4.jpg). */
export function ieltsListeningP4D4Part() {
  return {
    partNumber: 4,
    rangeLabel: 'Questions 31–40',
    instruction:
      'Questions 31–33: Choose A, B or C. '
      + 'Questions 34–40: Complete the notes below. Write ONE WORD ONLY for each answer.',
    audioFile: 'listening.mp3',
    passageTitle: 'Uses of Nanotechnology',
    notePassage: [
      { type: 'section' as const, text: 'Transport' },
      { type: 'static' as const, text: '• Nanotechnology could allow the development of stronger' },
      { type: 'gap' as const, number: 34 },
      { type: 'static' as const, text: '• Planes would be much lighter in weight' },
      { type: 'gap' as const, number: 35 },
      { type: 'static' as const, text: ' travel will be made available to the masses.' },
      { type: 'section' as const, text: 'Technology' },
      {
        type: 'static' as const,
        text: '• Computers will be even smaller, faster, and will have a greater',
      },
      { type: 'gap' as const, number: 36 },
      { type: 'gap' as const, number: 37 },
      { type: 'static' as const, text: ' energy will become more affordable.' },
      { type: 'section' as const, text: 'The Environment' },
      { type: 'static' as const, text: '• Nano-robots could rebuild the ozone layer.' },
      { type: 'static' as const, text: '• Pollutants such as' },
      { type: 'gap' as const, number: 38 },
      { type: 'static' as const, text: ' could be removed from water more easily.' },
      { type: 'static' as const, text: '• There will be no' },
      { type: 'gap' as const, number: 39 },
      { type: 'static' as const, text: ' from manufacturing.' },
      { type: 'section' as const, text: 'Health and Medicine' },
      { type: 'static' as const, text: '• New methods of food production could eradicate famine.' },
      { type: 'static' as const, text: '• Analysis of medical' },
      { type: 'gap' as const, number: 40 },
      { type: 'static' as const, text: ' will be speeded up.' },
      { type: 'static' as const, text: '• Life expectancy could be increased.' },
    ],
    questions: [
      mc(
        31,
        'The speaker says that one problem with nanotechnology is that',
        'it could threaten our way of life.',
        'it could be used to spy on people.',
        'it is misunderstood by the public.',
        'C',
        {
          sectionRange: 'Questions 31 – 33',
          sectionInstruction: 'Choose the correct letter A, B or C.',
        },
      ),
      mc(
        32,
        'According to the speaker, some scientists believe that nano-particles',
        'should be restricted to secure environments.',
        'should be used with more caution.',
        'should only be developed for essential products.',
        'B',
      ),
      mc(
        33,
        "In the speaker's opinion, research into nanotechnology",
        'has yet to win popular support.',
        'could be seen as unethical.',
        'ought to be continued.',
        'C',
      ),
      gap(34, 'Stronger:', 'metal', 1, {
        gapLead: 'Nanotechnology could allow the development of stronger',
        sectionRange: 'Questions 34 – 40',
        sectionInstruction: 'Complete the notes below. Write ONE WORD ONLY for each answer.',
        sectionTitle: 'Uses of Nanotechnology',
      }),
      gap(35, 'Travel:', 'space', 1, { gapTrail: 'travel will be made available to the masses.' }),
      gap(36, 'Greater:', 'memory', 1, {
        gapLead: 'Computers will be even smaller, faster, and will have a greater',
      }),
      gap(37, 'Energy:', 'solar', 1, { gapTrail: 'energy will become more affordable.' }),
      gap(38, 'Pollutants such as:', 'oil', 1, { gapLead: 'Pollutants such as' }),
      gap(39, 'No:', 'waste', 1, { gapLead: 'There will be no', gapTrail: 'from manufacturing' }),
      gap(40, 'Medical:', 'tests', 1, { gapLead: 'Analysis of medical', gapTrail: 'will be speeded up.' }),
    ],
  }
}

export type IeltsListeningP4TemplateKind = 'p4-d1' | 'p4-d2' | 'p4-d3' | 'p4-d4'

export function buildIeltsListeningP4Template(
  kind: IeltsListeningP4TemplateKind,
): ListeningImportPayload {
  const parts = {
    'p4-d1': ieltsListeningP4D1Part,
    'p4-d2': ieltsListeningP4D2Part,
    'p4-d3': ieltsListeningP4D3Part,
    'p4-d4': ieltsListeningP4D4Part,
  }

  const labels: Record<IeltsListeningP4TemplateKind, string> = {
    'p4-d1': 'd1 — Sections + bullets (Cam9 Whales)',
    'p4-d2': 'd2 — ONE WORD + split sentence (Cam20 Rivers)',
    'p4-d3': 'd3 — Generic lecture (THREE WORDS/NUMBER)',
    'p4-d4': 'd4 — MC + Notes ONE WORD (Cam10 Nanotechnology)',
  }

  return {
    version: 1,
    title: `IELTS Listening — Part 4 (${labels[kind]})`,
    durationMinutes: 30,
    bandHint: `IELTS · Part 4 lecture notes · ${kind.replace('p4-', '')}`,
    examType: 'ielts',
    examMode: 'practice',
    parts: [parts[kind]()],
  }
}

export function ieltsListeningP4TemplateFilename(kind: IeltsListeningP4TemplateKind): string {
  return `ielts-listening-${kind}-template.json`
}