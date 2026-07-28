function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9'-]/g, '')
}

function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}

function wordsClose(a: string, b: string): boolean {
  if (a === b) return true
  if (!a || !b) return false
  if (Math.abs(a.length - b.length) > 2) return false
  const maxLen = Math.max(a.length, b.length)
  let diff = 0
  const minLen = Math.min(a.length, b.length)
  for (let i = 0; i < minLen; i++) {
    if (a[i] !== b[i]) diff++
  }
  diff += maxLen - minLen
  return diff <= 1
}

export interface TranslationChip {
  text: string
  words: string[]
}

/** Một chip cho mỗi từ trong đáp án EN, giữ nguyên thứ tự (kể cả từ lặp). */
export function parseTranslationChips(en: string): TranslationChip[] {
  return tokenize(en)
    .map(raw => {
      const norm = normalizeWord(raw)
      if (!norm) return null
      return { text: raw, words: [norm] }
    })
    .filter((c): c is TranslationChip => c !== null)
}

/**
 * Mở chip theo thứ tự câu: gõ đúng "Are" → chip Are; tiếp "you" → chip you;
 * từ "you" thứ hai chỉ mở khi đã gõ đủ các từ trước đó trong đáp án.
 */
export function getChipUnlockStates(input: string, chips: TranslationChip[]): boolean[] {
  const inputWords = tokenize(input).map(normalizeWord).filter(Boolean)
  const states = chips.map(() => false)
  let chipIdx = 0

  for (let i = 0; i < inputWords.length && chipIdx < chips.length; i++) {
    if (wordsClose(inputWords[i], chips[chipIdx].words[0])) {
      states[chipIdx] = true
      chipIdx++
    }
  }

  return states
}

export function maskChipLabel(text: string): string {
  const len = Math.max(normalizeWord(text).length, 3)
  return '●'.repeat(Math.min(len, 10))
}