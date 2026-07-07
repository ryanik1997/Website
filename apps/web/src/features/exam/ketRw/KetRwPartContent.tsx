import { useMemo, useState } from 'react'
import type { ReadingPart, ReadingQuestion } from '../examData'
import { countWords, getPartQuestions } from '../examData'
import RwHighlightText from '../rwHighlight/RwHighlightText'
import RwInstruction from '../rwHighlight/RwInstruction'
import RwMcRadioQuestion from '../rwHighlight/RwMcRadioQuestion'
import { useBlobMediaUrl } from '../useBlobMediaUrl'
import { ensureGapDots, questionByNumber, splitKetGapText } from './ketRwGapUtils'
import KetRwSplitPane from './KetRwSplitPane'
import { groupKetPart5Passage } from './ketRwEmailUtils'

interface Props {
  part: ReadingPart
  answers: Record<string, string>
  activeQuestionId: string | null
  onSelectQuestion: (id: string) => void
  onAnswer: (id: string, value: string) => void
}

function PassageImage({ imageKey, imageUrl, alt }: { imageKey?: string; imageUrl?: string; alt: string }) {
  const src = useBlobMediaUrl(imageKey, imageUrl)
  if (!src) return null
  return <img src={src} alt={alt} />
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
  const selectedLabel = question?.options.find(o => o.id.toLowerCase() === value.toLowerCase())?.label
  return (
    <span className="ket-rw-gap-mc">
      <button
        type="button"
        className={`ket-rw-gap-mc__btn${open ? ' is-open' : ''}${value ? ' is-filled' : ''}`}
        data-highlight-skip
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
}: {
  number: number
  value: string
  onChange: (v: string) => void
}) {
  return (
    <span className="ket-rw-gap-text">
      <span className="ket-rw-gap-text__num">{number}</span>
      <input
        type="text"
        className="ket-rw-gap-input"
        aria-label={`Gap ${number}`}
        data-highlight-skip
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
    </span>
  )
}

function renderGapPassage(
  partId: string,
  passageKey: string,
  text: string,
  questions: ReadingQuestion[],
  answers: Record<string, string>,
  mode: 'mc' | 'input',
  openGap: number | null,
  setOpenGap: (n: number | null) => void,
  onAnswer: (id: string, value: string) => void,
  onSelectQuestion: (id: string) => void,
) {
  const gapNums = questions.map(q => q.number)
  const prepared = ensureGapDots(text, gapNums)
  const segments = splitKetGapText(prepared)

  return (
    <p className="ket-rw-inline-passage">
      {segments.map((seg, i) => {
        if (seg.kind === 'text') {
          return (
            <RwHighlightText
              key={`t-${i}`}
              blockId={`${partId}-${passageKey}-seg-${i}`}
              text={seg.value}
            />
          )
        }
        const q = questionByNumber(questions, seg.number)
        if (!q) return <span key={`g-${i}`}>({seg.number})</span>
        const ans = answers[q.id] ?? ''
        if (mode === 'mc') {
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
        }
        return (
          <InlineGapText
            key={`g-${seg.number}`}
            number={seg.number}
            value={ans}
            onChange={v => {
              onSelectQuestion(q.id)
              onAnswer(q.id, v)
            }}
          />
        )
      })}
    </p>
  )
}

