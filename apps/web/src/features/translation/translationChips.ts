function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9'-]/g, '')
}

function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}

/** Exact match after normalize (case / punctuation-insensitive). */
export function wordsMatchExact(a: string, b: string): boolean {
  if (!a || !b) return false
  return a === b
}

/**
 * Đang gõ dở (prefix): "primar" khi target "primary" → chưa coi là sai.
 * "primery" không phải prefix → sai ngay.
 */
export function isTypingPrefix(typed: string, target: string): boolean {
  if (!typed || !target) return false
  if (typed === target) return false
  return target.startsWith(typed)
}

export interface TranslationChip {
  text: string
  words: string[]
}

export interface ChipMatchStates {
  /** Chip đã gõ đúng (xanh) */
  unlocked: boolean[]
  /** Chip gõ sai (đỏ) */
  wrong: boolean[]
  /** Từ đã gõ tại từng vị trí (raw đã normalize) — để hiện trên chip đỏ */
  typedAt: (string | undefined)[]
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
 * Mỗi từ gõ khớp **vị trí** chip (index 0..n):
 * - đúng exact → xanh
 * - sai → đỏ (luôn; không fuzzy)
 * - token cuối đang là prefix của đáp án → chờ gõ tiếp (chưa xanh/đỏ)
 * Chip chưa gõ tới → locked (●●●)
 */
export function getChipMatchStates(input: string, chips: TranslationChip[]): ChipMatchStates {
  const inputWords = tokenize(input).map(normalizeWord).filter(Boolean)
  const unlocked = chips.map(() => false)
  const wrong = chips.map(() => false)
  const typedAt: (string | undefined)[] = chips.map(() => undefined)

  for (let i = 0; i < inputWords.length && i < chips.length; i++) {
    const typed = inputWords[i]!
    const target = chips[i]!.words[0]!
    const isLastToken = i === inputWords.length - 1
    typedAt[i] = typed

    if (wordsMatchExact(typed, target)) {
      unlocked[i] = true
      continue
    }

    // Đang gõ dở từ cuối ("primar…") — chưa kết luận (chưa xanh/đỏ)
    if (isLastToken && isTypingPrefix(typed, target)) {
      typedAt[i] = undefined
      continue
    }

    // Sai → đỏ luôn (kể cả token cuối đã lệch hẳn như "primery")
    wrong[i] = true
  }

  return { unlocked, wrong, typedAt }
}

/** Unlock only — giữ API cũ */
export function getChipUnlockStates(input: string, chips: TranslationChip[]): boolean[] {
  return getChipMatchStates(input, chips).unlocked
}

export function maskChipLabel(text: string): string {
  const len = Math.max(normalizeWord(text).length, 3)
  return '●'.repeat(Math.min(len, 10))
}
