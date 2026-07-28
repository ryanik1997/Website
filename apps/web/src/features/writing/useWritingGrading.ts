import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { WritingDoc } from '@ryan/db'
import { writingRepo } from '@ryan/db'
import {
  buildWritingGradePrompt,
  callAI,
  attachImagesToUserMessage,
  canUse,
  isCambridgeScore,
  providerSupportsVision,
  type AIProvider,
  type CambridgeScore,
  type Plan,
  type WritingScore,
} from '@ryan/core'

const RATE_LIMITS: Record<Plan, number> = {
  free: 0,
  basic: 0,
  trial: 5,
  pro: 20,
  lifetime: Infinity,
}

type GradeResult =
  | { kind: 'graded'; score: WritingScore }
  | { kind: 'cached'; score: WritingScore }
  | { kind: 'blocked' }

export function useWritingGrading({
  doc,
  text,
  minWords,
  persistText,
}: {
  doc?: WritingDoc
  text: string
  minWords?: number
  persistText?: (text: string) => Promise<void> | void
}) {
  const [score, setScore] = useState<WritingScore | null>(null)
  const [isGrading, setIsGrading] = useState(false)
  const [gradingError, setGradingError] = useState<string | null>(null)
  const [showAiSettings, setShowAiSettings] = useState(false)
  const activeRequestRef = useRef<Promise<GradeResult> | null>(null)
  const scoreDocIdRef = useRef<string | null>(null)
  const scoreTextRef = useRef<string>('')

  useEffect(() => {
    if (scoreDocIdRef.current !== doc?.id) {
      setScore(null)
      setGradingError(null)
      scoreDocIdRef.current = doc?.id ?? null
      scoreTextRef.current = ''
    }
  }, [doc?.id])

  const wordCount = useMemo(() => {
    const trimmed = text.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
  }, [text])

  const ensureAiReady = useCallback(async (): Promise<{ provider: AIProvider; apiKey: string } | null> => {
    const provider = ((await writingRepo.getSetting('ai_provider')) as AIProvider) ?? 'openai'
    const apiKey = ((await writingRepo.getSetting(`ai_key_${provider}`)) as string) ?? ''
    if (!apiKey) {
      setShowAiSettings(true)
      return null
    }

    const plan = ((await writingRepo.getSetting('plan')) as Plan) ?? 'free'
    if (!canUse(plan, 'writing_ai')) {
      setGradingError('Tính năng AI chỉ dành cho gói TRIAL, PRO hoặc LIFETIME.')
      return null
    }

    const limit = RATE_LIMITS[plan]
    if (limit !== Infinity) {
      const used = await writingRepo.getTodayUsage('writing_ai')
      if (used >= limit) {
        setGradingError(`Đã đạt giới hạn ${limit} lần AI/ngày (gói ${plan.toUpperCase()}).`)
        return null
      }
    }

    return { provider, apiKey }
  }, [])

  const grade = useCallback(async (): Promise<GradeResult> => {
    if (activeRequestRef.current) return activeRequestRef.current

    const run = (async (): Promise<GradeResult> => {
      if (!doc) return { kind: 'blocked' }

      const trimmed = text.trim()
      if (!trimmed) {
        setGradingError('Hãy nhập bài viết trước khi chấm.')
        return { kind: 'blocked' }
      }

      if (minWords && wordCount < minWords) {
        const confirmed = window.confirm(
          `Bài viết hiện mới có ${wordCount} từ, thấp hơn mức tối thiểu ${minWords}. Vẫn chấm bài này?`,
        )
        if (!confirmed) return { kind: 'blocked' }
      }

      if (score && scoreDocIdRef.current === doc.id && scoreTextRef.current === trimmed) {
        setGradingError(null)
        return { kind: 'cached', score }
      }

      const ready = await ensureAiReady()
      if (!ready) return { kind: 'blocked' }
      const { provider, apiKey } = ready

      if (persistText) {
        await persistText(trimmed)
      }

      const cached = await writingRepo.getCachedScore(trimmed)
      if (cached) {
        const cachedScore = cached.score as WritingScore
        setScore(cachedScore)
        setGradingError(null)
        scoreDocIdRef.current = doc.id
        scoreTextRef.current = trimmed
        return { kind: 'cached', score: cachedScore }
      }

      setIsGrading(true)
      setGradingError(null)
      try {
        let messages = buildWritingGradePrompt(doc.type, doc.prompt, trimmed)
        if (
          doc.promptImage
          && providerSupportsVision(provider)
          && (doc.type === 'ielts_task1' || doc.type === 'master')
        ) {
          messages = attachImagesToUserMessage(
            messages,
            [doc.promptImage],
            'Attached image is the Task 1 chart/graph/map. Score whether the report accurately covers key features.',
          )
        }

        const result = await callAI(messages, apiKey, provider)
        const parsed = JSON.parse(result.content) as WritingScore
        const nextScore: WritingScore = doc.type.startsWith('cambridge_')
          ? { ...(parsed as CambridgeScore), framework: 'cambridge' }
          : parsed

        if (doc.type.startsWith('cambridge_') && !isCambridgeScore(nextScore)) {
          throw new Error('AI trả về score Cambridge không hợp lệ.')
        }

        await writingRepo.saveScore(doc.id, trimmed, nextScore)
        await writingRepo.recordImprovements(nextScore.improvements ?? [])
        await writingRepo.recordUsage('writing_ai', result.inputTokens + result.outputTokens)

        setScore(nextScore)
        setGradingError(null)
        scoreDocIdRef.current = doc.id
        scoreTextRef.current = trimmed
        return { kind: 'graded', score: nextScore }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Lỗi không xác định'
        setGradingError(message.slice(0, 150))
        return { kind: 'blocked' }
      } finally {
        setIsGrading(false)
      }
    })()

    activeRequestRef.current = run
    try {
      return await run
    } finally {
      activeRequestRef.current = null
    }
  }, [doc, ensureAiReady, minWords, persistText, score, text, wordCount])

  const clearScore = useCallback(() => {
    setScore(null)
    setGradingError(null)
    scoreTextRef.current = ''
  }, [])

  return {
    score,
    isGrading,
    gradingError,
    showAiSettings,
    setShowAiSettings,
    clearScore,
    setGradingError,
    grade,
  }
}
