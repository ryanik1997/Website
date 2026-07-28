import ExamHighlightZone from './ExamHighlightZone'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ExamReviewStatus } from './examReviewUtils'
import type { ListeningPart, ListeningQuestion } from './listeningExamData'
import {
  isListeningKeyOption,
  ListeningOptionReviewMark,
  listeningOptionReviewStyle,
} from './listeningReviewUi'
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
  questions: ListeningQuestion[]
  answers: Record<string, string>
  activeQuestionId: string | null
  audioBar: AudioBarProps
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
}

/**
 * KET A2 Part 3 — MC list dọc (Cambridge MS / new.jpg):
 * instruction → từng câu (badge số + stem) → radio options từ trên xuống.
 */
export default function ListeningKetPart3McListView({
  part,
  questions,
  answers,
  activeQuestionId,
  audioBar,
  onAnswer,
  onSelectQuestion,
  reviewMode = false,
  reviewStatusMap,
}: Props) {
  const highlights = useExamHighlights()
  const intro = (part.audioIntro || part.instruction || '').trim()

  return (
    <ExamHighlightZone className="listening-ket-cambridge__stage listening-ket-p3">
      <div className="listening-ket-p3__sheet">
        <div className="listening-ket-p3__instruction">
          <strong>{part.rangeLabel || 'Questions 11–15'}</strong>
          {intro ? (
            <ReadingHighlightableText
              blockId={`${part.id}-intro`}
              text={intro}
              highlights={highlights}
              as="span"
            />
          ) : (
            <span>For each question, choose the correct answer.</span>
          )}
        </div>

        <div className="listening-ket-p3__list">
          {questions.map(question => {
            const isActive = activeQuestionId === question.id
            const selectedAnswer = answers[question.id] ?? ''
            const status = reviewMode ? (reviewStatusMap?.[question.id] ?? null) : null

            return (
              <section
                key={question.id}
                className={`listening-ket-p3__item${isActive ? ' is-active' : ''}`}
                onClick={() => onSelectQuestion(question.id)}
              >
                <h2 className="listening-ket-p3__stem">
                  <span className="listening-ket-p3__num" data-highlight-skip>
                    {question.number}
                  </span>
                  <ReadingHighlightableText
                    blockId={`${question.id}-prompt`}
                    text={question.prompt}
                    highlights={highlights}
                    className="listening-ket-p3__prompt"
                    as="span"
                  />
                </h2>

                <div className="listening-ket-p3__options" role="radiogroup" aria-label={`Question ${question.number}`}>
                  {question.options.map(option => {
                    const selected = selectedAnswer.toUpperCase() === option.id.toUpperCase()
                    const isKey = reviewMode && isListeningKeyOption(option.id, question.answer)
                    const selectedWrong = Boolean(selected && status === 'wrong')
                    return (
                      <label
                        key={option.id}
                        style={listeningOptionReviewStyle(reviewMode, selected, isKey, status)}
                        className={`listening-ket-p3__option${selected ? ' is-selected' : ''}${isKey ? ' is-review-key' : ''}`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          checked={selected}
                          disabled={reviewMode}
                          data-highlight-skip
                          onFocus={() => onSelectQuestion(question.id)}
                          onChange={() => { if (!reviewMode) onAnswer(question.id, option.id) }}
                        />
                        <ReadingHighlightableText
                          blockId={`${question.id}-opt-${option.id}`}
                          text={option.label}
                          highlights={highlights}
                          className="listening-ket-p3__option-label"
                          as="span"
                        />
                        <ListeningOptionReviewMark isKey={isKey} selectedWrong={selectedWrong} />
                      </label>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        <div className="listening-ket-p3__audio" data-highlight-skip>
          <ListeningExamAudioBar {...audioBar} />
        </div>
      </div>
    </ExamHighlightZone>
  )
}
