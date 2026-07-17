import { useState } from 'react'
import { Settings, Check } from 'lucide-react'
import { useDailyGoal } from './useDailyGoal'
import { useI18n } from '../../lib/language'

function GoalRow({
  label,
  current,
  target,
  pct,
  hint,
}: {
  label: string
  current: number
  target: number
  pct: number
  hint?: string
}) {
  const done = current >= target

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {label}
          {hint && (
            <span className="ml-1 text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>
              {hint}
            </span>
          )}
        </span>
        <span className="text-xs tabular-nums font-medium" style={{ color: 'var(--text-muted)' }}>
          {current}/{target}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: done ? 'var(--color-accent)' : 'var(--color-primary)',
          }}
        />
      </div>
    </div>
  )
}

export default function DailyGoalCard({ className }: { className?: string }) {
  const { t } = useI18n()
  const {
    goalWords,
    goalTranslations,
    goalDue,
    wordsToday,
    translationsToday,
    dueReviewedToday,
    dueCount,
    duePct,
    dueGoalComplete,
    wordsPct,
    translationsPct,
    allDone,
    setGoalWords,
    setGoalTranslations,
    setGoalDue,
  } = useDailyGoal()

  const [editing, setEditing] = useState(false)
  const [draftWords, setDraftWords] = useState(goalWords)
  const [draftTranslations, setDraftTranslations] = useState(goalTranslations)
  const [draftDue, setDraftDue] = useState(goalDue)

  function openEdit() {
    setDraftWords(goalWords)
    setDraftTranslations(goalTranslations)
    setDraftDue(goalDue)
    setEditing(true)
  }

  function saveGoals() {
    setGoalWords(draftWords)
    setGoalTranslations(draftTranslations)
    setGoalDue(draftDue)
    setEditing(false)
  }

  const inputStyle = {
    background: 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
  }

  const duePctDisplay = dueGoalComplete ? 100 : duePct

  return (
    <section
      className={`rounded-xl border p-4 transition-colors${className ? ` ${className}` : ''}`}
      style={{
        background: 'var(--bg-card)',
        borderColor: allDone
          ? 'color-mix(in srgb, var(--color-accent) 45%, var(--border-color))'
          : 'var(--border-color)',
        boxShadow: allDone
          ? '0 0 0 1px color-mix(in srgb, var(--color-accent) 12%, transparent)'
          : undefined,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('home.dailyGoal')}
        </h2>
        <button
          type="button"
          onClick={() => (editing ? saveGoals() : openEdit())}
          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
          style={{ color: 'var(--text-muted)' }}
          title={editing ? t('home.saveGoal') : t('home.editGoal')}
        >
          {editing ? <Check size={15} /> : <Settings size={15} />}
        </button>
      </div>

      {editing ? (
        <div className="flex flex-col gap-3 mb-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('home.reviewWords')} (SRS/quiz/…)</span>
            <input
              type="number"
              min={1}
              max={100}
              value={draftWords}
              onChange={e => setDraftWords(Number(e.target.value))}
              className="px-3 py-2 rounded-lg text-sm border outline-none"
              style={inputStyle}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('home.dueCards')} (due)</span>
            <input
              type="number"
              min={1}
              max={100}
              value={draftDue}
              onChange={e => setDraftDue(Number(e.target.value))}
              className="px-3 py-2 rounded-lg text-sm border outline-none"
              style={inputStyle}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('home.translatePerDay')}</span>
            <input
              type="number"
              min={1}
              max={100}
              value={draftTranslations}
              onChange={e => setDraftTranslations(Number(e.target.value))}
              className="px-3 py-2 rounded-lg text-sm border outline-none"
              style={inputStyle}
            />
          </label>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <GoalRow
            label={t('home.dueCards')}
            hint={dueCount > 0 ? `(due: ${dueCount})` : '(due: 0)'}
            current={dueReviewedToday}
            target={goalDue}
            pct={duePctDisplay}
          />
          <GoalRow label={t('home.reviewWords')} current={wordsToday} target={goalWords} pct={wordsPct} />
          <GoalRow label={t('home.translate')} current={translationsToday} target={goalTranslations} pct={translationsPct} />
        </div>
      )}

      {allDone && !editing && (
        <p
          className="text-xs font-semibold mt-4 flex items-center gap-1.5"
          style={{ color: 'var(--color-accent)' }}
        >
          <Check size={14} />
          {t('home.goalDone')}
        </p>
      )}
    </section>
  )
}
