import type { LucideIcon } from 'lucide-react'

interface PanelEmptyProps {
  icon: LucideIcon
  message: string
  action?: { label: string; onClick: () => void }
}

export default function PanelEmpty({ icon: Icon, message, action }: PanelEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Icon size={28} className="mb-2" style={{ color: 'var(--border-color)' }} />
      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="text-xs font-medium"
          style={{ color: 'var(--color-primary)' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}