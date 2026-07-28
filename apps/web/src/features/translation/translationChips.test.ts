import { describe, expect, it } from 'vitest'
import {
  getChipMatchStates,
  isTypingPrefix,
  parseTranslationChips,
  wordsMatchExact,
} from './translationChips'

describe('translationChips: đúng xanh · sai đỏ', () => {
  const chips = parseTranslationChips('She teaches maths at a primary school.')

  it('parses 7 word chips', () => {
    expect(chips.map(c => c.words[0])).toEqual([
      'she', 'teaches', 'maths', 'at', 'a', 'primary', 'school',
    ])
  })

  it('primery → chip primary đỏ, không xanh, giữ typedAt', () => {
    const { unlocked, wrong, typedAt } = getChipMatchStates(
      'She teaches maths at a primery',
      chips,
    )
    expect(unlocked).toEqual([true, true, true, true, true, false, false])
    expect(wrong[5]).toBe(true)
    expect(wrong[6]).toBe(false)
    expect(typedAt[5]).toBe('primery')
  })

  it('câu đúng hết → toàn xanh, không đỏ', () => {
    const { unlocked, wrong } = getChipMatchStates(
      'She teaches maths at a primary school',
      chips,
    )
    expect(unlocked.every(Boolean)).toBe(true)
    expect(wrong.every(w => !w)).toBe(true)
  })

  it('mỗi vị trí độc lập: sai + đúng lẫn nhau', () => {
    // He≠She (đỏ), teaches đúng (xanh), … primery≠primary (đỏ), school đúng (xanh)
    const { unlocked, wrong } = getChipMatchStates(
      'He teaches maths at a primery school',
      chips,
    )
    expect(unlocked[0]).toBe(false)
    expect(wrong[0]).toBe(true)
    expect(unlocked[1]).toBe(true)
    expect(wrong[1]).toBe(false)
    expect(unlocked[5]).toBe(false)
    expect(wrong[5]).toBe(true)
    expect(unlocked[6]).toBe(true)
    expect(wrong[6]).toBe(false)
  })

  it('prefix đang gõ → chưa đỏ / chưa xanh', () => {
    const { unlocked, wrong } = getChipMatchStates(
      'She teaches maths at a primar',
      chips,
    )
    expect(unlocked[5]).toBe(false)
    expect(wrong[5]).toBe(false)
    expect(isTypingPrefix('primar', 'primary')).toBe(true)
  })

  it('exact only — không fuzzy 1 ký tự', () => {
    expect(wordsMatchExact('she', 'she')).toBe(true)
    expect(wordsMatchExact('primery', 'primary')).toBe(false)
  })
})
