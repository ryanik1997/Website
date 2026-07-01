import {
  RotateCcw, HelpCircle, Briefcase, Headphones, FileWarning, BarChart3, RefreshCw,
} from 'lucide-react'
import type { StudyMode } from '../vocabStore'

const MODES: Array<{ id: StudyMode; label: string; icon: typeof RotateCcw; activeCls: string }> = [
  { id: 'srs', label: 'Lặp lại ngắt quãng', icon: RotateCcw, activeCls: 'active-srs' },
  { id: 'quiz', label: 'Trắc nghiệm', icon: HelpCircle, activeCls: 'active-quiz' },
  { id: 'type', label: 'Đoán nghĩa', icon: Briefcase, activeCls: 'active-type' },
  { id: 'listen', label: 'Nghe & Gõ', icon: Headphones, activeCls: 'active-srs' },
  { id: 'weak', label: 'Từ yếu', icon: FileWarning, activeCls: 'active-weak' },
  { id: 'review', label: 'Ôn tập', icon: RefreshCw, activeCls: 'active-review' },
  { id: 'stats', label: 'Thống kê', icon: BarChart3, activeCls: 'active-stats' },
]

interface Props {
  active: StudyMode
  onChange: (mode: StudyMode) => void
}

export default function StudyModeTabs({ active, onChange }: Props) {
  return (
    <div className="vs-modebar">
      {MODES.map(({ id, label, icon: Icon, activeCls }) => (
        <button
          key={id}
          type="button"
          className={`vs-mode-tab ${active === id ? activeCls : ''}`}
          onClick={() => onChange(id)}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  )
}