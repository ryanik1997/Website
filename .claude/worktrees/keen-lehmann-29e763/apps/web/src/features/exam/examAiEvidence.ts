import {
  newHighlightId,
  type ReadingHighlight,
} from './readingHighlightUtils'

export interface ExamAiEvidence {
  questionNumber: number
  /** Cụm từ / câu trích nguyên văn từ passage hoặc đề */
  quotes: string[]
}

export interface HighlightTextBlock {
  blockId: string
  text: string
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Bóc quote trong markdown AI: **Đoạn trong đề:** "..." / **Bằng chứng:** ... */
export function parseEvidencesFromAiMarkdown(aiText: string): ExamAiEvidence[] {
  if (!aiText?.trim()) return []
  const byNum = new Map<number, string[]>()

  const sections = aiText.split(/(?=^##\s*Câu\s*\d+)/im)
  for (const section of sections) {
    const head = section.match(/^##\s*Câu\s*(\d+)\b/i)
    if (!head) continue
    const num = Number(head[1])
    if (!num) continue
    const quotes: string[] = []
    const lineRe =
      /^[-*]\s*\*\*(?:Đoạn trong đề|Doan trong de|Bằng chứng|Bang chung|Evidence|Quote|Passage|Clue)\*\*\s*[:：]?\s*(.+)$/gim
    let m: RegExpExecArray | null
    while ((m = lineRe.exec(section)) !== null) {
      const raw = m[1].trim()
      const unquoted = raw
        .replace(/^["“«]\s*/, '')
        .replace(/\s*["”»]\s*$/, '')
        .replace(/^['']\s*/, '')
        .replace(/\s*['']\s*$/, '')
        .trim()
      if (unquoted.length >= 4) quotes.push(unquoted)
    }
    // Inline: Đoạn trong đề: "..."
    const inlineRe =
      /\*\*(?:Đoạn trong đề|Bằng chứng|Evidence)\*\*\s*[:：]?\s*["“]([^"”]{4,})["”]/gi
    while ((m = inlineRe.exec(section)) !== null) {
      const q = m[1].trim()
      if (q.length >= 4) quotes.push(q)
    }
    if (quotes.length) {
      const prev = byNum.get(num) ?? []
      byNum.set(num, [...prev, ...quotes])
    }
  }

  return [...byNum.entries()]
    .map(([questionNumber, quotes]) => ({
      questionNumber,
      quotes: dedupeQuotes(quotes),
    }))
    .sort((a, b) => a.questionNumber - b.questionNumber)
}

function dedupeQuotes(quotes: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const q of quotes) {
    const key = q.replace(/\s+/g, ' ').trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(q.replace(/\s+/g, ' ').trim())
  }
  return out
}

export function mergeEvidences(
  a: ExamAiEvidence[],
  b: ExamAiEvidence[],
): ExamAiEvidence[] {
  const map = new Map<number, string[]>()
  for (const list of [a, b]) {
    for (const e of list) {
      const prev = map.get(e.questionNumber) ?? []
      map.set(e.questionNumber, dedupeQuotes([...prev, ...e.quotes]))
    }
  }
  return [...map.entries()]
    .map(([questionNumber, quotes]) => ({ questionNumber, quotes }))
    .sort((x, y) => x.questionNumber - y.questionNumber)
}

/** Tìm vị trí quote trong text (exact → case-insensitive → whitespace-flexible). */
export function findQuoteRange(
  text: string,
  quote: string,
): { start: number; end: number } | null {
  if (!text || !quote?.trim()) return null
  const q = quote.replace(/\s+/g, ' ').trim()
  if (q.length < 3) return null

  let idx = text.indexOf(q)
  if (idx >= 0) return { start: idx, end: idx + q.length }

  const lowerText = text.toLowerCase()
  const lowerQ = q.toLowerCase()
  idx = lowerText.indexOf(lowerQ)
  if (idx >= 0) return { start: idx, end: idx + q.length }

  // Cắt quote dài: thử nửa đầu / nửa sau nếu > 80 ký tự
  if (q.length > 80) {
    const half = q.slice(0, Math.min(100, Math.floor(q.length * 0.55)))
    const r = findQuoteRange(text, half)
    if (r) return r
  }

  const words = q.split(/\s+/).filter(w => w.length > 0)
  if (words.length < 2) return null
  // Tối đa ~12 từ để regex không quá nặng
  const useWords = words.length > 14 ? words.slice(0, 14) : words
  try {
    const re = new RegExp(useWords.map(escapeRegExp).join('\\s+'), 'i')
    const m = text.match(re)
    if (m && m.index != null) {
      return { start: m.index, end: m.index + m[0].length }
    }
  } catch {
    /* ignore bad regex */
  }
  return null
}

/**
 * Map quotes → ReadingHighlight kind=evidence trên các block passage/đề.
 * Ưu tiên block match đầu tiên cho mỗi quote.
 */
export function buildEvidenceHighlights(
  blocks: HighlightTextBlock[],
  quotes: string[],
): ReadingHighlight[] {
  if (!blocks.length || !quotes.length) return []
  const out: ReadingHighlight[] = []
  const used = new Set<string>()

  for (const quote of quotes) {
    for (const block of blocks) {
      if (!block.text?.trim()) continue
      const range = findQuoteRange(block.text, quote)
      if (!range) continue
      const key = `${block.blockId}:${range.start}:${range.end}`
      if (used.has(key)) break
      used.add(key)
      out.push({
        id: newHighlightId(),
        blockId: block.blockId,
        start: range.start,
        end: range.end,
        kind: 'evidence',
      })
      break
    }
  }
  return out
}

export function evidencesForQuestion(
  evidences: ExamAiEvidence[],
  questionNumber: number | null | undefined,
): string[] {
  if (questionNumber == null) return []
  return evidences.find(e => e.questionNumber === questionNumber)?.quotes ?? []
}

/** Scroll tới mark bằng chứng AI đầu tiên trong root. */
export function scrollToAiEvidence(root: HTMLElement | null | undefined): void {
  if (!root) return
  window.requestAnimationFrame(() => {
    const el = root.querySelector<HTMLElement>('[data-ai-evidence="1"]')
    el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  })
}
