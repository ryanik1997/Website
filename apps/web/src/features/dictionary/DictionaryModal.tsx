import { useState, useEffect, useRef } from 'react'
import { X, Search, Volume2, Plus, Clock, Loader2, AlertCircle } from 'lucide-react'
import { db, dictRepo } from '@ryan/db'
import { callAI, type AIProvider, buildDictionaryPrompt, type DictResult } from '@ryan/core'
import { useDictStore } from './dictStore'
import SaveToDeckModal from './SaveToDeckModal'
import CopyButton from '../../components/CopyButton'

function formatDictResult(result: DictResult): string {
  const lines = [result.word]
  if (result.ipaUS) lines.push(`US ${result.ipaUS}`)
  if (result.ipaUK) lines.push(`UK ${result.ipaUK}`)
  result.definitions.forEach((def, i) => {
    const prefix = result.definitions.length > 1 ? `${i + 1}. ` : ''
    lines.push(`${prefix}${def.meaning}`)
    if (def.example) lines.push(`  "${def.example}"`)
    if (def.exampleVi) lines.push(`  → ${def.exampleVi}`)
  })
  if (result.collocations?.length) lines.push(`Collocations: ${result.collocations.join(', ')}`)
  if (result.synonyms?.length) lines.push(`Synonyms: ${result.synonyms.join(', ')}`)
  return lines.join('\n')
}

function speakWord(word: string) {
  speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(word)
  utt.lang = 'en-US'
  utt.rate = 0.85
  speechSynthesis.speak(utt)
}

