import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Headphones } from 'lucide-react'
import {
  formatListeningAnswer,
  getListeningExamQuestions,
  isListeningAnswerCorrect,
  type ListeningExam,
} from './listeningExamData'
import ExamPracticeResultReport, { computeAnswerStats } from './ExamPracticeResultReport'
import type { ExamAiQuestionItem } from './examResultAiAnalyze'
import { createPracticeFromWholeExam, createOrOpenPracticeFromExamPart } from '../listening/examListeningBridge'
import './listeningTest.css'

interface Props {
  exam: ListeningExam
  answers: Record<string, string>
  unsure: Record<string, boolean>
  onRetry: () => void
  onBack: () => void
  onReviewWithPaper: () => void
}

function listeningFramework(exam: ListeningExam): 'ielts' | 'cambridge' | 'other' {
  const t = (exam.examType ?? 'ielts').toString().toLowerCase()
  if (t === 'ielts') return 'ielts'
  if (t === 'ket' || t === 'pet' || t === 'fce' || t === 'cae' || t === 'cpe') return 'cambridge'
  if (/cambridge|ket|pet|fce|cae|cpe/i.test(exam.id) || /cambridge/i.test(exam.bandHint ?? '')) {
    return 'cambridge'
  }
  return 'ielts'
}

export default function ListeningExamResult({
  exam,
  answers,
  unsure,
  onRetry,
  onBack,
  onReviewWithPaper,
}: Props) {
  const navigate = useNavigate()
  const [practiceBusy, setPracticeBusy] = useState(false)
  const [practiceError, setPracticeError] = useState<string | null>(null)
  const questions = getListeningExamQuestions(exam)
  const framework = listeningFramework(exam)
  const unsureCount = questions.filter(q => unsure[q.id]).length

  async function openDictationPractice(partId?: string) {
    setPracticeBusy(true)
    setPracticeError(null)
    try {
      const part = partId
        ? exam.parts.find(p => p.id === partId)
        : exam.parts[0]
      const result = part
        ? await createOrOpenPracticeFromExamPart(exam, part)
        : await createPracticeFromWholeExam(exam)
      navigate(`/app/listening/${result.lesson.id}`)
    } catch (e) {
      setPracticeError(e instanceof Error ? e.message : 'Không tạo được bài luyện')
    } finally {
      setPracticeBusy(false)
    }
  }

  const stats = computeAnswerStats(
    questions.map(q => ({
      id: q.id,
      isCorrect: (ans: string) => isListeningAnswerCorrect(q, ans),
    })),
    answers,
  )

  const aiAnalyzeItems: ExamAiQuestionItem[] = questions.flatMap(q => {
    const raw = answers[q.id] ?? ''
    const ok = isListeningAnswerCorrect(q, raw)
    if (ok) return []
    const status = !raw.trim() ? 'skipped' as const : 'wrong' as const
    const part = exam.parts.find(p => (p.questions ?? []).some(x => x.id === q.id))
    return [{
      number: q.number,
      prompt: [q.context, q.prompt].filter(Boolean).join('\n'),
      userAnswer: formatListeningAnswer(q, raw),
      correctAnswer: formatListeningAnswer(q, q.answer),
      explanation: q.explanation,
      options: (q.options ?? []).map(o => `${o.id.toUpperCase()}. ${o.label}`),
      status,
      partLabel: part
        ? `Part ${part.partNumber}${part.passageTitle ? ` — ${part.passageTitle}` : ''}`
        : undefined,
    }]
  })

  const aiSourceText = exam.parts.map(part => {
    const qs = part.questions ?? []
    const noteBits: string[] = []
    if (part.notePassage?.length) {
      noteBits.push(part.notePassage.map(b => {
        if (typeof b === 'string') return b
        if (b && typeof b === 'object' && 'text' in b) return String((b as { text?: string }).text ?? '')
        return JSON.stringify(b)
      }).filter(Boolean).join('\n'))
    }
    const lines = qs.map(q => {
      const opts = (q.options ?? []).map(o => `${o.id.toUpperCase()}. ${o.label}`).join(' | ')
      return [
        `Q${q.number}: ${[q.context, q.prompt, q.gapLead, q.gapTrail].filter(Boolean).join(' ')}`,
        opts ? `Options: ${opts}` : '',
        q.explanation ? `Note: ${q.explanation}` : '',
      ].filter(Boolean).join('\n')
    })
    return [
      `### Part ${part.partNumber}${part.passageTitle ? `: ${part.passageTitle}` : ''}`,
      part.instruction ?? '',
      ...noteBits,
      ...lines,
    ].filter(Boolean).join('\n')
  }).join('\n\n')

  const detailContent = (
    <div className="listening-exam-result__list" style={{ padding: '1rem 1.15rem 1.5rem' }}>
      {questions.map(question => {
        const userAnswer = answers[question.id] ?? ''
        const isCorrect = isListeningAnswerCorrect(question, userAnswer)
        const wasUnsure = unsure[question.id]
        const skipped = !userAnswer.trim()

        return (
          <article
            key={question.id}
            className={`listening-exam-result__item${
              skipped ? '' : isCorrect ? ' is-correct' : ' is-wrong'
            }`}
          >
            <div className="listening-exam-result__item-head">
              <span className="listening-exam-result__item-num">Câu {question.number}</span>
              <span
                className={`listening-exam-result__badge${
                  skipped ? '' : isCorrect ? ' is-ok' : ' is-bad'
                }`}
              >
                {skipped ? 'Bỏ qua' : isCorrect ? 'Đúng' : 'Sai'}
              </span>
              {wasUnsure && (
                <span className="listening-exam-result__unsure-badge">Chưa chắc chắn</span>
              )}
            </div>
            <p className="listening-exam-result__prompt">{question.prompt}</p>
            <div className="listening-exam-result__answers">
              <p>
                <span className="listening-exam-result__ans-label">Bạn chọn: </span>
                {formatListeningAnswer(question, userAnswer)}
              </p>
              {!isCorrect && (
                <p>
                  <span className="listening-exam-result__ans-label">Đáp án: </span>
                  {formatListeningAnswer(question, question.answer)}
                </p>
              )}
              {/* Cambridge A2–C2: transcript từ Audioscript import. IELTS: dùng AI khi xem cùng đề. */}
              {framework === 'cambridge' && question.ttsText?.trim() && (
                <p className="listening-exam-result__transcript" style={{ marginTop: 6 }}>
                  <span className="listening-exam-result__ans-label">Transcript: </span>
                  {question.ttsText.trim()}
                </p>
              )}
              {question.explanation?.trim()
                && !(framework === 'cambridge' && question.explanation.trim() === question.ttsText?.trim()) && (
                <p className="listening-exam-result__explain">{question.explanation}</p>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )

  const practiceFootnote = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      {unsureCount > 0 && (
        <span>{unsureCount} câu bạn đánh dấu chưa chắc chắn khi làm bài.</span>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          disabled={practiceBusy}
          onClick={() => void openDictationPractice()}
          className="exam-practice-result__btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Headphones size={15} />
          {practiceBusy ? 'Đang tạo…' : 'Luyện dictation / cloze'}
        </button>
        {exam.parts.length > 1 && exam.parts.slice(0, 4).map(p => (
          <button
            key={p.id}
            type="button"
            disabled={practiceBusy}
            onClick={() => void openDictationPractice(p.id)}
            className="exam-practice-result__btn"
            style={{ fontSize: 12, opacity: 0.9 }}
          >
            Part {p.partNumber}
          </button>
        ))}
      </div>
      {practiceError && (
        <span style={{ color: '#ef4444', fontSize: 12 }}>{practiceError}</span>
      )}
      <span style={{ fontSize: 12, opacity: 0.85 }}>
        Tạo bài Thư viện nghe (cùng audio key nếu có) · Ô chữ / Cloze / Tự gõ
      </span>
      <span style={{ fontSize: 12, opacity: 0.9 }}>
        {framework === 'ielts'
          ? <>Transcript: <strong>Xem Cùng Đề Bài</strong> → <strong>Hiện transcript (AI)</strong>.</>
          : <>Transcript: từ Audioscript import và/hoặc <strong>Xem Cùng Đề Bài</strong> → <strong>Hiện transcript (AI)</strong>.</>}
      </span>
    </div>
  )

  return (
    <ExamPracticeResultReport
      skillLabel="Listening"
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
      footnote={practiceFootnote}
    />
  )
}
