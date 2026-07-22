function getAudioContext(): AudioContext | null {
  try {
    const Ctx = window.AudioContext
      ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    return Ctx ? new Ctx() : null
  } catch {
    return null
  }
}

/** Âm thanh vang khi trả lời đúng */
export function playCorrectChime(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.connect(gain)
    gain.connect(ctx.destination)

    const t = ctx.currentTime + i * 0.09
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.18, t + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
    osc.start(t)
    osc.stop(t + 0.6)
  })

  window.setTimeout(() => void ctx.close(), 1200)
}

/** Âm thanh khi chọn / gõ sai */
export function playWrongBuzz(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.connect(gain)
  gain.connect(ctx.destination)

  const t = ctx.currentTime
  osc.frequency.setValueAtTime(280, t)
  osc.frequency.exponentialRampToValueAtTime(140, t + 0.22)
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(0.14, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
  osc.start(t)
  osc.stop(t + 0.4)

  window.setTimeout(() => void ctx.close(), 500)
}

export function celebrateCorrect(): void {
  playCorrectChime()
}

export function signalWrong(): void {
  playWrongBuzz()
}