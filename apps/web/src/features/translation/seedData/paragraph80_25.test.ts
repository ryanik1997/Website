import { describe, expect, it } from 'vitest'
import { buildParagraph80_25Sets, PARAGRAPH_80_GENRE_IDS } from './paragraph80_25'

describe('paragraph80_25 seed', () => {
  it('has 10 genres × 25 sentences', () => {
    const sets = buildParagraph80_25Sets(1_700_000_000_000)
    expect(sets).toHaveLength(10)
    expect(PARAGRAPH_80_GENRE_IDS).toHaveLength(10)

    for (const set of sets) {
      expect(set.category).toBe('paragraph_80')
      expect(set.sentences).toHaveLength(25)
      expect(set.id).toBe(`tr-p80-${set.genre}`)
      expect(set.cefr).toBe('B2')
    }
  })
})
