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

export type IeltsListeningP4TemplateKind = 'p4-d1' | 'p4-d2' | 'p4-d3'

export function buildIeltsListeningP4Template(
  kind: IeltsListeningP4TemplateKind,
): ListeningImportPayload {
  const parts = {
    'p4-d1': ieltsListeningP4D1Part,
    'p4-d2': ieltsListeningP4D2Part,
    'p4-d3': ieltsListeningP4D3Part,
  }

  const labels: Record<IeltsListeningP4TemplateKind, string> = {
    'p4-d1': 'd1 — Sections + bullets (Cam9 Whales)',
    'p4-d2': 'd2 — ONE WORD + split sentence (Cam20 Rivers)',
    'p4-d3': 'd3 — Generic lecture (THREE WORDS/NUMBER)',
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