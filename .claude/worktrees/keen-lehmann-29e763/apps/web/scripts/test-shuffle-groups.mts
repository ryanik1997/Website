/**
 * Paste xáo trộn dạng câu → reorder + infer vẫn đúng template.
 */
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'
import {
  classifyReadingGroupRole,
  partRoleMultisetKey,
  reorderPartGroupsToTemplate,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingGroupRoles.ts'
import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'

// ── r2msc: Match + Sentence + 2× Choose TWO ──
const r2 = getIeltsReadingWizardTemplatePart(2, 'p2-r2-match-sentence-choose-two')
const shuffledR2 = {
  ...r2,
  questionGroups: [
    r2.questionGroups[2], // choose two first
    r2.questionGroups[0], // match
    r2.questionGroups[3], // choose two 2
    r2.questionGroups[1], // sentence
  ],
}
const reR2 = reorderPartGroupsToTemplate(shuffledR2 as never, r2)
const rolesR2 = reR2.questionGroups.map(g => classifyReadingGroupRole(g))
console.log('r2msc reordered roles', rolesR2)
if (rolesR2[0] !== 'matching-paragraph') throw new Error('r2[0] match')
if (rolesR2[1] !== 'sentence') throw new Error('r2[1] sentence')
if (rolesR2[2] !== 'choose-two') throw new Error('r2[2] c2')
if (rolesR2[3] !== 'choose-two') throw new Error('r2[3] c2')

const inferR2 = inferTemplateKindFromPart(2, shuffledR2 as never)
if (inferR2 !== 'p2-r2-match-sentence-choose-two') {
  throw new Error('infer r2msc got ' + inferR2)
}

// ── r3my: MC + summary bank + YNNG ──
const r3 = getIeltsReadingWizardTemplatePart(3, 'p3-r3-mc-summary-ynng')
const shuffledR3 = {
  ...r3,
  questionGroups: [
    r3.questionGroups[2], // ynng first
    r3.questionGroups[1], // summary
    r3.questionGroups[0], // mc
  ],
}
const reR3 = reorderPartGroupsToTemplate(shuffledR3 as never, r3)
const rolesR3 = reR3.questionGroups.map(g => classifyReadingGroupRole(g))
console.log('r3my reordered roles', rolesR3)
if (rolesR3[0] !== 'multiple-choice') throw new Error('r3[0] mc')
if (rolesR3[1] !== 'summary-bank') throw new Error('r3[1] bank')
if (rolesR3[2] !== 'ynng') throw new Error('r3[2] ynng')

// hybrid after shuffle still has bank + ynng
let part = normalizeAiReadingPart(shuffledR3 as never)
part = applyReadingTemplateTableStructure(part, r3)
const g1 = part.questionGroups[1]
const g2 = part.questionGroups[2]
if ((g1.wordBank?.length ?? 0) < 10) throw new Error('bank after shuffle hybrid')
if (g2.type !== 'ynng') throw new Error('ynng type after hybrid ' + g2.type)

// Multiset same whether ordered or shuffled
if (partRoleMultisetKey(r3) !== partRoleMultisetKey(shuffledR3 as never)) {
  throw new Error('multiset mismatch')
}

// Infer: shuffled order still has MC/summary/ynng content — assignment score → r3my
const inferR3 = inferTemplateKindFromPart(3, shuffledR3 as never)
console.log('infer shuffled r3', inferR3)
// Ordered SAMPLE → r3my
if (inferTemplateKindFromPart(3, r3) !== 'p3-r3-mc-summary-ynng') {
  throw new Error('infer ordered r3my ' + inferTemplateKindFromPart(3, r3))
}
// r3ysm SAMPLE ordered
const r3ysm = getIeltsReadingWizardTemplatePart(3, 'p3-r3-ynng-summary-mc')
if (inferTemplateKindFromPart(3, r3ysm) !== 'p3-r3-ynng-summary-mc') {
  throw new Error('infer ordered r3ysm')
}

console.log('PASS shuffle reorder + hybrid')
