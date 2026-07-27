import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ArrowRight, Bookmark, Bell, Menu, PenLine, Wifi } from 'lucide-react'
import { db, writingRepo } from '@ryan/db'
import type { WritingDoc } from '@ryan/db'
import type { CambridgeWritingTask, CambridgeWritingTest } from '@ryan/catalog'
import { CAMBRIDGE_WRITING_COPY } from '../features/writing/cambridgeWritingCopy'
import { useWritingStore } from '../features/writing/writingStore'
import KetRwSplitPane from '../features/exam/ketRw/KetRwSplitPane'
import { getCambridgeRouteLevel } from '../features/writing/cambridgeWritingRouteCatalog'
import { useCambridgeWritingTask } from '../features/writing/useCambridgeWritingTests'
import './writingCambridgeTaskPage.css'
import '../features/exam/ketRw/readingKetRw.css'

function buildPrompt(task: { instruction?: string; promptText?: string }) {
  return [task.instruction, task.promptText].filter(Boolean).join('\n\n')
}

function countWords(text: string) {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function renderB1Prompt(taskId: string) {
  if (taskId.endsWith('task-01')) {
    return (
      <div className="b1-prompt-email">
        <p className="b1-prompt-lead">Read this email from your English-speaking friend Sandy and the notes you have made.</p>
        <div className="b1-email-card">
          <div className="b1-email-card__header">EMAIL</div>
          <div className="b1-email-card__meta">
            <div className="b1-email-card__row">
              <strong>From:</strong>
              <span>Sandy</span>
            </div>
            <div className="b1-email-card__row">
              <strong>Subject:</strong>
              <span>Your visit!</span>
            </div>
          </div>
          <div className="b1-email-card__body">
            <p>Hi,</p>
            <p>I'm so excited that you're coming to stay with me for a week!</p>
            <p>
              On your first evening here, there's a rock concert in our town. Would you like to go
              to the concert or would you prefer us to relax at home?
            </p>
            <p>Also, shall we go climbing in the mountains while you're here?</p>
            <p>let me know if you have any questions.</p>
            <p>See you soon</p>
            <p>Sandy</p>

            <em className="b1-email-note b1-email-note--left-top">Me too!</em>
            <em className="b1-email-note b1-email-note--right-mid">Say which I prefer</em>
            <em className="b1-email-note b1-email-note--left-bottom">No, because ...</em>
            <em className="b1-email-note b1-email-note--right-bottom">Ask Sandy ...</em>
          </div>
        </div>
        <p className="b1-prompt-end">Write your <strong>email</strong> to Sandy using <strong>all the notes</strong>.</p>
      </div>
    )
  }

  if (taskId.endsWith('task-02')) {
    return (
      <div className="b1-prompt-article">
        <p className="b1-prompt-lead">You see this notice on an English-language website.</p>
        <div className="b1-article-card">
          <p><em>Articles wanted</em></p>
          <p><strong>FILMS</strong></p>
          <p>What kind of films do you enjoy?</p>
          <p>Do you prefer watching them at the cinema or at home? Why?</p>
          <p><strong>Write an article answering these questions and we will put it on our website!</strong></p>
        </div>
        <p className="b1-prompt-end">Write your <strong>article</strong>.</p>
      </div>
    )
  }

  return (
    <div className="b1-prompt-story">
      <p className="b1-prompt-story__line">Your English teacher has asked you to write a story.</p>
      <p className="b1-prompt-story__line">Your story must begin with this sentence.</p>
      <p className="b1-prompt-story__sentence"><strong><em>As the plane flew lower, Lou saw the golden beaches of the island below.</em></strong></p>
      <p className="b1-prompt-end">Write your <strong>story</strong>.</p>
    </div>
  )
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
  doc,
  promptDoc,
}: {
  level: NonNullable<ReturnType<typeof getCambridgeRouteLevel>>
  test: WritingShellTest
  task: WritingShellTask
  doc?: WritingDoc
  promptDoc?: WritingDoc
}) {
  const { activeDocId } = useWritingStore()
  const [text, setText] = useState('')

  useEffect(() => {
    setText(doc?.text ?? '')
  }, [doc?.id, doc?.text])

  useEffect(() => {
    if (!activeDocId || !doc || text === doc.text) return
    const timer = window.setTimeout(() => {
      void writingRepo.updateDoc(activeDocId, { text })
    }, 500)
    return () => window.clearTimeout(timer)
  }, [activeDocId, doc, text])

  const taskIndex = getTaskOrderIndex(test.tasks, task.id)
  const prevTask = taskIndex > 0 ? test.tasks[taskIndex - 1] : null
  const nextTask = taskIndex >= 0 && taskIndex < test.tasks.length - 1 ? test.tasks[taskIndex + 1] : null
  const wordCount = countWords(text)
  const instructionLabel = task.partNumber === 1 ? 'You must answer this question.' : 'Answer one of these questions.'
  const questionLabel = task.partNumber === 1 ? 'Question 1' : 'Questions 2-3'

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
          {instructionLabel} Write your answer in about <strong>100 words</strong>.
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
                {promptDoc?.promptImage ? renderB1PromptImage(promptDoc.promptImage) : renderB1Prompt(task.id)}
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
                  onChange={event => setText(event.target.value)}
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
    </div>
  )
}

