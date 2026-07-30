import { describe, expect, it } from 'vitest'
import { splitReferenceText, resolveReferenceParts } from '../readingB1ReferenceList'
import type { ReadingPassageBlock } from '../examData'

/**
 * §2 RUNTIME-CONTRACT TEST — delimiter-as-data-model.
 *
 * The PET B1 Part 2 compiler packs each option into a single
 * `ReadingPassageBlock.text` string shaped "Title — Description" because the
 * runtime schema only has one required `text: string` field. The renderer then
 * recovers the short title via splitReferenceText(). This test pins down that
 * contract so a future schema change or regex edit cannot silently break the
 * title/description boundary.
 *
 * TECHNICAL DEBT: prefer explicit { title, description } fields end-to-end.
 * See the guard note in scripts/reading/pet-b1/compile/compile-exam.mjs.
 */
describe('splitReferenceText — delimiter contract', () => {
  it('splits "Title — Description" at the em-dash into { title, body }', () => {
    const result = splitReferenceText('Beckfield Market — A covered market with fresh produce.', true)
    expect(result.title).toBe('Beckfield Market')
    expect(result.body).toBe('A covered market with fresh produce.')
  })

  it('splits on en-dash too', () => {
    const result = splitReferenceText('Beckfield Market – A covered market.', true)
    expect(result.title).toBe('Beckfield Market')
    expect(result.body).toBe('A covered market.')
  })

  it('splits on a spaced hyphen', () => {
    const result = splitReferenceText('Beckfield Market - A covered market.', true)
    expect(result.title).toBe('Beckfield Market')
    expect(result.body).toBe('A covered market.')
  })

  it('keeps a later em-dash inside the body (first boundary wins)', () => {
    const result = splitReferenceText('Weekend Course — Bring your own kit — tools are limited.', true)
    expect(result.title).toBe('Weekend Course')
    expect(result.body).toBe('Bring your own kit — tools are limited.')
  })

  it('returns only { body } when there is no delimiter (legacy text)', () => {
    const result = splitReferenceText('A covered market with fresh produce every day.', true)
    expect(result.title).toBeUndefined()
    expect(result.body).toBe('A covered market with fresh produce every day.')
  })

  it('does not split a hyphen that is not followed by whitespace', () => {
    // "under-fourteens" must NOT be treated as a title boundary.
    const result = splitReferenceText('After-school drama club for under-fourteens.', true)
    expect(result.title).toBeUndefined()
    expect(result.body).toBe('After-school drama club for under-fourteens.')
  })

  it('withTitle=false returns the whole text as body', () => {
    const result = splitReferenceText('Beckfield Market — A covered market.', false)
    expect(result.title).toBeUndefined()
    expect(result.body).toBe('Beckfield Market — A covered market.')
  })

  it('handles undefined and empty input without throwing', () => {
    expect(splitReferenceText(undefined, true)).toEqual({ body: '' })
    expect(splitReferenceText('', true)).toEqual({ body: '' })
    expect(splitReferenceText('   ', true)).toEqual({ body: '' })
  })

  it('round-trips the exact compiler output format "Title — Description"', () => {
    // Mirror of compilePart2(): `${o.title} \u2014 ${desc}`
    const title = 'Evening life drawing at the community studio'
    const description = 'People who enjoy working after work gather every Thursday.'
    const packed = `${title} \u2014 ${description}`
    const result = splitReferenceText(packed, true)
    expect(result.title).toBe(title)
    expect(result.body).toBe(description)
  })
})

describe('resolveReferenceParts — Part 2 block contract', () => {
  it('extracts letter, title and body from a labeled market block', () => {
    const block: ReadingPassageBlock = { label: 'A', text: 'Beckfield Market — A covered market.' }
    const result = resolveReferenceParts(block, 0, true)
    expect(result.letter).toBe('A')
    expect(result.title).toBe('Beckfield Market')
    expect(result.body).toBe('A covered market.')
  })

  it('falls back to the label as title when text has no delimiter', () => {
    const block: ReadingPassageBlock = { label: 'City Market', text: 'A covered market with produce.' }
    const result = resolveReferenceParts(block, 0, true)
    // Non-letter label is promoted to title when the text has no delimiter.
    expect(result.title).toBe('City Market')
    expect(result.body).toBe('A covered market with produce.')
  })
})
