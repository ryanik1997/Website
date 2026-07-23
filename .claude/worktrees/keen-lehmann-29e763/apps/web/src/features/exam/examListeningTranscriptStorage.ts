/** sessionStorage: transcript IELTS Listening theo câu (do AI tạo). */

const PREFIX = 'exam-listening-transcript:'

export type ListeningTranscriptMap = Record<number, string>

function storageKey(examId: string): string {
  return `${PREFIX}${examId}`
}

export function saveListeningTranscripts(examId: string, map: ListeningTranscriptMap): void {
  if (!examId) return
  const clean: ListeningTranscriptMap = {}
  for (const [k, v] of Object.entries(map)) {
    const n = Number(k)
    if (!Number.isFinite(n) || n < 1) continue
    const t = String(v ?? '').trim()
    if (t) clean[n] = t
  }
  if (!Object.keys(clean).length) return
  try {
    sessionStorage.setItem(storageKey(examId), JSON.stringify(clean))
  } catch {
    /* quota */
  }
}

export function loadListeningTranscripts(examId: string): ListeningTranscriptMap | null {
  if (!examId) return null
  try {
    const raw = sessionStorage.getItem(storageKey(examId))
    if (!raw) return null
    const obj = JSON.parse(raw) as unknown
    if (!obj || typeof obj !== 'object') return null
    const out: ListeningTranscriptMap = {}
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const n = Number(k)
      if (!Number.isFinite(n) || typeof v !== 'string' || !v.trim()) continue
      out[n] = v.trim()
    }
    return Object.keys(out).length ? out : null
  } catch {
    return null
  }
}

export function clearListeningTranscripts(examId: string): void {
  try {
    sessionStorage.removeItem(storageKey(examId))
  } catch {
    /* ignore */
  }
}
