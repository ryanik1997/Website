import { X } from 'lucide-react'
import AiSettingsPanel from '../settings/AiSettingsPanel'

export default function AiSettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-card)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Cài đặt AI</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AiSettingsPanel onSave={onClose} />
        </div>
      </div>
    </div>
  )
}