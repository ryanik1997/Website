/**
 * Regression: KET import Test 2 Part 4 không bị ghép passage catalog Test 1.
 * Run: npx vite-node apps/web/scripts/test-ket-part4-no-double-passage.mts
 */
import { fillReadingExamFromSources } from '../src/features/exam/fillReadingExamMedia.ts'
import type { ReadingExam } from '../src/features/exam/examData.ts'
import { READING_EXAMS } from '../src/features/exam/examData.ts'

let failed = 0
function assert(cond: unknown, msg: string) {
  if (!cond) {
    failed += 1
    console.error('FAIL:', msg)
  } else {
    console.log('ok:', msg)
  }
}

const importTest2: ReadingExam = {
  id: 'reading-manual-test2-fake',
  title: 'KET A2 Reading — Book 1 — Test 2',
  durationMinutes: 60,
  bandHint: 'A2 Key',
  examTrack: 'cambridge',
  cambridgeLevel: 'a2',
  parts: [
    {
      id: 'p4',
      partNumber: 4,
      rangeLabel: 'Questions 19–24',
      passageTitle: 'Part 4 — The Nobel Prize',
      passage: [
        {
          text:
            'Almost (19) ........ they become famous. The phone call (20) ........ them. '
            + 'Prizes in (21) ........ . Scientists have (22) ........ one. Several (23) ........ why. '
            + '(24) ........ , the most important thing.',
        },
      ],
      questionGroups: [
        {
          id: 'g',
          range: 'Questions 19–24',
          instruction: 'Choose the correct answer.',
          type: 'multiple-choice',
          questions: [19, 20, 21, 22, 23, 24].map(n => ({
            id: `q${n}`,
            number: n,
            type: 'multiple-choice' as const,
            prompt: `(${n})`,
            options: [
              { id: 'a', label: 'a' },
              { id: 'b', label: 'b' },
              { id: 'c', label: 'c' },
            ],
            answer: 'a',
            explanation: '',
          })),
        },
      ],
    },
  ],
}

const catalog = READING_EXAMS.find(e => e.id === 'catalog-reading-ket-a2-test1')
  ?? READING_EXAMS.find(e => e.cambridgeLevel === 'a2' && e.id.startsWith('catalog-'))
assert(catalog, 'catalog ket exists')

const filled = fillReadingExamFromSources(importTest2, [catalog])
const p4 = filled.parts.find(p => p.partNumber === 4)!
const gapHits = (p4.passage ?? [])
  .map(b => b.text ?? '')
  .join('\n')
  .match(/\(19\)/g)

assert(p4.passage.length === 1, `passage blocks stay 1 (got ${p4.passage.length})`)
assert(gapHits?.length === 1, `only one (19) marker (got ${gapHits?.length})`)
assert(
  !/Oymyakon|coldest place/i.test(p4.passage.map(b => b.text).join(' ')),
  'no catalog Test1 Oymyakon text grafted',
)
assert(
  /become famous|Nobel|Almost/i.test(p4.passage[0]?.text ?? ''),
  'keeps local Nobel / almost text',
)

if (failed) {
  console.error(`\n${failed} failed`)
  process.exit(1)
}
console.log('\nPart4 no-double-passage checks passed.')
