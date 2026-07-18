import { describe, expect, it } from 'vitest'
import { formatExamResultOption, normalizeImportedAnswer } from './examResultOption'

describe('formatExamResultOption', () => {
  it('falls back to an alphabetic id for malformed imported options', () => {
    expect(formatExamResultOption({ label: 'Imported option' }, 1)).toBe('B. Imported option')
  })

  it('normalizes numeric imported ids without throwing', () => {
    expect(formatExamResultOption({ id: 2, label: 'Second option' }, 1)).toBe('2. Second option')
  })

  it('normalizes missing and numeric imported answers', () => {
    expect(normalizeImportedAnswer(undefined)).toBe('')
    expect(normalizeImportedAnswer(2)).toBe('2')
  })
})
