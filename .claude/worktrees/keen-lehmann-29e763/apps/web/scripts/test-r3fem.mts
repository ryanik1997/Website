import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { findReadingTemplateOption } from '../src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'

const o = findReadingTemplateOption(3, 'p3-r3-features-endings-mc')
if (o?.code !== 'r3fem') throw new Error('code ' + o?.code)
if (!o.previewUrl.includes('Part3_19')) throw new Error('preview')

const t = getIeltsReadingWizardTemplatePart(3, 'p3-r3-features-endings-mc')
if (!/robot/i.test(t.passageTitle ?? '')) throw new Error('title')

const types = t.questionGroups.map(g => g.type).join('|')
if (types !== 'matching-features|summary-completion|multiple-choice') {
  throw new Error('types ' + types)
}
if (t.questionGroups[0].questions.length !== 7) throw new Error('7 features')
if ((t.questionGroups[0].features?.length ?? 0) < 3) throw new Error('features A-C')
if (!/Martin Rees/i.test(t.questionGroups[0].features?.[0]?.name ?? '')) throw new Error('Rees')
if (t.questionGroups[1].questions.length !== 3) throw new Error('3 endings')
if ((t.questionGroups[1].wordBank?.length ?? 0) < 4) throw new Error('endings bank A-D')
if (!/robots to explore/i.test(t.questionGroups[1].wordBank?.[0]?.label ?? '')) {
  throw new Error('ending A label')
}
if (t.questionGroups[2].questions.length !== 4) throw new Error('4 mc')
if (!/fear of machines/i.test(t.questionGroups[2].questions[0].prompt)) throw new Error('Q37')

if (inferTemplateKindFromPart(3, t) !== 'p3-r3-features-endings-mc') {
  throw new Error('infer ' + inferTemplateKindFromPart(3, t))
}

// AI thiếu wordBank endings (+ type gap-fill)
const raw = {
  ...t,
  questionGroups: [
    t.questionGroups[0],
    {
      ...t.questionGroups[1],
      type: 'gap-fill' as const,
      wordBank: undefined,
    },
    t.questionGroups[2],
  ],
}
let part = normalizeAiReadingPart(raw as never)
part = applyReadingTemplateTableStructure(part, t)
const endG = part.questionGroups[1]
if ((endG.wordBank?.length ?? 0) < 4) {
  throw new Error('hybrid endings bank ' + endG.wordBank?.length)
}
if (endG.type !== 'summary-completion') {
  throw new Error('hybrid endings type ' + endG.type)
}
if (!endG.wordBank?.some(w => /outer space/i.test(w.label))) {
  throw new Error('missing ending phrase from SAMPLE')
}

console.log('PASS r3fem', o.label)
