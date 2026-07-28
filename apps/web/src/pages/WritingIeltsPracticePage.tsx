import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { PenLine } from 'lucide-react'
import { db } from '@ryan/db'
import { useWritingStore } from '../features/writing/writingStore'
import DocListPanel from '../features/writing/DocListPanel'
import WritingEditor from '../features/writing/WritingEditor'
import NewDocModal from '../features/writing/NewDocModal'
import PromptSuggestPanel from '../features/writing/promptBank/PromptSuggestPanel'
import EmptyStateCard from '../components/EmptyStateCard'
import { IELTS_DOC_TYPE_OPTIONS } from '../features/writing/writingTypes'
import {
  docMatchesIeltsGenre,
  getIeltsGenreDef,
  getIeltsTrack,
  ieltsGenreLabel,
  isValidGenreForTrack,
  type IeltsGenre,
  type IeltsTrackSlug,
  typesForTrack,
} from '../features/writing/ieltsCatalog'

/** Bước 3: Danh sách bài IELTS + editor — lọc theo task + loại đề */
export default function WritingIeltsPracticePage() {
  const { track: trackSlug, genre: genreSlug } = useParams<{ track: string; genre: string }>()
  const track = getIeltsTrack(trackSlug)
  const genreDef = getIeltsGenreDef(genreSlug)
  const genre = genreSlug as IeltsGenre

  const docs = useLiveQuery(async () => {
    if (!track) return []
    const types = typesForTrack(track)
    const all = await db.writingDocs.toArray()
    const filtered = all.filter(d => types.includes(d.type))
    if (!genreDef) return filtered
    return filtered.filter(d => docMatchesIeltsGenre(d, track, genre))
  }, [track?.slug, genre])

  const { setActiveDoc } = useWritingStore()
  const [showCreate, setShowCreate] = useState(false)

  if (!track || !genreDef || !isValidGenreForTrack(track.slug as IeltsTrackSlug, genre)) {
    return <Navigate to="/app/writing/practice" replace />
  }

  const isEmpty = docs !== undefined && docs.length === 0
  const typeOption = IELTS_DOC_TYPE_OPTIONS.find(o => o.id === track.type)
  const allowedTypes = typesForTrack(track)

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden flex-col">
      <div
        className="shrink-0 flex flex-wrap items-center gap-2 px-4 py-2 border-b text-xs"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
      >
        <Link to="/app/writing/practice" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          IELTS
        </Link>
        <span>/</span>
        <Link
          to={`/app/writing/practice/${track.slug}`}
          style={{ color: 'var(--color-primary)', fontWeight: 600 }}
        >
          {track.label}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{genreDef.labelVi}</span>
      </div>

      <PromptSuggestPanel track={track.slug} genre={genre} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {!isEmpty && (
          <DocListPanel
            filterTypes={allowedTypes}
            filterDoc={d => docMatchesIeltsGenre(d, track, genre)}
            docTypeOptions={typeOption ? [typeOption] : IELTS_DOC_TYPE_OPTIONS}
            panelTitle={genreDef.labelVi}
            createTitle={`Thêm bài ${genreDef.labelVi}`}
            emptyMessage={`Chưa có bài ${genreDef.labelVi} nào`}
            showSearch
            fixedType={track.type}
            fixedGenre={genre}
          />
        )}

        {isEmpty ? (
          <div
            className="flex-1 flex items-center justify-center px-6"
            style={{ background: 'var(--bg-primary)' }}
          >
            <EmptyStateCard
              icon={PenLine}
              title={`${track.label} — ${genreDef.labelVi}`}
              subtitle={`Tạo đề ${genreDef.labelVi.toLowerCase()} để luyện viết và chấm band IELTS`}
              ctaLabel={`Tạo bài ${genreDef.labelVi} đầu tiên`}
              onCta={() => setShowCreate(true)}
              tip={`Bài mới gắn loại ${ieltsGenreLabel(genre)} trong ${track.label}`}
              footerLink={{
                label: `← Chọn loại đề khác (${track.badge})`,
                to: `/app/writing/practice/${track.slug}`,
              }}
            />
          </div>
        ) : (
          <WritingEditor allowedTypes={allowedTypes} />
        )}
      </div>

      {showCreate && (
        <NewDocModal
          docTypeOptions={typeOption ? [typeOption] : IELTS_DOC_TYPE_OPTIONS}
          fixedType={track.type}
          fixedGenre={genre}
          title={`Tạo bài ${genreDef.labelVi} — ${track.label}`}
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            setActiveDoc(id)
            setShowCreate(false)
          }}
        />
      )}
    </div>
  )
}