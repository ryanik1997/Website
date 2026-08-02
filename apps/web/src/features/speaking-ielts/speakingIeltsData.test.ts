import { describe, expect, it } from 'vitest'
import forecastStates from './data/forecast-tab-states.json'
import forecastFullData from './data/forecast-q2-2026-full.json'
import rouletteStates from './data/roulette-states.json'
import { buildSpotlightSequence, normalizeForecast, normalizeRoulette, pickRoulette } from './speakingIeltsData'

describe('IELTS Speaking source normalization', () => {
  it('keeps Forecast groups as real practice records', () => {
    const result = normalizeForecast([
      { text: 'PART 1 BẮT BUỘC (2)\n1. Where you live now\n2. Work / Study' },
      { text: 'PART 1 CHỦ ĐỀ (2)\n1. Food\n2. Pets and animals' },
      { text: 'PART 2 + 3 (1)\n1. Describe a famous person' },
    ])
    expect(result.mandatoryPart1.map(item => item.title)).toEqual(['Where you live now', 'Work / Study'])
    expect(result.part1Topics).toHaveLength(2)
    expect(result.part23Sets[0].part).toBe(2)
  })

  it('deduplicates roulette topics by stable part-aware id', () => {
    const result = normalizeRoulette([
      { text: 'Part 1\nFOOD\n?\nFOOD\n?\nSpin the deck' },
      { text: 'Part 2\nDESCRIBE A GIFT YOU GAVE\n?' },
      { text: 'Part 3\nWORK\n?' },
    ])
    expect(result[1]).toHaveLength(1)
    expect(result[1][0].part).toBe(1)
    expect(result[2][0].prompt).toContain('GIFT')
    expect(result[3][0].id).toBe('roulette-3-work')
  })

  it('exposes the complete crawled Forecast 2/32/82 corpus', () => {
    const result = normalizeForecast(forecastStates, forecastFullData as { part2_3: Array<{ cueCard: string; bullets: string[]; part3: string[] }> })
    expect([result.mandatoryPart1.length, result.part1Topics.length, result.part23Sets.length]).toEqual([2, 32, 82])
    expect(result.part23Sets[0].bulletPoints.length).toBeGreaterThan(0)
  })

  it('enriches all 82 Part 2+3 sets with Part 3 questions from the full data source', () => {
    const result = normalizeForecast(forecastStates, forecastFullData as { part2_3: Array<{ cueCard: string; bullets: string[]; part3: string[] }> })
    expect(result.part23Sets).toHaveLength(82)
    const withPart3 = result.part23Sets.filter(item => item.part3Questions.length > 0)
    expect(withPart3).toHaveLength(82)
    const totalPart3 = result.part23Sets.reduce((sum, item) => sum + item.part3Questions.length, 0)
    expect(totalPart3).toBeGreaterThan(0)
    expect(result.part23Sets[0].part3Questions).toEqual(forecastFullData.part2_3[0].part3)
    expect(result.part23Sets[81].part3Questions).toEqual(forecastFullData.part2_3[81].part3)
  })

  it('parses Part 3 questions when present after the heading', () => {
    const result = normalizeForecast([
      { text: 'PART 1 BẮT BUỘC (1)\n1. Where you live now' },
      { text: 'PART 1 CHỦ ĐỀ (1)\n1. Food' },
      { text: 'PART 2 + 3 (1)\n1. Describe a famous person\nYOU SHOULD SAY:\n• Who they are\n• What they do\nPart 3 Questions (3)\n1. What makes people famous today?\n2. How do celebrities influence young people?\n3. Are famous people good role models?' },
    ])
    expect(result.part23Sets).toHaveLength(1)
    expect(result.part23Sets[0].part3Questions).toEqual([
      'What makes people famous today?',
      'How do celebrities influence young people?',
      'Are famous people good role models?',
    ])
  })

  it('parses Part 3 questions as plain text lines after the heading', () => {
    const result = normalizeForecast([
      { text: 'PART 1 BẮT BUỘC (1)\n1. Where you live now' },
      { text: 'PART 1 CHỦ ĐỀ (1)\n1. Food' },
      { text: 'PART 2 + 3 (1)\n1. Describe a hobby\nYOU SHOULD SAY:\n• What it is\nPart 3 Questions (2)\nWhy are hobbies important?\nHow can hobbies reduce stress?' },
    ])
    expect(result.part23Sets[0].part3Questions).toEqual([
      'Why are hobbies important?',
      'How can hobbies reduce stress?',
    ])
  })

  it('never immediately repeats a roulette result while alternatives exist', () => {
    const pool = normalizeRoulette(rouletteStates)[1]
    const previous = pool[0]
    expect(pickRoulette(pool, previous.id, () => 0)?.id).not.toBe(previous.id)
  })
})

describe('buildSpotlightSequence', () => {
  it('returns an empty array when cardCount is zero or negative', () => {
    expect(buildSpotlightSequence(0, 0)).toEqual([])
    expect(buildSpotlightSequence(-1, 0)).toEqual([])
  })

  it('produces at least minimumTicks entries', () => {
    const seq = buildSpotlightSequence(7, 3, 16)
    expect(seq.length).toBeGreaterThanOrEqual(16)
  })

  it('ends exactly on the target finalIndex', () => {
    for (const finalIndex of [0, 1, 3, 6]) {
      const seq = buildSpotlightSequence(7, finalIndex, 16)
      expect(seq[seq.length - 1]).toBe(finalIndex)
    }
  })

  it('clamps finalIndex to the valid card range', () => {
    const seq = buildSpotlightSequence(7, 99, 16)
    expect(seq[seq.length - 1]).toBe(6)
    const seqUnder = buildSpotlightSequence(7, -5, 16)
    expect(seqUnder[seqUnder.length - 1]).toBe(0)
  })

  it('cycles through card indices without skipping', () => {
    const seq = buildSpotlightSequence(7, 3, 16)
    for (let i = 0; i < seq.length; i++) {
      expect(seq[i]).toBe(i % 7)
    }
  })

  it('adds zero extra ticks when finalIndex already aligns', () => {
    const currentLast = (16 - 1) % 7
    const seq = buildSpotlightSequence(7, currentLast, 16)
    expect(seq.length).toBe(16)
  })

  it('uses default minimumTicks of 16 when omitted', () => {
    const seq = buildSpotlightSequence(7, 0)
    expect(seq.length).toBeGreaterThanOrEqual(16)
    expect(seq[seq.length - 1]).toBe(0)
  })

  it('handles single-card deck', () => {
    const seq = buildSpotlightSequence(1, 0, 16)
    expect(seq.length).toBe(16)
    expect(seq.every(v => v === 0)).toBe(true)
  })
})