export default function KetRwPartContent({
  part,
  answers,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: Props) {
  const questions = useMemo(() => getPartQuestions(part), [part])
  const partId = part.id
  const group = part.questionGroups[0]
  const [openGap, setOpenGap] = useState<number | null>(null)

  const activeQuestion = questions.find(q => q.id === activeQuestionId) ?? questions[0]
  const layout = part.partNumber <= 1 ? 'single-focus'
    : part.partNumber <= 3 ? 'split'
      : part.partNumber === 6 ? 'split-writing'
        : 'single'

  const instructionRange = group?.range ?? part.rangeLabel
  const instructionText = group?.instruction ?? ''

  const renderPassageBlocks = (blocks = part.passage) => blocks.map((block, idx) => {
    if (block.imageKey || block.imageUrl) {
      return (
        <div key={`img-${idx}`} className="ket-rw-sign-box">
          <PassageImage
            imageKey={block.imageKey}
            imageUrl={block.imageUrl}
            alt={`${part.passageTitle} ${idx + 1}`}
          />
        </div>
      )
    }
    if (block.label && /^(from|to):?$/i.test(block.label.trim())) {
      const hdr = block.label.trim().replace(/:$/, '')
      return (
        <p key={`hdr-${idx}`} className="ket-rw-email-header">
          <strong>{hdr}:</strong>{' '}
          <RwHighlightText blockId={`${partId}-hdr-${idx}`} text={block.text} />
        </p>
      )
    }
    if (part.partNumber === 4) {
      return (
        <div key={`p4-${idx}`}>
          {renderGapPassage(partId, `p4-${idx}`, block.text, questions, answers, 'mc', openGap, setOpenGap, onAnswer, onSelectQuestion)}
        </div>
      )
    }
    if (part.partNumber === 5) {
      return (
        <div key={`p5-${idx}`}>
          {renderGapPassage(partId, `p5-${idx}`, block.text, questions, answers, 'input', openGap, setOpenGap, onAnswer, onSelectQuestion)}
        </div>
      )
    }
    return (
      <p key={`txt-${idx}`} className="ket-rw-paragraph">
        {block.label && (
          <RwHighlightText
            blockId={`${partId}-lbl-${idx}`}
            text={block.label}
            className="ket-rw-paragraph__label"
          />
        )}
        <RwHighlightText blockId={`${partId}-txt-${idx}`} text={block.text} />
      </p>
    )
  })

  if (part.partNumber === 1 && activeQuestion) {
    const imgIndex = activeQuestion.number - 1
    const signBlock = part.passage[imgIndex]
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full">
            {signBlock?.text && !signBlock.imageKey && !signBlock.imageUrl && (
              <div className="ket-rw-sign-box">
                <RwHighlightText blockId={`${partId}-sign`} text={signBlock.text} />
              </div>
            )}
            {(signBlock?.imageKey || signBlock?.imageUrl) && (
              <div className="ket-rw-sign-box">
                <PassageImage
                  imageKey={signBlock.imageKey}
                  imageUrl={signBlock.imageUrl}
                  alt={`Sign ${activeQuestion.number}`}
                />
              </div>
            )}
            <RwMcRadioQuestion
              partId={partId}
              question={activeQuestion}
              answers={answers}
              onSelectQuestion={onSelectQuestion}
              onAnswer={onAnswer}
            />
          </div>
        </div>
      </>
    )
  }

  if (part.partNumber === 6) {
    const wq = questions[0]
    const text = wq ? answers[wq.id] ?? '' : ''
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <KetRwSplitPane
          left={(
            <div className="ket-rw-writing-prompt">
              <h3>Question {wq?.number ?? 31}</h3>
              <p>Write <strong>{wq?.minWords ?? 25} words or more</strong>.</p>
              <div className="ket-rw-writing-prompt__body">
                {renderPassageBlocks()}
              </div>
              {wq && (
                <p>
                  <RwHighlightText blockId={`${partId}-wq-prompt`} text={wq.prompt} />
                </p>
              )}
            </div>
          )}
          right={wq ? (
            <>
              <textarea
                className="ket-rw-writing-area"
                data-highlight-skip
                value={text}
                onChange={e => onAnswer(wq.id, e.target.value)}
                onFocus={() => onSelectQuestion(wq.id)}
                rows={14}
                placeholder="Write your email here…"
              />
              <p className="ket-rw-word-count">Words: {countWords(text)}</p>
            </>
          ) : null}
        />
      </>
    )
  }

  if (part.partNumber === 7) {
    const wq = questions[0]
    const text = wq ? answers[wq.id] ?? '' : ''
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full">
            <h3 className="ket-rw-passage-title">Question {wq?.number ?? 32}</h3>
            {wq && (
              <p className="ket-rw-q-prompt">
                <RwHighlightText blockId={`${partId}-wq-prompt`} text={wq.prompt} />
              </p>
            )}
            <div className="ket-rw-pictures">
              {part.passage.map((block, idx) => (
                <PassageImage
                  key={`p7-${idx}`}
                  imageKey={block.imageKey}
                  imageUrl={block.imageUrl}
                  alt={`Story picture ${idx + 1}`}
                />
              ))}
            </div>
            {wq && (
              <>
                <textarea
                  className="ket-rw-writing-area"
                  data-highlight-skip
                  value={text}
                  onChange={e => onAnswer(wq.id, e.target.value)}
                  onFocus={() => onSelectQuestion(wq.id)}
                  rows={10}
                  placeholder="Write your story here…"
                />
                <p className="ket-rw-word-count">Words: {countWords(text)}</p>
              </>
            )}
          </div>
        </div>
      </>
    )
  }

  if (layout === 'split') {
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <KetRwSplitPane
          left={(
            <>
              <h2 className="ket-rw-passage-title">
                <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
              </h2>
              {part.passageSubtitle && (
                <p className="ket-rw-passage-subtitle">
                  <RwHighlightText blockId={`${partId}-subtitle`} text={part.passageSubtitle} />
                </p>
              )}
              {renderPassageBlocks()}
            </>
          )}
          right={questions.map(q => (
            <RwMcRadioQuestion
              key={q.id}
              partId={partId}
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

  return (
    <>
      <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
      <div className="ket-rw-body is-single">
        <div className="ket-rw-pane-full">
          {part.partNumber === 4 && (
            <>
              <h2 className="ket-rw-passage-title">
                <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
              </h2>
              {renderPassageBlocks()}
            </>
          )}
          {part.partNumber === 5 && (
            <div className="ket-rw-email-list">
              {groupKetPart5Passage(part.passage).map((email, emailIdx) => (
                <article key={`email-${emailIdx}`} className="ket-rw-email">
                  {(email.from || email.to) && (
                    <header className="ket-rw-email__header">
                      {email.from && (
                        <p className="ket-rw-email__meta">
                          <strong>From:</strong>{' '}
                          <RwHighlightText
                            blockId={`${partId}-email-${emailIdx}-from`}
                            text={email.from}
                          />
                        </p>
                      )}
                      {email.to && (
                        <p className="ket-rw-email__meta">
                          <strong>To:</strong>{' '}
                          <RwHighlightText
                            blockId={`${partId}-email-${emailIdx}-to`}
                            text={email.to}
                          />
                        </p>
                      )}
                    </header>
                  )}
                  <div className="ket-rw-email__body">
                    {email.paragraphs.map((para, paraIdx) => (
                      <div key={`para-${emailIdx}-${paraIdx}`} className="ket-rw-email__paragraph">
                        {renderGapPassage(
                          partId,
                          `email-${emailIdx}-para-${paraIdx}`,
                          para,
                          questions,
                          answers,
                          'input',
                          openGap,
                          setOpenGap,
                          onAnswer,
                          onSelectQuestion,
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}