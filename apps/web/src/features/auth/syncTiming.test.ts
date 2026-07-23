import { describe, expect, it } from 'vitest'
import { loginSyncDelay, periodicSyncDelay, reconnectSyncDelay, retrySyncDelay } from './syncTiming'

describe('sync herd protection', () => {
  it('spreads login, reconnect and periodic sync across bounded windows', () => {
    expect(loginSyncDelay(() => 0.5)).toBe(5_000)
    expect(reconnectSyncDelay(() => 0.5)).toBe(8_000)
    expect(periodicSyncDelay(() => 0.5)).toBe(330_000)
  })

  it('uses bounded full-jitter retries and stops after the retry budget', () => {
    expect(retrySyncDelay(0, () => 0.5)).toBe(1_000)
    expect(retrySyncDelay(3, () => 0.5)).toBe(15_000)
    expect(retrySyncDelay(4, () => 0.5)).toBeNull()
  })
})
