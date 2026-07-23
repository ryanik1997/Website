/**
 * DeepSeek r1nt bug: gap-fill|gap-fill|gap-fill, thiếu notePassage,
 * "Questions 4–7" gắn nhầm noteTable.
 */
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
  validateAiReadingPartAgainstTemplate,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'
import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { gapNumbersInReadingNoteTable } from '../src/features/exam/readingNoteTableUtils.ts'

const deepseek = {
  partNumber: 1,
  rangeLabel: 'Read 1–13',
  passageTitle: 'The story of nutmeg',
  passage: [{ text: 'Nutmeg tree oval husk seed mace Arabs plague lime Run Mauritius tsunami.' }],
  questionGroups: [
    {
      range: 'Questions 1–3',
      instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
      type: 'gap-fill',
      questions: [1, 2, 3].map(n => ({ number: n, type: 'gap-fill', prompt: `Gap (${n})`, answer: 'x' })),
    },
    {
      range: 'Questions 4–7',
      instruction: 'Choose ONE WORD ONLY from the passage for each answer.',
      type: 'gap-fill',
      // AI nhầm gắn table vào nhóm này
      noteTable: {
        headers: ['Period', 'Events'],
        rows: [
          { cells: [[{ type: 'static', text: 'A' }], [{ type: 'gap', number: 4 }]] },
          { cells: [[{ type: 'static', text: 'B' }], [{ type: 'gap', number: 5 }]] },
          { cells: [[{ type: 'static', text: 'C' }], [{ type: 'gap', number: 6 }]] },
        ],
      },
      questions: [4, 5, 6, 7].map(n => ({ number: n, type: 'gap-fill', prompt: `Gap (${n})`, answer: 'x' })),
    },
    {
      range: 'Questions 8–13',
      instruction: 'Complete the table below. Choose ONE WORD ONLY from the passage for each answer.',
      type: 'gap-fill',
      questions: [8, 9, 10, 11, 12, 13].map(n => ({ number: n, type: 'gap-fill', prompt: `Gap (${n})`, answer: 'x' })),
    },
  ],
}

// Align to 3 groups matching template counts by padding first group — real AI often has wrong split.
// Better: use 3 groups with ranges closer to template after align by index
const deepseek2 = {
  ...deepseek,
  questionGroups: [
    {
      range: 'Questions 1–4',
      instruction: 'Complete the notes below. Choose ONE WORD ONLY.',
      type: 'gap-fill',
      questions: [1, 2, 3, 4].map(n => ({ number: n, type: 'gap-fill', prompt: `Gap (${n})`, answer: 'oval' })),
    },
    {
      range: 'Questions 5–7',
      instruction: 'TRUE FALSE NOT GIVEN',
      type: 'gap-fill', // SAI — phải tfng
      questions: [5, 6, 7].map(n => ({
        number: n,
        type: 'gap-fill',
        prompt: `Statement ${n}`,
        answer: 'true',
      })),
    },
    {
      range: 'Questions 8–13',
      instruction: 'Complete the table below. Choose ONE WORD ONLY.',
      type: 'gap-fill',
      questions: [8, 9, 10, 11, 12, 13].map(n => ({ number: n, type: 'gap-fill', prompt: `Gap (${n})`, answer: 'arabs' })),
    },
  ],
}

const tpl = getIeltsReadingWizardTemplatePart(1, 'p1-r1-notes-tfng-table')
let part = normalizeAiReadingPart(deepseek2 as never)
part = applyReadingTemplateTableStructure(part, tpl)

const sig = part.questionGroups.map(g => g.type).join('|')
const g0 = part.questionGroups[0]
const g1 = part.questionGroups[1]
const g2 = part.questionGroups[2]

console.log('signature', sig)
console.log('g0 notePassage', Boolean(g0.notePassage?.length), 'noteTable', Boolean(g0.noteTable))
console.log('g1 type', g1.type, 'q types', g1.questions.map(q => q.type))
console.log('g2 noteTable rows', g2.noteTable?.rows?.length, 'gaps', gapNumbersInReadingNoteTable(g2.noteTable))

let ok = true
if (sig !== 'gap-fill|tfng|gap-fill') {
  console.error('FAIL sig', sig)
  ok = false
}
if (!g0.notePassage?.length) {
  console.error('FAIL missing notePassage')
  ok = false
}
if (g0.noteTable) {
  console.error('FAIL notes group should not have noteTable')
  ok = false
}
if (g1.type !== 'tfng') {
  console.error('FAIL mid group not tfng')
  ok = false
}
if (!g2.noteTable?.rows?.length || gapNumbersInReadingNoteTable(g2.noteTable).length < 6) {
  console.error('FAIL table incomplete', gapNumbersInReadingNoteTable(g2.noteTable))
  ok = false
}

try {
  validateAiReadingPartAgainstTemplate(part, 1, 'p1-r1-notes-tfng-table')
  console.log('validate OK')
} catch (e) {
  console.error('validate FAIL', (e as Error).message)
  ok = false
}

if (!ok) process.exit(1)
console.log('PASS')
