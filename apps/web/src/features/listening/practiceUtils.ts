export const CLOZE_STOPWORDS = new Set([
  'about', 'above', 'after', 'also', 'been', 'before', 'being', 'between', 'both',
  'could', 'does', 'during', 'each', 'from', 'have', 'here', 'into', 'just', 'like',
  'more', 'most', 'over', 'same', 'some', 'such', 'than', 'that', 'their', 'them',
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'very', 'well',
  'were', 'what', 'when', 'where', 'which', 'while', 'with', 'would', 'your',
  'will', 'shall', 'should', 'might', 'must', 'dont', 'cant', 'wont', 'isnt', 'arent', 'wasnt',
])

export function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9']/g, '')
}

export function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}

export function splitWordParts(word: string): { stripped: string; punct: string } {
  const stripped = word.replace(/[^a-zA-Z0-9']/g, '')
  return { stripped, punct: word.slice(stripped.length) }
}

export function isAnswerCorrect(input: string, correct: string): boolean {
  const uw = splitWords(input).map(normalizeWord).filter(Boolean)
  const cw = splitWords(correct).map(normalizeWord).filter(Boolean)
  if (uw.length !== cw.length) return false
  return uw.every((w, i) => w === cw[i])
}

export function isClozeWord(word: string): boolean {
  const clean = word.replace(/[^a-zA-Z0-9']/g, '').toLowerCase()
  if (clean.length <= 3) return false
  return !CLOZE_STOPWORDS.has(clean)
}

export function getClozeEligibleCount(words: string[]): number {
  return words.filter(isClozeWord).length
}

export function getClozeBlankIndices(words: string[], clozeCount: number): Set<number> {
  const eligible = words.map((w, i) => (isClozeWord(w) ? i : -1)).filter(i => i >= 0)
  if (!clozeCount || clozeCount >= eligible.length) return new Set(eligible)
  return new Set(eligible.slice(0, clozeCount))
}

export function collectBlankAnswer(
  words: string[],
  values: string[],
  mode: 'boxes' | 'cloze',
  clozeBlankSet: Set<number>,
): string {
  if (mode === 'boxes') {
    return values.map(v => v.trim()).join(' ')
  }

  let inputIdx = 0
  return words
    .map((word, i) => {
      if (!clozeBlankSet.has(i)) return word
      const val = values[inputIdx] ? values[inputIdx++].trim() : ''
      const { punct } = splitWordParts(word)
      return val + punct
    })
    .join(' ')
}

export interface WordDiffItem {
  word: string
  punct: string
  status: 'correct' | 'wrong' | 'masked'
  typed?: string
}

export function buildWordDiff(input: string, correct: string): WordDiffItem[] {
  const uw = splitWords(input || '')
  const cw = splitWords(correct)
  return cw.map((c, i) => {
    const u = uw[i]
    const { stripped, punct } = splitWordParts(c)
    if (u === undefined) {
      return { word: c, punct, status: 'masked' as const }
    }
    if (normalizeWord(c) === normalizeWord(u)) {
      return { word: c, punct, status: 'correct' as const, typed: u }
    }
    return { word: c, punct, status: 'wrong' as const, typed: u }
  })
}

export function estimateSpeechDurationSec(text: string, rate: number): number {
  const words = splitWords(text).length
  return Math.max(1.5, (words * 0.42 + text.length * 0.02) / rate)
}

export function formatAudioTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}