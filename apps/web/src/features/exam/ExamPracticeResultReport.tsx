import { useCallback, useState, type ReactNode } from 'react'
import { ArrowLeft, BookOpen, Check, Loader2, RotateCcw, Sparkles, Star, X } from 'lucide-react'
import {
  estimateIeltsBandFromRaw,
  formatIeltsBand,
  resultEncouragement,
} from './examBandScore'
import {
  analyzeExamAnswersWithAi,
  type ExamAiQuestionItem,
} from './examResultAiAnalyze'
import {
  loadExamAiAnalysis,
  saveExamAiAnalysis,
  type ExamAiAnalysisSkill,
} from './examAiAnalysisStorage'
import type { ExamAiEvidence } from './examAiEvidence'
import ExamPracticeSuggestions from './ExamPracticeSuggestionsPanel'
import SunnyMascotSvg from '../../components/SunnyMascotSvg'
import './examPracticeResult.css'

export interface ExamPracticeResultStats {
  correct: number
  skipped: number
  wrong: number
  total: number
}

interface Props {
  skillLabel: 'Reading' | 'Listening'
  examTitle: string
  /** IELTS → band; Cambridge / khác → hiện % hoặc điểm thô */
  framework: 'ielts' | 'cambridge' | 'other'
  stats: ExamPracticeResultStats
  onBack: () => void
  onRetry: () => void
  /**
   * Xem lại đề trên giao diện làm bài (đúng/sai từng câu).
   * Bắt buộc cho UX “Xem Cùng Đề Bài”.
   */
  onReviewWithPaper: () => void
  /** Nội dung bài giải chi tiết (list câu) */
  detailContent?: ReactNode
  footnote?: ReactNode
  /** Câu sai / bỏ qua để AI phân tích cách chọn đáp án */
  aiAnalyzeItems?: ExamAiQuestionItem[]
  /** id đề — lưu AI analysis để mở cùng “Xem cùng đề bài” */
  examId?: string
  /** Passage / transcript để AI trích đoạn tô cam */
  aiSourceText?: string
}

function ResultSun() {
  return <SunnyMascotSvg className="exam-practice-result__sun" />
}

function pct(n: number, total: number): string {
  if (total <= 0) return '0%'
  return `${Math.round((n / total) * 100)}%`
}

