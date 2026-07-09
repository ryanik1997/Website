import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { findReadingTemplateOption } from '../src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'

const o = findReadingTemplateOption(3, 'p3-r3-match-features-summary')
if (o?.code !== 'r3mfs') throw new Error('code ' + o?.code)
if (!o.previewUrl.includes('Part3_20')) throw new Error('preview')

const t = getIeltsReadingWizardTemplatePart(3, 'p3-r3-match-features-summary')
if (!/guard dogs|livestock/i.test(t.passageTitle ?? '')) throw new Error('title')
if (t.passage.length !== 7) throw new Error('A-G ' + t.passage.length)

const types = t.questionGroups.map(g => g.type).join('|')
if (types !== 'matching-paragraph|matching-features|gap-fill') {
  throw new Error('types ' + types)
}
if (t.questionGroups[0].questions.length !== 5) throw new Error('5 match')
if ((t.questionGroups[0].paragraphLetters?.length ?? 0) < 7) throw new Error('letters A-G')
if (t.questionGroups[1].questions.length !== 5) throw new Error('5 features')
if ((t.questionGroups[1].features?.length ?? 0) < 5) throw new Error('features A-E')
if (!/Dan Macon/i.test(t.questionGroups[1].features?.[0]?.name ?? '')) throw new Error('Macon')
if (t.questionGroups[2].questions.length !== 4) throw new Error('4 summary')
if (!/Unintended ecological/i.test(t.questionGroups[2].note ?? '')) throw new Error('summary title')
if (!/37_{2,}/.test(t.questionGroups[2].note ?? '')) throw new Error('gap 37')

if (inferTemplateKindFromPart(3, t) !== 'p3-r3-match-features-summary') {
  throw new Error('infer ' + inferTemplateKindFromPart(3, t))
}

// Không nhầm r3ms (match|gap|features)
const r3ms = getIeltsReadingWizardTemplatePart(3, 'p3-r3-match-summary-features')
if (inferTemplateKindFromPart(3, r3ms) !== 'p3-r3-match-summary-features') {
  throw new Error('r3ms infer broke')
}

// AI thiếu note summary
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
if (!/37_{2,}/.test(part.questionGroups[2].note || '')) {
  throw new Error('hybrid note ' + part.questionGroups[2].note)
}

console.log('PASS r3mfs', o.label)
