import { useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import CopyButton from '../../components/CopyButton'
import { lessonRepo } from '@ryan/db'
import type { LessonSentence } from './types'
import { estimateWordTimings, wordIndexAtTime } from './wordTimings'
import { estimateSpeechDurationSec } from './practiceUtils'
import { speak, stop, getActiveAudio } from './tts'

interface Props {
  lessonId: string
  sentences: LessonSentence[]
  onSentencesChange?: () => void
}

function wordsOf(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}

export default function ListeningTranscriptTab({ lessonId, sentences, onSentencesChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftText, setDraftText] = useState('')
  const [draftVi, setDraftVi] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null)
  const [activeWordIdx, setActiveWordIdx] = useState(-1)
  const [playingId, setPlayingId] = useState<string | null>(null)

  function startEdit(s: LessonSentence) {
    setEditingId(s.id)
    setDraftText(s.text)
    setDraftVi(s.vi ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
    setDraftText('')
    setDraftVi('')
  }

  async function saveEdit(sentenceId: string) {
    setSaving(true)
    const updated = sentences.map(s =>
      s.id === sentenceId ? { ...s, text: draftText.trim(), vi: draftVi.trim() || undefined } : s,
    )
    await lessonRepo.update(lessonId, { sentences: updated })
    setSaving(false)
    setEditingId(null)
    onSentencesChange?.()
  }

  async function playSentenceFromWord(s: LessonSentence, wordIndex: number) {
    stop()
    setActiveSentenceId(s.id)
    setActiveWordIdx(wordIndex)
    setPlayingId(s.id)

    const durationEst = estimateSpeechDurationSec(s.text, 0.85)
    const timings = estimateWordTimings(s.text, durationEst)

    try {
      await speak(s.text, {
        speed: 0.85,
        onPlaybackStart: (audio) => {
          const dur = audio.duration && Number.isFinite(audio.duration) ? audio.duration : durationEst
          const aligned = estimateWordTimings(s.text, dur)
          const t0 = aligned[wordIndex]?.start ?? 0
          const trySeek = () => {
            if (audio.duration && Number.isFinite(audio.duration)) {
              audio.currentTime = Math.min(audio.duration * 0.98, t0)
            }
          }
          if (audio.readyState >= 1) trySeek()
          else audio.addEventListener('loadedmetadata', trySeek, { once: true })

          const onTime = () => {
            setActiveWordIdx(wordIndexAtTime(aligned, audio.currentTime))
          }
          audio.addEventListener('timeupdate', onTime)
          audio.addEventListener('ended', () => {
            audio.removeEventListener('timeupdate', onTime)
            setPlayingId(null)
            setActiveWordIdx(-1)
          }, { once: true })
        },
        onFallbackStart: () => {
          const start = performance.now()
          const tick = () => {
            if (getActiveAudio()) return
            const elapsed = (performance.now() - start) / 1000
            const t0 = timings[wordIndex]?.start ?? 0
            setActiveWordIdx(wordIndexAtTime(timings, elapsed + t0))
            if (elapsed + t0 < durationEst) {
              requestAnimationFrame(tick)
            } else {
              setPlayingId(null)
              setActiveWordIdx(-1)
            }
          }
          requestAnimationFrame(tick)
        },
      })
    } finally {
      setPlayingId(prev => (prev === s.id ? null : prev))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
        Bấm từng từ để nhảy (time-align ước lượng) · nghe từ vị trí đó
      </p>
      {sentences.map((s, i) => {
        const isEditing = editingId === s.id
        const words = wordsOf(s.text)
        const isActive = activeSentenceId === s.id

        return (
          <div
            key={s.id}
            className="listening-bao-subcard rounded-xl p-4 transition-shadow"
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${isEditing || isActive ? 'var(--color-primary)' : 'var(--border-color)'}`,
              boxShadow: isEditing ? '0 4px 20px color-mix(in srgb, var(--color-primary) 12%, transparent)' : undefined,
              borderLeft: isEditing || isActive ? '4px solid var(--color-primary)' : undefined,
            }}
          >
            <div className="flex gap-3">
              <span
                className="text-sm font-bold tabular-nums w-6 shrink-0 pt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <>
                    <textarea
                      value={draftText}
                      onChange={e => setDraftText(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg text-sm mb-2 outline-none resize-none"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                      }}
                    />
                    <input
                      value={draftVi}
                      onChange={e => setDraftVi(e.target.value)}
                      placeholder="Bản dịch tiếng Việt (tuỳ chọn)"
                      className="w-full px-3 py-2 rounded-lg text-sm mb-3 outline-none"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={saving || !draftText.trim()}
                        onClick={() => void saveEdit(s.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                        style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                      >
                        <Check size={14} />
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                      >
                        <X size={14} />
                        Hủy
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--text-primary)', userSelect: 'text' }}
                    >
                      {words.map((w, wi) => {
                        const active = isActive && activeWordIdx === wi
                        return (
                          <button
                            key={`${s.id}-${wi}`}
                            type="button"
                            onClick={() => void playSentenceFromWord(s, wi)}
                            className="inline rounded px-0.5 mx-px hover:underline"
                            style={{
                              background: active
                                ? 'color-mix(in srgb, var(--color-primary) 28%, transparent)'
                                : 'transparent',
                              color: active ? 'var(--color-primary)' : 'inherit',
                              fontWeight: active ? 700 : 400,
                              cursor: 'pointer',
                            }}
                            title="Nghe từ đây"
                          >
                            {w}{wi < words.length - 1 ? ' ' : ''}
                          </button>
                        )
                      })}
                      {playingId === s.id && (
                        <span className="ml-2 text-[10px] font-bold" style={{ color: 'var(--color-primary)' }}>
                          ▶
                        </span>
                      )}
                    </p>
                    {s.vi ? (
                      <div
                        className="mt-2 rounded-lg px-3 py-2"
                        style={{
                          background: 'color-mix(in srgb, var(--color-primary) 6%, var(--bg-secondary))',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <span
                          className="mb-0.5 block text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Bản dịch tiếng Việt
                        </span>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {s.vi}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[11px] italic" style={{ color: 'var(--text-muted)' }}>
                        Chưa có bản dịch tiếng Việt — bấm Sửa để thêm.
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => startEdit(s)}
                        className="inline-flex items-center gap-1 text-xs font-medium"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Pencil size={12} />
                        Sửa
                      </button>
                      <CopyButton text={s.text} />
                      {s.vi && <CopyButton text={s.vi} title="Copy bản dịch" />}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
