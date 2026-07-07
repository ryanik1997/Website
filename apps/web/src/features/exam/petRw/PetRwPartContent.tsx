import { useMemo, useState } from 'react'
import type { ReadingPart, ReadingQuestion } from '../examData'
import { countWords, getPartQuestions } from '../examData'
import { readingExamMediaKey } from '../importReadingManualUtils'
import RwHighlightText from '../rwHighlight/RwHighlightText'
import RwInstruction from '../rwHighlight/RwInstruction'
import RwMcRadioQuestion from '../rwHighlight/RwMcRadioQuestion'
import { rwGapTextSegment } from '../rwHighlight/rwGapTextSegment'
import { useBlobMediaUrl } from '../useBlobMediaUrl'
import KetRwSplitPane from '../ketRw/KetRwSplitPane'
import { ensureGapDots, questionByNumber, splitKetGapText } from '../ketRw/ketRwGapUtils'
import PetRwDragMatch from './PetRwDragMatch'
import {
  getBodyTextBlocks,
  optionBankFromPassage,
  partHasFullPageImage,
  personImageFileForQuestion,
} from './petRwPassageUtils'

interface Props {
  examId: string
  part: ReadingPart
  answers: Record<string, string>
  activeQuestionId: string | null
  onSelectQuestion: (id: string) => void
  onAnswer: (id: string, value: string) => void
  allowPersonPhotoUpload?: boolean
  onPersonPhotoUpload?: (questionNumber: number, file: File) => void
  personPhotoPreviewUrl?: (questionNumber: number) => string | undefined
}

