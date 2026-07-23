import { useState, useEffect, useCallback } from 'react'
import { HelpCircle, RotateCcw } from 'lucide-react'
import { nextSrs } from '@ryan/core'
import { db } from '@ryan/db'
import type { Card } from '@ryan/db'
import StudyDoneActions from '../study/StudyDoneActions'
import { useStudyAnswerFeedback } from '../study/useStudyAnswerFeedback'
import { shuffle } from '../study/studyUtils'
import StudyFireworks from '../../../components/StudyFireworks'
import { useVocabStore } from '../vocabStore'
import { filterCardsByUnitKind } from '../vocabUnitKind'

interface Question { card: Card; options: string[]; correct: string }

export default function QuizMode({ deckId, onDone }: { deckId: string; onDone: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [attempted, setAttempted] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [runId, setRunId] = useState(0)
  const { burstId, onCorrect, onWrong, clearFireworks } = useStudyAnswerFeedback()

  const restart = useCallback(() => {
    setIdx(0)
    setSelected(null)
    setScore(0)
    setAttempted(0)
    setRunId(n => n + 1)
  }, [])

  const unitKind = useVocabStore(s => s.unitKind)

  const load = useCallback(async () => {
    const all = await db.cards.where('deckId').equals(deckId).toArray()
    const cards = filterCardsByUnitKind(all, unitKind)
    if (cards.length < 2) {
      setError('Cần ít nhất 2 mục (cùng loại từ đơn/cụm) để chơi trắc nghiệm.')
      setLoaded(true)
      return
    }
    const shuffled = shuffle(cards)
    const qs: Question[] = shuffled.map(card => {
      const others = shuffle(cards.filter(c => c.id !== card.id)).slice(0, 3)
      return {
        card,
        correct: card.meaning,
        options: shuffle([card.meaning, ...others.map(c => c.meaning)]),
      }
    })
    setQuestions(qs)
    setIdx(0)
    setSelected(null)
    setScore(0)
    setAttempted(0)
    setLoaded(true)
  }, [deckId, unitKind])

  useEffect(() => { void load() }, [load, runId])

  const select = useCallback((optIdx: number) => {
    if (selected !== null) return
    setSelected(optIdx)
    setAttempted(a => a + 1)
    const ok = questions[idx].options[optIdx] === questions[idx].correct
    if (ok) {
      setScore(s => s + 1)
      onCorrect()
    } else {
      onWrong()
    }
    const cardId = questions[idx].card.id
    void (async () => {
      const srs = await db.srs.get(cardId)
      if (srs) {
        const next = nextSrs(srs, ok ? 3 : 1)
        await db.srs.put({ ...next, cardId: srs.cardId, deckId: srs.deckId, updatedAt: Date.now() })
      }
      await db.reviewLog.add({ cardId, rating: ok ? 3 : 1, mode: 'quiz', at: Date.now() })
    })()
  }, [selected, questions, idx, onCorrect, onWrong])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (selected !== null) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 }
      if (map[e.key] !== undefined && map[e.key] < questions[idx]?.options.length) {
        select(map[e.key])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, questions, idx, select])

  if (!loaded) {
    return (
      <div className="vs-main">
        <p className="text-center py-16 text-sm vs-loading">Đang tải...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="vs-main">
        <div className="vs-done">
          <p>{error}</p>
          <button type="button" className="vs-btn-primary" onClick={onDone}>Quay lại</button>
        </div>
      </div>
    )
  }

  if (idx >= questions.length) {
    const pct = questions.length ? Math.round((score / questions.length) * 100) : 0
    return (
      <div className="vs-main">
        <div className="vs-done">
          <div className="text-5xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
          <h3>Kết quả trắc nghiệm</h3>
          <div className="vs-done-score">{score}/{questions.length}</div>
          <p>{pct}% chính xác</p>
          <StudyDoneActions onDone={onDone} onRestart={restart} doneLabel="Xong" />
        </div>
      </div>
    )
  }

  const q = questions[idx]
  const pct = attempted ? Math.round((score / attempted) * 100) : 0

  return (
    <>
      {burstId > 0 && (
        <StudyFireworks burstId={burstId} onDone={clearFireworks} />
      )}
      <div className="vs-session-bar">
        <div className="vs-session-left">
          <div className="vs-session-counter amber">
            <HelpCircle size={22} color="#fff" />
          </div>
          <div className="vs-session-info">
            <h3>Trắc nghiệm nghĩa tiếng Việt</h3>
            <div className="vs-session-meta">
              <span>Câu <b>{idx + 1}/{questions.length}</b></span>
              <span className="dot" />
              <span>Điểm phiên này: <b>{score}/{attempted}</b></span>
              <span className="dot" />
              <span>Đúng <b>{pct}%</b></span>
            </div>
          </div>
        </div>
        <button type="button" className="vs-btn-primary" onClick={restart}>
          <RotateCcw size={14} />
          Làm lại vòng
        </button>
      </div>

      <div className="vs-main">
        <div className="vs-wrap">
          <div className="vs-quiz-card">
            <p className="vs-quiz-prompt">Chọn nghĩa đúng của từ/cụm từ:</p>
            <h1 className="vs-quiz-word">{q.card.phrase}</h1>

            {q.card.example && (
              <div className="vs-example-bar">
                <div className="vs-example-pill">{q.card.example}</div>
              </div>
            )}

            <div className="vs-options-grid">
              {q.options.map((opt, i) => {
                const isCorrect = opt === q.correct
                const isSelected = selected === i
                let cls = 'vs-option-btn'
                if (selected !== null) {
                  if (isCorrect) cls += ' vs-option-correct'
                  else if (isSelected) cls += ' vs-option-wrong'
                  else cls += ' vs-option-dim'
                }
                return (
                  <button
                    key={opt}
                    type="button"
                    className={cls}
                    disabled={selected !== null}
                    onClick={() => select(i)}
                  >
                    <span className={`vs-opt-num n${i + 1}`}>{i + 1}</span>
                    <span className="vs-opt-text">{opt}</span>
                  </button>
                )
              })}
            </div>

            {selected !== null && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <button
                  type="button"
                  className="vs-btn-primary"
                  onClick={() => { setSelected(null); setIdx(i => i + 1) }}
                >
                  {idx === questions.length - 1 ? 'Xem kết quả' : 'Tiếp theo →'}
                </button>
              </div>
            )}

            <div className="vs-kb-footer vs-kb-footer-bordered">
              <span className="vs-kb-key">1</span><span className="vs-kb-key">2</span><span className="vs-kb-key">3</span><span className="vs-kb-key">4</span>
              <span className="vs-kb-hint">chọn đáp án</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
