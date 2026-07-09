import { useState } from 'react'
import { Columns2, Copy, Check, Replace, Sparkles, Loader2 } from 'lucide-react'
import type { WritingRewrite } from '@ryan/core'
import { copyToClipboard } from '../../lib/copyToClipboard'

interface Props {
  original: string
  rewrite: WritingRewrite | null
  loading: boolean
  error: string | null
  onRequestRewrite: () => void
  onApplyRewrite: (text: string) => void
}

export default function RewriteComparePanel({
  original,
  rewrite,
  loading,
  error,
  onRequestRewrite,
  onApplyRewrite,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [side, setSide] = useState<'split' | 'v2'>('split')

  async function copyV2() {
    if (!rewrite?.rewrittenText) return
    const ok = await copyToClipboard(rewrite.rewrittenText)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    }
  }

  return (
    <div className="wr-rewrite-panel">
      <div className="wr-rewrite-head">
        <span className="wr-rewrite-title">
          <Columns2 size={14} />
          Rubric → Version 2 (side-by-side)
        </span>
        <div className="wr-rewrite-actions">
          {rewrite && (
            <>
              <button
                type="button"
                className={`wr-rewrite-tab${side === 'split' ? ' is-active' : ''}`}
                onClick={() => setSide('split')}
              >
                So sánh
              </button>
              <button
                type="button"
                className={`wr-rewrite-tab${side === 'v2' ? ' is-active' : ''}`}
                onClick={() => setSide('v2')}
              >
                Chỉ V2
              </button>
            </>
          )}
          <button
            type="button"
            className="writing-btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            onClick={onRequestRewrite}
            disabled={loading || !original.trim()}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {rewrite ? 'Tạo lại V2' : 'Viết lại Version 2'}
          </button>
        </div>
      </div>

      {error && (
        <p className="wr-rewrite-error">{error}</p>
      )}

      {loading && (
        <div className="wr-rewrite-loading">
          <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          <p>AI đang viết lại bài theo rubric…</p>
        </div>
      )}

      {!loading && !rewrite && !error && (
        <p className="wr-rewrite-hint">
          Sau khi chấm điểm, bấm <strong>Viết lại Version 2</strong> để xem bản cải thiện
          cạnh bài gốc (giữ ý, nâng band/score).
        </p>
      )}

      {!loading && rewrite && (
        <>
          {rewrite.changeSummary && (
            <p className="wr-rewrite-summary">{rewrite.changeSummary}</p>
          )}

          <div className={`wr-rewrite-cols${side === 'v2' ? ' wr-rewrite-cols--single' : ''}`}>
            {side === 'split' && (
              <div className="wr-rewrite-col">
                <div className="wr-rewrite-col-label">Bản gốc (V1)</div>
                <pre className="wr-rewrite-text">{original}</pre>
              </div>
            )}
            <div className="wr-rewrite-col wr-rewrite-col--v2">
              <div className="wr-rewrite-col-label">Version 2 (cải thiện)</div>
              <pre className="wr-rewrite-text">{rewrite.rewrittenText}</pre>
              <div className="wr-rewrite-col-actions">
                <button type="button" className="writing-btn-secondary" onClick={() => void copyV2()}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Đã copy' : 'Copy V2'}
                </button>
                <button
                  type="button"
                  className="writing-btn-primary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
                  onClick={() => onApplyRewrite(rewrite.rewrittenText)}
                >
                  <Replace size={13} />
                  Dùng V2 làm bài
                </button>
              </div>
            </div>
          </div>

          {rewrite.changes?.length > 0 && (
            <div className="wr-rewrite-list">
              <p className="wr-rewrite-list-title">Thay đổi chính</p>
              <ul>
                {rewrite.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {rewrite.focusNotes?.length > 0 && (
            <div className="wr-rewrite-list">
              <p className="wr-rewrite-list-title">Học từ bản V2</p>
              <ul>
                {rewrite.focusNotes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
