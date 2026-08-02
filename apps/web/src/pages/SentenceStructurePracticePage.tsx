import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { sentenceStructureRepo } from '@ryan/db'
import { useLiveQuery } from 'dexie-react-hooks'
import StructurePracticePanel from '../features/sentence-structure/StructurePracticePanel'
import '../features/sentence-structure/structurePractice.css'

/** Bước 2: Luyện điền trắc nghiệm A / B */
export default function SentenceStructurePracticePage() {
  const navigate = useNavigate()
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

  function leavePractice() {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/app/sentence-structure')
  }

  return (
    <div className="ss-shell ss-focus-shell">
      <header className="ss-focus-header">
        <button type="button" className="ss-focus-back" onClick={leavePractice} aria-label="Quay lại danh sách cấu trúc">
          <ArrowLeft size={18} />
          <span>Danh sách cấu trúc</span>
        </button>

        <div className="ss-focus-title">
          <strong>{item?.title ?? 'Đang tải…'}</strong>
          {item?.cefr && <span className="ss-focus-cefr">{item.cefr}</span>}
        </div>

        <div className="ss-focus-actions">
          <span className="ss-focus-progress" aria-label="Tiến độ 1 trên 1">1 / 1</span>
          <button type="button" className="ss-focus-exit" onClick={leavePractice} aria-label="Thoát bài luyện tập">
            <X size={17} />
            <span>Thoát</span>
          </button>
        </div>
      </header>

      {item === undefined ? (
        <div className="ss-empty-main">Đang tải…</div>
      ) : (
        <div className="ss-practice-workspace">
          <StructurePracticePanel structureId={structureId} />
        </div>
      )}
    </div>
  )
}