function PassageImage({ imageKey, imageUrl, alt }: { imageKey?: string; imageUrl?: string; alt: string }) {
  const src = useBlobMediaUrl(imageKey, imageUrl)
  if (!src) return null
  return <img src={src} alt={alt} className="pet-rw-page-image" />
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
        data-highlight-skip
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

export default function PetRwPartContent({
  examId,
  part,
  answers,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
  allowPersonPhotoUpload = false,
  onPersonPhotoUpload,
  personPhotoPreviewUrl,
}: Props) {
  const questions = useMemo(() => getPartQuestions(part), [part])
  const partId = part.id
  const group = part.questionGroups[0]
  const [openGap, setOpenGap] = useState<number | null>(null)
  const [pickedBankId, setPickedBankId] = useState<string | null>(null)

  const activeQuestion = questions.find(q => q.id === activeQuestionId) ?? questions[0]
  const instructionRange = group?.range ?? part.rangeLabel
  const instructionText = group?.instruction ?? ''

  const renderMcGapPassage = (
    passageKey: string,
    text: string,
    gapQuestions: ReadingQuestion[],
  ) => {
    const gapNums = gapQuestions.map(q => q.number)
    const prepared = ensureGapDots(text, gapNums)
    const segments = splitKetGapText(prepared)
    return (
      <p className="ket-rw-inline-passage">
        {segments.map((seg, i) => {
          if (seg.kind === 'text') return rwGapTextSegment(partId, passageKey, i, seg.value)
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

  const renderOpenGapPassage = (
    passageKey: string,
    text: string,
    gapQuestions: ReadingQuestion[],
  ) => {
    const gapNums = gapQuestions.map(q => q.number)
    const prepared = ensureGapDots(text, gapNums)
    const segments = splitKetGapText(prepared)
    return (
      <p className="ket-rw-inline-passage">
        {segments.map((seg, i) => {
          if (seg.kind === 'text') return rwGapTextSegment(partId, passageKey, i, seg.value)
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
    passageKey: string,
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
          if (seg.kind === 'text') return rwGapTextSegment(partId, passageKey, i, seg.value)
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

  if (part.partNumber === 1 && activeQuestion) {
    const imgIndex = activeQuestion.number - 1
    const signBlock = part.passage[imgIndex]
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full">
            <PassageImage
              imageKey={signBlock?.imageKey}
              imageUrl={signBlock?.imageUrl}
              alt={`Sign ${activeQuestion.number}`}
            />
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

  if (part.partNumber === 2) {
    const pageImage = partHasFullPageImage(part.passage)
    const bank = optionBankFromPassage(part.passage, group!, {
      partNumber: 2,
      compact: Boolean(pageImage),
    })
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        {pageImage ? (
          <div className="ket-rw-body is-single">
            <div className="ket-rw-pane-full">
              <PassageImage
                imageKey={pageImage.imageKey}
                imageUrl={pageImage.imageUrl}
                alt="Part 2"
              />
              <PetRwDragMatch
                partId={partId}
                slots={questions}
                bank={bank}
                answers={answers}
                activeQuestionId={activeQuestionId}
                slotImageKey={q => readingExamMediaKey(examId, personImageFileForQuestion(q.number))}
                slotPhotoPreviewUrl={q => personPhotoPreviewUrl?.(q.number)}
                allowPhotoUpload={allowPersonPhotoUpload}
                onPhotoUpload={onPersonPhotoUpload}
                onAnswer={onAnswer}
                onSelectQuestion={onSelectQuestion}
              />
            </div>
          </div>
        ) : (
          <div className="ket-rw-body is-single">
            <div className="ket-rw-pane-full">
              <PetRwDragMatch
                partId={partId}
                slots={questions}
                bank={bank}
                answers={answers}
                activeQuestionId={activeQuestionId}
                slotImageKey={q => readingExamMediaKey(examId, personImageFileForQuestion(q.number))}
                slotPhotoPreviewUrl={q => personPhotoPreviewUrl?.(q.number)}
                allowPhotoUpload={allowPersonPhotoUpload}
                onPhotoUpload={onPersonPhotoUpload}
                onAnswer={onAnswer}
                onSelectQuestion={onSelectQuestion}
              />
            </div>
          </div>
        )}
      </>
    )
  }

  if (part.partNumber === 3) {
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
              {getBodyTextBlocks(part.passage).map((block, idx) => (
                <p key={`p3-${idx}`} className="ket-rw-paragraph">
                  <RwHighlightText blockId={`${partId}-p3-${idx}`} text={block.text ?? ''} />
                </p>
              ))}
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

  if (part.partNumber === 4) {
    const pageImage = partHasFullPageImage(part.passage)
    const bank = optionBankFromPassage(part.passage, group!, { partNumber: 4 })
    const bodyBlocks = getBodyTextBlocks(part.passage)
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        {pageImage ? (
          <div className="ket-rw-body is-single">
            <PassageImage imageKey={pageImage.imageKey} imageUrl={pageImage.imageUrl} alt="Part 4" />
          </div>
        ) : (
          <KetRwSplitPane
            left={(
              <>
                <h2 className="ket-rw-passage-title">
                  <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
                </h2>
                {bodyBlocks.map((block, idx) => (
                  <div key={`p4b-${idx}`} className="ket-rw-paragraph">
                    {renderPassageGapDrops(`p4b-${idx}`, block.text ?? '', questions, bank)}
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
                      data-highlight-skip
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
                      <p className="pet-rw-drag__bank-text">
                        <RwHighlightText
                          blockId={`${partId}-bank-${option.id}`}
                          text={option.label}
                        />
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          />
        )}
      </>
    )
  }

  if (part.partNumber === 5) {
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full">
            <h2 className="ket-rw-passage-title">
              <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
            </h2>
            {getBodyTextBlocks(part.passage).map((block, idx) => (
              <div key={`p5-${idx}`}>
                {renderMcGapPassage(`p5-${idx}`, block.text ?? '', questions)}
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  if (part.partNumber === 6) {
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full">
            <h2 className="ket-rw-passage-title">
              <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
            </h2>
            {getBodyTextBlocks(part.passage).map((block, idx) => (
              <div key={`p6-${idx}`} className="ket-rw-paragraph">
                {renderOpenGapPassage(`p6-${idx}`, block.text ?? '', questions)}
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  if (part.partNumber === 7) {
    const wq = questions[0]
    const text = wq ? answers[wq.id] ?? '' : ''
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <KetRwSplitPane
          left={(
            <div className="ket-rw-writing-prompt">
              <h3>Question {wq?.number ?? 33}</h3>
              <p>Write <strong>{wq?.minWords ?? 100} words or more</strong>.</p>
              <div className="ket-rw-writing-prompt__body">
                {part.passage.map((block, idx) => (
                  <PassageImage
                    key={`p7-${idx}`}
                    imageKey={block.imageKey}
                    imageUrl={block.imageUrl}
                    alt={`Writing prompt ${idx + 1}`}
                  />
                ))}
                {part.passage.filter(b => b.text?.trim()).map((block, idx) => (
                  <p key={`p7t-${idx}`} className="ket-rw-paragraph">
                    <RwHighlightText blockId={`${partId}-p7t-${idx}`} text={block.text ?? ''} />
                  </p>
                ))}
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
                placeholder="Write your answer here…"
              />
              <p className="ket-rw-word-count">Words: {countWords(text)}</p>
            </>
          ) : null}
        />
      </>
    )
  }

  if (part.partNumber === 8) {
    const wq = questions[0]
    const text = wq ? answers[wq.id] ?? '' : ''
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full">
            <h3 className="ket-rw-passage-title">Question {wq?.number ?? 34}</h3>
            {wq && (
              <p className="ket-rw-q-prompt">
                <RwHighlightText blockId={`${partId}-wq-prompt`} text={wq.prompt} />
              </p>
            )}
            <div className="ket-rw-pictures">
              {part.passage.map((block, idx) => (
                <PassageImage
                  key={`p8-${idx}`}
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

  return null
}