import {
  formatReadingAnswer,
  getExamQuestions,
  getScorableExamQuestions,
  isCambridgeReadingWritingExam,
  isReadingAnswerCorrect,
  isWritingTaskQuestion,
  type ReadingExam,
} from './examData'
import ExamPracticeResultReport, { computeAnswerStats } from './ExamPracticeResultReport'
import type { ExamAiQuestionItem } from './examResultAiAnalyze'
import CambridgeRwWritingGradePanel from './CambridgeRwWritingGradePanel'
import AddExamMistakeButton from '../vocab/AddExamMistakeButton'
import type { ExamMistakePayload } from '../vocab/AddExamMistakeButton'
import './readingTest.css'

interface Props {
  exam: ReadingExam
  answers: Record<string, string>
  onRetry: () => void
  onBack: () => void
  /** Mở lại giao diện làm bài ở chế độ review (đúng/sai) */
  onReviewWithPaper: () => void
}

function readingFramework(exam: ReadingExam): 'ielts' | 'cambridge' | 'other' {
  if (exam.examTrack === 'cambridge' || exam.cambridgeLevel) return 'cambridge'
  if (exam.examTrack === 'ielts' || /ielts/i.test(exam.bandHint ?? '') || /ielts/i.test(exam.id)) {
    return 'ielts'
  }
  // Default Academic library → IELTS band
  return 'ielts'
}

