import { Eye } from 'lucide-react'

export type LessonTab = 'practice' | 'transcript' | 'shadowing'

const TABS: { id: LessonTab; label: string; icon?: typeof Eye }[] = [
  { id: 'practice', label: 'Luyện tập' },
  { id: 'transcript', label: 'Transcript' },
  { id: 'shadowing', label: 'Shadowing', icon: Eye },
]

interface Props {
  active: LessonTab
  onChange: (tab: LessonTab) => void
}

export default function ListeningTabs({ active, onChange }: Props) {
  return (
    <div
      className="flex gap-6 border-b mb-6 overflow-x-auto"
      style={{ borderColor: 'var(--border-color)' }}
    >
      {TABS.map(t => {
        const isActive = active === t.id
        const Icon = t.icon
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className="pb-3 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors flex items-center gap-1.5"
            style={{
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: isActive ? '2px solid var(--text-primary)' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {Icon && <Icon size={14} />}
            {t.label}
          </button>
        )
      })}
    </div>
  )
}