import { describe, expect, it } from 'vitest'
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
})
