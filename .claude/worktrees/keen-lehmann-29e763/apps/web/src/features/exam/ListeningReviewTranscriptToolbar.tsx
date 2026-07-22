import { Loader2, Sparkles } from 'lucide-react'

interface Props {
  loading: boolean
  error: string | null
  aiCount: number
  importedCount: number
  onRunAi: (force: boolean) => void
  /** Cambridge: có cả import + AI */
  variant?: 'ielts' | 'cambridge'
}

/** Thanh bật transcript AI khi xem lại Listening. */
export default function ListeningReviewTranscriptToolbar({
  loading,
  error,
  aiCount,
  importedCount,
  onRunAi,
  variant = 'ielts',
}: Props) {
  const labelIdle = aiCount > 0
    ? 'Tạo lại transcript (AI)'
    : variant === 'cambridge' && importedCount > 0
      ? 'Bổ sung / làm rõ transcript (AI)'
      : 'Hiện transcript (AI)'

  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        padding: '0.45rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
      }}
    >
      <button
        type="button"
        className="listening-exam-btn listening-exam-btn--primary"
        disabled={loading}
        onClick={() => onRunAi(aiCount > 0)}
        title={
          variant === 'cambridge'
            ? 'Gọi AI tạo/làm rõ transcript (song song nguồn answer-key / audioscript)'
            : 'Gọi AI tạo transcript từng câu để xem cùng đề'
        }
      >
        {loading
          ? <Loader2 size={14} className="animate-spin" />
          : <Sparkles size={14} />}
        {loading ? 'Đang tạo transcript…' : labelIdle}
      </button>
      {importedCount > 0 ? (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Import: {importedCount} câu có transcript
        </span>
      ) : variant === 'cambridge' ? (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Chưa gắn transcript từ file — ZIP cần <code>audioscript.txt</code> rồi import lại (hoặc bấm AI).
        </span>
      ) : null}
      {aiCount > 0 && (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          AI: {aiCount} câu
        </span>
      )}
      {error && (
        <span style={{ fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  )
}
