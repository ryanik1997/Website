import { describe, expect, it } from 'vitest'
import { resolveNotePlacements } from './WritingCambridgeTaskPage'

describe('resolveNotePlacements', () => {
  it('separates duplicate anchors and stays within the stage', () => {
    const items = [0, 1, 2].map(noteIndex => ({ noteIndex, side: 'right' as const, desiredTop: 40, noteHeight: 30, top: 40, lineTargetY: 55 }))
    const result = resolveNotePlacements({ items, stageHeight: 140, edgePadding: 8, minimumGap: 12 })
    expect(result).toHaveLength(3)
    expect(result.every(item => item.top >= 8 && item.top + item.noteHeight <= 132)).toBe(true)
    expect(result[1].top - result[0].top).toBeGreaterThanOrEqual(42)
    expect(result[2].top - result[1].top).toBeGreaterThanOrEqual(42)
  })
})
