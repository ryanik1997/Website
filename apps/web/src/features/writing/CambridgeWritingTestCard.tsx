import { ArrowRight } from 'lucide-react'
import type { CambridgeWritingTest } from '@ryan/catalog'
import { useIsAdmin } from '../auth/useIsAdmin'

interface Props {
  test: CambridgeWritingTest
  onOpen: () => void
}

export default function CambridgeWritingTestCard({ test, onOpen }: Props) {
  const isAdmin = useIsAdmin()
  const genres = Array.from(new Set(test.tasks.map(task => task.genre)))

  return (
    <button type="button" className="cb-card" onClick={onOpen}>
      <div className="cb-card-top">
        <span className="cb-card-badge">Test {String(test.testNumber).padStart(2, '0')}</span>
        <span className="cb-card-count">{test.tasks.length} tasks</span>
      </div>
      <h2 className="cb-card-title">{test.title}</h2>
      <p className="cb-card-desc">{genres.join(' · ')}</p>
      {isAdmin === true && test.status === 'draft' ? (
        <p className="cb-card-desc" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Nháp</p>
      ) : null}
      <span className="cb-card-meta" style={{ color: 'var(--color-primary)' }}>
        Open test
        <ArrowRight size={14} />
      </span>
    </button>
  )
}
