/**
 * Exact shape from user: DeepSeek r1tb — TFNG + table as multiple-choice, no noteTable.
 */
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
  validateAiReadingPartAgainstTemplate,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'
import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import {
  gapNumbersInReadingNoteTable,
  isListLikeOrIncompleteNoteTable,
  noteTableStaticTextLength,
} from '../src/features/exam/readingNoteTableUtils.ts'

const deepseek = {
  partNumber: 1,
  rangeLabel: 'Read the text and answer questions 1–13.',
  passageTitle: 'Bats to the rescue',
  passage: [{ text: 'There are few places… bats… droppings… coffee… mosquitoes… protein… unclean… culture… houses.' }],
  questionGroups: [
    {
      range: 'Questions 1–6',
      instruction: 'TRUE FALSE NOT GIVEN',
      type: 'tfng',
      questions: [1, 2, 3, 4, 5, 6].map(n => ({
        number: n,
        type: 'true-false-not-given',
        prompt: `Q${n}`,
        answer: 'true',
        options: [
          { id: 'true', label: 'TRUE' },
          { id: 'false', label: 'FALSE' },
          { id: 'not-given', label: 'NOT GIVEN' },
        ],
      })),
    },
    {
      range: 'Questions 7–12',
      instruction: 'Complete the table below. Choose ONE WORD ONLY from the passage for each answer.',
      type: 'multiple-choice',
      questions: [
        { number: 7, type: 'gap-fill', prompt: 'Gap (7)', answer: 'droppings' },
        { number: 8, type: 'gap-fill', prompt: 'Gap (8)', answer: 'coffee' },
        { number: 9, type: 'gap-fill', prompt: 'Gap (9)', answer: 'mosquitoes' },
        { number: 10, type: 'gap-fill', prompt: 'Gap (10)', answer: 'protein' },
        { number: 11, type: 'gap-fill', prompt: 'Gap (11)', answer: 'unclean' },
        { number: 12, type: 'gap-fill', prompt: 'Gap (12)', answer: 'culture' },
        { number: 13, type: 'gap-fill', prompt: 'Gap (13)', answer: 'houses' },
      ],
    },
  ],
}

const tpl = getIeltsReadingWizardTemplatePart(1, 'p1-r1-tfng-table')
let part = normalizeAiReadingPart(deepseek as never)
part = applyReadingTemplateTableStructure(part, tpl)

const g1 = part.questionGroups[1]
const t = g1.noteTable
const gaps = gapNumbersInReadingNoteTable(t)
const staticLen = noteTableStaticTextLength(t)
const rows = t?.rows?.length ?? 0

console.log('group type', g1.type)
console.log('has noteTable', Boolean(t?.headers?.length))
console.log('headers', t?.headers)
console.log('rows', rows)
console.log('staticLen', staticLen)
console.log('gaps', gaps)
console.log('listLike', isListLikeOrIncompleteNoteTable(t, tpl.questionGroups[1].noteTable))
console.log('row0 left', JSON.stringify(t?.rows?.[0]?.cells?.[0]))
console.log('row1 left', JSON.stringify(t?.rows?.[1]?.cells?.[0]))

let ok = true
if (g1.type !== 'gap-fill') {
  console.error('FAIL: group type should be gap-fill, got', g1.type)
  ok = false
}
if (!t?.headers?.length || rows < 8) {
  console.error('FAIL: need full SAMPLE table rows>=8, got', rows)
  ok = false
}
if (![7, 8, 9, 10, 11, 12, 13].every(n => gaps.includes(n))) {
  console.error('FAIL: gaps', gaps)
  ok = false
}
const blob = JSON.stringify(t)
if (!/Aim|Method|Findings/i.test(blob)) {
  console.error('FAIL: missing Aim/Method/Findings in table')
  ok = false
}

try {
  validateAiReadingPartAgainstTemplate(part, 1, 'p1-r1-tfng-table')
  console.log('validate OK')
} catch (e) {
  console.error('validate FAIL', (e as Error).message)
  ok = false
}

if (!ok) process.exit(1)
console.log('PASS')
