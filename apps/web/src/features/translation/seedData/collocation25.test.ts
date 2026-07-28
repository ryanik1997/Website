import { describe, expect, it } from 'vitest'
import { buildCollocation25Sets, COLLOCATION_GENRE_IDS } from './collocation25'

describe('collocation25 seed', () => {
  it('has 15 genres × 25 sentences', () => {
    const sets = buildCollocation25Sets(1_700_000_000_000)
    expect(sets).toHaveLength(15)
    expect(COLLOCATION_GENRE_IDS).toHaveLength(15)

    for (const set of sets) {
      expect(set.category).toBe('collocation')
      expect(set.sentences).toHaveLength(25)
      expect(set.id).toBe(`tr-collocation-${set.genre}`)
      for (const s of set.sentences) {
        expect(s.vi.length).toBeGreaterThan(5)
        expect(s.en.length).toBeGreaterThan(5)
      }
    }
  })
})
