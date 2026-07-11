import { useMemo, useState } from 'react'
import type { ReadingPart, ReadingPassageBlock, ReadingQuestion } from '../examData'
import { countWords, getPartQuestions, isReadingAnswerCorrect } from '../examData'
import {
  EXAM_REVIEW_COLORS,
  examReviewStatus,
  type ExamReviewStatus,
} from '../examReviewUtils'
import RwHighlightText from '../rwHighlight/RwHighlightText'
import RwInstruction from '../rwHighlight/RwInstruction'
import RwMcRadioQuestion from '../rwHighlight/RwMcRadioQuestion'
import { useBlobMediaUrl } from '../useBlobMediaUrl'
import { ensureGapDots, questionByNumber, splitKetGapText } from './ketRwGapUtils'
import KetRwSplitPane from './KetRwSplitPane'
import { groupKetPart5Passage } from './ketRwEmailUtils'
import KetRwPassagePortrait from './KetRwPassagePortrait'

interface Props {
  part: ReadingPart
  answers: Record<string, string>
  activeQuestionId: string | null
  onSelectQuestion: (id: string) => void
  onAnswer: (id: string, value: string) => void
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
  /** Admin: ô import ảnh chân dung Part 2 */
  canEditPassagePortraits?: boolean
  onPassagePortraitPick?: (blockIndex: number, file: File) => void
  onPassagePortraitClear?: (blockIndex: number) => void
}

/** KET Part 2: mọi block có ảnh hoặc label = profile (không dùng sign-box nuốt text). */
function isKetPart2ProfileBlock(part: ReadingPart, block: ReadingPassageBlock): boolean {
  if (part.partNumber !== 2) return false
  if (block.label?.trim()) return true
  if (block.imageUrl || block.imageKey) return true
  return false
}

function isKetPart2TitleBlock(part: ReadingPart, block: ReadingPassageBlock): boolean {
  if (part.partNumber !== 2) return false
  if (block.label?.trim() || block.imageUrl || block.imageKey) return false
  return Boolean(block.text?.trim())
}

function PassageImage({
  imageKey,
  imageUrl,
  alt,
  fallbackUrl,
}: {
  imageKey?: string
  imageUrl?: string
  alt: string
  /** Khi URL chính 404 (Part 7 story) */
  fallbackUrl?: string
}) {
  const primary = useBlobMediaUrl(imageKey, imageUrl)
  const fallback = useBlobMediaUrl(undefined, fallbackUrl)
  const [useFallback, setUseFallback] = useState(false)
  const src = useFallback ? fallback : primary
  if (!src && !fallback) return null
  return (
    <img
      src={src ?? fallback ?? undefined}
      alt={alt}
      onError={() => {
        if (fallback && !useFallback) setUseFallback(true)
      }}
    />
  )
}

const KET_A2_PART7_CATALOG = [
  '/catalog/reading/ket-a2-test1/part7-p1.jpg',
  '/catalog/reading/ket-a2-test1/part7-p2.jpg',
  '/catalog/reading/ket-a2-test1/part7-p3.jpg',
] as const

