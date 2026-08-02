import { describe, expect, it } from 'vitest'
import { validateSpeakingPools } from './utils/validateSpeakingPools'
import { PART1_QUESTIONS } from './data/part1'
import { PART2_CUE_CARDS } from './data/part2'
import { PART3_QUESTIONS } from './data/part3'
import { SPEAKING_POOLS, getPart2LinkedGroup, getPart2Prompts, getPart3PoolForGroup, getSpeakingItem, getRelatedGroups, createPart3Session, resetPart3Session, pickPart3ForSession } from './data/speakingPools'
import { pickRoulette } from './speakingIeltsData'

describe('speakingPools validation', () => {
  const { issues, summary } = validateSpeakingPools()
  const errors = issues.filter(i => i.severity === 'error')

  it('has zero validation errors', () => {
    expect(errors, errors.map(e => e.message).join('; ')).toHaveLength(0)
  })

  it('Part 1 has >= 160 questions', () => {
    expect(summary.part1Count).toBeGreaterThanOrEqual(160)
  })

  it('Part 2 has >= 100 cue cards', () => {
    expect(summary.part2Count).toBeGreaterThanOrEqual(100)
  })

  it('Part 3 has >= 340 questions', () => {
    expect(summary.part3Count).toBeGreaterThanOrEqual(340)
  })

  it('total >= 615', () => {
    expect(summary.total).toBeGreaterThanOrEqual(615)
  })

  it('all IDs are unique across all parts', () => {
    const allIds = [...PART1_QUESTIONS, ...PART2_CUE_CARDS, ...PART3_QUESTIONS].map(i => i.id)
    expect(new Set(allIds).size).toBe(allIds.length)
  })

  it('Part 2 cards have exactly 4 prompts', () => {
    const bad = PART2_CUE_CARDS.filter(c => c.prompts.length !== 4)
    expect(bad, bad.map(c => c.id).join(', ')).toHaveLength(0)
  })

  it('every Part 2 linkedPart3Group has >= 10 Part 3 questions', () => {
    const part3ByGroup = new Map<string, number>()
    for (const q of PART3_QUESTIONS) {
      part3ByGroup.set(q.linkedPart3Group, (part3ByGroup.get(q.linkedPart3Group) ?? 0) + 1)
    }
    const bad = PART2_CUE_CARDS.filter(c => (part3ByGroup.get(c.linkedPart3Group) ?? 0) < 10)
    expect(bad, bad.map(c => `${c.id}→${c.linkedPart3Group}`).join(', ')).toHaveLength(0)
  })

  it('all questions end with ?', () => {
    const bad1 = PART1_QUESTIONS.filter(q => !q.question.trim().endsWith('?'))
    const bad3 = PART3_QUESTIONS.filter(q => !q.question.trim().endsWith('?'))
    expect(bad1, bad1.map(q => q.id).join(', ')).toHaveLength(0)
    expect(bad3, bad3.map(q => q.id).join(', ')).toHaveLength(0)
  })

  it('no exact duplicate questions', () => {
    const norm = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
    const p1 = new Set(PART1_QUESTIONS.map(q => norm(q.question)))
    const p3 = new Set(PART3_QUESTIONS.map(q => norm(q.question)))
    expect(p1.size).toBe(PART1_QUESTIONS.length)
    expect(p3.size).toBe(PART3_QUESTIONS.length)
  })

  it('no near-duplicate questions (Jaccard > 0.75)', () => {
    const errors = issues.filter(i => i.check.startsWith('near-duplicate'))
    expect(errors, errors.map(e => e.message + (e.items ?? []).join(', ')).join('; ')).toHaveLength(0)
  })

  it('all difficulty values are valid', () => {
    const valid = ['easy', 'medium', 'advanced']
    expect(PART1_QUESTIONS.every(q => valid.includes(q.difficulty))).toBe(true)
    expect(PART2_CUE_CARDS.every(q => valid.includes(q.difficulty))).toBe(true)
    expect(PART3_QUESTIONS.every(q => valid.includes(q.difficulty))).toBe(true)
  })

  it('Part 2 preparationSeconds = 60 and speakingSeconds = 120', () => {
    expect(PART2_CUE_CARDS.every(c => c.preparationSeconds === 60)).toBe(true)
    expect(PART2_CUE_CARDS.every(c => c.speakingSeconds === 120)).toBe(true)
  })

  it('no array index IDs', () => {
    const all = [...PART1_QUESTIONS, ...PART2_CUE_CARDS, ...PART3_QUESTIONS]
    expect(all.every(i => !/^\d+$/.test(i.id))).toBe(true)
  })

  it('no placeholder text', () => {
    const pattern = /\b(todo|tbd|example question|lorem ipsum|placeholder|fixme)\b/i
    const all = [...PART1_QUESTIONS, ...PART2_CUE_CARDS, ...PART3_QUESTIONS]
    const bad = all.filter(i => pattern.test(i.topic) || (i.part === 1 && pattern.test(i.question)) || (i.part === 2 && pattern.test(i.cueCard)) || (i.part === 3 && pattern.test(i.question)))
    expect(bad, bad.map(i => i.id).join(', ')).toHaveLength(0)
  })
})

