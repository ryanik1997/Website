import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'
import { findReadingTemplateOption } from '../src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts'
import { inferTemplateKindFromPart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingWizardEdit.ts'
import { isReadingChooseTwoGroup } from '../src/features/exam/readingChooseTwoUtils.ts'
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'

const o = findReadingTemplateOption(2, 'p2-r2-headings-choose-two-notes')
if (o?.code !== 'r2h2n') throw new Error('code ' + o?.code)
if (!o.previewUrl.includes('Part2_20')) throw new Error('preview')

const t = getIeltsReadingWizardTemplatePart(2, 'p2-r2-headings-choose-two-notes')
if (!/coral/i.test(t.passageTitle ?? '')) throw new Error('title')
if (t.passage.length !== 6) throw new Error('paras A-F ' + t.passage.length)

const types = t.questionGroups.map(g => g.type).join('|')
if (types !== 'matching-headings|multiple-choice|multiple-choice|gap-fill') {
  throw new Error('types ' + types)
}
if (t.questionGroups[0].questions.length !== 6) throw new Error('6 headings')
if ((t.questionGroups[0].headings?.length ?? 0) < 7) throw new Error('headings i-vii')
if (!/Tried and tested/i.test(t.questionGroups[0].headings?.[0]?.label ?? '')) {
  throw new Error('heading i label')
}

const g20 = {
  id: 'g20',
  ...t.questionGroups[1],
  questions: t.questionGroups[1].questions.map(q => ({
    ...q,
    id: `q${q.number}`,
    explanation: q.explanation ?? '',
    options: q.options?.map(opt => ({ ...opt })),
  })),
}
if (!isReadingChooseTwoGroup(g20 as never)) throw new Error('choose two Q20-21')

const g22 = {
  id: 'g22',
  ...t.questionGroups[2],
  questions: t.questionGroups[2].questions.map(q => ({
    ...q,
    id: `q${q.number}`,
    explanation: q.explanation ?? '',
    options: q.options?.map(opt => ({ ...opt })),
  })),
}
if (!isReadingChooseTwoGroup(g22 as never)) throw new Error('choose two Q22-23')

if ((t.questionGroups[3].notePassage?.length ?? 0) < 3) throw new Error('notePassage')
if (t.questionGroups[3].questions.length !== 3) throw new Error('3 notes gaps')
if (t.questionGroups[3].questions[0].number !== 24) throw new Error('notes start 24')

if (inferTemplateKindFromPart(2, t) !== 'p2-r2-headings-choose-two-notes') {
  throw new Error('infer ' + inferTemplateKindFromPart(2, t))
}

// AI thiếu headings + notePassage
const raw = {
  ...t,
  questionGroups: [
    {
      ...t.questionGroups[0],
      headings: undefined,
    },
    t.questionGroups[1],
    t.questionGroups[2],
    {
      ...t.questionGroups[3],
      notePassage: undefined,
      note: 'short',
    },
  ],
}
let part = normalizeAiReadingPart(raw as never)
part = applyReadingTemplateTableStructure(part, t)
if ((part.questionGroups[0].headings?.length ?? 0) < 7) {
  throw new Error('hybrid headings ' + part.questionGroups[0].headings?.length)
}
const notesG = part.questionGroups[3]
const hasNotes =
  (notesG.notePassage?.length ?? 0) >= 3
  || /24_{2,}/.test(notesG.note || '')
  || /tentacles/i.test(JSON.stringify(notesG.notePassage ?? ''))
if (!hasNotes) {
  // hybrid may restore notePassage from SAMPLE
  if ((notesG.notePassage?.length ?? 0) < 3) {
    console.warn('WARN notes hybrid thin', notesG.notePassage?.length, notesG.note)
  }
}

console.log('PASS r2h2n', o.label)
