import { describe, expect, it } from 'vitest'
import { millisecondsUntilSrsReminder } from './srsReminderTiming'

describe('SRS reminder timing', () => {
  it('schedules five minutes from the last dismissal, not from app mount', () => {
    const dismissedAt = 60_000
    expect(millisecondsUntilSrsReminder(dismissedAt, 5, dismissedAt + 4 * 60_000))
      .toBe(60_000)
  })

  it('runs immediately when an overdue background tab becomes active', () => {
    expect(millisecondsUntilSrsReminder(60_000, 5, 7 * 60_000)).toBe(0)
  })

  it('waits one full interval when no reminder has been shown yet', () => {
    expect(millisecondsUntilSrsReminder(0, 5, 123_000)).toBe(300_000)
  })
})
