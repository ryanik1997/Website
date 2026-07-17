import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Languages,
  LoaderCircle,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Square,
  Type,
  Volume2,
} from 'lucide-react'
import WordDiffPanel from '../listening/WordDiffPanel'
import { useSpeechRecognition } from '../listening/useSpeechRecognition'
import {
  MODE_TABS,
  getShadowingVideoByKey,
  getSubtitlesForYoutubeId,
  youtubeWatchUrl,
} from './catalog'
import {
  buildQuizFromSubtitles,
  isQuizAnswerCorrect,
  type ShadowingQuizItem,
} from './quizFromSubtitles'
import { scoreSpeakingLoose } from './scoreSpeaking'
import {
  loadViCache,
  saveViCache,
  translateSegmentVi,
  translateSegmentsBatch,
  type ViCacheMap,
} from './translateVi'
import type { ShadowingMode, ShadowingSubtitle } from './types'
import { findSubtitleIndexAt, useYouTubePlayer } from './useYouTubePlayer'
import './shadowingLibrary.css'

const RATES = [0.5, 0.75, 1, 1.25, 1.5] as const

function parseMode(value: string | null): ShadowingMode {
  if (value === 'dictation' || value === 'quiz' || value === 'shadowing') return value
  return 'shadowing'
}

function formatTime(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds)) return '--:--'
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

function resolveVi(
  seg: ShadowingSubtitle | undefined,
  viMap: ViCacheMap,
): string | null {
  if (!seg) return null
  return (seg.vietnameseText?.trim() || viMap[seg.id]?.trim() || null)
}

/**
 * Chip peek giống Listening (`ListeningSidebarCards` / WordDiffPanel):
 * ẩn = ●●● (độ dài theo từ), bấm hiện từ, bấm lại ẩn.
 */
function maskDots(clean: string): string {
  return '●'.repeat(Math.max(2, Math.min(clean.length || 2, 7)))
}

function splitDictationTokens(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}

type RevealedMap = Record<string, number[]>

function isWordRevealed(map: RevealedMap, segId: string, wordIndex: number): boolean {
  return (map[segId] ?? []).includes(wordIndex)
}

function toggleRevealedWord(map: RevealedMap, segId: string, wordIndex: number): RevealedMap {
  const cur = new Set(map[segId] ?? [])
  if (cur.has(wordIndex)) cur.delete(wordIndex)
  else cur.add(wordIndex)
  return { ...map, [segId]: [...cur].sort((a, b) => a - b) }
}

/** Same mechanism as /app/listening sidebar pronunciation chips. */
function DictationWordChips({
  text,
  segId,
  revealed,
  onToggle,
  size = 'md',
}: {
  text: string
  segId: string
  revealed: RevealedMap
  onToggle: (segId: string, wordIndex: number) => void
  size?: 'sm' | 'md'
}) {
  const tokens = splitDictationTokens(text)
  if (!tokens.length) return null
  return (
    <span className={`shadowing-dictation-chips shadowing-dictation-chips--${size}`}>
      {tokens.map((token, wi) => {
        const clean = token.replace(/[^a-zA-Z0-9'-]/g, '')
        const punct = token.slice(clean.length)
        const open = isWordRevealed(revealed, segId, wi)
        return (
          <button
            key={`${segId}-w${wi}`}
            type="button"
            className={`shadowing-dictation-chip${open ? ' is-open' : ''}`}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              onToggle(segId, wi)
            }}
            title={open ? 'Bấm để ẩn' : 'Bấm để xem từ'}
            aria-pressed={open}
          >
            {open ? token : `${maskDots(clean)}${punct}`}
          </button>
        )
      })}
    </span>
  )
}

