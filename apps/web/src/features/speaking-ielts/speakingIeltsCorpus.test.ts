import { describe, expect, it } from 'vitest'
import forecastStates from './data/forecast-tab-states.json'
import forecastFullData from './data/forecast-q2-2026-full.json'
import rouletteStates from './data/roulette-states.json'
import { normalizeForecast, normalizeRoulette, normalizeShadowingLesson, pickRoulette } from './speakingIeltsData'

type CrawledItem = {
  id: string
  module: string
  title: string
  sourceUrl: string
  canonicalUrl: string
  contentText: string
}

const rawData = import.meta.glob('./data/*.json', { eager: true, import: 'default' }) as Record<string, unknown>
const crawledItems = Object.values(rawData).filter((value): value is CrawledItem => Boolean(value && typeof value === 'object' && 'id' in value))

describe('IELTS Speaking complete crawled corpus', () => {
  it('contains exactly 2 mandatory Part 1, 32 Part 1 topics, and 82 Part 2+3 sets', () => {
    const forecast = normalizeForecast(forecastStates, forecastFullData as { part2_3: Array<{ cueCard: string; bullets: string[]; part3: string[] }> })
    expect({
      mandatoryPart1: forecast.mandatoryPart1.length,
      part1Topics: forecast.part1Topics.length,
      part23Sets: forecast.part23Sets.length,
    }).toEqual({ mandatoryPart1: 2, part1Topics: 32, part23Sets: 82 })
  })

  it('does not repeat any previous roulette item at either random boundary', () => {
    const pool = normalizeRoulette(rouletteStates)[1]
    expect(pool.length).toBeGreaterThan(1)
    for (const previous of pool) {
      expect(pickRoulette(pool, previous.id, () => 0)?.id).not.toBe(previous.id)
      expect(pickRoulette(pool, previous.id, () => 0.999999)?.id).not.toBe(previous.id)
    }
  })

  it('exposes exactly 30 Shadowing lessons with real, unique titles', () => {
    const lessons = crawledItems
      .filter(item => item.module === 'shadowing' && !new URL(item.canonicalUrl).pathname.endsWith('/shadowing'))
      .map(item => normalizeShadowingLesson(item))
    const titles = lessons.map(lesson => lesson.title)

    expect(lessons).toHaveLength(30)
    expect(new Set(titles).size).toBe(30)
    expect(titles.every(title => title !== 'Shadowing lesson' && title !== 'The IELTS Dictionary - Luyện thi IELTS chuyên nghiệp')).toBe(true)
    expect(titles).toEqual(expect.arrayContaining([
      expect.stringMatching(/\S+\s+\S+/),
    ]))
  })
})
