import { describe, expect, it } from 'vitest'
import type { ReadingPart } from '../examData'
import { normalizeCaePart7Bank } from '../caeRw/CaeRwPartContent'

describe('CAE Part 7 normalization', () => {
  it('keeps semantic label/text fields and validates A–G', () => {
    const part = {
      id: 'cae-part-7',
      passage: ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(label => ({
        label,
        text: `Full paragraph ${label}`,
      })),
    } as ReadingPart
    const options = normalizeCaePart7Bank(part)
    expect(options).toHaveLength(7)
    expect(options.map(option => option.label)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
    expect(options.map(option => option.text)).toEqual(
      ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(label => `Full paragraph ${label}`),
    )
  })
})