export default function ShadowingLessonPage() {
  const { videoKey = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = parseMode(searchParams.get('mode'))
  const video = getShadowingVideoByKey(decodeURIComponent(videoKey))

  const subtitles = useMemo(
    () => (video ? getSubtitlesForYoutubeId(video.youtubeId) : []),
    [video],
  )

  const player = useYouTubePlayer(video?.youtubeId ?? '')
  const [activeIndex, setActiveIndex] = useState(0)
  const [followPlayhead, setFollowPlayhead] = useState(true)
  const [showIpa, setShowIpa] = useState(false)
  const [showVi, setShowVi] = useState(false)
  const [viMap, setViMap] = useState<ViCacheMap>({})
  const [viBusy, setViBusy] = useState(false)
  const [viProgress, setViProgress] = useState<{ done: number; total: number } | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const userSeekingRef = useRef(false)

  // Mic / speaking
  const { listening, transcript, supported, start: startRec, stop: stopRec, reset: resetRec } =
    useSpeechRecognition('en-US')
  const [speakingScore, setSpeakingScore] = useState<ReturnType<typeof scoreSpeakingLoose> | null>(null)

  // Dictation
  const [dictationInput, setDictationInput] = useState('')
  const [dictationChecked, setDictationChecked] = useState(false)
  /** Per-segment word indices revealed as chips (*** → word). */
  const [dictationRevealed, setDictationRevealed] = useState<RevealedMap>({})

  // Quiz
  const quizItems = useMemo(
    () => buildQuizFromSubtitles(subtitles, { maxItems: 15 }),
    [subtitles],
  )
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizSelected, setQuizSelected] = useState<string | null>(null)
  const [quizRevealed, setQuizRevealed] = useState(false)
  const [quizScore, setQuizScore] = useState({ correct: 0, answered: 0 })

  const cacheKey = video?.youtubeId ?? videoKey

  // Load VI cache
  useEffect(() => {
    if (!cacheKey) return
    setViMap(loadViCache(cacheKey))
  }, [cacheKey])

  // Auto-highlight from playhead
  useEffect(() => {
    if (!followPlayhead || userSeekingRef.current || !subtitles.length) return
    const idx = findSubtitleIndexAt(subtitles, player.currentTime)
    if (idx !== activeIndex) setActiveIndex(idx)
  }, [player.currentTime, followPlayhead, subtitles, activeIndex])

  /**
   * Giống TID: phân đoạn đang học luôn là HÀNG ĐẦU list (vị trí #1 UI),
   * rồi các câu phía sau; các câu trước xếp phía cuối.
   * VD activeIndex=3 (#4) → hiển thị #4, #5, #6… rồi #1, #2, #3.
   */
  const orderedSegments = useMemo(() => {
    if (!subtitles.length) return [] as Array<{ seg: ShadowingSubtitle; index: number }>
    const fromActive = subtitles.slice(activeIndex).map((seg, i) => ({
      seg,
      index: activeIndex + i,
    }))
    const before = subtitles.slice(0, activeIndex).map((seg, i) => ({
      seg,
      index: i,
    }))
    return [...fromActive, ...before]
  }, [subtitles, activeIndex])

  // Khi đổi câu: list đã reorder → luôn scroll về top để active dính mép trên
  useEffect(() => {
    const root = listRef.current
    if (!root) return
    root.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeIndex])

  // Reset practice state when segment changes (keep revealed chips across segments)
  useEffect(() => {
    resetRec()
    setSpeakingScore(null)
    setDictationInput('')
    setDictationChecked(false)
  }, [activeIndex, resetRec])

  // Clear revealed chips when leaving dictation mode or switching video
  useEffect(() => {
    if (mode !== 'dictation') setDictationRevealed({})
  }, [mode])

  useEffect(() => {
    setDictationRevealed({})
  }, [cacheKey])

  const toggleDictationChip = useCallback((segId: string, wordIndex: number) => {
    setDictationRevealed(prev => toggleRevealedWord(prev, segId, wordIndex))
  }, [])

  const active: ShadowingSubtitle | undefined = subtitles[activeIndex]
  const activeVi = resolveVi(active, viMap)

  const goTo = useCallback(
    (index: number, seek = true) => {
      if (index < 0 || index >= subtitles.length) return
      userSeekingRef.current = true
      setActiveIndex(index)
      setFollowPlayhead(true)
      const start = subtitles[index]?.startTime
      if (seek && start != null) {
        player.seekTo(start, true)
      }
      window.setTimeout(() => {
        userSeekingRef.current = false
      }, 600)
    },
    [player, subtitles],
  )

  const replayActive = useCallback(() => {
    const start = active?.startTime
    if (start == null) return
    player.seekTo(start, true)
  }, [active, player])

  // Translate active segment if needed when showVi on
  useEffect(() => {
    if (!showVi || !active || !cacheKey) return
    if (activeVi) return
    if (!active.text.trim()) return
    const ac = new AbortController()
    void (async () => {
      const vi = await translateSegmentVi(active.text, ac.signal)
      if (!vi || ac.signal.aborted) return
      setViMap(prev => {
        const next = { ...prev, [active.id]: vi }
        saveViCache(cacheKey, next)
        return next
      })
    })()
    return () => ac.abort()
  }, [showVi, active, activeVi, cacheKey])

  async function translateAllVi() {
    if (!video || !subtitles.length || viBusy) return
    setViBusy(true)
    setShowVi(true)
    const ac = new AbortController()
    try {
      const map = await translateSegmentsBatch(
        subtitles.map(s => ({
          id: s.id,
          text: s.text,
          existingVi: s.vietnameseText,
        })),
        {
          videoKey: cacheKey,
          signal: ac.signal,
          onProgress: (done, total, m) => {
            setViProgress({ done, total })
            setViMap(m)
          },
        },
      )
      setViMap(map)
    } finally {
      setViBusy(false)
      setViProgress(null)
    }
  }

  function toggleMic() {
    if (listening) {
      stopRec()
      if (active?.text) {
        setSpeakingScore(scoreSpeakingLoose(transcript, active.text))
      }
      return
    }
    setSpeakingScore(null)
    player.pause()
    startRec()
  }

  function checkDictation() {
    setDictationChecked(true)
  }

  const currentQuiz: ShadowingQuizItem | undefined = quizItems[quizIndex]

  function answerQuiz(option: string) {
    if (!currentQuiz || quizRevealed) return
    setQuizSelected(option)
    setQuizRevealed(true)
    const ok = isQuizAnswerCorrect(currentQuiz, option)
    setQuizScore(s => ({
      correct: s.correct + (ok ? 1 : 0),
      answered: s.answered + 1,
    }))
    // seek to source segment for review
    goTo(currentQuiz.segmentIndex, true)
  }

  function nextQuiz() {
    setQuizSelected(null)
    setQuizRevealed(false)
    if (quizIndex < quizItems.length - 1) setQuizIndex(i => i + 1)
  }

  function setMode(next: ShadowingMode) {
    const p = new URLSearchParams(searchParams)
    p.set('mode', next)
    setSearchParams(p, { replace: true })
    setQuizIndex(0)
    setQuizSelected(null)
    setQuizRevealed(false)
    setQuizScore({ correct: 0, answered: 0 })
  }

  if (!video) {
    return <Navigate to="/app/shadowing" replace />
  }

  return (
    <div className="shadowing-detail">
      <Link to="/app/shadowing" className="shadowing-detail__back">
        <ArrowLeft size={15} />
        Thư viện Shadowing
      </Link>

      <div className="shadowing-detail__layout">
        <div className="shadowing-detail__media">
          <div className="shadowing-player shadowing-player--api">
            <div ref={player.hostRef} className="shadowing-player__host" />
            {!player.ready && (
              <div className="shadowing-player__loading">Đang tải player…</div>
            )}
          </div>

          <div className="shadowing-player-bar">
            <button type="button" onClick={() => (player.playing ? player.pause() : player.play())}>
              {player.playing ? <Pause size={15} /> : <Play size={15} />}
              {player.playing ? 'Tạm dừng' : 'Phát'}
            </button>
            <button type="button" onClick={replayActive} title="Nghe lại câu hiện tại">
              <RotateCcw size={15} />
              Nghe lại
            </button>
            <span className="shadowing-player-bar__time">
              {formatTime(player.currentTime)} / {formatTime(player.duration)}
            </span>
            <div className="shadowing-rate-group">
              {RATES.map(r => (
                <button
                  key={r}
                  type="button"
                  className={player.playbackRate === r ? 'is-on' : ''}
                  onClick={() => player.setPlaybackRate(r)}
                >
                  {r}x
                </button>
              ))}
            </div>
            <label className="shadowing-follow">
              <input
                type="checkbox"
                checked={followPlayhead}
                onChange={e => setFollowPlayhead(e.target.checked)}
              />
              Theo video
            </label>
          </div>

          {mode !== 'quiz' && (
            <div className="shadowing-transcript">
              <div className="shadowing-transcript__head">
                <div>
                  <strong>
                    {subtitles.length > 0 ? `${activeIndex + 1}/${subtitles.length}` : '0'} phân đoạn
                  </strong>
                  <span className="shadowing-transcript__hint">
                    {mode === 'dictation'
                      ? 'Bấm ●●● để mở chip từ · bấm lại để ẩn · click # để tua'
                      : 'Câu đang học đẩy lên hàng đầu list · click để tua'}
                  </span>
                </div>
                <div className="shadowing-transcript__toggles">
                  <button
                    type="button"
                    className={showIpa ? 'is-on' : ''}
                    onClick={() => setShowIpa(v => !v)}
                  >
                    <Type size={14} />
                    IPA
                  </button>
                  <button
                    type="button"
                    className={showVi ? 'is-on' : ''}
                    onClick={() => setShowVi(v => !v)}
                  >
                    <Languages size={14} />
                    Dịch
                  </button>
                  <button
                    type="button"
                    disabled={viBusy}
                    onClick={() => void translateAllVi()}
                    title="Dịch toàn bộ phân đoạn video này (MyMemory)"
                  >
                    {viBusy ? <LoaderCircle size={14} className="animate-spin" /> : <Languages size={14} />}
                    {viBusy && viProgress
                      ? `${viProgress.done}/${viProgress.total}`
                      : 'Dịch hết'}
                  </button>
                </div>
              </div>

              {subtitles.length === 0 ? (
                <p className="shadowing-detail__note" style={{ padding: '1rem' }}>
                  Chưa có transcript cho video này.
                </p>
              ) : (
                <ul ref={listRef} className="shadowing-transcript__list">
                  {orderedSegments.map(({ seg, index: i }) => {
                    const vi = resolveVi(seg, viMap)
                    const isActive = i === activeIndex
                    const segKey = seg.id || `seg-${i}`
                    return (
                      <li
                        key={segKey}
                        data-seg-index={i}
                        className={isActive ? 'is-active-row' : undefined}
                      >
                        <div
                          className={`shadowing-seg${isActive ? ' is-active' : ''}${mode === 'dictation' ? ' is-dictation' : ''}`}
                        >
                          <button
                            type="button"
                            className="shadowing-seg__seek"
                            onClick={() => goTo(i, true)}
                            title="Tua đến câu này"
                          >
                            <span className="shadowing-seg__idx">
                              #{i + 1}
                              {isActive ? (
                                <span className="shadowing-seg__learning">ĐANG HỌC</span>
                              ) : null}
                            </span>
                            <span className="shadowing-seg__time">{formatTime(seg.startTime)}</span>
                          </button>
                          <span className="shadowing-seg__text">
                            {mode === 'dictation' ? (
                              <DictationWordChips
                                text={seg.text}
                                segId={segKey}
                                revealed={dictationRevealed}
                                onToggle={toggleDictationChip}
                                size="sm"
                              />
                            ) : (
                              seg.text
                            )}
                            {mode !== 'dictation' && showIpa && seg.ipa ? (
                              <span className="shadowing-seg__ipa">{seg.ipa}</span>
                            ) : null}
                            {mode !== 'dictation' && showVi && vi ? (
                              <span className="shadowing-seg__vi">{vi}</span>
                            ) : null}
                            {mode !== 'dictation' && showVi && !vi ? (
                              <span className="shadowing-seg__vi muted">Đang dịch…</span>
                            ) : null}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        <aside className="shadowing-detail__panel">
          <h1>{video.title}</h1>
          <div className="shadowing-detail__chips">
            {video.level ? <span className="shadowing-chip">{video.level}</span> : null}
            <span className="shadowing-chip">{video.category}</span>
            {video.duration ? <span className="shadowing-chip">{video.duration}</span> : null}
            <span className="shadowing-chip">
              {subtitles.length || video.segments} phân đoạn
            </span>
          </div>

          <div className="shadowing-mode-bar" style={{ marginTop: 0, marginBottom: '1rem' }}>
            {MODE_TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`shadowing-mode-btn${mode === tab.id ? ' is-active' : ''}`}
                onClick={() => setMode(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* —— SHADOWING practice —— */}
          {mode === 'shadowing' && active && (
            <div className="shadowing-practice">
              <div className="shadowing-active-line">
                <div className="shadowing-active-line__meta">
                  Đang học · #{activeIndex + 1} · {formatTime(active.startTime)}
                  {active.duration != null ? ` · ${active.duration.toFixed(1)}s` : ''}
                </div>
                <p className="shadowing-active-line__text">{active.text}</p>
                {showIpa && active.ipa ? (
                  <p className="shadowing-active-line__ipa">{active.ipa}</p>
                ) : null}
                {showVi && activeVi ? (
                  <p className="shadowing-active-line__vi">{activeVi}</p>
                ) : null}
              </div>

              <div className="shadowing-practice__controls">
                <button type="button" className="ghost" onClick={() => goTo(activeIndex - 1)}>
                  <ChevronLeft size={16} />
                  Trước
                </button>
                <button type="button" className="ghost" onClick={replayActive}>
                  <Volume2 size={16} />
                  Nghe lại
                </button>
                <button
                  type="button"
                  className={`mic${listening ? ' is-rec' : ''}`}
                  onClick={toggleMic}
                  disabled={!supported}
                  title={supported ? 'Thu âm (Web Speech API)' : 'Trình duyệt không hỗ trợ SpeechRecognition'}
                >
                  {listening ? <Square size={16} /> : <Mic size={16} />}
                  {listening ? 'Dừng' : 'Thu âm'}
                </button>
                <button type="button" className="ghost" onClick={() => goTo(activeIndex + 1)}>
                  Sau
                  <ChevronRight size={16} />
                </button>
              </div>

              {(listening || transcript) && (
                <p className="shadowing-live-transcript">
                  {listening ? 'Đang nghe… ' : 'Bạn nói: '}
                  <em>{transcript || '…'}</em>
                </p>
              )}

              {transcript && !listening && (
                <>
                  <WordDiffPanel input={transcript} correct={active.text} />
                  {speakingScore && (
                    <div className={`shadowing-score grade-${speakingScore.grade}`}>
                      <strong>{speakingScore.percent}%</strong>
                      <span>
                        Grade {speakingScore.grade} · {speakingScore.correct}/{speakingScore.total} từ
                      </span>
                    </div>
                  )}
                </>
              )}

              {!supported && (
                <p className="shadowing-detail__note">
                  Trình duyệt không hỗ trợ Web Speech API — dùng Chrome/Edge để thu âm chấm điểm.
                </p>
              )}
            </div>
          )}

          {/* —— DICTATION —— */}
          {mode === 'dictation' && active && (
            <div className="shadowing-practice">
              <div className="shadowing-active-line">
                <div className="shadowing-active-line__meta">
                  Dictation · #{activeIndex + 1}
                </div>
                <p className="shadowing-detail__note" style={{ margin: '0 0 0.65rem' }}>
                  Nghe rồi gõ lại. Bấm <strong>●●●</strong> để mở chip từ · bấm lại để ẩn.
                </p>
                <DictationWordChips
                  text={active.text}
                  segId={active.id || `seg-${activeIndex}`}
                  revealed={dictationRevealed}
                  onToggle={toggleDictationChip}
                  size="md"
                />
              </div>
              <div className="shadowing-practice__controls">
                <button type="button" className="ghost" onClick={replayActive}>
                  <Volume2 size={16} />
                  Nghe lại
                </button>
                <button type="button" className="ghost" onClick={() => goTo(activeIndex - 1)}>
                  <ChevronLeft size={16} />
                </button>
                <button type="button" className="ghost" onClick={() => goTo(activeIndex + 1)}>
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    const segId = active.id || `seg-${activeIndex}`
                    const tokens = splitDictationTokens(active.text)
                    const allOpen = tokens.every((_, wi) =>
                      isWordRevealed(dictationRevealed, segId, wi),
                    )
                    setDictationRevealed(prev => ({
                      ...prev,
                      [segId]: allOpen ? [] : tokens.map((_, wi) => wi),
                    }))
                  }}
                  title="Hiện / ẩn toàn bộ từ câu này"
                >
                  {splitDictationTokens(active.text).every((_, wi) =>
                    isWordRevealed(
                      dictationRevealed,
                      active.id || `seg-${activeIndex}`,
                      wi,
                    ),
                  )
                    ? 'Ẩn hết'
                    : 'Hiện hết'}
                </button>
              </div>
              <textarea
                className="shadowing-dictation-input"
                rows={4}
                value={dictationInput}
                onChange={e => {
                  setDictationInput(e.target.value)
                  setDictationChecked(false)
                }}
                placeholder="Gõ những gì bạn nghe được…"
              />
              <div className="shadowing-practice__controls">
                <button type="button" className="primary" onClick={checkDictation}>
                  <Check size={16} />
                  Kiểm tra
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    setDictationInput('')
                    setDictationChecked(false)
                  }}
                >
                  Xóa
                </button>
              </div>
              {dictationChecked && (
                <>
                  <WordDiffPanel input={dictationInput} correct={active.text} />
                  <div className="shadowing-score">
                    {(() => {
                      const s = scoreSpeakingLoose(dictationInput, active.text)
                      return (
                        <>
                          <strong>{s.percent}%</strong>
                          <span>
                            {s.correct}/{s.total} từ khớp
                          </span>
                        </>
                      )
                    })()}
                  </div>
                  <p className="shadowing-active-line__text" style={{ fontSize: '0.85rem' }}>
                    Đáp án: {active.text}
                  </p>
                </>
              )}
            </div>
          )}

          {/* —— QUIZ —— */}
          {mode === 'quiz' && (
            <div className="shadowing-practice">
              {quizItems.length === 0 ? (
                <p className="shadowing-detail__note">Không tạo được quiz từ transcript này.</p>
              ) : currentQuiz ? (
                <>
                  <div className="shadowing-quiz-meta">
                    Câu {quizIndex + 1}/{quizItems.length}
                    {quizScore.answered > 0 && (
                      <span>
                        · Đúng {quizScore.correct}/{quizScore.answered}
                      </span>
                    )}
                  </div>
                  <p className="shadowing-quiz-prompt">{currentQuiz.prompt}</p>

                  {currentQuiz.kind === 'cloze' && currentQuiz.tokens && (
                    <p className="shadowing-quiz-sentence">
                      {currentQuiz.tokens.map((t, i) =>
                        t.blank ? (
                          <span key={i} className="blank">
                            {quizRevealed ? (currentQuiz.blankWord ?? '____') : '______'}
                          </span>
                        ) : (
                          <span key={i}>{t.text} </span>
                        ),
                      )}
                    </p>
                  )}

                  {currentQuiz.kind === 'listen_pick' && (
                    <p className="shadowing-detail__note">
                      Segment #{currentQuiz.segmentIndex + 1} — bấm Nghe gợi ý rồi chọn câu đúng.
                    </p>
                  )}

                  <button
                    type="button"
                    className="ghost full"
                    onClick={() => {
                      goTo(currentQuiz.segmentIndex, true)
                    }}
                  >
                    <Volume2 size={16} />
                    Nghe segment nguồn
                  </button>

                  <div className="shadowing-quiz-options">
                    {(currentQuiz.options ?? []).map(opt => {
                      const selected = quizSelected === opt
                      const isCorrect = isQuizAnswerCorrect(currentQuiz, opt)
                      let cls = 'shadowing-quiz-opt'
                      if (quizRevealed) {
                        if (isCorrect) cls += ' is-correct'
                        else if (selected) cls += ' is-wrong'
                      } else if (selected) cls += ' is-selected'
                      return (
                        <button
                          key={opt}
                          type="button"
                          className={cls}
                          disabled={quizRevealed}
                          onClick={() => answerQuiz(opt)}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>

                  {quizRevealed && (
                    <div className="shadowing-practice__controls">
                      <button
                        type="button"
                        className="primary"
                        onClick={nextQuiz}
                        disabled={quizIndex >= quizItems.length - 1}
                      >
                        Câu tiếp
                        <ChevronRight size={16} />
                      </button>
                      {quizIndex >= quizItems.length - 1 && (
                        <span className="shadowing-detail__note">
                          Hết quiz · Đúng {quizScore.correct}/{quizScore.answered}
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          <div className="shadowing-detail__actions">
            <a
              className="primary"
              href={
                active?.startTime != null
                  ? `${youtubeWatchUrl(video.youtubeId)}&t=${Math.floor(active.startTime)}s`
                  : youtubeWatchUrl(video.youtubeId)
              }
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={14} />
              YouTube
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}
