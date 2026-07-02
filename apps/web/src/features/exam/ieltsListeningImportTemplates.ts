import type { ListeningImportPayload } from './importListeningUtils'

export type IeltsListeningTemplateKind =
  | 'full'
  | 'p1-form'
  | 'p1-table'
  | 'p1-mixed-a4'
  | 'p1-mixed-a5'

const IELTS_META = {
  title: 'IELTS Listening — Đề mẫu import',
  durationMinutes: 30,
  bandHint: 'IELTS · 4 parts · 40 câu · listening.mp3',
} as const

function mcQuestion(
  number: number,
  prompt: string,
  options: Array<{ id: string; label: string }>,
  answer: string,
  explanation?: string,
) {
  return {
    number,
    type: 'multiple-choice' as const,
    prompt,
    options,
    answer: answer.toUpperCase(),
    explanation: explanation ?? 'Chọn theo audio.',
  }
}

function chooseTwoPair(
  start: number,
  prompt: string,
  options: Array<{ id: string; label: string }>,
  answer: string,
  explanation?: string,
) {
  return [start, start + 1].map(number => ({
    number,
    type: 'matching' as const,
    prompt,
    options,
    answer,
    explanation: explanation ?? 'Choose TWO — mỗi ô A hoặc E.',
  }))
}

function gapQuestion(
  number: number,
  prompt: string,
  answer: string,
  extra?: Partial<{
    gapLead: string
    gapTrail: string
    wordLimit: number
    explanation: string
  }>,
) {
  return {
    number,
    type: 'gap-fill' as const,
    prompt,
    options: [] as Array<{ id: string; label: string }>,
    answer,
    explanation: extra?.explanation ?? 'Điền theo audio.',
    wordLimit: extra?.wordLimit ?? 3,
    ...(extra?.gapLead ? { gapLead: extra.gapLead } : {}),
    ...(extra?.gapTrail ? { gapTrail: extra.gapTrail } : {}),
  }
}

/** Part 1 — form/note (Giaodien/a3 — CRIME REPORT FORM). */
export function ieltsListeningP1FormPart() {
  return {
    partNumber: 1,
    rangeLabel: 'Questions 1–10',
    instruction:
      'Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.',
    passageTitle: 'CRIME REPORT FORM',
    audioFile: 'listening.mp3',
    notePassageLayout: 'form' as const,
    notePassage: [
      { type: 'static' as const, text: 'Type of crime: theft' },
      { type: 'section' as const, text: 'Personal information' },
      { type: 'example' as const, text: 'Example\nName: Louise …Taylor…' },
      { type: 'static' as const, text: 'Nationality:' },
      { type: 'gap' as const, number: 1 },
      { type: 'static' as const, text: 'Date of birth: 14 December 1977' },
      { type: 'static' as const, text: 'Occupation: interior designer' },
      { type: 'static' as const, text: 'Reason for visit: business (to buy antique)' },
      { type: 'gap' as const, number: 2 },
      { type: 'static' as const, text: 'Length of stay: two months' },
      { type: 'static' as const, text: 'Current address:' },
      { type: 'gap' as const, number: 3 },
      { type: 'static' as const, text: 'Apartments (No 15)' },
      { type: 'section' as const, text: 'Details of theft' },
      { type: 'static' as const, text: 'Items stolen:\n– a wallet containing approximately £' },
      { type: 'gap' as const, number: 4 },
      { type: 'static' as const, text: '– a' },
      { type: 'gap' as const, number: 5 },
      { type: 'static' as const, text: 'Date of theft:' },
      { type: 'gap' as const, number: 6 },
      { type: 'section' as const, text: 'Possible time and place of theft' },
      { type: 'static' as const, text: 'Location: outside the' },
      { type: 'gap' as const, number: 7 },
      { type: 'static' as const, text: 'at about 4 pm' },
      { type: 'static' as const, text: 'Details of suspect:\n– some boys asked for the' },
      { type: 'gap' as const, number: 8 },
      { type: 'static' as const, text: 'then ran off' },
      { type: 'static' as const, text: '– one had a T-shirt with a picture of a tiger' },
      { type: 'static' as const, text: '– he was about 12, slim build with' },
      { type: 'gap' as const, number: 9 },
      { type: 'static' as const, text: 'hair' },
      { type: 'static' as const, text: 'Crime reference number allocated' },
      { type: 'gap' as const, number: 10 },
    ],
    questions: [
      gapQuestion(1, 'Nationality:', 'canadian', { wordLimit: 1, gapLead: 'Nationality:' }),
      gapQuestion(2, 'Reason for visit:', 'antiques', { wordLimit: 1, gapLead: 'Reason for visit: business (to buy antique)' }),
      gapQuestion(3, 'Current address:', 'riverside', { wordLimit: 1, gapLead: 'Current address:' }),
      gapQuestion(4, 'Amount in wallet:', '250', { wordLimit: 1, gapLead: 'a wallet containing approximately £' }),
      gapQuestion(5, 'Stolen item:', 'passport', { wordLimit: 1, gapLead: '– a' }),
      gapQuestion(6, 'Date of theft:', '10 december', { wordLimit: 2, gapLead: 'Date of theft:' }),
      gapQuestion(7, 'Location:', 'museum', { wordLimit: 1, gapLead: 'Location: outside the', gapTrail: 'at about 4 pm' }),
      gapQuestion(8, 'Asked for:', 'money', { wordLimit: 1, gapLead: 'some boys asked for the', gapTrail: 'then ran off' }),
      gapQuestion(9, 'Hair colour:', 'blond', { wordLimit: 1, gapLead: 'slim build with', gapTrail: 'hair' }),
      gapQuestion(10, 'Crime reference:', '745255', { wordLimit: 1, gapLead: 'Crime reference number allocated' }),
    ],
  }
}

