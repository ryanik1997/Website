import { useLiveQuery } from 'dexie-react-hooks'
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react'
import { db } from '@ryan/db'
import type { WritingDoc } from '@ryan/db'
import type { CambridgeScore, IELTSScore, WritingScore } from '@ryan/core'
import { isCambridgeScore, isIELTSScore } from '@ryan/core'
import { getWritingUiConfig } from './writingUiConfig'

function ieltsBandColor(band: number): string {
  if (band >= 7) return '#22c55e'
  if (band >= 5.5) return '#f59e0b'
  return '#ef4444'
}

function cambridgeScoreColor(score: number): string {
  if (score >= 4) return '#22c55e'
  if (score >= 3) return '#f59e0b'
  return '#ef4444'
}

function ScoreBadge({
  value, framework, size = 'sm',
}: {
  value: number
  framework: 'ielts' | 'cambridge'
  size?: 'sm' | 'lg'
}) {
  const color = framework === 'cambridge' ? cambridgeScoreColor(value) : ieltsBandColor(value)
  const text = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)

  if (size === 'lg') {
    return (
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center font-bold text-4xl mx-auto mb-2"
        style={{ background: `${color}20`, color, border: `2px solid ${color}44` }}
      >
        {text}
      </div>
    )
  }
  return (
    <span
      className="text-sm font-bold px-2 py-0.5 rounded-md shrink-0"
      style={{ background: `${color}20`, color }}
    >
      {text}
    </span>
  )
}

const IELTS_CRITERIA = [
  { key: 'taskAchievement' as const, label: 'Task Achievement' },
  { key: 'coherenceCohesion' as const, label: 'Coherence & Cohesion' },
  { key: 'lexicalResource' as const, label: 'Lexical Resource' },
  { key: 'grammaticalRange' as const, label: 'Grammatical Range' },
]

const CAMBRIDGE_CRITERIA = [
  { key: 'content' as const, label: 'Content' },
  { key: 'communicativeAchievement' as const, label: 'Communicative Achievement' },
  { key: 'organisation' as const, label: 'Organisation' },
  { key: 'language' as const, label: 'Language' },
]

function displayOverall(score: unknown, framework: 'ielts' | 'cambridge'): number {
  if (framework === 'cambridge' && isCambridgeScore(score)) return score.overallScore
  if (isIELTSScore(score)) return score.overallBand
  return 0
}

interface Props {
  score: WritingScore | null
  docId: string
  docType: WritingDoc['type']
  isGrading: boolean
  onGrade: () => void
}

export default function ScorePanel({ score, docId, docType, isGrading, onGrade }: Props) {
  const ui = getWritingUiConfig(docType)
  const framework = ui.track

  const history = useLiveQuery(
    () => db.writingHistory.where('docId').equals(docId).reverse().sortBy('at'),
    [docId],
  )

  if (isGrading) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center py-16">
        <div
          className="w-12 h-12 rounded-full border-4 animate-spin mb-5"
          style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--color-primary)' }}
        />
        <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>AI đang chấm bài...</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Thường mất 10–20 giây</p>
      </div>
    )
  }

  if (!score) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 text-center py-12">
        <Sparkles size={40} className="mb-4" style={{ color: 'var(--border-color)' }} />
        <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Nhận feedback từ AI</p>
        <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Viết bài xong rồi nhấn &quot;Chấm điểm AI&quot;.<br />
          {ui.scoreEmptyHint}
        </p>
        <button
          onClick={onGrade}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white font-medium"
          style={{ background: 'var(--color-primary)' }}
        >
          <Sparkles size={14} />
          Chấm điểm AI
        </button>

        {history && history.length > 0 && (
          <div className="mt-8 w-full text-left">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Lịch sử ({history.length})
            </p>
            <div className="flex flex-col gap-1.5">
              {history.slice(0, 5).map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(h.at).toLocaleString('vi-VN', {
                      day: '2-digit', month: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  <ScoreBadge value={displayOverall(h.score, framework)} framework={framework} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const cambridge = isCambridgeScore(score) ? score : null
  const ielts = isIELTSScore(score) ? score : null

  return (
    <div className="p-5">
      <div className="text-center mb-6 pb-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
          {framework === 'cambridge' ? 'Cambridge Writing Score' : 'Overall Band Score'}
        </p>
        <ScoreBadge
          value={cambridge?.overallScore ?? ielts?.overallBand ?? 0}
          framework={framework}
          size="lg"
        />
        {cambridge && (
          <p className="text-sm font-semibold mt-2" style={{ color: 'var(--color-primary)' }}>
            Level {cambridge.levelLabel}
            {cambridge.cambridgeScale ? ` · Scale ${cambridge.cambridgeScale}` : ''}
          </p>
        )}
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {framework === 'cambridge'
            ? (cambridge!.overallScore >= 4
              ? 'Tốt — đạt chuẩn level'
              : cambridge!.overallScore >= 3
                ? 'Khá — cần luyện thêm'
                : 'Cần cải thiện nhiều')
            : (ielts!.overallBand >= 7
              ? 'Tốt — Good'
              : ielts!.overallBand >= 5.5
                ? 'Trung bình — Modest'
                : 'Cần cải thiện — Limited')}
        </p>
      </div>

      <div className="flex flex-col gap-2.5 mb-5">
        {framework === 'cambridge' && cambridge
          ? CAMBRIDGE_CRITERIA.map(({ key, label }) => {
            const c = cambridge[key]
            return (
              <div key={key} className="rounded-xl p-3.5" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
                  <ScoreBadge value={c.band} framework="cambridge" />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{c.feedback}</p>
              </div>
            )
          })
          : ielts && IELTS_CRITERIA.map(({ key, label }) => {
            const c = ielts[key]
            return (
              <div key={key} className="rounded-xl p-3.5" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
                  <ScoreBadge value={c.band} framework="ielts" />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{c.feedback}</p>
              </div>
            )
          })}
      </div>

      {score.strengths?.length > 0 && (
        <div className="mb-4">
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5"
            style={{ color: '#22c55e' }}
          >
            <TrendingUp size={11} /> Điểm mạnh
          </p>
          <ul className="flex flex-col gap-1.5">
            {score.strengths.map((s, i) => (
              <li key={i} className="text-xs flex gap-2 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                <span className="shrink-0 mt-0.5" style={{ color: '#22c55e' }}>✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {score.improvements?.length > 0 && (
        <div className="mb-5">
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5"
            style={{ color: '#f59e0b' }}
          >
            <AlertCircle size={11} /> Cần cải thiện
          </p>
          <ul className="flex flex-col gap-1.5">
            {score.improvements.map((s, i) => (
              <li key={i} className="text-xs flex gap-2 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                <span className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }}>→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {history && history.length > 0 && (
        <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            Lịch sử chấm ({history.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {history.slice(0, 8).map((h, i) => {
              const val = displayOverall(h.score, framework)
              const color = framework === 'cambridge' ? cambridgeScoreColor(val) : ieltsBandColor(val)
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <span className="font-bold" style={{ color }}>
                    {val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {new Date(h.at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}