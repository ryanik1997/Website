import { useMemo, useState } from 'react'
import type { ReadingPart, ReadingQuestion } from '../examData'
import { countWords, getPartQuestions } from '../examData'
import { useBlobMediaUrl } from '../useBlobMediaUrl'
import KetRwSplitPane from '../ketRw/KetRwSplitPane'
import { ensureGapDots, questionByNumber, splitKetGapText } from '../ketRw/ketRwGapUtils'
import { getBodyTextBlocks, optionBankFromPassage } from '../petRw/petRwPassageUtils'

interface Props {
  examId: string
  part: ReadingPart
  answers: Record<string, string>
  activeQuestionId: string | null
  onSelectQuestion: (id: string) => void
  onAnswer: (id: string, value: string) => void
}

function PassageImage({ imageKey, imageUrl, alt }: { imageKey?: string; imageUrl?: string; alt: string }) {
  const src = useBlobMediaUrl(imageKey, imageUrl)
  if (!src) return null
  return <img src={src} alt={alt} className="pet-rw-page-image" />
}

function formatCaeReviewerLabel(label: string): string {
  const trimmed = label.trim()
  if (/^reviewer\s/i.test(trimmed)) return trimmed
  if (/^[A-D]$/i.test(trimmed)) return `Reviewer ${trimmed.toUpperCase()}`
  return trimmed
}

function formatCaeConsultantLabel(label: string): string {
  const trimmed = label.trim()
  if (/^consultant\s/i.test(trimmed)) return trimmed
  if (/^[A-E]$/i.test(trimmed)) return `Consultant ${trimmed.toUpperCase()}`
  return trimmed
}

function CaeLabeledBlock({
  label,
  text,
  formatLabel,
}: {
  label?: string
  text: string
  formatLabel: (s: string) => string
}) {
  return (
    <div className="cae-rw-labeled-block">
      {label && (
        <p className="cae-rw-labeled-block__heading">{formatLabel(label)}</p>
      )}
      <p className="ket-rw-paragraph">{text}</p>
    </div>
  )
}

