import { describe, expect, it } from 'vitest'
import { matchesListeningGapAnswer } from './listeningAnswerMatching'

describe('KET gap-fill answer matching', () => {
  it('does not accept a single digit merely contained in the correct time or price', () => {
    expect(matchesListeningGapAnswer('8.15', '1', 1)).toBe(false)
    expect(matchesListeningGapAnswer('10.50', '1', 1)).toBe(false)
  })

  it('does not accept a short text fragment contained in the answer', () => {
    expect(matchesListeningGapAnswer('radio', 'a', 1)).toBe(false)
  })

  it('still accepts exact numeric answers and equivalent leading zeroes', () => {
    expect(matchesListeningGapAnswer('8.15', '8.15', 1)).toBe(true)
    expect(matchesListeningGapAnswer('8', '08', 1)).toBe(true)
  })
})
