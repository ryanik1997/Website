import { useState, useEffect, useCallback, useRef, type MouseEvent } from 'react'
import { Headphones, RefreshCw, Check, FlipHorizontal2, Sparkles } from 'lucide-react'
import { nextSrs } from '@ryan/core'
import { db } from '@ryan/db'
import type { Card, Deck, Srs } from '@ryan/db'
import { useDictStore } from '../../dictionary/dictStore'
import { speakPhrase } from '../study/speakPhrase'
import StudyDoneActions from '../study/StudyDoneActions'
import { useVocabStore } from '../vocabStore'
import { isWeakWord } from '../study/weakWords'
import { shuffle } from '../study/studyUtils'

type Rating = 1 | 2 | 3 | 4
type StudyCard = { card: Card; srs: Srs }

const RATINGS: { r: Rating; label: string; time: string; cls: string }[] = [
  { r: 1, label: 'Quên', time: '1 phút', cls: 'vs-rt-forgot' },
  { r: 2, label: 'Khó', time: 'học lại 10 phút', cls: 'vs-rt-hard' },
  { r: 3, label: 'Nhớ', time: '1 ngày · lần 2: 4 ngày', cls: 'vs-rt-good' },
  { r: 4, label: 'Dễ', time: '4 ngày+', cls: 'vs-rt-easy' },
]

