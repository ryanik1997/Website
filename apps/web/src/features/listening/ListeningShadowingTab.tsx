import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, Square, Volume2 } from 'lucide-react'
import type { LessonSentence } from './types'
import { useListeningPlayback } from './useListeningPlayback'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useMicPitchCapture } from './useMicPitchCapture'
import PitchContourCanvas from './PitchContourCanvas'
import WordDiffPanel from './WordDiffPanel'
import { estimateSpeechDurationSec } from './practiceUtils'
import { generateReferenceContour, type PitchFrame } from './pitchContour'

interface Props {
  sentence: LessonSentence
  sentenceIndex: number
  total: number
  onIndexChange: (idx: number) => void
}

export default function ListeningShadowingTab({
  sentence,
  sentenceIndex,
  total,
  onIndexChange,
}: Props) {
  const [displayFrames, setDisplayFrames] = useState<PitchFrame[]>([])
  const [statusMsg, setStatusMsg] = useState('Bấm "Nghe mẫu" để hiện lược đồ cao độ')
  const frameCache = useRef<Record<number, PitchFrame[]>>({})

  const { playing, playTts, stopPlayback } = useListeningPlayback()
  const { listening, transcript, supported, start: startRec, stop: stopRec, reset: resetRec } = useSpeechRecognition()
  const { capturing, frames: micFrames, start: startMic, stop: stopMic, reset: resetMic } = useMicPitchCapture()

  const stopRef = useRef(stopPlayback)
  stopRef.current = stopPlayback

  useEffect(() => {
    const cached = frameCache.current[sentenceIndex]
    if (cached && cached.length >= 3) {
      setDisplayFrames(cached)
      setStatusMsg('')
    } else {
      setDisplayFrames([])
      setStatusMsg('Bấm "Nghe mẫu" để hiện lược đồ cao độ')
    }
    resetRec()
    resetMic()
    stopRef.current()
  }, [sentence.id, sentenceIndex, resetRec, resetMic])

  useEffect(() => {
    if (capturing && micFrames.length >= 3) {
      setDisplayFrames(micFrames)
      setStatusMsg('Đang thu thập cao độ từ microphone...')
    }
  }, [capturing, micFrames])

  const playModel = useCallback(async () => {
    stopRec()
    stopMic()
    const rate = 0.85
    const duration = estimateSpeechDurationSec(sentence.text, rate)
    const refFrames = generateReferenceContour(sentence.text, duration)
    setDisplayFrames(refFrames)
    setStatusMsg('Đang phát mẫu...')
    try {
      await playTts(sentence.text, 1)
      frameCache.current[sentenceIndex] = refFrames
      setStatusMsg('')
    } finally {
      setStatusMsg('')
    }
  }, [sentence.text, sentenceIndex, playTts, stopRec, stopMic])

  async function toggleRead() {
    if (listening || capturing) {
      stopRec()
      stopMic()
      if (micFrames.length >= 3) {
        frameCache.current[sentenceIndex] = micFrames
        setDisplayFrames(micFrames)
      }
      return
    }
    stopPlayback()
    resetMic()
    setStatusMsg('Đang nghe bạn đọc...')
    await startMic()
    startRec()
  }

  const showDiff = transcript.trim().length > 0

  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onIndexChange(i)}
            className="w-2 h-2 rounded-full"
            style={{
              background: i === sentenceIndex ? 'var(--color-primary)' : 'var(--border-color)',
            }}
          />
        ))}
      </div>

      <p
        className="text-xl sm:text-2xl font-semibold text-center leading-relaxed mb-8 px-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {sentence.text}
      </p>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => void playModel()}
          disabled={playing}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
          style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
        >
          <Volume2 size={18} />
          {playing ? 'Đang phát...' : 'Nghe mẫu'}
        </button>
        <button
          type="button"
          onClick={() => void toggleRead()}
          disabled={!supported}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: (listening || capturing) ? 'var(--color-accent)' : 'var(--bg-secondary)',
            color: (listening || capturing) ? 'var(--bg-primary)' : 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }}
        >
          {listening || capturing ? <Square size={18} /> : <Mic size={18} />}
          {listening || capturing ? 'Dừng đọc' : 'Bắt đầu đọc'}
        </button>
      </div>

      {(listening || capturing) && (
        <p className="text-sm text-center mb-4 italic" style={{ color: 'var(--text-muted)' }}>
          {transcript || '...'}
        </p>
      )}

      {showDiff && (
        <WordDiffPanel input={transcript} correct={sentence.text} />
      )}

      <div className="mb-3">
        <p className="text-xs uppercase tracking-wide font-bold text-center mb-3" style={{ color: 'var(--text-muted)' }}>
          Pitch contour
        </p>
        {displayFrames.length >= 3 ? (
          <PitchContourCanvas frames={displayFrames} sentenceText={sentence.text} />
        ) : (
          <div
            className="rounded-xl p-6 min-h-[120px] flex items-center justify-center text-center"
            style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)' }}
          >
            <p className="text-xs max-w-sm" style={{ color: 'var(--text-muted)' }}>
              {statusMsg}
            </p>
          </div>
        )}
      </div>

      {!supported && (
        <p className="text-xs text-center mt-3" style={{ color: 'var(--color-accent)' }}>
          Trình duyệt không hỗ trợ nhận giọng nói. Dùng Chrome hoặc Edge để shadowing.
        </p>
      )}
    </div>
  )
}