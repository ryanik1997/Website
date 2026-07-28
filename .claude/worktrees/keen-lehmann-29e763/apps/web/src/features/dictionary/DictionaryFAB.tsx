import { BookOpen } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useDictStore } from './dictStore'

const EXAM_SESSION_PATH = /\/app\/exam\/(listening|reading|writing)\/[^/]+/

export default function DictionaryFAB() {
  const location = useLocation()
  const open = useDictStore(s => s.open)
  const isExamSession = EXAM_SESSION_PATH.test(location.pathname)

  function handleClick() {
    const selected = window.getSelection()?.toString().trim() ?? ''
    open(selected)
  }

  return (
    <button
      onClick={handleClick}
      className={`fixed right-6 z-30 w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
        isExamSession ? 'bottom-[5.75rem]' : 'bottom-6'
      }`}
      style={{ background: 'var(--color-primary)', color: '#fff' }}
      title="Tra từ điển (chọn từ trên trang rồi nhấn)"
    >
      <BookOpen size={20} />
    </button>
  )
}