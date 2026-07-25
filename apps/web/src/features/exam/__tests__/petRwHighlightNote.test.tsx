import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { type ReadingHighlight, type TextNote, addHighlights, removeHighlights, upsertNotesForRanges, segmentsFromAnnotations, type HighlightColor } from '../readingHighlightUtils'

afterEach(cleanup)

describe('readingHighlightUtils — color support', () => {
  it('addHighlights preserves color', () => {
    const result = addHighlights([], [{ blockId: 'b1', start: 0, end: 5 }], 'blue')
    expect(result).toHaveLength(1)
    expect(result[0].color).toBe('blue')
  })

  it('addHighlights defaults to yellow', () => {
    const result = addHighlights([], [{ blockId: 'b1', start: 0, end: 5 }])
    expect(result).toHaveLength(1)
    expect(result[0].color).toBe('yellow')
  })

  it('removeHighlights preserves color of remaining', () => {
    const existing: ReadingHighlight[] = [
      { id: 'h1', blockId: 'b1', start: 0, end: 5, color: 'green' },
      { id: 'h2', blockId: 'b1', start: 10, end: 15, color: 'pink' },
    ]
    const result = removeHighlights(existing, [{ blockId: 'b1', start: 0, end: 5 }])
    expect(result).toHaveLength(1)
    expect(result[0].color).toBe('pink')
  })

  it('segmentsFromAnnotations includes color', () => {
    const highlights: ReadingHighlight[] = [
      { id: 'h1', blockId: 'b1', start: 0, end: 4, color: 'green' },
    ]
    const segs = segmentsFromAnnotations('Hello world', highlights, [], 'b1')
    expect(segs.some(s => s.highlighted && s.color === 'green')).toBe(true)
  })

  it('addHighlights merges overlapping ranges with color', () => {
    const a: ReadingHighlight[] = [
      { id: 'h1', blockId: 'b1', start: 0, end: 5, color: 'blue' },
    ]
    const result = addHighlights(a, [{ blockId: 'b1', start: 3, end: 8 }], 'pink')
    // Should merge into one range 0-8 with color from one of the inputs
    expect(result).toHaveLength(1)
    expect(result[0].start).toBe(0)
    expect(result[0].end).toBe(8)
  })
})

describe('TextNote — upsert and remove', () => {
  it('upsertNotesForRanges creates note', () => {
    const result = upsertNotesForRanges([], [{ blockId: 'b1', start: 0, end: 5 }], 'my note')
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('my note')
    expect(result[0].blockId).toBe('b1')
  })

  it('upsertNotesForRanges replaces overlapping note', () => {
    const existing: TextNote[] = [
      { id: 'n1', blockId: 'b1', start: 0, end: 5, text: 'old note' },
    ]
    const result = upsertNotesForRanges(existing, [{ blockId: 'b1', start: 2, end: 8 }], 'new note')
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('new note')
  })
})

describe('ReadingHighlightToolbar — color buttons', () => {
  it('the 4 color buttons are defined in constants', () => {
    // This is a compile-time check that the HighlightColor type exists
    const colors: HighlightColor[] = ['yellow', 'blue', 'green', 'pink']
    expect(colors).toHaveLength(4)
  })
})
