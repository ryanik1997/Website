import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { copyToClipboard } from '../lib/copyToClipboard'

interface Props {
  text: string
  title?: string
  className?: string
  size?: number
}

export default function CopyButton({ text, title = 'Copy', className = '', size = 14 }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    const ok = await copyToClipboard(text)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Đã copy' : title}
      aria-label={copied ? 'Đã copy' : title}
      className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-secondary)] ${className}`}
      style={{ color: copied ? 'var(--color-primary)' : 'var(--text-muted)' }}
    >
      {copied ? <Check size={size} /> : <Copy size={size} />}
    </button>
  )
}