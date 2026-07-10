/**
 * Parse Answer Key / Audioscript (text từ PDF hoặc .txt)
 * → transcript theo số câu để hiện khi xem lại đề Listening.
 *
 * Hỗ trợ format Cambridge KET/PET/…:
 *  - `Question 1 One. How did…` + dialogue
 *  - `1 Woman: …` / `1.` header
 *  - Part liên tục: `Look at questions 6–10` + monologue (gắn cùng script cho cả dải)
 */

/** Tách phần Audioscript / Tapescript / Transcript khỏi Answer Key. */
export function extractAudioscriptSection(fullText: string): string | null {
  const text = fullText.replace(/\r\n/g, '\n')
  const markers = [
    /\baudioscripts?\b/i,
    /\baudio\s*scripts?\b/i,
    /\btapescripts?\b/i,
    /\btranscripts?\b/i,
    /\bscripts?\s*(?:for\s*)?(?:listening|test)?\b/i,
  ]
  let bestIdx = -1
  for (const re of markers) {
    const m = re.exec(text)
    if (m && (bestIdx < 0 || m.index < bestIdx)) bestIdx = m.index
  }
  if (bestIdx < 0) return null
  return text.slice(bestIdx).trim()
}

/** Dài trước ngắn (sixteen trước six) + \\b để tránh "Six" + "teen". */
const ORDINAL_WORD =
  'thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|eleven|twelve|one|two|three|four|five|six|seven|eight|nine|ten|first|second|third|fourth|fifth'

/** Dòng bắt đầu câu Cambridge: Question 1 / Question 1 One. / 1. / 1 Woman: */
function matchQuestionStart(line: string): { n: number; rest: string } | null {
  // Question 1 One. How did…  |  Question 16 Sixteen. You will hear…
  const qWord = line.match(
    new RegExp(
      `^questions?\\s+(\\d{1,2})\\b(?:\\s+(?:${ORDINAL_WORD})\\b)?\\.?\\s*(.*)$`,
      'i',
    ),
  )
  if (qWord) {
    const n = Number(qWord[1])
    if (n >= 1 && n <= 40) return { n, rest: (qWord[2] ?? '').trim() }
  }

  // Header only: "1" / "1." / "Question 1"
  const headerOnly = line.match(/^(?:questions?\s*)?(\d{1,2})\s*[\.\)\:\-–—]?\s*$/i)
  if (headerOnly) {
    const n = Number(headerOnly[1])
    if (n >= 1 && n <= 40) return { n, rest: '' }
  }

  // Inline: "1 Woman: …" or "1. You hear…"
  const inline = line.match(/^(?:questions?\s*)?(\d{1,2})\s*[\.\)\:\-–—]\s+(.+)$/i)
  if (inline) {
    const n = Number(inline[1])
    const rest = inline[2].trim()
    if (n >= 1 && n <= 40 && rest.length >= 8) return { n, rest }
  }

  // "1" + 2+ spaces + dialogue
  const loose = line.match(/^(\d{1,2})\s{2,}(.+)$/)
  if (loose && loose[2].trim().length >= 8) {
    const n = Number(loose[1])
    if (n >= 1 && n <= 40) return { n, rest: loose[2].trim() }
  }

  return null
}

/** "Look at questions 6–10" / "questions 11-15" / "Questions 21 to 25" */
function matchQuestionRange(line: string): { from: number; to: number } | null {
  const m = line.match(
    /questions?\s+(\d{1,2})\s*(?:[–—−-]|\s+to\s+)\s*(\d{1,2})\b/i,
  )
  if (!m) return null
  const from = Number(m[1])
  const to = Number(m[2])
  if (from >= 1 && to <= 40 && from <= to) return { from, to }
  return null
}

/**
 * Map số câu → đoạn transcript (dialogue / narration).
 */
