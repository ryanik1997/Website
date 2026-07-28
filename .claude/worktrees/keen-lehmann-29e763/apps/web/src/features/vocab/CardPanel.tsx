import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Edit2, Trash2, BookOpen, Play, ChevronDown, Download, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { db, cardRepo } from '@ryan/db'
import type { Card, Srs } from '@ryan/db'
import { useVocabStore } from './vocabStore'
import CardEditorModal from './CardEditorModal'
import DeckEditorModal from './DeckEditorModal'
import ImportModal from './ImportModal'
import { exportDeckAsCSV, exportDeckAsJSON } from './importExport'
import PanelHeader from '../../components/PanelHeader'
import { PosBadge, StatusBadge } from './CardBadges'
import './vocabList.css'

const STUDY_BTNS = [
  { mode: 'srs'    as const, label: 'Lặp lại' },
  { mode: 'quiz'   as const, label: 'Trắc nghiệm' },
  { mode: 'type'   as const, label: 'Đoán nghĩa' },
  { mode: 'listen' as const, label: 'Nghe & Gõ' },
  { mode: 'review' as const, label: 'Ôn tập' },
  { mode: 'weak'   as const, label: 'Từ yếu' },
  { mode: 'stats'  as const, label: 'Thống kê' },
  { mode: 'notebook' as const, label: 'Sổ ghi chú' },
]

export default function CardPanel() {
  const { activeDeckId, startStudy } = useVocabStore()
  const deck = useLiveQuery(
    () => activeDeckId ? db.decks.get(activeDeckId) : undefined,
    [activeDeckId],
  )
  const cards = useLiveQuery(
    () => activeDeckId ? db.cards.where('deckId').equals(activeDeckId).toArray() : [],
    [activeDeckId],
  ) ?? []
  const srsByCard = useLiveQuery(async () => {
    if (!activeDeckId) return new Map<string, Srs>()
    const rows = await db.srs.where('deckId').equals(activeDeckId).toArray()
    return new Map(rows.map(s => [s.cardId, s]))
  }, [activeDeckId]) ?? new Map<string, Srs>()

  const [showAddCard, setShowAddCard] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const [editCard, setEditCard] = useState<Card | null>(null)
  const [editDeck, setEditDeck] = useState(false)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (!activeDeckId || !deck) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <BookOpen size={44} className="mx-auto mb-4" style={{ color: 'var(--border-color)' }} />
          <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Chọn bộ thẻ</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chọn một bộ thẻ từ danh sách bên trái để bắt đầu</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <PanelHeader
        title={deck.name}
        subtitle={`${cards.length} từ`}
        actions={
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => setEditDeck(true)}
              className="p-1 rounded transition-colors hover:bg-[var(--bg-secondary)] shrink-0"
              style={{ color: 'var(--text-muted)' }}
              title="Sửa tên"
            >
              <Edit2 size={13} />
            </button>
            {STUDY_BTNS.map(({ mode, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => startStudy(mode)}
                disabled={cards.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                style={{
                  background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                  color: 'var(--color-primary)',
                }}
              >
                <Play size={11} />
                {label}
              </button>
            ))}
            <div className="relative shrink-0" ref={exportRef}>
              <button
                type="button"
                onClick={() => setExportOpen(o => !o)}
                disabled={cards.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-secondary)',
                }}
              >
                <Download size={14} />
                Xuất
                <ChevronDown size={12} className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
              </button>
              {exportOpen && cards.length > 0 && (
                <div
                  className="absolute right-0 top-full mt-1.5 min-w-[9rem] rounded-lg border shadow-lg z-20 overflow-hidden py-1"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      exportDeckAsCSV(cards, deck.name)
                      setExportOpen(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Xuất CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportDeckAsJSON(deck, cards)
                      setExportOpen(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Xuất JSON
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border shrink-0 transition-colors"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                background: 'var(--bg-secondary)',
              }}
            >
              <Upload size={14} />
              Nhập
            </button>
            <button
              type="button"
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium shrink-0"
              style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
            >
              <Plus size={14} />
              Thêm từ
            </button>
          </div>
        }
      />

      {/* Card list */}
      <div className="flex-1 overflow-y-auto p-6">
        {cards.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📚</div>
            <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Chưa có từ nào</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Thêm từ đầu tiên vào bộ thẻ này</p>
            <button
              onClick={() => setShowAddCard(true)}
              className="px-4 py-2 rounded-lg text-sm text-white font-medium"
              style={{ background: 'var(--color-primary)' }}
            >
              + Thêm từ đầu tiên
            </button>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Từ / Cụm từ', 'Nghĩa tiếng Việt', 'Câu ví dụ', 'Trạng thái', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${i === 2 ? 'hidden md:table-cell' : ''} ${i === 3 ? 'hidden sm:table-cell' : ''} ${i === 4 ? 'w-16' : ''}`}
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cards.map((card, i) => (
                  <tr
                    key={card.id}
                    className="transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ borderTop: i > 0 ? '1px solid var(--border-color)' : undefined }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{card.phrase}</p>
                        <PosBadge phrase={card.phrase} pos={card.pos} />
                      </div>
                      {(card.ipaUS || card.ipaUK) && (
                        <p className="text-xs mt-0.5 flex flex-wrap gap-x-2" style={{ color: 'var(--text-muted)' }}>
                          {card.ipaUS && <span><b className="font-semibold">US</b> [{card.ipaUS}]</span>}
                          {card.ipaUK && <span><b className="font-semibold">UK</b> [{card.ipaUK}]</span>}
                        </p>
                      )}
                      <div className="sm:hidden mt-1.5">
                        <StatusBadge srs={srsByCard.get(card.id)} />
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{card.meaning}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {card.example && (
                        <p className="text-xs italic truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>
                          {card.example}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <StatusBadge srs={srsByCard.get(card.id)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditCard(card)}
                          className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-secondary)]"
                          style={{ color: 'var(--text-muted)' }}
                          title="Sửa"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Xóa từ "${card.phrase}"?`)) return
                            await cardRepo.delete(card.id)
                          }}
                          className="p-1.5 rounded-md transition-colors hover:bg-[#ef444422]"
                          style={{ color: 'var(--text-muted)' }}
                          title="Xóa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddCard && <CardEditorModal deckId={activeDeckId} onClose={() => setShowAddCard(false)} />}
      {showImport && (
        <ImportModal
          deckId={activeDeckId}
          deckName={deck.name}
          onClose={() => setShowImport(false)}
        />
      )}
      {editCard && <CardEditorModal deckId={activeDeckId} card={editCard} onClose={() => setEditCard(null)} />}
      {editDeck && <DeckEditorModal deck={deck} onClose={() => setEditDeck(false)} />}
    </div>
  )
}
