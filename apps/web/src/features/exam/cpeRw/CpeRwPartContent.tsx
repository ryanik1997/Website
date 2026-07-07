import { useMemo, useState } from 'react'
import type { ReadingPart, ReadingQuestion } from '../examData'
import { countWords, getPartQuestions } from '../examData'
import RwHighlightText from '../rwHighlight/RwHighlightText'
import RwInstruction from '../rwHighlight/RwInstruction'
import RwMcRadioQuestion from '../rwHighlight/RwMcRadioQuestion'
import { rwGapTextSegment } from '../rwHighlight/rwGapTextSegment'
import { useBlobMediaUrl } from '../useBlobMediaUrl'
import KetRwSplitPane from '../ketRw/KetRwSplitPane'
import CaeRwPartContent from '../caeRw/CaeRwPartContent'
import { ensureGapDots, questionByNumber, splitKetGapText } from '../ketRw/ketRwGapUtils'
import {
  getBodyTextBlocks,
  getLabeledOptionBlocks,
  partHasFullPageImage,
} from '../petRw/petRwPassageUtils'
import { normalizeTransformGapText, parseCpeTransformationPrompt } from './cpeRwTransformUtils'

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

function formatSectionLabel(label: string): string {
  const trimmed = label.trim()
  if (/^section\s/i.test(trimmed)) return trimmed
  if (/^[A-E]$/i.test(trimmed)) return `Section ${trimmed.toUpperCase()}`
  return trimmed
}

