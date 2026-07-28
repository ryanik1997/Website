import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'
import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import {
  isListLikeOrIncompleteNoteTable,
  noteTableStaticTextLength,
  partNeedsNoteTableRepair,
} from '../src/features/exam/readingNoteTableUtils.ts'

const tpl = getIeltsReadingWizardTemplatePart(1, 'p1-r1-tfng-table')
const sample = tpl.questionGroups[1].noteTable!

const raw = {
  partNumber: 1,
  rangeLabel: 'q',
  passageTitle: 't',
  passage: [{ text: 'p' }],
  questionGroups: [
    {
      range: '1-6',
      type: 'tfng' as const,
      instruction: 't',
      questions: [1, 2, 3, 4, 5, 6].map(n => ({
        number: n,
        type: 'true-false-not-given' as const,
        prompt: 's',
        answer: 'true',
      })),
    },
    {
      range: '7-12',
      type: 'gap-fill' as const,
      instruction: 'ONE WORD ONLY',
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

let part = normalizeAiReadingPart(raw as never)
part = applyReadingTemplateTableStructure(part, tpl)
const t = part.questionGroups[1].noteTable

console.log('after rematerialize staticLen', noteTableStaticTextLength(t))
console.log('listLike', isListLikeOrIncompleteNoteTable(t, sample))
console.log('needsRepair', partNeedsNoteTableRepair(part, tpl))
console.log('rows', t?.rows?.length)
console.log('SAMPLE staticLen', noteTableStaticTextLength(sample))

// Sau fix: one-word list → SAMPLE layout đủ hàng (không còn list-like)
if (isListLikeOrIncompleteNoteTable(t, sample)) {
  console.error('FAIL: should use full SAMPLE layout, not list-like')
  process.exit(1)
}
if ((t?.rows?.length ?? 0) < 8) {
  console.error('FAIL: expected ≥8 rows from SAMPLE', t?.rows?.length)
  process.exit(1)
}
if (isListLikeOrIncompleteNoteTable(sample, sample)) {
  console.error('FAIL: SAMPLE should not be list-like vs itself')
  process.exit(1)
}
console.log('PASS')
