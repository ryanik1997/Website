/**
 * Regression: gap-fill "8/eight" + acceptableAnswers
 * Run: npx vite-node apps/web/scripts/test-listening-gap-answers.mts
 */
import {
  formatListeningAnswer,
  isListeningAnswerCorrect,
  listeningAnswerVariants,
  type ListeningQuestion,
} from '../src/features/exam/listeningExamData.ts'

let failed = 0
function assert(cond: unknown, msg: string) {
  if (!cond) {
    failed += 1
    console.error('FAIL:', msg)
  } else {
    console.log('ok:', msg)
  }
}

const qSlash: ListeningQuestion = {
  id: 'q6',
  number: 6,
  type: 'gap-fill',
  prompt: 'Time guests arrive:',
  options: [],
  answer: '8/eight',
  explanation: '',
  wordLimit: 1,
}

const qAlt: ListeningQuestion = {
  ...qSlash,
  answer: '8',
  acceptableAnswers: ['8', 'eight'],
}

const qOr: ListeningQuestion = {
  ...qSlash,
  answer: '8 OR eight',
  acceptableAnswers: undefined,
}

assert(listeningAnswerVariants('8/eight').includes('8'), 'variants has 8')
assert(listeningAnswerVariants('8/eight').includes('eight'), 'variants has eight')
assert(listeningAnswerVariants('8', ['eight']).includes('eight'), 'acceptableAnswers merged')

assert(isListeningAnswerCorrect(qSlash, '8'), 'slash: user 8')
assert(isListeningAnswerCorrect(qSlash, 'eight'), 'slash: user eight')
assert(isListeningAnswerCorrect(qSlash, 'Eight'), 'slash: user Eight')
assert(isListeningAnswerCorrect(qSlash, ' 8 '), 'slash: padded')
assert(!isListeningAnswerCorrect(qSlash, '9'), 'slash: wrong 9')
assert(!isListeningAnswerCorrect(qSlash, ''), 'empty wrong')

assert(isListeningAnswerCorrect(qAlt, 'eight'), 'acceptableAnswers: eight')
assert(isListeningAnswerCorrect(qOr, '8'), 'OR form: 8')
assert(isListeningAnswerCorrect(qOr, 'eight'), 'OR form: eight')

const shown = formatListeningAnswer(qSlash, qSlash.answer)
assert(shown.includes('8') && shown.includes('eight'), `format shows both: ${shown}`)
assert(!shown.includes('A.'), 'format not MC letters')

if (failed) {
  console.error(`\n${failed} failed`)
  process.exit(1)
}
console.log('\nAll gap-fill answer checks passed.')
