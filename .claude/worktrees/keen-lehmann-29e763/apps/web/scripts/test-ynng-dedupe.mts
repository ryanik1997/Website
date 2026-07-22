import { sanitizeReadingExam, canonicalizeTriStateOptions } from '../src/features/exam/readingExamSanitize.ts'

const doubled = [
  { id: 'yes', label: 'YES if the statement agrees with the views of the writer' },
  { id: 'no', label: 'NO if the statement contradicts the views of the writer' },
  { id: 'not-given', label: 'NOT GIVEN if it is impossible to say what the writer thinks about this' },
  { id: 'a', label: 'YES' },
  { id: 'b', label: 'NO' },
  { id: 'c', label: 'NOT GIVEN' },
]
const out = canonicalizeTriStateOptions('ynng', doubled)
if (out.length !== 3) throw new Error('len '+out.length)
if (out.map(o => o.label).join('|') !== 'YES|NO|NOT GIVEN') throw new Error(JSON.stringify(out))

const exam = sanitizeReadingExam({
  id: 't', title: 't', durationMinutes: 60, bandHint: '',
  parts: [{
    id: 'p3', partNumber: 3, rangeLabel: 'r', passageTitle: 't', passage: [{ text: 'x' }],
    questionGroups: [{
      id: 'g', range: 'Questions 37–40', type: 'ynng',
      instruction: 'Do the following... YES if... NO if... NOT GIVEN if...',
      questions: [37,38,39,40].map(n => ({
        id: 'q'+n, number: n, type: 'yes-no-not-given',
        prompt: 'Statement '+n+'\nYES if agrees\nNO if contradicts\nNOT GIVEN if impossible',
        options: doubled as never,
        answer: 'yes', explanation: '',
      })),
    }],
  }],
} as never)

const q = exam.parts[0].questionGroups[0].questions[0]
if (q.options.length !== 3) throw new Error('options '+q.options.length)
if (q.options.some(o => /if the/i.test(o.label))) throw new Error('long labels remain')
if (/YES if/i.test(q.prompt)) throw new Error('legend still in prompt: '+q.prompt)
console.log('PASS Q37-40 ynng dedupe', q.options.map(o=>o.label).join(', '), '| prompt:', q.prompt)
