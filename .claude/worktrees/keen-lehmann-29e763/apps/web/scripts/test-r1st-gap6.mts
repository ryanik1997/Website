import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
  validateAiReadingPartAgainstTemplate,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'
import {
  CAM_AEROPONIC_FARMING_TABLE,
  getIeltsReadingWizardTemplatePart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import {
  gapNumbersInReadingNoteTable,
  normalizeReadingNoteTable,
  noteTableIsContentRich,
} from '../src/features/exam/readingNoteTableUtils.ts'

const sample = normalizeReadingNoteTable(CAM_AEROPONIC_FARMING_TABLE)!
console.log('SAMPLE gaps', gapNumbersInReadingNoteTable(sample))
console.log('SAMPLE rich', noteTableIsContentRich(sample))
console.log('row0 cells', sample.rows[0].cells.length, 'row1', sample.rows[1].cells.length)

// Case A: AI table missing gap 6
const rawA = {
  partNumber: 1,
  rangeLabel: 'q',
  passageTitle: 'Crop',
  passage: [{ text: 'tomatoes chemicals journeys farmers freshness food.' }],
  questionGroups: [
    {
      range: 'Questions 1-3',
      type: 'sentence-completion' as const,
      instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER.',
      questions: [1, 2, 3].map(n => ({
        number: n,
        type: 'sentence-completion' as const,
        prompt: `s ${n}`,
        answer: 'x',
      })),
    },
    {
      range: 'Questions 4-7',
      type: 'gap-fill' as const,
      instruction: 'Complete the table below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.',
      noteTable: {
        headers: ['', 'Growth', 'Selection', 'Sale'],
        rows: [
          {
            cells: [
              [{ type: 'static', text: 'Intensive farming' }],
              [{ type: 'static', text: '• ' }, { type: 'gap', number: 4 }],
              [{ type: 'static', text: '• ' }, { type: 'gap', number: 5 }],
              [{ type: 'static', text: '• receive little' }], // no gap 6
            ],
          },
          {
            cells: [
              [{ type: 'static', text: 'Aeroponic' }],
              [{ type: 'static', text: '• no soil' }],
              [{ type: 'static', text: '• ' }, { type: 'gap', number: 7 }],
              [],
            ],
          },
        ],
      },
      questions: [4, 5, 6, 7].map(n => ({
        number: n,
        type: 'gap-fill' as const,
        prompt: `Gap (${n})`,
        answer: 'x',
      })),
    },
    {
      range: 'Questions 8-13',
      type: 'tfng' as const,
      instruction: 'TRUE FALSE NOT GIVEN',
      questions: [8, 9, 10, 11, 12, 13].map(n => ({
        number: n,
        type: 'true-false-not-given' as const,
        prompt: `S${n}`,
        answer: 'true',
      })),
    },
  ],
}

const tpl = getIeltsReadingWizardTemplatePart(1, 'p1-r1-sentence-table-tfng')
let part = normalizeAiReadingPart(rawA as never)
part = applyReadingTemplateTableStructure(part, tpl)
const gaps = gapNumbersInReadingNoteTable(part.questionGroups[1].noteTable)
console.log('after force gaps', gaps)
console.log('has 6?', gaps.includes(6))

try {
  validateAiReadingPartAgainstTemplate(part, 1, 'p1-r1-sentence-table-tfng')
  console.log('validate OK')
} catch (e) {
  console.error('validate FAIL', (e as Error).message)
  process.exit(1)
}

if (![4, 5, 6, 7].every(n => gaps.includes(n))) {
  console.error('FAIL missing gaps', gaps)
  process.exit(1)
}
console.log('PASS')
