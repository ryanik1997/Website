import type { ReactNode } from 'react'

interface PanelHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  border?: boolean
}

export default function PanelHeader({ title, subtitle, actions, border = true }: PanelHeaderProps) {
  return (
    <div
      className="px-4 py-3.5 flex items-center gap-3 shrink-0"
      style={{
        borderBottom: border ? '1px solid var(--border-color)' : undefined,
        background: 'var(--bg-card)',
      }}
    >
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
    </div>
  )
}