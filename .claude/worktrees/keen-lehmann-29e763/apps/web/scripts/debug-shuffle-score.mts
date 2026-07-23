import {
  classifyReadingGroupRole,
  partRoleMultisetKey,
  reorderPartGroupsToTemplate,
  scoreGroupAgainstTemplateSlot,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingGroupRoles.ts'
import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'

const r3 = getIeltsReadingWizardTemplatePart(3, 'p3-r3-mc-summary-ynng')
const r3ysm = getIeltsReadingWizardTemplatePart(3, 'p3-r3-ynng-summary-mc')
const shuffled = {
  ...r3,
  questionGroups: [r3.questionGroups[2], r3.questionGroups[1], r3.questionGroups[0]],
}
console.log('shuffled nums', shuffled.questionGroups.map(g => g.questions.map(q => q.number).join('-')))
console.log('multisets equal', partRoleMultisetKey(r3) === partRoleMultisetKey(r3ysm))

function score(sample: typeof r3, part: typeof shuffled) {
  const reordered = reorderPartGroupsToTemplate(part as never, sample)
  let s = 0
  for (let i = 0; i < 3; i++) {
    const sc = scoreGroupAgainstTemplateSlot(reordered.questionGroups[i], sample.questionGroups[i])
    console.log(
      ' ',
      i,
      classifyReadingGroupRole(reordered.questionGroups[i]),
      reordered.questionGroups[i].questions.map(q => q.number).join('-'),
      'vs sample',
      classifyReadingGroupRole(sample.questionGroups[i]),
      sample.questionGroups[i].questions.map(q => q.number).join('-'),
      '→',
      sc,
    )
    s += sc
  }
  for (let i = 0; i < 3; i++) {
    const gn = part.questionGroups[i].questions.map(q => q.number)
    const tn = sample.questionGroups[i].questions.map(q => q.number)
    if (Math.min(...gn) === Math.min(...tn)) s += 40
  }
  return s
}
console.log('TOTAL r3my', score(r3, shuffled))
console.log('TOTAL r3ysm', score(r3ysm, shuffled))
console.log('infer', inferTemplateKindFromPart(3, shuffled as never))
