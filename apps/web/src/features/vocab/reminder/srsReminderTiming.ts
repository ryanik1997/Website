export function millisecondsUntilSrsReminder(
  lastShownAt: number,
  intervalMinutes: number,
  now = Date.now(),
): number {
  const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000
  if (!Number.isFinite(lastShownAt) || lastShownAt <= 0) return intervalMs
  return Math.max(0, lastShownAt + intervalMs - now)
}
