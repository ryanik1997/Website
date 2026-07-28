import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { findReadingTemplateOption } from '../src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'
import { isReadingChooseTwoGroup } from '../src/features/exam/readingChooseTwoUtils.ts'
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'

const o = findReadingTemplateOption(2, 'p2-r2-match-summary-choose-two')
if (o?.code !== 'r2ms2') throw new Error('code ' + o?.code)

const t = getIeltsReadingWizardTemplatePart(2, 'p2-r2-match-summary-choose-two')
const types = t.questionGroups.map(g => g.type).join('|')
if (types !== 'matching-paragraph|gap-fill|multiple-choice|multiple-choice') {
  throw new Error('types ' + types)
}
if (t.questionGroups[0].questions.length !== 3) throw new Error('match 3')
if (t.questionGroups[1].questions.length !== 6) throw new Error('summary 6')
if (!t.questionGroups[1].note || !/17_{2,}/.test(t.questionGroups[1].note)) throw new Error('note')
if (t.questionGroups[1].wordBank?.length) throw new Error('no bank')

const g23 = {
  id: 'g',
  ...t.questionGroups[2],
  questions: t.questionGroups[2].questions.map(q => ({
    ...q,
    id: `q${q.number}`,
    explanation: q.explanation ?? '',
    options: q.options?.map(o => ({ ...o })),
  })),
}
if (!isReadingChooseTwoGroup(g23 as never)) throw new Error('choose two detect')

if (inferTemplateKindFromPart(2, t) !== 'p2-r2-match-summary-choose-two') {
  throw new Error('infer ' + inferTemplateKindFromPart(2, t))
}

const raw = {
  ...t,
  questionGroups: [
    t.questionGroups[0],
    { ...t.questionGroups[1], note: 'short' },
    t.questionGroups[2],
    t.questionGroups[3],
  ],
}
let part = normalizeAiReadingPart(raw as never)
part = applyReadingTemplateTableStructure(part, t)
if (!part.questionGroups[1].note || !/17_{2,}/.test(part.questionGroups[1].note || '')) {
  throw new Error('hybrid note')
}
console.log('PASS r2ms2', o.label)
