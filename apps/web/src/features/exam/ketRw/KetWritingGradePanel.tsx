import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { writingRepo } from '@ryan/db'
import {
  canUse,
  type AIProvider,
  type CambridgeScore,
  type Plan,
} from '@ryan/core'
import AiSettingsModal from '../../writing/AiSettingsModal'
import type { ReadingPart, ReadingQuestion } from '../examData'
import { countWords } from '../examData'
import { gradeKetWritingAnswer } from './ketWritingGrade'

const RATE_LIMITS: Record<Plan, number> = {
  free: 0, basic: 0, trial: 5, pro: 20, lifetime: Infinity,
}

function scoreColor(score: number): string {
  if (score >= 4) return '#22c55e'
  if (score >= 3) return '#f59e0b'
  return '#ef4444'
}

const CRITERIA: { key: keyof Pick<CambridgeScore, 'content' | 'communicativeAchievement' | 'organisation' | 'language'>; label: string }[] = [
  { key: 'content', label: 'Content' },
  { key: 'communicativeAchievement', label: 'Communicative Achievement' },
  { key: 'organisation', label: 'Organisation' },
  { key: 'language', label: 'Language' },
]

interface Props {
  part: ReadingPart
  question: ReadingQuestion
  userAnswer: string
}

export default function KetWritingGradePanel({ part, question, userAnswer }: Props) {
  const [score, setScore] = useState<CambridgeScore | null>(null)
  const [isGrading, setIsGrading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAiSettings, setShowAiSettings] = useState(false)

  const wordCount = countWords(userAnswer)
  const minWords = question.minWords ?? 0

  async function handleGrade() {
    if (!userAnswer.trim() || isGrading) return

    const provider = ((await writingRepo.getSetting('ai_provider')) as AIProvider) ?? 'openai'
    const apiKey = ((await writingRepo.getSetting(`ai_key_${provider}`)) as string) ?? ''
    if (!apiKey) {
      setShowAiSettings(true)
      return
    }

    const plan = ((await writingRepo.getSetting('plan')) as Plan) ?? 'pro'
    if (!canUse(plan, 'writing_ai')) {
      setError('Chấm AI chỉ dành cho gói TRIAL, PRO hoặc LIFETIME.')
      return
    }

    const limit = RATE_LIMITS[plan]
    if (limit !== Infinity) {
      const used = await writingRepo.getTodayUsage('writing_ai')
      if (used >= limit) {
        setError(`Đã đạt giới hạn ${limit} lần AI/ngày (gói ${plan.toUpperCase()}).`)
        return
      }
    }

    setIsGrading(true)
    setError(null)
    try {
      const { score: graded, tokens } = await gradeKetWritingAnswer(part, question, userAnswer, apiKey, provider)
      setScore(graded)
      await writingRepo.recordUsage('writing_ai', tokens)
    } catch (e) {
      setError(e instanceof Error ? e.message.slice(0, 200) : 'Lỗi chấm AI.')
    } finally {
      setIsGrading(false)
    }
  }

  if (!userAnswer.trim()) {
    return (
      <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
        Không có bài viết — không chấm được.
      </p>
    )
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {wordCount} từ{minWords > 0 ? ` (tối thiểu ${minWords})` : ''}
      </p>

      {!score && !isGrading && (
        <button
          type="button"
          onClick={handleGrade}
          className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          <Sparkles size={14} />
          Chấm điểm AI
        </button>
      )}

      {isGrading && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          AI đang chấm bài… (10–20 giây)
        </p>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-accent)' }}>{error}</p>
      )}

      {score && (
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="rounded-lg px-3 py-1.5 text-lg font-bold"
              style={{
                background: `color-mix(in srgb, ${scoreColor(score.overallScore)} 18%, transparent)`,
                color: scoreColor(score.overallScore),
              }}
            >
              {score.overallScore % 1 === 0 ? score.overallScore.toFixed(0) : score.overallScore.toFixed(1)}/5
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Level {score.levelLabel}
              {score.cambridgeScale ? ` · Scale ${score.cambridgeScale}` : ''}
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {CRITERIA.map(({ key, label }) => (
              <div key={key} className="rounded-lg px-3 py-2" style={{ background: 'var(--bg-primary)' }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
                  <span className="text-xs font-bold" style={{ color: scoreColor(score[key].band) }}>
                    {score[key].band}/5
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {score[key].feedback}
                </p>
              </div>
            ))}
          </div>

          {score.strengths?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#22c55e' }}>Điểm mạnh</p>
              <ul className="mt-1 list-disc pl-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                {score.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {score.improvements?.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-accent)' }}>Cần cải thiện</p>
              <ul className="mt-1 list-disc pl-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                {score.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {showAiSettings && (
        <AiSettingsModal onClose={() => setShowAiSettings(false)} />
      )}
    </div>
  )
}