import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('soundEffects', () => {
  let originalAudioContext: typeof window.AudioContext | undefined

  beforeEach(() => {
    originalAudioContext = window.AudioContext
  })

  afterEach(() => {
    if (originalAudioContext) window.AudioContext = originalAudioContext
    else delete (window as Partial<typeof window>).AudioContext
    delete (window as Window & { webkitAudioContext?: unknown }).webkitAudioContext
    vi.restoreAllMocks()
    vi.resetModules()
  })

  describe('silent fallback', () => {
    it('does not throw when AudioContext is unavailable', async () => {
      delete (window as Partial<typeof window>).AudioContext
      delete (window as Window & { webkitAudioContext?: unknown }).webkitAudioContext
      const { primeRouletteAudio, playTickSound, playCardRevealSound } = await import('./soundEffects')
      expect(() => primeRouletteAudio()).not.toThrow()
      expect(() => playTickSound()).not.toThrow()
      expect(() => playCardRevealSound()).not.toThrow()
    })
  })

  describe('with mocked AudioContext', () => {
    function makeMockParam() {
      return { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }
    }
    function setupMockAudio() {
      function makeMockNode() {
        const self = {
          connect: vi.fn(() => self),
          disconnect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          onended: null as (() => void) | null,
          frequency: makeMockParam(),
          gain: makeMockParam(),
          type: '',
          buffer: null as AudioBuffer | null,
        }
        return self
      }
      const mockCtx = {
        state: 'running' as string,
        resume: vi.fn(() => Promise.resolve()),
        currentTime: 0,
        sampleRate: 44100,
        createOscillator: vi.fn(makeMockNode),
        createGain: vi.fn(makeMockNode),
        createBuffer: vi.fn(() => ({ getChannelData: vi.fn(() => new Float32Array(100)) })),
        createBufferSource: vi.fn(makeMockNode),
        createBiquadFilter: vi.fn(makeMockNode),
        destination: {},
      }
      window.AudioContext = vi.fn(() => mockCtx) as unknown as typeof window.AudioContext
      return { mockCtx }
    }

    it('primeRouletteAudio resumes a suspended context', async () => {
      const { mockCtx } = setupMockAudio()
      mockCtx.state = 'suspended'
      const { primeRouletteAudio } = await import('./soundEffects')
      primeRouletteAudio()
      expect(mockCtx.resume).toHaveBeenCalledTimes(1)
    })

    it('primeRouletteAudio does not call resume on a running context', async () => {
      const { mockCtx } = setupMockAudio()
      mockCtx.state = 'running'
      const { primeRouletteAudio } = await import('./soundEffects')
      primeRouletteAudio()
      expect(mockCtx.resume).not.toHaveBeenCalled()
    })

    it('playTickSound creates oscillator and gain nodes', async () => {
      const { mockCtx } = setupMockAudio()
      const { playTickSound } = await import('./soundEffects')
      playTickSound()
      expect(mockCtx.createOscillator).toHaveBeenCalledTimes(1)
      expect(mockCtx.createGain).toHaveBeenCalledTimes(1)
    })

    it('playCardRevealSound creates noise + two chime oscillators', async () => {
      const { mockCtx } = setupMockAudio()
      const { playCardRevealSound } = await import('./soundEffects')
      playCardRevealSound()
      expect(mockCtx.createBufferSource).toHaveBeenCalledTimes(1)
      expect(mockCtx.createBiquadFilter).toHaveBeenCalledTimes(1)
      expect(mockCtx.createOscillator).toHaveBeenCalledTimes(2)
      expect(mockCtx.createGain).toHaveBeenCalledTimes(3)
    })
  })
})
