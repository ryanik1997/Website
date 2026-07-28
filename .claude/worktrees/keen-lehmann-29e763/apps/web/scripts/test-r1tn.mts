import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { findReadingTemplateOption } from '../src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'
import { applyReadingTemplateTableStructure, normalizeAiReadingPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'

const opt = findReadingTemplateOption(1, 'p1-r1-tfng-notes')
if (!opt || opt.code !== 'r1tn') throw new Error('catalog missing r1tn')
const tpl = getIeltsReadingWizardTemplatePart(1, 'p1-r1-tfng-notes')
if (tpl.questionGroups.length !== 2) throw new Error('need 2 groups')
if (tpl.questionGroups[0].type !== 'tfng') throw new Error('g0 tfng')
if (tpl.questionGroups[1].type !== 'gap-fill') throw new Error('g1 gap')
if ((tpl.questionGroups[1].notePassage?.filter(b => b.type === 'gap').length ?? 0) !== 6) throw new Error('6 gaps')
if (inferTemplateKindFromPart(1, tpl) !== 'p1-r1-tfng-notes') throw new Error('infer fail')

// AI thiếu notePassage → hybrid fill
const raw = {
  ...tpl,
  questionGroups: [
    tpl.questionGroups[0],
    {
      range: 'Questions 8-13',
      type: 'gap-fill',
      instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
      questions: [8,9,10,11,12,13].map(n => ({ number: n, type: 'gap-fill', prompt: 'Gap ('+n+')', answer: 'x' })),
    },
  ],
}
let p = applyReadingTemplateTableStructure(normalizeAiReadingPart(raw as never), tpl)
const notes = p.questionGroups[1]
if (!notes.notePassage?.length) throw new Error('hybrid notePassage missing')
if (!notes.notesTitle) throw new Error('notesTitle missing')
console.log('PASS r1tn', opt.label, notes.notesTitle, 'blocks', notes.notePassage.length)
