import { describe, expect, it } from 'vitest'
import { parseReadingPart, readingDraftKey } from '../readingPartMode'

describe('Reading passage mode', () => {
  it('starts full mode without a part parameter', () => expect(parseReadingPart(null)).toBe(null))
  it('accepts passage two', () => expect(parseReadingPart('2')).toBe(2))
  it('maps passage two to index one', () => expect((parseReadingPart('2') ?? 1) - 1).toBe(1))
  it('keeps full mode navigation available by default', () => expect(parseReadingPart(null)).toBe(null))
  it('uses a scoped draft key for passage two', () => expect(readingDraftKey('fixture', 2)).toBe('exam-reading-draft:fixture:p2'))
  it('does not suffix the full-test draft key', () => expect(readingDraftKey('fixture', null)).toBe('exam-reading-draft:fixture'))
  it('rejects an out of range passage', () => expect(parseReadingPart('9')).toBe(null))
  it('rejects a non-numeric passage', () => expect(parseReadingPart('abc')).toBe(null))
  it('accepts passage three', () => expect(parseReadingPart('3')).toBe(3))
})
