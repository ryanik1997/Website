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
  partIndexAtTime,
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
    // Auto chuyen cau listening da tat theo yeu cau user
    return
  }, [activeQuestionId, audioCurrentTime, audioDuration, currentPart, exam, onQuestionChange, onPartChange, playing, reviewMode, scrollRoot, submitted])

  return { markManualInteraction }
}
