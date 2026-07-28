import { Copy, ImagePlus, MoveDown, MoveUp, Trash2 } from 'lucide-react'
import type { CambridgeWritingAsset, CambridgeWritingLevel } from '@ryan/catalog'
import { readWritingImage } from '../writingImage'
import {
  GENRES_BY_LEVEL,
  getTaskPromptStatus,
  type CambridgeWritingTaskFormValue,
} from './cambridgeWritingFormSchema'

type Props = {
  level: CambridgeWritingLevel
  task: CambridgeWritingTaskFormValue
  index: number
  total: number
  errorPrefix?: string
  onChange: (next: CambridgeWritingTaskFormValue) => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

export default function CambridgeWritingTaskEditor({
  level,
  task,
  index,
  total,
  errorPrefix,
  onChange,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: Props) {
  async function handleImageChange(file: File | undefined) {
    if (!file) return
    const src = await readWritingImage(file)
    const taskId = `task-${String(task.taskNumber).padStart(2, '0')}`
    const imageAssets: CambridgeWritingAsset[] = [{
      id: `${taskId}-image-01`,
      type: 'image',
      src,
      alt: `${task.title || taskId} prompt`,
    }]
    onChange({ ...task, imageAssets })
  }

  const promptReady = getTaskPromptStatus(task)

  return (
    <section className="cb-admin-task-card">
      <div className="cb-admin-task-head">
        <strong>Task {index + 1}</strong>
        <span className={promptReady ? 'cb-admin-inline-note cb-admin-muted' : 'cb-admin-warning'}>
          {promptReady ? 'Prompt đã sẵn sàng' : 'Prompt còn thiếu'}
        </span>
      </div>

      <div className="cb-admin-grid" style={{ marginTop: '0.85rem' }}>
        <div className="cb-admin-field">
          <label>Part number</label>
          <input className="cb-admin-input" type="number" value={task.partNumber} onChange={event => onChange({ ...task, partNumber: Number(event.target.value) || 1 })} />
        </div>
        <div className="cb-admin-field">
          <label>Task number</label>
          <input className="cb-admin-input" type="number" value={task.taskNumber} onChange={event => onChange({ ...task, taskNumber: Number(event.target.value) || 1 })} />
        </div>
        <div className="cb-admin-field">
          <label>Title</label>
          <input className="cb-admin-input" value={task.title} onChange={event => onChange({ ...task, title: event.target.value })} />
          {errorPrefix?.includes('title') ? <span className="cb-admin-error">{errorPrefix}</span> : null}
        </div>
        <div className="cb-admin-field">
          <label>Genre</label>
          <select className="cb-admin-select" value={task.genre} onChange={event => onChange({ ...task, genre: event.target.value as CambridgeWritingTaskFormValue['genre'] })}>
            {GENRES_BY_LEVEL[level].map(genre => <option key={genre} value={genre}>{genre}</option>)}
          </select>
        </div>
      </div>

      <div className="cb-admin-field" style={{ marginTop: '0.85rem' }}>
        <label>Instruction</label>
        <textarea className="cb-admin-textarea" value={task.instruction} onChange={event => onChange({ ...task, instruction: event.target.value })} />
      </div>

      <div className="cb-admin-grid" style={{ marginTop: '0.85rem' }}>
        <div className="cb-admin-field">
          <label>Prompt text</label>
          <textarea className="cb-admin-textarea" value={task.promptText} onChange={event => onChange({ ...task, promptText: event.target.value })} />
        </div>
        <div className="cb-admin-field">
          <label>Prompt HTML</label>
          <textarea className="cb-admin-textarea" value={task.promptHtml} onChange={event => onChange({ ...task, promptHtml: event.target.value })} />
        </div>
      </div>

      <div className="cb-admin-grid" style={{ marginTop: '0.85rem' }}>
        <div className="cb-admin-field">
          <label>Min words</label>
          <input className="cb-admin-input" type="number" value={task.minWords ?? ''} onChange={event => onChange({ ...task, minWords: event.target.value ? Number(event.target.value) : null })} />
        </div>
        <div className="cb-admin-field">
          <label>Max words</label>
          <input className="cb-admin-input" type="number" value={task.maxWords ?? ''} onChange={event => onChange({ ...task, maxWords: event.target.value ? Number(event.target.value) : null })} />
        </div>
        <div className="cb-admin-field">
          <label>Word limit text</label>
          <input className="cb-admin-input" value={task.wordLimitDisplayText} onChange={event => onChange({ ...task, wordLimitDisplayText: event.target.value })} />
        </div>
        <div className="cb-admin-field">
          <label>Bắt buộc</label>
          <select className="cb-admin-select" value={task.compulsory ? 'yes' : 'no'} onChange={event => onChange({ ...task, compulsory: event.target.value === 'yes' })}>
            <option value="yes">Có</option>
            <option value="no">Không</option>
          </select>
        </div>
      </div>

      <div className="cb-admin-field" style={{ marginTop: '0.85rem' }}>
        <label>Ảnh đề</label>
        <input
          className="cb-admin-input"
          type="file"
          accept="image/*"
          onChange={event => {
            void handleImageChange(event.target.files?.[0])
          }}
        />
        {task.imageAssets[0]?.src ? (
          <div className="cb-admin-preview">
            <img src={task.imageAssets[0].src} alt={task.imageAssets[0].alt ?? task.title} style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 12, background: 'var(--bg-card)' }} />
            <button type="button" className="cb-admin-danger" onClick={() => onChange({ ...task, imageAssets: [] })}>
              <Trash2 size={14} />
              Xóa ảnh
            </button>
          </div>
        ) : (
          <span className="cb-admin-inline-note cb-admin-muted">Chưa có ảnh prompt.</span>
        )}
      </div>

      <div className="cb-admin-task-actions">
        <button type="button" className="cb-admin-mini-btn" onClick={onDuplicate}>
          <Copy size={14} />
          Nhân bản
        </button>
        <button type="button" className="cb-admin-mini-btn" onClick={onMoveUp} disabled={index === 0}>
          <MoveUp size={14} />
          Di chuyển lên
        </button>
        <button type="button" className="cb-admin-mini-btn" onClick={onMoveDown} disabled={index === total - 1}>
          <MoveDown size={14} />
          Di chuyển xuống
        </button>
        <button type="button" className="cb-admin-danger" onClick={onDelete} disabled={total <= 1}>
          <Trash2 size={14} />
          Xóa
        </button>
        <span className="cb-admin-inline-note cb-admin-muted">
          <ImagePlus size={14} style={{ display: 'inline-flex', verticalAlign: 'text-bottom' }} />
          {' '}Mỗi task phải có ít nhất một nguồn prompt.
        </span>
      </div>
    </section>
  )
}
