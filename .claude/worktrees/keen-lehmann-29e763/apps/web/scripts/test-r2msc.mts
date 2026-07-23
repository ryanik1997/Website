import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { findReadingTemplateOption } from '../src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'

const o = findReadingTemplateOption(2, 'p2-r2-match-sentence-choose-two')
if (o?.code !== 'r2msc') throw new Error('code ' + o?.code)
if (!o.previewUrl.includes('Part2_17')) throw new Error('preview')

const t = getIeltsReadingWizardTemplatePart(2, 'p2-r2-match-sentence-choose-two')
if (!/Athletes and stress/i.test(t.passageTitle ?? '')) throw new Error('title')
if (t.questionGroups.length !== 4) throw new Error('groups ' + t.questionGroups.length)
if (t.questionGroups[0].type !== 'matching-paragraph') throw new Error('g0')
if (t.questionGroups[1].type !== 'sentence-completion') throw new Error('g1')
if (t.questionGroups[2].type !== 'multiple-choice') throw new Error('g2')
if (t.questionGroups[3].type !== 'multiple-choice') throw new Error('g3')
if ((t.questionGroups[0].paragraphLetters?.length ?? 0) !== 6) throw new Error('A-F')
if (inferTemplateKindFromPart(2, t) !== 'p2-r2-match-sentence-choose-two') {
  throw new Error('infer ' + inferTemplateKindFromPart(2, t))
}
const n = t.questionGroups.flatMap(g => g.questions).map(q => q.number)
if (n.join(',') !== '14,15,16,17,18,19,20,21,22,23,24,25,26') throw new Error('nums ' + n)
console.log('PASS r2msc', o.label)
