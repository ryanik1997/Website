import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ArrowRight, Bookmark, Bell, Menu, PenLine, Wifi } from 'lucide-react'
import { db, writingRepo } from '@ryan/db'
import type { WritingDoc } from '@ryan/db'
import type { CambridgeWritingTask, CambridgeWritingTest } from '@ryan/catalog'
import { CAMBRIDGE_WRITING_COPY } from '../features/writing/cambridgeWritingCopy'
import { useWritingStore } from '../features/writing/writingStore'
import KetRwSplitPane from '../features/exam/ketRw/KetRwSplitPane'
import CambridgeAdvancedWritingTaskView from '../features/writing/exam/CambridgeAdvancedWritingTaskView'
import CambridgeWritingFeedbackDrawer from '../features/writing/exam/CambridgeWritingFeedbackDrawer'
import CambridgeWritingPromptRenderer from '../features/writing/exam/CambridgeWritingPromptRenderer'
import { isAdvancedWritingLevel } from '../features/writing/exam/cambridgeWritingExamUiConfig'
import { getCambridgeRouteLevel } from '../features/writing/cambridgeWritingRouteCatalog'
import { useCambridgeWritingTask } from '../features/writing/useCambridgeWritingTests'
import { useWritingGrading } from '../features/writing/useWritingGrading'
import './writingCambridgeTaskPage.css'
import '../features/exam/ketRw/readingKetRw.css'

function buildPrompt(task: { instruction?: string; promptText?: string }) {
  return [task.instruction, task.promptText].filter(Boolean).join('\n\n')
}

