/** Parse CPE Part 4 key-word transformation (lowercase stem on its own line). */
export function parseCpeTransformationPrompt(prompt: string): {
  sentence1: string
  stem: string
  sentence2: string
} {
  const arrowSplit = prompt.split(/\s*(?:→|->)\s*/)
  if (arrowSplit.length < 2) {
    return { sentence1: prompt, stem: '', sentence2: '' }
  }
  const before = arrowSplit[0].trim()
  const after = arrowSplit.slice(1).join(' → ').trim()
  const lines = before.split(/\n+/).map(l => l.trim()).filter(Boolean)
  if (lines.length >= 2) {
    return {
      sentence1: lines.slice(0, -1).join(' '),
      stem: lines[lines.length - 1],
      sentence2: normalizeTransformGapText(after),
    }
  }
  const stemMatch = before.match(/\b([A-Za-z]+)\s*$/)
  const stem = stemMatch ? stemMatch[1] : ''
  const sentence1 = stem ? before.slice(0, before.length - stem.length).trim() : before
  return { sentence1, stem, sentence2: normalizeTransformGapText(after) }
}

/** Collapse runs of dots/ellipsis into one gap marker. */
export function normalizeTransformGapText(text: string): string {
  return text.replace(/[….]{2,}/g, '…')
}