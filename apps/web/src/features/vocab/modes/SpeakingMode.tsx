/**
 * Speaking mode: TTS model phrase → user speaks → compare transcript (reuse listening speech APIs).
 */
import { useState, useEffect, useCallback } from 'react'
import { Mic, MicOff, Volume2, Check, X } from 'lucide-react'
import { nextSrs, type Rating } from '@ryan/core'
import { db } from '@ryan/db'
import type { Card, Deck, Srs } from '@ryan/db'
import { speakPhrase, stopSpeaking, SPEECH_SPEEDS } from '../study/speakPhrase'
import { isPhraseCorrect, shuffle } from '../study/studyUtils'
import StudyDoneActions from '../study/StudyDoneActions'
import { useSpeechRecognition } from '../../listening/useSpeechRecognition'
import WordDiffPanel from '../../listening/WordDiffPanel'
import { useVocabStore } from '../vocabStore'
import { filterCardsByUnitKind } from '../vocabUnitKind'

type StudyCard = { card: Card; srs: Srs }

function scoreToRating(ok: boolean, transcript: string, target: string): Rating {
  if (!transcript.trim()) return 1
  if (ok) return 4
  const a = transcript.toLowerCase().replace(/[^a-z\s']/g, '').trim()
  const b = target.toLowerCase().replace(/[^a-z\s']/g, '').trim()
  if (!a || !b) return 1
  // crude token overlap
  const ta = new Set(a.split(/\s+/))
  const tb = b.split(/\s+/)
  const hit = tb.filter(w => ta.has(w)).length
  const ratio = hit / Math.max(1, tb.length)
  if (ratio >= 0.8) return 3
  if (ratio >= 0.5) return 2
  return 1
}

export default function SpeakingMode({
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
  const [loaded, setLoaded] = useState(false)
  const [phase, setPhase] = useState<'ready' | 'heard' | 'scored'>('ready')
  const [lastOk, setLastOk] = useState<boolean | null>(null)
  const [stats, setStats] = useState({ ok: 0, fail: 0 })
  const { listening, transcript, supported, start, stop, reset } = useSpeechRecognition('en-US')

  const unitKind = useVocabStore(s => s.unitKind)

  const load = useCallback(async () => {
    const [allCards, srsRows] = await Promise.all([
      db.cards.where('deckId').equals(deckId).toArray(),
      db.srs.where('deckId').equals(deckId).toArray(),
    ])
    const cards = filterCardsByUnitKind(allCards, unitKind)
    const srsMap = new Map(srsRows.map(s => [s.cardId, s]))
    const now = Date.now()
    let due = cards
      .filter(c => srsMap.has(c.id) && (srsMap.get(c.id)!.dueAt <= now))
      .map(c => ({ card: c, srs: srsMap.get(c.id)! }))
    if (due.length === 0) {
      due = shuffle(cards.filter(c => srsMap.has(c.id)))
        .slice(0, 30)
        .map(c => ({ card: c, srs: srsMap.get(c.id)! }))
    } else {
      due = due.slice(0, 30)
    }
    setQueue(due)
    setIdx(0)
    setPhase('ready')
    setLastOk(null)
    setLoaded(true)
    reset()
  }, [deckId, reset, unitKind])

  useEffect(() => { void load() }, [load])

  useEffect(() => () => { stopSpeaking(); stop() }, [stop])

  const current = queue[idx]

  const playModel = useCallback(() => {
    if (!current) return
    const text = current.card.phrase
    void speakPhrase(text, SPEECH_SPEEDS.normal)
    setPhase('heard')
  }, [current])

  const toggleMic = useCallback(() => {
    if (listening) {
      stop()
      return
    }
    reset()
    start()
  }, [listening, reset, start, stop])

  const submit = useCallback(async () => {
    if (!current) return
    stop()
    stopSpeaking()
    const target = current.card.phrase
    const ok = isPhraseCorrect(transcript, target)
    const rating = scoreToRating(ok, transcript, target)
    const next = nextSrs(current.srs, rating)
    await db.srs.put({ ...next, cardId: current.srs.cardId, deckId: current.srs.deckId, updatedAt: Date.now() })
    await db.reviewLog.add({
      cardId: current.srs.cardId,
      rating,
      mode: 'speak',
      at: Date.now(),
    })
    setLastOk(ok || rating >= 3)
    setStats(s => ({
      ok: s.ok + (rating >= 3 ? 1 : 0),
      fail: s.fail + (rating < 3 ? 1 : 0),
    }))
    setPhase('scored')
  }, [current, transcript, stop])

  const nextCard = useCallback(() => {
    reset()
    setPhase('ready')
    setLastOk(null)
    setIdx(i => i + 1)
  }, [reset])

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
          <h3>Không có thẻ để luyện nói</h3>
          <StudyDoneActions onDone={onDone} onRestart={() => void load()} />
        </div>
      </div>
    )
  }

  if (idx >= queue.length) {
    return (
      <div className="vs-main">
        <div className="vs-done">
          <h3>Xong Speaking!</h3>
          <p>Đạt {stats.ok} · Cần luyện lại {stats.fail}</p>
          <StudyDoneActions onDone={onDone} onRestart={() => void load()} doneLabel="Xong" />
        </div>
      </div>
    )
  }

  const card = current.card

  return (
    <div className="vs-main">
      <div className="vs-session-bar">
        <div className="vs-session-left">
          <div className="vs-session-counter font-mono">{idx}/{queue.length}</div>
          <div className="vs-session-info">
            <h3>Speaking</h3>
            <div className="vs-session-meta">
              <span>{deck.name}</span>
              <span className="dot" />
              <span>Nghe mẫu → nói → so sánh</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="vs-speaking-card rounded-2xl border p-6 mx-auto max-w-lg"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-primary)' }}>
          Target phrase
        </p>
        <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          {phase === 'scored' || phase === 'heard' ? card.phrase : '• • •'}
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{card.meaning}</p>
        {card.example && (
          <p className="text-sm italic mb-4" style={{ color: 'var(--text-muted)' }}>{card.example}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={playModel}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            <Volume2 size={16} />
            Nghe mẫu
          </button>
          <button
            type="button"
            onClick={toggleMic}
            disabled={!supported}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border"
            style={{
              borderColor: listening ? 'var(--color-accent)' : 'var(--border-color)',
              color: listening ? 'var(--color-accent)' : 'var(--text-primary)',
              background: listening
                ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)'
                : 'var(--bg-secondary)',
            }}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
            {listening ? 'Dừng mic' : 'Nói'}
          </button>
        </div>

        {!supported && (
          <p className="text-xs mb-3" style={{ color: 'var(--color-accent)' }}>
            Trình duyệt không hỗ trợ SpeechRecognition (thử Chrome).
          </p>
        )}

        <div
          className="min-h-[3rem] rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          {transcript || (listening ? 'Đang nghe…' : 'Transcript sẽ hiện ở đây')}
        </div>

        {phase === 'scored' && (
          <>
            <WordDiffPanel input={transcript} correct={card.phrase} />
            <p
              className="flex items-center gap-2 text-sm font-semibold mb-3"
              style={{ color: lastOk ? 'var(--color-primary)' : 'var(--color-accent)' }}
            >
              {lastOk ? <Check size={16} /> : <X size={16} />}
              {lastOk ? 'Khá tốt — SRS +1' : 'Cần luyện lại — SRS reset nhẹ'}
            </p>
          </>
        )}

        <div className="flex gap-2">
          {phase !== 'scored' ? (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!transcript.trim()}
              className="flex-1 rounded-full py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              Chấm & lưu SRS
            </button>
          ) : (
            <button
              type="button"
              onClick={nextCard}
              className="flex-1 rounded-full py-2.5 text-sm font-semibold text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              Thẻ tiếp
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
