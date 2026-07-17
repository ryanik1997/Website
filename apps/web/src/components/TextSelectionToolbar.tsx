import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { copyToClipboard } from '../lib/copyToClipboard'

interface ToolbarState {
  x: number
  y: number
  text: string
}

function nodeElement(node: Node | null): Element | null {
  if (!node) return null
  if (node.nodeType === Node.TEXT_NODE) return node.parentElement
  return node as Element
}

function isBlockedSelection(el: Element | null): boolean {
  if (!el) return true
  if (el.closest('[data-no-copy-toolbar]')) return true
  if (el.closest('[data-reading-highlight-zone]')) return true
  if (el.closest('[data-exam-highlight-zone]')) return true
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

export default function TextSelectionToolbar() {
  const [state, setState] = useState<ToolbarState | null>(null)
  const [copied, setCopied] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const update = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setState(null)
      setCopied(false)
      return
    }

    const text = selection.toString().trim()
    if (!text) {
      setState(null)
      return
    }

    const anchorEl = nodeElement(selection.anchorNode)
    const focusEl = nodeElement(selection.focusNode)
    if (isBlockedSelection(anchorEl) || isBlockedSelection(focusEl)) {
      setState(null)
      return
    }

    const rect = selection.getRangeAt(0).getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      setState(null)
      return
    }

    setState({
      x: rect.left + rect.width / 2,
      y: Math.max(12, rect.top - 10),
      text,
    })
    setCopied(false)
  }, [])

  useEffect(() => {
    document.addEventListener('mouseup', update)
    document.addEventListener('keyup', update)
    document.addEventListener('selectionchange', update)
    return () => {
      document.removeEventListener('mouseup', update)
      document.removeEventListener('keyup', update)
      document.removeEventListener('selectionchange', update)
    }
  }, [update])

  async function handleCopy() {
    if (!state) return
    const ok = await copyToClipboard(state.text)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => {
      setCopied(false)
      setState(null)
      window.getSelection()?.removeAllRanges()
    }, 1200)
  }

  if (!state) return null

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Sao chép văn bản"
      className="fixed z-[70] flex items-center -translate-x-1/2 -translate-y-full"
      style={{
        left: state.x,
        top: state.y,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 24px color-mix(in srgb, var(--text-primary) 12%, transparent)',
        borderRadius: '10px',
      }}
      onMouseDown={e => e.preventDefault()}
    >
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[9px] transition-colors hover:bg-[var(--bg-secondary)]"
        style={{ color: copied ? 'var(--color-primary)' : 'var(--text-primary)' }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Đã sao chép' : 'Sao chép'}
      </button>
    </div>
  )
}
