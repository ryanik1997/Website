import { describe, expect, it } from 'vitest'
import { nextSrs } from '@ryan/core'

const now = 1_700_000_000_000
const MINUTE = 60_000
const DAY = 86_400_000

function state(overrides = {}) {
  return {
    ease: 2.5,
    interval: 0,
    reps: 0,
    lapses: 0,
    dueAt: now,
    state: 'new' as const,
    ...overrides,
  }
}

describe('vocabulary SRS rating schedule', () => {
  it('puts Again back in learning after one minute', () => {
    const next = nextSrs(state(), 1, now)
    expect(next.dueAt - now).toBe(MINUTE)
    expect(next.state).toBe('learning')
    expect(next.reps).toBe(0)
  })

  it('puts Hard back in learning after ten minutes', () => {
    const next = nextSrs(state(), 2, now)
    expect(next.dueAt - now).toBe(10 * MINUTE)
    expect(next.state).toBe('learning')
  })

  it('uses one day then four days for consecutive Good ratings', () => {
    const first = nextSrs(state(), 3, now)
    const second = nextSrs(first, 3, now)
    expect(first.dueAt - now).toBe(DAY)
    expect(second.dueAt - now).toBe(4 * DAY)
  })

  it('uses four days for Easy on a new card', () => {
    const next = nextSrs(state(), 4, now)
    expect(next.dueAt - now).toBe(4 * DAY)
  })
})
