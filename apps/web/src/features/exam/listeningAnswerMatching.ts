export function matchesListeningGapAnswer(
  expected: string,
  given: string,
  wordLimit?: number,
): boolean {
  if (!given || !expected) return false
  if (given === expected) return true
  const maxWords = wordLimit ?? 3
  if (given.split(/\s+/).filter(Boolean).length > maxWords) return false
  if (given.length >= 1 && expected.length >= 1) {
    if (given === expected) return true
    if (/^\d+$/.test(given) && /^\d+$/.test(expected)) {
      return Number(given) === Number(expected)
    }
  }
  return false
}
