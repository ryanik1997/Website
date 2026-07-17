import { useState, useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { X, Search, Volume2, Plus, Clock, Loader2, AlertCircle, Bookmark, Copy } from 'lucide-react'
import { db, dictRepo, writingRepo, notebookRepo } from '@ryan/db'
import {
  callAI, type AIProvider, buildDictionaryPrompt, type DictResult,
  canUse, type Plan,
} from '@ryan/core'
import { useDictStore } from './dictStore'
import SaveToDeckModal from './SaveToDeckModal'
import {
  lookupOfflineDict,
  offlineDictPart2Size,
  offlineDictPart3Size,
  offlineDictPart4Size,
  offlineDictPart5Size,
  offlineDictPhrasalSize,
  offlineDictIdiomsSize,
  offlineDictCollocationsSize,
  offlineDictSize,
} from './offlineDictPack'
import { enrichDictResult } from './enrichDictResult'
import { copyToClipboard } from '../../lib/copyToClipboard'
import { speakPhrase, type SpeakVariant } from '../vocab/study/speakPhrase'
import './dictionaryModal.css'

function formatDictResult(result: DictResult): string {
  const lines = [result.word]
  if (result.ipaUS) lines.push(`US ${result.ipaUS}`)
  if (result.ipaUK) lines.push(`UK ${result.ipaUK}`)
  result.definitions.forEach((def, i) => {
    lines.push(`${i + 1}. ${def.meaning}`)
    if (def.example) lines.push(`  "${def.example}"`)
    if (def.exampleVi) lines.push(`  → ${def.exampleVi}`)
  })
  if (result.collocations?.length) lines.push(`Collocations: ${result.collocations.join(', ')}`)
  if (result.synonyms?.length) lines.push(`Synonyms: ${result.synonyms.join(', ')}`)
  return lines.join('\n')
}

/** Kokoro TTS — US (`a`) / UK (`b`); fallback Web Speech trong speakPhrase. */
async function speakDictWord(word: string, variant: SpeakVariant = 'us') {
  const text = word.trim()
  if (!text) return
  await speakPhrase(text, 0.9, undefined, variant)
}

function sourceLabel(hint: 'cache' | 'offline' | 'ai' | null): string {
  if (hint === 'offline' || hint === 'cache') return 'Đã lưu trên máy'
  if (hint === 'ai') return 'AI (Pro)'
  return ''
}

export default function DictionaryModal() {
  const { isOpen, initialQuery, close } = useDictStore()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<DictResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sourceHint, setSourceHint] = useState<'cache' | 'offline' | 'ai' | null>(null)
  const [recent, setRecent] = useState<string[]>([])
  const [showSave, setShowSave] = useState(false)
  const [notebookBusy, setNotebookBusy] = useState(false)
  const [notebookFlash, setNotebookFlash] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState<'us' | 'uk' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const plan = useLiveQuery(
    () => db.settings.get('plan').then(s => (s?.value as Plan) ?? 'free'),
    [],
  ) ?? 'free'
  const aiAllowed = canUse(plan, 'dictionary_ai')

  useEffect(() => {
    if (!isOpen) return
    setResult(null)
    setError('')
    setSourceHint(null)
    setSpeaking(null)
    setQuery(initialQuery)
    void loadRecent()
    setTimeout(() => inputRef.current?.focus(), 80)
    if (initialQuery.trim()) void lookup(initialQuery.trim())
  }, [isOpen, initialQuery])

  async function loadRecent() {
    const entries = await dictRepo.recent(12)
    setRecent(entries.map(e => (e.data as DictResult | null)?.word ?? e.word))
  }

  function applyResult(data: DictResult, hint: 'cache' | 'offline' | 'ai') {
    const full = enrichDictResult(data)
    setResult(full)
    setSourceHint(hint)
    return full
  }

  async function lookup(word: string) {
    const w = word.trim()
    if (!w) return
    setLoading(true)
    setError('')
    setResult(null)
    setSourceHint(null)

    try {
      // 1. Offline pack (ưu tiên — luôn enrich full true.jpg)
      const offline = lookupOfflineDict(w)
      if (offline) {
        const full = applyResult(offline, 'offline')
        try { await dictRepo.save(w, full) } catch { /* ignore */ }
        setLoading(false)
        void loadRecent()
        return
      }

      // 2. Cache
      const fresh = await dictRepo.isFresh(w)
      if (fresh) {
        const cached = await dictRepo.get(w)
        if (cached) {
          applyResult(cached.data as DictResult, 'cache')
          setLoading(false)
          void loadRecent()
          return
        }
      }

      // 3. AI
      if (!aiAllowed) {
        setError(
          `Không có trong gói offline (${offlineDictSize()} từ). Nâng Pro để tra AI mọi từ.`,
        )
        setLoading(false)
        return
      }

      const provider = ((await db.settings.get('ai_provider'))?.value as AIProvider) ?? 'openai'
      const apiKey = ((await db.settings.get(`ai_key_${provider}`))?.value as string) ?? ''
      if (!apiKey) {
        setError('Gói Pro: cần API key. Vào Cài đặt → AI để nhập key.')
        setLoading(false)
        return
      }

      const messages = buildDictionaryPrompt(w)
      const res = await callAI(messages, apiKey, provider)
      const data = JSON.parse(res.content) as DictResult
      try {
        await writingRepo.recordUsage(
          'dictionary_ai',
          (res.inputTokens ?? 0) + (res.outputTokens ?? 0),
        )
      } catch { /* ignore */ }

      const full = applyResult(data, 'ai')
      await dictRepo.save(w, full)
      void loadRecent()
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

  async function handleCopy() {
    if (!result) return
    try {
      await copyToClipboard(formatDictResult(result))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch { /* ignore */ }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="dict-overlay" onClick={close}>
        <div className="dict-modal-shell" onClick={e => e.stopPropagation()}>
          {/* Search — true.jpg: 🔍 input | Tra | × | × */}
          <div className="dict-search">
            <Search size={16} strokeWidth={2} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && void lookup(query)}
              placeholder="Nhập từ hoặc cụm từ..."
              className="dict-search__input"
            />
            <button
              type="button"
              className="dict-search__tra"
              onClick={() => void lookup(query)}
            >
              Tra
            </button>
            <button
              type="button"
              className="dict-search__icon-btn"
              title="Xóa"
              onClick={() => { setQuery(''); setResult(null); setError('') }}
            >
              <X size={15} />
            </button>
            <button
              type="button"
              className="dict-search__icon-btn"
              title="Đóng"
              onClick={close}
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-14 gap-3">
                <Loader2 size={22} className="animate-spin" style={{ color: '#7c6cf0' }} />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tra từ...</span>
              </div>
            )}

            {error && !loading && (
              <div
                className="mx-4 mt-4 flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: '#ef444418', color: '#ef4444' }}
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

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
                      type="button"
                      onClick={() => { setQuery(w); void lookup(w) }}
                      className="dict-chip dict-chip--outline"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && !result && !error && !recent.length && (
              <div className="flex flex-col items-center py-12 text-center px-6">
                <BookOpenIcon />
                <p className="font-medium mt-3 mb-1" style={{ color: 'var(--text-primary)' }}>Từ điển</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Offline {offlineDictSize()} mục · P2–P5 {offlineDictPart2Size() + offlineDictPart3Size() + offlineDictPart4Size() + offlineDictPart5Size()} · PV {offlineDictPhrasalSize()} · Idiom {offlineDictIdiomsSize()} · Colloc {offlineDictCollocationsSize()} · AI khi Pro.
                </p>
              </div>
            )}

            {/* Result — true.jpg */}
            {result && !loading && (
              <div className="dict-result">
                <p className="dict-result__source">{sourceLabel(sourceHint)}</p>

                <div className="dict-result__head">
                  <div className="min-w-0 flex-1">
                    <div className="dict-result__word-row">
                      <h2 className="dict-result__word">{result.word}</h2>
                      {result.pos && <span className="dict-pill dict-pill--pos">{result.pos}</span>}
                      {result.level && <span className="dict-pill dict-pill--level">{result.level}</span>}
                    </div>
                    {(result.ipaUS || result.ipaUK) && (
                      <div className="dict-result__ipa-row" role="group" aria-label="Phiên âm IPA">
                        {result.ipaUS && (
                          <div className="dict-ipa-card">
                            <span className="dict-ipa-card__label">US</span>
                            <span className="dict-ipa-card__text">{result.ipaUS}</span>
                            <button
                              type="button"
                              className="dict-ipa-card__speak"
                              title="Nghe giọng Mỹ (Kokoro US)"
                              disabled={speaking !== null}
                              onClick={() => {
                                setSpeaking('us')
                                void speakDictWord(result.word, 'us').finally(() => setSpeaking(null))
                              }}
                            >
                              {speaking === 'us'
                                ? <Loader2 size={15} className="animate-spin" />
                                : <Volume2 size={15} />}
                              <span>Nghe US</span>
                            </button>
                          </div>
                        )}
                        {result.ipaUK && (
                          <div className="dict-ipa-card">
                            <span className="dict-ipa-card__label">UK</span>
                            <span className="dict-ipa-card__text">{result.ipaUK}</span>
                            <button
                              type="button"
                              className="dict-ipa-card__speak"
                              title="Nghe giọng Anh (Kokoro UK)"
                              disabled={speaking !== null}
                              onClick={() => {
                                setSpeaking('uk')
                                void speakDictWord(result.word, 'uk').finally(() => setSpeaking(null))
                              }}
                            >
                              {speaking === 'uk'
                                ? <Loader2 size={15} className="animate-spin" />
                                : <Volume2 size={15} />}
                              <span>Nghe UK</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center shrink-0">
                    <button
                      type="button"
                      className="dict-icon-btn"
                      title={copied ? 'Đã copy' : 'Copy'}
                      onClick={() => void handleCopy()}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div className="dict-defs">
                  {result.definitions.map((def, i) => (
                    <div key={i} className="dict-def">
                      <p className="dict-def__meaning">
                        <span className="dict-def__num">{i + 1}.</span>
                        {def.meaning}
                      </p>
                      {def.example && (
                        <p className="dict-def__example">&ldquo;{def.example}&rdquo;</p>
                      )}
                      {def.exampleVi && (
                        <p className="dict-def__example-vi">→ {def.exampleVi}</p>
                      )}
                    </div>
                  ))}
                </div>

                {!!result.collocations?.length && (
                  <div className="dict-section">
                    <p className="dict-section__label">Cụm từ thường gặp</p>
                    <div className="dict-chips">
                      {result.collocations.map(c => (
                        <button
                          key={c}
                          type="button"
                          className="dict-chip dict-chip--outline"
                          onClick={() => { setQuery(c); void lookup(c) }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!!result.synonyms?.length && (
                  <div className="dict-section">
                    <p className="dict-section__label">Từ đồng nghĩa</p>
                    <div className="dict-chips">
                      {result.synonyms.map(s => (
                        <button
                          key={s}
                          type="button"
                          className="dict-chip dict-chip--soft"
                          onClick={() => { setQuery(s); void lookup(s) }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="dict-actions">
                  <button
                    type="button"
                    disabled={notebookBusy}
                    className="dict-btn dict-btn--ghost"
                    onClick={async () => {
                      if (!result) return
                      setNotebookBusy(true)
                      try {
                        const { created } = await notebookRepo.save({
                          phrase: result.word,
                          meaning: result.definitions.map(d => d.meaning).join('; '),
                          example: result.definitions[0]?.example,
                          ipaUS: result.ipaUS,
                          ipaUK: result.ipaUK,
                          pos: result.pos,
                          source: 'dictionary',
                        })
                        setNotebookFlash(created ? 'Đã lưu vào sổ ghi chú!' : 'Đã cập nhật sổ ghi chú')
                        window.setTimeout(() => setNotebookFlash(null), 1800)
                      } finally {
                        setNotebookBusy(false)
                      }
                    }}
                  >
                    <Bookmark size={15} />
                    {notebookFlash ?? (notebookBusy ? 'Đang lưu…' : 'Lưu sổ ghi chú')}
                  </button>
                  <button
                    type="button"
                    className="dict-btn dict-btn--primary"
                    onClick={() => setShowSave(true)}
                  >
                    <Plus size={15} />
                    Thêm vào bộ thẻ từ vựng
                  </button>
                </div>
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
