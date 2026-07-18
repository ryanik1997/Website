import { describe, expect, it } from 'vitest'
import { extractYoutubeId } from './customShadowing'

describe('extractYoutubeId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?t=12', 'dQw4w9WgXcQ'],
    ['https://youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtube.com/live/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('extracts %s', (url, expected) => {
    expect(extractYoutubeId(url)).toBe(expected)
  })

  it.each([
    'https://example.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com/watch?v=too-short',
    'not a url',
  ])('rejects %s', value => {
    expect(extractYoutubeId(value)).toBeNull()
  })
})
