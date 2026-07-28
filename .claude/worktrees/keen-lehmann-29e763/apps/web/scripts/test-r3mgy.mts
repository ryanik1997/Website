import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { findReadingTemplateOption } from '../src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'

const o = findReadingTemplateOption(3, 'p3-r3-mc-summary-gap-ynng')
if (o?.code !== 'r3mgy') throw new Error('code ' + o?.code)
if (!o.previewUrl.includes('Part3_17')) throw new Error('preview')

const t = getIeltsReadingWizardTemplatePart(3, 'p3-r3-mc-summary-gap-ynng')
if (!/Unselfish/i.test(t.passageTitle ?? '')) throw new Error('title')
if (t.questionGroups.map(g => g.type).join('|') !== 'multiple-choice|gap-fill|ynng') {
  throw new Error('types ' + t.questionGroups.map(g => g.type).join('|'))
}
if (t.questionGroups[1].wordBank?.length) throw new Error('must not have wordBank')
if (!t.questionGroups[1].note || !/31_{2,}/.test(t.questionGroups[1].note)) throw new Error('note gaps')
if (t.questionGroups[1].questions.length !== 5) throw new Error('5 summary gaps')
if (t.questionGroups[2].questions.length !== 5) throw new Error('5 ynng')

if (inferTemplateKindFromPart(3, t) !== 'p3-r3-mc-summary-gap-ynng') {
  throw new Error('infer ' + inferTemplateKindFromPart(3, t))
}

// AI thiếu note
const raw = {
  ...t,
  questionGroups: [
    t.questionGroups[0],
    {
      ...t.questionGroups[1],
      note: 'short',
      type: 'gap-fill' as const,
    },
    t.questionGroups[2],
  ],
}
let part = normalizeAiReadingPart(raw as never)
part = applyReadingTemplateTableStructure(part, t)
if (!part.questionGroups[1].note || !/31_{2,}/.test(part.questionGroups[1].note || '')) {
  throw new Error('hybrid note missing')
}
console.log('PASS r3mgy', o.label)