/** Part 1 — bảng 4 cột (Giaodien/a2 — Restaurant recommendations). */
export function ieltsListeningP1TablePart() {
  return {
    partNumber: 1,
    rangeLabel: 'Questions 1–10',
    instruction:
      'Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.',
    passageTitle: 'Restaurant recommendations',
    audioFile: 'listening.mp3',
    notePassageLayout: 'table' as const,
    noteTable: {
      headers: [
        'Name of restaurants',
        'Location',
        'Reason for recommendation',
        'Other comments',
      ],
      rows: [
        {
          cells: [
            [{ type: 'static' as const, text: 'The Junction' }],
            [{ type: 'static' as const, text: 'Greyston Street, near the station' }],
            [
              { type: 'static' as const, text: 'Good for people who are especially keen on ' },
              { type: 'gap' as const, number: 1 },
            ],
            [
              { type: 'static' as const, text: 'Quite expensive' },
              { type: 'break' as const },
              { type: 'static' as const, text: 'The ' },
              { type: 'gap' as const, number: 2 },
              { type: 'static' as const, text: ' is a good place for a drink' },
            ],
          ],
        },
        {
          cells: [
            [{ type: 'static' as const, text: 'Paloma' }],
            [{ type: 'static' as const, text: 'In Bow Street next to the cinema' }],
            [
              { type: 'gap' as const, number: 3 },
              { type: 'static' as const, text: ' food, good for sharing' },
            ],
            [
              { type: 'static' as const, text: 'Staff are very friendly' },
              { type: 'break' as const },
              { type: 'static' as const, text: 'Need to pay £50 deposit' },
              { type: 'break' as const },
              { type: 'static' as const, text: 'A limited selection of ' },
              { type: 'gap' as const, number: 4 },
              { type: 'static' as const, text: ' food on the menu' },
            ],
          ],
        },
        {
          cells: [
            [
              { type: 'static' as const, text: 'The ' },
              { type: 'gap' as const, number: 5 },
            ],
            [
              { type: 'static' as const, text: 'At the top of a ' },
              { type: 'gap' as const, number: 6 },
            ],
            [
              { type: 'static' as const, text: 'A famous chef' },
              { type: 'break' as const },
              { type: 'static' as const, text: 'All the ' },
              { type: 'gap' as const, number: 7 },
              { type: 'static' as const, text: ' are very good' },
              { type: 'break' as const },
              { type: 'static' as const, text: 'Only uses ' },
              { type: 'gap' as const, number: 8 },
              { type: 'static' as const, text: ' ingredients' },
            ],
            [
              { type: 'static' as const, text: 'Set lunch costs £' },
              { type: 'gap' as const, number: 9 },
              { type: 'static' as const, text: ' per person' },
              { type: 'break' as const },
              { type: 'static' as const, text: 'Portions probably of ' },
              { type: 'gap' as const, number: 10 },
              { type: 'static' as const, text: ' size' },
            ],
          ],
        },
      ],
    },
    questions: [
      gapQuestion(1, 'Keen on:', 'fish', { wordLimit: 1 }),
      gapQuestion(2, 'Good place for a drink:', 'roof', { wordLimit: 1, gapLead: 'The', gapTrail: 'is a good place for a drink' }),
      gapQuestion(3, 'Type of food:', 'spanish', { wordLimit: 1, gapTrail: 'food, good for sharing' }),
      gapQuestion(4, 'Limited selection:', 'vegetarian', { wordLimit: 1, gapLead: 'A limited selection of', gapTrail: 'food on the menu' }),
      gapQuestion(5, 'Restaurant name:', 'audley', { wordLimit: 1, gapLead: 'The' }),
      gapQuestion(6, 'Location:', 'hotel', { wordLimit: 1 }),
      gapQuestion(7, 'Reviews:', 'reviews', { wordLimit: 1, gapLead: 'All the', gapTrail: 'are very good' }),
      gapQuestion(8, 'Ingredients:', 'local', { wordLimit: 1, gapLead: 'Only uses', gapTrail: 'ingredients' }),
      gapQuestion(9, 'Set lunch cost:', '30', { wordLimit: 1, gapTrail: 'per person' }),
      gapQuestion(10, 'Portion size:', 'average', { wordLimit: 1, gapTrail: 'size' }),
    ],
  }
}

