import { describe, expect, it } from 'vitest'
import { incrementalPullTieBreaker } from '../../../../packages/db/src/cloud/sync'

describe('incrementalPullTieBreaker', () => {
  it('uses the actual SRS primary key instead of the nonexistent srs.id column', () => {
    expect(incrementalPullTieBreaker('srs')).toBe('card_id')
  })

  it('keeps id as the stable tie-breaker for tables that have an id column', () => {
    expect(incrementalPullTieBreaker('decks')).toBe('id')
  })
})
