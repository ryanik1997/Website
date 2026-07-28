/**
 * Part 1 — Form Q1–6 + bảng 3 cột Q7–10 (Cam10 Test 4 — THORNDYKE'S BUILDERS).
 * Giaodien: Part1-Listening / Import Wizard a6.
 */
export function ieltsListeningP1HybridA6Part() {
  return {
    partNumber: 1,
    rangeLabel: 'Questions 1–10',
    instruction:
      'Questions 1–6: Complete the notes below. Write ONE WORD ONLY for each answer. '
      + 'Questions 7–10: Complete the table below. Write ONE WORD ONLY for each answer.',
    audioFile: 'listening.mp3',
    notePassageLayout: 'form' as const,
    notePassageSections: [
      {
        gapNumbers: [1, 2, 3, 4, 5, 6],
        instruction:
          'Questions 1 – 6\nComplete the notes below. Write ONE WORD ONLY for each answer.',
        title: "THORNDYKE'S BUILDERS",
        blocks: [
          { type: 'example' as const, text: "Customer heard about Thorndyke's from a friend" },
          { type: 'static' as const, text: 'Name: Edith' },
          { type: 'gap' as const, number: 1 },
          { type: 'static' as const, text: 'Address: Flat 4,' },
          { type: 'gap' as const, number: 2 },
          { type: 'static' as const, text: 'Park Flats' },
          { type: 'static' as const, text: '(Behind the' },
          { type: 'gap' as const, number: 3 },
          { type: 'static' as const, text: ')' },
          { type: 'static' as const, text: 'Phone number: 875934' },
          { type: 'static' as const, text: 'Best time to contact customer: during the' },
          { type: 'gap' as const, number: 4 },
          { type: 'static' as const, text: 'Where to park: opposite entrance next to the' },
          { type: 'gap' as const, number: 5 },
          { type: 'static' as const, text: 'Needs full quote showing all the jobs and the' },
          { type: 'gap' as const, number: 6 },
        ],
      },
    ],
    noteTables: [
      {
        gapNumbers: [7, 8, 9, 10],
        instruction:
          'Questions 7 – 10\nComplete the table below. Write ONE WORD ONLY for each answer.',
        headers: ['Area', 'Work to be done', 'Notes'],
        rows: [
          {
            cells: [
              [{ type: 'static' as const, text: 'Kitchen' }],
              [
                { type: 'static' as const, text: 'Replace the ' },
                { type: 'gap' as const, number: 7 },
                { type: 'static' as const, text: ' in the door' },
              ],
              [{ type: 'static' as const, text: 'Fix tomorrow' }],
            ],
          },
          {
            cells: [
              [{ type: 'static' as const, text: 'Kitchen' }],
              [
                { type: 'static' as const, text: 'Paint wall above the ' },
                { type: 'gap' as const, number: 8 },
              ],
              [
                { type: 'static' as const, text: 'Strip paint and plaster approximately one ' },
                { type: 'gap' as const, number: 9 },
                { type: 'static' as const, text: ' in advance' },
              ],
            ],
          },
          {
            cells: [
              [{ type: 'static' as const, text: 'Garden' }],
              [
                { type: 'static' as const, text: 'One ' },
                { type: 'gap' as const, number: 10 },
                { type: 'static' as const, text: ' needs replacing (end of garden)' },
              ],
              [{ type: 'static' as const, text: '' }],
            ],
          },
        ],
      },
    ],
    questions: [
      {
        number: 1,
        type: 'gap-fill' as const,
        prompt: 'Name:',
        options: [],
        answer: 'pargetter',
        explanation: 'Điền theo audio.',
        wordLimit: 1,
        gapLead: 'Name: Edith',
        sectionRange: 'Questions 1 – 6',
        sectionInstruction: 'Complete the notes below. Write ONE WORD ONLY for each answer.',
        sectionTitle: "THORNDYKE'S BUILDERS",
      },
      {
        number: 2,
        type: 'gap-fill' as const,
        prompt: 'Park Flats area:',
        options: [],
        answer: 'east',
        explanation: 'Điền theo audio.',
        wordLimit: 1,
        gapLead: 'Flat 4,',
      },
      {
        number: 3,
        type: 'gap-fill' as const,
        prompt: 'Behind the:',
        options: [],
        answer: 'library',
        explanation: 'Điền theo audio.',
        wordLimit: 1,
        gapLead: 'Behind the',
      },
      {
        number: 4,
        type: 'gap-fill' as const,
        prompt: 'Best time:',
        options: [],
        answer: 'mornings',
        explanation: 'Điền theo audio.',
        wordLimit: 1,
        gapLead: 'during the',
      },
      {
        number: 5,
        type: 'gap-fill' as const,
        prompt: 'Next to:',
        options: [],
        answer: 'postbox',
        explanation: 'Điền theo audio.',
        wordLimit: 1,
        gapLead: 'opposite entrance next to the',
      },
      {
        number: 6,
        type: 'gap-fill' as const,
        prompt: 'Show all:',
        options: [],
        answer: 'prices',
        explanation: 'Điền theo audio.',
        wordLimit: 1,
        gapLead: 'Needs full quote showing all the jobs and the',
      },
      {
        number: 7,
        type: 'gap-fill' as const,
        prompt: 'Replace:',
        options: [],
        answer: 'glass',
        explanation: 'Điền theo audio.',
        wordLimit: 1,
        sectionRange: 'Questions 7 – 10',
        sectionInstruction: 'Complete the table below. Write ONE WORD ONLY for each answer.',
      },
      {
        number: 8,
        type: 'gap-fill' as const,
        prompt: 'Above the:',
        options: [],
        answer: 'cooker',
        explanation: 'Điền theo audio.',
        wordLimit: 1,
        gapLead: 'Paint wall above the',
      },
      {
        number: 9,
        type: 'gap-fill' as const,
        prompt: 'Approximately one:',
        options: [],
        answer: 'week',
        explanation: 'Điền theo audio.',
        wordLimit: 1,
      },
      {
        number: 10,
        type: 'gap-fill' as const,
        prompt: 'Replace:',
        options: [],
        answer: 'fence',
        explanation: 'Điền theo audio.',
        wordLimit: 1,
        gapLead: 'One',
        gapTrail: 'needs replacing (end of garden)',
      },
    ],
  }
}