function countWords(text: string) {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

type EmailNoteLine = { x1: number; y1: number; x2: number; y2: number }
export type EmailNotePlacement = { noteIndex: number; side: 'left' | 'right'; desiredTop: number; noteHeight: number; top: number; lineTargetY: number }
const EMPTY_EMAIL_NOTES: readonly string[] = []

export function resolveNotePlacements({ items, stageHeight, edgePadding = 8, minimumGap = 14 }: { items: EmailNotePlacement[]; stageHeight: number; edgePadding?: number; minimumGap?: number }) {
  const available = Math.max(0, stageHeight - edgePadding)
  const result = items.map(item => ({ ...item })).sort((a, b) => a.desiredTop - b.desiredTop)
  for (let index = 1; index < result.length; index += 1) result[index].top = Math.max(result[index].desiredTop, result[index - 1].top + result[index - 1].noteHeight + minimumGap)
  if (result.length) {
    const last = result[result.length - 1]
    last.top = Math.min(last.top, available - last.noteHeight)
    for (let index = result.length - 2; index >= 0; index -= 1) result[index].top = Math.min(result[index].top, result[index + 1].top - result[index].noteHeight - minimumGap)
    for (const item of result) item.top = Math.max(edgePadding, item.top)
    for (let index = 1; index < result.length; index += 1) result[index].top = Math.max(result[index].top, result[index - 1].top + result[index - 1].noteHeight + minimumGap)
  }
  return result
}

export function isSignatureParagraph({ paragraph, paragraphIndex, paragraphs, emailFrom, emailSender }: { paragraph: string; paragraphIndex: number; paragraphs: readonly string[]; emailFrom?: string; emailSender?: string }) {
  const value = paragraph.trim().toLowerCase()
  if (value && (value === emailFrom?.trim().toLowerCase() || value === emailSender?.trim().toLowerCase())) return true
  return paragraphIndex === paragraphs.length - 1 && value.length <= 24 && Boolean(emailSender?.trim()) && value === emailSender?.trim().toLowerCase()
}

export function buildAnchorTargets({ anchorIndexes, paragraphRects, anchorableParagraphIndexes }: { anchorIndexes: readonly number[]; paragraphRects: readonly (DOMRect | null)[]; anchorableParagraphIndexes: readonly number[] }) {
  const groups = new Map<number, number[]>()
  anchorIndexes.forEach((paragraphIndex, noteIndex) => { if (paragraphIndex >= 0 && anchorableParagraphIndexes.includes(paragraphIndex)) groups.set(paragraphIndex, [...(groups.get(paragraphIndex) ?? []), noteIndex]) })
  const targets = new Map<number, number>()
  for (const [paragraphIndex, noteIndexes] of groups) {
    const rect = paragraphRects[paragraphIndex]
    if (!rect) continue
    noteIndexes.sort((a, b) => a - b).forEach((noteIndex, rank) => { targets.set(noteIndex, rect.top + rect.height * ((rank + 1) / (noteIndexes.length + 1))) })
  }
  return targets
}

function areEmailNoteLinesEqual(previous: readonly EmailNoteLine[], next: readonly EmailNoteLine[]) {
  if (previous.length !== next.length) return false
  return previous.every((line, index) => {
    const nextLine = next[index]
    return Boolean(nextLine)
      && Math.abs(line.x1 - nextLine.x1) < 0.5
      && Math.abs(line.y1 - nextLine.y1) < 0.5
      && Math.abs(line.x2 - nextLine.x2) < 0.5
      && Math.abs(line.y2 - nextLine.y2) < 0.5
  })
}

function B1EmailPrompt({ task, leadText, emailBlock, notes, finalText }: {
  task: CambridgeWritingTask
  leadText?: string
  emailBlock: Extract<NonNullable<CambridgeWritingTask['promptBlocks']>[number], { type: 'email' }>
  notes: readonly string[]
  finalText?: string
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const paragraphRefs = useRef<Array<HTMLParagraphElement | null>>([])
  const noteRefs = useRef<Array<HTMLElement | null>>([])
  const [lines, setLines] = useState<EmailNoteLine[]>([])
  const explicitAnchors = (task.metadata as { noteParagraphIndexes?: number[] } | undefined)?.noteParagraphIndexes
  const paragraphs = emailBlock.paragraphs ?? []
  const paragraphCount = paragraphs.length
  const anchorableParagraphIndexes = paragraphs.map((paragraph, index) => index).filter(index => !isSignatureParagraph({ paragraph: paragraphs[index], paragraphIndex: index, paragraphs, emailFrom: emailBlock.from, emailSender: emailBlock.sender }))
  const anchorIndexes = useMemo(() => notes.map((_, index) => {
    const configured = explicitAnchors?.[index]
    if (typeof configured === 'number' && configured >= 0 && configured < paragraphCount) return configured
    if (paragraphCount === 0) return -1
    return anchorableParagraphIndexes[Math.min(index, Math.max(0, anchorableParagraphIndexes.length - 1))] ?? -1
  }), [notes, explicitAnchors, paragraphCount, anchorableParagraphIndexes.join(',')])
  const updateGeometry = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    const stageRect = stage.getBoundingClientRect()
    const items: EmailNotePlacement[] = []
    const targetMap = buildAnchorTargets({ anchorIndexes, paragraphRects: paragraphRefs.current.map(element => element?.getBoundingClientRect() ?? null), anchorableParagraphIndexes })
    anchorIndexes.forEach((paragraphIndex, index) => {
      if (paragraphIndex < 0) return
      const note = noteRefs.current[index]
      const paragraph = paragraphRefs.current[paragraphIndex]
      if (!note || !paragraph) return
      const paragraphRect = paragraph.getBoundingClientRect()
      const left = index % 2 === 0
      const targetY = (targetMap.get(index) ?? (paragraphRect.top + paragraphRect.height / 2)) - stageRect.top
      items.push({ noteIndex: index, side: left ? 'left' : 'right', desiredTop: targetY - note.offsetHeight / 2, noteHeight: note.offsetHeight, top: targetY - note.offsetHeight / 2, lineTargetY: targetY })
    })
    const nextLines: EmailNoteLine[] = []
    for (const item of ['left', 'right'] as const) resolveNotePlacements({ items: items.filter(candidate => candidate.side === item), stageHeight: stageRect.height }).forEach(placement => {
      const note = noteRefs.current[placement.noteIndex]
      const paragraphIndex = anchorIndexes[placement.noteIndex]
      const paragraph = paragraphRefs.current[paragraphIndex]
      if (!note || !paragraph) return
      note.style.top = `${placement.top}px`
      const noteRect = note.getBoundingClientRect()
      const paragraphRect = paragraph.getBoundingClientRect()
      nextLines.push({
        x1: placement.side === 'left' ? noteRect.right - stageRect.left : noteRect.left - stageRect.left,
        y1: noteRect.top - stageRect.top + noteRect.height / 2,
        x2: placement.side === 'left' ? paragraphRect.left - stageRect.left : paragraphRect.right - stageRect.left,
        y2: placement.lineTargetY,
      })
    })
    setLines(previous => areEmailNoteLinesEqual(previous, nextLines) ? previous : nextLines)
  }, [anchorIndexes])
  useLayoutEffect(() => {
    let frameId = window.requestAnimationFrame(updateGeometry)
    const stage = stageRef.current
    if (!stage) return () => window.cancelAnimationFrame(frameId)
    const handleGeometryChange = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(updateGeometry)
    }
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleGeometryChange) : null
    observer?.observe(stage)
    paragraphRefs.current.forEach(element => element && observer?.observe(element))
    window.addEventListener('resize', handleGeometryChange)
    return () => { window.cancelAnimationFrame(frameId); observer?.disconnect(); window.removeEventListener('resize', handleGeometryChange) }
  }, [updateGeometry])
  return (
    <div className="b1-prompt-email">
      {leadText ? <p className="b1-prompt-lead">{leadText}</p> : null}
      <div ref={stageRef} className="b1-email-stage">
        <div className="b1-email-card">
          <div className="b1-email-card__header">EMAIL</div>
          <div className="b1-email-card__meta">
            {emailBlock.from ? <div className="b1-email-card__row"><strong>From:</strong><span>{emailBlock.from}</span></div> : null}
            {emailBlock.subject ? <div className="b1-email-card__row"><strong>Subject:</strong><span>{emailBlock.subject}</span></div> : null}
          </div>
          <div className="b1-email-card__body">
            {emailBlock.greeting ? <p>{emailBlock.greeting}</p> : null}
            {paragraphs.map((paragraph, index) => <p key={`${emailBlock.id}-paragraph-${index}`} ref={element => { paragraphRefs.current[index] = element }}>{paragraph}</p>)}
            {emailBlock.closing ? <p>{emailBlock.closing}</p> : null}
            {emailBlock.sender ? <p>{emailBlock.sender}</p> : null}
          </div>
        </div>
        <svg className="b1-email-note-lines" aria-hidden="true">{lines.map((line, index) => <line key={index} {...line} />)}</svg>
        {notes.map((note, index) => <em key={`${emailBlock.id}-note-${index}`} ref={element => { noteRefs.current[index] = element }} className={`b1-email-note ${index % 2 === 0 ? 'b1-email-note--left' : 'b1-email-note--right'}`}>{note}</em>)}
      </div>
      {finalText ? <p className="b1-prompt-end">{finalText}</p> : null}
    </div>
  )
}

