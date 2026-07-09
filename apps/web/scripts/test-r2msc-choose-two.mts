import { isReadingChooseTwoGroup, normalizeReadingChooseTwoGroup, toggleReadingChooseTwoOption } from '../src/features/exam/readingChooseTwoUtils.ts'
import { sanitizeReadingExam } from '../src/features/exam/readingExamSanitize.ts'

// Simulate AI: only Q23 has options, Q24 empty
const broken = {
  id: 'g',
  range: 'Questions 23–24',
  instruction: 'Choose TWO correct answers, A–E.',
  type: 'multiple-choice' as const,
  questions: [
    {
      id: 'q23',
      number: 23,
      type: 'multiple-choice' as const,
      prompt: 'Which TWO facts about Emma Raducanu\'s withdrawal from the Wimbledon tournament are mentioned in the text?',
      options: [
        { id: 'a', label: 'the stage at which she dropped out' },
        { id: 'b', label: 'symptoms of her performance stress' },
        { id: 'c', label: 'measures she took' },
        { id: 'd', label: 'aspects which increased stress' },
        { id: 'e', label: 'reactions on social media' },
      ],
      answer: 'b',
      explanation: '',
    },
    {
      id: 'q24',
      number: 24,
      type: 'multiple-choice' as const,
      prompt: '',
      options: [],
      answer: 'd',
      explanation: '',
    },
  ],
}

if (isReadingChooseTwoGroup(broken as never) !== true) {
  console.error('FAIL detect broken pair')
  process.exit(1)
}

const norm = normalizeReadingChooseTwoGroup(broken as never)
if ((norm.questions[1].options?.length ?? 0) < 5) {
  console.error('FAIL share options', norm.questions[1].options)
  process.exit(1)
}

const exam = sanitizeReadingExam({
  id: 't',
  title: 't',
  durationMinutes: 60,
  bandHint: '',
  parts: [{
    id: 'p2',
    partNumber: 2,
    rangeLabel: 'r',
    passageTitle: 't',
    passage: [{ text: 'x' }],
    questionGroups: [broken as never],
  }],
})
const g = exam.parts[0].questionGroups[0]
if (!isReadingChooseTwoGroup(g)) {
  console.error('FAIL after sanitize')
  process.exit(1)
}
if ((g.questions[1].options?.length ?? 0) < 5) {
  console.error('FAIL sanitize did not share', g.questions[1].options)
  process.exit(1)
}

const answers: Record<string, string> = {}
toggleReadingChooseTwoOption('b', g.questions, answers, (id, v) => { answers[id] = v }, () => {})
toggleReadingChooseTwoOption('d', g.questions, answers, (id, v) => { answers[id] = v }, () => {})
if (Object.values(answers).filter(Boolean).length !== 2) {
  console.error('FAIL toggle', answers)
  process.exit(1)
}
console.log('PASS r2msc choose-two fix (share options Q2)')
