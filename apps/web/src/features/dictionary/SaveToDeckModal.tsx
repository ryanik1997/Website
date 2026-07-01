import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { X, Check, Plus } from 'lucide-react'
import { db, cardRepo, deckRepo } from '@ryan/db'

interface Props {
  word: string
  meaning: string
  example?: string
  ipaUS?: string
  pos?: string
  onClose: () => void
}

export default function SaveToDeckModal({ word, meaning, example, ipaUS, pos, onClose }: Props) {
  const decks = useLiveQuery(() => db.decks.orderBy('updatedAt').reverse().toArray(), [])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [creatingDeck, setCreatingDeck] = useState(false)
  const [newDeckName, setNewDeckName] = useState('')

  const savedDeckName = decks?.find(d => d.id === selectedId)?.name ?? ''

  async function save() {
    if (!selectedId) return
    setSaving(true)
    await cardRepo.add(selectedId, {
      phrase: word,
      meaning,
      example,
      ipaUS,
      ipaUK: undefined,
      pos,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(onClose, 1800)
  }

  async function createAndSelect() {
    if (!newDeckName.trim()) return
    const deck = await deckRepo.create(newDeckName.trim())
    setSelectedId(deck.id)
    setCreatingDeck(false)
    setNewDeckName('')
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-card)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Thêm vào bộ thẻ
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              "{word}" · {meaning.slice(0, 30)}{meaning.length > 30 ? '…' : ''}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <div className="px-5 py-4">
          {saved ? (
            /* Success state */
            <div className="flex flex-col items-center py-5 gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: '#22c55e22' }}
              >
                <Check size={22} style={{ color: '#22c55e' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#22c55e' }}>
                Đã thêm vào "{savedDeckName}"!
              </p>
            </div>
          ) : (
            <>
              {/* Deck list */}
              <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto mb-3">
                {!decks?.length && !creatingDeck ? (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    Chưa có bộ thẻ nào.
                  </p>
                ) : (
                  decks?.map(deck => (
                    <button
                      key={deck.id}
                      onClick={() => setSelectedId(deck.id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left border transition-colors"
                      style={{
                        borderColor: selectedId === deck.id ? 'var(--color-primary)' : 'var(--border-color)',
                        background: selectedId === deck.id
                          ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                          : 'var(--bg-secondary)',
                      }}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-colors"
                        style={{
                          borderColor: selectedId === deck.id ? 'var(--color-primary)' : 'var(--border-color)',
                          background: selectedId === deck.id ? 'var(--color-primary)' : 'transparent',
                        }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: selectedId === deck.id ? 'var(--color-primary)' : 'var(--text-primary)' }}
                      >
                        {deck.name}
                      </span>
                    </button>
                  ))
                )}
              </div>

              {/* Inline create deck */}
              {creatingDeck ? (
                <div className="flex gap-2 mb-3">
                  <input
                    autoFocus
                    value={newDeckName}
                    onChange={e => setNewDeckName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && createAndSelect()}
                    placeholder="Tên bộ thẻ mới..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={createAndSelect}
                    disabled={!newDeckName.trim()}
                    className="px-3 py-2 rounded-lg text-xs text-white font-medium disabled:opacity-50"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    Tạo
                  </button>
                  <button
                    onClick={() => setCreatingDeck(false)}
                    className="px-3 py-2 rounded-lg text-xs"
                    style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCreatingDeck(true)}
                  className="flex items-center gap-1.5 text-xs mb-3"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <Plus size={12} /> Tạo bộ thẻ mới
                </button>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                >
                  Hủy
                </button>
                <button
                  onClick={save}
                  disabled={!selectedId || saving}
                  className="flex-1 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {saving ? 'Đang lưu...' : 'Thêm vào bộ thẻ'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
