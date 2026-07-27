import { ArrowLeft, ArrowRight, Bell, Bookmark, Check, Menu, PenLine, Wifi } from 'lucide-react'
import type { CambridgeWritingTask, CambridgeWritingTest } from '@ryan/catalog'
import { countWords } from '../../exam/examData'
import KetRwSplitPane from '../../exam/ketRw/KetRwSplitPane'
import CambridgeWritingPromptRenderer from './CambridgeWritingPromptRenderer'
import { CAMBRIDGE_ADVANCED_WRITING_CONFIG, type AdvancedWritingLevel } from './cambridgeWritingExamUiConfig'
import { type SelectionStatus, useCambridgeWritingQuestionSelection } from './useCambridgeWritingQuestionSelection'
import './cambridgeAdvancedWritingExam.css'

function getWordLimit(task: CambridgeWritingTask, level: AdvancedWritingLevel) {
  const config = CAMBRIDGE_ADVANCED_WRITING_CONFIG[level]
  const fallback = task.partNumber === 1 ? config.part1WordRange : config.part2WordRange
  return {
    min: task.wordLimit?.min ?? fallback.min,
    max: task.wordLimit?.max ?? fallback.max,
  }
}

function getQuestionHeader(task: CambridgeWritingTask, level: AdvancedWritingLevel) {
  const wordLimit = getWordLimit(task, level)
  const isPartOne = task.partNumber === 1
  const instruction = task.presentation?.headerInstruction
    ?? `${isPartOne ? 'You must answer this question.' : 'Answer one of these questions.'} Write ${wordLimit.min}-${wordLimit.max} words in an appropriate style.`
  return {
    title: isPartOne ? `Question ${task.taskNumber}` : 'Questions 2-4',
    instruction,
  }
}

export default function CambridgeAdvancedWritingTaskView({
  level,
  test,
  task,
  answer,
  onAnswerChange,
  onOpenTask,
}: {
  level: AdvancedWritingLevel
  test: Pick<CambridgeWritingTest, 'id' | 'tasks' | 'title'>
  task: CambridgeWritingTask
  answer: string
  onAnswerChange: (value: string) => void
  onOpenTask: (taskId: string) => void
}) {
  const config = CAMBRIDGE_ADVANCED_WRITING_CONFIG[level]
  const part1Task = test.tasks.find((item) => item.partNumber === 1) ?? test.tasks[0]
  const part2Tasks = test.tasks.filter((item) => item.partNumber === 2)
  const taskIndex = test.tasks.findIndex((item) => item.id === task.id)
  const previousTask = taskIndex > 0 ? test.tasks[taskIndex - 1] : null
  const nextTask = taskIndex >= 0 && taskIndex < test.tasks.length - 1 ? test.tasks[taskIndex + 1] : null
  const header = getQuestionHeader(task, level)
  const { selection, selectedCount, updateSelection } = useCambridgeWritingQuestionSelection(
    level,
    test.id,
    part2Tasks.map((item) => item.id),
  )
  const selectionStatus = selection[task.id] ?? 'undecided'
  const part2CompletedCount = part2Tasks.filter((item) => selection[item.id] === 'yes').length
  const wordCount = countWords(answer)
  const part1Completed = wordCount > 0 && task.partNumber === 1

  return (
    <div className="cw-advanced-screen">
      <header className="cw-exam-header">
        <div className="cw-exam-header__brand">
          <img src="/logo-ceq.png" alt="Cambridge English" className="cw-exam-header__logo" />
          <strong>Candidate ID</strong>
        </div>
        <div className="cw-exam-header__actions" aria-hidden="true">
          <Wifi size={18} />
          <Bell size={18} />
          <Menu size={20} />
          <PenLine size={18} />
        </div>
      </header>

      <section className="cw-question-header">
        <strong>{header.title}</strong>
        <p>{header.instruction}</p>
      </section>

      <div className="cw-writing-body">
        <KetRwSplitPane
          variant="resizable"
          initialSplitPct={50}
          splitStorageKey={`cambridge-writing-${level}-${test.id}-${task.id}-advanced-split`}
          left={(
            <section className="cw-prompt-pane">
              <CambridgeWritingPromptRenderer task={task} />
            </section>
          )}
          right={(
            <section className="cw-answer-pane">
              {task.partNumber === 2 ? (
                <section className="cw-question-selector">
                  <div>
                    <strong>Answering this question?</strong>
                    <p>{selectedCount} of 1 questions selected.</p>
                  </div>
                  <select
                    value={selectionStatus}
                    onChange={(event) => updateSelection(task.id, event.target.value as SelectionStatus)}
                    aria-label="Answering this question?"
                  >
                    <option value="undecided">Undecided</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  <button type="button" className="cw-question-selector__help" aria-label="Question selection help">
                    ?
                  </button>
                </section>
              ) : null}

              <div className="cw-answer-editor-wrap">
                <textarea
                  className="cw-answer-textarea"
                  value={answer}
                  onChange={(event) => onAnswerChange(event.target.value)}
                  spellCheck
                  aria-label="Writing answer"
                />
                <button type="button" className="cw-answer-bookmark" aria-label="Bookmark question">
                  <Bookmark size={18} />
                </button>
              </div>

              <div className="cw-answer-word-count">Words: {wordCount}</div>
            </section>
          )}
        />

        <div className="cw-writing-nav-arrows">
          <button
            type="button"
            className="cw-writing-nav-button is-back"
            onClick={() => previousTask && onOpenTask(previousTask.id)}
            disabled={!previousTask}
            aria-label="Previous question"
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            className="cw-writing-nav-button is-next"
            onClick={() => nextTask && onOpenTask(nextTask.id)}
            disabled={!nextTask}
            aria-label="Next question"
          >
            <ArrowRight />
          </button>
        </div>
      </div>

      <footer className="cw-writing-footer">
        <button
          type="button"
          className={`cw-part-tab${task.partNumber === 1 ? ' is-active' : ''}`}
          onClick={() => part1Task && onOpenTask(part1Task.id)}
        >
          <strong>Part 1</strong>
          {task.partNumber !== 1 ? <span>{part1Completed ? 1 : 0} of 1</span> : null}
        </button>

        <div className={`cw-part-tab${task.partNumber === 2 ? ' is-active' : ''}`}>
          <strong>Part 2</strong>
          {task.partNumber === 1 ? (
            <span>{part2CompletedCount} of {config.part2TaskNumbers.length}</span>
          ) : (
            <div className="cw-question-tabs">
              {part2Tasks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`cw-question-tab${item.id === task.id ? ' is-active' : ''}`}
                  onClick={() => onOpenTask(item.id)}
                >
                  {item.taskNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="cw-footer-submit" aria-label="Finish test">
          <Check size={18} />
        </button>
      </footer>
    </div>
  )
}
