import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import ListeningIeltsSectionHeader from './ListeningIeltsSectionHeader'
import { sectionMetaFromQuestions } from './ieltsListeningSegmentUtils'
import type { ListeningFlowChartStep, ListeningQuestion } from './listeningExamData'

interface Props {
  blockIdPrefix: string
  steps: ListeningFlowChartStep[]
  questionsByNumber: Map<number, ListeningQuestion>
  answers: Record<string, string>
  activeQuestionId: string | null
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
}

function GapInput({
  question,
  answer,
  isActive,
  onAnswer,
  onSelect,
}: {
  question: ListeningQuestion
  answer: string
  isActive: boolean
  onAnswer: (v: string) => void
  onSelect: () => void
}) {
  return (
    <span
      className={[
        'listening-tid-gap',
        isActive ? 'is-active' : '',
        answer.trim() ? 'has-value' : '',
      ].filter(Boolean).join(' ')}
    >
      <input
        id={`ielts-gap-${question.id}`}
        type="text"
        autoComplete="off"
        className="listening-tid-gap__input"
        value={answer}
        placeholder=""
        aria-label={`Question ${question.number}`}
        data-highlight-skip
        onChange={e => onAnswer(e.target.value)}
        onFocus={onSelect}
      />
      <span className="listening-tid-gap__num" aria-hidden>
        {question.number}
      </span>
    </span>
  )
}

export default function ListeningIeltsGapFlowChartBlock({
  blockIdPrefix,
  steps,
  questionsByNumber,
  answers,
  activeQuestionId,
  onAnswer,
  onSelectQuestion,
}: Props) {
  const highlights = useExamHighlights()
  const firstGap = steps.find((step): step is Extract<ListeningFlowChartStep, { type: 'gap' }> =>
    step.type === 'gap')
  const firstQuestion = firstGap ? questionsByNumber.get(firstGap.number) : undefined
  const meta = sectionMetaFromQuestions(firstQuestion ? [firstQuestion] : [])
  const isActive = steps.some(step =>
    step.type === 'gap'
    && questionsByNumber.get(step.number)?.id === activeQuestionId)

  return (
    <section className={`listening-ielts-gap-flowchart${isActive ? ' is-active' : ''}`}>
      <ListeningIeltsSectionHeader
        blockIdPrefix={blockIdPrefix}
        meta={{ range: meta.range, instruction: meta.instruction }}
      />

      <div className="listening-ielts-gap-flowchart__chart">
        {meta.title && (
          <h4 className="listening-ielts-gap-flowchart__plan-title">
            <ReadingHighlightableText
              blockId={`${blockIdPrefix}-plan-title`}
              text={meta.title}
              highlights={highlights}
              as="span"
            />
          </h4>
        )}

        <div className="listening-ielts-gap-flowchart__steps">
          {steps.map((step, index) => (
            <div key={`${step.type}-${index}`} className="listening-ielts-gap-flowchart__step-wrap">
              <div className="listening-ielts-gap-flowchart__row">
                {step.label ? (
                  <div className="listening-ielts-gap-flowchart__label">
                    <ReadingHighlightableText
                      blockId={`${blockIdPrefix}-label-${index}`}
                      text={step.label}
                      highlights={highlights}
                      as="span"
                    />
                  </div>
                ) : (
                  <div className="listening-ielts-gap-flowchart__label listening-ielts-gap-flowchart__label--empty" aria-hidden />
                )}

                <div className="listening-ielts-gap-flowchart__content">
                  {step.type === 'static' ? (
                    <ReadingHighlightableText
                      blockId={`${blockIdPrefix}-static-${index}`}
                      text={step.text}
                      highlights={highlights}
                      as="span"
                    />
                  ) : (() => {
                    const question = questionsByNumber.get(step.number)
                    if (!question) return null
                    const answer = answers[question.id] ?? ''
                    const qActive = activeQuestionId === question.id
                    return (
                      <label
                        id={`listening-q-${question.id}`}
                        className={`listening-ielts-gap-flowchart__gap-line${qActive ? ' is-active' : ''}`}
                        htmlFor={`ielts-gap-${question.id}`}
                      >
                        {question.gapLead && (
                          <ReadingHighlightableText
                            blockId={`${question.id}-lead`}
                            text={`${question.gapLead} `}
                            highlights={highlights}
                            as="span"
                          />
                        )}
                        <GapInput
                          question={question}
                          answer={answer}
                          isActive={qActive}
                          onAnswer={v => onAnswer(question.id, v)}
                          onSelect={() => onSelectQuestion(question.id)}
                        />
                        {question.gapTrail && (
                          <ReadingHighlightableText
                            blockId={`${question.id}-trail`}
                            text={` ${question.gapTrail}`}
                            highlights={highlights}
                            as="span"
                          />
                        )}
                      </label>
                    )
                  })()}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="listening-ielts-gap-flowchart__arrow" aria-hidden>↓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}