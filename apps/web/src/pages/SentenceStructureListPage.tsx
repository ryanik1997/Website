import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { sentenceStructureRepo } from '@ryan/db'
import { SAMPLE_STRUCTURES } from '../features/sentence-structure/sampleStructures'
import StructureListHub from '../features/sentence-structure/StructureListHub'
import NewStructureModal from '../features/sentence-structure/NewStructureModal'
import '../features/sentence-structure/structurePractice.css'

async function seedStructures() {
  const count = await sentenceStructureRepo.count()
  if (count > 0) return
  for (const s of SAMPLE_STRUCTURES) {
    await sentenceStructureRepo.create(s)
  }
}

/** Bước 1: Danh sách cấu trúc câu — tìm kiếm + phân trang */
export default function SentenceStructureListPage() {
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    void seedStructures()
  }, [])

  return (
    <div className="ss-shell">
      <header className="ss-topbar">
        <div className="ss-topbar-left">
          <span className="ss-badge">Cấu trúc câu</span>
          <span className="ss-topbar-sub">Chọn bài để luyện điền A / B</span>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="ss-check-btn"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}
        >
          <Plus size={15} />
          Thêm bài
        </button>
      </header>

      <StructureListHub />

      {showCreate && (
        <NewStructureModal
          onClose={() => setShowCreate(false)}
          onCreated={id => {
            setShowCreate(false)
            navigate(`/app/sentence-structure/${id}`)
          }}
        />
      )}
    </div>
  )
}