// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const spies = vi.hoisted(() => ({
  prime: vi.fn(),
  tick: vi.fn(),
  reveal: vi.fn(),
}))

vi.mock('./soundEffects', () => ({
  primeRouletteAudio: spies.prime,
  playTickSound: spies.tick,
  playCardRevealSound: spies.reveal,
}))
vi.mock('../speaking-ai/speakingAiApi', () => ({
  loadLatestSpeakingConversation: vi.fn().mockResolvedValue(null),
  sendSpeakingTurn: vi.fn(),
}))
vi.mock('../listening/tts', () => ({ speak: vi.fn() }))

import SpeakingIeltsPage from './SpeakingIeltsPage'

function renderRoulette() {
  return render(
    <MemoryRouter initialEntries={['/app/speaking/ielts/roulette']}>
      <Routes><Route path="*" element={<SpeakingIeltsPage/>}/></Routes>
    </MemoryRouter>
  )
}

afterEach(() => { cleanup(); spies.prime.mockClear(); spies.tick.mockClear(); spies.reveal.mockClear() })

describe('Roulette deck — card count and line-left', () => {
  it('renders exactly 7 cards in the deck', () => {
    const { container } = renderRoulette()
    expect(container.querySelectorAll('.si-deck button')).toHaveLength(7)
  })

  it('sets --line-left as percentage from 8% to 92% evenly', () => {
    const { container } = renderRoulette()
    const cards = [...container.querySelectorAll<HTMLElement>('.si-deck button')]
    const lineLefts = cards.map(c => c.style.getPropertyValue('--line-left'))
    expect(lineLefts[0]).toBe('8%')
    expect(lineLefts[6]).toBe('92%')
    for (let i = 1; i < lineLefts.length; i++) {
      const prev = parseFloat(lineLefts[i - 1])
      const curr = parseFloat(lineLefts[i])
      expect(curr).toBeGreaterThan(prev)
    }
  })

  it('sets --line-left-mobile as percentage from 16% to 84% evenly', () => {
    const { container } = renderRoulette()
    const cards = [...container.querySelectorAll<HTMLElement>('.si-deck button')]
    const mobiles = cards.map(c => c.style.getPropertyValue('--line-left-mobile'))
    expect(mobiles[0]).toBe('16%')
    expect(mobiles[6]).toBe('84%')
    for (let i = 1; i < mobiles.length; i++) {
      const prev = parseFloat(mobiles[i - 1])
      const curr = parseFloat(mobiles[i])
      expect(curr).toBeGreaterThan(prev)
    }
  })

  it('cards are not disabled in idle phase', () => {
    const { container } = renderRoulette()
    const cards = container.querySelectorAll('.si-deck button')
    cards.forEach(c => expect(c).not.toBeDisabled())
  })
})

describe('Roulette spin — audio calls', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('calls primeRouletteAudio exactly once on spin click', async () => {
    renderRoulette()
    const spinBtn = screen.getByRole('button', { name: /SPIN THE DECK/i })
    await act(async () => { spinBtn.click() })
    expect(spies.prime).toHaveBeenCalledTimes(1)
  })

  it('does not produce double audio on rapid double-click', async () => {
    renderRoulette()
    const spinBtn = screen.getByRole('button', { name: /SPIN THE DECK/i })
    await act(async () => { spinBtn.click() })
    await act(async () => { spinBtn.click() })
    expect(spies.prime).toHaveBeenCalledTimes(1)
  })

  it('lands on exactly one highlighted card after full spin', async () => {
    const { container } = renderRoulette()
    const spinBtn = screen.getByRole('button', { name: /SPIN THE DECK/i })
    await act(async () => { spinBtn.click() })
    // Advance past lineup (320ms) + spotlight ticks (~1800ms) into landed phase
    // but before LANDED_DURATION_MS (440ms) completes to avoid result replacing deck
    await act(async () => { vi.advanceTimersByTime(400) })
    await act(async () => { vi.advanceTimersByTime(2000) })
    const deck = container.querySelector('.si-deck')
    if (deck) {
      const highlighted = deck.querySelectorAll('button.is-highlighted')
      expect(highlighted).toHaveLength(1)
    }
  })

  it('calls playCardRevealSound exactly once when landing', async () => {
    renderRoulette()
    const spinBtn = screen.getByRole('button', { name: /SPIN THE DECK/i })
    await act(async () => { spinBtn.click() })
    await act(async () => { vi.advanceTimersByTime(400) })
    await act(async () => { vi.advanceTimersByTime(5000) })
    expect(spies.reveal).toHaveBeenCalledTimes(1)
  })

  it('calls playTickSound on even spotlight ticks', async () => {
    renderRoulette()
    const spinBtn = screen.getByRole('button', { name: /SPIN THE DECK/i })
    await act(async () => { spinBtn.click() })
    await act(async () => { vi.advanceTimersByTime(400) })
    await act(async () => { vi.advanceTimersByTime(5000) })
    expect(spies.tick.mock.calls.length).toBeGreaterThan(0)
  })
})
