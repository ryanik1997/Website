/**
 * Template KHÔNG có noteTable không được tự gắn noteTable.
 */
import {
  applyReadingTemplateTableStructure,
  normalizeAiReadingPart,
} from '../src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts'
import { getIeltsReadingWizardTemplatePart } from '../src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts'

// r1tb still works
{
  const tpl = getIeltsReadingWizardTemplatePart(1, 'p1-r1-tfng-table')
  const raw = {
    partNumber: 1,
    rangeLabel: 'q',
    passageTitle: 't',
    passage: [{ text: 'p' }],
    questionGroups: [
      {
        range: '1-6',
        type: 'tfng',
        instruction: 'tfng',
        questions: [1, 2, 3, 4, 5, 6].map(n => ({
          number: n,
          type: 'true-false-not-given',
          prompt: 's',
          answer: 'true',
        })),
      },
      {
        range: '7-13',
        type: 'gap-fill',
        instruction: 'Choose ONE WORD ONLY from the passage for each answer.',
        questions: [7, 8, 9, 10, 11, 12, 13].map(n => ({
          number: n,
          type: 'gap-fill',
          prompt: `something ${n} ______`,
          answer: 'x',
        })),
      },
    ],
  }
  let part = normalizeAiReadingPart(raw as never)
  part = applyReadingTemplateTableStructure(part, tpl)
  if (!part.questionGroups[1]?.noteTable?.rows?.length) {
    console.error('FAIL r1tb should still get noteTable')
    process.exit(1)
  }
  console.log('r1tb OK rows', part.questionGroups[1].noteTable!.rows.length)
}

// p1-r1-tfng-gap — sentence/gap, NO table in SAMPLE
{
  const tpl = getIeltsReadingWizardTemplatePart(1, 'p1-r1-tfng-gap')
  const hasTplTable = tpl.questionGroups.some(g => g.noteTable?.headers?.length)
  console.log('tfng-gap template has noteTable?', hasTplTable)

  const raw = {
    partNumber: 1,
    rangeLabel: 'q',
    passageTitle: 't',
    passage: [{ text: 'p' }],
    questionGroups: [
      {
        range: '1-7',
        type: 'tfng',
        instruction: 'tfng',
        questions: [1, 2, 3, 4, 5, 6, 7].map(n => ({
          number: n,
          type: 'true-false-not-given',
          prompt: 's',
          answer: 'true',
        })),
      },
      {
        range: '8-13',
        type: 'gap-fill',
        instruction: 'Complete the sentences. Choose ONE WORD ONLY from the passage for each answer.',
        // AI lỡ dán noteTable (nhiễm)
        noteTable: {
          headers: ['A', 'B'],
          rows: [{ cells: [[{ type: 'static', text: 'x' }], [{ type: 'gap', number: 8 }]] }],
        },
        questions: [8, 9, 10, 11, 12, 13].map(n => ({
          number: n,
          type: 'gap-fill',
          prompt: `The animal was ${n}________ in the forest.`,
          answer: 'x',
        })),
      },
    ],
  }
  let part = normalizeAiReadingPart(raw as never)
  part = applyReadingTemplateTableStructure(part, tpl)
  const g1 = part.questionGroups[1]
  if (g1.noteTable) {
    console.error('FAIL tfng-gap must NOT keep/inject noteTable', g1.noteTable)
    process.exit(1)
  }
  console.log('tfng-gap OK — no noteTable infection')
}

// r1nt still OK
{
  const tpl = getIeltsReadingWizardTemplatePart(1, 'p1-r1-notes-tfng-table')
  const raw = {
    partNumber: 1,
    rangeLabel: 'q',
    passageTitle: 't',
    passage: [{ text: 'p' }],
    questionGroups: [
      {
        range: '1-4',
        type: 'gap-fill',
        instruction: 'Complete the notes. ONE WORD ONLY',
        questions: [1, 2, 3, 4].map(n => ({ number: n, type: 'gap-fill', prompt: `Gap (${n})`, answer: 'x' })),
      },
      {
        range: '5-7',
        type: 'gap-fill',
        instruction: 'TFNG',
        questions: [5, 6, 7].map(n => ({ number: n, type: 'gap-fill', prompt: `S${n}`, answer: 'true' })),
      },
      {
        range: '8-13',
        type: 'gap-fill',
        instruction: 'Complete the table. ONE WORD ONLY',
        questions: [8, 9, 10, 11, 12, 13].map(n => ({ number: n, type: 'gap-fill', prompt: `Gap (${n})`, answer: 'x' })),
      },
    ],
  }
  let part = normalizeAiReadingPart(raw as never)
  part = applyReadingTemplateTableStructure(part, tpl)
  const sig = part.questionGroups.map(g => g.type).join('|')
  if (sig !== 'gap-fill|tfng|gap-fill') {
    console.error('FAIL r1nt sig', sig)
    process.exit(1)
  }
  if (!part.questionGroups[0].notePassage?.length) {
    console.error('FAIL r1nt notes')
    process.exit(1)
  }
  if (part.questionGroups[0].noteTable) {
    console.error('FAIL r1nt notes must not have noteTable')
    process.exit(1)
  }
  if (!part.questionGroups[2].noteTable?.rows?.length) {
    console.error('FAIL r1nt table missing')
    process.exit(1)
  }
  console.log('r1nt OK', sig)
}