function SectionBlock({
  partId,
  blockKey,
  label,
  text,
}: {
  partId: string
  blockKey: string
  label?: string
  text: string
}) {
  return (
    <div className="cpe-rw-section-block">
      {label && (
        <p className="cpe-rw-section-block__heading">
          <RwHighlightText
            blockId={`${partId}-${blockKey}-label`}
            text={formatSectionLabel(label)}
          />
        </p>
      )}
      <p className="ket-rw-paragraph">
        <RwHighlightText blockId={`${partId}-${blockKey}-text`} text={text} />
      </p>
    </div>
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
  onFocus: () => void
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

function TransformGapSentence({
  partId,
  questionId,
  number,
  sentence2,
  value,
  onChange,
  onFocus,
}: {
  partId: string
  questionId: string
  number: number
  sentence2: string
  value: string
  onChange: (v: string) => void
  onFocus: () => void
}) {
  const normalized = normalizeTransformGapText(sentence2)
  const parts = normalized.split('…')
  if (parts.length < 2) {
    return (
      <p className="cae-rw-transform__target">
        <RwHighlightText blockId={`${partId}-q-${questionId}-s2`} text={sentence2} />
        {' '}
        <InlineGapText number={number} value={value} onChange={onChange} onFocus={onFocus} />
      </p>
    )
  }
  return (
    <p className="cae-rw-transform__target">
      {parts.map((seg, i) => (
        <span key={`seg-${i}`}>
          <RwHighlightText blockId={`${partId}-q-${questionId}-s2-${i}`} text={seg} />
          {i < parts.length - 1 && (
            <InlineGapText number={number} value={value} onChange={onChange} onFocus={onFocus} />
          )}
        </span>
      ))}
    </p>
  )
}

function getSectionPassageBlocks(part: ReadingPart) {
  return part.passage.filter(b => {
    if (b.imageKey || b.imageUrl) return false
    const t = b.text?.trim() ?? ''
    return Boolean(t) && Boolean(b.label)
  })
}

function getIntroPassageBlocks(part: ReadingPart) {
  return part.passage.filter(b => {
    if (b.imageKey || b.imageUrl || b.label) return false
    const t = b.text?.trim() ?? ''
    return Boolean(t)
  })
}

function cpePart6BodyBlocks(part: ReadingPart) {
  return getBodyTextBlocks(part.passage).filter(
    b => !/^paragraphs?$/i.test(b.text?.trim() ?? ''),
  )
}

function cpePart6Bank(part: ReadingPart) {
  return getLabeledOptionBlocks(part.passage).map(b => ({
    id: b.label!.trim().toUpperCase(),
    label: b.text ?? '',
  }))
}

function usesCaeShell(partNumber: number): boolean {
  return partNumber <= 3 || partNumber === 5
}

export default function CpeRwPartContent(props: Props) {
  const { part, answers, activeQuestionId, onSelectQuestion, onAnswer } = props
  const questions = useMemo(() => getPartQuestions(part), [part])
  const partId = part.id
  const group = part.questionGroups[0]
  const [pickedBankId, setPickedBankId] = useState<string | null>(null)

  if (usesCaeShell(part.partNumber)) {
    return <CaeRwPartContent {...props} />
  }

  const instructionRange = group?.range ?? part.rangeLabel
  const instructionText = group?.instruction ?? ''

  const assignGapLetter = (questionId: string, optionId: string) => {
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

  if (part.partNumber === 4) {
    const activeQ = questions.find(q => q.id === activeQuestionId) ?? questions[0]
    if (!activeQ) return null
    const { sentence1, stem, sentence2 } = parseCpeTransformationPrompt(activeQ.prompt)
    const value = answers[activeQ.id] ?? ''

    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full cpe-rw-transform-single">
            <article className="cae-rw-transform is-active" id={`reading-q-${activeQ.id}`}>
              <p className="cae-rw-transform__source">
                <RwHighlightText blockId={`${partId}-q-${activeQ.id}-s1`} text={sentence1} />
              </p>
              {stem && (
                <p className="cae-rw-transform__stem">
                  <RwHighlightText blockId={`${partId}-q-${activeQ.id}-stem`} text={stem} />
                </p>
              )}
              <TransformGapSentence
                partId={partId}
                questionId={activeQ.id}
                number={activeQ.number}
                sentence2={sentence2}
                value={value}
                onChange={v => onAnswer(activeQ.id, v)}
                onFocus={() => onSelectQuestion(activeQ.id)}
              />
            </article>
          </div>
        </div>
      </>
    )
  }

  if (part.partNumber === 6) {
    const bank = cpePart6Bank(part)
    const bodyBlocks = cpePart6BodyBlocks(part)
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <KetRwSplitPane
          left={(
            <>
              <h2 className="ket-rw-passage-title">
                <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
              </h2>
              {bodyBlocks.map((block, idx) => (
                <div key={`p6-${idx}`} className="ket-rw-paragraph">
                  {renderPassageGapDrops(`p6-${idx}`, block.text ?? '', questions, bank)}
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
      </>
    )
  }

  if (part.partNumber === 7) {
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <KetRwSplitPane
          left={(
            <>
              <h2 className="ket-rw-passage-title">
                <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
              </h2>
              {getIntroPassageBlocks(part).map((block, idx) => (
                <p key={`p7-intro-${idx}`} className="ket-rw-paragraph">
                  <RwHighlightText blockId={`${partId}-p7-intro-${idx}`} text={block.text ?? ''} />
                </p>
              ))}
              {getSectionPassageBlocks(part).map((block, idx) => (
                <SectionBlock
                  key={`p7-${idx}`}
                  partId={partId}
                  blockKey={`p7-${idx}`}
                  label={block.label}
                  text={block.text ?? ''}
                />
              ))}
            </>
          )}
          right={(
            <>
              <h3 className="cpe-rw-panel-title">In which section are the following mentioned?</h3>
              {questions.map(q => (
                <RwMcRadioQuestion
                  key={q.id}
                  partId={partId}
                  question={q}
                  answers={answers}
                  onSelectQuestion={onSelectQuestion}
                  onAnswer={onAnswer}
                  formatOptionLabel={formatSectionLabel}
                />
              ))}
            </>
          )}
        />
      </>
    )
  }

  if (part.partNumber === 8) {
    const wq = questions[0]
    const text = wq ? answers[wq.id] ?? '' : ''
    const pageImage = partHasFullPageImage(part.passage)

    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <KetRwSplitPane
          left={(
            <div className="ket-rw-writing-prompt cpe-rw-writing-image-only">
              {pageImage ? (
                <PassageImage
                  imageKey={pageImage.imageKey}
                  imageUrl={pageImage.imageUrl}
                  alt="Writing Part 8 prompt"
                />
              ) : (
                part.passage.map((block, idx) => (
                  <PassageImage
                    key={`p8-img-${idx}`}
                    imageKey={block.imageKey}
                    imageUrl={block.imageUrl}
                    alt="Writing Part 8 prompt"
                  />
                ))
              )}
            </div>
          )}
          right={wq ? (
            <>
              <h3 className="cpe-rw-panel-title">Question {wq.number} — Write your essay</h3>
              <p className="ket-rw-paragraph" style={{ marginBottom: '0.75rem' }}>
                Write <strong>{wq.minWords ?? 240}–280 words</strong>.
              </p>
              <textarea
                className="ket-rw-writing-area"
                data-highlight-skip
                value={text}
                onChange={e => onAnswer(wq.id, e.target.value)}
                onFocus={() => onSelectQuestion(wq.id)}
                rows={14}
                placeholder="Write your essay here…"
              />
              <p className="ket-rw-word-count">Words: {countWords(text)}</p>
            </>
          ) : null}
        />
      </>
    )
  }

  if (part.partNumber === 9) {
    const activeQ = questions.find(q => q.id === activeQuestionId) ?? questions[0]
    const activeText = activeQ ? answers[activeQ.id] ?? '' : ''
    const pageImage = partHasFullPageImage(part.passage)

    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <KetRwSplitPane
          left={(
            <div className="ket-rw-writing-prompt cpe-rw-writing-image-only">
              {pageImage ? (
                <PassageImage
                  imageKey={pageImage.imageKey}
                  imageUrl={pageImage.imageUrl}
                  alt="Writing Part 9 prompt"
                />
              ) : (
                part.passage.map((block, idx) => (
                  <PassageImage
                    key={`p9-img-${idx}`}
                    imageKey={block.imageKey}
                    imageUrl={block.imageUrl}
                    alt="Writing Part 9 prompt"
                  />
                ))
              )}
            </div>
          )}
          right={activeQ ? (
            <>
              <h3 className="cpe-rw-panel-title">Question {activeQ.number} — Your answer</h3>
              <p className="ket-rw-paragraph" style={{ marginBottom: '0.75rem' }}>
                Write <strong>{activeQ.minWords ?? 280}–320 words</strong>.
              </p>
              <textarea
                className="ket-rw-writing-area"
                data-highlight-skip
                value={activeText}
                onChange={e => onAnswer(activeQ.id, e.target.value)}
                onFocus={() => onSelectQuestion(activeQ.id)}
                rows={14}
                placeholder="Write your answer here…"
              />
              <p className="ket-rw-word-count">Words: {countWords(activeText)}</p>
            </>
          ) : null}
        />
      </>
    )
  }

  return null
}