import { useState } from 'react'
import ExamHighlightZone from './ExamHighlightZone'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'

import type { ExamReviewStatus } from './examReviewUtils'
import type { ListeningPart, ListeningQuestion, ListeningQuestionOption } from './listeningExamData'
import {
  usesCompositePictureBoard,
  usesSplitPictureOptions,
} from './listeningPictureMc'
import { useBlobMediaUrl } from './useBlobMediaUrl'
import type { ExamAudioSource } from './useExamQuestionAudio'

interface AudioBarProps {
  source: ExamAudioSource
  playing: boolean
  buffering: boolean
  progressPct: number
  timeLabel: string
  hasAudioFile: boolean
  allowSeek: boolean
  playsLeft?: number | null
  playBlocked: boolean
  playError?: string | null
  onPlayNormal: () => void
  onSeek: (pct: number) => void
  onStop: () => void
}

interface Props {
  part: ListeningPart
  question: ListeningQuestion
  answer: string
  unsure: boolean
  audioBar: AudioBarProps
  onAnswer: (value: string) => void
  onUnsureChange: (value: boolean) => void
  reviewMode?: boolean
  reviewStatus?: ExamReviewStatus | null
}

function padOptions(options: ListeningQuestionOption[]): ListeningQuestionOption[] {
  const next = options.slice(0, 3)
  while (next.length < 3) {
    const n = next.length
    next.push({ id: ['A', 'B', 'C'][n]!, label: `Picture ${['A', 'B', 'C'][n]}` })
  }
  return next
}

/**
 * KET A2 Part 1 — Cambridge computer-based (new.jpg):
 * - Composite: 1 ảnh full contain + 3 radio dưới (không crop)
 * - Split: 3 thẻ ảnh riêng, mỗi ảnh contain vừa khung
 */
export default function ListeningKetPart1PictureView({
  part,
  question,
  answer,
  unsure,
  audioBar,
  onAnswer,
  onUnsureChange,
  reviewMode = false,
}: Props) {
  const highlights = useExamHighlights()
  const isComposite = usesCompositePictureBoard(question)
  const isSplit = usesSplitPictureOptions(question)
  const options = padOptions(question.options)

  const compositeSrc = useBlobMediaUrl(
    question.pictureImageKey,
    question.pictureImageUrl,
  )
  const [compositeFailed, setCompositeFailed] = useState(false)
  const showComposite = isComposite && Boolean(compositeSrc) && !compositeFailed

  return (
    <ExamHighlightZone className="listening-ket-cambridge__stage listening-ket-p1">
      <div className="listening-ket-p1__sheet">
        <div className="listening-ket-p1__instruction">
          <strong>{part.rangeLabel || 'Questions 1–5'}</strong>
          {part.instruction
            ? <span>{part.instruction}</span>
            : <span>For each question, choose the correct answer.</span>}
        </div>

        <div className="listening-ket-p1__qrow">
          <span className="listening-ket-p1__qbadge" data-highlight-skip>
            {question.number}
          </span>
          <ReadingHighlightableText
            blockId={`${question.id}-prompt`}
            text={question.prompt}
            highlights={highlights}
            className="listening-ket-p1__prompt"
            as="span"
          />
        </div>

        {showComposite ? (
          <div className="listening-ket-p1__composite-wrap">
            <div className="listening-ket-p1__composite-frame">
              <img
                src={compositeSrc!}
                alt={`Question ${question.number} — pictures A, B, C`}
                className="listening-ket-p1__composite-img"
                onError={() => setCompositeFailed(true)}
              />
            </div>
            <div
              className="listening-ket-p1__radios"
              role="radiogroup"
              aria-label={`Question ${question.number}`}
            >
              {options.map(option => {
                const selected = answer === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`listening-ket-p1__radio-btn${selected ? ' is-selected' : ''}`}
                    role="radio"
                    aria-checked={selected}
                    disabled={reviewMode}
                    onClick={() => { if (!reviewMode) onAnswer(option.id) }}
                    aria-label={`Option ${option.id}`}
                  >
                    <span className={`listening-ket-p1-card__radio${selected ? ' is-on' : ''}`} />
                    <span className="listening-ket-p1__radio-letter">{option.id}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="listening-ket-p1__cards" role="radiogroup" aria-label={`Question ${question.number}`}>
            {options.map(option => (
              <SplitOptionCard
                key={option.id}
                option={option}
                selected={answer === option.id}
                disabled={reviewMode}
                preferSplit={isSplit}
                onSelect={() => { if (!reviewMode) onAnswer(option.id) }}
              />
            ))}
          </div>
        )}

        <div className="listening-ket-p1__footer-tools" data-highlight-skip>
          {!reviewMode && (
            <label className="listening-ket-p1__unsure">
              <input
                type="checkbox"
                checked={unsure}
                onChange={e => onUnsureChange(e.target.checked)}
              />
              Chưa chắc chắn
            </label>
          )}
          <div className="listening-ket-p1__audio">
            <ListeningExamAudioBar {...audioBar} />
          </div>
        </div>
      </div>
    </ExamHighlightZone>
  )
}

function SplitOptionCard({
  option,
  selected,
  disabled,
  preferSplit,
  onSelect,
}: {
  option: ListeningQuestionOption
  selected: boolean
  disabled: boolean
  preferSplit: boolean
  onSelect: () => void
}) {
  const [failed, setFailed] = useState(false)
  const src = useBlobMediaUrl(
    preferSplit ? option.imageKey : undefined,
    preferSplit ? option.imageUrl : undefined,
  )
  const show = Boolean(src) && !failed

  return (
    <button
      type="button"
      className={`listening-ket-p1-card${selected ? ' is-selected' : ''}`}
      onClick={onSelect}
      disabled={disabled}
      role="radio"
      aria-checked={selected}
      aria-label={`Option ${option.id}${option.label ? `: ${option.label}` : ''}`}
    >
      <div className="listening-ket-p1-card__frame">
        {show ? (
          <img
            src={src!}
            alt=""
            className="listening-ket-p1-card__img"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="listening-ket-p1-card__placeholder">
            <span>{option.id}</span>
          </div>
        )}
      </div>
      <span className={`listening-ket-p1-card__radio${selected ? ' is-on' : ''}`} aria-hidden />
    </button>
  )
}