export function parseListeningAudioscript(text: string): Map<number, string> {
  const map = new Map<number, string>()
  if (!text?.trim()) return map

  const scriptBody = extractAudioscriptSection(text) ?? text
  const lines = scriptBody.split(/\n/)

  let current: number | null = null
  let buf: string[] = []
  /** Dải câu đang thu monologue (P2/P3/P5 không đánh số từng câu). */
  let range: { from: number; to: number } | null = null
  let rangeBuf: string[] = []

  const flushQuestion = () => {
    if (current == null) return
    const joined = buf.join(' ').replace(/\s+/g, ' ').trim()
    if (joined.length >= 8) map.set(current, joined)
    buf = []
    current = null
  }

  const flushRange = () => {
    if (!range) return
    const joined = rangeBuf.join(' ').replace(/\s+/g, ' ').trim()
    // Bỏ boilerplate quá ngắn
    if (joined.length >= 40) {
      for (let n = range.from; n <= range.to; n += 1) {
        if (!map.has(n)) map.set(n, joined)
      }
    }
    range = null
    rangeBuf = []
  }

  /** Dòng đáp án thuần: "1 A", "12 B", "6 August" — không phải script. */
  function isAnswerOnlyLine(line: string): boolean {
    if (/^(?:part|section|test)\s*\d+/i.test(line)) return true
    if (/^audioscripts?|^tapescripts?|^transcripts?/i.test(line)) return true
    if (/^that is the end of/i.test(line)) return true
    if (/^now listen again/i.test(line)) return true
    if (/^\[repeat\]$/i.test(line)) return true
    if (/^you now have \w+ minutes/i.test(line)) return true
    // "1 A" / "12 B" / "1. A"
    if (/^\d{1,2}\s*[\.\)\:\-–—]?\s*[A-Ha-h]\s*$/i.test(line)) return true
    if (/^\d{1,2}\s*[\.\)\:\-–—]?\s*[A-Ha-h](?:\s*[\/|]\s*[A-Ha-h])+\s*$/i.test(line)) return true
    const shortAns = line.match(/^(\d{1,2})\s*[\.\)\:\-–—]?\s+(.+)$/i)
    if (shortAns) {
      const rest = shortAns[2].trim()
      const words = rest.split(/\s+/).filter(Boolean)
      if (
        words.length <= 3
        && rest.length <= 24
        && !/[:"]/.test(rest)
        && !/\b(woman|man|boy|girl|teacher|you will hear)\b/i.test(rest)
      ) {
        return true
      }
    }
    return false
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (/^---\s*PAGE\s+\d+/i.test(line)) continue

    // Hết part → chốt monologue range + câu hiện tại
    if (/^that is the end of part/i.test(line) || /^that is the end of the test/i.test(line)) {
      flushQuestion()
      flushRange()
      continue
    }

    // PART N header — chốt range cũ; có thể còn "Look at questions" ở dòng sau
    if (/^parts?\s*\d+\b/i.test(line) || /^now look at (?:the instructions for )?part/i.test(line)) {
      flushQuestion()
      flushRange()
      // Vẫn quét range trên cùng dòng nếu có
      const rOnPart = matchQuestionRange(line)
      if (rOnPart) range = rOnPart
      continue
    }

    const qStart = matchQuestionStart(line)
    if (qStart) {
      flushQuestion()
      // Có đánh số câu → không dùng monologue range cho đoạn này
      if (range && qStart.n >= range.from && qStart.n <= range.to) {
        // Vẫn trong dải đã announce nhưng có Question N riêng → ưu tiên từng câu
      }
      // Bắt đầu thu từng câu — tạm đóng range monologue (tránh nhét dialogue Q vào range)
      if (range) {
        // Nếu range đã có text dài và câu mới ngoài range, flush; nếu trong range với Question N, bỏ range
        if (qStart.n < range.from || qStart.n > range.to) flushRange()
        else {
          range = null
          rangeBuf = []
        }
      }
      current = qStart.n
      if (qStart.rest) buf.push(qStart.rest)
      continue
    }

    const r = matchQuestionRange(line)
    if (r) {
      flushQuestion()
      flushRange()
      range = r
      // Bỏ boilerplate "now. You have ten seconds." trên cùng dòng
      let after = line
        .replace(/.*questions?\s+\d{1,2}\s*(?:[–—−-]|\s+to\s+)\s*\d{1,2}\b\.?\s*/i, '')
        .trim()
      after = after.replace(/^now\.?\s*/i, '').replace(/^you have [^.]*\.\s*/i, '').trim()
      if (after.length >= 12) rangeBuf.push(after)
      continue
    }

    if (isAnswerOnlyLine(line) && current == null && !range) continue

    if (current != null) {
      if (isAnswerOnlyLine(line) && line.length < 20) continue
      if (/^now listen again/i.test(line) || /^\[repeat\]$/i.test(line)) continue
      buf.push(line)
      continue
    }

    if (range) {
      if (/^for each question/i.test(line)) continue
      if (/^you$/i.test(line)) continue
      if (/^(?:you\s+)?have (?:ten|fifteen|twenty|thirty|\d+)/i.test(line)) continue
      if (/^now listen again/i.test(line) || /^\[repeat\]$/i.test(line)) continue
      if (isAnswerOnlyLine(line) && line.length < 20) continue
      rangeBuf.push(line)
    }
  }

  flushQuestion()
  flushRange()
  return map
}

/** Gắn transcript (và đáp án nếu thiếu) vào payload import. */
export function applyAnswerKeyAndScriptToPayload<
  T extends {
    parts: Array<{
      questions: Array<{
        number: number
        answer?: string
        ttsText?: string
        explanation?: string
      }>
      ttsText?: string
    }>
  },
>(
  payload: T,
  fullText: string,
  answerMap: Map<number, string>,
): { payload: T; scriptCount: number; answerFilled: number } {
  const scripts = parseListeningAudioscript(fullText)
  let scriptCount = 0
  let answerFilled = 0

  const parts = payload.parts.map(part => {
    const questions = part.questions.map(q => {
      let next = { ...q }
      const script = scripts.get(q.number)
      // "" trong JSON cũng coi là trống
      if (script && !next.ttsText?.trim()) {
        next = { ...next, ttsText: script }
        scriptCount += 1
      }
      const ans = answerMap.get(q.number)
      if (ans && !next.answer?.trim()) {
        next = { ...next, answer: ans }
        answerFilled += 1
      }
      if (script && !next.explanation?.trim()) {
        next = {
          ...next,
          explanation: script.length > 160 ? `${script.slice(0, 157)}…` : script,
        }
      }
      return next
    })

    let partTts = part.ttsText
    if (!partTts?.trim()) {
      const chunk = questions
        .map(q => q.ttsText?.trim())
        .filter(Boolean)
        .join('\n\n')
      if (chunk) partTts = chunk
    }

    return { ...part, questions, ttsText: partTts }
  })

  return {
    payload: { ...payload, parts } as T,
    scriptCount,
    answerFilled,
  }
}