// TFNG + gap (sentence) — AI dán noteTable lên TFNG và gap → strip hết
{
  const tpl = getIeltsReadingWizardTemplatePart(1, 'p1-r1-tfng-gap')
  const raw = {
    partNumber: 1,
    rangeLabel: 'q',
    passageTitle: 't',
    passage: [{ text: 'p' }],
    questionGroups: [
      {
        range: '1-7',
        type: 'tfng',
        instruction: 'TRUE FALSE NOT GIVEN',
        noteTable: {
          headers: ['Section', 'Details'],
          rows: [{ cells: [[{ type: 'static', text: 'Aim' }], [{ type: 'gap', number: 1 }]] }],
        },
        questions: [1, 2, 3, 4, 5, 6, 7].map(n => ({
          number: n,
          type: 'true-false-not-given',
          prompt: `S${n}`,
          answer: 'true',
        })),
      },
      {
        range: '8-13',
        type: 'gap-fill',
        instruction: 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.',
        noteTable: {
          headers: ['Section', 'Details'],
          rows: [{ cells: [[{ type: 'static', text: 'Method' }], [{ type: 'gap', number: 8 }]] }],
        },
        questions: [8, 9, 10, 11, 12, 13].map(n => ({
          number: n,
          type: 'gap-fill',
          prompt: `Sentence ${n} ______`,
          answer: 'x',
        })),
      },
    ],
  }
  let part = normalizeAiReadingPart(raw as never)
  part = applyReadingTemplateTableStructure(part, tpl)
  if (part.questionGroups.some(g => g.noteTable)) {
    console.error('FAIL TFNG template still has noteTable', part.questionGroups.map(g => !!g.noteTable))
    process.exit(1)
  }
  console.log('TFNG+sentence OK — no noteTable')
}

// Summary ONE WORD — AI dán noteTable → phải gỡ
{
  const tpl = getIeltsReadingWizardTemplatePart(3, 'p3-r3-match-summary-features')
  const raw = {
    partNumber: 3,
    rangeLabel: 'q',
    passageTitle: 'Space',
    passage: [{ label: 'A', text: 'p' }, { label: 'B', text: 'p' }],
    questionGroups: [
      {
        range: '27-31',
        type: 'matching-paragraph',
        instruction: 'Which section contains…',
        paragraphLetters: ['A', 'B', 'C', 'D', 'E', 'F'],
        questions: [27, 28, 29, 30, 31].map(n => ({
          number: n,
          type: 'matching-paragraph',
          prompt: `Info ${n}`,
          answer: 'a',
        })),
      },
      {
        range: '32-35',
        type: 'gap-fill',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        note: 'Title\n\nThe committee 32________ fuel 33________.',
        noteTable: {
          headers: ['Section', 'Details'],
          rows: [
            { cells: [[{ type: 'static', text: 'Aim' }], [{ type: 'gap', number: 32 }]] },
            { cells: [[{ type: 'static', text: 'Method' }], [{ type: 'gap', number: 33 }]] },
          ],
        },
        questions: [32, 33, 34, 35].map(n => ({
          number: n,
          type: 'gap-fill',
          prompt: `Gap (${n})`,
          answer: 'x',
        })),
      },
      {
        range: '36-40',
        type: 'matching-features',
        instruction: 'Match each statement…',
        features: [
          { id: 'a', name: 'A' },
          { id: 'b', name: 'B' },
        ],
        questions: [36, 37, 38, 39, 40].map(n => ({
          number: n,
          type: 'matching-features',
          prompt: `S${n}`,
          answer: 'a',
        })),
      },
    ],
  }
  let part = normalizeAiReadingPart(raw as never)
  part = applyReadingTemplateTableStructure(part, tpl)
  if (part.questionGroups[1].noteTable) {
    console.error('FAIL summary group still has noteTable', part.questionGroups[1].noteTable)
    process.exit(1)
  }
  if (!part.questionGroups[1].note?.includes('32')) {
    console.error('FAIL summary note lost')
    process.exit(1)
  }
  console.log('summary ONE WORD OK — no noteTable')
}

console.log('ALL PASS')
