import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { findReadingTemplateOption } from '../src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'

const o = findReadingTemplateOption(3, 'p3-r3-mc-endings-ynng')
if (o?.code !== 'r3mey') throw new Error('code ' + o?.code)
if (!o.previewUrl.includes('Part3_16')) throw new Error('preview')

const t = getIeltsReadingWizardTemplatePart(3, 'p3-r3-mc-endings-ynng')
if (!/speech translation/i.test(t.passageTitle ?? '')) throw new Error('title')
if (t.questionGroups.map(g => g.type).join('|') !== 'multiple-choice|summary-completion|ynng') {
  throw new Error('types')
}
if ((t.questionGroups[1].wordBank?.length ?? 0) !== 6) throw new Error('endings A-F')
if (t.questionGroups[1].questions.length !== 4) throw new Error('4 endings')
if (t.questionGroups[2].questions.length !== 6) throw new Error('6 ynng')
if (inferTemplateKindFromPart(3, t) !== 'p3-r3-mc-endings-ynng') {
  throw new Error('infer ' + inferTemplateKindFromPart(3, t))
}

// AI thiếu wordBank endings
const raw = {
  ...t,
  questionGroups: [
    t.questionGroups[0],
    {
      ...t.questionGroups[1],
      wordBank: undefined,
      type: 'gap-fill' as const,
    },
    t.questionGroups[2],
  ],
}
let part = normalizeAiReadingPart(raw as never)
part = applyReadingTemplateTableStructure(part, t)
if ((part.questionGroups[1].wordBank?.length ?? 0) < 6) throw new Error('hybrid bank')
if (part.questionGroups[1].type !== 'summary-completion') throw new Error('hybrid type')
console.log('PASS r3mey', o.label)
