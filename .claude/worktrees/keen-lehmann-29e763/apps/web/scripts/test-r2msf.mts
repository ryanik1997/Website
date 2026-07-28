import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { findReadingTemplateOption } from '../src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'

const o = findReadingTemplateOption(2, 'p2-r2-match-sentence-features')
if (o?.code !== 'r2msf') throw new Error('code ' + o?.code)
if (!o.previewUrl.includes('Part2_18')) throw new Error('preview')

const t = getIeltsReadingWizardTemplatePart(2, 'p2-r2-match-sentence-features')
if (!/wetland/i.test(t.passageTitle ?? '')) throw new Error('title')
if (t.questionGroups.map(g => g.type).join('|') !== 'matching-paragraph|sentence-completion|matching-features') {
  throw new Error('types ' + t.questionGroups.map(g => g.type).join('|'))
}
if ((t.questionGroups[0].paragraphLetters?.length ?? 0) !== 8) throw new Error('A-H')
if (t.questionGroups[1].questions.length !== 5) throw new Error('5 sentences')
if ((t.questionGroups[2].features?.length ?? 0) !== 4) throw new Error('4 features')
if (inferTemplateKindFromPart(2, t) !== 'p2-r2-match-sentence-features') {
  throw new Error('infer ' + inferTemplateKindFromPart(2, t))
}
console.log('PASS r2msf', o.label)
