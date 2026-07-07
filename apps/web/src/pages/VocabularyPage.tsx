import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useVocabStore } from '../features/vocab/vocabStore'
import DeckGrid from '../features/vocab/DeckGrid'
import CardPanel from '../features/vocab/CardPanel'
import StudySession from '../features/vocab/StudySession'
import DeckEditorModal from '../features/vocab/DeckEditorModal'
import { seedPresetDecks } from '../features/vocab/vocabSeedDecks'

export default function VocabularyPage() {
  const { activeDeckId, setActiveDeck, studyMode } = useVocabStore()
  const [createState, setCreateState] = useState<{ open: boolean; groupId?: string }>({ open: false })

  useEffect(() => {
    void seedPresetDecks()
  }, [])

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
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateState({ open: true })}
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
            >
              + Tạo bộ thẻ
            </button>
          </div>

          <DeckGrid
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