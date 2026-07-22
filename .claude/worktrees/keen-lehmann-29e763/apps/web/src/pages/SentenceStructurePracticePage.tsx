import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { sentenceStructureRepo } from '@ryan/db'
import { useLiveQuery } from 'dexie-react-hooks'
import StructurePracticePanel from '../features/sentence-structure/StructurePracticePanel'
import '../features/sentence-structure/structurePractice.css'

/** Bước 2: Luyện điền trắc nghiệm A / B */
export default function SentenceStructurePracticePage() {
  const { structureId } = useParams<{ structureId: string }>()
  const item = useLiveQuery(
    () => structureId ? sentenceStructureRepo.get(structureId) : undefined,
    [structureId],
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [structureId])

  if (!structureId) {
    return <Navigate to="/app/sentence-structure" replace />
  }

  if (item === null) {
    return <Navigate to="/app/sentence-structure" replace />
  }

  return (
    <div className="ss-shell">
      <header className="ss-topbar">
        <Link to="/app/sentence-structure" className="ss-back-link">
          <ArrowLeft size={15} />
          Danh sách cấu trúc
        </Link>
        <span className="ss-badge">Điền trắc nghiệm</span>
      </header>

      {item === undefined ? (
        <div className="ss-empty-main">Đang tải…</div>
      ) : (
        <StructurePracticePanel structureId={structureId} />
      )}
    </div>
  )
}