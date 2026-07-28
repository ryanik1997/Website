/**
 * Table must have static content, not empty shell + gaps only.
 */
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'
import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import {
  gapNumbersInReadingNoteTable,
  noteTableIsContentRich,
  noteTableStaticTextLength,
} from '../src/features/exam/readingNoteTableUtils.ts'

const tpl = getIeltsReadingWizardTemplatePart(1, 'p1-r1-tfng-table')

function run(name: string, raw: unknown) {
  let part = normalizeAiReadingPart(raw as never)
  part = applyReadingTemplateTableStructure(part, tpl)
  const g = part.questionGroups[1]
  const t = g.noteTable
  const staticLen = noteTableStaticTextLength(t)
  const rich = noteTableIsContentRich(t)
  const gaps = gapNumbersInReadingNoteTable(t)
  console.log(`\n=== ${name} ===`)
  console.log('rich', rich, 'staticLen', staticLen, 'gaps', gaps)
  console.log('headers', t?.headers)
  console.log('row0', JSON.stringify(t?.rows?.[0])?.slice(0, 200))
  console.log('row1', JSON.stringify(t?.rows?.[1])?.slice(0, 200))
  if (!rich || staticLen < 20) {
    console.error('FAIL: table has no content')
    process.exit(1)
  }
  if (![7, 8, 9, 10, 11, 12].every(n => gaps.includes(n))) {
    console.error('FAIL: gaps', gaps)
    process.exit(1)
  }
  // r1tb SAMPLE có ≥8 hàng (Aim/Method/Findings…)
  const rowCount = t?.rows?.length ?? 0
  if (rowCount < 8) {
    console.error('FAIL: too few rows (list-like?)', rowCount)
    process.exit(1)
  }
  const row0 = JSON.stringify(t?.rows?.[0] ?? '')
  if (!/Aim|Method|Findings|Section/i.test(row0 + JSON.stringify(t?.rows?.[1] ?? ''))) {
    console.error('FAIL: missing Aim/Method-style labels in first rows')
    process.exit(1)
  }
}

const tfng = {
  range: 'Questions 1-6',
  type: 'tfng' as const,
  instruction: 'TFNG',
  questions: [1, 2, 3, 4, 5, 6].map(n => ({
    number: n,
    type: 'true-false-not-given' as const,
    prompt: `S${n}`,
    answer: 'true',
  })),
}

// A: one-word list with rich prompts → must keep SAMPLE layout (Aim/Method…), not 1-row-per-gap
run('A rich prompts → SAMPLE layout', {
  partNumber: 1,
  rangeLabel: 'q',
  passageTitle: 't',
  passage: [{ text: 'passage' }],
  questionGroups: [
    tfng,
    {
      range: 'Questions 7-12',
      type: 'gap-fill',
      instruction: 'Choose ONE WORD ONLY from the passage for each answer.',
      questions: [
        { number: 7, prompt: 'DNA analysis of bat ______', answer: 'droppings' },
        { number: 8, prompt: 'pests of rice and ______', answer: 'maize' },
        { number: 9, prompt: 'eating ______ and blackflies', answer: 'mosquitoes' },
        { number: 10, prompt: 'food rich in ______', answer: 'protein' },
        { number: 11, prompt: 'buildings become ______', answer: 'damaged' },
        { number: 12, prompt: 'role in local ______', answer: 'agriculture' },
      ],
    },
  ],
})

// B: empty noteTable shell (headers + gap only) + rich prompts
run('B empty shell + prompts', {
  partNumber: 1,
  rangeLabel: 'q',
  passageTitle: 't',
  passage: [{ text: 'passage' }],
  questionGroups: [
    tfng,
    {
      range: 'Questions 7-12',
      type: 'gap-fill',
      instruction: 'Complete the table below. Choose ONE WORD ONLY.',
      noteTable: {
        headers: ['Section', 'Details'],
        rows: [7, 8, 9, 10, 11, 12].map(n => ({
          cells: [[{ type: 'static', text: '' }], [{ type: 'gap', number: n }]],
        })),
      },
      questions: [
        { number: 7, prompt: 'DNA analysis of bat ______', answer: 'droppings' },
        { number: 8, prompt: 'pests of rice and ______', answer: 'maize' },
        { number: 9, prompt: 'eating ______ and blackflies', answer: 'mosquitoes' },
        { number: 10, prompt: 'food rich in ______', answer: 'protein' },
        { number: 11, prompt: 'buildings become ______', answer: 'damaged' },
        { number: 12, prompt: 'role in local ______', answer: 'agriculture' },
      ],
    },
  ],
})

// D: DeepSeek "nửa vời" — vài hàng có chữ nhưng thiếu Aim/Method đủ
run('D half table 6 rows → force SAMPLE', {
  partNumber: 1,
  rangeLabel: 'q',
  passageTitle: 't',
  passage: [{ text: 'passage' }],
  questionGroups: [
    tfng,
    {
      range: 'Questions 7-12',
      type: 'gap-fill',
      instruction: 'Complete the table below. Choose ONE WORD ONLY.',
      noteTable: {
        headers: ['Section', 'Details'],
        rows: [
          { cells: [[{ type: 'static', text: 'Method' }], [{ type: 'static', text: 'DNA of bat ' }, { type: 'gap', number: 7 }]] },
          { cells: [[{ type: 'static', text: 'Findings' }], [{ type: 'static', text: 'ate ' }, { type: 'gap', number: 8 }]] },
          { cells: [[{ type: 'static', text: '' }], [{ type: 'static', text: 'disease ' }, { type: 'gap', number: 9 }]] },
          { cells: [[{ type: 'static', text: '' }], [{ type: 'static', text: 'protein ' }, { type: 'gap', number: 10 }]] },
          { cells: [[{ type: 'static', text: '' }], [{ type: 'static', text: 'damaged ' }, { type: 'gap', number: 11 }]] },
          { cells: [[{ type: 'static', text: 'Rec' }], [{ type: 'static', text: 'role ' }, { type: 'gap', number: 12 }]] },
        ],
      },
      questions: [7, 8, 9, 10, 11, 12].map(n => ({
        number: n,
        type: 'gap-fill' as const,
        prompt: `Gap (${n})`,
        answer: 'x',
      })),
    },
  ],
})

// C: empty shell + Gap(n) prompts only → must fall back to SAMPLE template content
run('C empty shell + Gap prompts → SAMPLE', {
  partNumber: 1,
  rangeLabel: 'q',
  passageTitle: 't',
  passage: [{ text: 'passage' }],
  questionGroups: [
    tfng,
    {
      range: 'Questions 7-12',
      type: 'gap-fill',
      instruction: 'Complete the table below. Choose ONE WORD ONLY.',
      noteTable: {
        headers: ['Section', 'Details'],
        rows: [7, 8, 9, 10, 11, 12].map(n => ({
          cells: [[], [{ type: 'gap', number: n }]],
        })),
      },
      questions: [7, 8, 9, 10, 11, 12].map(n => ({
        number: n,
        type: 'gap-fill' as const,
        prompt: `Gap (${n})`,
        answer: 'x',
      })),
    },
  ],
})

console.log('\nALL PASS')