export default function DictionaryModal() {
  const { isOpen, initialQuery, close } = useDictStore()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<DictResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recent, setRecent] = useState<string[]>([])
  const [showSave, setShowSave] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    setResult(null)
    setError('')
    setQuery(initialQuery)
    loadRecent()
    setTimeout(() => inputRef.current?.focus(), 80)
    if (initialQuery.trim()) lookup(initialQuery.trim())
  }, [isOpen, initialQuery])

  async function loadRecent() {
    const entries = await dictRepo.recent(12)
    setRecent(entries.map(e => (e.data as DictResult | null)?.word ?? e.word))
  }

  async function lookup(word: string) {
    const w = word.trim()
    if (!w) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      // 1. Cache hit
      const fresh = await dictRepo.isFresh(w)
      if (fresh) {
        const cached = await dictRepo.get(w)
        if (cached) {
          setResult(cached.data as DictResult)
          setLoading(false)
          loadRecent()
          return
        }
      }

      // 2. API key
      const provider = ((await db.settings.get('ai_provider'))?.value as AIProvider) ?? 'openai'
      const apiKey = ((await db.settings.get(`ai_key_${provider}`))?.value as string) ?? ''
      if (!apiKey) {
        setError('Chưa cài đặt API key. Vào module Viết → ⚙ Cài đặt AI để nhập key.')
        setLoading(false)
        return
      }

      // 3. Call AI
      const messages = buildDictionaryPrompt(w)
      const res = await callAI(messages, apiKey, provider)
      const data = JSON.parse(res.content) as DictResult

      // 4. Cache
      await dictRepo.save(w, data)
      setResult(data)
      loadRecent()
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message.slice(0, 140)
          : 'Không thể tra từ. Kiểm tra API key và kết nối mạng.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center pt-16 px-4"
        onClick={close}
      >
        {/* Modal */}
        <div
          className="w-full max-w-md rounded-2xl shadow-2xl flex flex-col"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            maxHeight: 'calc(100vh - 5rem)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Search bar */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b shrink-0"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <Search size={15} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup(query)}
              placeholder="Nhập từ hoặc cụm từ..."
              className="flex-1 outline-none text-sm bg-transparent"
              style={{ color: 'var(--text-primary)' }}
            />
            {query.trim() && (
              <button
                onClick={() => lookup(query)}
                className="px-3 py-1 rounded-lg text-xs text-white font-medium shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >
                Tra
              </button>
            )}
            {query && (
              <button
                onClick={() => { setQuery(''); setResult(null); setError('') }}
                className="shrink-0 p-0.5 rounded"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={13} />
              </button>
            )}
            <button
              onClick={close}
              className="shrink-0 p-1 rounded-lg hover:bg-[var(--bg-secondary)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-14 gap-3">
                <Loader2 size={22} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tra từ...</span>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div
                className="mx-4 mt-4 flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: '#ef444418', color: '#ef4444' }}
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Recent words (empty state) */}
            {!loading && !result && !error && recent.length > 0 && (
              <div className="p-4">
                <p
                  className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Clock size={11} /> Tra gần đây
                </p>
                <div className="flex flex-wrap gap-2">
                  {recent.map(w => (
                    <button
                      key={w}
                      onClick={() => { setQuery(w); lookup(w) }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state when nothing */}
            {!loading && !result && !error && !recent.length && (
              <div className="flex flex-col items-center py-12 text-center px-6">
                <BookOpenIcon />
                <p className="font-medium mt-3 mb-1" style={{ color: 'var(--text-primary)' }}>Tra từ điển AI</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Nhập từ hoặc cụm từ tiếng Anh để tra nghĩa.<br />
                  Chọn từ trên trang rồi nhấn FAB để tra nhanh.
                </p>
              </div>
            )}

            {/* Result */}
            {result && !loading && (
              <div className="p-4">
                {/* Word header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {result.word}
                      </h2>
                      {result.pos && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#6366f120', color: '#818cf8' }}
                        >
                          {result.pos}
                        </span>
                      )}
                      {result.level && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: '#f9731620', color: '#f97316' }}
                        >
                          {result.level}
                        </span>
                      )}
                    </div>
                    {(result.ipaUS || result.ipaUK) && (
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {result.ipaUS && <span>US {result.ipaUS}</span>}
                        {result.ipaUS && result.ipaUK && <span className="mx-2">·</span>}
                        {result.ipaUK && <span>UK {result.ipaUK}</span>}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <CopyButton text={formatDictResult(result)} title="Copy kết quả" size={16} />
                    <button
                      onClick={() => speakWord(result.word)}
                      className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
                      style={{ color: 'var(--text-muted)' }}
                      title="Nghe phát âm"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Definitions */}
                <div className="flex flex-col gap-3 mb-4">
                  {result.definitions.map((def, i) => (
                    <div
                      key={i}
                      className="pl-3 border-l-2"
                      style={{ borderColor: 'var(--color-primary)' }}
                    >
                      <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {result.definitions.length > 1 && (
                          <span className="mr-1.5 font-bold" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
                        )}
                        {def.meaning}
                      </p>
                      {def.example && (
                        <p className="text-xs italic mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          "{def.example}"
                        </p>
                      )}
                      {def.exampleVi && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          → {def.exampleVi}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Collocations */}
                {result.collocations && result.collocations.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                      Cụm từ thường gặp
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.collocations.map(c => (
                        <button
                          key={c}
                          onClick={() => { setQuery(c); lookup(c) }}
                          className="text-xs px-2.5 py-1 rounded-full border transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synonyms */}
                {result.synonyms && result.synonyms.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                      Từ đồng nghĩa
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.synonyms.map(s => (
                        <button
                          key={s}
                          onClick={() => { setQuery(s); lookup(s) }}
                          className="text-xs px-2.5 py-1 rounded-full transition-colors hover:text-[var(--color-primary)]"
                          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to deck */}
                <button
                  onClick={() => setShowSave(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                  style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                >
                  <Plus size={14} />
                  Thêm vào bộ thẻ từ vựng
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSave && result && (
        <SaveToDeckModal
          word={result.word}
          meaning={result.definitions[0]?.meaning ?? ''}
          example={result.definitions[0]?.example}
          ipaUS={result.ipaUS}
          ipaUK={result.ipaUK}
          pos={result.pos}
          onClose={() => setShowSave(false)}
        />
      )}
    </>
  )
}

function BookOpenIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--border-color)' }}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
