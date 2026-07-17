import { useCallback, useEffect, useRef, useState } from 'react'
import { audioRepo } from '@ryan/db'
import { resolvePlayableMediaUrl } from '../../lib/protectedMedia'
import { mediaAccessUserMessage, parseMediaAccessError } from '../../lib/mediaAccessErrors'
import { formatAudioTime } from '../listening/practiceUtils'
import { mapRateToSpeed, speak, stop as stopTts } from '../listening/tts'

export interface ExamAudioSource {
  audioKey?: string
  audioUrl?: string
  ttsText?: string
  /** Start position 0–100 when using a shared full-test MP3 for one part */
  startPct?: number
  endPct?: number
}

export interface ExamAudioPlayOptions {
  rate?: number
  allowSeek?: boolean
  beforePlay?: () => boolean
  onPlayCounted?: () => void
}

/** Blob Dexie đôi khi mất type → trình duyệt không decode MP3. */
async function blobAsAudio(blob: Blob, fallbackMime = 'audio/mpeg'): Promise<Blob> {
  if (blob.type && blob.type.startsWith('audio/')) return blob
  const buf = await blob.arrayBuffer()
  return new Blob([buf], { type: fallbackMime })
}

/**
 * Catalog / URL tĩnh: fetch → blob URL (fallback khi stream trực tiếp lỗi).
 * Không phụ thuộc SW — SW không còn intercept /catalog/*.mp3 (Firefox NS_ERROR_INTERCEPTION_FAILED).
 */
function sniffAudioMime(head: Uint8Array): string | null {
  if (head.length < 4) return null
  // ID3… or MPEG frame sync
  const isId3 = head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33
  const isMpeg = head[0] === 0xff && (head[1]! & 0xe0) === 0xe0
  if (isId3 || isMpeg) return 'audio/mpeg'
  // ISO BMFF (M4A/MP4): size(4) + 'ftyp'
  // Cam20 catalog part*.mp3 are actually ftyp/M4A misnamed as .mp3
  if (
    head.length >= 8
    && head[4] === 0x66 && head[5] === 0x74 && head[6] === 0x79 && head[7] === 0x70
  ) {
    return 'audio/mp4'
  }
  // RIFF….WAVE
  if (
    head.length >= 12
    && head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46
    && head[8] === 0x57 && head[9] === 0x41 && head[10] === 0x56 && head[11] === 0x45
  ) {
    return 'audio/wav'
  }
  // OggS
  if (head[0] === 0x4f && head[1] === 0x67 && head[2] === 0x67 && head[3] === 0x53) {
    return 'audio/ogg'
  }
  return null
}

