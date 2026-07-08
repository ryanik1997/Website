import { useRef, useState, useEffect, useCallback } from 'react'
import { ImagePlus, Lightbulb, Trash2, RefreshCw, ChevronRight, Loader2, Pencil, ZoomIn, ZoomOut, X } from 'lucide-react'
import type { WritingDoc } from '@ryan/db'
import { readWritingImage } from './writingImage'
import WritingGuidePanel from './WritingGuidePanel'
import type { WritingGuide } from '@ryan/core'

const TYPE_BADGE: Record<string, string> = {
  ielts_task2: 'Opinion Essay',
  ielts_task1: 'Academic Report',
  ielts: 'IELTS Essay',
  master: 'Free Writing',
  cambridge_a2: 'Cambridge A2',
  cambridge_b1: 'Cambridge B1',
  cambridge_b2: 'Cambridge B2',
  cambridge_c1: 'Cambridge C1',
  cambridge_c2: 'Cambridge C2',
}

function splitPrompt(prompt: string): { title: string; body: string } {
  const trimmed = prompt.trim()
  if (!trimmed) return { title: 'Chưa có đề bài', body: '' }
  const lines = trimmed.split(/\n+/)
  if (lines.length === 1) return { title: trimmed, body: '' }
  return { title: lines[0], body: lines.slice(1).join('\n').trim() }
}

interface Props {
  doc: WritingDoc
  onImageChange: (dataUrl: string | undefined) => Promise<void>
  onRequestGuide: () => void
  guide: WritingGuide | null
  guideLoading: boolean
  guideError: string | null
  guideOpen: boolean
  onToggleGuide: () => void
  onCloseGuide: () => void
  onRegenerateGuide: () => void
  onEditPrompt: () => void
}

export default function WritingTopicPanel({
  doc,
  onImageChange,
  onRequestGuide,
  guide,
  guideLoading,
  guideError,
  guideOpen,
  onToggleGuide,
  onCloseGuide,
  onRegenerateGuide,
  onEditPrompt,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [lightbox, setLightbox] = useState(false)
  const [zoom, setZoom] = useState(1)

  const closeLightbox = useCallback(() => { setLightbox(false); setZoom(1) }, [])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 4))
      if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.25))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, closeLightbox])
  const { title, body } = splitPrompt(doc.prompt)
  const badge = TYPE_BADGE[doc.type] ?? doc.type
  const taskTag =
    doc.type === 'ielts_task1' ? 'TASK 1'
      : doc.type === 'ielts_task2' ? 'TASK 2'
        : doc.type.startsWith('cambridge_') ? doc.type.replace('cambridge_', '').toUpperCase()
          : ''

  async function handleFile(file: File) {
    setErr('')
    setBusy(true)
    try {
      const dataUrl = await readWritingImage(file)
      await onImageChange(dataUrl)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không thể tải ảnh.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="writing-topic-card">
      <span className="writing-type-badge">{badge}</span>

      <div className="writing-image-zone">
        {doc.promptImage ? (
          <>
            <img
              src={doc.promptImage}
              alt="Ảnh đề bài"
              style={{ cursor: 'zoom-in' }}
              onClick={() => setLightbox(true)}
            />
            <div className="writing-image-actions">
              <button
                type="button"
                className="writing-icon-btn"
                title="Đổi ảnh"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
              >
                <RefreshCw size={14} />
              </button>
              <button
                type="button"
                className="writing-icon-btn"
                title="Xóa ảnh"
                disabled={busy}
                onClick={() => void onImageChange(undefined)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="writing-image-empty">
            <ImagePlus size={28} style={{ color: 'var(--wr-muted)' }} />
            <p>Import ảnh đề bài (JPG, WEBP)</p>
            <p style={{ fontSize: '0.75rem' }}>Task 1 — biểu đồ, bản đồ, quy trình</p>
            <button
              type="button"
              className="writing-upload-btn"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus size={14} />
              {busy ? 'Đang xử lý…' : 'Chọn ảnh'}
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/webp,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) void handleFile(f)
          }}
        />
      </div>

      {err && (
        <p className="text-xs" style={{ color: 'var(--wr-danger)', margin: 0 }}>{err}</p>
      )}

      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <p className="writing-prompt-label" style={{ margin: 0 }}>Đề bài</p>
          <button
            type="button"
            onClick={onEditPrompt}
            className="writing-icon-btn"
            style={{ width: '1.5rem', height: '1.5rem' }}
            title="Sửa đề bài"
          >
            <Pencil size={12} />
          </button>
        </div>
        <h2 className="writing-prompt-title">{title}</h2>
        {body && (
          <div className="writing-prompt-box">
            <p>{body}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        className="writing-guide-btn"
        disabled={guideLoading}
        onClick={() => {
          if (guide && guideOpen) {
            onToggleGuide()
            return
          }
          if (guide) {
            onToggleGuide()
            return
          }
          onRequestGuide()
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {guideLoading
            ? <Loader2 size={18} className="animate-spin" style={{ color: 'var(--wr-primary)' }} />
            : <Lightbulb size={18} style={{ color: 'var(--wr-primary)' }} />}
          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
            {guideLoading ? 'AI đang tạo gợi ý…' : 'Hướng dẫn viết bài + Sample 8.0'}
          </span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {taskTag && (
            <span
              className="writing-type-badge"
              style={{ fontSize: '0.625rem', padding: '0.15rem 0.45rem' }}
            >
              {taskTag}
            </span>
          )}
          <ChevronRight
            size={16}
            style={{
              color: 'var(--wr-muted)',
              transform: guideOpen ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.15s',
            }}
          />
        </span>
      </button>

      <WritingGuidePanel
        guide={guide}
        loading={guideLoading}
        error={guideError}
        open={guideOpen}
        onClose={onCloseGuide}
        onRegenerate={onRegenerateGuide}
      />

      {lightbox && doc.promptImage && (
        <div className="wr-lightbox-overlay" onClick={closeLightbox}>
          <div className="wr-lightbox-toolbar" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="wr-lightbox-btn"
              title="Thu nhỏ (-)"
              onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))}
            >
              <ZoomOut size={18} />
            </button>
            <span className="wr-lightbox-zoom">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className="wr-lightbox-btn"
              title="Phóng to (+)"
              onClick={() => setZoom(z => Math.min(z + 0.25, 4))}
            >
              <ZoomIn size={18} />
            </button>
            <button
              type="button"
              className="wr-lightbox-btn"
              title="Đóng (Esc)"
              onClick={closeLightbox}
            >
              <X size={18} />
            </button>
          </div>
          <div className="wr-lightbox-scroll" onClick={e => e.stopPropagation()}>
            <img
              src={doc.promptImage}
              alt="Ảnh đề bài"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.15s' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}