export default function ExamPracticeResultReport({
  skillLabel,
  examTitle,
  framework,
  stats,
  onBack,
  onRetry,
  onReviewWithPaper,
  detailContent,
  footnote,
  aiAnalyzeItems = [],
  examId,
  aiSourceText,
}: Props) {
  const skillKey: ExamAiAnalysisSkill = skillLabel === 'Listening' ? 'listening' : 'reading'
  const [showDetail, setShowDetail] = useState(false)
  const [showAi, setShowAi] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiText, setAiText] = useState<string | null>(() =>
    examId ? loadExamAiAnalysis(examId, skillKey) : null,
  )
  const [aiEvidences, setAiEvidences] = useState<ExamAiEvidence[]>([])

  const { correct, skipped, wrong, total } = stats
  const band = estimateIeltsBandFromRaw(correct, total)
  const scoreLabel = framework === 'ielts' ? 'Band IELTS' : 'Điểm số'
  const scoreValue = framework === 'ielts'
    ? formatIeltsBand(band)
    : total > 0
      ? `${Math.round((correct / total) * 100)}%`
      : '—'
  const bubble = resultEncouragement(correct, total)
  const missCount = aiAnalyzeItems.length

  const persistAi = useCallback((text: string, evidences?: ExamAiEvidence[]) => {
    setAiText(text)
    if (evidences) setAiEvidences(evidences)
    if (examId) saveExamAiAnalysis(examId, skillKey, text, evidences)
  }, [examId, skillKey])

  const runAiAnalyze = useCallback(async (force = false) => {
    setShowAi(true)
    setAiError(null)
    if (aiText && !force) return
    setAiLoading(true)
    try {
      const result = await analyzeExamAnswersWithAi({
        skillLabel,
        examTitle,
        framework,
        items: aiAnalyzeItems,
        sourceText: aiSourceText,
      })
      persistAi(result.markdown, result.evidences)
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Không phân tích được. Thử lại sau.')
    } finally {
      setAiLoading(false)
    }
  }, [aiAnalyzeItems, aiSourceText, aiText, examTitle, framework, persistAi, skillLabel])

  const goReviewWithAi = useCallback(() => {
    if (aiText && examId) saveExamAiAnalysis(examId, skillKey, aiText, aiEvidences)
    onReviewWithPaper()
  }, [aiEvidences, aiText, examId, onReviewWithPaper, skillKey])

  return (
    <div className="exam-practice-result">
      <div className="exam-practice-result__inner">
        <div className="exam-practice-result__top">
          <button type="button" className="exam-practice-result__back" onClick={onBack}>
            <ArrowLeft size={18} strokeWidth={2.4} />
            Quay về
          </button>
          <span className="exam-practice-result__badge">Báo cáo kết quả</span>
        </div>

        <div className="exam-practice-result__hero">
          <div>
            <p className="exam-practice-result__kicker">Kết quả bài</p>
            <h1 className="exam-practice-result__skill">{skillLabel}</h1>
            <p className="exam-practice-result__exam-title">{examTitle}</p>
          </div>
          <div className="exam-practice-result__mascot-wrap">
            <div className="exam-practice-result__bubble">{bubble}</div>
            <ResultSun />
          </div>
        </div>

        <div className="exam-practice-result__stats" role="group" aria-label="Thống kê kết quả">
          <div className="exam-practice-result__stat">
            <span className="exam-practice-result__stat-icon exam-practice-result__stat-icon--ok" aria-hidden>
              <Check size={18} strokeWidth={3} />
            </span>
            <span className="exam-practice-result__stat-value">{correct}</span>
            <span className="exam-practice-result__stat-label">câu đúng</span>
            <span className="exam-practice-result__stat-pct">{pct(correct, total)}</span>
          </div>
          <div className="exam-practice-result__stat">
            <span className="exam-practice-result__stat-icon exam-practice-result__stat-icon--skip" aria-hidden>
              −
            </span>
            <span className="exam-practice-result__stat-value">{skipped}</span>
            <span className="exam-practice-result__stat-label">câu bỏ qua</span>
            <span className="exam-practice-result__stat-pct">{pct(skipped, total)}</span>
          </div>
          <div className="exam-practice-result__stat">
            <span className="exam-practice-result__stat-icon exam-practice-result__stat-icon--bad" aria-hidden>
              <X size={18} strokeWidth={3} />
            </span>
            <span className="exam-practice-result__stat-value">{wrong}</span>
            <span className="exam-practice-result__stat-label">câu sai</span>
            <span className="exam-practice-result__stat-pct">{pct(wrong, total)}</span>
          </div>
          <div className="exam-practice-result__stat">
            <span className="exam-practice-result__stat-icon exam-practice-result__stat-icon--band" aria-hidden>
              <Star size={16} strokeWidth={2.5} fill="currentColor" />
            </span>
            <span className="exam-practice-result__stat-value">{scoreValue}</span>
            <span className="exam-practice-result__stat-label">{scoreLabel}</span>
            <span className="exam-practice-result__stat-pct">
              {framework === 'ielts' ? 'Điểm số' : `${correct}/${total}`}
            </span>
          </div>
        </div>

        <ExamPracticeSuggestions
          framework={framework}
          correct={correct}
          total={total}
          band={framework === 'ielts' ? band : undefined}
          skillLabel={skillLabel}
        />

        <div className="exam-practice-result__actions">
          <button type="button" className="exam-practice-result__btn exam-practice-result__btn--primary" onClick={onRetry}>
            <RotateCcw size={16} />
            Làm lại bài
          </button>
          <button
            type="button"
            className="exam-practice-result__btn"
            onClick={goReviewWithAi}
          >
            <BookOpen size={16} />
            Xem Cùng Đề Bài
          </button>
          <button
            type="button"
            className="exam-practice-result__btn"
            onClick={() => setShowDetail(v => !v)}
          >
            <Check size={16} />
            {showDetail ? 'Ẩn bài giải' : 'Bài giải chi tiết'}
          </button>
          <button
            type="button"
            className="exam-practice-result__btn exam-practice-result__btn--ai"
            onClick={() => void runAiAnalyze(false)}
            disabled={aiLoading}
            title={missCount ? `Phân tích ${missCount} câu sai/bỏ qua` : 'AI nhận xét tổng quan'}
          >
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {aiLoading ? 'Đang phân tích…' : 'AI phân tích & giải thích'}
          </button>
        </div>

        {footnote && (
          <div style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{footnote}</div>
        )}

        {showAi && (
          <section className="exam-practice-result__detail" aria-label="AI phân tích đáp án">
            <div className="exam-practice-result__detail-head">
              <h2 className="exam-practice-result__detail-title">
                AI phân tích & giải thích cách chọn đáp án
                {missCount > 0 ? ` (${missCount} câu sai/bỏ qua)` : ''}
              </h2>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {aiText && (
                  <button
                    type="button"
                    className="exam-practice-result__btn"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                    onClick={goReviewWithAi}
                  >
                    <BookOpen size={14} />
                    Xem cùng đề bài
                  </button>
                )}
                <button
                  type="button"
                  className="exam-practice-result__btn"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                  disabled={aiLoading}
                  onClick={() => void runAiAnalyze(true)}
                >
                  {aiLoading ? 'Đang chạy…' : 'Phân tích lại'}
                </button>
                <button
                  type="button"
                  className="exam-practice-result__btn"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={() => setShowAi(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
            <div className="exam-practice-result__detail-body exam-practice-result__ai-body">
              {aiLoading && !aiText && (
                <p style={{ margin: '1rem', color: 'var(--text-muted)' }}>
                  AI đang phân tích câu sai / bỏ qua và cách chọn đáp án đúng…
                </p>
              )}
              {aiError && (
                <p style={{ margin: '1rem', color: 'var(--color-accent)', fontWeight: 600 }}>{aiError}</p>
              )}
              {aiText && (
                <div className="exam-practice-result__ai-md">
                  {aiText.split('\n').map((line, i) => {
                    const t = line.trim()
                    if (!t) return <br key={i} />
                    if (t.startsWith('### ')) {
                      return <h4 key={i} className="exam-practice-result__ai-h4">{t.slice(4)}</h4>
                    }
                    if (t.startsWith('## ')) {
                      return <h3 key={i} className="exam-practice-result__ai-h3">{t.slice(3)}</h3>
                    }
                    if (t.startsWith('# ')) {
                      return <h3 key={i} className="exam-practice-result__ai-h3">{t.slice(2)}</h3>
                    }
                    if (t.startsWith('- ') || t.startsWith('* ')) {
                      return <p key={i} className="exam-practice-result__ai-li">{t.slice(2)}</p>
                    }
                    return <p key={i} className="exam-practice-result__ai-p">{line}</p>
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {showDetail && detailContent && (
          <section className="exam-practice-result__detail" aria-label="Bài giải chi tiết">
            <div className="exam-practice-result__detail-head">
              <h2 className="exam-practice-result__detail-title">Bài giải chi tiết</h2>
              <button
                type="button"
                className="exam-practice-result__btn"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => setShowDetail(false)}
              >
                Đóng
              </button>
            </div>
            <div className="exam-practice-result__detail-body">{detailContent}</div>
          </section>
        )}
      </div>
    </div>
  )
}

/** Tính correct / skipped / wrong từ danh sách scorable. */
export function computeAnswerStats(
  items: Array<{ id: string; isCorrect: (answer: string) => boolean }>,
  answers: Record<string, string>,
): ExamPracticeResultStats {
  let correct = 0
  let skipped = 0
  let wrong = 0
  for (const item of items) {
    const raw = answers[item.id] ?? ''
    if (!raw.trim()) {
      skipped++
      continue
    }
    if (item.isCorrect(raw)) correct++
    else wrong++
  }
  return { correct, skipped, wrong, total: items.length }
}
