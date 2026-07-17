import { BookOpen, ChevronUp, Lightbulb, ListTree, RefreshCw, Sparkles } from 'lucide-react'
import type { WritingGuide } from '@ryan/core'

interface Props {
  guide: WritingGuide | null
  loading: boolean
  error: string | null
  open: boolean
  onClose: () => void
  onRegenerate?: () => void
}

export default function WritingGuidePanel({ guide, loading, error, open, onClose, onRegenerate }: Props) {
  if (!open) return null

  return (
    <div className="writing-guide-panel">
      <div className="writing-guide-panel-head">
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <Lightbulb size={16} style={{ color: 'var(--wr-primary)' }} />
          Hướng dẫn & Sample 8.0
        </span>
        <span style={{ display: 'flex', gap: '0.35rem' }}>
          {guide && !guide.sourceHtml && onRegenerate && !loading && (
            <button type="button" className="writing-icon-btn" onClick={onRegenerate} title="Tạo lại gợi ý">
              <RefreshCw size={14} />
            </button>
          )}
          <button type="button" className="writing-icon-btn" onClick={onClose} aria-label="Thu gọn">
            <ChevronUp size={14} />
          </button>
        </span>
      </div>

      {loading && (
        <div className="writing-guide-loading">
          <div className="writing-guide-spinner" />
          <p>AI đang phân tích đề{guide ? '' : ' và ảnh'}…</p>
          <span>Thường mất 15–30 giây</span>
        </div>
      )}

      {error && !loading && (
        <p className="writing-guide-error">{error}</p>
      )}

      {guide && !loading && guide.sourceHtml && (
        <div className="writing-guide-body">
          <div
            className="writing-guide-source"
            dangerouslySetInnerHTML={{ __html: guide.sourceHtml }}
          />
        </div>
      )}

      {guide && !loading && !guide.sourceHtml && (
        <div className="writing-guide-body">
          <section>
            <h4><Sparkles size={14} /> Tóm tắt đề</h4>
            <p>{guide.taskSummary}</p>
          </section>

          {guide.imageAnalysis && (
            <section>
              <h4><BookOpen size={14} /> Phân tích ảnh / biểu đồ</h4>
              <p>{guide.imageAnalysis}</p>
            </section>
          )}

          <section>
            <h4><ListTree size={14} /> Dàn ý gợi ý</h4>
            <div className="writing-guide-outline">
              {guide.outline.map((block, i) => (
                <div key={i} className="writing-guide-outline-block">
                  <p className="writing-guide-outline-heading">{block.heading}</p>
                  <ul>
                    {block.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {guide.keyPhrases.length > 0 && (
            <section>
              <h4>Cụm từ hữu ích</h4>
              <div className="writing-guide-phrases">
                {guide.keyPhrases.map((kp, i) => (
                  <div key={i} className="writing-guide-phrase">
                    <span className="wr-en">{kp.phrase}</span>
                    <span className="wr-vi">{kp.meaningVi}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {guide.tips.length > 0 && (
            <section>
              <h4>Mẹo viết band cao</h4>
              <ul className="writing-guide-tips">
                {guide.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="writing-guide-sample">
            <h4>Bài mẫu Band 8.0</h4>
            <div className="writing-guide-sample-text">{guide.sampleEssay}</div>
            {guide.sampleNote && (
              <p className="writing-guide-sample-note">{guide.sampleNote}</p>
            )}
          </section>
        </div>
      )}
    </div>
  )
}