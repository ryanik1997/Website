import { describe, expect, it } from 'vitest'
import { promoteHydratedExamForReview } from './examReviewHydration'

describe('promoteHydratedExamForReview', () => {
  it('keeps answer keys when the submitted report switches back to the paper', () => {
    const original = {
      id: 'listening-import-ket-a2-practice-12',
      parts: [{ questions: [{ id: 'q1', answer: '' }] }],
    }
    const hydrated = {
      ...original,
      parts: [{ questions: [{ id: 'q1', answer: 'B' }] }],
    }

    promoteHydratedExamForReview(original, hydrated)

    expect(original.parts[0].questions[0].answer).toBe('B')
  })
})
