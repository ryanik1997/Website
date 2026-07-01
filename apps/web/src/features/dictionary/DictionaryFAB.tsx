import { BookOpen } from 'lucide-react'
import { useDictStore } from './dictStore'

export default function DictionaryFAB() {
  const open = useDictStore(s => s.open)

  function handleClick() {
    // Pre-fill with selected text if any
    const selected = window.getSelection()?.toString().trim() ?? ''
    open(selected)
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
      style={{ background: 'var(--color-primary)', color: '#fff' }}
      title="Tra từ điển (chọn từ trên trang rồi nhấn)"
    >
      <BookOpen size={20} />
    </button>
  )
}