function renderB1Prompt(task: CambridgeWritingTask) {
  const blocks = task.promptBlocks ?? []
  const leadBlock = blocks.find(block => block.type === 'paragraph')
  const emailBlock = blocks.find(block => block.type === 'email')
  const notesBlock = blocks.find(block => block.type === 'panel' && block.variant === 'notes')
  const announcementBlock = blocks.find(block => block.type === 'panel' && block.variant === 'announcement')
  const sourceTextBlock = blocks.find(block => block.type === 'source-text')
  const finalInstruction = blocks.find(block => block.type === 'final-instruction')

  if (emailBlock?.type === 'email') {
    return <B1EmailPrompt task={task} leadText={leadBlock?.type === 'paragraph' ? leadBlock.text : undefined} emailBlock={emailBlock} notes={notesBlock?.type === 'panel' ? notesBlock.listItems ?? EMPTY_EMAIL_NOTES : EMPTY_EMAIL_NOTES} finalText={finalInstruction?.type === 'final-instruction' ? finalInstruction.text : undefined} />
  }

  if (task.presentation?.template === 'announcement' || announcementBlock?.type === 'panel') {
    return (
      <div className="b1-prompt-article">
        {leadBlock?.type === 'paragraph' ? <p className="b1-prompt-lead">{leadBlock.text}</p> : null}
        <div className="b1-article-card">
          {announcementBlock?.type === 'panel' ? <>
            {announcementBlock.heading ? <p><strong>{announcementBlock.heading}</strong></p> : null}
            {announcementBlock.paragraphs?.map((paragraph, index) => <p key={`${announcementBlock.id}-${index}`}>{paragraph}</p>)}
          </> : <CambridgeWritingPromptRenderer task={task} />}
        </div>
        {finalInstruction?.type === 'final-instruction' ? <p className="b1-prompt-end">{finalInstruction.text}</p> : null}
      </div>
    )
  }

  if (sourceTextBlock?.type === 'source-text') return (
    <div className="b1-prompt-story">
      {blocks.filter(block => block.type === 'paragraph').map(block => <p key={block.id} className="b1-prompt-story__line">{block.text}</p>)}
      {sourceTextBlock.label ? <p className="b1-prompt-story__line">{sourceTextBlock.label}</p> : null}
      <p className="b1-prompt-story__sentence"><strong><em>{sourceTextBlock.text}</em></strong></p>
      {finalInstruction?.type === 'final-instruction' ? <p className="b1-prompt-end">{finalInstruction.text}</p> : null}
    </div>
  )

  return <CambridgeWritingPromptRenderer task={task} />
}

