import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import ListeningIeltsSectionHeader from './ListeningIeltsSectionHeader'
import { sectionMetaFromQuestions } from './ieltsListeningSegmentUtils'
import type { ListeningQuestion } from './listeningExamData'

import { Check } from 'lucide-react'
import { EXAM_REVIEW_COLORS, type ExamReviewStatus } from './examReviewUtils'
import { isListeningKeyOption } from './listeningReviewUi'

interface Props {
  blockIdPrefix: string
  questions: ListeningQuestion[]
  answers: Record<string, string>
  activeQuestionId: string | null
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
}

export default function ListeningIeltsMatchingBlock({
  blockIdPrefix,
  questions,
  answers,
  activeQuestionId,
  onAnswer,
  onSelectQuestion,
  reviewMode = false,
  reviewStatusMap,
}: Props) {
  const highlights = useExamHighlights()
  const options = questions[0]?.options ?? []
  const meta = sectionMetaFromQuestions(questions)
  const isActive = questions.some(q => q.id === activeQuestionId)
  const inlineBank = options.length <= 6
    && options.every(option => {
      const label = option.label.trim()
      return label.length > 1 && label.length <= 42
    })

  return (
    <section className={`listening-ielts-matching${isActive ? ' is-active' : ''}`}>
      <ListeningIeltsSectionHeader blockIdPrefix={blockIdPrefix} meta={meta} />

      <ul className={[
        'listening-ielts-matching__bank',
        inlineBank ? 'listening-ielts-matching__bank--inline' : '',
      ].filter(Boolean).join(' ')}>
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

      <div className="listening-ielts-matching__rows">
        {questions.map(question => {
          const ans = answers[question.id] ?? ''
          const status = reviewMode ? (reviewStatusMap?.[question.id] ?? null) : null
          const keyOpt = options.find(o => isListeningKeyOption(o.id, question.answer))
          return (
            <div
              key={question.id}
              id={`listening-q-${question.id}`}
              className={`listening-ielts-matching__row${activeQuestionId === question.id ? ' is-active' : ''}`}
              style={status ? { borderLeft: `4px solid ${EXAM_REVIEW_COLORS[status].bg}`, paddingLeft: 8 } : undefined}
            >
              <select
                className="listening-ielts-matching__select"
                value={ans}
                disabled={reviewMode}
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
              <span className="listening-ielts-matching__num">{question.number}</span>
              <ReadingHighlightableText
                blockId={`${question.id}-prompt`}
                text={question.prompt}
                highlights={highlights}
                className="listening-ielts-matching__prompt"
                as="span"
              />
              {reviewMode && status !== 'correct' && keyOpt && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginLeft: 8,
                    fontWeight: 800,
                    color: EXAM_REVIEW_COLORS.correct.bg,
                    fontSize: '0.85rem',
                  }}
                >
                  <Check size={14} strokeWidth={3} />
                  Đúng: {keyOpt.id}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}