/**
 * Part 1 hỗn hợp — bảng + Choose TWO + bảng (Giaodien/a4 — Health Centres).
 * Thứ tự questions: gap 1–4 → matching 5–6 → gap 7–10.
 */
export function ieltsListeningP1MixedA4Part() {
  const chooseTwoPrompt =
    'Which TWO of the following are offered free of charge at Shore Lane Health Centre?'

  return {
    partNumber: 1,
    rangeLabel: 'Questions 1–10',
    instruction:
      'Questions 1–4: Complete the table below. Write ONE WORD ONLY for each answer.\n'
      + 'Questions 5–6: Choose TWO letters, A–E.\n'
      + 'Questions 7–10: Complete the table below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
    audioFile: 'listening.mp3',
    notePassageLayout: 'table' as const,
    noteTables: [
      {
        gapNumbers: [1, 2, 3, 4],
        instruction: 'Questions 1–4\nComplete the table below. Write ONE WORD ONLY for each answer.',
        headers: ['Name of centre', "Doctor's name", 'Advantage'],
        rows: [
          {
            cells: [
              [{ type: 'static' as const, text: 'The Harvey Clinic' }],
              [{ type: 'static' as const, text: 'Dr Green' }],
              [
                { type: 'static' as const, text: 'Especially good with ' },
                { type: 'gap' as const, number: 1 },
              ],
            ],
          },
          {
            cells: [
              [
                { type: 'static' as const, text: 'The ' },
                { type: 'gap' as const, number: 2 },
                { type: 'static' as const, text: ' Health Practice' },
              ],
              [{ type: 'static' as const, text: 'Dr Fuller' }],
              [
                { type: 'static' as const, text: 'Offers ' },
                { type: 'gap' as const, number: 3 },
                { type: 'static' as const, text: ' appointments' },
              ],
            ],
          },
          {
            cells: [
              [{ type: 'static' as const, text: 'The Shore Lane Health Centre' }],
              [
                { type: 'static' as const, text: 'Dr ' },
                { type: 'gap' as const, number: 4 },
              ],
              [{ type: 'static' as const, text: '' }],
            ],
          },
        ],
      },
      {
        gapNumbers: [7, 8, 9, 10],
        instruction:
          'Questions 7–10\nComplete the table below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
        title: 'Talks for patients at Shore Lane Health Centre',
        headers: ['Subject of talk', 'Date/time', 'Location', 'Notes'],
        rows: [
          {
            cells: [
              [{ type: 'static' as const, text: 'Giving up smoking' }],
              [{ type: 'static' as const, text: '25th Feb at 7pm' }],
              [{ type: 'static' as const, text: 'Room 4' }],
              [
                { type: 'static' as const, text: 'Useful for people with asthma or ' },
                { type: 'gap' as const, number: 7 },
                { type: 'static' as const, text: ' problems' },
              ],
            ],
          },
          {
            cells: [
              [{ type: 'static' as const, text: 'Healthy eating' }],
              [{ type: 'static' as const, text: '1st March at 5pm' }],
              [
                { type: 'static' as const, text: 'The ' },
                { type: 'gap' as const, number: 8 },
                { type: 'static' as const, text: ' (Shore Lane)' },
              ],
              [{ type: 'static' as const, text: 'Anyone welcome' }],
            ],
          },
          {
            cells: [
              [{ type: 'static' as const, text: 'Avoiding injuries during exercise' }],
              [{ type: 'gap' as const, number: 9 }],
              [{ type: 'static' as const, text: 'Room 6' }],
              [
                { type: 'static' as const, text: 'For all ' },
                { type: 'gap' as const, number: 10 },
              ],
            ],
          },
        ],
      },
    ],
    questions: [
      gapQuestion(1, 'Especially good with:', 'elderly', { wordLimit: 1 }),
      gapQuestion(2, 'Name of centre:', 'college', { wordLimit: 1, gapLead: 'The', gapTrail: 'Health Practice' }),
      gapQuestion(3, 'Appointments:', 'same day', { wordLimit: 2, gapLead: 'Offers', gapTrail: 'appointments' }),
      gapQuestion(4, "Doctor's name:", 'white', { wordLimit: 1, gapLead: 'Dr' }),
      ...chooseTwoPair(5, chooseTwoPrompt, [
        { id: 'A', label: 'acupuncture' },
        { id: 'B', label: 'employment medicals' },
        { id: 'C', label: 'sports injury therapy' },
        { id: 'D', label: 'travel advice' },
        { id: 'E', label: 'vaccinations' },
      ], 'A/E', 'Hai dịch vụ miễn phí — điền A/E.'),
      gapQuestion(7, 'Health problems:', 'heart', { wordLimit: 1, gapLead: 'asthma or', gapTrail: 'problems' }),
      gapQuestion(8, 'Location:', 'dentist', { wordLimit: 1, gapLead: 'The', gapTrail: '(Shore Lane)' }),
      gapQuestion(9, 'Date/time:', '4th march', { wordLimit: 2 }),
      gapQuestion(10, 'Notes:', 'ages', { wordLimit: 1, gapLead: 'For all' }),
    ],
  }
}

