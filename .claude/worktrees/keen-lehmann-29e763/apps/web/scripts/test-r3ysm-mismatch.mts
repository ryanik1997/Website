import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { applyReadingTemplateTableStructure, normalizeAiReadingPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'

const tpl = getIeltsReadingWizardTemplatePart(3, 'p3-r3-ynng-summary-mc')

// mismatch group count
const raw4 = {
  partNumber: 3,
  rangeLabel: 'x',
  passageTitle: 'W',
  passage: tpl.passage,
  questionGroups: [
    tpl.questionGroups[0],
    {
      range: 'Questions 31-36',
      type: 'gap-fill',
      instruction: 'Complete the summary using the list of phrases, A-J, below.',
      note: 'from a 31________ is that',
      questions: [31,32,33,34,35,36].map(n => ({ number: n, type: 'gap-fill', prompt: 'Gap', answer: 'a' })),
    },
    { range: '37-38', type: 'multiple-choice', instruction: 'MC', questions: [37,38].map(n => ({ number: n, type: 'multiple-choice', prompt: 'q', options: [{id:'a',label:'a'}], answer: 'a' })) },
    { range: '39-40', type: 'multiple-choice', instruction: 'MC', questions: [39,40].map(n => ({ number: n, type: 'multiple-choice', prompt: 'q', options: [{id:'a',label:'a'}], answer: 'a' })) },
  ],
}
const p = applyReadingTemplateTableStructure(normalizeAiReadingPart(raw4 as never), tpl)
const g = p.questionGroups.find(x => x.questions.some(q => q.number === 31))
console.log('4g', g?.type, 'bank', g?.wordBank?.length)

// wordBank as options on first question only
const rawOpts = {
  partNumber: 3,
  rangeLabel: 'x',
  passageTitle: 'W',
  passage: tpl.passage,
  questionGroups: [
    tpl.questionGroups[0],
    {
      range: 'Questions 31-36',
      type: 'summary-completion',
      instruction: 'Complete the summary using the list of phrases, A-J, below.',
      note: tpl.questionGroups[1].note,
      questions: [31,32,33,34,35,36].map(n => ({
        number: n, type: 'summary-completion', prompt: 'Gap', answer: 'a',
        options: n === 31 ? [
          {id:'a',label:'modest fame'},{id:'b',label:'vast range'},{id:'c',label:'x'},{id:'d',label:'y'},
          {id:'e',label:'e'},{id:'f',label:'f'},{id:'g',label:'g'},{id:'h',label:'h'},{id:'i',label:'i'},{id:'j',label:'j'},
        ] : [],
      })),
    },
    tpl.questionGroups[2],
  ],
}
const p2 = applyReadingTemplateTableStructure(normalizeAiReadingPart(rawOpts as never), tpl)
console.log('opts', p2.questionGroups[1].type, p2.questionGroups[1].wordBank?.length)

// AI puts bank under different key
const rawWb = {
  partNumber: 3,
  rangeLabel: 'x',
  passageTitle: 'W',
  passage: tpl.passage,
  questionGroups: [
    tpl.questionGroups[0],
    {
      range: 'Questions 31-36',
      type: 'gap-fill',
      instruction: 'Complete the summary below.',
      note: tpl.questionGroups[1].note,
      listOfOptions: tpl.questionGroups[1].wordBank,
      questions: [31,32,33,34,35,36].map(n => ({ number: n, type: 'gap-fill', prompt: 'Gap', answer: 'a' })),
    },
    tpl.questionGroups[2],
  ],
}
const p3 = applyReadingTemplateTableStructure(normalizeAiReadingPart(rawWb as never), tpl)
console.log('alt key', p3.questionGroups[1].type, p3.questionGroups[1].wordBank?.length)
