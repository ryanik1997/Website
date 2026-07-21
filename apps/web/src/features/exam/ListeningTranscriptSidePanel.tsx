/**
 * Panel transcript trượt bên phải KHI ĐANG LÀM BÀI Listening (split màn hình).
 * - Toggle bằng nút trong header test runner
 * - Kéo cạnh trái để resize (pointer events, lưu width vào localStorage)
 * - Nguồn transcript: q.ttsText (Cambridge audioscript import) + AI map (localStorage — tạo 1 lần dùng mãi)
 * - Chưa có transcript → nút «Tạo transcript bằng AI» ngay trong panel
 */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FileText, Mic, X } from 'lucide-react'
import type { ListeningExam, ListeningPart } from './listeningExamData'
import {
  loadListeningTranscripts,
  saveListeningTranscripts,
  clearListeningTranscripts,
  type ListeningTranscriptMap,
} from './examListeningTranscriptStorage'
import { resolveListeningAudioSource } from './listeningExamAudio'
import { getTtsServiceUrl } from '../listening/ttsConfig'
import { resolvePlayableMediaUrl } from '../../lib/protectedMedia'
import ReadingHighlightToolbar from './ReadingHighlightToolbar'
import ReadingHighlightableText from './ReadingHighlightableText'
import type { ReadingHighlight, TextNote } from './readingHighlightUtils'
import {
  parseWhisperSegments,
  resolveWhisperSegments,
  shouldOfferWhisperTiming,
  whisperSegmentsStorageKey,
  type WhisperSegment,
} from './audioSyncUtils'

const WIDTH_KEY = 'listening-transcript-panel-width'
const MIN_W = 280
const MAX_W = 720

interface Props {
  exam: ListeningExam
  currentPart: ListeningPart | null
  open: boolean
  onClose: () => void
  audioCurrentTime?: number
  audioDuration?: number
  playing?: boolean
}

