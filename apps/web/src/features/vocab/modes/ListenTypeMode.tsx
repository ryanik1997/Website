import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Volume2, Check, Lightbulb, SkipForward, Eye, ArrowRight,
  Headphones, CheckCircle2,
} from 'lucide-react'
import { nextSrs } from '@ryan/core'
import { db } from '@ryan/db'
import type { Card, Deck } from '@ryan/db'
import { speakPhrase, stopSpeaking, SPEECH_SPEEDS, type SpeechSpeed } from '../study/speakPhrase'
import { shuffle, isPhraseCorrect, hintPhrase } from '../study/studyUtils'
import StudyDoneActions from '../study/StudyDoneActions'
import { useStudyAnswerFeedback } from '../study/useStudyAnswerFeedback'
import StudyFireworks from '../../../components/StudyFireworks'
import { useVocabStore } from '../vocabStore'
import { filterCardsByUnitKind } from '../vocabUnitKind'

type Result = 'correct' | 'wrong' | 'skipped' | null
type DotState = 'pending' | 'current' | 'done' | 'wrong'

const SPEED_LABELS: Record<SpeechSpeed, string> = {
  slow: 'Chậm',
  normal: 'Bình thường',
  fast: 'Nhanh',
}

export default function ListenTypeMode({
  deckId,
  deck,
  onDone,
}: {
  deckId: string
  deck: Deck
  onDone: () => void
}) {
  const [cards, setCards] = useState<Card[]>([])
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Result>(null)
  const [revealed, setRevealed] = useState(false)
  const [hinted, setHinted] = useState(false)
  const [speed, setSpeed] = useState<SpeechSpeed>('normal')
  const [speaking, setSpeaking] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [attempted, setAttempted] = useState(0)
  const [dotStates, setDotStates] = useState<DotState[]>([])
  const [loaded, setLoaded] = useState(false)
  const [runId, setRunId] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const playedRef = useRef(false)
  const { burstId, onCorrect, onWrong, clearFireworks } = useStudyAnswerFeedback()

  const restart = useCallback(() => {
    stopSpeaking()
    setIdx(0)
    setInput('')
    setResult(null)
    setRevealed(false)
    setHinted(false)
    setCorrect(0)
    setWrong(0)
    setAttempted(0)
    setSpeaking(false)
    playedRef.current = false
    setDotStates([])
    setRunId(n => n + 1)
  }, [])

  const unitKind = useVocabStore(s => s.unitKind)

  const load = useCallback(async () => {
    const all = await db.cards.where('deckId').equals(deckId).toArray()
    const shuffled = shuffle(filterCardsByUnitKind(all, unitKind))
    setCards(shuffled)
    setIdx(0)
    setInput('')
    setResult(null)
    setRevealed(false)
    setHinted(false)
    setCorrect(0)
    setWrong(0)
    setAttempted(0)
    setDotStates(shuffled.map((_, i) => (i === 0 ? 'current' : 'pending')))
    setLoaded(true)
    playedRef.current = false
  }, [deckId, unitKind])

  useEffect(() => { void load() }, [load, runId])

  const playAudio = useCallback(() => {
    if (!cards[idx]) return
    speakPhrase(cards[idx].phrase, SPEECH_SPEEDS[speed], {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    })
  }, [cards, idx, speed])

  useEffect(() => {
    if (!loaded || !cards.length) return
    stopSpeaking()
    setSpeaking(false)
    if (!playedRef.current) {
      playedRef.current = true
      const t = setTimeout(playAudio, 400)
      return () => clearTimeout(t)
    }
    playAudio()
  }, [idx, loaded, cards.length, playAudio])

  useEffect(() => {
    if (loaded && result === null) inputRef.current?.focus()
  }, [idx, loaded, result])

  const applySrs = useCallback(async (card: Card, ok: boolean) => {
    const srs = await db.srs.get(card.id)
    if (!srs) return
    const rating = ok ? 3 : 1
    const next = nextSrs(srs, rating)
    await db.srs.put({ ...next, cardId: srs.cardId, deckId: srs.deckId, updatedAt: Date.now() })
    await db.reviewLog.add({ cardId: card.id, rating, mode: 'listen', at: Date.now() })
  }, [])

  const finishRound = useCallback(async (kind: Result, ok: boolean) => {
    if (result || !cards[idx]) return
    setResult(kind)
    setAttempted(a => a + 1)
    if (ok) {
      setCorrect(c => c + 1)
      onCorrect()
    } else {
      setWrong(w => w + 1)
      onWrong()
    }
    setDotStates(dots => dots.map((d, i) => {
      if (i !== idx) return d
      return ok ? 'done' : 'wrong'
    }))
    await applySrs(cards[idx], ok)
  }, [result, cards, idx, applySrs, onCorrect, onWrong])

  const submit = useCallback(() => {
    if (!input.trim() || result) return
    const ok = isPhraseCorrect(input, cards[idx].phrase)
    finishRound(ok ? 'correct' : 'wrong', ok)
  }, [input, result, cards, idx, finishRound])

  const skip = useCallback(() => {
    if (result) return
    setRevealed(true)
    finishRound('skipped', false)
  }, [result, finishRound])

  const reveal = useCallback(() => {
    if (result) return
    setRevealed(true)
  }, [result])

  const next = useCallback(() => {
    if (!result) return
    const nextIdx = idx + 1
    if (nextIdx >= cards.length) return
    setIdx(nextIdx)
    setInput('')
    setResult(null)
    setRevealed(false)
    setHinted(false)
    playedRef.current = false
    setDotStates(dots => dots.map((d, i) => (i === nextIdx ? 'current' : d)))
  }, [result, idx, cards.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target !== inputRef.current && !(e.target instanceof HTMLInputElement)) return
      if (e.key === 'Enter') {
        e.preventDefault()
        if (result) next()
        else submit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [result, submit, next])

  useEffect(() => () => stopSpeaking(), [])

  if (!loaded) {
    return (
      <div className="vs-main">
        <p className="text-center py-16 text-sm vs-loading">Đang tải...</p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="vs-main">
        <div className="vs-done">
          <p>Chưa có từ nào trong bộ thẻ này.</p>
          <button type="button" className="vs-btn-primary" onClick={onDone}>Quay lại</button>
        </div>
      </div>
    )
  }

  if (idx >= cards.length) {
    const pct = Math.round((correct / cards.length) * 100)
    return (
      <div className="vs-main">
        <div className="vs-done">
          <div className="text-5xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
          <h3>Nghe & Gõ lại từ vựng</h3>
          <div className="vs-done-score">{correct}/{cards.length}</div>
          <p>{pct}% chính xác · Đúng {correct} · Sai {wrong}</p>
          <StudyDoneActions onDone={onDone} onRestart={restart} doneLabel="Xong" />
        </div>
      </div>
    )
  }

  const card = cards[idx]
  const topic = [deck.unit, deck.book].filter(Boolean).join(' · ') || deck.name
  const pct = attempted ? Math.round((correct / attempted) * 100) : 0
  const progress = ((idx + (result ? 1 : 0)) / cards.length) * 100

  return (
    <>
      {burstId > 0 && (
        <StudyFireworks burstId={burstId} onDone={clearFireworks} />
      )}
      <div className="vs-main">
      <div className="vs-lt-wrap">
        <div className="vs-lt-head">
          <div>
            <h1>Nghe & Gõ lại từ vựng</h1>
            <p className="vs-lt-meta">{topic} · Câu {idx + 1} / {cards.length}</p>
          </div>
          <div className="vs-lt-badges">
            <span className="vs-lt-badge vs-lt-badge-acc">{pct}% Chính xác</span>
            <span className="vs-lt-badge vs-lt-badge-ok">✓ Đúng {correct}</span>
            <span className="vs-lt-badge vs-lt-badge-bad">✕ Sai {wrong}</span>
          </div>
        </div>

        <div className="vs-lt-grid">
          <div className="vs-lt-practice">
            <div className="vs-lt-audio">
              <div className={`vs-lt-wave ${speaking ? 'active' : ''}`}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className="vs-lt-wave-bar" style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
              <button type="button" className="vs-lt-btn-listen" onClick={playAudio}>
                <Volume2 size={18} />
                Nghe lại
              </button>
              <div className="vs-lt-speed-row">
                <span className="vs-lt-speed-label">Tốc độ:</span>
                <div className="vs-lt-speed-toggle">
                  {(Object.keys(SPEED_LABELS) as SpeechSpeed[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`vs-lt-speed-btn ${speed === s ? 'active' : ''}`}
                      onClick={() => setSpeed(s)}
                    >
                      {SPEED_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="vs-lt-input-zone">
              <p className="vs-lt-input-label">Gõ từ / cụm từ bạn vừa nghe</p>
              <input
                ref={inputRef}
                className={`vs-lt-answer${result === 'correct' ? ' correct' : result ? ' wrong' : ''}`}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={!!result}
                placeholder="Nhập từ/cụm từ bạn nghe được…"
                autoComplete="off"
                spellCheck={false}
              />

              {(revealed || result) && (
                <div className="vs-lt-reveal">
                  {result === 'correct' ? (
                    <p className="vs-lt-reveal-ok"><CheckCircle2 size={16} /> Chính xác!</p>
                  ) : (
                    <p className="vs-lt-reveal-bad">
                      Đáp án: <strong>{card.phrase}</strong>
                      {card.meaning && <span> — {card.meaning}</span>}
                    </p>
                  )}
                </div>
              )}

              <div className="vs-lt-actions">
                <button type="button" className="vs-lt-act vs-lt-act-submit" disabled={!!result || !input.trim()} onClick={submit}>
                  <Check size={14} />
                  Nộp bài
                </button>
                <button
                  type="button"
                  className="vs-lt-act vs-lt-act-ghost"
                  disabled={!!result || hinted}
                  onClick={() => { setInput(hintPhrase(card.phrase)); setHinted(true) }}
                >
                  <Lightbulb size={14} />
                  Gợi ý
                </button>
                <button type="button" className="vs-lt-act vs-lt-act-ghost" disabled={!!result} onClick={skip}>
                  <SkipForward size={14} />
                  Bỏ qua
                </button>
                <button type="button" className="vs-lt-act vs-lt-act-ghost" disabled={!!result || revealed} onClick={reveal}>
                  <Eye size={14} />
                  Xem đáp án
                </button>
                <button
                  type="button"
                  className="vs-lt-act vs-lt-act-next"
                  disabled={!result}
                  onClick={idx === cards.length - 1 && result ? () => setIdx(cards.length) : next}
                >
                  Tiếp tục
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="vs-lt-side">
            <div className="vs-lt-guide">
              <div className="vs-lt-guide-head">
                <div className="vs-lt-guide-icon">
                  <Headphones size={18} />
                </div>
                <h4>Nghe, gõ lại, rồi nộp bài</h4>
              </div>
              <div className="vs-lt-steps">
                {[
                  <>Bấm <b>Nghe lại</b> để nghe từ hoặc cụm từ.</>,
                  <>Gõ chính xác những gì bạn nghe được vào ô nhập.</>,
                  <>Bấm <b>Nộp bài</b> để kiểm tra đáp án.</>,
                  <>Dùng <b>Gợi ý</b> hoặc <b>Xem đáp án</b> khi cần hỗ trợ.</>,
                ].map((text, i) => (
                  <div key={i} className="vs-lt-step">
                    <span className="vs-lt-step-num">{i + 1}</span>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="vs-lt-session">
              <div className="vs-lt-session-title">Tiến độ phiên học</div>
              <div className="vs-lt-progress-bar">
                <div className="vs-lt-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="vs-lt-session-count">Câu <strong>{idx + 1}</strong> / {cards.length}</p>
              <div className="vs-lt-dots">
                {dotStates.map((d, i) => (
                  <span key={i} className={`vs-lt-dot ${d}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
