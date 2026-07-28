export const SYNC_PAGE_SIZE = 500
export const SYNC_CURSOR_OVERLAP_MS = 2 * 60 * 1000

export type SyncWindow = {
  cursorIso: string | null
  pullAfterIso: string | null
  cursorMs: number
  upperBoundIso: string
}

export function createSyncWindow(cursorIso: string | null, upperBoundIso: string): SyncWindow {
  const cursorMs = cursorIso ? new Date(cursorIso).getTime() : 0
  const upperMs = new Date(upperBoundIso).getTime()
  if (!Number.isFinite(upperMs) || upperMs <= 0) throw new Error('invalid sync upper bound')
  return {
    cursorIso: Number.isFinite(cursorMs) && cursorMs > 0 ? cursorIso : null,
    pullAfterIso: Number.isFinite(cursorMs) && cursorMs > 0
      ? new Date(Math.max(0, cursorMs - SYNC_CURSOR_OVERLAP_MS)).toISOString()
      : null,
    cursorMs: Number.isFinite(cursorMs) && cursorMs > 0 ? cursorMs : 0,
    upperBoundIso: new Date(upperMs).toISOString(),
  }
}

/** First sync sends the whole local snapshot; later syncs send only local edits. */
export function changedSince(window: SyncWindow, localTimestampMs: number): boolean {
  return window.cursorIso == null || localTimestampMs > window.cursorMs
}