function renderB1PromptImage(imageUrl: string) {
  return (
    <div className="b1-prompt-image">
      <img src={imageUrl} alt="Writing prompt" className="b1-prompt-image__asset" />
    </div>
  )
}

function getTaskOrderIndex(testTasks: readonly { id: string }[], taskId: string) {
  return testTasks.findIndex(task => task.id === taskId)
}

type WritingShellTest = Pick<CambridgeWritingTest, 'id' | 'title' | 'tasks'>
type WritingShellTask = CambridgeWritingTask

function B1PromptShell({
  level,
  test,
  task,
  promptDoc,
  text,
  onTextChange,
  onGrade,
  isGrading,
  hasScore,
}: {
  level: NonNullable<ReturnType<typeof getCambridgeRouteLevel>>
  test: WritingShellTest
  task: WritingShellTask
  promptDoc?: WritingDoc
  text: string
  onTextChange: (value: string) => void
  onGrade: () => void
  isGrading: boolean
  hasScore: boolean
}) {
  const taskIndex = getTaskOrderIndex(test.tasks, task.id)
  const prevTask = taskIndex > 0 ? test.tasks[taskIndex - 1] : null
  const nextTask = taskIndex >= 0 && taskIndex < test.tasks.length - 1 ? test.tasks[taskIndex + 1] : null
  const wordCount = countWords(text)
  const instructionLabel = task.partNumber === 1 ? 'You must answer this question.' : 'Answer one of these questions.'
  const questionLabel = task.partNumber === 1 ? 'Question 1' : 'Questions 2-3'
  const part1Task = test.tasks.find((item) => item.partNumber === 1) ?? test.tasks[0]
  const part2Tasks = test.tasks.filter((item) => item.partNumber === 2)
  const part1Completed = task.partNumber === 1 && wordCount > 0 ? 1 : 0

  return (
    <div className="b1-writing-screen">
      <header className="b1-writing-header">
        <div className="b1-writing-header__brand">
          <img src="/logo-ceq.png" alt="Cambridge English" className="b1-writing-header__logo" />
          <strong className="b1-writing-header__candidate">Candidate ID</strong>
        </div>
        <div className="b1-writing-header__actions" aria-hidden="true">
          <Wifi size={18} />
          <Bell size={18} />
          <Menu size={20} />
          <PenLine size={18} />
        </div>
      </header>

      <div className="b1-writing-instruction">
        <strong>{questionLabel}</strong>
        <p>
          {task.instruction ?? `${instructionLabel} Write your answer in about ${task.wordLimit?.displayText ?? '100 words'}.`}
        </p>
      </div>

      <div className="b1-writing-body">
        <KetRwSplitPane
          variant="resizable"
          initialSplitPct={51}
          splitStorageKey={`cambridge-writing-${level.level}-${test.id}-${task.id}-split`}
          left={(
            <section className="b1-writing-prompt-pane">
              <div className="b1-writing-prompt-rich">
                {promptDoc?.promptImage ? renderB1PromptImage(promptDoc.promptImage) : renderB1Prompt(task)}
              </div>
            </section>
          )}
          right={(
            <section className="b1-writing-answer-pane">
              {task.partNumber === 2 && (
                <div className="b1-writing-choice-box">
                  <div>
                    <p>Answering this question?</p>
                    <p>0 of 1 questions selected.</p>
                  </div>
                  <div className="b1-writing-choice-box__actions">
                    <select defaultValue="Undecided" aria-label="Question selection">
                      <option>Undecided</option>
                      <option>Selected</option>
                    </select>
                    <span className="b1-writing-choice-box__help">?</span>
                  </div>
                </div>
              )}

              <div className="b1-writing-answer-box">
                <button type="button" className="b1-writing-bookmark" aria-label="Bookmark">
                  <Bookmark size={18} />
                </button>
                <textarea
                  value={text}
                  onChange={event => onTextChange(event.target.value)}
                  className="b1-writing-textarea"
                  aria-label="Writing answer"
                />
                <p className="b1-writing-word-count">Words: {wordCount}</p>
              </div>
            </section>
          )}
        />
      </div>

      <div className="b1-writing-nav">
        {prevTask ? (
          <Link to={`/app/writing/cambridge/${level.level}/${test.id}/${prevTask.id}`} className="b1-writing-nav__btn b1-writing-nav__btn--muted" aria-label="Previous question">
            <ArrowLeft size={28} />
          </Link>
        ) : (
          <Link to={`/app/writing/cambridge/${level.level}`} className="b1-writing-nav__btn b1-writing-nav__btn--muted" aria-label="Back to library">
            <ArrowLeft size={28} />
          </Link>
        )}
        {nextTask ? (
          <Link to={`/app/writing/cambridge/${level.level}/${test.id}/${nextTask.id}`} className="b1-writing-nav__btn b1-writing-nav__btn--primary" aria-label="Next question">
            <ArrowRight size={28} />
          </Link>
        ) : (
          <Link to={`/app/writing/cambridge/${level.level}/${test.id}`} className="b1-writing-nav__btn b1-writing-nav__btn--primary" aria-label="Back to test">
            <ArrowRight size={28} />
          </Link>
        )}
      </div>

      <footer className="b1-writing-footer">
        <Link
          to={`/app/writing/cambridge/${level.level}/${test.id}/${part1Task.id}`}
          className={`b1-writing-footer__part${task.partNumber === 1 ? ' is-active' : ''}`}
        >
          <strong>Part 1</strong>
          {task.partNumber !== 1 ? <span>{part1Completed} of 1</span> : null}
        </Link>

        <div className={`b1-writing-footer__part${task.partNumber === 2 ? ' is-active' : ''}`}>
          <strong>Part 2</strong>
          {task.partNumber === 1 ? (
            <span>0 of {part2Tasks.length}</span>
          ) : (
            <div className="b1-writing-footer__questions">
              {part2Tasks.map((item) => (
                <Link
                  key={item.id}
                  to={`/app/writing/cambridge/${level.level}/${test.id}/${item.id}`}
                  className={`b1-writing-footer__question${item.id === task.id ? ' is-active' : ''}`}
                >
                  {item.taskNumber}
                </Link>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className={`b1-writing-footer__submit${hasScore ? ' has-score' : ''}`}
          aria-label="Chấm bài AI"
          onClick={onGrade}
          disabled={isGrading}
        >
          {isGrading ? '...' : '✓'}
        </button>
      </footer>
    </div>
  )
}

function A2PromptShell({
  level,
  test,
  task,
  promptDoc,
  text,
  onTextChange,
  onGrade,
  isGrading,
  hasScore,
}: {
  level: NonNullable<ReturnType<typeof getCambridgeRouteLevel>>
  test: WritingShellTest
  task: WritingShellTask
  promptDoc?: WritingDoc
  text: string
  onTextChange: (value: string) => void
  onGrade: () => void
  isGrading: boolean
  hasScore: boolean
}) {
  const taskIndex = getTaskOrderIndex(test.tasks, task.id)
  const prevTask = taskIndex > 0 ? test.tasks[taskIndex - 1] : null
  const nextTask = taskIndex >= 0 && taskIndex < test.tasks.length - 1 ? test.tasks[taskIndex + 1] : null
  const minWords = task.wordLimit?.min ?? (task.partNumber === 6 ? 25 : 35)
  const ketQuestionPrompt = typeof (task.metadata as { ketQuestionPrompt?: unknown } | undefined)?.ketQuestionPrompt === 'string'
    ? (task.metadata as { ketQuestionPrompt?: string }).ketQuestionPrompt
    : ''
  const imageUrls = task.imageAssets?.length
    ? task.imageAssets.map(asset => asset.src)
    : promptDoc?.promptImage
    ? [promptDoc.promptImage]
    : Array.isArray((task.metadata as { ketImageUrls?: unknown } | undefined)?.ketImageUrls)
      ? ((task.metadata as { ketImageUrls?: string[] }).ketImageUrls ?? [])
      : []
  const shellClassName = `b1-writing-screen a2-writing-screen is-part-${task.partNumber}`
  const emailBlocks = task.promptBlocks ?? []
  const leadBlock = emailBlocks.find(block => block.type === 'paragraph')
  const emailBlock = emailBlocks.find(block => block.type === 'email')
  const finalBlock = emailBlocks.find(block => block.type === 'final-instruction')

  return (
    <div className={shellClassName}>
      <header className="b1-writing-header">
        <div className="b1-writing-header__brand">
          <img src="/logo-ceq.png" alt="Cambridge English" className="b1-writing-header__logo" />
          <strong className="b1-writing-header__candidate">Candidate ID</strong>
        </div>
        <div className="b1-writing-header__actions" aria-hidden="true">
          <Wifi size={18} />
          <Bell size={18} />
          <Menu size={20} />
          <PenLine size={18} />
        </div>
      </header>

      <div className="b1-writing-instruction a2-writing-instruction">
        <strong>{task.title}</strong>
        <p>
          Write <strong>{minWords} words or more</strong>.
        </p>
      </div>

      <div className="b1-writing-body">
        {task.partNumber === 6 ? (
          <KetRwSplitPane
            variant="resizable"
            initialSplitPct={50}
            splitStorageKey={`cambridge-writing-${level.level}-${test.id}-${task.id}-split`}
            left={(
              <section className="ket-rw-writing-prompt">
                {leadBlock?.type === 'paragraph' && <p className="a2-email-prompt__lead">{leadBlock.text}</p>}
                {emailBlock?.type === 'email' ? <article className="a2-email-card"><div className="a2-email-card__header">EMAIL</div><div className="a2-email-card__meta"><div><strong>From:</strong><span>{emailBlock.from}</span></div><div><strong>Subject:</strong><span>{emailBlock.subject}</span></div></div><div className="a2-email-card__body">{emailBlock.greeting && <p>{emailBlock.greeting}</p>}{emailBlock.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{emailBlock.closing && <p>{emailBlock.closing}</p>}{emailBlock.sender && <p>{emailBlock.sender}</p>}</div></article> : <div className="ket-rw-writing-prompt__body">{task.promptText}</div>}
                {finalBlock?.type === 'final-instruction' ? <p className="a2-email-prompt__final">{finalBlock.text}</p> : ketQuestionPrompt && <p>{ketQuestionPrompt}</p>}
              </section>
            )}
            right={(
              <section className="b1-writing-answer-pane">
                <textarea
                  value={text}
                  onChange={event => onTextChange(event.target.value)}
                  className="ket-rw-writing-area b1-writing-textarea"
                  aria-label="Writing answer"
                  rows={14}
                  placeholder={emailBlock?.type === 'email' ? 'Write your email here...' : undefined}
                />
                <p className="ket-rw-word-count">Words: {countWords(text)}</p>
              </section>
            )}
          />
        ) : (
          <div className="ket-rw-body is-single a2-writing-body-single">
            <div className="ket-rw-pane-full a2-writing-pane-full">
              <h3 className="ket-rw-passage-title">{task.title}</h3>
              {task.promptText && <p className="ket-rw-q-prompt">{task.promptText}</p>}
              <div className={`ket-rw-pictures a2-writing-pictures${imageUrls.length <= 1 ? ' is-single-strip' : ''}`}>
                {imageUrls.map((imageUrl, index) => (
                  <img
                    key={`${imageUrl}-${index}`}
                    src={imageUrl}
                    alt={imageUrls.length <= 1 ? 'Story pictures' : `Story picture ${index + 1}`}
                  />
                ))}
              </div>
              <textarea
                value={text}
                onChange={event => onTextChange(event.target.value)}
                className="ket-rw-writing-area b1-writing-textarea a2-writing-textarea"
                aria-label="Writing answer"
                rows={10}
                placeholder="Write your story here..."
              />
              <p className="ket-rw-word-count a2-writing-word-count">Words: {countWords(text)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="b1-writing-nav">
        {prevTask ? (
          <Link to={`/app/writing/cambridge/${level.level}/${test.id}/${prevTask.id}`} className="b1-writing-nav__btn b1-writing-nav__btn--muted" aria-label="Previous question">
            <ArrowLeft size={28} />
          </Link>
        ) : (
          <Link to={`/app/writing/cambridge/${level.level}/${test.id}`} className="b1-writing-nav__btn b1-writing-nav__btn--muted" aria-label="Back to test">
            <ArrowLeft size={28} />
          </Link>
        )}
        {nextTask ? (
          <Link to={`/app/writing/cambridge/${level.level}/${test.id}/${nextTask.id}`} className="b1-writing-nav__btn b1-writing-nav__btn--primary" aria-label="Next question">
            <ArrowRight size={28} />
          </Link>
        ) : (
          <Link to={`/app/writing/cambridge/${level.level}/${test.id}`} className="b1-writing-nav__btn b1-writing-nav__btn--primary" aria-label="Back to test">
            <ArrowRight size={28} />
          </Link>
        )}
      </div>

      <footer className="b1-writing-footer">
        <div className="b1-writing-footer__part is-active">
          <strong>{task.partNumber === 6 ? 'Part 6' : 'Part 7'}</strong>
        </div>
        <button
          type="button"
          className={`b1-writing-footer__submit${hasScore ? ' has-score' : ''}`}
          aria-label="Chấm bài AI"
          onClick={onGrade}
          disabled={isGrading}
        >
          {isGrading ? '...' : '✓'}
        </button>
      </footer>
    </div>
  )
}

export default function WritingCambridgeTaskPage() {
  const { level: levelParam, testId, taskId } = useParams<{ level: string; testId: string; taskId: string }>()
  const navigate = useNavigate()
  const level = getCambridgeRouteLevel(levelParam)
  const merged = useCambridgeWritingTask(level?.level ?? 'a2', testId, taskId)
  const test = merged?.test ?? null
  const task = merged?.task ?? null
  const { activeDocId, setActiveDoc } = useWritingStore()
  const creatingRef = useRef<string | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [currentText, setCurrentText] = useState('')

  const taskOwnerId = taskId?.match(/^(.*)-task-\d+$/)?.[1]

  useEffect(() => {
    if (!level || !testId || !taskId || merged === undefined || merged.task || !taskOwnerId || taskOwnerId === testId) return
    navigate(`/app/writing/cambridge/${level.level}/${taskOwnerId}/${taskId}`, { replace: true })
  }, [level, merged, navigate, taskId, taskOwnerId, testId])

  const docs = useLiveQuery(async () => {
    if (!level || !task) return []
    const all = await db.writingDocs.where('type').equals(level.type).toArray()
    return all
      .filter((doc) => (
        doc.sourceMeta?.examFamily === 'cambridge'
        && doc.sourceMeta?.level === level.level
        && doc.sourceMeta?.testId === test?.id
        && doc.sourceMeta?.taskId === task.id
        && doc.sourceMeta?.sourcePromptId === task.id
      ))
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }, [level?.type, task?.id, test?.id])

  const promptDoc = useMemo(
    () => docs?.find(doc => doc.sourceMeta?.docRole === 'prompt_seed' && !!doc.promptImage),
    [docs],
  )

  const answerDocs = useMemo(
    () => (docs ?? []).filter(doc => doc.sourceMeta?.docRole !== 'prompt_seed'),
    [docs],
  )

  useEffect(() => {
    if (!level || !task || docs === undefined) return
    if (answerDocs.length > 0) {
      if (!activeDocId || !answerDocs.some(doc => doc.id === activeDocId)) {
        setActiveDoc(answerDocs[0].id)
      }
      return
    }
    let cancelled = false
    if (creatingRef.current === task.id) return
    creatingRef.current = task.id
    void (async () => {
      const existingDocs = await db.writingDocs.where('type').equals(level.type).toArray()
      const existingAnswerDoc = existingDocs.find((doc) => (
        doc.sourceMeta?.examFamily === 'cambridge'
        && doc.sourceMeta?.level === level.level
        && doc.sourceMeta?.testId === test?.id
        && doc.sourceMeta?.taskId === task.id
        && doc.sourceMeta?.sourcePromptId === task.id
        && doc.sourceMeta?.docRole === 'user_answer'
      ))
      if (existingAnswerDoc) {
        if (!cancelled) setActiveDoc(existingAnswerDoc.id)
        creatingRef.current = null
        return
      }
      const doc = await writingRepo.createDoc(
        level.type,
        buildPrompt(task),
        undefined,
        task.genre as WritingDoc['genre'],
        {
          examFamily: 'cambridge',
          level: level.level,
          testId: test?.id,
          taskId: task.id,
          genre: task.genre as WritingDoc['genre'],
          sourcePromptId: task.id,
          docRole: 'user_answer',
        },
      )
      if (!cancelled) setActiveDoc(doc.id)
      creatingRef.current = null
    })()
    return () => {
      cancelled = true
    }
  }, [activeDocId, answerDocs, docs, level, setActiveDoc, task, test?.id])

  const activeDoc = useMemo(() => {
    if (!answerDocs.length || !activeDocId) return answerDocs[0]
    return answerDocs.find(doc => doc.id === activeDocId) ?? answerDocs[0]
  }, [activeDocId, answerDocs])

  useEffect(() => {
    setCurrentText(activeDoc?.text ?? '')
  }, [activeDoc?.id, activeDoc?.text])

  function handleAnswerChange(value: string) {
    setCurrentText(value)
  }

  function handleOpenTask(nextTaskId: string) {
    if (!level || !test) return
    navigate(`/app/writing/cambridge/${level.level}/${test.id}/${nextTaskId}`)
  }

  const grading = useWritingGrading({
    doc: activeDoc,
    text: currentText,
    minWords: task?.wordLimit?.min,
    persistText: async (nextText) => {
      if (!activeDoc?.id) return
      await writingRepo.updateDoc(activeDoc.id, { text: nextText })
    },
  })

  useEffect(() => {
    if (!activeDoc?.id || currentText === activeDoc.text) return
    const timer = window.setTimeout(() => {
      void writingRepo.updateDoc(activeDoc.id, { text: currentText })
    }, 500)
    return () => window.clearTimeout(timer)
  }, [activeDoc?.id, activeDoc?.text, currentText])

  async function handleGrade() {
    if (grading.score) {
      setFeedbackOpen(true)
      return
    }
    const result = await grading.grade()
    if (result.kind !== 'blocked') {
      setFeedbackOpen(true)
    }
  }

  if (!level) return <Navigate to="/app/writing/cambridge" replace />

  if (!merged) {
    return (
      <div className="relative flex h-full min-h-0 overflow-hidden flex-col">
        <div className="flex-1 grid place-items-center p-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
          {CAMBRIDGE_WRITING_COPY.taskLoading}
        </div>
      </div>
    )
  }

  if (!test || !task) {
    return (
      <div className="relative flex h-full min-h-0 overflow-hidden flex-col">
        <div className="flex-1 grid place-items-center p-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          <div style={{ maxWidth: 640, textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Không tìm thấy task Writing.</p>
            <p style={{ color: 'var(--text-muted)' }}>Task này có thể là bản nháp chỉ dành cho admin hoặc không còn tồn tại.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!activeDoc) {
    return (
      <div className="relative flex h-full min-h-0 overflow-hidden flex-col">
        <div className="flex-1 grid place-items-center p-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
          {CAMBRIDGE_WRITING_COPY.taskLoading}
        </div>
      </div>
    )
  }

  if (level.level === 'a2') {
    return (
      <>
        <A2PromptShell
          level={level}
          test={test}
          task={task}
          promptDoc={promptDoc}
          text={currentText}
          onTextChange={handleAnswerChange}
          onGrade={() => void handleGrade()}
          isGrading={grading.isGrading}
          hasScore={Boolean(grading.score)}
        />
        {activeDoc ? (
          <CambridgeWritingFeedbackDrawer
            open={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            score={grading.score}
            docId={activeDoc.id}
            docType={activeDoc.type}
            isGrading={grading.isGrading}
            gradingError={grading.gradingError}
            onGrade={() => void handleGrade()}
          />
        ) : null}
      </>
    )
  }

  if (level.level === 'b1') {
    return (
      <>
        <B1PromptShell
          level={level}
          test={test}
          task={task}
          promptDoc={promptDoc}
          text={currentText}
          onTextChange={handleAnswerChange}
          onGrade={() => void handleGrade()}
          isGrading={grading.isGrading}
          hasScore={Boolean(grading.score)}
        />
        {activeDoc ? (
          <CambridgeWritingFeedbackDrawer
            open={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            score={grading.score}
            docId={activeDoc.id}
            docType={activeDoc.type}
            isGrading={grading.isGrading}
            gradingError={grading.gradingError}
            onGrade={() => void handleGrade()}
          />
        ) : null}
      </>
    )
  }

  if (isAdvancedWritingLevel(level.level)) {
    return (
      <>
        <CambridgeAdvancedWritingTaskView
          level={level.level}
          test={test}
          task={task}
          answer={currentText}
          onAnswerChange={handleAnswerChange}
          onOpenTask={handleOpenTask}
          isGrading={grading.isGrading}
          hasScore={Boolean(grading.score)}
          onGrade={() => void handleGrade()}
        />
        {activeDoc ? (
          <CambridgeWritingFeedbackDrawer
            open={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            score={grading.score}
            docId={activeDoc.id}
            docType={activeDoc.type}
            isGrading={grading.isGrading}
            gradingError={grading.gradingError}
            onGrade={() => void handleGrade()}
          />
        ) : null}
      </>
    )
  }

  return <Navigate to="/app/writing/cambridge" replace />
}
