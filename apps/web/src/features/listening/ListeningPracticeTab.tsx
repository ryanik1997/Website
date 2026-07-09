import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Minus, Plus, SkipForward } from 'lucide-react'
import { db, lessonRepo } from '@ryan/db'
import { nextSrs, type Plan } from '@ryan/core'
import {
  accuracy,
  compareWords,
  parseSentences,
  ratingFromAccuracy,
  type LessonSentence,
} from './types'
import { useListeningPlayback } from './useListeningPlayback'
import BlankInputMode, { type BlankInputHandle } from './BlankInputMode'
import ListeningFireworks from './ListeningFireworks'
import ListeningAudioBar from './ListeningAudioBar'
import WordDiffPanel from './WordDiffPanel'
import { getClozeEligibleCount, splitWords } from './practiceUtils'
import { useStudyAnswerFeedback } from '../vocab/study/useStudyAnswerFeedback'
import { listeningPracticeMaxPlays, playsLeftLabel } from './listeningPlayLimits'
import { splitIntoListenChunks } from './wordTimings'

type PracticeMode = 'boxes' | 'type' | 'cloze'
type Phase = 'listen' | 'result'
type PracticeDebugMode =
  | 'all'
  | 'audio-only'
  | 'input-only'
  | 'actions-only'
  | 'dots-only'
  | 'no-audio'
  | 'no-input'
  | 'no-actions'
  | 'no-dots'

interface Props {
  lessonId: string
  sentenceIndex: number
  total: number
  sentence: LessonSentence
  onIndexChange: (idx: number) => void
  onSentenceComplete: (sentenceId: string) => void
  showResultImmediately: boolean
  showFullAnswer: boolean
  debugMode?: PracticeDebugMode
}

const AUTO_NEXT_DELAY_MS = 5000