async function fetchUrlAsAudioBlobUrl(url: string): Promise<string> {
  const res = await fetch(url, { credentials: 'same-origin', cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} khi tải audio: ${url.slice(0, 100)}`)
  }
  const ct = (res.headers.get('content-type') || '').toLowerCase()
  if (ct.includes('text/html')) {
    throw new Error(`Server trả HTML thay vì audio (sai path?): ${url.slice(0, 100)}`)
  }
  const raw = await res.blob()
  if (!raw.size) throw new Error(`File audio rỗng: ${url.slice(0, 100)}`)
  if (raw.size < 8_000) {
    throw new Error(`File audio quá nhỏ (${raw.size} bytes): ${url.slice(0, 100)}`)
  }
  const head = new Uint8Array(await raw.slice(0, 12).arrayBuffer())
  const mime = sniffAudioMime(head)
  if (!mime) {
    throw new Error(
      `Không nhận dạng được audio (header ${[...head.slice(0, 8)].map(b => b.toString(16).padStart(2, '0')).join(' ')}): ${url.slice(0, 80)}`,
    )
  }
  const typed = await blobAsAudio(raw, mime)
  return URL.createObjectURL(typed)
}

function examAudioSourceId(source: ExamAudioSource): string {
  // Include segment so Part1/Part2 sharing one full file are different sources
  return `${source.audioKey ?? ''}\0${source.audioUrl ?? ''}\0${source.ttsText?.trim() ?? ''}\0${source.startPct ?? ''}\0${source.endPct ?? ''}`
}

function syncTimeUi(audio: HTMLAudioElement, setProgressPct: (n: number) => void, setTimeLabel: (s: string) => void) {
  const duration = audio.duration
  if (duration && Number.isFinite(duration)) {
    const pct = Math.min(100, (audio.currentTime / duration) * 100)
    setProgressPct(pct)
    setTimeLabel(`${formatAudioTime(audio.currentTime)} / ${formatAudioTime(duration)}`)
  }
}

export function useExamQuestionAudio() {
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [progressPct, setProgressPct] = useState(0)
  const [timeLabel, setTimeLabel] = useState('0:00 / 0:00')
  const [speed, setSpeed] = useState(1)
  const [playError, setPlayError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const rafRef = useRef<number | null>(null)
  /** Nguồn đang load trên audio element — dùng để resume không load lại từ đầu */
  const loadedSourceIdRef = useRef<string | null>(null)
  const loadedSrcRef = useRef<string | null>(null)

  const cancelProgress = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  /** Hủy hẳn element + TTS (đổi part / unmount). */
  const stopCurrentAudio = useCallback((keepSrc?: string) => {
    cancelProgress()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
      audioRef.current = null
    }
    stopTts()
    loadedSourceIdRef.current = null
    loadedSrcRef.current = null
    if (objectUrlRef.current && objectUrlRef.current !== keepSrc) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [cancelProgress])

  const cleanupAudio = useCallback(() => {
    stopCurrentAudio()
  }, [stopCurrentAudio])

  useEffect(() => () => cleanupAudio(), [cleanupAudio])

  const startProgressLoop = useCallback((audio: HTMLAudioElement) => {
    cancelProgress()

    const tick = () => {
      if (!audioRef.current || audioRef.current !== audio) return
      syncTimeUi(audio, setProgressPct, setTimeLabel)
      if (!audio.paused && !audio.ended) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [cancelProgress])

  /** Pause giữ currentTime — bấm phát lại sẽ tiếp tục, không từ 0. */
  const pausePlayback = useCallback(() => {
    cancelProgress()
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      syncTimeUi(audio, setProgressPct, setTimeLabel)
    }
    stopTts()
    setPlaying(false)
    setBuffering(false)
  }, [cancelProgress])

  const playHtmlAudio = useCallback(async (
    src: string,
    rate: number,
    sourceId: string,
    segment?: { startPct?: number; endPct?: number },
  ) => {
    // QUAN TRỌNG: không revoke `src` nếu đó là blob URL sắp phát
    stopCurrentAudio(src)
    if (src.startsWith('blob:')) {
      objectUrlRef.current = src
    }

    setBuffering(true)
    setPlaying(true)
    setProgressPct(0)
    setTimeLabel('0:00 / 0:00')

    const audio = new Audio()
    audio.preload = 'auto'
    audio.playbackRate = rate
    audioRef.current = audio
    loadedSrcRef.current = src
    loadedSourceIdRef.current = sourceId

    await new Promise<void>((resolve, reject) => {
      let settled = false
      const cleanupListeners = () => {
        window.clearTimeout(timeoutId)
        audio.removeEventListener('loadedmetadata', onReady)
        audio.removeEventListener('canplay', onReady)
        audio.removeEventListener('loadeddata', onReady)
        audio.removeEventListener('error', onError)
      }
      const onReady = () => {
        if (settled) return
        settled = true
        cleanupListeners()
        resolve()
      }
      const onError = () => {
        if (settled) return
        settled = true
        cleanupListeners()
        const code = audio.error?.code
        const msg = audio.error?.message
        reject(
          new Error(
            `Không tải được audio${code != null ? ` (code ${code})` : ''}${msg ? `: ${msg}` : ''} · ${src.slice(0, 100)}`,
          ),
        )
      }
      // File catalog ~20MB: cho đủ thời gian; readyState>=1 = có metadata
      const timeoutId = window.setTimeout(() => {
        if (settled) return
        if (audio.readyState >= 1) {
          settled = true
          cleanupListeners()
          resolve()
        } else {
          settled = true
          cleanupListeners()
          reject(new Error(`Timeout tải audio: ${src.slice(0, 100)}`))
        }
      }, 60000)
      audio.addEventListener('loadedmetadata', onReady)
      audio.addEventListener('canplay', onReady)
      audio.addEventListener('loadeddata', onReady)
      audio.addEventListener('error', onError)
      audio.src = src
      audio.load()
    })

    // Segment: jump to part start within full-test MP3 (TID-style multi-part)
    const startPct = segment?.startPct
    const endPct = segment?.endPct
    if (
      startPct != null
      && Number.isFinite(startPct)
      && audio.duration
      && Number.isFinite(audio.duration)
    ) {
      const t = Math.max(0, Math.min(audio.duration - 0.05, (startPct / 100) * audio.duration))
      try {
        audio.currentTime = t
      } catch { /* ignore */ }
      setProgressPct(startPct)
      setTimeLabel(`${formatAudioTime(audio.currentTime)} / ${formatAudioTime(audio.duration)}`)
    } else {
      setProgressPct(0)
      setTimeLabel(`0:00 / ${formatAudioTime(audio.duration)}`)
    }

    setBuffering(false)
    startProgressLoop(audio)

    audio.onended = () => {
      cancelProgress()
      setPlaying(false)
      setProgressPct(100)
      setTimeLabel(`${formatAudioTime(audio.duration)} / ${formatAudioTime(audio.duration)}`)
    }

    // Optional soft-stop near segment end
    if (endPct != null && Number.isFinite(endPct) && endPct > (startPct ?? 0)) {
      const endT =
        audio.duration && Number.isFinite(audio.duration)
          ? (endPct / 100) * audio.duration
          : null
      if (endT != null) {
        const onTime = () => {
          if (!audioRef.current || audioRef.current !== audio) return
          if (audio.currentTime >= endT - 0.05) {
            audio.pause()
            audio.removeEventListener('timeupdate', onTime)
            cancelProgress()
            setPlaying(false)
            syncTimeUi(audio, setProgressPct, setTimeLabel)
          }
        }
        audio.addEventListener('timeupdate', onTime)
      }
    }

    try {
      await audio.play()
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError') {
        setPlaying(false)
        setBuffering(false)
        throw new Error(
          'Trình duyệt chặn tự phát audio. Bấm lại nút Play trên màn hình hoặc nút Phát trên thanh audio.',
        )
      }
      throw err
    }
  }, [cancelProgress, startProgressLoop, stopCurrentAudio])

  const playTtsFallback = useCallback(async (text: string, rate: number, sourceId: string) => {
    stopCurrentAudio()
    loadedSourceIdRef.current = sourceId
    const speechRate = rate === 1 ? 0.85 : 0.6
    const kokoroSpeed = mapRateToSpeed(speechRate)

    setPlaying(true)
    setBuffering(true)
    setProgressPct(0)

    try {
      await speak(text, {
        speed: kokoroSpeed,
        onPlaybackStart: (audio) => {
          audioRef.current = audio
          setBuffering(false)
          setTimeLabel(`0:00 / ${formatAudioTime(audio.duration)}`)
          startProgressLoop(audio)
        },
        onFallbackStart: () => {
          setBuffering(false)
        },
      })
    } finally {
      cancelProgress()
      setBuffering(false)
      setPlaying(false)
    }
  }, [cancelProgress, startProgressLoop, stopCurrentAudio])

  const play = useCallback(async (
    source: ExamAudioSource,
    options: ExamAudioPlayOptions = {},
  ) => {
    const rate = options.rate ?? speed
    const sourceId = examAudioSourceId(source)
    const existing = audioRef.current

    // Đang phát cùng nguồn → no-op
    if (
      existing
      && loadedSourceIdRef.current === sourceId
      && !existing.paused
      && !existing.ended
    ) {
      return
    }

    // Pause / seek xong → luôn resume từ currentTime nếu cùng nguồn còn load
    // (trước đây nearEnd + ended flag khiến bấm Phát sau tua bị rơi vào load lại / beforePlay chặn im lặng)
    const hasLoadedSameSource =
      Boolean(existing)
      && loadedSourceIdRef.current === sourceId
      && Boolean(existing!.src || loadedSrcRef.current)

    if (hasLoadedSameSource && existing!.paused) {
      const audio = existing!
      const dur = audio.duration
      const atEnd =
        Boolean(dur && Number.isFinite(dur) && audio.currentTime >= dur - 0.12)

      setPlayError(null)
      setBuffering(false)
      try {
        if (atEnd) {
          audio.currentTime = 0
        } else {
          // Force clear "ended" trên một số browser sau khi seek
          const t = audio.currentTime
          audio.currentTime = Math.min(t, (dur && Number.isFinite(dur) ? dur : t) - 0.001)
          if (Math.abs(audio.currentTime - t) > 0.5) {
            audio.currentTime = t
          }
        }
      } catch {
        /* ignore seek quirks */
      }

      setPlaying(true)
      audio.playbackRate = rate
      startProgressLoop(audio)
      try {
        await audio.play()
        return
      } catch (err) {
        console.warn('Exam audio resume failed', err)
        setPlaying(false)
        setPlayError('Không tiếp tục phát được. Thử bấm Phát lại.')
        // fall through → load lại nguồn
      }
    }

    // Hết bài (ended) hoặc nguồn mới → phát mới (from 0, trừ khi user đã seek)
    if (options.beforePlay && !options.beforePlay()) {
      setPlayError('Đã hết lượt nghe hoặc không được phát thêm.')
      setBuffering(false)
      setPlaying(false)
      return
    }

    setPlayError(null)
    setBuffering(true)

    let staticUrl: string | undefined
    try {
      // Mode A/B: /catalog/* signed in production; local public in DEV
      staticUrl = await resolvePlayableMediaUrl(source.audioUrl)
    } catch (resolveErr) {
      const parsed = parseMediaAccessError(resolveErr)
      const msg = mediaAccessUserMessage(parsed)
      console.warn('[exam audio] resolvePlayableMediaUrl', parsed.code, resolveErr)
      setPlayError(msg)
      setBuffering(false)
      setPlaying(false)
      return
    }
    const htmlSources: string[] = []
    const ownedBlobs: string[] = []

    // Reuse blob URL đã load nếu cùng nguồn (ended → play again)
    if (
      loadedSourceIdRef.current === sourceId
      && loadedSrcRef.current
      && existing
      && existing.ended
    ) {
      htmlSources.push(loadedSrcRef.current)
    }

    if (source.audioKey && htmlSources.length === 0) {
      try {
        const record = await audioRepo.get(source.audioKey)
        if (record?.blob && record.blob.size > 0) {
          const typed = await blobAsAudio(record.blob)
          const blobUrl = URL.createObjectURL(typed)
          ownedBlobs.push(blobUrl)
          htmlSources.push(blobUrl)
        } else if (source.audioKey) {
          console.warn('[exam audio] blob missing or empty for key', source.audioKey, record?.blob?.size)
        }
      } catch (blobError) {
        console.warn('Exam audio blob unavailable, trying URL fallback', source.audioKey, blobError)
      }
    }

    // Catalog / static URL:
    // - Stream URL trước khi file là MPEG thật
    // - Cam20 part*.mp3 thực chất là M4A (ftyp) → phải blob + audio/mp4 (stream audio/mpeg sẽ treo)
    if (staticUrl && htmlSources.length === 0) {
      let preferTypedBlob = false
      try {
        const headRes = await fetch(staticUrl, {
          credentials: 'same-origin',
          headers: { Range: 'bytes=0-15' },
          cache: 'force-cache',
        })
        if (headRes.ok || headRes.status === 206) {
          const sniff = sniffAudioMime(new Uint8Array(await headRes.arrayBuffer()))
          preferTypedBlob = sniff === 'audio/mp4' || sniff === 'audio/ogg' || sniff === 'audio/wav'
        }
      } catch {
        /* ignore sniff errors — fall through stream */
      }

      if (!preferTypedBlob) {
        htmlSources.push(staticUrl)
      } else {
        try {
          const blobUrl = await fetchUrlAsAudioBlobUrl(staticUrl)
          ownedBlobs.push(blobUrl)
          htmlSources.push(blobUrl)
        } catch (e) {
          console.warn('[exam audio] M4A/typed preload failed, try stream', staticUrl, e)
          htmlSources.push(staticUrl)
        }
      }
    }

    const tryPlaySrc = async (src: string) => {
      // Replay sau ended: giữ element, chỉ seek 0 nếu đã ended
      if (
        existing
        && loadedSourceIdRef.current === sourceId
        && loadedSrcRef.current === src
        && existing.ended
      ) {
        const startPct = source.startPct
        const t0 =
          startPct != null && existing.duration && Number.isFinite(existing.duration)
            ? (startPct / 100) * existing.duration
            : 0
        existing.currentTime = t0
        existing.playbackRate = rate
        setPlaying(true)
        setBuffering(false)
        setProgressPct(startPct ?? 0)
        setTimeLabel(`${formatAudioTime(existing.currentTime)} / ${formatAudioTime(existing.duration)}`)
        startProgressLoop(existing)
        existing.onended = () => {
          cancelProgress()
          setPlaying(false)
          setProgressPct(100)
          setTimeLabel(`${formatAudioTime(existing.duration)} / ${formatAudioTime(existing.duration)}`)
        }
        await existing.play()
        options.onPlayCounted?.()
        return true
      }

      await playHtmlAudio(src, rate, sourceId, {
        startPct: source.startPct,
        endPct: source.endPct,
      })
      options.onPlayCounted?.()
      return true
    }

    try {
      for (const src of htmlSources) {
        try {
          await tryPlaySrc(src)
          return
        } catch (attemptError) {
          const attemptMsg = attemptError instanceof Error ? attemptError.message : ''
          // Không thử source khác khi bị chặn gesture — giữ message
          if (attemptMsg.includes('chặn tự phát') || attemptMsg.includes('NotAllowed')) {
            throw attemptError
          }
          console.warn('Exam audio source failed, trying next', src, attemptError)
          if (src.startsWith('blob:') && objectUrlRef.current !== src) {
            URL.revokeObjectURL(src)
          }
          stopCurrentAudio()
        }
      }

      // Stream fail (thường do .mp3 thực chất là M4A + Content-Type audio/mpeg) → fetch + typed blob
      if (staticUrl) {
        try {
          const blobUrl = await fetchUrlAsAudioBlobUrl(staticUrl)
          ownedBlobs.push(blobUrl)
          await tryPlaySrc(blobUrl)
          return
        } catch (fetchErr) {
          console.warn('[exam audio] typed blob fallback failed', staticUrl, fetchErr)
          stopCurrentAudio()
        }
      }

      for (const b of ownedBlobs) {
        if (objectUrlRef.current !== b) {
          try { URL.revokeObjectURL(b) } catch { /* ignore */ }
        }
      }

      const ttsText = source.ttsText?.trim()
      if (ttsText) {
        await playTtsFallback(ttsText, rate, sourceId)
        options.onPlayCounted?.()
        return
      }

      if (htmlSources.length === 0 && !staticUrl) {
        console.warn('[exam audio] no playable source', {
          audioKey: source.audioKey ?? null,
          audioUrl: source.audioUrl ?? null,
          hasTtsText: Boolean(ttsText),
          sourceId,
        })
        setTimeLabel('— / —')
        setPlaying(false)
        setBuffering(false)
        setPlayError(
          source.audioKey
            ? `Không tìm thấy blob audio (key: ${source.audioKey}). Bài import/local đang thiếu blob trong Dexie.`
            : 'Không tìm thấy file audio. Kiểm tra title đề, MP3 trong ZIP import, hoặc mapping audioFile → part/question.',
        )
        return
      }

      stopCurrentAudio()
      setPlaying(false)
      setBuffering(false)
      setPlayError(
        staticUrl
          ? `Không phát được file: ${staticUrl}. Kiểm tra path catalog hoặc MP3 import (Cam20 part có thể là M4A).`
          : 'Không phát được audio. Kiểm tra blob local, audioUrl fallback, hoặc mapping part/question.',
      )
    } catch (error) {
      console.warn('Exam audio playback failed', error)
      for (const b of ownedBlobs) {
        if (objectUrlRef.current !== b) {
          try { URL.revokeObjectURL(b) } catch { /* ignore */ }
        }
      }
      const msg = error instanceof Error ? error.message : ''
      // NotAllowed / message rõ — không fallback TTS nuốt lỗi
      if (msg.includes('chặn tự phát') || msg.includes('NotAllowed')) {
        stopCurrentAudio()
        setPlaying(false)
        setBuffering(false)
        setPlayError(msg)
        return
      }
      const ttsText = source.ttsText?.trim()
      if (ttsText) {
        await playTtsFallback(ttsText, rate, sourceId)
        options.onPlayCounted?.()
      } else {
        stopCurrentAudio()
        setPlaying(false)
        setBuffering(false)
        setPlayError(
          msg || 'Không phát được audio. Thử import lại ZIP kèm MP3 hoặc dùng đề builtin catalog.',
        )
      }
    }
  }, [cancelProgress, playHtmlAudio, playTtsFallback, speed, startProgressLoop, stopCurrentAudio])

  /** Pause (giữ vị trí). Dùng cho nút Pause trên audio bar. */
  const stopPlayback = pausePlayback

  /** Hủy hẳn + reset UI (đổi part / làm lại bài). */
  const resetPlayback = useCallback(() => {
    stopCurrentAudio()
    setPlaying(false)
    setBuffering(false)
    setProgressPct(0)
    setTimeLabel('0:00 / 0:00')
  }, [stopCurrentAudio])

  const seekToPct = useCallback((pct: number, allowSeek = true) => {
    if (!allowSeek) return
    const audio = audioRef.current
    if (!audio?.duration || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return
    }
    const clamped = Math.max(0, Math.min(100, pct))
    // Tránh dính sát cuối (ended) — chừa 30ms để play() sau tua luôn resume được
    const maxT = Math.max(0, audio.duration - 0.03)
    const t = Math.min(maxT, (clamped / 100) * audio.duration)
    try {
      audio.currentTime = t
      // Double-assign clears ended on stubborn engines after seek-from-end
      if (audio.ended && clamped < 99.5) {
        audio.currentTime = Math.max(0, t - 0.01)
        audio.currentTime = t
      }
    } catch (err) {
      console.warn('[exam audio] seek failed', err)
      return
    }
    setProgressPct(clamped)
    setTimeLabel(`${formatAudioTime(audio.currentTime)} / ${formatAudioTime(audio.duration)}`)
    setPlayError(null)
    if (!audio.paused && !audio.ended) {
      startProgressLoop(audio)
    }
  }, [startProgressLoop])

  const toggleSpeed = useCallback(() => {
    setSpeed(prev => {
      const next = prev === 1 ? 0.75 : prev === 0.75 ? 0.5 : 1
      if (audioRef.current) {
        audioRef.current.playbackRate = next
      }
      return next
    })
  }, [])

  return {
    playing,
    buffering,
    progressPct,
    timeLabel,
    speed,
    playError,
    toggleSpeed,
    play,
    seekToPct,
    /** Pause — giữ vị trí; phát lại = resume */
    stopPlayback,
    pausePlayback,
    /** Hủy audio element (đổi part / retry) */
    resetPlayback,
  }
}
