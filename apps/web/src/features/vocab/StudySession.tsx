import { useLiveQuery } from 'dexie-react-hooks'
import { X, BookMarked } from 'lucide-react'
import { db } from '@ryan/db'
import { useVocabStore } from './vocabStore'
import DeckStatBar from './study/DeckStatBar'
import StudyModeTabs from './study/StudyModeTabs'
import { useDeckStudyStats } from './study/useDeckStudyStats'
import SrsMode from './modes/SrsMode'
import QuizMode from './modes/QuizMode'
import TypeMode from './modes/TypeMode'
import ListenTypeMode from './modes/ListenTypeMode'
import SpeakingMode from './modes/SpeakingMode'
import WeakWordsMode from './modes/WeakWordsMode'
import ReviewHubMode from './modes/ReviewHubMode'
import StatsMode from './modes/StatsMode'
import NotebookMode from './modes/NotebookMode'
import './study/vocabStudy.css'
import './study/vocabStudyPaper.css'

export default function StudySession() {
  const { activeDeckId, studyMode, startStudy, stopStudy } = useVocabStore()
  const deck = useLiveQuery(
    () => (activeDeckId ? db.decks.get(activeDeckId) : undefined),
    [activeDeckId],
  )
  const stats = useDeckStudyStats(activeDeckId)

  if (!studyMode) return null

  // Sổ ghi chú toàn cục — mở được cả khi chưa chọn deck
  if (studyMode === 'notebook' && !activeDeckId) {
    return (
      <div className="vocab-study-shell absolute inset-0 z-40 flex flex-col overflow-hidden">
        <div className="vs-notebook-standalone-bar">
          <div className="flex items-center gap-2 min-w-0">
            <BookMarked size={18} style={{ color: 'var(--color-primary)' }} />
            <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              Sổ ghi chú từ vựng
            </span>
          </div>
          <button type="button" className="vs-notebook-close" onClick={stopStudy} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NotebookMode />
        </div>
      </div>
    )
  }

  if (!activeDeckId) return null
  if (!deck || !stats) {
    return (
      <div className="vocab-study-shell absolute inset-0 z-40 flex items-center justify-center">
        <p className="text-sm vs-loading">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="vocab-study-shell absolute inset-0 z-40 flex flex-col overflow-hidden">
      <DeckStatBar deck={deck} stats={stats} onExit={stopStudy} />
      <StudyModeTabs active={studyMode} onChange={startStudy} />
      <div className="flex-1 overflow-y-auto">
        {studyMode === 'srs' && (
          <SrsMode key={`srs-${activeDeckId}`} deckId={activeDeckId} deck={deck} onDone={stopStudy} />
        )}
        {studyMode === 'quiz' && (
          <QuizMode key={`quiz-${activeDeckId}`} deckId={activeDeckId} onDone={stopStudy} />
        )}
        {studyMode === 'type' && (
          <TypeMode key={`type-${activeDeckId}`} deckId={activeDeckId} onDone={stopStudy} />
        )}
        {studyMode === 'listen' && (
          <ListenTypeMode key={`listen-${activeDeckId}`} deckId={activeDeckId} deck={deck} onDone={stopStudy} />
        )}
        {studyMode === 'speak' && (
          <SpeakingMode key={`speak-${activeDeckId}`} deckId={activeDeckId} deck={deck} onDone={stopStudy} />
        )}
        {studyMode === 'weak' && (
          <WeakWordsMode key={`weak-${activeDeckId}`} deckId={activeDeckId} deck={deck} />
        )}
        {studyMode === 'review' && (
          <ReviewHubMode key={`review-${activeDeckId}`} deckId={activeDeckId} deck={deck} />
        )}
        {studyMode === 'stats' && (
          <StatsMode key={`stats-${activeDeckId}`} deckId={activeDeckId} deck={deck} />
        )}
        {studyMode === 'notebook' && (
          <NotebookMode key={`notebook-${activeDeckId}`} />
        )}
      </div>
    </div>
  )
}
