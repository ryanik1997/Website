import type { ReactNode } from 'react'
import { Bookmark } from 'lucide-react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ExamHighlightZone from './ExamHighlightZone'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ExamAudioSource } from './useExamQuestionAudio'
import type { ListeningPart, ListeningQuestion } from './listeningExamData'
import {
  isListeningKeyOption,
  ListeningOptionReviewMark,
  listeningOptionReviewStyle,
} from './listeningReviewUi'
import type { ExamReviewStatus } from './examReviewUtils'

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
  showAllQuestions: boolean
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
  resizer: ReactNode
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
}

function splitFcePrompt(prompt: string): { context?: string; question: string } {
  const marker = '. '
  const markerIndex = prompt.lastIndexOf(marker)
  if (markerIndex <= 0 || !prompt.trim().endsWith('?')) {
    return { question: prompt }
  }
  return {
    context: prompt.slice(0, markerIndex + 1),
    question: prompt.slice(markerIndex + marker.length),
  }
}

export default function ListeningFceMcPartView({
  part,
  questions,
  answers,
  activeQuestionId,
  audioBar,
  showAllQuestions,
  onAnswer,
  onSelectQuestion,
  resizer,
  reviewMode = false,
  reviewStatusMap,
}: Props) {
  const highlights = useExamHighlights()
  const activeQuestion = questions.find(q => q.id === activeQuestionId) ?? questions[0] ?? null
  const activeQuestionIndex = activeQuestion
    ? questions.findIndex(question => question.id === activeQuestion.id)
    : -1
  const visibleQuestions = showAllQuestions
    ? questions
    : part.partNumber === 1 && activeQuestionIndex >= 0
      ? questions.slice(Math.floor(activeQuestionIndex / 2) * 2, Math.floor(activeQuestionIndex / 2) * 2 + 2)
      : activeQuestion ? [activeQuestion] : []

  return (
    <>
      <ExamHighlightZone className={`listening-ket-cambridge__stage listening-fce listening-fce-mc listening-fce-mc--part-${part.partNumber}`}>
        <div className="listening-ket-cambridge__instruction-card listening-fce__instruction-card">
          <strong>{part.rangeLabel}</strong>
          {part.instruction && <span>{part.instruction}</span>}
        </div>

        <div className="listening-fce__bookmark" aria-hidden="true">
          <Bookmark size={22} />
        </div>

        <div className="listening-fce-mc__list">
          {visibleQuestions.map(question => {
            const selectedAnswer = answers[question.id] ?? ''
            const isActive = activeQuestionId === question.id
            const promptParts = splitFcePrompt(question.prompt)
            return (
              <section
                key={question.id}
                className={`listening-fce-mc__question${isActive ? ' is-active' : ''}`}
                onClick={() => onSelectQuestion(question.id)}
              >
                <h2 className="listening-fce-mc__heading">
                  <span className="listening-fce__num">{question.number}</span>
                  <span className="listening-fce-mc__heading-text">
                    {promptParts.context && (
                      <ReadingHighlightableText
                        blockId={`${question.id}-context`}
                        text={promptParts.context}
                        highlights={highlights}
                        className="listening-fce-mc__context"
                        as="span"
                      />
                    )}
                    <ReadingHighlightableText
                      blockId={`${question.id}-prompt`}
                      text={promptParts.question}
                      highlights={highlights}
                      className="listening-fce-mc__prompt"
                      as="span"
                    />
                  </span>
                </h2>

                <div className="listening-fce-mc__options">
                  {question.options.map(option => {
                    const selected = selectedAnswer.toUpperCase() === option.id.toUpperCase()
                    const isKey = reviewMode && isListeningKeyOption(option.id, question.answer)
                    const status = reviewMode ? (reviewStatusMap?.[question.id] ?? null) : null
                    const selectedWrong = Boolean(selected && status === 'wrong')
                    return (
                      <label
                        key={option.id}
                        style={listeningOptionReviewStyle(reviewMode, selected, isKey, status)}
                        className={`listening-fce-mc__option${selected ? ' is-selected' : ''}${isKey ? ' is-review-key' : ''}`}
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

        <div className="listening-ket-cambridge__audio listening-fce__audio">
          <ListeningExamAudioBar {...audioBar} />
        </div>
      </ExamHighlightZone>
      {resizer}
    </>
  )
}
