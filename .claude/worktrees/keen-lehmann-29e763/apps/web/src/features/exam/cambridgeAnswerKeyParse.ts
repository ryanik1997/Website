/**
 * Parse Answer Key Cambridge (Listening / Reading) — text từ PDF hoặc answer-key.txt.
 * Format dòng: `1 A`, `12 TRUE`, `6 August`, `17 A/E`
 */

/** Tách trước block Audioscript (Listening) để không nuốt dialogue thành đáp án. */
export function stripAudioscriptSection(text: string): string {
  const cut = text.search(/\b(audioscripts?|audio\s*scripts?|tapescripts?|transcripts?)\b/i)
  return cut > 0 ? text.slice(0, cut) : text
}

/**
 * Parse đáp án số câu → chuỗi answer (giữ nguyên hoa/thường có nghĩa, trim).
 * maxNum: Listening 40, Reading Cambridge có thể tới ~60.
 */
export function parseCambridgeAnswerKey(
  text: string,
  options?: { maxNum?: number; maxAnswerLen?: number },
): Map<number, string> {
  const maxNum = options?.maxNum ?? 60
  const maxAnswerLen = options?.maxAnswerLen ?? 64
  const map = new Map<number, string>()
  const keyText = stripAudioscriptSection(text)

  for (const rawLine of keyText.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    if (/^---\s*PAGE\s+\d+/i.test(line)) continue
    if (/^(?:part|section|test|paper)\s*\d+/i.test(line)) continue
    if (/^answer\s*keys?/i.test(line)) continue

    const match = line.match(/^(\d{1,2})\s*[\.\):\-–—]?\s+(.+)$/i)
    if (!match) continue
    const num = Number(match[1])
    if (num < 1 || num > maxNum) continue
    let ans = match[2].trim()
    // Bỏ ngoặc key kiểu (RED) TEA → RED TEA / giữ slash kép
    ans = ans.replace(/^\(+|\)+$/g, '').replace(/\(([^)]+)\)/g, '$1').trim()
    if (!ans || ans.length > maxAnswerLen) continue
    // Bỏ chú thích dài sau //
    if (ans.includes('//')) ans = ans.split('//')[0]!.trim()
    map.set(num, ans)
  }
  return map
}

/** Listening: chuẩn hoá lower-case (giữ tương thích parseListeningAnswerKey). */
export function parseListeningAnswerKeyFromText(text: string): Map<number, string> {
  const raw = parseCambridgeAnswerKey(text, { maxNum: 40, maxAnswerLen: 48 })
  const map = new Map<number, string>()
  for (const [n, a] of raw) map.set(n, a.toLowerCase())
  return map
}
