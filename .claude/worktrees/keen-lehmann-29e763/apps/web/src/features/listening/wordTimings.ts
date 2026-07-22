import { splitWords } from './practiceUtils'

export type WordTiming = {
  word: string
  index: number
  /** giây từ đầu câu */
  start: number
  end: number
}

/**
 * Ước lượng time-align theo độ dài từ (không cần Whisper word timestamps).
 * Đủ cho jump-to-word khi có duration audio/TTS.
 */
export function estimateWordTimings(text: string, durationSec: number): WordTiming[] {
  const words = splitWords(text)
  if (!words.length || durationSec <= 0) return []

  const weights = words.map(w => Math.max(1, w.replace(/[^a-zA-Z0-9']/g, '').length || 1))
  const totalW = weights.reduce((a, b) => a + b, 0)
  // chừa ~4% silence đầu/cuối
  const usable = durationSec * 0.92
  const pad = durationSec * 0.04
  let t = pad
  return words.map((word, index) => {
    const span = (weights[index] / totalW) * usable
    const start = t
    const end = t + span
    t = end
    return { word, index, start, end }
  })
}

export function wordIndexAtTime(timings: WordTiming[], timeSec: number): number {
  if (!timings.length) return -1
  for (let i = 0; i < timings.length; i++) {
    if (timeSec < timings[i].end) return i
  }
  return timings.length - 1
}

/** Chia câu thành 2–3 chunk theo dấu câu / độ dài (gợi ý nghe chunk). */
export function splitIntoListenChunks(text: string): string[] {
  const raw = text.trim()
  if (!raw) return []
  const byPunct = raw.split(/(?<=[,;:—–-])\s+/).map(s => s.trim()).filter(Boolean)
  if (byPunct.length >= 2) return byPunct
  const words = splitWords(raw)
  if (words.length <= 8) return [raw]
  const mid = Math.ceil(words.length / 2)
  if (words.length <= 16) {
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
  }
  const t1 = Math.ceil(words.length / 3)
  const t2 = Math.ceil((2 * words.length) / 3)
  return [
    words.slice(0, t1).join(' '),
    words.slice(t1, t2).join(' '),
    words.slice(t2).join(' '),
  ]
}
