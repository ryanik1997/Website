import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Languages } from 'lucide-react'
import { db } from '@ryan/db'
import { useTranslationStore } from '../features/translation/translationStore'
import {
  genreDisplayLabel,
  getTranslationGenreDef,
  getTranslationTrack,
  isValidGenreForTrack,
  setMatchesTrackGenre,
  type TranslationGenre,
  type TranslationTrackSlug,
} from '../features/translation/translationCatalog'
import { ensureTranslationSeedData } from '../features/translation/seedTranslationPacks'
import TranslationListPanel from '../features/translation/TranslationListPanel'
import TranslationDetail from '../features/translation/TranslationDetail'
import PracticeSession from '../features/translation/PracticeSession'
import NewSetModal from '../features/translation/NewSetModal'
import EmptyStateCard from '../components/EmptyStateCard'

/** Bước 3: Danh sách bộ câu + chi tiết + luyện dịch */
export default function TranslationPracticePage() {
  const { track: trackSlug, genre: genreSlug } = useParams<{ track: string; genre: string }>()
  const track = getTranslationTrack(trackSlug)
  const genreDef = getTranslationGenreDef(genreSlug)
  const genre = genreSlug as TranslationGenre
  const practicing = useTranslationStore(s => s.practicing)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    void ensureTranslationSeedData().catch(err =>
      console.warn('[translation] seed failed', err),
    )
  }, [])

  const sets = useLiveQuery(async () => {
    if (!track) return []
    const all = await db.translationSets.where('category').equals(track.category).toArray()
    if (!genreDef) return all
    return all.filter(s => setMatchesTrackGenre(s, track, genre))
  }, [track?.slug, track?.category, genre])

  if (!track || !genreDef || !isValidGenreForTrack(track.slug as TranslationTrackSlug, genre)) {
    return <Navigate to="/app/writing/translate" replace />
  }

  const isEmpty = sets !== undefined && sets.length === 0

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden flex-col">
      <div
        className="shrink-0 flex flex-wrap items-center gap-2 px-4 py-2 border-b text-xs"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
      >
        <Link to="/app/writing/translate" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Luyện dịch
        </Link>
        <span>/</span>
        <Link
          to={`/app/writing/translate/${track.slug}`}
          style={{ color: 'var(--color-primary)', fontWeight: 600 }}
        >
          {track.label}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {genreDisplayLabel(track, genre)}
        </span>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {!isEmpty && (
          <TranslationListPanel
            filterTrack={track}
            filterGenre={genre}
            panelTitle={genreDisplayLabel(track, genre)}
            createTitle={`Tạo bộ ${genreDisplayLabel(track, genre)}`}
            emptyMessage={`Chưa có bộ ${genreDisplayLabel(track, genre)} nào`}
            showSearch
            fixedCategory={track.category}
            fixedGenre={genre}
          />
        )}

        {isEmpty ? (
          <div
            className="flex-1 flex items-center justify-center px-6"
            style={{ background: 'var(--bg-primary)' }}
          >
            <EmptyStateCard
              icon={Languages}
              title={`${track.label} — ${genreDisplayLabel(track, genre)}`}
              subtitle={`Tạo bộ câu ${genreDisplayLabel(track, genre)} để luyện dịch Việt → Anh`}
              ctaLabel={`Tạo bộ ${genreDisplayLabel(track, genre)} đầu tiên`}
              onCta={() => setShowCreate(true)}
              tip={`Bộ mới sẽ được gắn chủ đề ${genreDisplayLabel(track, genre)} trong ${track.label}`}
              footerLink={{
                label: `← Chọn chủ đề khác (${track.badge})`,
                to: `/app/writing/translate/${track.slug}`,
              }}
            />
          </div>
        ) : (
          <TranslationDetail />
        )}
      </div>

      {practicing && <PracticeSession />}
      {showCreate && (
        <NewSetModal
          fixedCategory={track.category}
          fixedGenre={genre}
          title={`Tạo bộ ${genreDisplayLabel(track, genre)} — ${track.label}`}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}