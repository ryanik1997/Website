import { describe, expect, it } from 'vitest'
import { buildParagraph65_25Sets, PARAGRAPH_65_GENRE_IDS } from './paragraph65_25'

describe('paragraph65_25 seed', () => {
  it('has 15 genres × 25 sentences', () => {
    const sets = buildParagraph65_25Sets(1_700_000_000_000)
    expect(sets).toHaveLength(15)
    expect(PARAGRAPH_65_GENRE_IDS).toHaveLength(15)

    for (const set of sets) {
      expect(set.category).toBe('paragraph_65')
      expect(set.sentences).toHaveLength(25)
      expect(set.id).toBe(`tr-p65-${set.genre}`)
      expect(set.cefr).toBe('B1')
    }
  })
})