function CaeLabeledMcQuestion({
  question,
  answers,
  onSelectQuestion,
  onAnswer,
  formatLabel,
}: {
  question: ReadingQuestion
  answers: Record<string, string>
  onSelectQuestion: (id: string) => void
  onAnswer: (id: string, value: string) => void
  formatLabel: (s: string) => string
}) {
  return (
    <div className="ket-rw-question" id={`reading-q-${question.id}`}>
      <p className="ket-rw-q-prompt">
        <span className="ket-rw-q-num">{question.number}</span>
        {question.prompt}
      </p>
      <div className="ket-rw-radio-list">
        {question.options.map(opt => (
          <label key={opt.id} className="ket-rw-radio">
            <input
              type="radio"
              name={question.id}
              checked={answers[question.id] === opt.id}
              onChange={() => {
                onSelectQuestion(question.id)
                onAnswer(question.id, opt.id)
              }}
            />
            <span>{formatLabel(opt.label)}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function McRadioQuestion({
  question,
  answers,
  onSelectQuestion,
  onAnswer,
}: {
  question: ReadingQuestion
  answers: Record<string, string>
  onSelectQuestion: (id: string) => void
  onAnswer: (id: string, value: string) => void
}) {
  return (
    <div className="ket-rw-question" id={`reading-q-${question.id}`}>
      <p className="ket-rw-q-prompt">
        <span className="ket-rw-q-num">{question.number}</span>
        {question.prompt}
      </p>
      <div className="ket-rw-radio-list">
        {question.options.map(opt => (
          <label key={opt.id} className="ket-rw-radio">
            <input
              type="radio"
              name={question.id}
              checked={answers[question.id] === opt.id}
              onChange={() => {
                onSelectQuestion(question.id)
                onAnswer(question.id, opt.id)
              }}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function InlineMcGap({
  number,
  question,
  value,
  open,
  onToggle,
  onSelect,
}: {
  number: number
  question?: ReadingQuestion
  value: string
  open: boolean
  onToggle: () => void
  onSelect: (optionId: string) => void
}) {
  const selectedLabel = question?.options.find(
    o => o.id.toLowerCase() === value.toLowerCase(),
  )?.label
  return (
    <span className="ket-rw-gap-mc">
      <button
        type="button"
        className={`ket-rw-gap-mc__btn${open ? ' is-open' : ''}${value ? ' is-filled' : ''}`}
        onClick={onToggle}
      >
        <span>{number}</span>
        {selectedLabel && <span className="ket-rw-gap-mc__value">{selectedLabel}</span>}
      </button>
      {open && question && (
        <div className="ket-rw-gap-mc__menu" role="listbox">
          {question.options.map(opt => (
            <button
              key={opt.id}
              type="button"
              role="option"
              className={`ket-rw-gap-mc__option${value === opt.id ? ' is-selected' : ''}`}
              onClick={() => onSelect(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </span>
  )
}

function InlineGapText({
  number,
  value,
  onChange,
  onFocus,
}: {
  number: number
  value: string
  onChange: (v: string) => void
  onFocus?: () => void
}) {
  return (
    <span className="ket-rw-gap-text">
      <span className="ket-rw-gap-text__num">{number}</span>
      <input
        type="text"
        className="ket-rw-gap-input"
        aria-label={`Gap ${number}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        autoComplete="off"
        spellCheck={false}
      />
    </span>
  )
}

function InlineGapDrop({
  number,
  question,
  value,
  bank,
  pickedId,
  onAssign,
  onSelectQuestion,
}: {
  number: number
  question: ReadingQuestion
  value: string
  bank: Array<{ id: string; label: string }>
  pickedId: string | null
  onAssign: (questionId: string, optionId: string) => void
  onSelectQuestion: (id: string) => void
}) {
  const item = bank.find(b => b.id.toLowerCase() === value.toLowerCase())
  return (
    <span className="pet-rw-inline-gap">
      <button
        type="button"
        className={`pet-rw-drag__slot pet-rw-drag__slot--inline${value ? ' is-filled' : ''}`}
        onClick={() => {
          if (pickedId) {
            onAssign(question.id, pickedId)
            return
          }
          onSelectQuestion(question.id)
        }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const opt = e.dataTransfer.getData('text/plain')
          if (opt) onAssign(question.id, opt)
        }}
      >
        <span className="pet-rw-inline-gap__num">{number}</span>
        {item ? (
          <span className="pet-rw-drag__slot-value"><strong>{item.id}</strong> {item.label}</span>
        ) : (
          <span className="pet-rw-drag__slot-placeholder">…</span>
        )}
      </button>
    </span>
  )
}

export function parseWordStem(prompt: string): string {
  const match = prompt.match(/Gap\s*\(\d+\)\s*[—–-]\s*(.+)/i)
  if (match) return match[1].trim()
  const parts = prompt.split(/[—–-]/)
  if (parts.length > 1) return parts[parts.length - 1].trim()
  return prompt.trim()
}

export function parseTransformationPrompt(prompt: string): {
  sentence1: string
  stem: string
  sentence2: string
} {
  const arrowSplit = prompt.split(/\s*(?:→|->)\s*/)
  if (arrowSplit.length < 2) {
    return { sentence1: prompt, stem: '', sentence2: '' }
  }
  const before = arrowSplit[0].trim()
  const after = arrowSplit.slice(1).join(' → ').trim()
  const stemMatch = before.match(/\b([A-Z]{2,})\s*$/)
  const stem = stemMatch ? stemMatch[1] : ''
  const sentence1 = stem ? before.slice(0, before.length - stem.length).trim() : before
  return { sentence1, stem, sentence2: after }
}

function TransformationGapSentence({
  number,
  sentence2,
  value,
  onChange,
  onFocus,
}: {
  number: number
  sentence2: string
  value: string
  onChange: (v: string) => void
  onFocus: () => void
}) {
  const parts = sentence2.split(/…|\.\.\./)
  if (parts.length < 2) {
    return (
      <p className="cae-rw-transform__target">
        {sentence2}
        {' '}
        <InlineGapText number={number} value={value} onChange={onChange} onFocus={onFocus} />
      </p>
    )
  }
  return (
    <p className="cae-rw-transform__target">
      {parts.map((seg, i) => (
        <span key={`seg-${i}`}>
          {seg}
          {i < parts.length - 1 && (
            <InlineGapText number={number} value={value} onChange={onChange} onFocus={onFocus} />
          )}
        </span>
      ))}
    </p>
  )
}

function getFcePart3BodyBlocks(part: ReadingPart) {
  return getBodyTextBlocks(part.passage).filter(
    b => !/^Word stems?:/i.test(b.text?.trim() ?? ''),
  )
}

function getCaeLabeledPassageBlocks(part: ReadingPart) {
  return part.passage.filter(b => {
    if (b.imageKey || b.imageUrl) return false
    const t = b.text?.trim() ?? ''
    return Boolean(t)
  })
}

export default function CaeRwPartContent({
  examId: _examId,
  part,
  answers,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: Props) {
  const questions = useMemo(() => getPartQuestions(part), [part])
  const group = part.questionGroups[0]
  const [openGap, setOpenGap] = useState<number | null>(null)
  const [pickedBankId, setPickedBankId] = useState<string | null>(null)

  const instructionRange = group?.range ?? part.rangeLabel
  const instructionText = group?.instruction ?? ''

  const renderMcGapPassage = (text: string, gapQuestions: ReadingQuestion[]) => {
    const gapNums = gapQuestions.map(q => q.number)
    const prepared = ensureGapDots(text, gapNums)
    const segments = splitKetGapText(prepared)
    return (
      <p className="ket-rw-inline-passage">
        {segments.map((seg, i) => {
          if (seg.kind === 'text') return <span key={`t-${i}`}>{seg.value}</span>
          const q = questionByNumber(gapQuestions, seg.number)
          if (!q) return <span key={`g-${i}`}>({seg.number})</span>
          const ans = answers[q.id] ?? ''
          return (
            <InlineMcGap
              key={`g-${seg.number}`}
              number={seg.number}
              question={q}
              value={ans}
              open={openGap === seg.number}
              onToggle={() => {
                onSelectQuestion(q.id)
                setOpenGap(openGap === seg.number ? null : seg.number)
              }}
              onSelect={optId => {
                onAnswer(q.id, optId)
                setOpenGap(null)
              }}
            />
          )
        })}
      </p>
    )
  }

  const renderOpenGapPassage = (text: string, gapQuestions: ReadingQuestion[]) => {
    const gapNums = gapQuestions.map(q => q.number)
    const prepared = ensureGapDots(text, gapNums)
    const segments = splitKetGapText(prepared)
    return (
      <p className="ket-rw-inline-passage">
        {segments.map((seg, i) => {
          if (seg.kind === 'text') return <span key={`t-${i}`}>{seg.value}</span>
          const q = questionByNumber(gapQuestions, seg.number)
          if (!q) return <span key={`g-${i}`}>({seg.number})</span>
          return (
            <InlineGapText
              key={`g-${seg.number}`}
              number={seg.number}
              value={answers[q.id] ?? ''}
              onChange={v => {
                onSelectQuestion(q.id)
                onAnswer(q.id, v)
              }}
              onFocus={() => onSelectQuestion(q.id)}
            />
          )
        })}
      </p>
    )
  }

  const assignGapLetter = (questionId: string, optionId: string) => {
    const q = questions.find(x => x.id === questionId)
    if (!q) return
    const prev = questions.find(
      x => x.id !== questionId && answers[x.id]?.toUpperCase() === optionId.toUpperCase(),
    )
    if (prev) onAnswer(prev.id, '')
    onAnswer(questionId, optionId.toLowerCase())
    setPickedBankId(null)
    onSelectQuestion(questionId)
  }

  const renderPassageGapDrops = (
    text: string,
    gapQuestions: ReadingQuestion[],
    bank: Array<{ id: string; label: string }>,
  ) => {
    const gapNums = gapQuestions.map(q => q.number)
    const prepared = ensureGapDots(text, gapNums)
    const segments = splitKetGapText(prepared)
    return (
      <p className="ket-rw-inline-passage">
        {segments.map((seg, i) => {
          if (seg.kind === 'text') return <span key={`t-${i}`}>{seg.value}</span>
          const q = questionByNumber(gapQuestions, seg.number)
          if (!q) return <span key={`g-${i}`}>({seg.number})</span>
          return (
            <InlineGapDrop
              key={`g-${seg.number}`}
              number={seg.number}
              question={q}
              value={answers[q.id] ?? ''}
              bank={bank}
              pickedId={pickedBankId}
              onAssign={assignGapLetter}
              onSelectQuestion={onSelectQuestion}
            />
          )
        })}
      </p>
    )
  }

  if (part.partNumber === 1) {
    const bodyBlocks = getBodyTextBlocks(part.passage)
    return (
      <>
        <div className="ket-rw-instruction">
          <p className="ket-rw-instruction__range">{instructionRange}</p>
          <p className="ket-rw-instruction__text">{instructionText}</p>
        </div>
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full">
            <h2 className="ket-rw-passage-title">{part.passageTitle}</h2>
            {bodyBlocks.map((block, idx) => (
              <div key={`p1-${idx}`} className="ket-rw-paragraph">
                {renderMcGapPassage(block.text ?? '', questions)}
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  if (part.partNumber === 2) {
    const bodyBlocks = getBodyTextBlocks(part.passage)
    return (
      <>
        <div className="ket-rw-instruction">
          <p className="ket-rw-instruction__range">{instructionRange}</p>
          <p className="ket-rw-instruction__text">{instructionText}</p>
        </div>
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full">
            <h2 className="ket-rw-passage-title">{part.passageTitle}</h2>
            {bodyBlocks.map((block, idx) => (
              <div key={`p2-${idx}`} className="ket-rw-paragraph">
                {renderOpenGapPassage(block.text ?? '', questions)}
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  if (part.partNumber === 3) {
    const bodyBlocks = getFcePart3BodyBlocks(part)
    const activeQ = questions.find(q => q.id === activeQuestionId) ?? questions[0]
    return (
      <>
        <div className="ket-rw-instruction">
          <p className="ket-rw-instruction__range">{instructionRange}</p>
          <p className="ket-rw-instruction__text">{instructionText}</p>
        </div>
        <KetRwSplitPane
          left={(
            <>
              <h2 className="ket-rw-passage-title">{part.passageTitle}</h2>
              {bodyBlocks.map((block, idx) => (
                <div key={`p3-${idx}`} className="ket-rw-paragraph">
                  {renderOpenGapPassage(block.text ?? '', questions)}
                </div>
              ))}
            </>
          )}
          right={(
            <div className="cae-rw-keyword-list">
              <h3 className="cae-rw-keyword-list__title">Keyword List</h3>
              <ul className="cae-rw-keyword-list__items">
                {questions.map(q => {
                  const stem = parseWordStem(q.prompt)
                  const isActive = activeQ?.id === q.id
                  return (
                    <li key={q.id}>
                      <button
                        type="button"
                        className={`cae-rw-keyword-list__item${isActive ? ' is-active' : ''}${answers[q.id]?.trim() ? ' is-filled' : ''}`}
                        onClick={() => onSelectQuestion(q.id)}
                      >
                        <span className="cae-rw-keyword-list__num">{q.number}</span>
                        <span className="cae-rw-keyword-list__stem">{stem}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        />
      </>
    )
  }

  if (part.partNumber === 4) {
    return (
      <>
        <div className="ket-rw-instruction">
          <p className="ket-rw-instruction__range">{instructionRange}</p>
          <p className="ket-rw-instruction__text">{instructionText}</p>
        </div>
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full cae-rw-transform-list">
            {part.passage.filter(b => b.text?.trim()).map((block, idx) => (
              <p key={`p4-intro-${idx}`} className="ket-rw-paragraph">{block.text}</p>
            ))}
            {questions.map(q => {
              const { sentence1, stem, sentence2 } = parseTransformationPrompt(q.prompt)
              const value = answers[q.id] ?? ''
              const isActive = activeQuestionId === q.id
              return (
                <article
                  key={q.id}
                  id={`reading-q-${q.id}`}
                  className={`cae-rw-transform${isActive ? ' is-active' : ''}`}
                >
                  <p className="cae-rw-transform__source">{sentence1}</p>
                  {stem && <p className="cae-rw-transform__stem">{stem}</p>}
                  <TransformationGapSentence
                    number={q.number}
                    sentence2={sentence2}
                    value={value}
                    onChange={v => onAnswer(q.id, v)}
                    onFocus={() => onSelectQuestion(q.id)}
                  />
                </article>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  if (part.partNumber === 5) {
    return (
      <>
        <div className="ket-rw-instruction">
          <p className="ket-rw-instruction__range">{instructionRange}</p>
          <p className="ket-rw-instruction__text">{instructionText}</p>
        </div>
        <KetRwSplitPane
          left={(
            <>
              <h2 className="ket-rw-passage-title">{part.passageTitle}</h2>
              {getBodyTextBlocks(part.passage).map((block, idx) => (
                <p key={`p5-${idx}`} className="ket-rw-paragraph">{block.text}</p>
              ))}
            </>
          )}
          right={questions.map(q => (
            <McRadioQuestion
              key={q.id}
              question={q}
              answers={answers}
              onSelectQuestion={onSelectQuestion}
              onAnswer={onAnswer}
            />
          ))}
        />
      </>
    )
  }

  if (part.partNumber === 6) {
    return (
      <>
        <div className="ket-rw-instruction">
          <p className="ket-rw-instruction__range">{instructionRange}</p>
          <p className="ket-rw-instruction__text">{instructionText}</p>
        </div>
        <KetRwSplitPane
          left={(
            <>
              <h2 className="ket-rw-passage-title">{part.passageTitle}</h2>
              {getCaeLabeledPassageBlocks(part).map((block, idx) => (
                <CaeLabeledBlock
                  key={`p6-${idx}`}
                  label={block.label}
                  text={block.text ?? ''}
                  formatLabel={formatCaeReviewerLabel}
                />
              ))}
            </>
          )}
          right={(
            <>
              <h3 className="cae-rw-panel-title">Which reviewer</h3>
              {questions.map(q => (
                <CaeLabeledMcQuestion
                  key={q.id}
                  question={q}
                  answers={answers}
                  onSelectQuestion={onSelectQuestion}
                  onAnswer={onAnswer}
                  formatLabel={formatCaeReviewerLabel}
                />
              ))}
            </>
          )}
        />
      </>
    )
  }

  if (part.partNumber === 7) {
    const bank = optionBankFromPassage(part.passage, group!, { partNumber: 7 })
    const bodyBlocks = getBodyTextBlocks(part.passage)
    return (
      <>
        <div className="ket-rw-instruction">
          <p className="ket-rw-instruction__range">{instructionRange}</p>
          <p className="ket-rw-instruction__text">{instructionText}</p>
        </div>
        <KetRwSplitPane
          left={(
            <>
              <h2 className="ket-rw-passage-title">{part.passageTitle}</h2>
              {bodyBlocks.map((block, idx) => (
                <div key={`p7-${idx}`} className="ket-rw-paragraph">
                  {renderPassageGapDrops(block.text ?? '', questions, bank)}
                </div>
              ))}
            </>
          )}
          right={(
            <div className="pet-rw-drag__bank pet-rw-drag__bank--column">
              {bank.map(option => {
                const isUsed = questions.some(
                  q => answers[q.id]?.toUpperCase() === option.id.toUpperCase(),
                )
                const isPicked = pickedBankId === option.id
                return (
                  <div
                    key={option.id}
                    className={`pet-rw-drag__bank-card${isUsed ? ' is-used' : ''}${isPicked ? ' is-picked' : ''}`}
                    draggable={!isUsed}
                    onDragStart={e => {
                      if (isUsed) return
                      e.dataTransfer.setData('text/plain', option.id)
                    }}
                    onClick={() => {
                      if (isUsed) return
                      setPickedBankId(pickedBankId === option.id ? null : option.id)
                    }}
                    role="button"
                    tabIndex={isUsed ? -1 : 0}
                  >
                    <span className="pet-rw-drag__bank-letter">{option.id}</span>
                    <p className="pet-rw-drag__bank-text">{option.label}</p>
                  </div>
                )
              })}
            </div>
          )}
        />
      </>
    )
  }

  if (part.partNumber === 8) {
    return (
      <>
        <div className="ket-rw-instruction">
          <p className="ket-rw-instruction__range">{instructionRange}</p>
          <p className="ket-rw-instruction__text">{instructionText}</p>
        </div>
        <KetRwSplitPane
          left={(
            <>
              <h2 className="ket-rw-passage-title">{part.passageTitle}</h2>
              {getCaeLabeledPassageBlocks(part).map((block, idx) => (
                <CaeLabeledBlock
                  key={`p8-${idx}`}
                  label={block.label}
                  text={block.text ?? ''}
                  formatLabel={formatCaeConsultantLabel}
                />
              ))}
            </>
          )}
          right={(
            <>
              <h3 className="cae-rw-panel-title">Which consultant makes the following statements?</h3>
              {questions.map(q => (
                <CaeLabeledMcQuestion
                  key={q.id}
                  question={q}
                  answers={answers}
                  onSelectQuestion={onSelectQuestion}
                  onAnswer={onAnswer}
                  formatLabel={formatCaeConsultantLabel}
                />
              ))}
            </>
          )}
        />
      </>
    )
  }

  if (part.partNumber === 9 || part.partNumber === 10) {
    const wq = questions[0]
    const text = wq ? answers[wq.id] ?? '' : ''
    const taskLabel = part.partNumber === 9 ? 'Question 1' : 'Question 2'
    return (
      <>
        <div className="ket-rw-instruction">
          <p className="ket-rw-instruction__range">{instructionRange}</p>
          <p className="ket-rw-instruction__text">{instructionText}</p>
        </div>
        <KetRwSplitPane
          left={(
            <div className="ket-rw-writing-prompt">
              <h3>Question {wq?.number ?? (part.partNumber === 9 ? 57 : 58)}</h3>
              <p>Write <strong>{wq?.minWords ?? 220}–260 words</strong>.</p>
              <div className="ket-rw-writing-prompt__body">
                {part.passage.map((block, idx) => (
                  <PassageImage
                    key={`p${part.partNumber}-${idx}`}
                    imageKey={block.imageKey}
                    imageUrl={block.imageUrl}
                    alt={`Writing prompt ${idx + 1}`}
                  />
                ))}
                {part.passage.filter(b => b.text?.trim()).map((block, idx) => (
                  <p key={`p${part.partNumber}t-${idx}`} className="ket-rw-paragraph">{block.text}</p>
                ))}
              </div>
              {wq && <p>{wq.prompt}</p>}
            </div>
          )}
          right={wq ? (
            <>
              <h3 className="cae-rw-panel-title">{taskLabel}</h3>
              <textarea
                className="ket-rw-writing-area"
                value={text}
                onChange={e => onAnswer(wq.id, e.target.value)}
                onFocus={() => onSelectQuestion(wq.id)}
                rows={14}
                placeholder="Write your answer here…"
              />
              <p className="ket-rw-word-count">Words: {countWords(text)}</p>
            </>
          ) : null}
        />
      </>
    )
  }

  return null
}