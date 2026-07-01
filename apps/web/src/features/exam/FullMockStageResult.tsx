import { ArrowRight, CheckCircle2 } from 'lucide-react'
import type { FullMockStage } from './fullMockSession'

interface Props {
  mockTitle: string
  stage: FullMockStage
  stageLabel: string
  scoreText: string
  nextLabel: string
  onContinue: () => void
  onExit: () => void
}

const STAGE_ORDER: FullMockStage[] = ['reading', 'listening', 'writing', 'done']

export default function FullMockStageResult({
  mockTitle,
  stage,
  stageLabel,
  scoreText,
  nextLabel,
  onContinue,
  onExit,
}: Props) {
  const stageIndex = STAGE_ORDER.indexOf(stage)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
        <div
          className="rounded-[28px] border p-6"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
            Full Mock Test
          </p>
          <h1 className="mt-2 text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            {mockTitle}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Hoàn thành {stageLabel}
          </p>

          <div
            className="mt-5 flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-primary) 28%, var(--border-color))',
              background: 'color-mix(in srgb, var(--color-primary) 8%, var(--bg-card))',
            }}
          >
            <CheckCircle2 size={22} style={{ color: 'var(--color-primary)' }} />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
                Điểm {stageLabel}
              </p>
              <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{scoreText}</p>
            </div>
          </div>

          <div className="mt-5 flex gap-1">
            {STAGE_ORDER.slice(0, 3).map((s, i) => (
              <div
                key={s}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  background: i <= stageIndex
                    ? 'var(--color-primary)'
                    : 'color-mix(in srgb, var(--text-muted) 25%, transparent)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="listening-exam-btn listening-exam-btn--ghost"
            onClick={onExit}
          >
            Thoát Full Test
          </button>
          <button
            type="button"
            className="listening-exam-btn listening-exam-btn--primary inline-flex items-center gap-2"
            onClick={onContinue}
          >
            {nextLabel}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}