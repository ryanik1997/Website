export interface WhisperSegment {
  id: number
  start: number
  end: number
  text: string
}

/**
 * Detect if audio has a "listen twice" pattern (e.g. KET A2).
 * Returns the time boundary (seconds) where the second pass starts, or null.
 * The largest gap between consecutive segments is the "Now listen again" pause.
 */
export function detectListenTwiceBoundary(segments: WhisperSegment[]): number | null {
  if (segments.length < 5) return null
  let maxGap = 0
  let boundaryIdx = -1
  for (let i = 1; i < segments.length; i += 1) {
    const gap = segments[i]!.start - segments[i - 1]!.end
    if (gap > maxGap) {
      maxGap = gap
      boundaryIdx = i
    }
  }
  // Gap > 3s → likely "Now listen again" pause
  if (maxGap > 3 && boundaryIdx > 0) {
    return segments[boundaryIdx]!.start
  }
  return null
}

export function whisperSegmentsStorageKey(examId: string, partNumber: number): string {
  return `exam-listening-whisper-segments:${examId}:${partNumber}`
}

export function parseWhisperSegments(value: unknown): WhisperSegment[] {
  if (!Array.isArray(value)) return []
  return value
    .map((segment, index) => {
      if (!segment || typeof segment !== 'object') return null
      const candidate = segment as Record<string, unknown>
      const start = Number(candidate.start)
      const end = Number(candidate.end)
      const text = typeof candidate.text === 'string' ? candidate.text.trim() : ''
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || !text) return null
      return {
        id: Number.isFinite(Number(candidate.id)) ? Number(candidate.id) : index,
        start,
        end,
        text,
      }
    })
    .filter((segment): segment is WhisperSegment => segment !== null)
    .sort((a, b) => a.start - b.start)
}

export function parseWhisperSegmentsJson(raw: string | null): WhisperSegment[] {
  try {
    return parseWhisperSegments(JSON.parse(raw ?? '[]'))
  } catch {
    return []
  }
}

export function loadWhisperSegments(examId: string, partNumber: number): WhisperSegment[] {
  return parseWhisperSegmentsJson(
    window.localStorage.getItem(whisperSegmentsStorageKey(examId, partNumber)),
  )
}

export function resolveWhisperSegments(
  publishedSegments: WhisperSegment[] | undefined,
  examId: string,
  partNumber: number,
): WhisperSegment[] {
  const cloudSegments = parseWhisperSegments(publishedSegments)
  return cloudSegments.length > 0 ? cloudSegments : loadWhisperSegments(examId, partNumber)
}

export function preparePublishedWhisperData(options: {
  publishedTranscript?: string
  storedTranscript?: string | null
  publishedSegments?: WhisperSegment[]
  storedSegmentsJson?: string | null
}): {
  transcript: string | undefined
  transcriptSegments: WhisperSegment[] | undefined
} {
  const transcript = options.publishedTranscript?.trim()
    || options.storedTranscript?.trim()
    || undefined
  const cloudSegments = parseWhisperSegments(options.publishedSegments)
  const segments = cloudSegments.length > 0
    ? cloudSegments
    : parseWhisperSegmentsJson(options.storedSegmentsJson ?? null)

  return {
    transcript,
    transcriptSegments: segments.length > 0 ? segments : undefined,
  }
}

export function shouldOfferWhisperTiming(options: {
  hasAudioUrl: boolean
  partMissingTranscript: boolean
  segmentCount: number
}): boolean {
  return options.hasAudioUrl && (
    options.partMissingTranscript
    || options.segmentCount === 0
  )
}

/**
 * Match question prompt text to Whisper segments to find where each question
 * is spoken in the audio (e.g. KET: "One. How did Richard travel from the airport?").
 * Returns: for each question index → segment index match, or -1 if not found.
 */
