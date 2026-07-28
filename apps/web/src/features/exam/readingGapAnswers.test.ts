import { describe, expect, it } from 'vitest'
import { isReadingAnswerCorrect, type ReadingQuestion } from './examData'
import { matchesReadingGapAnswer } from './readingAnswerMatching'

describe('Reading gap-fill answer matching', () => {
  it('does not accept a digit or text fragment merely contained in the answer', () => {
    expect(matchesReadingGapAnswer('815', '1')).toBe(false)
    expect(matchesReadingGapAnswer('radio', 'a')).toBe(false)
  })

  it('accepts the normalized exact answer', () => {
    expect(matchesReadingGapAnswer('815', '815')).toBe(true)
    expect(matchesReadingGapAnswer('ticket office', 'ticket office')).toBe(true)
  })

  it('accepts every slash-separated source answer alternative through the public grader', () => {
    const question = (answer: string): ReadingQuestion => ({
      id: 'fce-part2-alternative-answer',
      number: 11,
      type: 'gap-fill',
      prompt: 'Gap (11)',
      options: [],
      answer,
      explanation: '',
    })

    expect(isReadingAnswerCorrect(question('speak/think'), 'speak')).toBe(true)
    expect(isReadingAnswerCorrect(question('speak/think'), 'think')).toBe(true)
    expect(isReadingAnswerCorrect(question('although/while'), 'although')).toBe(true)
    expect(isReadingAnswerCorrect(question('although/while'), 'while')).toBe(true)
    expect(isReadingAnswerCorrect(question('speak/think'), 'talk')).toBe(false)
  })
})
