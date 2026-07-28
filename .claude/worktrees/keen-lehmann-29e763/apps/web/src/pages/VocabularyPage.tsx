import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@ryan/db'
import { useVocabStore } from '../features/vocab/vocabStore'
import DeckGrid from '../features/vocab/DeckGrid'
import CardPanel from '../features/vocab/CardPanel'
import StudySession from '../features/vocab/StudySession'
import DeckEditorModal from '../features/vocab/DeckEditorModal'
import { repairVocabDuplicates, seedPresetDecks } from '../features/vocab/vocabSeedDecks'
import { seedExamVocabDecks } from '../features/vocab/examVocabDecks'

export default function VocabularyPage() {
  const { activeDeckId, setActiveDeck, studyMode, startStudy } = useVocabStore()
  const [createState, setCreateState] = useState<{ open: boolean; groupId?: string }>({ open: false })
  const [repairBusy, setRepairBusy] = useState(false)
  const [repairMsg, setRepairMsg] = useState<string | null>(null)
  // Force DeckGrid remount after repair
  const [gridKey, setGridKey] = useState(0)
  const deckCount = useLiveQuery(() => db.decks.count(), [])

  useEffect(() => {
    // seedPresetDecks: idempotent + dedupe deck/card (fix double "Công nghệ", …)
    void seedPresetDecks().catch(err => console.warn('[vocab] seedPresetDecks failed', err))
    void seedExamVocabDecks().catch(err => console.warn('[vocab] seedExamVocabDecks failed', err))
  }, [])

  async function handleRepairDuplicates() {
    if (repairBusy) return
    setRepairBusy(true)
    setRepairMsg(null)
    try {
      const { decksRemoved } = await repairVocabDuplicates()
      setGridKey(k => k + 1)
      setRepairMsg(
        decksRemoved > 0
          ? `Đã gộp ${decksRemoved} bộ trùng + dọn thẻ trùng phrase.`
          : 'Đã dọn thẻ trùng phrase (không còn bộ ghost).',
      )
    } catch (e) {
      setRepairMsg(e instanceof Error ? e.message : 'Dọn thất bại')
    } finally {
      setRepairBusy(false)
    }
  }

  if (activeDeckId === null) {
    return (
      <div className="relative h-full overflow-y-auto" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Bộ từ vựng
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Chọn bộ từ để bắt đầu học
                {typeof deckCount === 'number' ? ` · ${deckCount} bộ` : ''}
              </p>
              {repairMsg && (
                <p className="text-xs mt-1 font-medium" style={{ color: 'var(--color-primary)' }}>
                  {repairMsg}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <button
                type="button"
                disabled={repairBusy}
                onClick={() => void handleRepairDuplicates()}
                className="px-3 py-2 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-card)',
                }}
                title="Gộp bộ preset trùng + thẻ cùng phrase trong một bộ"
              >
                {repairBusy ? 'Đang dọn…' : 'Dọn thẻ trùng'}
              </button>
              <button
                type="button"
                onClick={() => startStudy('notebook')}
                className="px-4 py-2 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-90"
                style={{
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                }}
              >
                Sổ ghi chú
              </button>
              <button
                type="button"
                onClick={() => setCreateState({ open: true })}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
              >
                + Tạo bộ thẻ
              </button>
            </div>
          </div>

          <DeckGrid
            key={gridKey}
            onSelectDeck={id => setActiveDeck(id)}
            onCreateDeck={groupId => setCreateState({ open: true, groupId })}
          />
        </div>

        {createState.open && (
          <DeckEditorModal
            defaultGroupId={createState.groupId}
            onClose={() => setCreateState({ open: false })}
          />
        )}
        {studyMode && <StudySession />}
      </div>
    )
  }

  return (
    <div className="relative flex h-full overflow-hidden">
      <div className="flex flex-col h-full w-full">
        <div
          className="px-6 py-3 border-b flex items-center gap-3 shrink-0"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <button
            type="button"
            onClick={() => setActiveDeck(null)}
            className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronLeft size={16} />
            Quay lại
          </button>
        </div>
        <CardPanel />
      </div>
      {studyMode && <StudySession />}
    </div>
  )
}