function A2PromptShell({
  level,
  test,
  task,
  doc,
  promptDoc,
}: {
  level: NonNullable<ReturnType<typeof getCambridgeRouteLevel>>
  test: WritingShellTest
  task: WritingShellTask
  doc?: WritingDoc
  promptDoc?: WritingDoc
}) {
  const { activeDocId } = useWritingStore()
  const [text, setText] = useState('')

  useEffect(() => {
    setText(doc?.text ?? '')
  }, [doc?.id, doc?.text])

  useEffect(() => {
    if (!activeDocId || !doc || text === doc.text) return
    const timer = window.setTimeout(() => {
      void writingRepo.updateDoc(activeDocId, { text })
    }, 500)
    return () => window.clearTimeout(timer)
  }, [activeDocId, doc, text])

  const taskIndex = getTaskOrderIndex(test.tasks, task.id)
  const prevTask = taskIndex > 0 ? test.tasks[taskIndex - 1] : null
  const nextTask = taskIndex >= 0 && taskIndex < test.tasks.length - 1 ? test.tasks[taskIndex + 1] : null
  const minWords = task.wordLimit?.min ?? (task.partNumber === 6 ? 25 : 35)
  const ketQuestionPrompt = typeof (task.metadata as { ketQuestionPrompt?: unknown } | undefined)?.ketQuestionPrompt === 'string'
    ? (task.metadata as { ketQuestionPrompt?: string }).ketQuestionPrompt
    : ''
  const imageUrls = promptDoc?.promptImage
    ? [promptDoc.promptImage]
    : Array.isArray((task.metadata as { ketImageUrls?: unknown } | undefined)?.ketImageUrls)
      ? ((task.metadata as { ketImageUrls?: string[] }).ketImageUrls ?? [])
      : []

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
                <h3>{task.title}</h3>
                <p>Write <strong>{minWords} words or more</strong>.</p>
                <div className="ket-rw-writing-prompt__body" style={{ whiteSpace: 'pre-wrap' }}>
                  {task.promptText}
                </div>
                {ketQuestionPrompt && <p>{ketQuestionPrompt}</p>}
              </section>
            )}
            right={(
              <section className="b1-writing-answer-pane">
                <textarea
                  value={text}
                  onChange={event => setText(event.target.value)}
                  className="ket-rw-writing-area b1-writing-textarea"
                  aria-label="Writing answer"
                  rows={14}
                />
                <p className="ket-rw-word-count">Words: {countWords(text)}</p>
              </section>
            )}
          />
        ) : (
          <div className="ket-rw-body is-single">
            <div className="ket-rw-pane-full">
              <h3 className="ket-rw-passage-title">{task.title}</h3>
              {task.promptText && <p className="ket-rw-q-prompt">{task.promptText}</p>}
              <div className={`ket-rw-pictures${imageUrls.length <= 1 ? ' is-single-strip' : ''}`}>
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
                onChange={event => setText(event.target.value)}
                className="ket-rw-writing-area b1-writing-textarea"
                aria-label="Writing answer"
                rows={10}
              />
              <p className="ket-rw-word-count">Words: {countWords(text)}</p>
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
    </div>
  )
}

export default function WritingCambridgeTaskPage() {
  const { level: levelParam, testId, taskId } = useParams<{ level: string; testId: string; taskId: string }>()
  const level = getCambridgeRouteLevel(levelParam)
  const merged = useCambridgeWritingTask(level?.level ?? 'a2', testId, taskId)
  const test = merged?.test ?? null
  const task = merged?.task ?? null
  const { activeDocId, setActiveDoc } = useWritingStore()
  const creatingRef = useRef<string | null>(null)

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

  if (level.level === 'a2') {
    return <A2PromptShell level={level} test={test} task={task} doc={activeDoc} promptDoc={promptDoc} />
  }

  if (level.level === 'b1') {
    return <B1PromptShell level={level} test={test} task={task} doc={activeDoc} promptDoc={promptDoc} />
  }

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden flex-col">
      <div className="shrink-0 flex flex-wrap items-center gap-2 px-4 py-2 border-b text-xs" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
        <Link to="/app/writing/cambridge" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Cambridge</Link>
        <span>/</span>
        <Link to={`/app/writing/cambridge/${level.level}`} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{level.displayName}</Link>
        <span>/</span>
        <Link to={`/app/writing/cambridge/${level.level}/${test.id}`} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{test.title}</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{task.title}</span>
      </div>
      <div className="flex-1 grid place-items-center p-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div style={{ maxWidth: 640, textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>B2/C1/C2 đang dùng shell tạm.</p>
          <p style={{ color: 'var(--text-muted)' }}>B1 đã tách layout riêng để bám ảnh crawl 1:1. A2 vừa nối theo Part 6/7 của KET. Các level còn lại sẽ nối theo cùng pattern khi có layout chuẩn tương ứng.</p>
        </div>
      </div>
    </div>
  )
}
