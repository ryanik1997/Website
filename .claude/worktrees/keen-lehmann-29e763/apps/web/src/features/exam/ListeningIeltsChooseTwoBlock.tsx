import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import ListeningIeltsSectionHeader from './ListeningIeltsSectionHeader'
import { sectionMetaFromQuestions } from './ieltsListeningSegmentUtils'
import type { ListeningQuestion } from './listeningExamData'

interface Props {
  prompt: string
  questions: ListeningQuestion[]
  answers: Record<string, string>
  activeQuestionId: string | null
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
}

function chooseTwoPromptLabel(questions: ListeningQuestion[], prompt: string): string {
  const start = questions[0]?.number
  const end = questions[questions.length - 1]?.number
  const prefix = start != null && end != null ? `${start}–${end}` : ''
  const clean = prompt.replace(/\s*\(\d+\)\s*$/, '').trim()
  if (prefix && !clean.startsWith(prefix)) {
    return `${prefix} ${clean}`
  }
  return clean
}

function toggleChooseTwoOption(
  optionId: string,
  questions: ListeningQuestion[],
  answers: Record<string, string>,
  onAnswer: (questionId: string, value: string) => void,
  onSelectQuestion: (questionId: string) => void,
) {
  const [first, second] = questions
  if (!first) return

  const firstVal = answers[first.id] ?? ''
  const secondVal = second ? answers[second.id] ?? '' : ''

  if (firstVal === optionId) {
    onAnswer(first.id, '')
    return
  }
  if (second && secondVal === optionId) {
    onAnswer(second.id, '')
    return
  }

  if (!firstVal) {
    onAnswer(first.id, optionId)
    onSelectQuestion(first.id)
    return
  }
  if (second && !secondVal) {
    onAnswer(second.id, optionId)
    onSelectQuestion(second.id)
    return
  }
  if (second) {
    onAnswer(second.id, optionId)
    onSelectQuestion(second.id)
  }
}

export default function ListeningIeltsChooseTwoBlock({
  prompt,
  questions,
  answers,
  activeQuestionId,
  onAnswer,
  onSelectQuestion,
}: Props) {
  const highlights = useExamHighlights()
  const options = questions[0]?.options ?? []
  const meta = sectionMetaFromQuestions(questions)
  const rangeLabel = meta.range
    ?? `Questions ${questions[0]?.number ?? ''}–${questions[questions.length - 1]?.number ?? ''}`
  const blockId = `choose-two-${questions[0]?.id ?? 'group'}`
  const isActive = questions.some(q => q.id === activeQuestionId)
  const selectedIds = new Set(questions.map(q => answers[q.id]).filter(Boolean))
  const promptText = chooseTwoPromptLabel(questions, prompt)

  return (
    <div className={`listening-ielts-choose-two${isActive ? ' is-active' : ''}`}>
      <ListeningIeltsSectionHeader
        blockIdPrefix={blockId}
        meta={{
          range: rangeLabel,
          instruction: meta.instruction ?? 'Choose TWO letters, A–E.',
          title: meta.title,
        }}
      />
      <p className="listening-ielts-choose-two__prompt">
        <ReadingHighlightableText
          blockId={`${blockId}-prompt`}
          text={promptText}
          highlights={highlights}
          as="span"
        />
      </p>
      <ul className="listening-ielts-choose-two__options">
        {options.map(option => {
          const checked = selectedIds.has(option.id)
          return (
            <li key={option.id}>
              <button
                type="button"
                className={`listening-ielts-choose-two__option${checked ? ' is-selected' : ''}`}
                aria-pressed={checked}
                onClick={() => toggleChooseTwoOption(
                  option.id,
                  questions,
                  answers,
                  onAnswer,
                  onSelectQuestion,
                )}
              >
                <span
                  className={`listening-ielts-choose-two__checkbox${checked ? ' is-checked' : ''}`}
                  aria-hidden
                />
                <span className="listening-ielts-choose-two__letter">{option.id}.</span>
                <ReadingHighlightableText
                  blockId={`${blockId}-opt-${option.id}`}
                  text={option.label}
                  highlights={highlights}
                  className="listening-ielts-choose-two__label"
                  as="span"
                />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}