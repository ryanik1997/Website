import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { findReadingTemplateOption } from '../src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'

const o = findReadingTemplateOption(3, 'p3-r3-ynng-summary-bank-mc')
if (o?.code !== 'r3ysb') throw new Error('code ' + o?.code)

const t = getIeltsReadingWizardTemplatePart(3, 'p3-r3-ynng-summary-bank-mc')
if (!/ABS|Ball-Strike|Automated/i.test(t.passageTitle ?? '')) throw new Error('title ABS')
if (!o.previewUrl.includes('Part3_18')) throw new Error('preview Part3_18')
if (t.questionGroups[0].type !== 'ynng') throw new Error('g0 ynng')
if (t.questionGroups[0].questions.length !== 6) throw new Error('6 ynng')
if (!/DeJesus first used ABS/i.test(t.questionGroups[0].questions[0].prompt)) {
  throw new Error('Q27 prompt from Part3_18')
}
if (t.questionGroups[1].type !== 'summary-completion') throw new Error('g1 summary')
if ((t.questionGroups[1].wordBank?.length ?? 0) < 8) throw new Error('bank A-H')
if (!t.questionGroups[1].wordBank?.some(w => /pitch boundary/i.test(w.label))) {
  throw new Error('bank phrase pitch boundary')
}
if (!/Calls by the umpire/i.test(t.questionGroups[1].note ?? '')) throw new Error('summary title')
if (t.questionGroups[1].questions.length !== 5) throw new Error('5 gaps')
if (t.questionGroups[2].type !== 'multiple-choice') throw new Error('g2 mc')
if (t.questionGroups[2].questions.length !== 3) throw new Error('3 mc')
if (!/fifth paragraph/i.test(t.questionGroups[2].questions[0].prompt)) throw new Error('Q38 prompt')
if (t.questionGroups[0].questions[0].number !== 27) throw new Error('start 27')
if (t.questionGroups[1].questions[0].number !== 33) throw new Error('bank start 33')
if (t.questionGroups[2].questions[0].number !== 38) throw new Error('mc start 38')

if (inferTemplateKindFromPart(3, t) !== 'p3-r3-ynng-summary-bank-mc') {
  throw new Error('infer ' + inferTemplateKindFromPart(3, t))
}

// Không nhầm với r3ysm (cùng signature type order)
const r3ysm = getIeltsReadingWizardTemplatePart(3, 'p3-r3-ynng-summary-mc')
if (inferTemplateKindFromPart(3, r3ysm) !== 'p3-r3-ynng-summary-mc') {
  throw new Error('r3ysm infer broke: ' + inferTemplateKindFromPart(3, r3ysm))
}

// AI thiếu wordBank + type gap-fill
const raw = {
  ...t,
  questionGroups: [
    t.questionGroups[0],
    {
      ...t.questionGroups[1],
      type: 'gap-fill' as const,
      wordBank: undefined,
      note: 'short 33________',
    },
    t.questionGroups[2],
  ],
}
let part = normalizeAiReadingPart(raw as never)
part = applyReadingTemplateTableStructure(part, t)
const g = part.questionGroups[1]
if (g.type !== 'summary-completion') throw new Error('hybrid type ' + g.type)
if ((g.wordBank?.length ?? 0) < 8) throw new Error('hybrid bank ' + g.wordBank?.length)
if (!g.wordBank?.some(w => /pitch boundary/i.test(w.label))) {
  throw new Error('missing pitch boundary from SAMPLE bank')
}
if (!g.wordBank?.some(w => /former roles/i.test(w.label))) {
  throw new Error('missing former roles from SAMPLE bank')
}

console.log('PASS r3ysb', o.label)
