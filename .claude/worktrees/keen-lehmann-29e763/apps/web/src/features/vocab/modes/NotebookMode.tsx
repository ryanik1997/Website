import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  BookMarked, Search, Trash2, Headphones, Pencil, X, Check, StickyNote,
} from 'lucide-react'
import { db, notebookRepo } from '@ryan/db'
import type { NotebookEntry } from '@ryan/db'
import { speakPhrase } from '../study/speakPhrase'

export default function NotebookMode() {
  const entries = useLiveQuery(() => notebookRepo.all(), []) ?? []
  const [q, setQ] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return entries
    return entries.filter(e =>
      e.phrase.toLowerCase().includes(needle)
      || e.meaning.toLowerCase().includes(needle)
      || (e.note?.toLowerCase().includes(needle) ?? false)
      || (e.example?.toLowerCase().includes(needle) ?? false),
    )
  }, [entries, q])

  async function remove(id: string) {
    if (!window.confirm('Xóa từ này khỏi sổ ghi chú?')) return
    setBusyId(id)
    try {
      await notebookRepo.delete(id)
      if (editingId === id) setEditingId(null)
    } finally {
      setBusyId(null)
    }
  }

  function startEdit(e: NotebookEntry) {
    setEditingId(e.id)
    setNoteDraft(e.note ?? '')
  }

  async function saveNote(id: string) {
    setBusyId(id)
    try {
      await notebookRepo.updateNote(id, noteDraft.trim())
      setEditingId(null)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="vs-notebook px-4 py-5 max-w-3xl mx-auto w-full">
      <div className="vs-notebook-hero">
        <div className="vs-notebook-hero-icon">
          <BookMarked size={22} />
        </div>
        <div>
          <h2 className="vs-notebook-title">Sổ ghi chú từ vựng</h2>
          <p className="vs-notebook-sub">
            {entries.length === 0
              ? 'Chưa có từ nào. Trong chế độ học, bấm «Lưu sổ ghi chú» để lưu từ.'
              : `${entries.length} từ đã lưu · bấm ghi chú để thêm memo riêng`}
          </p>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="vs-notebook-search">
          <Search size={16} className="vs-notebook-search-icon" />
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Tìm từ, nghĩa, ghi chú…"
            className="vs-notebook-search-input"
            aria-label="Tìm trong sổ ghi chú"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="vs-notebook-empty">
          <StickyNote size={36} style={{ opacity: 0.45 }} />
          <p>{entries.length === 0 ? 'Sổ trống' : 'Không khớp tìm kiếm'}</p>
        </div>
      ) : (
        <ul className="vs-notebook-list">
          {filtered.map(entry => {
            const editing = editingId === entry.id
            return (
              <li key={entry.id} className="vs-notebook-card">
                <div className="vs-notebook-card-top">
                  <div className="min-w-0 flex-1">
                    <div className="vs-notebook-phrase-row">
                      <span className="vs-notebook-phrase">{entry.phrase}</span>
                      {entry.pos && <span className="vs-notebook-pos">{entry.pos}</span>}
                    </div>
                    {(entry.ipaUS || entry.ipaUK) && (
                      <p className="vs-notebook-ipa">
                        {entry.ipaUS && <>US /{entry.ipaUS}/ </>}
                        {entry.ipaUK && <>UK /{entry.ipaUK}/</>}
                      </p>
                    )}
                    <p className="vs-notebook-meaning">{entry.meaning}</p>
                    {entry.example && (
                      <p className="vs-notebook-example">“{entry.example}”</p>
                    )}
                  </div>
                  <div className="vs-notebook-actions">
                    <button
                      type="button"
                      className="vs-notebook-icon-btn"
                      title="Phát âm"
                      onClick={() => void speakPhrase(entry.phrase)}
                    >
                      <Headphones size={16} />
                    </button>
                    <button
                      type="button"
                      className="vs-notebook-icon-btn"
                      title="Ghi chú"
                      onClick={() => (editing ? setEditingId(null) : startEdit(entry))}
                    >
                      {editing ? <X size={16} /> : <Pencil size={16} />}
                    </button>
                    <button
                      type="button"
                      className="vs-notebook-icon-btn vs-notebook-icon-btn--danger"
                      title="Xóa"
                      disabled={busyId === entry.id}
                      onClick={() => void remove(entry.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {editing ? (
                  <div className="vs-notebook-edit">
                    <textarea
                      value={noteDraft}
                      onChange={e => setNoteDraft(e.target.value)}
                      rows={3}
                      placeholder="Ghi chú của bạn (vd. collocation, mẹo nhớ…)"
                      className="vs-notebook-textarea"
                    />
                    <button
                      type="button"
                      className="vs-notebook-save-note"
                      disabled={busyId === entry.id}
                      onClick={() => void saveNote(entry.id)}
                    >
                      <Check size={14} />
                      Lưu ghi chú
                    </button>
                  </div>
                ) : entry.note ? (
                  <p className="vs-notebook-note">
                    <StickyNote size={13} />
                    {entry.note}
                  </p>
                ) : null}

                <p className="vs-notebook-meta">
                  {new Date(entry.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                  {entry.source === 'study' && ' · Học'}
                  {entry.source === 'dictionary' && ' · Từ điển'}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
