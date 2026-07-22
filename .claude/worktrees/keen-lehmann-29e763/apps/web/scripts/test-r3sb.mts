import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { findReadingTemplateOption } from '../src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'

const o = findReadingTemplateOption(3, 'p3-r3-summary-bank-ynng-mc')
if (o?.code !== 'r3sb') throw new Error('code ' + o?.code)
if (!o.previewUrl.includes('Part3_15')) throw new Error('preview')

const t = getIeltsReadingWizardTemplatePart(3, 'p3-r3-summary-bank-ynng-mc')
if (!/gifted/i.test(t.passageTitle ?? '')) throw new Error('title')
if (t.questionGroups[0].type !== 'summary-completion') throw new Error('g0')
if ((t.questionGroups[0].wordBank?.length ?? 0) < 11) throw new Error('bank A-K')
if (t.questionGroups[0].questions.length !== 6) throw new Error('6 gaps')
if (t.questionGroups[1].type !== 'ynng') throw new Error('g1 ynng')
if (t.questionGroups[1].questions.length !== 5) throw new Error('5 ynng')
if (t.questionGroups[2].type !== 'multiple-choice') throw new Error('g2 mc')
if (t.questionGroups[2].questions.length !== 3) throw new Error('3 mc')

if (inferTemplateKindFromPart(3, t) !== 'p3-r3-summary-bank-ynng-mc') {
  throw new Error('infer ' + inferTemplateKindFromPart(3, t))
}

// AI thiếu wordBank
const raw = {
  ...t,
  questionGroups: [
    {
      ...t.questionGroups[0],
      type: 'gap-fill' as const,
      wordBank: undefined,
      note: 'short',
    },
    t.questionGroups[1],
    t.questionGroups[2],
  ],
}
let part = normalizeAiReadingPart(raw as never)
part = applyReadingTemplateTableStructure(part, t)
if ((part.questionGroups[0].wordBank?.length ?? 0) < 11) throw new Error('hybrid bank')
if (part.questionGroups[0].type !== 'summary-completion') throw new Error('hybrid type')
console.log('PASS r3sb', o.label)
