import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Plus, SkipForward } from 'lucide-react'
import { db, lessonRepo } from '@ryan/db'
import { nextSrs } from '@ryan/core'
import {
  parseSentences, compareWords, accuracy, ratingFromAccuracy,
  type LessonSentence,
} from './types'
import { useListeningPlayback } from './useListeningPlayback'
import BlankInputMode, { type BlankInputHandle } from './BlankInputMode'
import WordDiffPanel from './WordDiffPanel'
import ListeningAudioBar from './ListeningAudioBar'
import ListeningFireworks from './ListeningFireworks'
import { celebrateCorrectAnswer } from './listeningCelebrate'
import { getClozeEligibleCount, splitWords } from './practiceUtils'

type PracticeMode = 'boxes' | 'type' | 'cloze'
type Phase = 'listen' | 'result'

interface Props {
  lessonId: string
  sentenceIndex: number
  total: number
  sentence: LessonSentence
  onIndexChange: (idx: number) => void
  onSentenceComplete: (sentenceId: string) => void
  showResultImmediately: boolean
  showFullAnswer: boolean
}

export default function ListeningPracticeTab({
  lessonId,
  sentenceIndex,
  total,
  sentence,
  onIndexChange,
  onSentenceComplete,
  showResultImmediately,
  showFullAnswer,
}: Props) {
  const [mode, setMode] = useState<PracticeMode>('type')
  const [phase, setPhase] = useState<Phase>('listen')
  const [input, setInput] = useState('')
  const [comparison, setComparison] = useState<{ word: string; correct: boolean }[]>([])
  const [pct, setPct] = useState(0)
  const [clozeCount, setClozeCount] = useState(0)
  const [blankCanCheck, setBlankCanCheck] = useState(false)
  const [celebrateBurst, setCelebrateBurst] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const blankRef = useRef<BlankInputHandle>(null)

  const {
    playing,
    buffering,
    progressPct,
    timeLabel,
    speed,
    toggleSpeed,
    playTts,
    seekToPct,
    stopPlayback,
  } = useListeningPlayback()

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

  useEffect(() => {
    setPhase('listen')
    setInput('')
    setBlankCanCheck(false)
    setComparison([])
    setPct(0)
    stopRef.current()
  }, [sentence.id, sentenceIndex])

  useEffect(() => {
    setBlankCanCheck(false)
  }, [blankResetKey])

  useEffect(() => {
    if (phase === 'listen' && mode === 'type') {
      const t = window.setTimeout(() => inputRef.current?.focus(), 80)
      return () => window.clearTimeout(t)
    }
  }, [phase, sentenceIndex, mode])

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
      celebrateCorrectAnswer()
      setCelebrateBurst(b => b + 1)
    }
    if (showResultImmediately) onSentenceComplete(sentence.id)
  }, [mode, input, sentence.text, sentence.id, showResultImmediately, onSentenceComplete])

  const syncBlankCanCheck = useCallback(() => {
    const has = blankRef.current?.hasContent() ?? false
    setBlankCanCheck(prev => (prev === has ? prev : has))
  }, [])

  useEffect(() => {
    if (mode !== 'boxes' && mode !== 'cloze') return
    const id = window.setInterval(syncBlankCanCheck, 200)
    return () => window.clearInterval(id)
  }, [mode, blankResetKey, syncBlankCanCheck])

  function playAudio() {
    void playTts(sentence.text, speed)
  }

  async function saveSrsAndAdvance(skip = false) {
    if (!skip && phase === 'result') {
      const rating = ratingFromAccuracy(pct)
      const nextState = nextSrs(sentence, rating)
      const lesson = await db.lessons.get(lessonId)
      if (lesson) {
        const sentences = parseSentences(lesson.sentences)
        const sIdx = sentences.findIndex(s => s.id === sentence.id)
        if (sIdx !== -1) {
          sentences[sIdx] = { ...sentences[sIdx], ...nextState }
          await lessonRepo.update(lessonId, { sentences })
        }
      }
      onSentenceComplete(sentence.id)
    }

    stopPlayback()
    if (sentenceIndex < total - 1) {
      onIndexChange(sentenceIndex + 1)
    }
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

  return (
    <div
      className="rounded-2xl p-5 sm:p-6"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      {celebrateBurst > 0 && (
        <ListeningFireworks
          burstId={celebrateBurst}
          onDone={() => setCelebrateBurst(0)}
        />
      )}
      <ListeningAudioBar
        sentenceIndex={sentenceIndex}
        total={total}
        playing={playing}
        buffering={buffering}
        progressPct={progressPct}
        timeLabel={timeLabel}
        speed={speed}
        onIndexChange={onIndexChange}
        onPlay={playAudio}
        onSeek={seekToPct}
        onToggleSpeed={toggleSpeed}
      />

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-xs font-bold uppercase tracking-wide mr-1" style={{ color: 'var(--text-muted)' }}>
          Chế độ:
        </span>
        {([
          { id: 'boxes' as const, label: 'Ô chữ' },
          { id: 'type' as const, label: 'Tự gõ' },
          { id: 'cloze' as const, label: 'Cloze' },
        ]).map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
            style={{
              background: mode === m.id ? 'var(--text-primary)' : 'var(--bg-secondary)',
              color: mode === m.id ? 'var(--bg-primary)' : 'var(--text-muted)',
            }}
          >
            {m.label}
          </button>
        ))}

        {mode === 'cloze' && clozeMax > 0 && (
          <div
            className="flex items-center gap-1.5 ml-auto px-2 py-1 rounded-lg"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Ẩn:
            </span>
            <button
              type="button"
              onClick={decClozeCount}
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ color: 'var(--text-primary)' }}
            >
              <Minus size={12} />
            </button>
            <span className="text-xs font-bold min-w-[3.5rem] text-center" style={{ color: 'var(--text-primary)' }}>
              {clozeLabel}
            </span>
            <button
              type="button"
              onClick={incClozeCount}
              className="w-6 h-6 rounded flex items-center justify-center"
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
            name="lsn-type-input"
            className="w-full px-4 py-3 rounded-xl text-sm border-2 outline-none resize-none mb-4"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: phase === 'result'
                ? (pct >= 70 ? 'var(--color-primary)' : 'var(--color-accent)')
                : 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (canCheck) check() }
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
            className="text-sm font-semibold mb-2"
            style={{ color: pct >= 70 ? 'var(--color-primary)' : 'var(--color-accent)' }}
          >
            {pct}% chính xác
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {comparison.map((w, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-md text-xs font-medium"
                style={{
                  background: w.correct
                    ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)'
                    : 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
                  color: w.correct ? 'var(--color-primary)' : 'var(--color-accent)',
                }}
              >
                {w.word}
              </span>
            ))}
          </div>
          {showFullAnswer && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Đáp án:</strong> {sentence.text}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          type="button"
          onClick={() => void saveSrsAndAdvance(true)}
          className="px-4 py-2 rounded-xl text-sm font-semibold uppercase tracking-wide"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
        >
          Bỏ qua
        </button>
        {phase !== 'result' ? (
          <button
            type="button"
            onClick={check}
            disabled={!canCheck}
            className="px-5 py-2 rounded-xl text-sm font-semibold uppercase tracking-wide disabled:opacity-40"
            style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
          >
            Kiểm tra
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void saveSrsAndAdvance(false)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold uppercase tracking-wide"
            style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
          >
            Câu tiếp theo
            <SkipForward size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 justify-center">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onIndexChange(i)}
            className="w-2 h-2 rounded-full transition-transform"
            style={{
              background: i === sentenceIndex ? 'var(--color-primary)' : 'var(--border-color)',
              transform: i === sentenceIndex ? 'scale(1.25)' : undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}