/**
 * Part 1 hỗn hợp — MC 1–6 + sentence completion 7–10 (Giaodien/a5 — Art gallery / Paxton).
 */
export function ieltsListeningP1MixedA5Part() {
  return {
    partNumber: 1,
    rangeLabel: 'Questions 1–10',
    instruction:
      'Questions 1–6: Choose the correct letter, A, B or C.\n'
      + 'Questions 7–10: Complete the sentences below. Write ONE WORD ONLY for each answer.',
    audioFile: 'listening.mp3',
    notePassage: [
      { type: 'section' as const, text: 'Paxton Nature Reserve' },
      { type: 'static' as const, text: '• Paxton is a good place for seeing rare' },
      { type: 'gap' as const, number: 7 },
      { type: 'static' as const, text: 'all year round.' },
      { type: 'static' as const, text: '• This is a particularly good time for seeing certain unusual' },
      { type: 'gap' as const, number: 8 },
      { type: 'static' as const, text: '• Visitors will be able to learn about' },
      { type: 'gap' as const, number: 9 },
      { type: 'static' as const, text: 'and then collect some.' },
      { type: 'static' as const, text: '• Part of the' },
      { type: 'gap' as const, number: 10 },
      { type: 'static' as const, text: 'has been made suitable for swimming.' },
    ],
    questions: [
      mcQuestion(
        1,
        "The 'Family Welcome' event in the art gallery begins at",
        [
          { id: 'A', label: '10 am.' },
          { id: 'B', label: '10.30 am.' },
          { id: 'C', label: '2 pm.' },
        ],
        'B',
      ),
      mcQuestion(
        2,
        "The film that is now shown in the 'Family Welcome' event is about",
        [
          { id: 'A', label: 'sculpture.' },
          { id: 'B', label: 'painting.' },
          { id: 'C', label: 'ceramics.' },
        ],
        'C',
      ),
      mcQuestion(
        3,
        'When do most of the free concerts take place?',
        [
          { id: 'A', label: 'in the morning.' },
          { id: 'B', label: 'at lunchtime.' },
          { id: 'C', label: 'in the evening.' },
        ],
        'B',
      ),
      mcQuestion(
        4,
        'Where will the 4 pm concert of Latin American music take place?',
        [
          { id: 'A', label: 'in a museum.' },
          { id: 'B', label: 'in a theatre.' },
          { id: 'C', label: 'in a library.' },
        ],
        'C',
      ),
      mcQuestion(
        5,
        'The boat race begins at',
        [
          { id: 'A', label: 'Summer Pool.' },
          { id: 'B', label: 'Charlesworth Bridge.' },
          { id: 'C', label: 'Offord Marina.' },
        ],
        'A',
      ),
      mcQuestion(
        6,
        'One of the boat race teams',
        [
          { id: 'A', label: 'won a regional competition earlier this year.' },
          { id: 'B', label: 'has represented the region in a national competition.' },
          { id: 'C', label: 'has won several regional competitions.' },
        ],
        'C',
      ),
      gapQuestion(7, 'Rare animals:', 'birds', { wordLimit: 1, gapLead: 'seeing rare', gapTrail: 'all year round' }),
      gapQuestion(8, 'Unusual:', 'flowers', { wordLimit: 1, gapLead: 'unusual' }),
      gapQuestion(9, 'Learn about:', 'seeds', { wordLimit: 1, gapLead: 'learn about', gapTrail: 'and then collect some' }),
      gapQuestion(10, 'Part of the:', 'river', { wordLimit: 1, gapLead: 'Part of the', gapTrail: 'has been made suitable for swimming' }),
    ],
  }
}

