/** Parse answer key 1–40 → Map<number, answer>. */
export function parseListeningAnswerKey(text: string): Map<number, string> {
  const map = new Map<number, string>()
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    const match = line.match(/^(\d{1,2})\s*[\.\):\-–—]?\s*(.*)$/i)
    if (!match) continue
    const num = Number(match[1])
    if (num < 1 || num > 40) continue
    map.set(num, match[2].trim().toLowerCase())
  }
  return map
}

export function answerKeyCoverage(map: Map<number, string>): number {
  return map.size
}