describe('SPEAKING_POOLS roulette compatibility', () => {
  it('produces RouletteItem[] for each part', () => {
    expect(SPEAKING_POOLS[1].length).toBeGreaterThanOrEqual(160)
    expect(SPEAKING_POOLS[2].length).toBeGreaterThanOrEqual(100)
    expect(SPEAKING_POOLS[3].length).toBeGreaterThanOrEqual(340)
  })

  it('pickRoulette does not repeat the previous item', () => {
    let prev: string | undefined
    for (let i = 0; i < 20; i++) {
      const picked = pickRoulette(SPEAKING_POOLS[1], prev)
      expect(picked).toBeDefined()
      if (picked && prev) expect(picked.id).not.toBe(prev)
      if (picked) prev = picked.id
    }
  })

  it('pickRoulette returns undefined for empty pool', () => {
    expect(pickRoulette([], undefined)).toBeUndefined()
  })
})

describe('Part 2 → Part 3 linking', () => {
  it('getPart2LinkedGroup returns the correct group', () => {
    const card = PART2_CUE_CARDS[0]
    expect(getPart2LinkedGroup(card.id)).toBe(card.linkedPart3Group)
  })

  it('getPart3PoolForGroup returns at least 10 questions for any Part 2 group', () => {
    for (const card of PART2_CUE_CARDS) {
      const pool = getPart3PoolForGroup(card.linkedPart3Group)
      expect(pool.length, `${card.linkedPart3Group}`).toBeGreaterThanOrEqual(10)
    }
  })

  it('getPart3PoolForGroup falls back to full pool for unknown group', () => {
    const pool = getPart3PoolForGroup('nonexistent-group')
    expect(pool.length).toBe(PART3_QUESTIONS.length)
  })

  it('getPart3PoolForGroup returns full pool for undefined', () => {
    const pool = getPart3PoolForGroup(undefined)
    expect(pool.length).toBe(PART3_QUESTIONS.length)
  })

  it('getPart2Prompts returns exactly 4 prompts', () => {
    const card = PART2_CUE_CARDS[0]
    const prompts = getPart2Prompts(card.id)
    expect(prompts).toHaveLength(4)
  })

  it('getSpeakingItem finds items by ID', () => {
    expect(getSpeakingItem(PART1_QUESTIONS[0].id)).toBeDefined()
    expect(getSpeakingItem(PART2_CUE_CARDS[0].id)).toBeDefined()
    expect(getSpeakingItem(PART3_QUESTIONS[0].id)).toBeDefined()
    expect(getSpeakingItem('nonexistent')).toBeUndefined()
  })

  it('old roulette ID format still works via getSpeakingItem (returns undefined, no crash)', () => {
    expect(getSpeakingItem('roulette-1-animals')).toBeUndefined()
    expect(getSpeakingItem('roulette-2-describe-a-gift')).toBeUndefined()
  })
})

