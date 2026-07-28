import { useMemo, useState } from 'react'
import { BookOpen, Sparkles, Library } from 'lucide-react'
import { writingRepo } from '@ryan/db'
import {
  canUse,
  type AIProvider,
  type CambridgeScore,
  type Plan,
  type WritingModelAnswer,
} from '@ryan/core'
import AiSettingsModal from '../writing/AiSettingsModal'
import type { ReadingExam, ReadingPart, ReadingQuestion } from './examData'
import { countWords } from './examData'
import {
  generateCambridgeRwModelAnswer,
  gradeCambridgeRwWritingAnswer,
} from './cambridgeRwWritingGrade'
import {
  suggestModelAnswers,
  type CambridgeWritingModelEntry,
} from './cambridgeWritingModelCatalog'

const RATE_LIMITS: Record<Plan, number> = {
  free: 0, basic: 0, trial: 5, pro: 20, lifetime: Infinity,
}

function scoreColor(score: number): string {
  if (score >= 4) return '#22c55e'
  if (score >= 3) return '#f59e0b'
  return '#ef4444'
}

const CRITERIA: {
  key: keyof Pick<CambridgeScore, 'content' | 'communicativeAchievement' | 'organisation' | 'language'>
  label: string
}[] = [
  { key: 'content', label: 'Content' },
  { key: 'communicativeAchievement', label: 'Communicative Achievement' },
  { key: 'organisation', label: 'Organisation' },
  { key: 'language', label: 'Language' },
]

interface Props {
  exam: ReadingExam
  part: ReadingPart
  question: ReadingQuestion
  userAnswer: string
}

export default function CambridgeRwWritingGradePanel({
  exam,
  part,
  question,
  userAnswer,
}: Props) {
  const [score, setScore] = useState<CambridgeScore | null>(null)
  const [isGrading, setIsGrading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAiSettings, setShowAiSettings] = useState(false)

  const [aiModel, setAiModel] = useState<WritingModelAnswer | null>(null)
  const [modelLoading, setModelLoading] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)
  const [showCatalog, setShowCatalog] = useState(false)

  const wordCount = countWords(userAnswer)
  const minWords = question.minWords ?? 0
  const embeddedModel = question.modelAnswer
    ?? (question.answer?.length > 80 ? question.answer : '')

  const catalogHits = useMemo(
    () => suggestModelAnswers(exam.cambridgeLevel, `${question.prompt} ${part.passageTitle ?? ''}`, 3),
    [exam.cambridgeLevel, question.prompt, part.passageTitle],
  )

  async function ensureAi(): Promise<{ provider: AIProvider; apiKey: string } | null> {
    const provider = ((await writingRepo.getSetting('ai_provider')) as AIProvider) ?? 'openai'
    const apiKey = ((await writingRepo.getSetting(`ai_key_${provider}`)) as string) ?? ''
    if (!apiKey) {
      setShowAiSettings(true)
      return null
    }
    const plan = ((await writingRepo.getSetting('plan')) as Plan) ?? 'free'
    if (!canUse(plan, 'writing_ai')) {
      setError('Chấm AI chỉ dành cho gói TRIAL, PRO hoặc LIFETIME.')
      return null
    }
    const limit = RATE_LIMITS[plan]
    if (limit !== Infinity) {
      const used = await writingRepo.getTodayUsage('writing_ai')
      if (used >= limit) {
        setError(`Đã đạt giới hạn ${limit} lần AI/ngày (gói ${plan.toUpperCase()}).`)
        return null
      }
    }
    return { provider, apiKey }
  }

  async function handleGrade() {
    if (!userAnswer.trim() || isGrading) return
    setError(null)
    const ready = await ensureAi()
    if (!ready) return

    setIsGrading(true)
    try {
      const { score: graded, tokens } = await gradeCambridgeRwWritingAnswer(
        exam,
        part,
        question,
        userAnswer,
        ready.apiKey,
        ready.provider,
      )
      setScore(graded)
      await writingRepo.recordUsage('writing_ai', tokens)
      await writingRepo.recordImprovements(graded.improvements ?? [])
      // Lưu vào lịch sử writing (doc ảo theo exam+question) để dashboard 30 ngày nhận
      const pseudoDocId = `exam-rw:${exam.id}:${question.id}`
      await writingRepo.saveScore(pseudoDocId, userAnswer, graded)
    } catch (e) {
      setError(e instanceof Error ? e.message.slice(0, 200) : 'Lỗi chấm AI.')
    } finally {
      setIsGrading(false)
    }
  }

  async function handleGenerateModel() {
    if (modelLoading) return
    setModelError(null)
    const ready = await ensureAi()
    if (!ready) return

    setModelLoading(true)
    try {
      const { model, tokens } = await generateCambridgeRwModelAnswer(
        exam,
        part,
        question,
        ready.apiKey,
        ready.provider,
      )
      setAiModel(model)
      await writingRepo.recordUsage('writing_ai', tokens)
    } catch (e) {
      setModelError(e instanceof Error ? e.message.slice(0, 200) : 'Lỗi tạo bài mẫu.')
    } finally {
      setModelLoading(false)
    }
  }

  if (!userAnswer.trim()) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Không có bài viết — không chấm được.
        </p>
        <ModelAnswerBlock
          embedded={embeddedModel}
          aiModel={aiModel}
          catalogHits={catalogHits}
          showCatalog={showCatalog}
          onToggleCatalog={() => setShowCatalog(v => !v)}
          onGenerate={() => void handleGenerateModel()}
          modelLoading={modelLoading}
          modelError={modelError}
        />
      </div>
    )
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {wordCount} từ{minWords > 0 ? ` (tối thiểu ${minWords})` : ''}
        {exam.cambridgeLevel ? ` · Cambridge ${exam.cambridgeLevel.toUpperCase()}` : ''}
      </p>

      {!score && !isGrading && (
        <button
          type="button"
          onClick={() => void handleGrade()}
          className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          <Sparkles size={14} />
          Chấm điểm AI (Cambridge)
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

          <button
            type="button"
            className="mt-3 text-xs font-semibold underline"
            style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => void handleGrade()}
          >
            Chấm lại
          </button>
        </div>
      )}

      <ModelAnswerBlock
        embedded={embeddedModel}
        aiModel={aiModel}
        catalogHits={catalogHits}
        showCatalog={showCatalog}
        onToggleCatalog={() => setShowCatalog(v => !v)}
        onGenerate={() => void handleGenerateModel()}
        modelLoading={modelLoading}
        modelError={modelError}
      />

      {showAiSettings && (
        <AiSettingsModal onClose={() => setShowAiSettings(false)} />
      )}
    </div>
  )
}

