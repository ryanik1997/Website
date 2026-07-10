/**
 * Transcript khi xem lại Listening:
 * - Cambridge: ttsText từ answer-key/audioscript (import) + tuỳ chọn AI
 * - IELTS: chủ yếu AI (on-demand)
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ListeningExam, ListeningQuestion } from './listeningExamData'
import {
  loadListeningTranscripts,
  saveListeningTranscripts,
  type ListeningTranscriptMap,
} from './examListeningTranscriptStorage'
import { generateListeningTranscriptsWithAi } from './listeningIeltsTranscriptAi'

export function useListeningReviewTranscript(
  exam: ListeningExam,
  reviewMode: boolean,
  activeQuestion: ListeningQuestion | null,
) {
  const [aiTranscripts, setAiTranscripts] = useState<ListeningTranscriptMap>(() =>
    loadListeningTranscripts(exam.id) ?? {},
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAiTranscripts(loadListeningTranscripts(exam.id) ?? {})
    setError(null)
  }, [exam.id])

  const importedCount = useMemo(() => {
    let n = 0
    for (const p of exam.parts) {
      for (const q of p.questions ?? []) {
        if (q.ttsText?.trim()) n += 1
      }
    }
    return n
  }, [exam.parts])

  const aiCount = Object.keys(aiTranscripts).length

  /** Ưu tiên AI (mới hơn / user bật) rồi ttsText import */
  const transcriptForActive = useMemo(() => {
    if (!activeQuestion) return null
    const fromAi = aiTranscripts[activeQuestion.number]?.trim()
    if (fromAi) return fromAi
    const fromImport = activeQuestion.ttsText?.trim()
    return fromImport || null
  }, [activeQuestion, aiTranscripts])

  const runAi = useCallback(async (force = false) => {
    if (loading) return
    if (!force && aiCount > 0) return
    setLoading(true)
    setError(null)
    try {
      const map = await generateListeningTranscriptsWithAi(exam)
      setAiTranscripts(map)
      saveListeningTranscripts(exam.id, map)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tạo được transcript.')
    } finally {
      setLoading(false)
    }
  }, [aiCount, exam, loading])

  const showToolbar = reviewMode

  return {
    showToolbar,
    loading,
    error,
    aiCount,
    importedCount,
    transcriptForActive,
    transcriptForQuestion: (q: ListeningQuestion | null | undefined) => {
      if (!q) return null
      return aiTranscripts[q.number]?.trim() || q.ttsText?.trim() || null
    },
    runAi,
    hasAnyTranscript: aiCount > 0 || importedCount > 0,
  }
}
