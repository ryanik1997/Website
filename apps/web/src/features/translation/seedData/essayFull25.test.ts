import { describe, expect, it } from 'vitest'
import { buildEssayFull25Sets, ESSAY_FULL_GENRE_IDS } from './essayFull25'

describe('essayFull25 seed', () => {
  it('has 15 genres × 25 sentences', () => {
    const sets = buildEssayFull25Sets(1_700_000_000_000)
    expect(sets).toHaveLength(15)
    expect(ESSAY_FULL_GENRE_IDS).toHaveLength(15)

    for (const set of sets) {
      expect(set.category).toBe('essay_full')
      expect(set.sentences).toHaveLength(25)
      expect(set.id).toBe(`tr-essay-${set.genre}`)
      expect(set.cefr).toBe('B2')
    }
  })
})
