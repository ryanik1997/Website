import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Bookmark } from 'lucide-react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ExamHighlightZone from './ExamHighlightZone'
import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import { useBlobMediaUrl } from './useBlobMediaUrl'
import type { ExamAudioSource } from './useExamQuestionAudio'
import type { ListeningPart, ListeningQuestion } from './listeningExamData'

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
  questions: ListeningQuestion[]
  answers: Record<string, string>
  activeQuestionId: string | null
  audioBar: AudioBarProps
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
  resizer: ReactNode
}

function promptParts(prompt: string): { lead: string; trail: string } {
  const ellipsis = prompt.indexOf('...')
  if (ellipsis >= 0) {
    return {
      lead: prompt.slice(0, ellipsis).trimEnd(),
      trail: prompt.slice(ellipsis + 3).trimStart(),
    }
  }
  const unicodeEllipsis = prompt.indexOf('…')
  if (unicodeEllipsis >= 0) {
    return {
      lead: prompt.slice(0, unicodeEllipsis).trimEnd(),
      trail: prompt.slice(unicodeEllipsis + 1).trimStart(),
    }
  }
  return { lead: prompt, trail: '' }
}

export default function ListeningFceGapFillPartView({
  part,
  questions,
  answers,
  activeQuestionId,
  audioBar,
  onAnswer,
  onSelectQuestion,
  resizer,
}: Props) {
  const highlights = useExamHighlights()
  const imageSrc = useBlobMediaUrl(part.partImageKey, part.partImageUrl)
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null)
  const localImageInputRef = useRef<HTMLInputElement>(null)
  const displayImageSrc = localImageUrl ?? imageSrc

  useEffect(() => {
    return () => {
      if (localImageUrl) URL.revokeObjectURL(localImageUrl)
    }
  }, [localImageUrl])

  return (
    <>
      <ExamHighlightZone className="listening-ket-cambridge__stage listening-fce listening-fce-gapfill">
        <div className="listening-ket-cambridge__instruction-card listening-fce__instruction-card">
          <strong>{part.rangeLabel}</strong>
          {part.instruction && (
            <ExamHighlightableLines
              blockIdPrefix={`${part.id}-instruction`}
              text={part.instruction}
              lineClassName="listening-fce__instruction-line"
            />
          )}
        </div>

        <div className="listening-fce__bookmark" aria-hidden="true">
          <Bookmark size={22} />
        </div>

        <div className="listening-fce-gapfill__title-row">
          {part.passageTitle && (
            <ReadingHighlightableText
              blockId={`${part.id}-title`}
              text={part.passageTitle}
              highlights={highlights}
              className="listening-fce-gapfill__title"
              as="h2"
            />
          )}
          <div className="listening-fce-gapfill__image-picker">
            {displayImageSrc ? (
              <img
                className="listening-fce-gapfill__image"
                src={displayImageSrc}
                alt={part.passageTitle ? `Illustration: ${part.passageTitle}` : 'Listening illustration'}
                data-highlight-skip
              />
            ) : (
              <button
                type="button"
                className="listening-fce-gapfill__image-empty"
                data-highlight-skip
                onClick={() => localImageInputRef.current?.click()}
              >
                Image
              </button>
            )}
            <button
              type="button"
              className="listening-fce-gapfill__image-import"
              data-highlight-skip
              onClick={() => localImageInputRef.current?.click()}
            >
              Import
            </button>
            <input
              ref={localImageInputRef}
              type="file"
              accept="image/*"
              className="listening-fce-gapfill__image-input"
              data-highlight-skip
              onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                setLocalImageUrl(prev => {
                  if (prev) URL.revokeObjectURL(prev)
                  return URL.createObjectURL(file)
                })
              }}
            />
          </div>
        </div>

        <div className="listening-fce-gapfill__fields">
          {questions.map(question => {
            const isActive = activeQuestionId === question.id
            const parts = promptParts(question.prompt)
            return (
              <label
                key={question.id}
                className={`listening-fce-gapfill__row${isActive ? ' is-active' : ''}`}
                htmlFor={`fce-gap-${question.id}`}
                onClick={() => onSelectQuestion(question.id)}
              >
                <ReadingHighlightableText
                  blockId={`${question.id}-lead`}
                  text={parts.lead}
                  highlights={highlights}
                  as="span"
                />
                <span className="listening-fce__num listening-fce-gapfill__num">{question.number}</span>
                <input
                  id={`fce-gap-${question.id}`}
                  type="text"
                  className="listening-fce-gapfill__input"
                  value={answers[question.id] ?? ''}
                  data-highlight-skip
                  onFocus={() => onSelectQuestion(question.id)}
                  onChange={e => onAnswer(question.id, e.target.value)}
                />
                {parts.trail && (
                  <ReadingHighlightableText
                    blockId={`${question.id}-trail`}
                    text={parts.trail}
                    highlights={highlights}
                    as="span"
                  />
                )}
              </label>
            )
          })}
        </div>

        <div className="listening-ket-cambridge__audio listening-fce__audio">
          <ListeningExamAudioBar {...audioBar} />
        </div>
      </ExamHighlightZone>
      {resizer}
    </>
  )
}
