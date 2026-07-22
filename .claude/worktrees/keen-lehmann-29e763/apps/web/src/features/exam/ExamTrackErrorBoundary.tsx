import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Nhãn khu vực — hiện trong UI khi lỗi */
  label?: string
}

interface State {
  error: Error | null
}

/** Bắt lỗi render — tránh màn trắng im lặng trên track IELTS/Cambridge. */
export default class ExamTrackErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ExamTrackErrorBoundary]', this.props.label ?? 'track', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        className="exam-hub-page"
        style={{ background: 'var(--bg-primary)', padding: '1.5rem' }}
      >
        <div
          className="exam-hub-page__inner"
          style={{
            maxWidth: '36rem',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.25rem 1.35rem',
            background: 'var(--bg-card)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
            }}
          >
            Lỗi giao diện
          </p>
          <h1
            style={{
              margin: '0.4rem 0 0.5rem',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            {this.props.label ?? 'Trang luyện thi'} không hiển thị được
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
            Thử <strong>Ctrl+Shift+R</strong> (hard refresh). Nếu vẫn lỗi, mở Console (F12) và gửi dòng đỏ.
          </p>
          <pre
            style={{
              marginTop: '0.85rem',
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '10rem',
              overflow: 'auto',
            }}
          >
            {error.message}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: '0.85rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '999px',
              border: '1px solid var(--border-color)',
              background: 'var(--color-primary)',
              color: 'var(--text-on-primary, #fff)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }
}