/** Đề IELTS đủ 4 parts — Part 1 form + Part 2 MC/Choose TWO + Part 3 MC + Part 4 notes. */
export function ieltsListeningFullTemplate(): ListeningImportPayload {
  return {
    version: 1,
    ...IELTS_META,
    examType: 'ielts',
    examMode: 'practice',
    parts: [
      ieltsListeningP1FormPart(),
      {
        partNumber: 2,
        rangeLabel: 'Questions 11–20',
        instruction:
          'Questions 11–16: Choose the correct letter, A, B or C. '
          + 'Questions 17–18 and 19–20: Choose TWO letters, A–E.',
        passageTitle: 'TOPIC TITLE (Part 2)',
        audioFile: 'listening.mp3',
        questions: [
          {
            number: 11,
            type: 'multiple-choice',
            prompt: 'Sample question 11',
            options: [
              { id: 'A', label: 'Option A' },
              { id: 'B', label: 'Option B' },
              { id: 'C', label: 'Option C' },
            ],
            answer: 'A',
            explanation: 'Đáp án A.',
          },
          {
            number: 17,
            type: 'matching',
            prompt: 'Which TWO things does the speaker mention?',
            options: [
              { id: 'A', label: 'Full label for A' },
              { id: 'B', label: 'Full label for B' },
              { id: 'C', label: 'Full label for C' },
              { id: 'D', label: 'Full label for D' },
              { id: 'E', label: 'Full label for E' },
            ],
            answer: 'A/E',
            explanation: 'Choose TWO — đáp án A hoặc E cho mỗi ô.',
          },
          {
            number: 18,
            type: 'matching',
            prompt: 'Which TWO things does the speaker mention?',
            options: [
              { id: 'A', label: 'Full label for A' },
              { id: 'B', label: 'Full label for B' },
              { id: 'C', label: 'Full label for C' },
              { id: 'D', label: 'Full label for D' },
              { id: 'E', label: 'Full label for E' },
            ],
            answer: 'A/E',
            explanation: 'Cặp đáp án 17–18.',
          },
        ],
      },
      {
        partNumber: 3,
        rangeLabel: 'Questions 21–30',
        instruction: 'Choose the correct letter, A, B or C.',
        passageTitle: 'Academic discussion',
        audioFile: 'listening.mp3',
        questions: [
          {
            number: 21,
            type: 'multiple-choice',
            prompt: 'Sample question 21',
            options: [
              { id: 'A', label: 'Option A' },
              { id: 'B', label: 'Option B' },
              { id: 'C', label: 'Option C' },
            ],
            answer: 'B',
            explanation: 'Đáp án B.',
          },
        ],
      },
      {
        partNumber: 4,
        rangeLabel: 'Questions 31–40',
        instruction:
          'Complete the notes below. Write ONE WORD ONLY for each answer.',
        passageTitle: 'LECTURE TITLE',
        audioFile: 'listening.mp3',
        notePassage: [
          { type: 'section', text: 'Section heading' },
          { type: 'static', text: 'Introductory sentence from the lecture notes.' },
          { type: 'gap', number: 31 },
          { type: 'static', text: 'Another static line before the next gap.' },
          { type: 'gap', number: 32 },
        ],
        questions: [
          gapQuestion(31, 'Gap 31:', 'keyword', { wordLimit: 1, gapLead: 'Introductory sentence from the lecture notes.' }),
          gapQuestion(32, 'Gap 32:', 'answer', { wordLimit: 1, gapLead: 'Another static line before the next gap.' }),
        ],
      },
    ],
  }
}