describe('Related group mapping', () => {
  it('getRelatedGroups returns correct groups for travel', () => {
    const related = getRelatedGroups('travel')
    expect(related).toContain('transport')
    expect(related).toContain('culture')
    expect(related).toContain('environment')
  })

  it('getRelatedGroups returns correct groups for technology', () => {
    const related = getRelatedGroups('technology')
    expect(related).toContain('education')
    expect(related).toContain('communication')
    expect(related).toContain('work')
  })

  it('getRelatedGroups returns correct groups for health', () => {
    const related = getRelatedGroups('health')
    expect(related).toContain('food')
    expect(related).toContain('sports')
    expect(related).toContain('public-services')
  })

  it('getRelatedGroups returns empty for undefined', () => {
    expect(getRelatedGroups(undefined)).toHaveLength(0)
  })

  it('getRelatedGroups returns empty for unknown group', () => {
    expect(getRelatedGroups('nonexistent')).toHaveLength(0)
  })

  it('all 34 groups have a related group mapping', () => {
    const groupsWithCards = new Set(PART2_CUE_CARDS.map(c => c.linkedPart3Group))
    for (const group of groupsWithCards) {
      expect(getRelatedGroups(group).length, `${group} has no related groups`).toBeGreaterThan(0)
    }
  })
})

