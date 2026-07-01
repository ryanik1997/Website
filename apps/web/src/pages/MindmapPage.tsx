import { useLiveQuery } from 'dexie-react-hooks'
import { GitBranch } from 'lucide-react'
import { db, mindmapRepo } from '@ryan/db'
import { useMindmapStore } from '../features/mindmap/mindmapStore'
import MindmapListPanel from '../features/mindmap/MindmapListPanel'
import MindmapCanvas from '../features/mindmap/MindmapCanvas'
import { type MindNode, type MindmapLayout } from '../features/mindmap/types'

export default function MindmapPage() {
  const { activeMapId } = useMindmapStore()
  const map = useLiveQuery(
    () => activeMapId ? db.mindmaps.get(activeMapId) : undefined,
    [activeMapId],
  )

  return (
    <div className="flex h-full overflow-hidden">
      <MindmapListPanel />

      {!activeMapId || !map ? (
        <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
          <div className="text-center">
            <GitBranch size={44} className="mx-auto mb-4" style={{ color: 'var(--border-color)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Chọn hoặc tạo MindMap</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Dùng AI Expand để sinh từ liên quan tự động (PRO)
            </p>
          </div>
        </div>
      ) : (
        <MindmapCanvas
          key={activeMapId}
          root={map.nodes as MindNode}
          layout={(map.layout as MindmapLayout) ?? 'round'}
          onSave={async (tree) => {
            await mindmapRepo.saveTree(activeMapId, tree)
          }}
          onLayoutChange={async (layout) => {
            await mindmapRepo.setLayout(activeMapId, layout)
          }}
        />
      )}
    </div>
  )
}
