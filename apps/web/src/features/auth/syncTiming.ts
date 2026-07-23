export const SYNC_BASE_INTERVAL_MS = 5 * 60 * 1000
export const SYNC_CHANGE_DEBOUNCE_MS = 4_000
const RETRY_BASE_MS = [2_000, 5_000, 15_000, 30_000] as const

const boundedRandom = (random: () => number) => Math.min(0.999999, Math.max(0, random()))

export function loginSyncDelay(random: () => number = Math.random): number {
  return Math.floor(boundedRandom(random) * 10_000)
}

export function reconnectSyncDelay(random: () => number = Math.random): number {
  return 1_000 + Math.floor(boundedRandom(random) * 14_000)
}

export function periodicSyncDelay(random: () => number = Math.random): number {
  return SYNC_BASE_INTERVAL_MS + Math.floor(boundedRandom(random) * 60_000)
}

/** Full jitter prevents clients from retrying the same failed request together. */
export function retrySyncDelay(attempt: number, random: () => number = Math.random): number | null {
  const cap = RETRY_BASE_MS[attempt]
  return cap == null ? null : Math.max(250, Math.floor(boundedRandom(random) * cap))
}
