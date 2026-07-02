import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import NewStructureModal from '../features/sentence-structure/NewStructureModal'
import StructureListHub from '../features/sentence-structure/StructureListHub'
import '../features/sentence-structure/structurePractice.css'

/** Bước 1: Danh sách cấu trúc câu — tìm kiếm + phân trang */
export default function SentenceStructureListPage() {
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)

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