function InlineMcGap({
  number,
  question,
  value,
  open,
  onToggle,
  onSelect,
  reviewMode = false,
  reviewStatus = null,
}: {
  number: number
  question?: ReadingQuestion
  value: string
  open: boolean
  onToggle: () => void
  onSelect: (optionId: string) => void
  reviewMode?: boolean
  reviewStatus?: ExamReviewStatus | null
}) {
  const selectedLabel = question?.options.find(o => o.id.toLowerCase() === value.toLowerCase())?.label
  const keyLabel = question?.options.find(o => o.id.toLowerCase() === String(question.answer).toLowerCase())?.label
  const border = reviewStatus ? EXAM_REVIEW_COLORS[reviewStatus].bg : undefined
  return (
    <span
      className="ket-rw-gap-mc"
      style={border ? { outline: `2px solid ${border}`, borderRadius: 6, padding: 2 } : undefined}
    >
      <button
        type="button"
        className={`ket-rw-gap-mc__btn${open ? ' is-open' : ''}${value ? ' is-filled' : ''}`}
        data-highlight-skip
        onClick={() => {
          if (reviewMode) return
          onToggle()
        }}
      >
        <span>{number}</span>
        {selectedLabel && <span className="ket-rw-gap-mc__value">{selectedLabel}</span>}
        {reviewMode && reviewStatus === 'wrong' && keyLabel && (
          <span className="ket-rw-gap-mc__value" style={{ color: EXAM_REVIEW_COLORS.correct.bg }}>
            → {keyLabel}
          </span>
        )}
      </button>
      {open && question && !reviewMode && (
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
  reviewMode = false,
  reviewStatus = null,
  correctAnswer,
}: {
  number: number
  value: string
  onChange: (v: string) => void
  reviewMode?: boolean
  reviewStatus?: ExamReviewStatus | null
  correctAnswer?: string
}) {
  const border = reviewStatus ? EXAM_REVIEW_COLORS[reviewStatus].bg : undefined
  return (
    <span
      className="ket-rw-gap-text"
      style={border ? { outline: `2px solid ${border}`, borderRadius: 6, padding: 2 } : undefined}
    >
      <span className="ket-rw-gap-text__num">{number}</span>
      <input
        type="text"
        className="ket-rw-gap-input"
        aria-label={`Gap ${number}`}
        data-highlight-skip
        value={value}
        readOnly={reviewMode}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      {reviewMode && reviewStatus === 'wrong' && correctAnswer && (
        <span style={{ marginLeft: 4, fontSize: '0.75rem', fontWeight: 700, color: EXAM_REVIEW_COLORS.correct.bg }}>
          → {correctAnswer}
        </span>
      )}
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
  reviewMode = false,
  reviewStatusMap?: Record<string, ExamReviewStatus>,
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
        const st = reviewMode
          ? (reviewStatusMap?.[q.id]
            ?? examReviewStatus(ans, a => isReadingAnswerCorrect(q, a)))
          : null
        if (mode === 'mc') {
          return (
            <InlineMcGap
              key={`g-${seg.number}`}
              number={seg.number}
              question={q}
              value={ans}
              open={openGap === seg.number}
              reviewMode={reviewMode}
              reviewStatus={st}
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
            reviewMode={reviewMode}
            reviewStatus={st}
            correctAnswer={q.answer}
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
  reviewMode = false,
  reviewStatusMap,
  canEditPassagePortraits = false,
  onPassagePortraitPick,
  onPassagePortraitClear,
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
    // Part 2 title (Making friends…)
    if (isKetPart2TitleBlock(part, block)) {
      return (
        <p key={`p2-title-${idx}`} className="ket-rw-paragraph ket-rw-paragraph--title">
          <RwHighlightText blockId={`${partId}-txt-${idx}`} text={block.text} />
        </p>
      )
    }

    // Part 2 profiles: luôn portrait + text (error2: sign-box nuốt text)
    if (isKetPart2ProfileBlock(part, block)) {
      return (
        <div key={`profile-${idx}`} className="ket-rw-profile">
          <KetRwPassagePortrait
            personLabel={block.label}
            imageKey={block.imageKey}
            imageUrl={block.imageUrl}
            canEdit={canEditPassagePortraits}
            onPick={onPassagePortraitPick ? file => onPassagePortraitPick(idx, file) : undefined}
            onClear={onPassagePortraitClear ? () => onPassagePortraitClear(idx) : undefined}
          />
          <div className="ket-rw-profile__body">
            <p className="ket-rw-paragraph">
              {block.label && (
                <RwHighlightText
                  blockId={`${partId}-lbl-${idx}`}
                  text={block.label}
                  className="ket-rw-paragraph__label"
                />
              )}
              {block.text?.trim() ? (
                <RwHighlightText blockId={`${partId}-txt-${idx}`} text={block.text} />
              ) : null}
            </p>
          </div>
        </div>
      )
    }

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
          {renderGapPassage(partId, `p4-${idx}`, block.text, questions, answers, 'mc', openGap, setOpenGap, onAnswer, onSelectQuestion, reviewMode, reviewStatusMap)}
        </div>
      )
    }
    if (part.partNumber === 5) {
      return (
        <div key={`p5-${idx}`}>
          {renderGapPassage(partId, `p5-${idx}`, block.text, questions, answers, 'input', openGap, setOpenGap, onAnswer, onSelectQuestion, reviewMode, reviewStatusMap)}
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
              reviewMode={reviewMode}
              reviewStatus={reviewStatusMap?.[activeQuestion.id]}
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
              {(part.passage.length ? part.passage : [{ text: '' }, { text: '' }, { text: '' }])
                .slice(0, 3)
                .map((block, idx) => {
                  const catalogUrl = KET_A2_PART7_CATALOG[idx]
                  const hasLocal =
                    Boolean(block.imageKey?.trim()) || Boolean(block.imageUrl?.trim())
                  // Chỉ fallback catalog khi import/local không có ảnh — tránh đè blob import
                  const url = block.imageUrl?.trim() || (hasLocal ? undefined : catalogUrl)
                  return (
                    <PassageImage
                      key={`p7-${idx}`}
                      imageKey={block.imageKey}
                      imageUrl={url}
                      fallbackUrl={hasLocal ? undefined : catalogUrl}
                      alt={`Story picture ${idx + 1}`}
                    />
                  )
                })}
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
              reviewMode={reviewMode}
              reviewStatus={reviewStatusMap?.[q.id]}
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
                          reviewMode,
                          reviewStatusMap,
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