export default function ExamResult({ exam, answers, onRetry, onBack, onReviewWithPaper }: Props) {
  const allQuestions = getExamQuestions(exam)
  const scorable = getScorableExamQuestions(exam)
  const hasWriting = allQuestions.some(isWritingTaskQuestion)
  const framework = readingFramework(exam)

  const stats = computeAnswerStats(
    scorable.map(q => ({
      id: q.id,
      isCorrect: (ans: string) => isReadingAnswerCorrect(q, ans),
    })),
    answers,
  )

  const aiAnalyzeItems: ExamAiQuestionItem[] = scorable.flatMap(q => {
    if (isWritingTaskQuestion(q)) return []
    const raw = answers[q.id] ?? ''
    const ok = isReadingAnswerCorrect(q, raw)
    if (ok) return []
    const status = !raw.trim() ? 'skipped' as const : 'wrong' as const
    // Tìm group để format matching-headings + part label
    let headings: { id: string; label: string }[] | undefined
    let partLabel: string | undefined
    for (const part of exam.parts) {
      for (const g of part.questionGroups) {
        if (g.questions.some(x => x.id === q.id)) {
          partLabel = `Part ${part.partNumber}${part.passageTitle ? ` — ${part.passageTitle}` : ''}`
          if (g.headings?.length) headings = g.headings
          break
        }
      }
      if (partLabel) break
    }
    const ctx = headings ? { headings } : undefined
    return [{
      number: q.number,
      prompt: q.prompt,
      userAnswer: formatReadingAnswer(q, raw, ctx),
      correctAnswer: formatReadingAnswer(q, q.answer, ctx),
      explanation: q.explanation,
      options: (q.options ?? []).map(o => `${o.id.toUpperCase()}. ${o.label}`),
      status,
      partLabel,
    }]
  })

  const aiSourceText = exam.parts.map(part => {
    const body = part.passage
      .map(b => [b.label, b.text].filter(Boolean).join(' '))
      .filter(Boolean)
      .join('\n')
    return [
      `### Part ${part.partNumber}: ${part.passageTitle ?? ''}`.trim(),
      part.passageSubtitle ?? '',
      body,
    ].filter(Boolean).join('\n')
  }).join('\n\n')

  const detailContent = (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
      {hasWriting && isCambridgeReadingWritingExam(exam) && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Reading chấm tự động; Part Writing chấm bằng AI (bên dưới từng câu Writing).
        </p>
      )}
      {exam.parts.map(part => (
        <section
          key={part.id}
          className="rounded-[24px] border p-5 sm:p-6"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              Part {part.partNumber}
            </p>
            <h2 className="mt-1 text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              {part.passageTitle}
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {part.questionGroups.flatMap(group => group.questions.map(question => ({ group, question }))).map(({ group, question }) => {
              const userAnswer = answers[question.id] ?? ''
              const isWriting = isWritingTaskQuestion(question)
              const isCorrect = isWriting ? null : isReadingAnswerCorrect(question, userAnswer)
              const answerContext = group.type === 'matching-headings' ? { headings: group.headings } : undefined
              const skipped = !isWriting && !userAnswer.trim()

              return (
                <article
                  key={question.id}
                  className="rounded-2xl border p-4"
                  style={{
                    background: 'var(--bg-primary)',
                    borderColor: isWriting
                      ? 'var(--border-color)'
                      : skipped
                        ? 'color-mix(in srgb, #f1c40f 42%, var(--border-color))'
                        : isCorrect
                          ? 'color-mix(in srgb, #22c55e 42%, var(--border-color))'
                          : 'color-mix(in srgb, #ef4444 32%, var(--border-color))',
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                      Câu {question.number}
                    </span>
                    {!isWriting && (
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                        style={{
                          background: skipped
                            ? 'color-mix(in srgb, #f1c40f 18%, transparent)'
                            : isCorrect
                              ? 'color-mix(in srgb, var(--color-primary) 14%, transparent)'
                              : 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                          color: skipped ? '#b8860b' : isCorrect ? 'var(--color-primary)' : 'var(--color-accent)',
                        }}
                      >
                        {skipped ? 'Bỏ qua' : isCorrect ? 'Đúng' : 'Sai'}
                      </span>
                    )}
                    {isWriting && (
                      <span className="reading-test-inferred-badge">Writing — chấm AI</span>
                    )}
                    {question.answerConfidence === 'inferred' && (
                      <span className="reading-test-inferred-badge">Đáp án AI đoán</span>
                    )}
                  </div>

                  <p className="mt-3 text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {question.prompt}
                  </p>

                  <div className="mt-3 grid gap-2">
                    <div className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Bạn chọn: </span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {formatReadingAnswer(question, userAnswer, answerContext)}
                      </span>
                    </div>
                    {!isWriting && (
                      <div className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--border-color)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Đáp án đúng: </span>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {formatReadingAnswer(question, question.answer, answerContext)}
                        </span>
                      </div>
                    )}
                  </div>

                  {isWriting && isCambridgeReadingWritingExam(exam) ? (
                    <CambridgeRwWritingGradePanel
                      exam={exam}
                      part={part}
                      question={question}
                      userAnswer={userAnswer}
                    />
                  ) : (
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {question.explanation}
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )

  const mistakeItems: ExamMistakePayload[] = scorable.flatMap(q => {
    if (isWritingTaskQuestion(q)) return []
    const raw = answers[q.id] ?? ''
    if (isReadingAnswerCorrect(q, raw)) return []
    const correct = formatReadingAnswer(q, q.answer)
    const phrase = (correct || q.answer || '').trim()
    if (!phrase || phrase.length > 80) return []
    // Prefer short answer keys / words as phrase
    const short = phrase.split(/[/;|]/)[0]?.trim() || phrase
    return [{
      phrase: short.slice(0, 60),
      meaning: q.explanation?.trim() || q.prompt.slice(0, 120),
      example: q.prompt,
      sourceExamId: exam.id,
      sourceLabel: exam.title,
      book: exam.examTrack === 'cambridge' ? (exam.cambridgeLevel ? `Cambridge ${exam.cambridgeLevel}` : 'Cambridge') : 'IELTS',
    }]
  })

  return (
    <ExamPracticeResultReport
      skillLabel="Reading"
      examTitle={exam.title}
      framework={framework}
      stats={stats}
      onBack={onBack}
      onRetry={onRetry}
      onReviewWithPaper={onReviewWithPaper}
      detailContent={detailContent}
      aiAnalyzeItems={aiAnalyzeItems}
      examId={exam.id}
      aiSourceText={aiSourceText}
      footnote={
        <>
          {mistakeItems.length > 0 && (
            <div className="mb-3">
              <AddExamMistakeButton
                items={mistakeItems}
                label={`Lưu ${mistakeItems.length} lỗi → Exam mistakes + SRS`}
              />
            </div>
          )}
          {scorable.length < allQuestions.length
            ? `Chấm ${stats.total} câu Reading (Writing không tính đúng/sai tự động).`
            : null}
        </>
      }
    />
  )
}
