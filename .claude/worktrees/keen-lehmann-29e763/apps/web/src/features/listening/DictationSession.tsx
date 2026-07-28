import { useState, useEffect, useRef } from 'react'
import { X, Play, RotateCcw, Volume2 } from 'lucide-react'
import { db, lessonRepo } from '@ryan/db'
import { nextSrs } from '@ryan/core'
import { useListeningStore } from './listeningStore'
import {
  parseSentences, compareWords, accuracy, ratingFromAccuracy,
  type LessonSentence,
} from './types'
import { speak, stop, playSlow, checkTtsHealth } from './tts'

type Phase = 'listen' | 'type' | 'result'

interface WordResult { word: string; correct: boolean }

export default function DictationSession() {
  const { activeLessonId, studying, stopStudy } = useListeningStore()
  if (!activeLessonId || !studying) return null

  return <SessionInner lessonId={activeLessonId} onClose={stopStudy} />
}

function SessionInner({ lessonId, onClose }: { lessonId: string; onClose: () => void }) {
  const [queue, setQueue] = useState<LessonSentence[]>([])
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('listen')
  const [input, setInput] = useState('')
  const [comparison, setComparison] = useState<WordResult[]>([])
  const [pct, setPct] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [localTtsReady, setLocalTtsReady] = useState<boolean | null>(null)
  const [stats, setStats] = useState({ correct: 0, wrong: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadQueue() }, [lessonId])
  useEffect(() => { void checkTtsHealth().then(setLocalTtsReady) }, [])
  useEffect(() => {
    if (phase === 'type') setTimeout(() => inputRef.current?.focus(), 100)
  }, [phase])

  async function loadQueue() {
    const lesson = await db.lessons.get(lessonId)
    if (!lesson) return
    const sentences = parseSentences(lesson.sentences)
    // Due first, then new — if nothing due, show all
    const due = sentences.filter(s => s.dueAt <= Date.now())
    setQueue(due.length > 0 ? due : sentences)
    setLoaded(true)
  }

  async function playNormal() {
    if (!queue[idx]) return
    setPlaying(true)
    try { await speak(queue[idx].text, 0.85) } finally { setPlaying(false) }
  }

  async function handlePlaySlow() {
    if (!queue[idx]) return
    setPlaying(true)
    try { await playSlow(queue[idx].text) } finally { setPlaying(false) }
  }

  function check() {
    const target = queue[idx].text
    const result = compareWords(input, target)
    const acc = accuracy(result)
    setComparison(result)
    setPct(acc)
    setPhase('result')
    if (acc >= 70) setStats(s => ({ ...s, correct: s.correct + 1 }))
    else setStats(s => ({ ...s, wrong: s.wrong + 1 }))
  }

  async function next() {
    // Update SRS for this sentence
    const sentence = queue[idx]
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

    // Advance
    stop()
    setInput('')
    setComparison([])
    setPct(0)
    setPhase('listen')
    setIdx(i => i + 1)
  }

  if (!loaded) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
      </div>
    )
  }

  // Done screen
  if (idx >= queue.length) {
    const total = stats.correct + stats.wrong
    const scorePct = total > 0 ? Math.round((stats.correct / total) * 100) : 0
    return (
      <div className="absolute inset-0 z-40 flex flex-col" style={{ background: 'var(--bg-primary)' }}>
        <Header onClose={onClose} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">{scorePct >= 80 ? '🏆' : scorePct >= 50 ? '👍' : '💪'}</div>
            <h3 className="text-xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
              Phiên luyện hoàn thành!
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Stat label="Đúng" value={stats.correct} color="#22c55e" />
              <Stat label="Cần cải thiện" value={stats.wrong} color="#f97316" />
            </div>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Đã luyện {total} câu · {scorePct}% đạt yêu cầu
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-white text-sm font-medium"
              style={{ background: 'var(--color-primary)' }}
            >
              Xong
            </button>
          </div>
        </div>
      </div>
    )
  }

  const current = queue[idx]
  const progress = (idx / queue.length) * 100

  return (
    <div className="absolute inset-0 z-40 flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Header onClose={onClose} />

      <div className="flex-1 overflow-y-auto flex flex-col items-center pt-8 px-4 pb-8">
        <div className="w-full max-w-xl">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: 'var(--color-primary)' }}
              />
            </div>
            <span className="text-xs shrink-0 tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {idx + 1}/{queue.length}
            </span>
          </div>

          {/* Main card */}
          <div
            className="rounded-2xl p-8 mb-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <p className="text-xs uppercase tracking-wide mb-2 text-center" style={{ color: 'var(--text-muted)' }}>
              Nghe và gõ lại câu bạn nghe được
            </p>
            {localTtsReady === false && (
              <p className="text-xs mb-5 text-center" style={{ color: 'var(--color-accent)' }}>
                TTS local chưa sẵn sàng — dùng giọng trình duyệt (fallback tạm)
              </p>
            )}
            {localTtsReady !== false && <div className="mb-5" />}

            {/* Play buttons */}
            <div className="flex justify-center gap-3 mb-6">
              <button
                onClick={playNormal}
                disabled={playing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60 transition-opacity"
                style={{ background: 'var(--color-primary)' }}
              >
                <Volume2 size={16} />
                {playing ? 'Đang phát...' : 'Nghe câu'}
              </button>
              <button
                onClick={handlePlaySlow}
                disabled={playing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 transition-opacity"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <RotateCcw size={14} />
                Chậm hơn
              </button>
            </div>

            {/* Result display */}
            {phase === 'result' ? (
              <div className="text-center">
                {/* Accuracy badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-semibold"
                  style={{ background: pct >= 70 ? '#22c55e22' : '#f9731622', color: pct >= 70 ? '#22c55e' : '#f97316' }}>
                  {pct}% chính xác
                </div>

                {/* Color-coded words */}
                <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                  {comparison.map((w, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md text-sm font-medium"
                      style={{
                        background: w.correct ? '#22c55e22' : '#ef444422',
                        color: w.correct ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {w.word}
                    </span>
                  ))}
                </div>

                {/* Show correct sentence */}
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Đáp án:</strong> {current.text}
                </p>
              </div>
            ) : (
              <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                {phase === 'listen' ? 'Nhấn "Nghe câu" rồi gõ những gì bạn nghe được bên dưới' : ''}
              </p>
            )}
          </div>

          {/* Input area */}
          <div className="flex flex-col gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (phase === 'result') next()
                  else if (input.trim()) check()
                }
              }}
              disabled={phase === 'result'}
              placeholder="Gõ câu bạn vừa nghe..."
              onClick={() => phase === 'listen' && setPhase('type')}
              className="w-full px-4 py-3.5 rounded-xl text-sm border-2 outline-none transition-colors"
              style={{
                background: 'var(--bg-card)',
                borderColor: phase === 'result'
                  ? (pct >= 70 ? '#22c55e' : '#f97316')
                  : 'var(--color-primary)',
                color: 'var(--text-primary)',
              }}
            />

            {phase !== 'result' ? (
              <button
                onClick={check}
                disabled={!input.trim()}
                className="w-full py-3 rounded-xl text-white font-medium text-sm disabled:opacity-50 transition-opacity"
                style={{ background: 'var(--color-primary)' }}
              >
                Kiểm tra
              </button>
            ) : (
              <button
                onClick={next}
                className="w-full py-3 rounded-xl text-white font-medium text-sm"
                style={{ background: 'var(--color-primary)' }}
              >
                {idx === queue.length - 1 ? 'Xem kết quả' : 'Tiếp theo →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="flex items-center gap-3 px-6 py-3.5 border-b shrink-0"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
        style={{ color: 'var(--text-muted)' }}
      >
        <X size={18} />
      </button>
      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Luyện nghe — Dictation</span>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-secondary)' }}>
      <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  )
}
