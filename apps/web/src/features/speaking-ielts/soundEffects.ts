let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  return audioCtx
}

export function primeRouletteAudio(): void {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()
}

export function playTickSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05)
    gain.gain.setValueAtTime(0.035, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.06)
    osc.onended = () => { osc.disconnect(); gain.disconnect() }
  } catch {
    // Silent fallback if browser blocks audio or no user gesture yet
  }
}

export function playCardRevealSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    // Whoosh — filtered noise burst ~220ms
    const bufferSize = Math.floor(ctx.sampleRate * 0.22)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const bandpass = ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.setValueAtTime(2000, now)
    bandpass.frequency.exponentialRampToValueAtTime(600, now + 0.22)
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.04, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    noise.connect(bandpass).connect(noiseGain).connect(ctx.destination)
    noise.start(now)
    noise.stop(now + 0.22)
    noise.onended = () => { noise.disconnect(); bandpass.disconnect(); noiseGain.disconnect() }

    // Two chime notes
    for (const [idx, freq] of [880, 1320].entries()) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.08)
      gain.gain.setValueAtTime(0, now + idx * 0.08)
      gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.08 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + idx * 0.08)
      osc.stop(now + idx * 0.08 + 0.3)
      osc.onended = () => { osc.disconnect(); gain.disconnect() }
    }
  } catch {
    // Silent fallback if browser blocks audio or no user gesture yet
  }
}
