import { describe, expect, it } from 'vitest'
import { changedSince, createSyncWindow } from '../../../../../packages/db/src/cloud/syncCursor'

describe('incremental sync window', () => {
  it('sends the complete local snapshot on first sync', () => {
    const window = createSyncWindow(null, '2026-07-18T12:00:00.000Z')
    expect(changedSince(window, 1)).toBe(true)
  })

  it('sends only edits newer than the previous server cursor', () => {
    const window = createSyncWindow(
      '2026-07-18T11:00:00.000Z',
      '2026-07-18T12:00:00.000Z',
    )
    expect(changedSince(window, Date.parse('2026-07-18T10:59:59.999Z'))).toBe(false)
    expect(changedSince(window, Date.parse('2026-07-18T11:00:00.001Z'))).toBe(true)
    expect(window.pullAfterIso).toBe('2026-07-18T10:58:00.000Z')
  })
})
