import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
  validateAiReadingPartShape,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'
import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'

const tpl = getIeltsReadingWizardTemplatePart(2, 'p2-r2-headings-mc-summary')
console.log('SAMPLE groups', tpl.questionGroups.map(g => g.type).join('|'))
console.log('headings', tpl.questionGroups[0].headings?.length)
console.log('summary gaps', (tpl.questionGroups[2].note || '').match(/\d+_{2,}/g))
console.log('passage', tpl.passage.length, 'MC', tpl.questionGroups[1].questions.length)

const raw = {
  partNumber: 2,
  rangeLabel: 'q',
  passageTitle: 'Steam',
  passage: tpl.passage,
  questionGroups: [
    {
      range: '14-20',
      type: 'matching-headings' as const,
      instruction: 'Choose the correct heading',
      questions: [14, 15, 16, 17, 18, 19, 20].map((n, i) => ({
        number: n,
        type: 'matching-headings' as const,
        prompt: `Paragraph ${String.fromCharCode(65 + i)}`,
        answer: 'i',
      })),
    },
    {
      range: '21-23',
      type: 'multiple-choice' as const,
      instruction: 'Choose the correct letter',
      questions: tpl.questionGroups[1].questions,
    },
    {
      range: '24-26',
      type: 'gap-fill' as const,
      instruction: 'Complete the summary below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.',
      note: 'short incomplete',
      questions: [24, 25, 26].map(n => ({
        number: n,
        type: 'gap-fill' as const,
        prompt: `Gap (${n})`,
        answer: 'x',
      })),
    },
  ],
}

let part = normalizeAiReadingPart(raw as never)
part = applyReadingTemplateTableStructure(part, tpl)

if ((part.questionGroups[0].headings?.length ?? 0) < 8) {
  console.error('FAIL headings', part.questionGroups[0].headings?.length)
  process.exit(1)
}
if (!/24_{2,}/.test(part.questionGroups[2].note || '') || !/26_{2,}/.test(part.questionGroups[2].note || '')) {
  console.error('FAIL summary note', part.questionGroups[2].note)
  process.exit(1)
}
if (part.questionGroups[2].noteTable) {
  console.error('FAIL noteTable infection')
  process.exit(1)
}
validateAiReadingPartShape(part, 2)
console.log('after headings', part.questionGroups[0].headings?.length)
console.log('after note ok')
console.log('PASS')