export default function ListeningPracticeTab({
  lessonId,
  sentenceIndex,
  total,
  sentence,
  onIndexChange,
  onSentenceComplete,
  showResultImmediately,
  showFullAnswer,
  debugMode = 'all',
}: Props) {
  const [mode, setMode] = useState<PracticeMode>('type')
  const [phase, setPhase] = useState<Phase>('listen')
  const [input, setInput] = useState('')
  const [comparison, setComparison] = useState<{ word: string; correct: boolean }[]>([])
  const [pct, setPct] = useState(0)
  const [clozeCount, setClozeCount] = useState(0)
  const [blankCanCheck, setBlankCanCheck] = useState(false)
  const [autoNextLeft, setAutoNextLeft] = useState<number | null>(null)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const blankRef = useRef<BlankInputHandle>(null)
  const autoAdvanceTimerRef = useRef<number | null>(null)
  const autoAdvanceTickRef = useRef<number | null>(null)
  const hasAutoAdvancedRef = useRef(false)

  const { burstId, onCorrect, clearFireworks } = useStudyAnswerFeedback()
  const plan = useLiveQuery(
    () => db.settings.get('plan').then(s => (s?.value as Plan) ?? 'free'),
    [],
  ) ?? 'free'
  const maxPlays = listeningPracticeMaxPlays(plan)
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({})
  const [chunkIdx, setChunkIdx] = useState(0)
  const [hint, setHint] = useState<string | null>(null)

  const {
    playing,
    buffering,
    progressPct,
    timeLabel,
    speed,
    toggleSpeed,
    setPlaybackSpeed,
    playTts,
    seekToPct,
    stopPlayback,
  } = useListeningPlayback()

  const usedPlays = playCounts[sentence.id] ?? 0
  const playBlocked = maxPlays != null && usedPlays >= maxPlays
  const playsLabel = playsLeftLabel(usedPlays, maxPlays)
  const chunks = useMemo(() => splitIntoListenChunks(sentence.text), [sentence.text])

  const clozeMax = useMemo(
    () => getClozeEligibleCount(splitWords(sentence.text)),
    [sentence.text],
  )

  const clozeLabel = clozeCount === 0 || clozeCount >= clozeMax
    ? 'Tất cả'
    : `${clozeCount} từ`

  const blankResetKey = `${sentence.id}-${sentenceIndex}-${mode}-${clozeCount}`

  const stopRef = useRef(stopPlayback)
  stopRef.current = stopPlayback

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current != null) {
      window.clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }
    if (autoAdvanceTickRef.current != null) {
      window.clearInterval(autoAdvanceTickRef.current)
      autoAdvanceTickRef.current = null
    }
    setAutoNextLeft(null)
    hasAutoAdvancedRef.current = false
  }, [])

  useEffect(() => {
    setPhase('listen')
    setInput('')
    setBlankCanCheck(false)
    setComparison([])
    setPct(0)
    setChunkIdx(0)
    setHint(null)
    clearAutoAdvance()
    stopRef.current()
  }, [sentence.id, sentenceIndex, clearAutoAdvance])

  useEffect(() => {
    setBlankCanCheck(false)
  }, [blankResetKey])

  useEffect(() => {
    if (phase === 'listen' && mode === 'type') {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 80)
      return () => window.clearTimeout(timer)
    }
  }, [phase, sentenceIndex, mode])

  useEffect(() => {
    return () => clearAutoAdvance()
  }, [clearAutoAdvance])

  const syncBlankCanCheck = useCallback(() => {
    const has = blankRef.current?.hasContent() ?? false
    setBlankCanCheck(prev => (prev === has ? prev : has))
  }, [])

  useEffect(() => {
    if (mode !== 'boxes' && mode !== 'cloze') return
    const id = window.setInterval(syncBlankCanCheck, 200)
    return () => window.clearInterval(id)
  }, [mode, blankResetKey, syncBlankCanCheck])

  const saveSrsAndAdvance = useCallback(async (skip = false) => {
    if (!skip && phase === 'result') {
      const rating = ratingFromAccuracy(pct)
      const nextState = nextSrs(sentence, rating)
      const lesson = await db.lessons.get(lessonId)

      if (lesson) {
        const sentences = parseSentences(lesson.sentences)
        const sentenceIdx = sentences.findIndex(item => item.id === sentence.id)
        if (sentenceIdx !== -1) {
          sentences[sentenceIdx] = { ...sentences[sentenceIdx], ...nextState }
          await lessonRepo.update(lessonId, { sentences })
        }
      }

      onSentenceComplete(sentence.id)
    }

    clearAutoAdvance()
    stopPlayback()

    if (sentenceIndex < total - 1) {
      onIndexChange(sentenceIndex + 1)
    }
  }, [
    clearAutoAdvance,
    lessonId,
    onIndexChange,
    onSentenceComplete,
    pct,
    phase,
    sentence,
    sentenceIndex,
    stopPlayback,
    total,
  ])

  const scheduleAutoAdvance = useCallback(() => {
    clearAutoAdvance()
    hasAutoAdvancedRef.current = false
    setAutoNextLeft(AUTO_NEXT_DELAY_MS / 1000)

    autoAdvanceTickRef.current = window.setInterval(() => {
      setAutoNextLeft(prev => {
        if (prev == null || prev <= 1) return 0
        return prev - 1
      })
    }, 1000)

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      if (hasAutoAdvancedRef.current) return
      hasAutoAdvancedRef.current = true
      void saveSrsAndAdvance(false)
    }, AUTO_NEXT_DELAY_MS)
  }, [clearAutoAdvance, saveSrsAndAdvance])

  const check = useCallback(() => {
    const answer = mode === 'type'
      ? input
      : (blankRef.current?.collectAnswer() ?? '')
    const result = compareWords(answer, sentence.text)
    const acc = accuracy(result)

    setComparison(result)
    setPct(acc)
    setPhase('result')

    if (acc === 100) {
      onCorrect()
      if (showResultImmediately) onSentenceComplete(sentence.id)
      scheduleAutoAdvance()
    } else {
      clearAutoAdvance()
    }
  }, [
    mode,
    input,
    sentence.text,
    sentence.id,
    onCorrect,
    showResultImmediately,
    onSentenceComplete,
    scheduleAutoAdvance,
    clearAutoAdvance,
  ])

  function recordPlay() {
    setPlayCounts(prev => ({ ...prev, [sentence.id]: (prev[sentence.id] ?? 0) + 1 }))
  }

  function playAudio() {
    if (playBlocked) {
      setHint('Hết lượt nghe câu này. Thử 0.5x / chunk lần sau, hoặc nâng Pro không giới hạn.')
      return
    }
    recordPlay()
    setHint(null)
    if (maxPlays != null && usedPlays + 1 >= maxPlays - 1) {
      setHint('Gần hết lượt — nên nghe chậm (0.5x) hoặc «Nghe chunk».')
    }
    void playTts(sentence.text, speed)
  }

  function playChunk() {
    if (playBlocked) {
      setHint('Hết lượt nghe câu này.')
      return
    }
    if (!chunks.length) return
    recordPlay()
    const i = chunkIdx % chunks.length
    setChunkIdx(i + 1)
    setHint(`Chunk ${i + 1}/${chunks.length} · bấm lại để chunk tiếp`)
    void playTts(chunks[i], speed === 1 ? 0.75 : speed)
  }

  function incClozeCount() {
    if (clozeMax === 0) return
    if (clozeCount === 0 || clozeCount >= clozeMax) {
      setClozeCount(1)
    } else {
      const next = clozeCount + 1
      setClozeCount(next >= clozeMax ? 0 : next)
    }
  }

  function decClozeCount() {
    if (clozeMax === 0) return
    if (clozeCount === 0) {
      setClozeCount(Math.max(1, clozeMax - 1))
    } else {
      setClozeCount(Math.max(0, clozeCount - 1))
    }
  }

  const canCheck = mode === 'type' ? input.trim().length > 0 : blankCanCheck
  const inputsLocked = phase === 'result' && !showFullAnswer
  const isPerfect = pct === 100

  const showAudioBar = debugMode !== 'no-audio'
    && debugMode !== 'input-only'
    && debugMode !== 'actions-only'
    && debugMode !== 'dots-only'
  const showInputBlock = debugMode !== 'no-input'
    && debugMode !== 'audio-only'
    && debugMode !== 'actions-only'
    && debugMode !== 'dots-only'
  const showActions = debugMode !== 'no-actions'
    && debugMode !== 'audio-only'
    && debugMode !== 'input-only'
    && debugMode !== 'dots-only'
  const showDots = debugMode !== 'no-dots'
    && debugMode !== 'audio-only'
    && debugMode !== 'input-only'
    && debugMode !== 'actions-only'

  return (
    <div
      className="min-w-0 overflow-hidden rounded-2xl p-5 sm:p-6"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      {burstId > 0 && (
        <ListeningFireworks
          burstId={burstId}
          onDone={clearFireworks}
        />
      )}

      {showAudioBar && (
        <ListeningAudioBar
          sentenceIndex={sentenceIndex}
          total={total}
          playing={playing}
          buffering={buffering}
          progressPct={progressPct}
          timeLabel={timeLabel}
          speed={speed}
          playsLeftLabel={playsLabel}
          playBlocked={playBlocked}
          onIndexChange={onIndexChange}
          onPlay={playAudio}
          onSeek={seekToPct}
          onToggleSpeed={toggleSpeed}
          onSetSpeed={setPlaybackSpeed}
          onPlayChunk={playChunk}
        />
      )}

      {hint && (
        <p
          className="mb-4 text-xs leading-relaxed rounded-lg px-3 py-2"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 10%, var(--bg-secondary))',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }}
        >
          {hint}
        </p>
      )}

      {showInputBlock && (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Chế độ:
            </span>
            {([
              { id: 'boxes' as const, label: 'Ô chữ' },
              { id: 'type' as const, label: 'Tự gõ' },
              { id: 'cloze' as const, label: 'Cloze' },
            ]).map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
                style={{
                  background: mode === item.id ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  color: mode === item.id ? 'var(--bg-primary)' : 'var(--text-muted)',
                }}
              >
                {item.label}
              </button>
            ))}

            {mode === 'cloze' && clozeMax > 0 && (
              <div
                className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Ẩn:
                </span>
                <button
                  type="button"
                  onClick={decClozeCount}
                  className="flex h-6 w-6 items-center justify-center rounded"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Minus size={12} />
                </button>
                <span className="min-w-[3.5rem] text-center text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  {clozeLabel}
                </span>
                <button
                  type="button"
                  onClick={incClozeCount}
                  className="flex h-6 w-6 items-center justify-center rounded"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Plus size={12} />
                </button>
              </div>
            )}
          </div>

          {(mode === 'boxes' || mode === 'cloze') && (
            <BlankInputMode
              key={blankResetKey}
              ref={blankRef}
              sentenceText={sentence.text}
              mode={mode}
              clozeCount={clozeCount}
              locked={inputsLocked}
              checked={phase === 'result'}
              showLiveDiff={showResultImmediately && phase === 'listen'}
              onAllCorrect={
                showResultImmediately && phase === 'listen' ? check : undefined
              }
            />
          )}

          {mode === 'type' && (
            <>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={inputsLocked}
                placeholder="Gõ câu bạn nghe được..."
                rows={4}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                data-lt-active="false"
                name="lsn-type-input"
                className="mb-4 w-full resize-none overflow-hidden rounded-xl border-2 px-4 py-3 text-sm outline-none"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: phase === 'result'
                    ? (pct >= 70 ? 'var(--color-primary)' : 'var(--color-accent)')
                    : 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (canCheck) check()
                  }
                }}
              />
              {showResultImmediately && phase === 'listen' && (
                <WordDiffPanel input={input} correct={sentence.text} />
              )}
            </>
          )}

          {phase === 'result' && (
            <div className="mb-4">
              <p
                className="mb-2 text-sm font-semibold"
                style={{ color: pct >= 70 ? 'var(--color-primary)' : 'var(--color-accent)' }}
              >
                {pct}% chính xác
              </p>

              <div className="mb-2 flex flex-wrap gap-1.5">
                {comparison.map((word, index) => (
                  <span
                    key={index}
                    className="rounded-md px-2 py-1 text-xs font-medium"
                    style={{
                      background: word.correct
                        ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)'
                        : 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
                      color: word.correct ? 'var(--color-primary)' : 'var(--color-accent)',
                    }}
                  >
                    {word.word}
                  </span>
                ))}
              </div>

              {showFullAnswer && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Đáp án:</strong> {sentence.text}
                </p>
              )}

              {isPerfect && autoNextLeft != null && sentenceIndex < total - 1 && (
                <p className="mt-3 text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                  Đúng hoàn toàn. Tự chuyển câu tiếp theo sau {autoNextLeft}s.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {showActions && (
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void saveSrsAndAdvance(true)}
            className="rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-wide"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            Bỏ qua
          </button>

          {phase !== 'result' ? (
            <button
              type="button"
              onClick={check}
              disabled={!canCheck}
              className="rounded-xl px-5 py-2 text-sm font-semibold uppercase tracking-wide disabled:opacity-40"
              style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
            >
              Kiểm tra
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void saveSrsAndAdvance(false)}
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-semibold uppercase tracking-wide"
              style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
            >
              {sentenceIndex === total - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
              <SkipForward size={14} />
            </button>
          )}
        </div>
      )}

      {showDots && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {Array.from({ length: total }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onIndexChange(index)}
              className="h-2 w-2 rounded-full transition-transform"
              style={{
                background: index === sentenceIndex ? 'var(--color-primary)' : 'var(--border-color)',
                transform: index === sentenceIndex ? 'scale(1.25)' : undefined,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
