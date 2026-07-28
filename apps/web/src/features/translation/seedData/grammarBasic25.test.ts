import { describe, expect, it } from 'vitest'
import { buildGrammarBasic25Sets, GRAMMAR_BASIC_GENRE_IDS } from './grammarBasic25'

describe('grammarBasic25 seed', () => {
  it('has 8 genres × 25 sentences', () => {
    const sets = buildGrammarBasic25Sets(1_700_000_000_000)
    expect(sets).toHaveLength(8)
    expect(GRAMMAR_BASIC_GENRE_IDS).toHaveLength(8)

    for (const set of sets) {
      expect(set.category).toBe('grammar_basic')
      expect(set.sentences).toHaveLength(25)
      expect(set.id).toBe(`tr-grammar-${set.genre}`)
      for (const s of set.sentences) {
        expect(s.vi.length).toBeGreaterThan(3)
        expect(s.en.length).toBeGreaterThan(3)
        expect(s.id.startsWith(set.id)).toBe(true)
      }
    }
  })

  it('covers all grammar_basic catalog genres', () => {
    const expected = [
      'present_simple',
      'present_continuous',
      'present_perfect',
      'present_perfect_continuous',
      'uncountable_nouns',
      'singular_plural',
      'passive_voice',
      'comparison_struct',
    ]
    const sets = buildGrammarBasic25Sets()
    expect(sets.map(s => s.genre).sort()).toEqual([...expected].sort())
  })
})