export function matchQuestionPromptsToSegments(
  questions: Array<{ number: number; prompt: string }>,
  segments: WhisperSegment[],
): number[] {
  const result = new Array<number>(questions.length).fill(-1)
  if (segments.length === 0 || questions.length === 0) return result

  // Extract content words from each question prompt (ignore short/stop words)
  const qWords = questions.map(q => {
    const words = q.prompt
      .toLowerCase()
      .replace(/[?.,!;:'"]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['the', 'and', 'for', 'are', 'was', 'did', 'has', 'had', 'not', 'but', 'all', 'can', 'her', 'his', 'its', 'per', 'she', 'who', 'how', 'why', 'man', 'got', 'say', 'get', 'way', 'use'].includes(w))
    return { questionNumber: q.number, words, prompt: q.prompt.toLowerCase() }
  })

  for (let qi = 0; qi < qWords.length; qi += 1) {
    const { words, prompt } = qWords[qi]!
    if (words.length === 0) continue

    let bestSegIdx = -1
    let bestScore = 0

    for (let si = 0; si < segments.length; si += 1) {
      const segText = segments[si]!.text.toLowerCase()

      // Check how many content words appear in this segment
      const wordMatches = words.filter(w => segText.includes(w)).length

      // Also check if the full prompt (trimmed) is contained
      const fullMatch = segText.includes(prompt) ? 2 : 0

      // Bonus for question number prefix: "one", "two", etc.
      const numberWord = ['one', 'two', 'three', 'four', 'five'][qi]
      const numPrefix = segText.startsWith(numberWord!) || segText.includes(` ${numberWord} `) ? 1 : 0

      const score = wordMatches + fullMatch + numPrefix
      if (score > bestScore) {
        bestScore = score
        bestSegIdx = si
      }
    }

    // Require at least 2 word matches to avoid false positives
    if (bestScore >= 2 && bestSegIdx >= 0) {
      result[qi] = bestSegIdx
    }
  }

  return result
}

/**
 * Group segments into question groups by detecting long pauses between segments.
 * Whisper breaks segments at speech pauses; longer gaps (>1.2s) often signal
 * question boundaries (e.g. intro → Q1 → Q2 in KET Part 1).
 */
export function groupSegmentsByPause(
  segments: WhisperSegment[],
  questionCount: number,
): number[] {
  if (segments.length <= 0) return []
  if (questionCount <= 1 || segments.length <= 1) {
    return segments.map(() => 0)
  }

  // 1. Calculate gaps between consecutive segments
  const gaps: { index: number; gap: number }[] = []
  for (let i = 1; i < segments.length; i += 1) {
    const gap = segments[i]!.start - segments[i - 1]!.end
    if (gap > 0) gaps.push({ index: i, gap })
  }

  // 2. Take the (questionCount - 1) largest gaps as boundaries
  const boundaryCount = Math.min(questionCount - 1, gaps.length)
  const boundaries = new Set(
    gaps
      .sort((a, b) => b.gap - a.gap)
      .slice(0, boundaryCount)
      .sort((a, b) => a.index - b.index)
      .map(g => g.index),
  )

  // 3. Assign each segment to a question group
  const segToQ: number[] = []
  let qIdx = 0
  for (let i = 0; i < segments.length; i += 1) {
    if (boundaries.has(i)) qIdx = Math.min(qIdx + 1, questionCount - 1)
    segToQ.push(qIdx)
  }
  return segToQ
}

export function questionIndexAtAudioTime(options: {
  audioCurrentTime: number
  audioDuration: number
  questionCount: number
  segments?: WhisperSegment[]
  startPct?: number
  endPct?: number
}): number {
  const {
    audioCurrentTime,
    audioDuration,
    questionCount,
    segments = [],
    startPct,
    endPct,
  } = options
  if (questionCount <= 0 || audioDuration <= 0 || !Number.isFinite(audioCurrentTime)) return -1

  const startTime = Number.isFinite(startPct) ? (Math.max(0, startPct!) / 100) * audioDuration : 0
  const endTime = Number.isFinite(endPct) ? (Math.min(100, endPct!) / 100) * audioDuration : audioDuration
  const partDuration = Math.max(0.001, endTime - startTime)
  const relativeTime = Math.max(0, Math.min(partDuration, audioCurrentTime - startTime))

  // Detect KET "listen twice" pattern (Now listen again)
  // Split segments at the longest gap (>3s) → first pass + second pass
  const listenTwiceAt = detectListenTwiceBoundary(segments)

  if (listenTwiceAt != null && segments.length >= questionCount) {
    // Split into first + second pass
    const splitIdx = segments.findIndex(s => s.start >= listenTwiceAt)
    const firstPass = splitIdx > 0 ? segments.slice(0, splitIdx) : segments
    const secondPass = splitIdx > 0 ? segments.slice(splitIdx) : []

    if (relativeTime < listenTwiceAt || secondPass.length < questionCount) {
      // First pass or second pass too short — use first-pass segments
      const segToQ = groupSegmentsByPause(firstPass, questionCount)
      const activeSegIdx = firstPass.findIndex(s => relativeTime < s.end)
      const segIdx = activeSegIdx >= 0 ? activeSegIdx : firstPass.length - 1
      return Math.min(questionCount - 1, segToQ[segIdx] ?? 0)
    }

    // Second pass: wrap time to first-pass position
    const secondPassStart = secondPass[0]!.start
    const firstPassDuration = firstPass[firstPass.length - 1]!.end - firstPass[0]!.start
    const offset = relativeTime - secondPassStart
    if (offset > 0 && firstPassDuration > 0) {
      const ratio = Math.min(1, offset / firstPassDuration)
      // Map ratio within first pass to question index
      const segToQ = groupSegmentsByPause(firstPass, questionCount)
      const fpTime = firstPass[0]!.start + ratio * firstPassDuration
      const fpSegIdx = firstPass.findIndex(s => fpTime < s.end)
      const segIdx = fpSegIdx >= 0 ? fpSegIdx : firstPass.length - 1
      return Math.min(questionCount - 1, segToQ[segIdx] ?? 0)
    }
  }

  // Fallback: segment grouping for single-pass audio
  if (segments.length >= questionCount) {
    const segToQ = groupSegmentsByPause(segments, questionCount)
    const activeSegIdx = segments.findIndex(s => relativeTime < s.end)
    const segIdx = activeSegIdx >= 0 ? activeSegIdx : segments.length - 1
    return Math.min(questionCount - 1, segToQ[segIdx] ?? 0)
  }

  // Last resort: audio time ratio
  return Math.min(questionCount - 1, Math.floor((relativeTime / partDuration) * questionCount))
}

export function shouldSyncWholeExamAudio(options: {
  hasSharedAudio: boolean
  startPct?: number
  endPct?: number
}): boolean {
  // Shared audio (1 file for all parts): questions span multiple parts,
  // need to sync across whole exam to detect part boundaries
  return options.hasSharedAudio
}

export function audioSyncQuestionScope<T>(options: {
  syncWholeExam: boolean
  wholeExamQuestions: T[]
  partQuestions: T[]
}): T[] {
  return options.syncWholeExam
    ? options.wholeExamQuestions
    : options.partQuestions
}
