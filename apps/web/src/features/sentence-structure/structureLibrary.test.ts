import { describe, expect, it } from 'vitest'
import type { SentenceStructure } from '@ryan/db'
import { countStatuses, filterStructures, getLearningStatus, uniqueStructures } from './structureLibrary'

function structure(overrides: Partial<SentenceStructure> = {}): SentenceStructure {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: 'Used to',
    template: 'S + used to + V',
    description: 'Past habit',
    category: 'comparison',
    exampleA: 'I played.',
    exampleB: 'I used to play.',
    exampleNoteVi: 'Thói quen trong quá khứ',
    cefr: 'B1',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }
}

const emptyFilters = { query: '', cefr: undefined, category: '', status: '', savedOnly: false } as const

describe('sentence structure library logic', () => {
  it('treats legacy records without status as not started', () => {
    expect(getLearningStatus(structure())).toBe('not_started')
  })

  it('combines search, CEFR, category, status, and saved view', () => {
    const target = structure({ starred: true, learningStatus: 'learning' })
    const wrongStatus = structure({ id: 'wrong-status', template: 'S + would + V', starred: true, learningStatus: 'learned' })
    const wrongLevel = structure({ id: 'wrong-level', template: 'S + be used to + V-ing', starred: true, learningStatus: 'learning', cefr: 'B2' })

    expect(filterStructures([target, wrongStatus, wrongLevel], {
      query: 'past habit',
      cefr: 'B1',
      category: 'So sánh',
      status: 'learning',
      savedOnly: true,
    })).toEqual([target])
  })

  it('dedupes before calculating saved status counts', () => {
    const catalog = structure({ id: 'catalog:ss:used-to', starred: true, learningStatus: 'learned', updatedAt: 1 })
    const duplicate = structure({ id: 'legacy-copy', starred: false, learningStatus: 'learning', updatedAt: 2 })
    const learning = structure({ id: 'learning', template: 'S + tend to + V', starred: true, learningStatus: 'learning' })
    const legacy = structure({ id: 'legacy', template: 'S + rarely + V', starred: true })
    const unique = uniqueStructures([duplicate, catalog, learning, legacy])
    const saved = filterStructures(unique, { ...emptyFilters, savedOnly: true })

    expect(unique).toHaveLength(3)
    expect(countStatuses(saved)).toEqual({ total: 3, not_started: 1, learning: 1, learned: 1 })
  })
})
