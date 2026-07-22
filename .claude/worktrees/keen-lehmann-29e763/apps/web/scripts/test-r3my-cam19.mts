import { sanitizeReadingExam } from '../src/features/exam/readingExamSanitize.ts'
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'
import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { findReadingTemplateOption } from '../src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'

const opt = findReadingTemplateOption(3, 'p3-r3-mc-summary-ynng')
if (opt?.code !== 'r3my') throw new Error('catalog code')
const tpl = getIeltsReadingWizardTemplatePart(3, 'p3-r3-mc-summary-ynng')
if (!/misinformation/i.test(tpl.passageTitle ?? '')) throw new Error('title ' + tpl.passageTitle)
if (tpl.questionGroups[0].type !== 'multiple-choice') throw new Error('g0')
if (tpl.questionGroups[1].type !== 'summary-completion') throw new Error('g1')
if ((tpl.questionGroups[1].wordBank?.length ?? 0) < 10) throw new Error('bank')
if (tpl.questionGroups[2].type !== 'ynng') throw new Error('g2')
if (inferTemplateKindFromPart(3, tpl) !== 'p3-r3-mc-summary-ynng') throw new Error('infer')

// AI sai: thiếu bank + last group type MC (double YNNG bug)
const raw = {
  ...tpl,
  questionGroups: [
    tpl.questionGroups[0],
    {
      range: 'Questions 31-36',
      type: 'gap-fill' as const,
      instruction: 'Complete the summary using the list of phrases, A-J, below.',
      note: 'short',
      questions: [31, 32, 33, 34, 35, 36].map(n => ({
        number: n,
        type: 'gap-fill' as const,
        prompt: `Gap (${n})`,
        answer: 'a',
      })),
    },
    {
      ...tpl.questionGroups[2],
      type: 'multiple-choice' as const,
    },
  ],
}

let part = normalizeAiReadingPart(raw as never)
part = applyReadingTemplateTableStructure(part, tpl)
const exam = sanitizeReadingExam({
  id: 't',
  title: 't',
  durationMinutes: 60,
  bandHint: '',
  parts: [{
    id: 'p3',
    partNumber: 3,
    rangeLabel: 'r',
    passageTitle: 't',
    passage: tpl.passage.map((b, i) => ({ ...b, text: b.text ?? '' })),
    questionGroups: part.questionGroups.map((g, i) => ({
      ...g,
      id: `g${i}`,
      questions: g.questions.map((q, j) => ({
        ...q,
        id: `q${i}-${j}`,
        explanation: q.explanation ?? '',
      })),
    })),
  }],
} as never)

const groups = exam.parts[0].questionGroups
if (groups[1].type !== 'summary-completion') throw new Error('summary type ' + groups[1].type)
if ((groups[1].wordBank?.length ?? 0) < 10) throw new Error('bank after hybrid')
if (groups[2].type !== 'ynng') throw new Error('ynng type ' + groups[2].type)
if (groups[2].questions[0].options?.length !== 3) throw new Error('opts')
if (groups[2].questions[0].options?.some(o => /if the/i.test(o.label))) throw new Error('long labels')
console.log('PASS r3my Cam19', groups.map(g => `${g.type}/bank${g.wordBank?.length ?? 0}`).join(' | '))
