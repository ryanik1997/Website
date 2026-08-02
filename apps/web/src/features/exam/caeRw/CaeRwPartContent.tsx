import { useMemo, useRef, useState } from 'react'
import type { ReadingPart, ReadingQuestion } from '../examData'
import type { ExamReviewStatus } from '../examReviewUtils'
import { countWords, getPartQuestions } from '../examData'
import RwHighlightText from '../rwHighlight/RwHighlightText'
import RwInstruction from '../rwHighlight/RwInstruction'
import RwMcRadioQuestion from '../rwHighlight/RwMcRadioQuestion'
import RwPart5McGap from '../rwHighlight/RwPart5McGap'
import { rwGapTextSegment } from '../rwHighlight/rwGapTextSegment'
import { useBlobMediaUrl } from '../useBlobMediaUrl'
import KetRwSplitPane from '../ketRw/KetRwSplitPane'
import { ensureGapDots, questionByNumber, splitKetGapText } from '../ketRw/ketRwGapUtils'
import { getBodyTextBlocks, isLetterLabel } from '../petRw/petRwPassageUtils'
import {
  GappedTextBank,
  GappedTextGap,
  type GappedTextOption,
} from '../gappedText/CambridgeGappedText'

interface Props {
  examId: string
  part: ReadingPart
  answers: Record<string, string>
  activeQuestionId: string | null
  onSelectQuestion: (id: string) => void
  onAnswer: (id: string, value: string) => void
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
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
  partId,
  blockKey,
  label,
  text,
  formatLabel,
}: {
  partId: string
  blockKey: string
  label?: string
  text: string
  formatLabel: (s: string) => string
}) {
  return (
    <div className="cae-rw-labeled-block">
      {label && (
        <p className="cae-rw-labeled-block__heading">
          <RwHighlightText
            blockId={`${partId}-${blockKey}-label`}
            text={formatLabel(label)}
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
  wide = false,
}: {
  number: number
  value: string
  onChange: (v: string) => void
  onFocus?: () => void
  wide?: boolean
}) {
  return (
    <span className={`ket-rw-gap-text${wide ? ' cae-rw-gap-text--wide' : ''}`}>
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
  const slot = sentence2.match(/…+|\.{3,}/)
  if (!slot || slot.index === undefined) {
    return (
      <p className="cae-rw-transform__target">
        <RwHighlightText blockId={`${partId}-q-${questionId}-s2`} text={sentence2} />
        {' '}
        <InlineGapText number={number} value={value} onChange={onChange} onFocus={onFocus} wide />
      </p>
    )
  }
  const before = sentence2.slice(0, slot.index)
  const after = sentence2.slice(slot.index + slot[0].length)
  return (
    <p className="cae-rw-transform__target">
      <RwHighlightText blockId={`${partId}-q-${questionId}-s2-before`} text={before} />
      <InlineGapText number={number} value={value} onChange={onChange} onFocus={onFocus} wide />
      <RwHighlightText blockId={`${partId}-q-${questionId}-s2-after`} text={after} />
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

/** Normalize CAE's labeled passage blocks into the stable A–G paragraph bank. */
export function normalizeCaePart7Bank(part: ReadingPart): GappedTextOption[] {
  const bank = part.passage
    .filter(block => isLetterLabel(block.label))
    .map(block => ({
      id: block.label!.trim().toUpperCase(),
      label: block.label!.trim().toUpperCase(),
      text: block.text?.trim() ?? '',
    }))
    .sort((a, b) => a.id.localeCompare(b.id))
  const ids = bank.map(option => option.id)
  const expected = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  const valid = bank.length === 7
    && ids.every((id, index) => id === expected[index])
    && new Set(ids).size === ids.length
    && bank.every(option => option.text.length > 0)
  if (!valid) {
    throw new Error(`[CAE Part 7] Invalid paragraph bank for ${part.id}: ${JSON.stringify({ ids, textLengths: bank.map(option => option.text.length) })}`)
  }
  return bank
}

export default function CaeRwPartContent({
  examId: _examId,
  part,
  answers,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
  reviewMode = false,
  reviewStatusMap,
}: Props) {
  const questions = useMemo(() => getPartQuestions(part), [part])
  const partId = part.id
  const group = part.questionGroups[0]
  const [openGap, setOpenGap] = useState<number | null>(null)
  const [pickedBankId, setPickedBankId] = useState<string | null>(null)
  const draggedBankIdRef = useRef<string | null>(null)

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
            <RwPart5McGap
              key={`g-${seg.number}-${i}`}
              number={seg.number}
              question={q}
              value={ans}
              open={openGap === seg.number}
              onToggle={() => {
                onSelectQuestion(q.id)
                setOpenGap(openGap === seg.number ? null : seg.number)
              }}
              onClose={() => setOpenGap(null)}
              onSelect={optId => {
                onAnswer(q.id, optId)
                setOpenGap(null)
              }}
              disabled={reviewMode}
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
              key={`g-${seg.number}-${i}`}
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
    passageKey: string,
    text: string,
    gapQuestions: ReadingQuestion[],
    bank: GappedTextOption[],
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
            <GappedTextGap
              key={`g-${seg.number}-${i}`}
              number={seg.number}
              questionId={q.id}
              value={answers[q.id] ?? ''}
              options={bank}
              pickedId={pickedBankId}
              draggedIdRef={draggedBankIdRef}
              onAssign={assignGapLetter}
              onClear={id => onAnswer(id, '')}
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
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full">
            <h2 className="ket-rw-passage-title">
              <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
            </h2>
            {bodyBlocks.map((block, idx) => (
              <div key={`p1-${idx}`} className="ket-rw-paragraph">
                {renderMcGapPassage(`p1-${idx}`, block.text ?? '', questions)}
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
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full">
            <h2 className="ket-rw-passage-title">
              <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
            </h2>
            {bodyBlocks.map((block, idx) => (
              <div key={`p2-${idx}`} className="ket-rw-paragraph">
                {renderOpenGapPassage(`p2-${idx}`, block.text ?? '', questions)}
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
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <KetRwSplitPane
          left={(
            <>
              <h2 className="ket-rw-passage-title">
                <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
              </h2>
              {bodyBlocks.map((block, idx) => (
                <div key={`p3-${idx}`} className="ket-rw-paragraph">
                  {renderOpenGapPassage(`p3-${idx}`, block.text ?? '', questions)}
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
                        data-highlight-skip
                        onClick={() => onSelectQuestion(q.id)}
                      >
                        <span className="cae-rw-keyword-list__num" data-question-number-badge="true">{q.number}</span>
                        <span className="cae-rw-keyword-list__stem">
                          <RwHighlightText
                            blockId={`${partId}-q-${q.id}-stem`}
                            text={stem}
                          />
                        </span>
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
    const activeQuestion = questions.find(q => q.id === activeQuestionId) ?? questions[0]
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full cae-rw-transform-list">
            {part.passage.filter(b => b.text?.trim()).map((block, idx) => (
              <p key={`p4-intro-${idx}`} className="ket-rw-paragraph">
                <RwHighlightText blockId={`${partId}-p4-intro-${idx}`} text={block.text ?? ''} />
              </p>
            ))}
            {activeQuestion && [activeQuestion].map(q => {
              const { sentence1, stem, sentence2 } = parseTransformationPrompt(q.prompt)
              const value = answers[q.id] ?? ''
              const isActive = activeQuestionId === q.id
              return (
                <article
                  key={q.id}
                  id={`reading-q-${q.id}`}
                  className={`cae-rw-transform${isActive ? ' is-active' : ''}`}
                >
                  <p className="cae-rw-transform__source">
                    <RwHighlightText blockId={`${partId}-q-${q.id}-s1`} text={sentence1} />
                  </p>
                  {stem && (
                    <p className="cae-rw-transform__stem">
                      <RwHighlightText blockId={`${partId}-q-${q.id}-stem`} text={stem} />
                    </p>
                  )}
                  <TransformationGapSentence
                    partId={partId}
                    questionId={q.id}
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
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <KetRwSplitPane
          left={(
            <>
              <h2 className="ket-rw-passage-title">
                <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
              </h2>
              {getBodyTextBlocks(part.passage).map((block, idx) => (
                <p key={`p5-${idx}`} className="ket-rw-paragraph">
                  <RwHighlightText blockId={`${partId}-p5-${idx}`} text={block.text ?? ''} />
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
              reviewMode={reviewMode}
              reviewStatus={reviewStatusMap?.[q.id]}
            />
          ))}
        />
      </>
    )
  }

  if (part.partNumber === 6) {
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <KetRwSplitPane
          left={(
            <>
              <h2 className="ket-rw-passage-title">
                <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
              </h2>
              {getCaeLabeledPassageBlocks(part).map((block, idx) => (
                <CaeLabeledBlock
                  key={`p6-${idx}`}
                  partId={partId}
                  blockKey={`p6-${idx}`}
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
                <RwMcRadioQuestion
                  key={q.id}
                  partId={partId}
                  question={q}
                  answers={answers}
                  onSelectQuestion={onSelectQuestion}
                  onAnswer={onAnswer}
                  reviewMode={reviewMode}
                  reviewStatus={reviewStatusMap?.[q.id]}
                  formatOptionLabel={formatCaeReviewerLabel}
                />
              ))}
            </>
          )}
        />
      </>
    )
  }

  if (part.partNumber === 7) {
    const bank = normalizeCaePart7Bank(part)
    const bodyBlocks = getBodyTextBlocks(part.passage)
    const assignedIds = new Set(
      questions.map(q => answers[q.id]?.toUpperCase()).filter((id): id is string => Boolean(id)),
    )
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
                <div key={`p7-${idx}`} className="ket-rw-paragraph">
                  {renderPassageGapDrops(`p7-${idx}`, block.text ?? '', questions, bank)}
                </div>
              ))}
            </>
          )}
          right={(
            <GappedTextBank
              options={bank}
              assignedIds={assignedIds}
              pickedId={pickedBankId}
              draggedIdRef={draggedBankIdRef}
              disabled={reviewMode}
              onPick={setPickedBankId}
              onReturn={optionId => {
                const assigned = questions.find(q => answers[q.id]?.toUpperCase() === optionId.toUpperCase())
                if (assigned) onAnswer(assigned.id, '')
                setPickedBankId(null)
              }}
              renderText={option => (
                <RwHighlightText blockId={`${partId}-bank-${option.id}`} text={option.text} />
              )}
            />
          )}
        />
      </>
    )
  }

  if (part.partNumber === 8) {
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <KetRwSplitPane
          left={(
            <>
              <h2 className="ket-rw-passage-title">
                <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
              </h2>
              {getCaeLabeledPassageBlocks(part).map((block, idx) => (
                <CaeLabeledBlock
                  key={`p8-${idx}`}
                  partId={partId}
                  blockKey={`p8-${idx}`}
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
                <RwMcRadioQuestion
                  key={q.id}
                  partId={partId}
                  question={q}
                  answers={answers}
                  onSelectQuestion={onSelectQuestion}
                  onAnswer={onAnswer}
                  reviewMode={reviewMode}
                  reviewStatus={reviewStatusMap?.[q.id]}
                  formatOptionLabel={formatCaeConsultantLabel}
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
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
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
                  <p key={`p${part.partNumber}t-${idx}`} className="ket-rw-paragraph">
                    <RwHighlightText
                      blockId={`${partId}-p${part.partNumber}t-${idx}`}
                      text={block.text ?? ''}
                    />
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
              <h3 className="cae-rw-panel-title">{taskLabel}</h3>
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

  return null
}