function ModelAnswerBlock({
  embedded,
  aiModel,
  catalogHits,
  showCatalog,
  onToggleCatalog,
  onGenerate,
  modelLoading,
  modelError,
}: {
  embedded: string
  aiModel: WritingModelAnswer | null
  catalogHits: CambridgeWritingModelEntry[]
  showCatalog: boolean
  onToggleCatalog: () => void
  onGenerate: () => void
  modelLoading: boolean
  modelError: string | null
}) {
  const text = aiModel?.modelAnswer || embedded

  return (
    <div
      className="rounded-xl border p-3"
      style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <BookOpen size={14} style={{ color: 'var(--color-primary)' }} />
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
          Model answer
        </span>
      </div>

      {text ? (
        <pre
          className="text-xs leading-relaxed whitespace-pre-wrap m-0 mb-2"
          style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
        >
          {text}
        </pre>
      ) : (
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
          Chưa có bài mẫu gắn đề. Tạo bằng AI hoặc xem catalog tham khảo.
        </p>
      )}

      {aiModel?.bandOrLevelNote && (
        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{aiModel.bandOrLevelNote}</p>
      )}
      {aiModel?.whyGood?.length ? (
        <ul className="text-xs list-disc pl-4 mb-2" style={{ color: 'var(--text-muted)' }}>
          {aiModel.whyGood.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={modelLoading}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
            color: 'var(--color-primary)',
            border: '1px solid color-mix(in srgb, var(--color-primary) 30%, var(--border-color))',
            cursor: 'pointer',
          }}
        >
          <Sparkles size={12} />
          {modelLoading ? 'Đang tạo…' : 'Tạo bài mẫu AI'}
        </button>
        <button
          type="button"
          onClick={onToggleCatalog}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
          }}
        >
          <Library size={12} />
          {showCatalog ? 'Ẩn catalog' : 'Catalog mẫu'}
        </button>
      </div>

      {modelError && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-accent)' }}>{modelError}</p>
      )}

      {showCatalog && (
        <div className="mt-3 flex flex-col gap-2">
          {catalogHits.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Catalog trống cho level này.</p>
          ) : (
            catalogHits.map(entry => (
              <details
                key={entry.id}
                className="rounded-lg border px-3 py-2"
                style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}
              >
                <summary className="text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  {entry.title}
                </summary>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{entry.prompt}</p>
                <pre
                  className="text-xs mt-2 whitespace-pre-wrap m-0"
                  style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
                >
                  {entry.modelAnswer}
                </pre>
                <p className="text-xs mt-1 italic" style={{ color: 'var(--text-muted)' }}>{entry.notesVi}</p>
              </details>
            ))
          )}
        </div>
      )}
    </div>
  )
}
