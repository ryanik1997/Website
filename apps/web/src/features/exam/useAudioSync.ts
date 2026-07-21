import { useCallback, useEffect, useRef } from 'react'
import type { ListeningExam, ListeningPart } from './listeningExamData'
import { getListeningExamQuestions, getPartQuestions } from './listeningExamData'
import { resolveListeningAudioSource, sharedExamAudioSource } from './listeningExamAudio'
import { scrollListeningToQuestion } from './listeningScrollUtils'

import {
  audioSyncQuestionScope,
  shouldSyncWholeExamAudio,
  resolveWhisperSegments,
  questionIndexAtAudioTime,
  matchQuestionPromptsToSegments,
  type WhisperSegment,
} from './audioSyncUtils'

const MANUAL_OVERRIDE_MS = 3000

function usesWholeExamAudioSync(
  exam: ListeningExam,
  currentPart: ListeningPart,
): boolean {
  const source = resolveListeningAudioSource(exam, currentPart)
  return shouldSyncWholeExamAudio({
    hasSharedAudio: Boolean(sharedExamAudioSource(exam)),
    startPct: source.startPct,
    endPct: source.endPct,
  })
}

interface UseAudioSyncOptions {
  audioCurrentTime: number
  audioDuration: number
  playing: boolean
  exam: ListeningExam
  currentPart: ListeningPart | null
  submitted: boolean
  reviewMode: boolean
  activeQuestionId: string | null
  onQuestionChange: (questionId: string) => void
  onPartChange?: (partIndex: number) => void
  scrollRoot: HTMLElement | null
}