export function buildIeltsListeningImportTemplate(
  kind: IeltsListeningTemplateKind,
): ListeningImportPayload {
  if (kind === 'p1-form') {
    return {
      version: 1,
      title: 'IELTS Listening — Part 1 Form (mẫu a3)',
      durationMinutes: 30,
      bandHint: 'IELTS · Part 1 form · notePassage · Giaodien/a3',
      examType: 'ielts',
      examMode: 'practice',
      parts: [ieltsListeningP1FormPart()],
    }
  }

  if (kind === 'p1-table') {
    return {
      version: 1,
      title: 'IELTS Listening — Part 1 Table (mẫu a2)',
      durationMinutes: 30,
      bandHint: 'IELTS · Part 1 table · noteTable · Giaodien/a2',
      examType: 'ielts',
      examMode: 'practice',
      parts: [ieltsListeningP1TablePart()],
    }
  }

  if (kind === 'p1-mixed-a4') {
    return {
      version: 1,
      title: 'IELTS Listening — Part 1 Mixed bảng+Choose TWO (mẫu a4)',
      durationMinutes: 30,
      bandHint: 'IELTS · Part 1 · noteTables + Choose TWO · Giaodien/a4',
      examType: 'ielts',
      examMode: 'practice',
      parts: [ieltsListeningP1MixedA4Part()],
    }
  }

  if (kind === 'p1-mixed-a5') {
    return {
      version: 1,
      title: 'IELTS Listening — Part 1 Mixed MC+notes (mẫu a5)',
      durationMinutes: 30,
      bandHint: 'IELTS · Part 1 · MC 1–6 + notePassage 7–10 · Giaodien/a5',
      examType: 'ielts',
      examMode: 'practice',
      parts: [ieltsListeningP1MixedA5Part()],
    }
  }

  return ieltsListeningFullTemplate()
}

export function ieltsListeningTemplateFilename(kind: IeltsListeningTemplateKind): string {
  const names: Record<IeltsListeningTemplateKind, string> = {
    full: 'ielts-listening-full-template.json',
    'p1-form': 'ielts-listening-p1-form-template.json',
    'p1-table': 'ielts-listening-p1-table-template.json',
    'p1-mixed-a4': 'ielts-listening-p1-mixed-a4-template.json',
    'p1-mixed-a5': 'ielts-listening-p1-mixed-a5-template.json',
  }
  return names[kind]
}

export function downloadJsonTemplate(payload: ListeningImportPayload, filename: string): void {
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}