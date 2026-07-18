import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { X } from 'lucide-react'
import { isSrsReviewDue } from '@ryan/core'
import { db } from '@ryan/db'
import type { Deck } from '@ryan/db'
import { useVocabStore } from '../vocabStore'
import { filterCardsByUnitKind, type VocabUnitKind } from '../vocabUnitKind'
import './srsReminder.css'

interface Props {
  open: boolean
  dueCount: number
  dueLoading?: boolean
  onClose: () => void
  unitKind?: VocabUnitKind
}

type DeckDue = { deck: Deck; due: number }

export default function SrsReviewReminderModal({ open, dueCount, dueLoading, onClose, unitKind }: Props) {
  const [step, setStep] = useState<'remind' | 'pick'>('remind')
  const navigate = useNavigate()
  const { setActiveDeck, startStudy } = useVocabStore()

  const decksWithDue = useLiveQuery(async (): Promise<DeckDue[]> => {
    if (!open) return []
    const t = Date.now()
    const srsRows = await db.srs.where('dueAt').belowOrEqual(t).toArray()
    const cards = unitKind ? await db.cards.bulkGet(srsRows.map(s => s.cardId)) : []
    const cardsById = new Map(cards.flatMap(card => card ? [[card.id, card] as const] : []))
    const countByDeck = new Map<string, number>()
    for (const s of srsRows) {
      if (!isSrsReviewDue(s, t)) continue
      const card = cardsById.get(s.cardId)
      if (unitKind && (!card || filterCardsByUnitKind([card], unitKind).length === 0)) continue
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
  }, [open, unitKind]) ?? []

  if (!open) return null
  if (!dueLoading && dueCount <= 0) return null

  function handleClose() {
    setStep('remind')
    onClose()
  }

  function startDeckReview(deckId: string) {
    setActiveDeck(deckId)
    startStudy('srs', 'review')
    navigate('/app/vocab')
    handleClose()
  }

  return (
    <div className="srs-reminder-backdrop" onClick={handleClose}>
      <div
        className="srs-reminder-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="srsReminderTitle"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="srs-reminder-close"
          onClick={handleClose}
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        <div className="srs-reminder-scroll">
          {step === 'remind' ? (
            <>
              <h2 id="srsReminderTitle" className="srs-reminder-title">
                Đến giờ ôn tập!
              </h2>
              <div className="srs-reminder-mascot" aria-hidden="true">
                <span className="srs-reminder-mascot-bird">
                  <span className="srs-reminder-mascot-bird-inner">🐦</span>
                </span>
              </div>
              <p className="srs-reminder-count">
                Bạn có {dueCount} từ vựng cần được ôn lại
              </p>
              <p className="srs-reminder-desc">
                Bạn có thể chọn deck muốn ôn trước, không cần ôn tất cả cùng lúc.
              </p>
              <button
                type="button"
                className="srs-reminder-action"
                onClick={() => setStep('pick')}
              >
                <span className="srs-reminder-action-icon" aria-hidden="true">
                  ☰
                </span>
                Chọn deck ôn tập ({dueCount})
              </button>
            </>
          ) : (
            <>
              <h2 id="srsReminderTitle" className="srs-reminder-title">
                Chọn deck muốn ôn
              </h2>
              <p className="srs-reminder-count">
                Có {decksWithDue.length} deck đang có từ đến hạn
              </p>
              <div className="srs-reminder-deck-list">
                {decksWithDue.length === 0 ? (
                  <p className="srs-reminder-desc" style={{ marginBottom: 0 }}>
                    Đang tải…
                  </p>
                ) : (
                  decksWithDue.map(({ deck, due }) => (
                    <button
                      key={deck.id}
                      type="button"
                      className="srs-reminder-deck-item"
                      onClick={() => startDeckReview(deck.id)}
                    >
                      <div>
                        <span className="srs-reminder-deck-title">{deck.name}</span>
                        {(deck.book || deck.unit) && (
                          <span className="srs-reminder-deck-sub">
                            {[deck.book, deck.unit].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </div>
                      <span className="srs-reminder-deck-count">{due}</span>
                    </button>
                  ))
                )}
              </div>
              <button
                type="button"
                className="srs-reminder-back"
                onClick={() => setStep('remind')}
              >
                ← Quay lại
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