export function useAudioSync(options: UseAudioSyncOptions): {
  markManualInteraction: () => void
} {
  const {
    audioCurrentTime,
    audioDuration,
    playing,
    exam,
    currentPart,
    submitted,
    reviewMode,
    activeQuestionId,
    onQuestionChange,
    onPartChange,
    scrollRoot,
  } = options
  const lastManualInteractionRef = useRef(0)
  const lastSyncedQuestionRef = useRef<string | null>(null)
  const segmentsRef = useRef<WhisperSegment[]>([])

  const markManualInteraction = useCallback(() => {
    lastManualInteractionRef.current = Date.now()
  }, [])

  // Match question prompts to segments for precise auto-advance
  const segToQuestionRef = useRef<Record<number, number>>({})
  const questionAtSegmentRef = useRef<number[]>([])

  useEffect(() => {
    lastSyncedQuestionRef.current = null
    const segs = currentPart
      ? resolveWhisperSegments(currentPart.transcriptSegments, exam.id, currentPart.partNumber)
      : []
    segmentsRef.current = segs

    // Content-based matching: match question prompts to Whisper segments
    if (segs.length > 0 && currentPart) {
      const partQuestions = getPartQuestions(currentPart)
      const matches = matchQuestionPromptsToSegments(
        partQuestions.map(q => ({ number: q.number, prompt: q.prompt })),
        segs,
      )
      // Build segment → question mapping: for each segment, which question does it belong to?
      const segToQ: Record<number, number> = {}
      const qAtSeg: number[] = []
      let matchCount = 0
      for (let qi = 0; qi < matches.length; qi += 1) {
        const segIdx = matches[qi]
        if (segIdx >= 0) {
          segToQ[segIdx] = qi
          matchCount += 1
        }
      }
      // Fill gaps: segments between matches belong to the previous matched question
      let currentQ = 0
      for (let si = 0; si < segs.length; si += 1) {
        if (segToQ[si] !== undefined) currentQ = segToQ[si]!
        qAtSeg.push(currentQ)
      }
      segToQuestionRef.current = segToQ
      // Only use content matching when at least 2 questions matched
      questionAtSegmentRef.current = matchCount >= 2 ? qAtSeg : []
    } else {
      segToQuestionRef.current = {}
      questionAtSegmentRef.current = []
    }
  }, [currentPart, exam.id])

  useEffect(() => {
    if (
      !playing
      || submitted
      || reviewMode
      || exam.examMode !== 'practice'
      || !currentPart
      || Date.now() - lastManualInteractionRef.current < MANUAL_OVERRIDE_MS
    ) {
      return
    }

    const syncWholeExam = usesWholeExamAudioSync(exam, currentPart)
    const questions = audioSyncQuestionScope({
      syncWholeExam,
      wholeExamQuestions: getListeningExamQuestions(exam),
      partQuestions: getPartQuestions(currentPart),
    })
    const source = resolveListeningAudioSource(exam, currentPart)

    let questionIndex = -1

    if (syncWholeExam) {
      // Shared audio: detect current Part from audioStartPct/audioEndPct
      const audioPct = (audioCurrentTime / (audioDuration || 1)) * 100
      const currentPartIdx = exam.parts.findIndex(p => {
        const start = p.audioStartPct ?? 0
        const end = p.audioEndPct ?? 100
        return audioPct >= start && audioPct < end
      })
      const actualPart = currentPartIdx >= 0 ? exam.parts[currentPartIdx] : currentPart

      if (actualPart && actualPart.id !== currentPart?.id) {
        // Crossed into new part — call onPartChange
        onPartChange?.(currentPartIdx >= 0 ? currentPartIdx : 0)
      }

      // Calculate question within the detected part using startPct/endPct
      const partQ = getPartQuestions(actualPart ?? currentPart)
      if (partQ.length > 0) {
        const start = (actualPart?.audioStartPct ?? currentPart?.audioStartPct ?? 0) / 100 * audioDuration
        const end = (actualPart?.audioEndPct ?? currentPart?.audioEndPct ?? 100) / 100 * audioDuration
        const dur = Math.max(0.001, end - start)
        const relTime = Math.max(0, Math.min(dur, audioCurrentTime - start))
        const qIdx = Math.min(partQ.length - 1, Math.floor((relTime / dur) * partQ.length))

        // Map to global question index using part offset
        const firstQId = partQ[0]?.id
        const globalOffset = questions.findIndex(q => q.id === firstQId)
        questionIndex = globalOffset >= 0 ? globalOffset + qIdx : qIdx
      }
    } else {
      // Per-part audio: calculate within current part only
      const partQuestions = getPartQuestions(currentPart)
      const partQCount = partQuestions.length

      // Content-based matching (only works for parts where prompts are spoken)
      if (questionAtSegmentRef.current.length > 0 && segmentsRef.current.length > 0) {
        const relTime = Math.max(0, audioCurrentTime - (Number.isFinite(source.startPct) ? (source.startPct! / 100) * audioDuration : 0))
        const segIdx = segmentsRef.current.findIndex(s => relTime < s.end)
        const activeSeg = segIdx >= 0 ? segIdx : segmentsRef.current.length - 1
        const mapped = questionAtSegmentRef.current[activeSeg]
        if (mapped != null) questionIndex = mapped
      }

      // Fallback: pause detection or time ratio
      if (questionIndex < 0) {
        questionIndex = questionIndexAtAudioTime({
          audioCurrentTime,
          audioDuration,
          questionCount: partQCount,
          segments: segmentsRef.current,
          startPct: source.startPct,
          endPct: source.endPct,
        })
      }

      // Local index → global offset (non-shared: part doesn't change)
      if (partQCount > 0) {
        const firstQId = partQuestions[0]?.id
        const globalOffset = questions.findIndex(q => q.id === firstQId)
        if (globalOffset >= 0) questionIndex = globalOffset + questionIndex
      }
    }

    const questionId = questions[questionIndex]?.id
    if (!questionId || questionId === activeQuestionId || questionId === lastSyncedQuestionRef.current) return

    lastSyncedQuestionRef.current = questionId
    if (syncWholeExam) {
      const nextPartIndex = exam.parts.findIndex(part =>
        getPartQuestions(part).some(question => question.id === questionId),
      )
      if (nextPartIndex >= 0) onPartChange?.(nextPartIndex)
    }
    onQuestionChange(questionId)
    window.requestAnimationFrame(() => {
      scrollListeningToQuestion(scrollRoot, questionId)
    })
  }, [
    activeQuestionId,
    audioCurrentTime,
    audioDuration,
    currentPart,
    exam,
    onQuestionChange,
    onPartChange,
    playing,
    reviewMode,
    scrollRoot,
    submitted,
  ])

  return { markManualInteraction }
}
