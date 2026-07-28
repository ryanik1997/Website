import { ArrowLeft } from 'lucide-react'
import './examShared.css'

interface Props {
  onClick: () => void
  label?: string
}

export default function ExamHeaderBack({ onClick, label = 'Quay lại' }: Props) {
  return (
    <button type="button" className="exam-header-back" onClick={onClick}>
      <ArrowLeft size={14} />
      {label}
    </button>
  )
}