import { isClozeWord, normalizeWord, splitWords } from '../listening/practiceUtils'
import type { ShadowingSubtitle } from './types'

export type ShadowingQuizKind = 'cloze' | 'listen_pick' | 'order_words'

export type ShadowingQuizItem = {
  id: string
  kind: ShadowingQuizKind
  segmentIndex: number
  prompt: string
  /** Correct full sentence text */
  answer: string
  /** For cloze: display tokens with blanks marked null */
  tokens?: Array<{ text: string; blank: boolean }>
  options?: string[]
  blankWord?: string
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed || 1
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickClozeWord(text: string): { word: string; index: number } | null {
  const words = splitWords(text)
  const eligible = words
    .map((w, i) => ({ w, i, n: normalizeWord(w) }))
    .filter(x => x.n.length >= 4 && isClozeWord(x.w))
  if (!eligible.length) return null
  // Prefer longer content words near the middle
  eligible.sort((a, b) => b.n.length - a.n.length)
  const pick = eligible[Math.min(1, eligible.length - 1)]
  return { word: pick.w, index: pick.i }
}

function distractorsFromPool(
  correct: string,
  pool: string[],
  count: number,
  seed: number,
): string[] {
  const c = normalizeWord(correct)
  const cands = pool
    .map(p => p.trim())
    .filter(p => p && normalizeWord(p) !== c && p.length > 2)
  return shuffle(cands, seed).slice(0, count)
}

/** Build a quiz deck from subtitles (deterministic per video). */
export function buildQuizFromSubtitles(
  subtitles: ShadowingSubtitle[],
  opts?: { maxItems?: number },
): ShadowingQuizItem[] {
  const maxItems = opts?.maxItems ?? 20
  const items: ShadowingQuizItem[] = []
  const texts = subtitles.map(s => s.text)

  subtitles.forEach((seg, segmentIndex) => {
    if (items.length >= maxItems) return
    const text = seg.text?.trim()
    if (!text || splitWords(text).length < 4) return

    const seed = segmentIndex * 97 + text.length

    // Alternate kinds for variety
    const kindSlot = segmentIndex % 3

    if (kindSlot === 0 || kindSlot === 1) {
      const cloze = pickClozeWord(text)
      if (cloze) {
        const words = splitWords(text)
        const tokens = words.map((w, i) => ({
          text: w,
          blank: i === cloze.index,
        }))
        const blankNorm = normalizeWord(cloze.word)
        const wrong = distractorsFromPool(
          cloze.word,
          texts.flatMap(t => splitWords(t)).filter(w => isClozeWord(w)),
          3,
          seed,
        ).map(w => w.replace(/[^a-zA-Z'-]/g, '') || w)
        const options = shuffle(
          [cloze.word.replace(/[^a-zA-Z'-]/g, '') || blankNorm, ...wrong].filter(Boolean),
          seed + 3,
        )
        // unique options
        const uniq: string[] = []
        for (const o of options) {
          if (!uniq.some(u => normalizeWord(u) === normalizeWord(o))) uniq.push(o)
        }
        while (uniq.length < 4) uniq.push(`opt${uniq.length}`)

        items.push({
          id: `cloze-${seg.id || segmentIndex}`,
          kind: 'cloze',
          segmentIndex,
          prompt: 'Chọn từ đúng để điền vào chỗ trống',
          answer: text,
          tokens,
          blankWord: cloze.word,
          options: uniq.slice(0, 4),
        })
        return
      }
    }

    // listen_pick: which sentence did you hear (options = nearby segments)
    const nearby = [segmentIndex - 2, segmentIndex - 1, segmentIndex + 1, segmentIndex + 2]
      .filter(i => i >= 0 && i < subtitles.length && i !== segmentIndex)
      .map(i => subtitles[i].text)
    const optsList = shuffle(
      [text, ...distractorsFromPool(text, nearby.length ? nearby : texts, 3, seed + 9)],
      seed + 11,
    ).slice(0, 4)

    if (optsList.length >= 2) {
      items.push({
        id: `pick-${seg.id || segmentIndex}`,
        kind: 'listen_pick',
        segmentIndex,
        prompt: 'Nghe / xem gợi ý — chọn câu đúng',
        answer: text,
        options: optsList,
      })
    }
  })

  return items.slice(0, maxItems)
}

export function isQuizAnswerCorrect(item: ShadowingQuizItem, userAnswer: string): boolean {
  if (item.kind === 'cloze') {
    return normalizeWord(userAnswer) === normalizeWord(item.blankWord || '')
  }
  return normalizeWord(userAnswer) === normalizeWord(item.answer)
}
