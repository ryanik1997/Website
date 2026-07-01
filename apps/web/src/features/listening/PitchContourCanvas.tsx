import { useEffect, useRef } from 'react'
import { buildWordChips, drawPitchContour, type PitchFrame } from './pitchContour'

interface Props {
  frames: PitchFrame[]
  sentenceText: string
  highlightIdx?: number
}

export default function PitchContourCanvas({ frames, sentenceText, highlightIdx = -1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chips = buildWordChips(frames, sentenceText)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawPitchContour(canvas, frames, { highlightWordIdx: highlightIdx })
  }, [frames, highlightIdx])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => drawPitchContour(canvas, frames, { highlightWordIdx: highlightIdx }))
    ro.observe(canvas.parentElement ?? canvas)
    return () => ro.disconnect()
  }, [frames, highlightIdx])

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
      />
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {chips.map((chip, i) => (
            <span
              key={`${chip.text}-${i}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
              style={{
                background: i === highlightIdx
                  ? 'color-mix(in srgb, var(--color-primary) 20%, var(--bg-secondary))'
                  : 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <span>{chip.text}</span>
              <span style={{ color: chip.dir === 'rise' ? 'var(--color-accent)' : 'var(--color-primary)' }}>
                {chip.label}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}