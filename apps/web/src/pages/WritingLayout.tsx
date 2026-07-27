import { Outlet, useLocation, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function WritingLayout() {
  const { pathname } = useLocation()
  const isHub = pathname === '/app/writing' || pathname === '/app/writing/'
  const isCambridgeFlow = pathname.startsWith('/app/writing/cambridge')

  return (
    <div
      className="writing-layout flex flex-col h-full min-h-0 overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {!isHub && !isCambridgeFlow && (
        <div
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 border-b"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <Link
            to="/app/writing"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}
          >
            <ArrowLeft size={15} />
            Thư Viện Writing
          </Link>
        </div>
      )}
      <div
        className={`writing-layout__content flex-1 min-h-0 flex flex-col ${isCambridgeFlow ? 'overflow-hidden' : 'overflow-y-auto'}`}
        style={{ background: 'var(--bg-primary)' }}
      >
        <Outlet />
      </div>
    </div>
  )
}
