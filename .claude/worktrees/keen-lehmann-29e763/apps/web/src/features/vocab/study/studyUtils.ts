export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function isPhraseCorrect(answer: string, phrase: string): boolean {
  const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ')
  const a = norm(answer)
  const p = norm(phrase)
  if (a === p) return true
  const variants = p.split(/[,;/]/).map(v => v.trim()).filter(Boolean)
  return variants.some(v => v === a)
}

export function phraseMeta(phrase: string) {
  const words = phrase.trim().split(/\s+/).filter(Boolean)
  const letters = phrase.replace(/\s/g, '').length
  return { words: words.length, letters }
}

export function buildBlankDisplay(phrase: string): string {
  return phrase.split(/\s+/).map(w => '＿'.repeat(w.length)).join(' ')
}

export type PillItem = { kind: 'char'; charIndex: number } | { kind: 'gap' }

export function buildPillItems(phrase: string): PillItem[] {
  const items: PillItem[] = []
  let charIndex = 0
  for (const ch of phrase) {
    if (ch === ' ') items.push({ kind: 'gap' })
    else {
      items.push({ kind: 'char', charIndex })
      charIndex++
    }
  }
  return items
}

export function exampleParts(example: string, phrase: string): { before: string; after: string } | null {
  const lower = example.toLowerCase()
  const phraseLower = phrase.toLowerCase()
  const idx = lower.indexOf(phraseLower)
  if (idx === -1) return null
  return {
    before: example.slice(0, idx),
    after: example.slice(idx + phrase.length),
  }
}

export function hintPhrase(phrase: string): string {
  return phrase
    .split(/\s+/)
    .map(w => (w.length ? w[0] + '•'.repeat(Math.max(0, w.length - 1)) : ''))
    .join(' ')
}