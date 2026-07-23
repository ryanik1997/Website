import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, RotateCcw, Zap, EyeOff, Check } from 'lucide-react'
import { nextSrs } from '@ryan/core'
import { db } from '@ryan/db'
import type { Card } from '@ryan/db'
import {
  shuffle, isPhraseCorrect, phraseMeta, buildBlankDisplay,
  buildPillItems, exampleParts, hintPhrase,
} from '../study/studyUtils'
import StudyDoneActions from '../study/StudyDoneActions'
import { useStudyAnswerFeedback } from '../study/useStudyAnswerFeedback'
import StudyFireworks from '../../../components/StudyFireworks'
import { useVocabStore } from '../vocabStore'
import { filterCardsByUnitKind } from '../vocabUnitKind'

type Result = 'correct' | 'wrong' | 'skipped' | null

export default function TypeMode({ deckId, onDone }: { deckId: string; onDone: () => void }) {
  const [cards, setCards] = useState<Card[]>([])
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Result>(null)
  const [score, setScore] = useState(0)
  const [attempted, setAttempted] = useState(0)
  const [hinted, setHinted] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [runId, setRunId] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { burstId, onCorrect, onWrong, clearFireworks } = useStudyAnswerFeedback()

  const restart = useCallback(() => {
    setIdx(0)
    setInput('')
    setResult(null)
    setScore(0)
    setAttempted(0)
    setHinted(false)
    setRunId(n => n + 1)
  }, [])

  const unitKind = useVocabStore(s => s.unitKind)

  const load = useCallback(async () => {
    const all = await db.cards.where('deckId').equals(deckId).toArray()
    const c = filterCardsByUnitKind(all, unitKind)
    setCards(shuffle(c))
    setIdx(0)
    setInput('')
    setResult(null)
    setScore(0)
    setAttempted(0)
    setHinted(false)
    setLoaded(true)
  }, [deckId, unitKind])

  useEffect(() => { void load() }, [load, runId])

  useEffect(() => {
    if (loaded && result === null) inputRef.current?.focus()
  }, [idx, loaded, result])

  const applySrs = useCallback(async (card: Card, ok: boolean) => {
    const srs = await db.srs.get(card.id)
    if (!srs) return
    const rating = ok ? 3 : 1
    const next = nextSrs(srs, rating)
    await db.srs.put({ ...next, cardId: srs.cardId, deckId: srs.deckId, updatedAt: Date.now() })
    await db.reviewLog.add({ cardId: card.id, rating, mode: 'type', at: Date.now() })
  }, [])

  const finishAnswer = useCallback(async (ok: boolean, kind: Result) => {
    if (result) return
    setResult(kind)
    setAttempted(a => a + 1)
    if (ok) {
      setScore(s => s + 1)
      onCorrect()
    } else {
      onWrong()
    }
    await applySrs(cards[idx], ok)
  }, [result, cards, idx, applySrs, onCorrect, onWrong])

  const check = useCallback(() => {
    if (!input.trim() || result) return
    const ok = isPhraseCorrect(input, cards[idx].phrase)
    finishAnswer(ok, ok ? 'correct' : 'wrong')
  }, [input, result, cards, idx, finishAnswer])

  const skip = useCallback(() => {
    if (result) return
    finishAnswer(false, 'skipped')
  }, [result, finishAnswer])

  const next = useCallback(() => {
    setInput('')
    setResult(null)
    setHinted(false)
    setIdx(i => i + 1)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target !== inputRef.current && !(e.target instanceof HTMLInputElement)) return
      if (e.key === 'Enter') {
        e.preventDefault()
        if (result) next()
        else check()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [result, check, next])

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
    const pct = Math.round((score / cards.length) * 100)
    return (
      <div className="vs-main">
        <div className="vs-done">
          <div className="text-5xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
          <h3>Đoán từ tiếng Anh</h3>
          <div className="vs-done-score">{score}/{cards.length}</div>
          <p>{pct}% chính xác</p>
          <StudyDoneActions onDone={onDone} onRestart={restart} doneLabel="Xong" />
        </div>
      </div>
    )
  }

  const card = cards[idx]
  const meta = phraseMeta(card.phrase)
  const pills = buildPillItems(card.phrase)
  const flatInput = input.replace(/\s/g, '')
  const exParts = card.example ? exampleParts(card.example, card.phrase) : null
  const pct = attempted ? Math.round((score / attempted) * 100) : 0

  return (
    <>
      {burstId > 0 && (
        <StudyFireworks burstId={burstId} onDone={clearFireworks} />
      )}
      <div className="vs-main">
      <div className="vs-game-card">
        <div className="vs-game-head">
          <div>
            <h2>
              <span className="vs-icon-box">
                <Search size={17} />
              </span>
              Đoán từ tiếng Anh
            </h2>
            <div className="vs-session-meta">
              <span>Câu <b>{idx + 1}/{cards.length}</b></span>
              <span className="dot" />
              <span>Điểm phiên này: <b>{score}/{attempted}</b></span>
              <span className="dot" />
              <span>Đúng <b>{pct}%</b></span>
            </div>
          </div>
          <button type="button" className="vs-btn-secondary" onClick={restart}>
            <RotateCcw size={14} />
            Làm lại vòng
          </button>
        </div>

        <div className="vs-q-zone">
          <p className="vs-q-prompt">Nhìn nghĩa và ví dụ rồi nhập từ/cụm từ tiếng Anh:</p>
          <h1 className="vs-q-word">{card.meaning}</h1>
          <div className="vs-q-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={13} height={13}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            {meta.letters} chữ cái · {meta.words} từ
          </div>

          {card.example && (
            <div className="vs-example-box">
              <div className="vs-example-label">Ví dụ</div>
              <p className="vs-example-text">
                {exParts ? (
                  <>
                    {exParts.before}
                    <span className="vs-example-blank">{buildBlankDisplay(card.phrase)}</span>
                    {exParts.after}
                  </>
                ) : (
                  <>
                    {card.example.replace(new RegExp(card.phrase, 'i'), '')}
                    <span className="vs-example-blank">{buildBlankDisplay(card.phrase)}</span>
                  </>
                )}
              </p>
            </div>
          )}

          <div className="vs-letter-pills">
            {pills.map((p, i) => {
              if (p.kind === 'gap') return <div key={`g-${i}`} className="vs-letter-pill gap" />
              const ch = flatInput[p.charIndex]
              return (
                <div key={`c-${i}`} className={`vs-letter-pill ${ch ? 'filled' : ''}`}>
                  {ch ? ch.toUpperCase() : '_'}
                </div>
              )
            })}
          </div>

          <div className="vs-input-row">
            <input
              ref={inputRef}
              className={`vs-answer-input${result === 'correct' ? ' vs-input-correct' : result ? ' vs-input-wrong' : ''}`}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!!result}
              placeholder="Nhập từ tiếng Anh…"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="vs-btn-suggest"
              disabled={!!result || hinted}
              onClick={() => { setInput(hintPhrase(card.phrase)); setHinted(true) }}
            >
              <Zap size={16} />
              Gợi ý
            </button>
          </div>

          {result && (
            <div style={{ maxWidth: 560, margin: '0 auto 20px', padding: '0 32px' }}>
              <p className={`vs-result-msg ${result === 'correct' ? 'ok' : 'bad'}`}>
                {result === 'correct' ? '✓ Chính xác!' : result === 'skipped' ? 'Đáp án:' : '✗ Chưa đúng — Đáp án:'}
                {result !== 'correct' && (
                  <span className="vs-result-answer">{card.phrase}</span>
                )}
              </p>
            </div>
          )}

          <div className="vs-action-row">
            {!result ? (
              <>
                <button type="button" className="vs-btn-action vs-btn-skip" onClick={skip}>
                  <EyeOff size={18} />
                  Không biết
                </button>
                <button
                  type="button"
                  className="vs-btn-action vs-btn-check"
                  disabled={!input.trim()}
                  onClick={check}
                >
                  <Check size={18} />
                  Kiểm tra đáp án
                </button>
              </>
            ) : (
              <button type="button" className="vs-btn-action vs-btn-check" style={{ flex: 1 }} onClick={next}>
                {idx === cards.length - 1 ? 'Xem kết quả' : 'Tiếp theo →'}
              </button>
            )}
          </div>
        </div>

        <div className="vs-kb-hints">
          <div className="vs-kb-hint">
            <span className="vs-kb-key">Enter</span> kiểm tra / sang từ tiếp theo
          </div>
          <div className="vs-kb-hint">Đúng = <b>lịch Nhớ</b></div>
          <div className="vs-kb-hint">Sai/Không biết = <b className="warn">ôn lại sau 1 phút</b></div>
        </div>
      </div>
    </div>
    </>
  )
}
