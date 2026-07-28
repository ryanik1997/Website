import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Eye, EyeOff, Check, Sparkles, ArrowRight, Volume2 } from 'lucide-react'
import { db, translationRepo } from '@ryan/db'
import type { TranslationSentence } from '@ryan/db'
import { useTranslationStore } from './translationStore'
import {
  applyPracticeRating,
  compareTranslation,
  DIFFICULTY_LABELS,
  isDue,
  type PracticeRating,
  type TranslationCompareResult,
} from './types'
import {
  getChipUnlockStates,
  maskChipLabel,
  parseTranslationChips,
  type TranslationChip,
} from './translationChips'
import { speakPhrase } from '../vocab/study/speakPhrase'
import './translationPractice.css'

type Phase = 'translate' | 'result'

export default function PracticeSession() {
  const { activeSetId, practicing, practiceSentenceId, stopPractice } = useTranslationStore()
  if (!activeSetId || !practicing) return null
  return (
    <SessionInner
      key={`${activeSetId}-${practiceSentenceId ?? 'all'}`}
      setId={activeSetId}
      sentenceId={practiceSentenceId}
      onClose={stopPractice}
    />
  )
}

function SessionInner({
  setId, sentenceId, onClose,
}: {
  setId: string
  sentenceId: string | null
  onClose: () => void
}) {
  const [queue, setQueue] = useState<TranslationSentence[]>([])
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('translate')
  const [input, setInput] = useState('')
  const [showAllChips, setShowAllChips] = useState(false)
  const [result, setResult] = useState<TranslationCompareResult | null>(null)
  const [rated, setRated] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [stats, setStats] = useState({ totalAcc: 0, count: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { void loadQueue() }, [setId, sentenceId])
  useEffect(() => {
    if (phase === 'translate') setTimeout(() => textareaRef.current?.focus(), 100)
  }, [phase, idx])

  async function loadQueue() {
    const set = await db.translationSets.get(setId)
    if (!set) return
    if (sentenceId) {
      const picked = set.sentences.find(s => s.id === sentenceId)
      setQueue(picked ? [picked] : [])
    } else {
      const due = set.sentences.filter(isDue)
      setQueue(due.length > 0 ? due : set.sentences)
    }
    setLoaded(true)
  }

  async function check() {
    const current = queue[idx]
    if (!current || !input.trim()) return
    const cmp = compareTranslation(input, current.en)
    setResult(cmp)
    setPhase('result')
    setStats(s => ({ totalAcc: s.totalAcc + cmp.accuracy, count: s.count + 1 }))
    if (!current.srsState?.translatedAt) {
      await translationRepo.markTranslated(setId, current.id)
      setQueue(q => q.map(s =>
        s.id === current.id
          ? { ...s, srsState: { ...(s.srsState ?? { ease: 2.5, interval: 0, dueAt: Date.now(), reps: 0 }), translatedAt: Date.now() } }
          : s,
      ))
    }
  }

  async function rate(rating: PracticeRating) {
    const current = queue[idx]
    if (!current) return
    const srsState = applyPracticeRating(current.srsState, rating)
    await translationRepo.updateSrsState(setId, current.id, srsState)
    await db.reviewLog.add({
      cardId: current.id,
      rating: rating === 'easy' ? 4 : rating === 'ok' ? 3 : 1,
      mode: 'translation',
      at: Date.now(),
    })
    setRated(true)
  }

  function next() {
    setInput('')
    setResult(null)
    setRated(false)
    setShowAllChips(false)
    setPhase('translate')
    setIdx(i => i + 1)
  }

  const current = queue[idx]
  const chips = useMemo(
    () => (current ? parseTranslationChips(current.en) : []),
    [current],
  )
  const unlockStates = getChipUnlockStates(input, chips)
  const allChipsUnlocked = chips.length > 0 && unlockStates.every(Boolean)

  if (!loaded) {
    return (
      <div className="tp-shell absolute inset-0 z-40 flex items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải…</p>
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="tp-shell absolute inset-0 z-40 flex flex-col">
        <Header onClose={onClose} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Bộ câu này chưa có câu nào.</p>
            <button type="button" onClick={onClose} className="tp-btn-primary" style={{ flex: 'none', paddingInline: '1.5rem' }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (idx >= queue.length) {
    const avgAcc = stats.count > 0 ? Math.round(stats.totalAcc / stats.count) : 0
    return (
      <div className="tp-shell absolute inset-0 z-40 flex flex-col">
        <Header onClose={onClose} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">{avgAcc >= 80 ? '🏆' : avgAcc >= 50 ? '👍' : '💪'}</div>
            <h3 className="text-xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
              Phiên luyện hoàn thành!
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Stat label="Số câu" value={stats.count} />
              <Stat label="Accuracy" value={`${avgAcc}%`} highlight />
            </div>
            <button type="button" onClick={onClose} className="tp-next-btn">Xong</button>
          </div>
        </div>
      </div>
    )
  }

  const progress = ((idx + (phase === 'result' ? 1 : 0)) / queue.length) * 100

  return (
    <div className="tp-shell absolute inset-0 z-40 flex flex-col">
      <Header onClose={onClose} progress={progress} index={idx + 1} total={queue.length} />

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto w-full max-w-2xl flex flex-col gap-5">
          <div className="tp-card p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="tp-badge">VN</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>→</span>
              <span className="tp-badge tp-badge--active">English</span>
              <span className="tp-badge">{DIFFICULTY_LABELS[current.difficulty]}</span>
            </div>

            <p className="tp-prompt mb-8">{current.vi}</p>

            {chips.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                  <span className="tp-section-label">Câu mẫu — nhớ đúng để mở từ</span>
                  <span className="tp-strict-pill flex items-center gap-1.5">
                    <span className="tp-meta-dot" />
                    Strict hints: on
                  </span>
                  <span className="tp-strict-pill">{chips.length} chip</span>
                </div>

                <ChipBar
                  chips={chips}
                  unlockStates={unlockStates}
                  revealAll={showAllChips || phase === 'result'}
                  onToggleReveal={() => setShowAllChips(v => !v)}
                />
              </div>
            )}

            <div>
              <p className="tp-section-label mb-2">Bài dịch của em</p>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && phase !== 'result') {
                    e.preventDefault()
                    void check()
                  }
                }}
                disabled={phase === 'result'}
                placeholder="Gõ bản dịch tiếng Anh của bạn…"
                rows={3}
                className="tp-input"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              {phase !== 'result' ? (
                <>
                  <button
                    type="button"
                    onClick={() => void check()}
                    disabled={!input.trim()}
                    className="tp-btn-primary"
                  >
                    <Check size={16} />
                    Kiểm tra / Nộp (Enter)
                  </button>
                  <button type="button" className="tp-btn-secondary" title="Sắp ra mắt">
                    <Sparkles size={14} />
                    Chấm AI riêng
                  </button>
                </>
              ) : rated ? (
                <button type="button" onClick={next} className="tp-next-btn">
                  <ArrowRight size={16} />
                  {idx === queue.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
                </button>
              ) : null}
            </div>
          </div>

          {phase === 'result' && result && (
            <SmartSegmentPanel
              result={result}
              allChipsUnlocked={allChipsUnlocked}
              hint={current.hint}
              rated={rated}
              onRate={r => void rate(r)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function ChipBar({
  chips, unlockStates, revealAll, onToggleReveal,
}: {
  chips: TranslationChip[]
  unlockStates: boolean[]
  revealAll: boolean
  onToggleReveal: () => void
}) {
  return (
    <div className="tp-chip-row">
      {chips.map((chip, i) => {
        const unlocked = revealAll || unlockStates[i]
        return (
          <span
            key={`${chip.text}-${i}`}
            className={`tp-chip ${unlocked ? 'tp-chip--unlocked' : 'tp-chip--locked'}`}
          >
            {unlocked ? (
              <>
                <span>{chip.text}</span>
                <button
                  type="button"
                  className="tp-chip-speak"
                  title="Nghe phát âm"
                  onClick={() => void speakPhrase(chip.text)}
                >
                  <Volume2 size={13} />
                </button>
              </>
            ) : (
              <span>{maskChipLabel(chip.text)}</span>
            )}
          </span>
        )
      })}
      <button type="button" className="tp-show-all" onClick={onToggleReveal}>
        {revealAll ? <EyeOff size={13} /> : <Eye size={13} />}
        {revealAll ? 'Ẩn gợi ý' : 'Hiện tất cả'}
      </button>
    </div>
  )
}

function SmartSegmentPanel({
  result, allChipsUnlocked, hint, rated, onRate,
}: {
  result: TranslationCompareResult
  allChipsUnlocked: boolean
  hint?: string
  rated: boolean
  onRate: (r: PracticeRating) => void
}) {
  const perfect = result.accuracy >= 100
  const good = result.accuracy >= 70

  return (
    <div className="tp-segment-panel">
      <div className="tp-segment-head">Smart Segment</div>
      <div className="p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-start gap-4">
          <div className="tp-score-box">
            <span className="tp-score-value">{result.accuracy}%</span>
            <span className="tp-score-label">Local reference check</span>
          </div>
          <div className="flex-1 min-w-[12rem]">
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {perfect
                ? 'Đúng theo bản tham chiếu'
                : good
                  ? 'Gần đúng — còn vài chỗ cần chỉnh'
                  : 'Chưa khớp — xem lại các cụm thiếu'}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {allChipsUnlocked
                ? 'Tất cả các cụm từ đã được mở xanh. Bạn có thể bấm Chấm AI nếu muốn feedback sâu hơn.'
                : 'Gõ đúng từng cụm trong bài dịch để mở chip xanh trước khi nộp.'}
            </p>
            {hint && (
              <p
                className="text-xs mt-3 px-3 py-2 rounded-lg"
                style={{
                  color: 'var(--text-muted)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                Gợi ý: {hint}
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs mb-2 tp-section-label">Đáp án chuẩn</p>
          <div className="flex flex-wrap gap-1.5">
            {result.targetHighlights.map((h, i) => (
              <span
                key={i}
                className="tp-chip"
                style={{
                  background: h.status === 'correct'
                    ? 'color-mix(in srgb, var(--color-primary) 14%, var(--bg-secondary))'
                    : 'color-mix(in srgb, var(--color-accent) 18%, var(--bg-secondary))',
                  color: h.status === 'correct' ? 'var(--color-primary)' : 'var(--color-accent)',
                  borderColor: h.status === 'correct'
                    ? 'color-mix(in srgb, var(--color-primary) 35%, var(--border-color))'
                    : 'color-mix(in srgb, var(--color-accent) 35%, var(--border-color))',
                }}
              >
                {h.word}
              </span>
            ))}
          </div>
        </div>

        {result.extraWords.length > 0 && (
          <div>
            <p className="text-xs mb-2 tp-section-label">Từ thừa</p>
            <div className="flex flex-wrap gap-1.5">
              {result.extraWords.map((w, i) => (
                <span key={i} className="tp-chip tp-chip--locked">{w}</span>
              ))}
            </div>
          </div>
        )}

        {!rated && (
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-xs mb-3 text-center" style={{ color: 'var(--text-muted)' }}>
              Câu này với bạn thế nào?
            </p>
            <div className="flex gap-2">
              {([
                { id: 'easy' as const, label: 'Dễ' },
                { id: 'ok' as const, label: 'Ổn' },
                { id: 'hard' as const, label: 'Khó' },
              ]).map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onRate(r.id)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Header({
  onClose, progress, index, total,
}: {
  onClose: () => void
  progress?: number
  index?: number
  total?: number
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 md:px-6 py-3.5 border-b shrink-0"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
        style={{ color: 'var(--text-muted)' }}
      >
        <X size={18} />
      </button>
      <span className="text-sm font-medium shrink-0" style={{ color: 'var(--text-primary)' }}>
        Luyện dịch câu
      </span>
      {progress != null && total != null && (
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: 'var(--color-primary)' }}
            />
          </div>
          <span className="text-xs shrink-0 tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {index}/{total}
          </span>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-secondary)' }}>
      <div
        className="text-3xl font-bold mb-1"
        style={{ color: highlight ? 'var(--color-primary)' : 'var(--text-primary)' }}
      >
        {value}
      </div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  )
}