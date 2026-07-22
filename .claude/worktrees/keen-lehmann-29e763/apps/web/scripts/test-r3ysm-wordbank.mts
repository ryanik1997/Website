import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'
import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'

const tpl = getIeltsReadingWizardTemplatePart(3, 'p3-r3-ynng-summary-mc')
const sampleBank = tpl.questionGroups[1].wordBank
console.log('SAMPLE type', tpl.questionGroups[1].type, 'bank', sampleBank?.length)

// AI thiếu wordBank, type gap-fill
const raw = {
  partNumber: 3,
  rangeLabel: 'q',
  passageTitle: 'Wegener',
  passage: tpl.passage,
  questionGroups: [
    tpl.questionGroups[0],
    {
      range: 'Questions 31–36',
      type: 'gap-fill' as const,
      instruction: 'Complete the summary using the list of phrases, A–J, below.',
      note: 'short',
      // no wordBank
      questions: [31, 32, 33, 34, 35, 36].map(n => ({
        number: n,
        type: 'gap-fill' as const,
        prompt: `Gap (${n})`,
        answer: 'a',
      })),
    },
    tpl.questionGroups[2],
  ],
}

let part = normalizeAiReadingPart(raw as never)
part = applyReadingTemplateTableStructure(part, tpl)
const g = part.questionGroups[1]
console.log('after type', g.type)
console.log('after bank', g.wordBank?.length, g.wordBank?.map(w => `${w.id}:${w.label}`).join(' | '))
console.log('note has 31', /31_{2,}/.test(g.note || ''))

if (g.type !== 'summary-completion') {
  console.error('FAIL type', g.type)
  process.exit(1)
}
if ((g.wordBank?.length ?? 0) < 10) {
  console.error('FAIL wordBank missing', g.wordBank)
  process.exit(1)
}
const labels = (g.wordBank ?? []).map(w => w.label.toLowerCase())
if (!labels.some(l => l.includes('modest fame'))) {
  console.error('FAIL modest fame missing')
  process.exit(1)
}
if (!labels.some(l => l.includes('biographer'))) {
  console.error('FAIL biographer missing')
  process.exit(1)
}

// AI trả bank dở (3 options) → vẫn đủ 10 từ SAMPLE
const rawPartial = {
  ...raw,
  questionGroups: [
    tpl.questionGroups[0],
    {
      range: 'Questions 31-36',
      type: 'summary-completion' as const,
      instruction: 'Complete the summary using the list of phrases, A-J, below.',
      note: tpl.questionGroups[1].note,
      wordBank: [
        { id: 'a', label: 'modest fame' },
        { id: 'b', label: 'vast range' },
        { id: 'c', label: 'only three' },
      ],
      questions: [31, 32, 33, 34, 35, 36].map(n => ({
        number: n,
        type: 'summary-completion' as const,
        prompt: `Gap (${n})`,
        answer: 'a',
      })),
    },
    tpl.questionGroups[2],
  ],
}
let part2 = normalizeAiReadingPart(rawPartial as never)
part2 = applyReadingTemplateTableStructure(part2, tpl)
const g2 = part2.questionGroups[1]
if ((g2.wordBank?.length ?? 0) < 10) {
  console.error('FAIL partial bank not expanded', g2.wordBank?.length)
  process.exit(1)
}
if (!g2.wordBank?.some(w => /narrow investigation/i.test(w.label))) {
  console.error('FAIL J missing after partial merge')
  process.exit(1)
}
console.log('PASS (incl. partial bank → SAMPLE A–J)')

// AI tách MC → 4 groups (số nhóm ≠ SAMPLE) — trước đây hybrid early-return → mất bank
const raw4 = {
  partNumber: 3,
  rangeLabel: 'q',
  passageTitle: 'Wegener',
  passage: tpl.passage,
  questionGroups: [
    tpl.questionGroups[0],
    {
      range: 'Questions 31-36',
      type: 'gap-fill' as const,
      instruction: 'Complete the summary using the list of phrases, A-J, below.',
      note: 'from a 31________ is that',
      questions: [31, 32, 33, 34, 35, 36].map(n => ({
        number: n,
        type: 'gap-fill' as const,
        prompt: `Gap (${n})`,
        answer: 'a',
      })),
    },
    {
      range: 'Questions 37-38',
      type: 'multiple-choice' as const,
      instruction: 'MC',
      questions: [37, 38].map(n => ({
        number: n,
        type: 'multiple-choice' as const,
        prompt: 'q',
        options: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }, { id: 'c', label: 'c' }, { id: 'd', label: 'd' }],
        answer: 'a',
      })),
    },
    {
      range: 'Questions 39-40',
      type: 'multiple-choice' as const,
      instruction: 'MC',
      questions: [39, 40].map(n => ({
        number: n,
        type: 'multiple-choice' as const,
        prompt: 'q',
        options: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }, { id: 'c', label: 'c' }, { id: 'd', label: 'd' }],
        answer: 'a',
      })),
    },
  ],
}
let part4 = normalizeAiReadingPart(raw4 as never)
part4 = applyReadingTemplateTableStructure(part4, tpl)
const g4 = part4.questionGroups.find(x => x.questions.some(q => q.number === 31))
if (!g4 || g4.type !== 'summary-completion' || (g4.wordBank?.length ?? 0) < 10) {
  console.error('FAIL 4-group mismatch bank', g4?.type, g4?.wordBank?.length)
  process.exit(1)
}
if (!g4.wordBank?.some(w => /modest fame/i.test(w.label))) {
  console.error('FAIL 4-group missing modest fame')
  process.exit(1)
}
console.log('PASS 4-group mismatch → bank A–J')
