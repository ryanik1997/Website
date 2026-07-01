import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, GitBranch, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { db, mindmapRepo } from '@ryan/db'
import { useMindmapStore } from './mindmapStore'
import { flattenNodes, type MindNode } from './types'
import NewMindmapModal from './NewMindmapModal'
import PanelHeader from '../../components/PanelHeader'
import PanelEmpty from '../../components/PanelEmpty'

export default function MindmapListPanel() {
  const maps = useLiveQuery(() => db.mindmaps.orderBy('updatedAt').reverse().toArray(), [])
  const { activeMapId, setActiveMap } = useMindmapStore()
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div
      className="w-60 flex flex-col shrink-0 border-r"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <PanelHeader
        title="MindMap"
        subtitle={maps?.length ? `${maps.length} mindmap` : undefined}
        actions={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ color: 'var(--color-primary)' }}
            title="Tạo MindMap mới"
          >
            <Plus size={16} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-2">
        {!maps?.length ? (
          <PanelEmpty
            icon={GitBranch}
            message="Chưa có mindmap nào"
            action={{ label: '+ Tạo mindmap', onClick: () => setShowCreate(true) }}
          />
        ) : (
          maps.map(map => {
            const nodeCount = map.nodes
              ? flattenNodes(map.nodes as MindNode).length
              : 1
            return (
              <div
                key={map.id}
                className="group flex items-center rounded-lg mb-0.5 transition-colors"
                style={{
                  background: activeMapId === map.id
                    ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
                    : 'transparent',
                }}
              >
                <button
                  onClick={() => setActiveMap(map.id)}
                  className="flex-1 text-left px-3 py-2.5 min-w-0"
                >
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: activeMapId === map.id ? 'var(--color-primary)' : 'var(--text-primary)' }}
                  >
                    {map.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {nodeCount} node{nodeCount !== 1 ? 's' : ''}
                  </p>
                </button>
                <button
                  onClick={async e => {
                    e.stopPropagation()
                    if (!confirm(`Xóa mindmap "${map.name}"?`)) return
                    await mindmapRepo.delete(map.id)
                    if (activeMapId === map.id) setActiveMap(null)
                  }}
                  className="mr-1 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ef444422]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          })
        )}
      </div>

      {showCreate && (
        <NewMindmapModal
          onClose={() => setShowCreate(false)}
          onCreated={setActiveMap}
        />
      )}
    </div>
  )
}
