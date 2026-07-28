export interface PitchFrame { t: number; f0: number }

const MIN_F0 = 80
const MAX_F0 = 400
const YIN_THRESHOLD = 0.12
const SLOPE_RISE = 0.10
const SLOPE_FALL = -0.10

export function detectPitchYIN(buf: Float32Array, sr: number): number {
  const half = Math.floor(buf.length / 2)
  if (half < 4) return 0
  const yin = new Float32Array(half)
  yin[0] = 1.0
  let runSum = 0
  for (let tau = 1; tau < half; tau++) {
    let diff = 0
    for (let i = 0; i < half; i++) {
      const d = buf[i] - buf[i + tau]
      diff += d * d
    }
    runSum += diff
    yin[tau] = runSum > 0 ? (diff * tau / runSum) : 0
  }
  for (let tau = 2; tau < half - 1; tau++) {
    if (yin[tau] < YIN_THRESHOLD) {
      while (tau + 1 < half && yin[tau + 1] < yin[tau]) tau++
      if (tau > 0 && tau < half - 1) {
        const s0 = yin[tau - 1], s1 = yin[tau], s2 = yin[tau + 1]
        const denom = 2 * s1 - s2 - s0
        if (denom !== 0) tau += (s2 - s0) / (2 * denom)
      }
      const f0 = sr / tau
      return (f0 >= MIN_F0 && f0 <= MAX_F0) ? f0 : 0
    }
  }
  return 0
}

function estimateSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 1
  if (w.length <= 3) return 1
  const groups = w.match(/[aeiouy]+/g)
  let count = groups ? groups.length : 1
  if (w.endsWith('e') && count > 1 && !w.endsWith('le')) count--
  return Math.max(1, count)
}

/** Synthetic reference contour when only TTS (no audio element). */
export function generateReferenceContour(text: string, durationSec: number): PitchFrame[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const weights = words.map(estimateSyllables)
  const total = weights.reduce((a, b) => a + b, 0) || words.length
  const frames: PitchFrame[] = []
  const base = 140
  let t = 0
  words.forEach((word, i) => {
    const dur = (durationSec * weights[i]) / total
    const steps = Math.max(3, Math.floor(dur / 0.04))
    for (let s = 0; s < steps; s++) {
      const p = s / steps
      const wave = Math.sin((i + p) * 1.7) * 25 + Math.sin(p * Math.PI) * 35
      const stress = word.length > 5 ? 15 : 0
      frames.push({ t: t + p * dur, f0: base + wave + stress })
    }
    t += dur
  })
  return frames
}

export interface WordChip {
  text: string
  label: string
  dir: 'rise' | 'fall' | 'flat'
}

export function buildWordChips(frames: PitchFrame[], text: string): WordChip[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (!words.length || !frames.length) return []
  const voiced = frames.filter(f => f.f0 > 0)
  const f0vals = voiced.map(f => f.f0)
  const pMin = Math.min(...f0vals)
  const pMax = Math.max(...f0vals)
  const pRange = Math.max(pMax - pMin, 20)
  const tMin = frames[0]?.t ?? 0
  const tMax = frames[frames.length - 1]?.t ?? 1
  const span = Math.max(tMax - tMin, 0.1)
  const weights = words.map(estimateSyllables)
  const total = weights.reduce((a, b) => a + b, 0)
  let cursor = tMin
  return words.map((word, i) => {
    const dur = span * (weights[i] / total)
    const t0 = cursor
    const t1 = cursor + dur
    cursor += dur
    const win = frames.filter(f => f.f0 > 0 && f.t >= t0 && f.t <= t1)
    if (win.length < 2) return { text: word, label: '→', dir: 'flat' as const }
    const head = win.slice(0, Math.max(1, Math.ceil(win.length * 0.35)))
    const tail = win.slice(-Math.max(1, Math.ceil(win.length * 0.35)))
    const avgH = head.reduce((s, f) => s + f.f0, 0) / head.length
    const avgT = tail.reduce((s, f) => s + f.f0, 0) / tail.length
    const norm = (avgT - avgH) / pRange
    if (norm >= SLOPE_RISE) return { text: word, label: '↗', dir: 'rise' as const }
    if (norm <= SLOPE_FALL) return { text: word, label: '↘', dir: 'fall' as const }
    return { text: word, label: '→', dir: 'flat' as const }
  })
}

export function drawPitchContour(
  canvas: HTMLCanvasElement,
  frames: PitchFrame[],
  opts?: { highlightWordIdx?: number; isDark?: boolean },
) {
  const H = 96
  const W = canvas.parentElement?.clientWidth ?? 500
  canvas.width = Math.max(W, 200)
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const isDark = opts?.isDark ?? document.documentElement.getAttribute('data-theme') === 'dark'
  const pal = isDark
    ? { bg: 'rgba(8,12,20,0.82)', grid: 'rgba(255,255,255,0.06)', rise: '#fb923c', fall: '#38bdf8', flat: '#64748b', fill: 'rgba(129,140,248,0.2)' }
    : { bg: 'rgba(244,247,255,0.98)', grid: 'rgba(15,23,42,0.08)', rise: '#ea580c', fall: '#1d4ed8', flat: '#94a3b8', fill: 'rgba(99,102,241,0.18)' }

  const voiced = frames.filter(f => f.f0 > 0)
  if (voiced.length < 3) {
    ctx.fillStyle = pal.bg
    ctx.fillRect(0, 0, canvas.width, H)
    ctx.fillStyle = pal.flat
    ctx.font = '12px system-ui,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(
      voiced.length < 3
        ? 'Không phát hiện cao độ — thử đọc to hơn hoặc dùng Nghe mẫu'
        : 'Chưa có dữ liệu pitch',
      canvas.width / 2,
      H / 2,
    )
    return
  }

  const tMin = frames[0].t
  const tMax = frames[frames.length - 1].t
  const f0vals = voiced.map(f => f.f0)
  const pMin = Math.min(...f0vals) - 10
  const pMax = Math.max(...f0vals) + 10
  const pRange = Math.max(pMax - pMin, 20)

  ctx.fillStyle = pal.bg
  ctx.fillRect(0, 0, canvas.width, H)
  ctx.strokeStyle = pal.grid
  for (let i = 1; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(0, (H * i) / 4)
    ctx.lineTo(canvas.width, (H * i) / 4)
    ctx.stroke()
  }

  const pts = frames.filter(f => f.f0 > 0)
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const x1 = ((a.t - tMin) / (tMax - tMin)) * (canvas.width - 20) + 10
    const x2 = ((b.t - tMin) / (tMax - tMin)) * (canvas.width - 20) + 10
    const y1 = H - 12 - ((a.f0 - pMin) / pRange) * (H - 24)
    const y2 = H - 12 - ((b.f0 - pMin) / pRange) * (H - 24)
    const norm = (b.f0 - a.f0) / pRange
    ctx.strokeStyle = norm >= SLOPE_RISE ? pal.rise : norm <= SLOPE_FALL ? pal.fall : pal.flat
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  ctx.fillStyle = pal.fill
  ctx.beginPath()
  pts.forEach((p, i) => {
    const x = ((p.t - tMin) / (tMax - tMin)) * (canvas.width - 20) + 10
    const y = H - 12 - ((p.f0 - pMin) / pRange) * (H - 24)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.lineTo(((pts[pts.length - 1].t - tMin) / (tMax - tMin)) * (canvas.width - 20) + 10, H)
  ctx.lineTo(((pts[0].t - tMin) / (tMax - tMin)) * (canvas.width - 20) + 10, H)
  ctx.closePath()
  ctx.fill()
}