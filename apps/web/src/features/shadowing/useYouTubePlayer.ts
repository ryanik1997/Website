import { useCallback, useEffect, useRef, useState } from 'react'

/** Minimal YT types (avoid @types/youtube dependency). */
type YtPlayer = {
  destroy: () => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  playVideo: () => void
  pauseVideo: () => void
  setPlaybackRate: (rate: number) => void
}

type YtNamespace = {
  Player: new (
    el: HTMLElement | string,
    opts: {
      videoId: string
      width?: string | number
      height?: string | number
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: (e: { target: YtPlayer }) => void
        onStateChange?: (e: { data: number; target: YtPlayer }) => void
      }
    },
  ) => YtPlayer
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number; CUED: number }
}

declare global {
  interface Window {
    YT?: YtNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiLoadPromise: Promise<void> | null = null

function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.YT?.Player) return Promise.resolve()
  if (apiLoadPromise) return apiLoadPromise

  apiLoadPromise = new Promise(resolve => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      document.head.appendChild(tag)
    }
    // Already loaded race
    if (window.YT?.Player) resolve()
  })
  return apiLoadPromise
}

export function useYouTubePlayer(videoId: string) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YtPlayer | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRateState] = useState(1)

  useEffect(() => {
    let cancelled = false
    let poll: number | undefined
    let player: YtPlayer | null = null

    setReady(false)
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)

    void (async () => {
      await loadYouTubeApi()
      if (cancelled || !hostRef.current || !window.YT?.Player) return

      // Clear previous mount node content
      hostRef.current.innerHTML = ''
      const mount = document.createElement('div')
      hostRef.current.appendChild(mount)

      player = new window.YT.Player(mount, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: e => {
            if (cancelled) return
            playerRef.current = e.target
            setReady(true)
            try {
              setDuration(e.target.getDuration() || 0)
            } catch {
              /* ignore */
            }
          },
          onStateChange: e => {
            const YT = window.YT
            if (!YT) return
            setPlaying(e.data === YT.PlayerState.PLAYING)
            if (e.data === YT.PlayerState.PLAYING) {
              try {
                setDuration(e.target.getDuration() || 0)
              } catch {
                /* ignore */
              }
            }
          },
        },
      })
      playerRef.current = player

      poll = window.setInterval(() => {
        const p = playerRef.current
        if (!p) return
        try {
          const t = p.getCurrentTime()
          if (Number.isFinite(t)) setCurrentTime(t)
        } catch {
          /* player mid-destroy */
        }
      }, 200)
    })()

    return () => {
      cancelled = true
      if (poll) window.clearInterval(poll)
      try {
        playerRef.current?.destroy()
      } catch {
        /* ignore */
      }
      playerRef.current = null
    }
  }, [videoId])

  const seekTo = useCallback((seconds: number, play = true) => {
    const p = playerRef.current
    if (!p) return
    try {
      p.seekTo(Math.max(0, seconds), true)
      if (play) p.playVideo()
      setCurrentTime(seconds)
    } catch {
      /* ignore */
    }
  }, [])

  const play = useCallback(() => {
    try {
      playerRef.current?.playVideo()
    } catch {
      /* ignore */
    }
  }, [])

  const pause = useCallback(() => {
    try {
      playerRef.current?.pauseVideo()
    } catch {
      /* ignore */
    }
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    try {
      playerRef.current?.setPlaybackRate(rate)
      setPlaybackRateState(rate)
    } catch {
      /* ignore */
    }
  }, [])

  return {
    hostRef,
    ready,
    playing,
    currentTime,
    duration,
    playbackRate,
    seekTo,
    play,
    pause,
    setPlaybackRate,
  }
}

/** Find active subtitle index for a given playback time. */
export function findSubtitleIndexAt(
  subtitles: Array<{ startTime: number | null; duration: number | null }>,
  time: number,
): number {
  if (!subtitles.length) return 0
  let best = 0
  for (let i = 0; i < subtitles.length; i++) {
    const start = subtitles[i].startTime ?? 0
    if (start <= time + 0.05) best = i
    else break
  }
  return best
}