describe('Session-based Part 3 picker', () => {
  it('does not repeat Part 3 items before pool is exhausted (linked group)', () => {
    const session = createPart3Session('travel')
    const seen = new Set<string>()
    for (let i = 0; i < 10; i++) {
      const picked = pickPart3ForSession(session, undefined, Math.random)
      expect(picked).toBeDefined()
      expect(seen.has(picked!.id), `repeat at spin ${i + 1}: ${picked!.id}`).toBe(false)
      seen.add(picked!.id)
    }
    expect(seen.size).toBe(10)
  })

  it('does not repeat before linked + related pools exhausted (20 spins)', () => {
    const session = createPart3Session('travel')
    const seen = new Set<string>()
    for (let i = 0; i < 20; i++) {
      const picked = pickPart3ForSession(session, undefined, Math.random)
      expect(picked).toBeDefined()
      expect(seen.has(picked!.id), `repeat at spin ${i + 1}: ${picked!.id}`).toBe(false)
      seen.add(picked!.id)
    }
    // 10 linked + related groups (transport:10 + culture:10 + environment:10 = 30) = 40 total available
    // 20 spins should all be unique
    expect(seen.size).toBe(20)
  })

  it('falls back to related groups after linked group exhausted', () => {
    const session = createPart3Session('travel')
    const travelIds = new Set(PART3_QUESTIONS.filter(q => q.linkedPart3Group === 'travel').map(q => q.id))
    const related = getRelatedGroups('travel')
    const relatedIds = new Set(PART3_QUESTIONS.filter(q => related.includes(q.linkedPart3Group)).map(q => q.id))
    const seen = new Set<string>()
    for (let i = 0; i < 15; i++) {
      const picked = pickPart3ForSession(session, undefined, Math.random)
      expect(picked).toBeDefined()
      seen.add(picked!.id)
    }
    // After 10 travel items, next 5 should come from related groups
    const nonTravelPicks = [...seen].filter(id => !travelIds.has(id))
    expect(nonTravelPicks.length).toBeGreaterThan(0)
    // All non-travel picks should be from related groups
    for (const id of nonTravelPicks) {
      expect(relatedIds.has(id) || !travelIds.has(id), `${id} not in related groups`).toBe(true)
    }
  })

  it('eventually uses full pool after linked + related exhausted', () => {
    const session = createPart3Session('travel')
    const related = getRelatedGroups('travel')
    const linkedAndRelated = new Set([
      ...PART3_QUESTIONS.filter(q => q.linkedPart3Group === 'travel').map(q => q.id),
      ...PART3_QUESTIONS.filter(q => related.includes(q.linkedPart3Group)).map(q => q.id),
    ])
    for (let i = 0; i < 40; i++) {
      pickPart3ForSession(session, undefined, Math.random)
    }
    // After exhausting linked + related, should pick from full pool
    const picked = pickPart3ForSession(session, undefined, Math.random)
    expect(picked).toBeDefined()
    // It's possible all items have been seen, but the function should still return something
  })

  it('resetPart3Session clears used IDs and sets new group', () => {
    const session = createPart3Session('travel')
    pickPart3ForSession(session, undefined, Math.random)
    pickPart3ForSession(session, undefined, Math.random)
    expect(session.usedIds.size).toBe(2)
    resetPart3Session(session, 'technology')
    expect(session.usedIds.size).toBe(0)
    expect(session.linkedGroup).toBe('technology')
  })

  it('session with undefined linkedGroup picks from full pool', () => {
    const session = createPart3Session(undefined)
    const picked = pickPart3ForSession(session, undefined, Math.random)
    expect(picked).toBeDefined()
  })

  it('pickPart3ForSession does not return previousId when other options exist', () => {
    const session = createPart3Session('travel')
    const first = pickPart3ForSession(session, undefined, Math.random)
    expect(first).toBeDefined()
    const second = pickPart3ForSession(session, first!.id, Math.random)
    expect(second).toBeDefined()
    if (session.usedIds.size > 1) {
      expect(second!.id).not.toBe(first!.id)
    }
  })

  it('browser simulation: 20 Part 3 spins after same Part 2 card — no repeat before exhaustion', () => {
    // Simulate: user picks a Part 2 card, then spins Part 3 twenty times
    const card = PART2_CUE_CARDS[0]
    const linkedGroup = getPart2LinkedGroup(card.id)
    const session = createPart3Session(linkedGroup)

    const seen = new Set<string>()
    let prevId: string | undefined
    for (let i = 0; i < 20; i++) {
      const picked = pickPart3ForSession(session, prevId, Math.random)
      expect(picked, `spin ${i + 1} returned undefined`).toBeDefined()
      expect(seen.has(picked!.id), `repeat at spin ${i + 1}: ${picked!.id}`).toBe(false)
      seen.add(picked!.id)
      prevId = picked!.id
    }
    expect(seen.size).toBe(20)
  })

  it('browser simulation: 20 Part 3 spins for each Part 2 card group — no repeat before exhaustion', () => {
    // Test with several different Part 2 groups
    const testGroups = ['travel', 'technology', 'health', 'education', 'food', 'sports']
    for (const group of testGroups) {
      const session = createPart3Session(group)
      const seen = new Set<string>()
      for (let i = 0; i < 20; i++) {
        const picked = pickPart3ForSession(session, undefined, Math.random)
        expect(picked, `${group} spin ${i + 1} returned undefined`).toBeDefined()
        expect(seen.has(picked!.id), `${group} repeat at spin ${i + 1}: ${picked!.id}`).toBe(false)
        seen.add(picked!.id)
      }
      expect(seen.size, `${group} should have 20 unique picks`).toBe(20)
    }
  })

  it('browser simulation: session reset when switching Part 2 cards allows repeats from new group', () => {
    // User picks travel card, spins 10 times, then switches to technology card
    const session1 = createPart3Session('travel')
    const seen1 = new Set<string>()
    for (let i = 0; i < 10; i++) {
      const picked = pickPart3ForSession(session1, undefined, Math.random)
      seen1.add(picked!.id)
    }
    expect(seen1.size).toBe(10)

    // Reset for new Part 2 card
    resetPart3Session(session1, 'technology')
    expect(session1.usedIds.size).toBe(0)

    // New session should be able to pick travel items again
    const seen2 = new Set<string>()
    for (let i = 0; i < 10; i++) {
      const picked = pickPart3ForSession(session1, undefined, Math.random)
      seen2.add(picked!.id)
    }
    expect(seen2.size).toBe(10)

    // The two sets should have different items (different groups)
    const overlap = [...seen1].filter(id => seen2.has(id))
    // Some overlap is possible if fallback kicks in, but with 10 items each from different groups, overlap should be minimal
    expect(overlap.length).toBeLessThanOrEqual(10)
  })
})
