import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useVocabStore } from '../features/vocab/vocabStore'
import DeckGrid from '../features/vocab/DeckGrid'
import CardPanel from '../features/vocab/CardPanel'
import StudySession from '../features/vocab/StudySession'
import DeckEditorModal from '../features/vocab/DeckEditorModal'
import {
  VOCAB_UNIT_KIND_LABELS,
  type VocabUnitKind,
} from '../features/vocab/vocabUnitKind'
import { useI18n } from '../lib/language'

const UNIT_TABS: { id: VocabUnitKind; label: string }[] = [
  { id: 'single', label: VOCAB_UNIT_KIND_LABELS.single },
  { id: 'phrase', label: VOCAB_UNIT_KIND_LABELS.phrase },
]

export default function VocabularyPage() {
  const { t } = useI18n()
  const { activeDeckId, setActiveDeck, studyMode, startStudy, unitKind, setUnitKind } = useVocabStore()
  const [createState, setCreateState] = useState<{ open: boolean; groupId?: string }>({ open: false })
  const [repairBusy, setRepairBusy] = useState(false)
  const [repairMsg, setRepairMsg] = useState<string | null>(null)
  // Force DeckGrid remount after repair
  const [gridKey, setGridKey] = useState(0)

  useEffect(() => {
    // Dynamic import: tránh kéo ~7MB JSON seed vào critical path của route /app/vocab
    // (static import từng làm Vite/HMR serve module rỗng → React.lazy → trang trắng).
    void import('../features/vocab/vocabSeedDecks')
      .then(m => m.seedPresetDecks())
      .catch(err => console.warn('[vocab] seedPresetDecks failed', err))
    void import('../features/vocab/examVocabDecks')
      .then(m => m.seedExamVocabDecks())
      .catch(err => console.warn('[vocab] seedExamVocabDecks failed', err))
  }, [])

  async function handleRepairDuplicates() {
    if (repairBusy) return
    setRepairBusy(true)
    setRepairMsg(null)
    try {
      const { repairVocabDuplicates } = await import('../features/vocab/vocabSeedDecks')
      const { decksRemoved } = await repairVocabDuplicates()
      setGridKey(k => k + 1)
      setRepairMsg(
        decksRemoved > 0
          ? `${decksRemoved} duplicate decks merged.`
          : 'Duplicate phrases cleaned.',
      )
    } catch (e) {
      setRepairMsg(e instanceof Error ? e.message : 'Dọn thất bại')
    } finally {
      setRepairBusy(false)
    }
  }

  if (activeDeckId === null) {
    return (
      <div className="app-page-surface relative h-full overflow-y-auto" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('vocab.title')}
              </h1>
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
                title={t('vocab.repair')}
              >
                {repairBusy ? t('vocab.repairBusy') : t('vocab.repair')}
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
                {t('vocab.notebook')}
              </button>
              <button
                type="button"
                onClick={() => setCreateState({ open: true })}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
              >
                {t('vocab.create')}
              </button>
            </div>
          </div>

          {/* Cấp 1: Từ đơn | Cụm từ */}
          <div
            className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
            role="tablist"
            aria-label={t('vocab.kind')}
          >
            {UNIT_TABS.map(tab => {
              const active = unitKind === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setUnitKind(tab.id)}
                  className="text-left rounded-2xl px-4 py-3.5 border transition-all"
                  style={{
                    background: active
                      ? 'color-mix(in srgb, var(--color-primary) 14%, var(--bg-card))'
                      : 'var(--bg-card)',
                    borderColor: active ? 'var(--color-primary)' : 'var(--border-color)',
                    boxShadow: active ? '0 0 0 1px color-mix(in srgb, var(--color-primary) 40%, transparent)' : undefined,
                  }}
                >
                  <p
                    className="text-sm font-bold"
                    style={{ color: active ? 'var(--color-primary)' : 'var(--text-primary)' }}
                  >
                    {tab.id === 'single' ? t('vocab.single') : t('vocab.phrase')}
                  </p>
                </button>
              )
            })}
          </div>

          <DeckGrid
            key={`${gridKey}-${unitKind}`}
            unitKind={unitKind}
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
    <div className="app-page-surface relative flex h-full overflow-hidden">
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