export default function SrsMode({
  deckId,
  deck,
  onDone,
}: {
  deckId: string
  deck: Deck
  onDone: () => void
}) {
  const [queue, setQueue] = useState<StudyCard[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 })
  const [loaded, setLoaded] = useState(false)
  const sessionSnapshotRef = useRef<StudyCard[]>([])
  const openDict = useDictStore(s => s.open)
  const studyFilter = useVocabStore(s => s.studyFilter)

  const applyQueue = useCallback((result: StudyCard[]) => {
    sessionSnapshotRef.current = result
    setQueue(result)
    setIdx(0)
    setFlipped(false)
    setLoaded(true)
  }, [])

  const buildQueue = useCallback(async (mode: 'due' | 'practice'): Promise<StudyCard[]> => {
    if (mode === 'practice') {
      const [allCards, srsRows] = await Promise.all([
        db.cards.where('deckId').equals(deckId).toArray(),
        db.srs.where('deckId').equals(deckId).toArray(),
      ])
      const srsMap = new Map(srsRows.map(s => [s.cardId, s]))
      let cards = allCards
      if (studyFilter === 'weak') {
        cards = allCards.filter(c => {
          const srs = srsMap.get(c.id)
          return srs && isWeakWord(srs)
        })
      }
      return shuffle(cards)
        .filter(c => srsMap.has(c.id))
        .slice(0, 50)
        .map(c => ({ card: c, srs: srsMap.get(c.id)! }))
    }

    const srsRows = await db.srs
      .where('deckId').equals(deckId)
      .filter(s => {
        if (studyFilter === 'weak') return isWeakWord(s)
        return s.dueAt <= Date.now()
      })
      .limit(50)
      .toArray()
    const cards = await db.cards.bulkGet(srsRows.map(s => s.cardId))
    const result: StudyCard[] = []
    for (let i = 0; i < srsRows.length; i++) {
      if (cards[i]) result.push({ card: cards[i]!, srs: srsRows[i] })
    }
    return result
  }, [deckId, studyFilter])

  const load = useCallback(async (mode: 'due' | 'practice' = 'due') => {
    const result = await buildQueue(mode)
    applyQueue(result)
  }, [buildQueue, applyQueue])

  useEffect(() => { void load('due') }, [load])

  const replaySession = useCallback(async () => {
    const snap = sessionSnapshotRef.current
    if (snap.length > 0) {
      const ids = snap.map(s => s.card.id)
      const [cards, srsRows] = await Promise.all([
        db.cards.bulkGet(ids),
        db.srs.bulkGet(ids),
      ])
      const refreshed: StudyCard[] = []
      for (let i = 0; i < ids.length; i++) {
        if (cards[i] && srsRows[i]) {
          refreshed.push({ card: cards[i]!, srs: srsRows[i]! })
        }
      }
      sessionSnapshotRef.current = refreshed
      setQueue(refreshed)
      setIdx(0)
      setFlipped(false)
      setStats({ again: 0, hard: 0, good: 0, easy: 0 })
      return
    }
    setStats({ again: 0, hard: 0, good: 0, easy: 0 })
    await load('practice')
  }, [load])

  const rate = useCallback(async (r: Rating) => {
    const { srs } = queue[idx]
    const next = nextSrs(srs, r)
    await db.srs.put({ ...next, cardId: srs.cardId, deckId: srs.deckId })
    await db.reviewLog.add({ cardId: srs.cardId, rating: r, mode: 'srs', at: Date.now() })
    const key = r === 1 ? 'again' : r === 2 ? 'hard' : r === 3 ? 'good' : 'easy'
    setStats(s => ({ ...s, [key]: s[key] + 1 }))
    setFlipped(false)
    setIdx(i => i + 1)
  }, [queue, idx])

  const doFlip = useCallback(() => {
    const phrase = queue[idx]?.card.phrase ?? ''
    if (phrase) void speakPhrase(phrase)
    setFlipped(f => !f)
  }, [queue, idx])

  const onCardClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button, a, input, textarea, select')) return
    doFlip()
  }, [doFlip])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space') {
        e.preventDefault()
        doFlip()
        return
      }
      if (flipped && ['1', '2', '3', '4'].includes(e.key)) {
        rate(Number(e.key) as Rating)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flipped, doFlip, rate])

  if (!loaded) {
    return (
      <div className="vs-main">
        <p className="text-center py-16 text-sm vs-loading">Đang tải...</p>
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="vs-main">
        <div className="vs-done">
          <div className="text-5xl mb-4">🎉</div>
          <h3>Hoàn thành rồi!</h3>
          <p>
            {studyFilter === 'weak'
              ? 'Không còn từ yếu cần ôn trong bộ này.'
              : 'Không có thẻ nào cần ôn hôm nay.'}
          </p>
          <StudyDoneActions onDone={onDone} onRestart={() => void replaySession()} />
        </div>
      </div>
    )
  }

  if (idx >= queue.length) {
    const total = stats.again + stats.hard + stats.good + stats.easy
    return (
      <div className="vs-main">
        <div className="vs-done">
          <div className="text-5xl mb-4">✅</div>
          <h3>Phiên ôn hoàn thành!</h3>
          <div className="vs-done-score">{total}</div>
          <p>Đã ôn {total} thẻ · Quên {stats.again} · Khó {stats.hard} · Nhớ {stats.good} · Dễ {stats.easy}</p>
          <StudyDoneActions onDone={onDone} onRestart={() => void replaySession()} doneLabel="Xong" />
        </div>
      </div>
    )
  }

  const { card, srs } = queue[idx]
  const topic = deck.unit || deck.book || deck.name
  const isDue = srs.dueAt <= Date.now()

  return (
    <>
      <div className="vs-session-bar">
        <div className="vs-session-left">
          <div className="vs-session-counter font-mono">{idx}/{queue.length}</div>
          <div className="vs-session-info">
            <h3>{studyFilter === 'weak' ? 'Ôn từ yếu (SRS)' : 'Lặp lại ngắt quãng'}</h3>
            <div className="vs-session-meta">
              <span>Còn <b>{queue.length - idx}</b> thẻ trong phiên</span>
              <span className="dot" />
              <span>Đã nhớ</span>
              <span className="dot" />
              {isDue && <span className="due">Đến hạn ngay</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="vs-btn-secondary" onClick={() => speakPhrase(card.phrase)}>
            <Headphones size={14} />
            Nghe deck
          </button>
          <button type="button" className="vs-btn-secondary" onClick={() => void load('due')}>
            <RefreshCw size={14} />
            Cập nhật thẻ
          </button>
        </div>
      </div>

      <div className="vs-main">
        <div className="vs-wrap">
          <div
            className="vs-flip-scene"
            onClick={onCardClick}
            style={{ cursor: 'pointer' }}
          >
            <div className={`vs-flip-inner${flipped ? ' is-flipped' : ''}`} key={card.id}>
              <div className="vs-flip-face vs-flip-face-front">
                <div className="vs-card-top">
                  <div className="vs-card-tags">
                    <span className="vs-tag vs-tag-topic">{topic}</span>
                    {isDue && <span className="vs-tag vs-tag-due">Đến hạn ngay</span>}
                  </div>
                  {srs.reps > 0 && (
                    <span className="vs-tag vs-tag-reviewed">Đã ôn {srs.reps} lần</span>
                  )}
                </div>
                <div className="vs-card-body" style={{ userSelect: 'none' }}>
                  <p className="vs-card-lang">English</p>
                  <h1 className="vs-card-word">{card.phrase}</h1>
                  {card.example && (
                    <div className="vs-card-example">
                      <p>{card.example}</p>
                      <button
                        type="button"
                        className="vs-btn-audio"
                        onClick={e => { e.stopPropagation(); speakPhrase(card.example!) }}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div className="vs-flip-hint">
                    <Check size={15} />
                    Bấm thẻ hoặc nhấn Space để xem nghĩa
                  </div>
                </div>
              </div>

              <div className="vs-flip-face vs-flip-face-back">
                <div className="vs-card-top">
                  <div className="vs-card-tags">
                    <span className="vs-tag vs-tag-topic">{topic}</span>
                  </div>
                  <span className="vs-tag vs-tag-reviewed">Mặt sau</span>
                </div>
                <div className="vs-card-body" style={{ userSelect: 'text' }}>
                  <p className="vs-card-lang">Tiếng Việt</p>
                  <h1 className="vs-card-meaning">{card.meaning}</h1>
                  {(card.ipaUS || card.ipaUK) && (
                    <div className="vs-card-ipa">
                      {card.ipaUS && (
                        <span className="vs-card-ipa-item">
                          <span className="vs-card-ipa-label">US</span>/{card.ipaUS}/
                          <button
                            type="button"
                            className="vs-btn-audio vs-btn-audio--sm"
                            onClick={e => { e.stopPropagation(); void speakPhrase(card.phrase, 0.85, undefined, 'us') }}
                            aria-label="Phát âm US"
                            title="Phát âm US"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
                              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                            </svg>
                          </button>
                        </span>
                      )}
                      {card.ipaUK && (
                        <span className="vs-card-ipa-item">
                          <span className="vs-card-ipa-label">UK</span>/{card.ipaUK}/
                          <button
                            type="button"
                            className="vs-btn-audio vs-btn-audio--sm"
                            onClick={e => { e.stopPropagation(); void speakPhrase(card.phrase, 0.85, undefined, 'uk') }}
                            aria-label="Phát âm UK"
                            title="Phát âm UK"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
                              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                            </svg>
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                  {card.example && (
                    <div className="vs-card-example">
                      <p>{card.example}</p>
                    </div>
                  )}
                  {card.pos && (
                    <span className="vs-tag vs-tag-topic" style={{ marginTop: 12, display: 'inline-block' }}>{card.pos}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="vs-control-row">
            <button type="button" className="vs-btn-secondary" style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', border: 'none' }} onClick={() => openDict(card.phrase)}>
              <Sparkles size={15} />
              Hỏi AI
            </button>
            <button type="button" className="vs-btn-flip" onClick={doFlip}>
              <FlipHorizontal2 size={15} />
              Lật thẻ <span className="vs-kbd">Space</span>
            </button>
          </div>

          {flipped && (
            <div className="vs-rating-row">
              {RATINGS.map(({ r, label, time, cls }) => (
                <button key={r} type="button" className={`vs-rating-btn ${cls}`} onClick={() => rate(r)}>
                  <span className="vs-rating-num">{r}</span>
                  <span className="vs-rating-text">
                    <span className="vs-rating-label">{label}</span>
                    <span className="vs-rating-time">{time}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="vs-kb-footer">
            <span className="vs-kb-key">Space</span> lật thẻ &nbsp;·&nbsp;
            <span className="vs-kb-key">1</span><span className="vs-kb-key">2</span><span className="vs-kb-key">3</span><span className="vs-kb-key">4</span> chọn mức nhớ
          </div>
        </div>
      </div>
    </>
  )
}