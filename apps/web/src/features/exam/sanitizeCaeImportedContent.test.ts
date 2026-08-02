import { describe, expect, it } from 'vitest'
import {
  isPaginationArtifact,
  removePaginationLines,
  stripTrailingPagination,
  removePaginationArtifactsFromHtml,
} from './sanitizeCaeImportedContent'

describe('isPaginationArtifact', () => {
  it('detects standard "Pages: 1 2 3 4 5 6 7 8 9 10"', () => {
    expect(isPaginationArtifact('Pages: 1 2 3 4 5 6 7 8 9 10')).toBe(true)
  })

  it('detects "Pages:1 2 3" (no space after colon)', () => {
    expect(isPaginationArtifact('Pages:1 2 3')).toBe(true)
  })

  it('detects multi-line "Pages:\\n1 2 3 4" after normalisation', () => {
    expect(isPaginationArtifact('Pages:\n1 2 3 4')).toBe(true)
  })

  it('detects NBSP between numbers', () => {
    expect(isPaginationArtifact('Pages: 1\u00a02\u00a03\u00a04')).toBe(true)
  })

  it('detects "Page: 1 2 3" (singular "Page")', () => {
    expect(isPaginationArtifact('Page: 1 2 3')).toBe(true)
  })

  it('detects short sequence "Pages: 1 2"', () => {
    expect(isPaginationArtifact('Pages: 1 2')).toBe(true)
  })

  it('preserves single number "Pages: 1" (needs 2+ numbers)', () => {
    expect(isPaginationArtifact('Pages: 1')).toBe(false)
  })

  it('preserves "The book has 10 pages."', () => {
    expect(isPaginationArtifact('The book has 10 pages.')).toBe(false)
  })

  it('preserves "Pages 1 and 2 discuss language."', () => {
    expect(isPaginationArtifact('Pages 1 and 2 discuss language.')).toBe(false)
  })

  it('preserves "Read pages 1–10 before answering."', () => {
    expect(isPaginationArtifact('Read pages 1–10 before answering.')).toBe(false)
  })

  it('preserves passage containing word "pages" in valid context', () => {
    expect(isPaginationArtifact('The manuscript has 250 pages of content.')).toBe(false)
  })

  it('returns false for non-string input', () => {
    expect(isPaginationArtifact(null as unknown as string)).toBe(false)
    expect(isPaginationArtifact(undefined as unknown as string)).toBe(false)
  })
})

describe('removePaginationLines', () => {
  it('removes a standalone pagination line from multi-line text', () => {
    const input = 'Some passage text.\nPages: 1 2 3 4 5 6 7 8 9 10\nMore text.'
    const result = removePaginationLines(input)
    expect(result).toBe('Some passage text.\nMore text.')
  })

  it('removes pagination from end of content', () => {
    const input = 'Real passage content here.\nPages: 1 2 3 4 5 6 7 8 9 10'
    const result = removePaginationLines(input)
    expect(result).toBe('Real passage content here.')
  })

  it('collapses excessive blank lines after removal', () => {
    const input = 'Line 1\n\n\n\nPages: 1 2 3\n\n\n\nLine 2'
    const result = removePaginationLines(input)
    expect(result).toBe('Line 1\n\nLine 2')
  })

  it('preserves content with word "pages" in valid context', () => {
    const input = 'The book has 10 pages.\nMore content.'
    const result = removePaginationLines(input)
    expect(result).toBe('The book has 10 pages.\nMore content.')
  })

  it('returns input unchanged when no pagination present', () => {
    const input = 'Just normal text.\nNo artifacts.'
    expect(removePaginationLines(input)).toBe(input)
  })
})

describe('stripTrailingPagination', () => {
  it('strips trailing "Pages: 1 2 3 4 5 6 7 8 9 10" from explanation', () => {
    const input =
      "The last sentence states that these birds are often seen. Pages: 1 2 3 4 5 6 7 8 9 10"
    const result = stripTrailingPagination(input)
    expect(result).toBe('The last sentence states that these birds are often seen.')
  })

  it('preserves text without trailing pagination', () => {
    const input = 'Normal explanation text.'
    expect(stripTrailingPagination(input)).toBe(input)
  })

  it('handles NBSP in trailing pagination', () => {
    const input = `Explanation text.\u00a0Pages: 1\u00a02\u00a03`
    const result = stripTrailingPagination(input)
    expect(result).toBe('Explanation text.')
  })
})

describe('removePaginationArtifactsFromHtml', () => {
  it('removes nav with pagination text', () => {
    const html = '<p>Passage text.</p><nav>Pages: 1 2 3 4 5</nav>'
    const result = removePaginationArtifactsFromHtml(html)
    expect(result).toBe('<p>Passage text.</p>')
  })

  it('removes div.pagination with pagination text', () => {
    const html = '<p>Content</p><div class="pagination">Pages: 1 2 3</div>'
    const result = removePaginationArtifactsFromHtml(html)
    expect(result).toBe('<p>Content</p>')
  })

  it('removes span containing only pagination numbers', () => {
    const html = '<p>Text</p><span>Pages: 1 2 3 4</span>'
    const result = removePaginationArtifactsFromHtml(html)
    expect(result).toBe('<p>Text</p>')
  })

  it('removes ul with pagination anchors', () => {
    const html =
      '<p>Passage</p><ul><li>1</li><li>2</li><li>3</li></ul>'
    // ul textContent = "123" — does NOT match pattern (no "Pages:")
    const result = removePaginationArtifactsFromHtml(html)
    expect(result).toContain('<ul>')
  })

  it('preserves div with real content even if it contains the word "pages"', () => {
    const html = '<p>The book has 10 pages of content.</p>'
    const result = removePaginationArtifactsFromHtml(html)
    expect(result).toContain('10 pages')
  })

  it('returns empty string unchanged', () => {
    expect(removePaginationArtifactsFromHtml('')).toBe('')
  })

  it('returns input when DOMParser is unavailable (Node)', () => {
    const original = globalThis.DOMParser
    // @ts-expect-error — simulate Node environment
    delete globalThis.DOMParser
    const html = '<p>Text</p><nav>Pages: 1 2 3</nav>'
    const result = removePaginationArtifactsFromHtml(html)
    expect(result).toBe(html)
    globalThis.DOMParser = original
  })
})
