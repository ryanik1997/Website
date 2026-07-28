import { describe, expect, it } from 'vitest'
import { translationSetsFromIeltsPack } from './importIeltsTranslationPack'
import packs from './seedData/ieltsTranslationPacks.json'

describe('translationSetsFromIeltsPack', () => {
  it('converts Present Continuous pack to grammar_basic / present_continuous', () => {
    const sets = packs.flatMap(p => translationSetsFromIeltsPack(p))
    expect(sets.length).toBeGreaterThanOrEqual(2)

    const cont = sets.find(s => s.genre === 'present_continuous')
    expect(cont).toBeTruthy()
    expect(cont!.category).toBe('grammar_basic')
    expect(cont!.sentences.length).toBe(25)
    expect(cont!.sentences[0]!.vi).toContain('tiếng Anh')
    expect(cont!.sentences[0]!.en.toLowerCase()).toContain('studying')

    const simple = sets.find(s => s.genre === 'present_simple')
    expect(simple).toBeTruthy()
    expect(simple!.category).toBe('grammar_basic')
    expect(simple!.sentences.length).toBeGreaterThanOrEqual(2)
  })

  it('uses stable ids', () => {
    const a = translationSetsFromIeltsPack(packs[0])
    const b = translationSetsFromIeltsPack(packs[0])
    expect(a.map(s => s.id)).toEqual(b.map(s => s.id))
    expect(a[0]!.id.startsWith('tr-import-')).toBe(true)
  })
})
