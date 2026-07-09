/**
 * Simulate DeepSeek returning Q7–12 as one-word list (no noteTable).
 * Expect: rematerialize → noteTable with matching gaps.
 */
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
  validateAiReadingPartAgainstTemplate,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'
import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { gapNumbersInReadingNoteTable } from '../src/features/exam/readingNoteTableUtils.ts'

const deepseekPart = {
  partNumber: 1,
  rangeLabel: 'Questions 1-13',
  passageTitle: 'Bats study',
  passage: [{ text: 'Bats help farmers. Droppings DNA. Maize pests. Mosquitoes. Protein. Damaged buildings. Agriculture. Shelters.' }],
  questionGroups: [
    {
      range: 'Questions 1-6',
      instruction: 'TRUE FALSE NOT GIVEN',
      type: 'tfng' as const,
      questions: [1, 2, 3, 4, 5, 6].map(n => ({
        number: n,
        type: 'true-false-not-given' as const,
        prompt: `Stmt ${n}`,
        answer: 'true',
      })),
    },
    {
      range: 'Questions 7-12',
      instruction: 'Choose ONE WORD ONLY from the passage for each answer.',
      type: 'gap-fill' as const,
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
}

const tpl = getIeltsReadingWizardTemplatePart(1, 'p1-r1-tfng-table')
let part = normalizeAiReadingPart(deepseekPart as never)
part = applyReadingTemplateTableStructure(part, tpl)
const g1 = part.questionGroups[1]
const gaps = gapNumbersInReadingNoteTable(g1.noteTable)

console.log('--- r1tb one-word simulation ---')
console.log('group type:', g1.type)
console.log('has noteTable:', Boolean(g1.noteTable?.headers?.length && g1.noteTable?.rows?.length))
console.log('headers:', g1.noteTable?.headers)
console.log('table gaps:', gaps)
console.log('question prompts:', g1.questions.map(q => q.prompt))
console.log('question types:', g1.questions.map(q => q.type))

const expected = [7, 8, 9, 10, 11, 12]
const ok = expected.every(n => gaps.includes(n))
if (!ok) {
  console.error('FAIL: table gaps missing some of', expected)
  process.exit(1)
}

try {
  validateAiReadingPartAgainstTemplate(part, 1, 'p1-r1-tfng-table')
  console.log('validate: OK')
} catch (e) {
  console.error('validate FAIL:', (e as Error).message)
  process.exit(1)
}

// Case 2: no question types + "ONE WORD ONLY" (DeepSeek hay bỏ type)
const deepseek2 = {
  ...deepseekPart,
  questionGroups: [
    deepseekPart.questionGroups[0],
    {
      range: 'Questions 7-12',
      instruction: 'Choose ONE WORD ONLY from the passage for each answer.',
      type: 'gap-fill' as const,
      questions: [7, 8, 9, 10, 11, 12].map(n => ({
        number: n,
        prompt: `something ${n} blank`,
        answer: 'word',
      })),
    },
  ],
}
let part2 = normalizeAiReadingPart(deepseek2 as never)
part2 = applyReadingTemplateTableStructure(part2, tpl)
const g2 = part2.questionGroups[1]
const gaps2 = gapNumbersInReadingNoteTable(g2.noteTable)
if (!g2.noteTable?.headers?.length || ![7, 8, 9, 10, 11, 12].every(n => gaps2.includes(n))) {
  console.error('FAIL case2', gaps2, g2.noteTable?.headers)
  process.exit(1)
}
console.log('case2 OK gaps', gaps2)
console.log('PASS')
