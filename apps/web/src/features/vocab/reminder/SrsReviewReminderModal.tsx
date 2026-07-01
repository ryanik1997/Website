import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { X } from 'lucide-react'
import { db } from '@ryan/db'
import type { Deck } from '@ryan/db'
import { useVocabStore } from '../vocabStore'
import AnimatedReviewBird from './AnimatedReviewBird'
import './srsReminder.css'

interface Props {
  open: boolean
  dueCount: number
  dueLoading?: boolean
  onClose: () => void
}

type DeckDue = { deck: Deck; due: number }

export default function SrsReviewReminderModal({ open, dueCount, dueLoading, onClose }: Props) {
  const [step, setStep] = useState<'remind' | 'pick'>('remind')
  const navigate = useNavigate()
  const { setActiveDeck, startStudy } = useVocabStore()

  const decksWithDue = useLiveQuery(async (): Promise<DeckDue[]> => {
    if (!open) return []
    const srsRows = await db.srs.where('dueAt').belowOrEqual(Date.now()).toArray()
    const countByDeck = new Map<string, number>()
    for (const s of srsRows) {
      countByDeck.set(s.deckId, (countByDeck.get(s.deckId) ?? 0) + 1)
    }
    const deckIds = [...countByDeck.keys()]
    const decks = await db.decks.bulkGet(deckIds)
    const result: DeckDue[] = []
    for (const deck of decks) {
      if (!deck) continue
      result.push({ deck, due: countByDeck.get(deck.id) ?? 0 })
    }
    return result.sort((a, b) => b.due - a.due)
  }, [open]) ?? []

  if (!open) return null
  if (!dueLoading && dueCount <= 0) return null

  function handleClose() {
    setStep('remind')
    onClose()
  }

  function startDeckReview(deckId: string) {
    setActiveDeck(deckId)
    startStudy('srs')
    navigate('/app/vocab')
    handleClose()
  }

  return (
    <div className="srs-reminder-backdrop" onClick={handleClose}>
      <div className="srs-reminder-modal" onClick={e => e.stopPropagation()}>
        <button type="button" className="srs-reminder-close" onClick={handleClose} aria-label="Đóng">
          <X size={16} />
        </button>

        {step === 'remind' ? (
          <>
            <h2 className="srs-reminder-title">Đến giờ ôn tập!</h2>
            <div className="srs-reminder-bird-wrap">
              <AnimatedReviewBird />
            </div>
            <p className="srs-reminder-msg">
              Bạn có {dueCount} từ vựng cần được ôn lại
            </p>
            <p className="srs-reminder-sub">
              Bạn có thể chọn deck muốn ôn trước, không cần ôn tất cả cùng lúc.
            </p>
            <button
              type="button"
              className="srs-reminder-cta"
              onClick={() => setStep('pick')}
            >
              <span className="srs-reminder-cta-dots">⋯</span>
              Chọn deck ôn tập ({dueCount})
            </button>
          </>
        ) : (
          <>
            <h2 className="srs-reminder-title">Chọn bộ thẻ</h2>
            <p className="srs-reminder-pick-title">Bộ thẻ có từ cần ôn</p>
            <div className="srs-reminder-deck-list">
              {decksWithDue.length === 0 ? (
                <p className="srs-reminder-sub" style={{ marginBottom: 0 }}>Đang tải…</p>
              ) : (
                decksWithDue.map(({ deck, due }) => (
                  <button
                    key={deck.id}
                    type="button"
                    className="srs-reminder-deck-btn"
                    onClick={() => startDeckReview(deck.id)}
                  >
                    <div>
                      <div className="srs-reminder-deck-name">{deck.name}</div>
                      {(deck.book || deck.unit) && (
                        <div className="srs-reminder-deck-sub">
                          {[deck.book, deck.unit].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </div>
                    <span className="srs-reminder-deck-badge">{due} từ</span>
                  </button>
                ))
              )}
            </div>
            <button type="button" className="srs-reminder-back" onClick={() => setStep('remind')}>
              ← Quay lại
            </button>
          </>
        )}
      </div>
    </div>
  )
}