function ListeningTranscriptSidePanel({
  exam,
  currentPart,
  open,
  onClose,
  audioCurrentTime = 0,
  audioDuration: _audioDuration = 0,
  playing = false,
}: Props) {
  const [width, setWidth] = useState(() => {
    const saved = Number(window.localStorage.getItem(WIDTH_KEY))
    return Number.isFinite(saved) && saved >= MIN_W && saved <= MAX_W ? saved : 380
  })
  const dragging = useRef(false)
  const [aiMap, setAiMap] = useState<ListeningTranscriptMap>({})
  const [whisperText, setWhisperText] = useState('')
  const [whisperSegments, setWhisperSegments] = useState<WhisperSegment[]>([])
  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(null)
  const segmentRefs = useRef(new Map<number, HTMLDivElement>())
  const [whisperLoading, setWhisperLoading] = useState(false)
  const [whisperError, setWhisperError] = useState<string | null>(null)
  const [selectedText, setSelectedText] = useState('')
  const [markedText, setMarkedText] = useState<string[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const panelRef = useRef<HTMLElement>(null)
  const [officialHighlights, setOfficialHighlights] = useState<ReadingHighlight[]>([])
  const [officialNotes, setOfficialNotes] = useState<TextNote[]>([])

  /** Nạp transcript đã lưu (localStorage) khi mở panel / đổi đề */
  useEffect(() => {
    if (!open) return
    // IELTS/Cambridge catalog không dùng transcript AI cũ (DeepSeek có thể đã đoán sai).
    // Chỉ transcript nhập từ audioscript/ttsText hoặc Whisper local được phép hiển thị.
    if (exam.examType === 'ielts' || exam.id.startsWith('catalog-listening-')) {
      clearListeningTranscripts(exam.id)
      setAiMap({})
    } else {
      setAiMap(loadListeningTranscripts(exam.id) ?? {})
    }
    const partNumber = currentPart?.partNumber ?? 0
    const key = `exam-listening-whisper:${exam.id}:${partNumber}`
    setWhisperText(window.localStorage.getItem(key) ?? '')
    setWhisperSegments(resolveWhisperSegments(
      currentPart?.transcriptSegments,
      exam.id,
      partNumber,
    ))
    setActiveSegmentId(null)
    try {
      setMarkedText(JSON.parse(window.localStorage.getItem(`${key}:marks`) ?? '[]') as string[])
    } catch { setMarkedText([]) }
    try {
      setNotes(JSON.parse(window.localStorage.getItem(`${key}:notes`) ?? '{}') as Record<string, string>)
    } catch { setNotes({}) }
    setWhisperError(null)
    const annotationKey = `exam-listening-annotations:${exam.id}:${currentPart?.partNumber ?? 0}`
    try {
      const saved = JSON.parse(window.localStorage.getItem(annotationKey) ?? '{}') as { highlights?: ReadingHighlight[]; notes?: TextNote[] }
      setOfficialHighlights(saved.highlights ?? [])
      setOfficialNotes(saved.notes ?? [])
    } catch { setOfficialHighlights([]); setOfficialNotes([]) }
  }, [currentPart?.partNumber, exam.id, open])

  const persistOfficialAnnotations = useCallback((highlights: ReadingHighlight[], notes: TextNote[]) => {
    if (!currentPart) return
    setOfficialHighlights(highlights)
    setOfficialNotes(notes)
    window.localStorage.setItem(
      `exam-listening-annotations:${exam.id}:${currentPart.partNumber}`,
      JSON.stringify({ highlights, notes }),
    )
  }, [currentPart, exam.id])

  const saveMarks = useCallback((next: string[]) => {
    if (!currentPart) return
    const key = `exam-listening-whisper:${exam.id}:${currentPart.partNumber}:marks`
    setMarkedText(next)
    window.localStorage.setItem(key, JSON.stringify(next))
    setSelectedText('')
    window.getSelection()?.removeAllRanges()
  }, [currentPart, exam.id])

  const saveNote = useCallback((text: string, note: string) => {
    if (!currentPart) return
    const key = `exam-listening-whisper:${exam.id}:${currentPart.partNumber}:notes`
    const next = { ...notes, [text]: note }
    setNotes(next)
    window.localStorage.setItem(key, JSON.stringify(next))
    saveMarks([...new Set([...markedText, text])])
  }, [currentPart, exam.id, markedText, notes, saveMarks])

  const renderMarkedText = useCallback((text: string) => {
    const marks = markedText.filter(Boolean).sort((a, b) => b.length - a.length)
    if (!marks.length) return text
    const parts: (string | JSX.Element)[] = []
    let rest = text
    let key = 0
    while (rest) {
      let matchIndex = -1
      let match = ''
      for (const mark of marks) {
        const index = rest.indexOf(mark)
        if (index >= 0 && (matchIndex < 0 || index < matchIndex)) {
          matchIndex = index
          match = mark
        }
      }
      if (matchIndex < 0) { parts.push(rest); break }
      if (matchIndex > 0) parts.push(rest.slice(0, matchIndex))
      parts.push(<mark
        key={`mark-${key++}`}
        className="listening-transcript-panel__mark"
        title="Bấm để bỏ highlight"
        onClick={() => saveMarks(markedText.filter(item => item !== match))}
      >{match}</mark>)
      rest = rest.slice(matchIndex + match.length)
    }
    return parts
  }, [markedText, saveMarks])

  const handleTranscriptSelect = useCallback((text: string) => {
    const selected = window.getSelection()?.toString().trim() ?? ''
    if (selected && text.includes(selected)) setSelectedText(selected)
  }, [])

  const runWhisper = useCallback(async () => {
    if (whisperLoading || !currentPart) return
    const source = resolveListeningAudioSource(exam, currentPart)
    if (!source?.audioUrl) {
      setWhisperError('Part này không có audio URL để gửi cho Whisper local.')
      return
    }
    setWhisperLoading(true)
    setWhisperError(null)
    try {
      // Storage path /catalog/listening-publish/... cần sign URL trước khi fetch
      const signedUrl = await resolvePlayableMediaUrl(source.audioUrl)
      if (!signedUrl) throw new Error('Không tạo được URL phát audio từ đường dẫn storage.')

      const audio = await fetch(signedUrl)
      if (!audio.ok) throw new Error(`Không tải được audio (${audio.status}).`)

      const ct = (audio.headers.get('content-type') || '').toLowerCase()
      if (!ct.startsWith('audio/') && !ct.includes('octet-stream')) {
        const snippet = `URL trả về ${ct} (${(await audio.clone().text()).slice(0, 120)})`
        console.warn('[Whisper] signed URL không trả audio:', signedUrl, 'storage path:', source.audioUrl, snippet)
        const pathShort = source.audioUrl!.includes('/exam-media/')
          ? source.audioUrl!.split('/exam-media/')[1] + (source.audioUrl!.includes('token=') ? '?token=…(signed)' : '')
          : source.audioUrl!.slice(0, 100)
        throw new Error(
          `File audio không hợp lệ — server trả ${ct} thay vì audio. ` +
          `Kiểm tra: "${pathShort}" có tồn tại trong Supabase Storage không.`,
        )
      }

      const response = await fetch(`${getTtsServiceUrl()}/api/stt`, {
        method: 'POST',
        headers: { 'Content-Type': ct || 'audio/mpeg' },
        body: await audio.arrayBuffer(),
      })
      const payload = await response.json() as {
        ok?: boolean
        text?: string
        message?: string
        segments?: unknown
      }
      if (!response.ok || !payload.ok || !payload.text?.trim()) {
        throw new Error(payload.message || 'Whisper không trả về transcript.')
      }
      const text = payload.text.trim()
      const segments = parseWhisperSegments(payload.segments)
      setWhisperText(text)
      setWhisperSegments(segments)
      window.localStorage.setItem(`exam-listening-whisper:${exam.id}:${currentPart.partNumber}`, text)
      window.localStorage.setItem(
        whisperSegmentsStorageKey(exam.id, currentPart.partNumber),
        JSON.stringify(segments),
      )
    } catch (e) {
      setWhisperError(e instanceof Error ? e.message : 'Không tạo được transcript local.')
    } finally {
      setWhisperLoading(false)
    }
  }, [currentPart, exam, whisperLoading])

  /** Transcript theo câu của part hiện tại (fallback: cả bài) */
  const entries = useMemo(() => {
    if (!open) return []
    const parts = currentPart ? [currentPart] : exam.parts
    const out: { number: number; text: string }[] = []
    for (const p of parts) {
      if (p.transcript?.trim()) out.push({ number: p.partNumber, text: p.transcript.trim() })
      for (const q of p.questions ?? []) {
        const text = aiMap[q.number]?.trim() || q.ttsText?.trim()
        if (text) out.push({ number: q.number, text })
      }
    }
    return out
  }, [aiMap, currentPart, exam.parts, open])

  /** Đã tạo AI rồi thì không gọi lại — chỉ hiện nút khi part còn thiếu transcript */
  const partMissing = useMemo(() => {
    if (!open) return false
    const parts = currentPart ? [currentPart] : exam.parts
    return parts.some(p =>
      (p.questions ?? []).some(q => !aiMap[q.number]?.trim() && !q.ttsText?.trim()),
    )
  }, [aiMap, currentPart, exam.parts, open])

  const transcriptCurrentTime = useMemo(() => {
    if (!currentPart || _audioDuration <= 0) return audioCurrentTime
    const source = resolveListeningAudioSource(exam, currentPart)
    const partStart = source.startPct != null
      ? (source.startPct / 100) * _audioDuration
      : 0
    return Math.max(0, audioCurrentTime - partStart)
  }, [_audioDuration, audioCurrentTime, currentPart, exam])

  useEffect(() => {
    if (!open || !playing || whisperSegments.length === 0) {
      setActiveSegmentId(null)
      return
    }
    const segment = whisperSegments.find(item => (
      item.start <= transcriptCurrentTime && transcriptCurrentTime < item.end
    )) ?? null
    const nextId = segment?.id ?? null
    setActiveSegmentId(previous => {
      if (previous === nextId) return previous
      if (nextId != null) {
        window.requestAnimationFrame(() => {
          segmentRefs.current.get(nextId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }
      return nextId
    })
  }, [open, playing, transcriptCurrentTime, whisperSegments])

  const showWhisperAction = useMemo(() => {
    const source = currentPart ? resolveListeningAudioSource(exam, currentPart) : null
    return shouldOfferWhisperTiming({
      hasAudioUrl: Boolean(source?.audioUrl),
      partMissingTranscript: partMissing,
      segmentCount: whisperSegments.length,
    })
  }, [currentPart, exam, partMissing, whisperSegments.length])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const next = Math.min(MAX_W, Math.max(MIN_W, window.innerWidth - e.clientX))
    setWidth(next)
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    dragging.current = false
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    setWidth(w => {
      window.localStorage.setItem(WIDTH_KEY, String(w))
      return w
    })
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, open])

  if (!open) return null

  return (
    <aside ref={panelRef} className="listening-transcript-panel" style={{ width }} aria-label="Transcript" data-exam-highlight-zone>
      <ReadingHighlightToolbar
        rootRef={panelRef}
        highlights={officialHighlights}
        onHighlightsChange={next => persistOfficialAnnotations(next, officialNotes)}
        notes={officialNotes}
        onNotesChange={next => persistOfficialAnnotations(officialHighlights, next)}
        resetKey={`${exam.id}:${currentPart?.partNumber ?? 0}`}
      />
      <div
        className="listening-transcript-panel__resizer"
        role="separator"
        aria-orientation="vertical"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      <header className="listening-transcript-panel__head">
        <span className="listening-transcript-panel__title">
          <FileText size={15} />
          Transcript{currentPart ? ` — Part ${currentPart.partNumber}` : ''}
        </span>
        <button
          type="button"
          className="listening-transcript-panel__close"
          onClick={onClose}
          aria-label="Đóng transcript"
        >
          <X size={16} />
        </button>
      </header>
      <div className="listening-transcript-panel__body">
        {showWhisperAction && (
          <div className="listening-transcript-panel__ai">
            <button
              type="button"
              className="listening-transcript-panel__ai-btn"
              disabled={whisperLoading}
              onClick={() => void runWhisper()}
            >
              <Mic size={14} />
              {whisperLoading
                ? 'Whisper local đang chạy…'
                : whisperText || entries.length > 0
                  ? 'Tạo đồng bộ transcript theo audio'
                  : 'Tạo transcript bằng Whisper local'}
            </button>
            <p className="listening-transcript-panel__ai-note">
              Whisper tạo mốc thời gian theo từng đoạn để highlight và tự cuộn khi audio phát.
            </p>
            {whisperError && <p className="listening-transcript-panel__ai-error">{whisperError}</p>}
          </div>
        )}
        {whisperSegments.length > 0 ? (
          <div className="listening-transcript-panel__segments" aria-live="off">
            {whisperSegments.map(segment => (
              <div
                key={segment.id}
                ref={element => {
                  if (element) segmentRefs.current.set(segment.id, element)
                  else segmentRefs.current.delete(segment.id)
                }}
                className={`listening-transcript-panel__segment${activeSegmentId === segment.id ? ' is-speaking' : ''}`}
                data-segment-id={segment.id}
              >
                <ReadingHighlightableText
                  blockId={`whisper-${exam.id}-${currentPart?.partNumber ?? 0}-${segment.id}`}
                  text={segment.text}
                  highlights={officialHighlights}
                  notes={officialNotes}
                  className="listening-transcript-panel__text"
                />
              </div>
            ))}
          </div>
        ) : whisperText && (
          <div className="listening-transcript-panel__entry">
            <span className="listening-transcript-panel__num">W</span>
            <ReadingHighlightableText
              blockId={`whisper-${exam.id}-${currentPart?.partNumber ?? 0}`}
              text={whisperText}
              highlights={officialHighlights}
              notes={officialNotes}
              className="listening-transcript-panel__text"
            />
          </div>
        )}
        {false && selectedText && (
          <div className="listening-transcript-panel__annotation-tools">
            <span>Đã chọn: “{selectedText.slice(0, 45)}{selectedText.length > 45 ? '…' : ''}”</span>
            <button type="button" onClick={() => saveMarks([...new Set([...markedText, selectedText])])}>Highlight</button>
            <button type="button" onClick={() => {
              const note = window.prompt('Ghi chú cho đoạn đã chọn:', '')?.trim()
              if (note) saveNote(selectedText, note)
            }}>Note</button>
          </div>
        )}
        {Object.entries(notes).map(([text, note]) => (
          <div key={text} className="listening-transcript-panel__note">
            <span><strong>Note:</strong> {note}</span>
            <button type="button" onClick={() => {
              const next = { ...notes }
              delete next[text]
              setNotes(next)
              if (currentPart) window.localStorage.setItem(`exam-listening-whisper:${exam.id}:${currentPart.partNumber}:notes`, JSON.stringify(next))
            }}>Bỏ note</button>
          </div>
        ))}
        {entries.length === 0 && !partMissing ? (
          <p className="listening-transcript-panel__empty">
            Part này không có câu hỏi để gắn transcript.
          </p>
        ) : (
          entries.map(en => (
            <div key={en.number} className="listening-transcript-panel__entry">
              <span className="listening-transcript-panel__num">{en.number}</span>
            <ReadingHighlightableText
              blockId={`question-${exam.id}-${currentPart?.partNumber ?? 0}-${en.number}`}
              text={en.text}
              highlights={officialHighlights}
              notes={officialNotes}
              className="listening-transcript-panel__text"
            />
            </div>
          ))
        )}
      </div>
    </aside>
  )
}

export default memo(ListeningTranscriptSidePanel)
