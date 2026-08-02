/**
 * Sanitizer for CAE C1 imported content.
 *
 * Removes source-website pagination artifacts (e.g. "Pages: 1 2 3 4 5 6 7 8 9 10")
 * that were accidentally included in passage text and answer explanations
 * during crawling/importing.
 *
 * The pattern requires at least two numbers after "Pages:" so that legitimate
 * single-number references like "Pages: 1" are preserved.
 */

const PAGINATION_LINE_PATTERN = /^Pages?\s*:\s*(?:\d+\s*){2,}$/i

/**
 * Returns true when a normalised string is exactly a pagination artifact line,
 * e.g. "Pages: 1 2 3 4 5 6 7 8 9 10".
 *
 * A single number like "Pages: 1" does NOT match (requires 2+ numbers).
 */
export function isPaginationArtifact(value: string): boolean {
  if (typeof value !== 'string') return false
  const normalized = value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return PAGINATION_LINE_PATTERN.test(normalized)
}

/**
 * Removes standalone pagination lines from a multi-line plain-text string.
 * Collapses excessive blank lines left behind.
 */
export function removePaginationLines(value: string): string {
  if (typeof value !== 'string') return value
  return value
    .split(/\r?\n/)
    .filter(line => !isPaginationArtifact(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Strips a trailing pagination artifact from the end of a single-line string.
 *
 * Source crawlers sometimes append "Pages: 1 2 3 ... 10" to the end of an
 * explanation or passage block. This removes only the trailing match, leaving
 * the real content intact.
 */
export function stripTrailingPagination(value: string): string {
  if (typeof value !== 'string') return value
  const normalized = value.replace(/\u00a0/g, ' ')
  const trailing = normalized.match(/\s*Pages?\s*:\s*(?:\d+\s*){2,}$/i)
  if (!trailing) return value
  return value.slice(0, trailing.index).replace(/\s+$/, '').trimEnd()
}

/**
 * Removes pagination artifacts from an HTML string by parsing and checking
 * candidate nodes (nav, .pagination, .pages, .page-links, .pagenav,
 * .navigation, p, div, span, ul) whose textContent matches the pattern.
 *
 * Falls back to the original HTML if DOMParser is unavailable (Node SSR).
 */
export function removePaginationArtifactsFromHtml(html: string): string {
  if (typeof html !== 'string' || html.length === 0) return html
  if (typeof DOMParser === 'undefined') return html

  const parser = new DOMParser()
  const doc = parser.parseFromString(
    `<div id="root">${html}</div>`,
    'text/html',
  )
  const root = doc.querySelector('#root')
  if (!root) return html

  const candidates = root.querySelectorAll(
    [
      'nav',
      '.pagination',
      '.pages',
      '.page-links',
      '.pagenav',
      '.navigation',
      'p',
      'div',
      'span',
      'ul',
    ].join(','),
  )

  for (const node of candidates) {
    const text = node.textContent ?? ''
    if (isPaginationArtifact(text)) {
      node.remove()
    }
  }

  return root.innerHTML.trim()
}
