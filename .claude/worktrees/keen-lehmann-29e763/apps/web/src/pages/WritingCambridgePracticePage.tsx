import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { PenLine } from 'lucide-react'
import { db } from '@ryan/db'
import { useWritingStore } from '../features/writing/writingStore'
import DocListPanel from '../features/writing/DocListPanel'
import WritingEditor from '../features/writing/WritingEditor'
import NewDocModal from '../features/writing/NewDocModal'
import EmptyStateCard from '../components/EmptyStateCard'
import { CAMBRIDGE_DOC_TYPE_OPTIONS } from '../features/writing/writingTypes'
import {
  docMatchesGenre,
  genreLabel,
  getGenreDef,
  getLevel,
  isValidGenreForLevel,
  type CambridgeGenre,
  type CambridgeLevelSlug,
} from '../features/writing/cambridgeCatalog'

/** Bước 3: Danh sách bài + editor — lọc theo level + loại bài */
export default function WritingCambridgePracticePage() {
  const { level: levelSlug, genre: genreSlug } = useParams<{ level: string; genre: string }>()
  const level = getLevel(levelSlug)
  const genreDef = getGenreDef(genreSlug)
  const genre = genreSlug as CambridgeGenre

  const docs = useLiveQuery(async () => {
    if (!level) return []
    const all = await db.writingDocs.where('type').equals(level.type).toArray()
    if (!genreDef) return all
    return all.filter(d => docMatchesGenre(d, genre))
  }, [level?.type, genre])

  const { setActiveDoc } = useWritingStore()
  const [showCreate, setShowCreate] = useState(false)

  if (!level || !genreDef || !isValidGenreForLevel(level.slug as CambridgeLevelSlug, genre)) {
    return <Navigate to="/app/writing/cambridge" replace />
  }

  const isEmpty = docs !== undefined && docs.length === 0
  const typeOption = CAMBRIDGE_DOC_TYPE_OPTIONS.find(o => o.id === level.type)
  const allowedTypes = [level.type] as const

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden flex-col">
      <div
        className="shrink-0 flex flex-wrap items-center gap-2 px-4 py-2 border-b text-xs"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
      >
        <Link to="/app/writing/cambridge" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Cambridge
        </Link>
        <span>/</span>
        <Link
          to={`/app/writing/cambridge/${level.slug}`}
          style={{ color: 'var(--color-primary)', fontWeight: 600 }}
        >
          {level.label}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{genreDef.labelVi}</span>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {!isEmpty && (
          <DocListPanel
            filterTypes={[...allowedTypes]}
            filterGenre={genre}
            docTypeOptions={typeOption ? [typeOption] : CAMBRIDGE_DOC_TYPE_OPTIONS}
            panelTitle={genreDef.labelVi}
            createTitle={`Thêm bài ${genreDef.labelVi}`}
            emptyMessage={`Chưa có bài ${genreDef.labelVi} nào`}
            showSearch
            fixedType={level.type}
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
              title={`${level.label} — ${genreDef.labelVi}`}
              subtitle={`Tạo hoặc chọn đề ${genreDef.labelVi.toLowerCase()} để luyện viết và chấm AI`}
              ctaLabel={`Tạo bài ${genreDef.labelVi} đầu tiên`}
              onCta={() => setShowCreate(true)}
              tip={`Bài mới sẽ được gắn loại ${genreLabel(genre)} trong ${level.label}`}
              footerLink={{
                label: `← Chọn loại bài khác (${level.exam})`,
                to: `/app/writing/cambridge/${level.slug}`,
              }}
            />
          </div>
        ) : (
          <WritingEditor allowedTypes={[...allowedTypes]} />
        )}
      </div>

      {showCreate && (
        <NewDocModal
          docTypeOptions={typeOption ? [typeOption] : CAMBRIDGE_DOC_TYPE_OPTIONS}
          fixedType={level.type}
          fixedGenre={genre}
          title={`Tạo bài ${genreDef.labelVi} — ${level.exam}`}
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