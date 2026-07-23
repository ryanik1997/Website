import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import ListeningIeltsSectionHeader from './ListeningIeltsSectionHeader'
import { sectionMetaFromQuestions } from './ieltsListeningSegmentUtils'
import type { ListeningQuestion } from './listeningExamData'

interface Props {
  blockIdPrefix: string
  questions: ListeningQuestion[]
  answers: Record<string, string>
  activeQuestionId: string | null
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
}

export default function ListeningIeltsFlowChartBlock({
  blockIdPrefix,
  questions,
  answers,
  activeQuestionId,
  onAnswer,
  onSelectQuestion,
}: Props) {
  const highlights = useExamHighlights()
  const options = questions[0]?.options ?? []
  const meta = sectionMetaFromQuestions(questions)
  const flowChartEnd = [...questions].reverse().find(q => q.flowChartEnd)?.flowChartEnd
  const isActive = questions.some(q => q.id === activeQuestionId)

  return (
    <section className={`listening-ielts-flowchart${isActive ? ' is-active' : ''}`}>
      <ListeningIeltsSectionHeader blockIdPrefix={blockIdPrefix} meta={meta} />

      <div className="listening-ielts-flowchart__body">
        <div className="listening-ielts-flowchart__steps">
          {questions.map((question, index) => (
            <div key={question.id} className="listening-ielts-flowchart__step-wrap">
              <div
                id={`listening-q-${question.id}`}
                className={`listening-ielts-flowchart__step${activeQuestionId === question.id ? ' is-active' : ''}`}
              >
                <span className="listening-ielts-flowchart__num">{question.number}</span>
                {question.gapLead && (
                  <ReadingHighlightableText
                    blockId={`${question.id}-lead`}
                    text={`${question.gapLead} `}
                    highlights={highlights}
                    as="span"
                  />
                )}
                <select
                  className="listening-ielts-flowchart__select"
                  value={answers[question.id] ?? ''}
                  data-highlight-skip
                  onChange={e => {
                    onSelectQuestion(question.id)
                    onAnswer(question.id, e.target.value)
                  }}
                  onFocus={() => onSelectQuestion(question.id)}
                >
                  <option value="">—</option>
                  {options.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.id}
                    </option>
                  ))}
                </select>
                {question.gapTrail && (
                  <ReadingHighlightableText
                    blockId={`${question.id}-trail`}
                    text={` ${question.gapTrail}`}
                    highlights={highlights}
                    as="span"
                  />
                )}
                {!question.gapLead && !question.gapTrail && question.prompt && (
                  <ReadingHighlightableText
                    blockId={`${question.id}-prompt`}
                    text={question.prompt}
                    highlights={highlights}
                    as="span"
                  />
                )}
              </div>
              {index < questions.length - 1 && (
                <div className="listening-ielts-flowchart__arrow" aria-hidden>↓</div>
              )}
            </div>
          ))}
          {flowChartEnd && (
            <>
              <div className="listening-ielts-flowchart__arrow" aria-hidden>↓</div>
              <p className="listening-ielts-flowchart__end">
                <ReadingHighlightableText
                  blockId={`${blockIdPrefix}-flow-end`}
                  text={flowChartEnd}
                  highlights={highlights}
                  as="span"
                />
              </p>
            </>
          )}
        </div>

        <aside className="listening-ielts-flowchart__options">
          <p className="listening-ielts-flowchart__options-title">List of options</p>
          <ul className="listening-ielts-matching__bank">
            {options.map(option => (
              <li key={option.id} className="listening-ielts-matching__bank-item">
                <span className="listening-ielts-matching__bank-letter">{option.id}</span>
                <ReadingHighlightableText
                  blockId={`${blockIdPrefix}-bank-${option.id}`}
                  text={option.label}
                  highlights={highlights}
                  as="span"
                />
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}