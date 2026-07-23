import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { findReadingTemplateOption } from '../src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'

const o = findReadingTemplateOption(2, 'p2-r2-match-features-summary')
if (o?.code !== 'r2mfu') throw new Error('code ' + o?.code)
if (!o.previewUrl.includes('Part2_19')) throw new Error('preview')

const t = getIeltsReadingWizardTemplatePart(2, 'p2-r2-match-features-summary')
if (!/Deep-sea mining/i.test(t.passageTitle ?? '')) throw new Error('title')
if (t.questionGroups.map(g => g.type).join('|') !== 'matching-paragraph|matching-features|gap-fill') {
  throw new Error('types ' + t.questionGroups.map(g => g.type).join('|'))
}
if ((t.questionGroups[0].paragraphLetters?.length ?? 0) !== 6) throw new Error('A-F')
if ((t.questionGroups[1].features?.length ?? 0) !== 5) throw new Error('5 features')
if (t.questionGroups[1].questions.length !== 6) throw new Error('6 feature qs')
if (t.questionGroups[2].questions.length !== 3) throw new Error('3 summary')
if (!t.questionGroups[2].note || !/24_{2,}/.test(t.questionGroups[2].note)) throw new Error('summary note')

if (inferTemplateKindFromPart(2, t) !== 'p2-r2-match-features-summary') {
  throw new Error('infer ' + inferTemplateKindFromPart(2, t))
}

const raw = {
  ...t,
  questionGroups: [
    t.questionGroups[0],
    t.questionGroups[1],
    { ...t.questionGroups[2], note: 'short' },
  ],
}
let part = normalizeAiReadingPart(raw as never)
part = applyReadingTemplateTableStructure(part, t)
if (!part.questionGroups[2].note || !/24_{2,}/.test(part.questionGroups[2].note || '')) {
  throw new Error('hybrid note')
}
console.log('PASS r2mfu', o.label)
