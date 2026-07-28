import { describe, expect, it } from 'vitest'
import { shouldShowFullExamCatalog } from './examCatalogVisibility'

describe('exam catalog visibility', () => {
  it('keeps the complete catalog for an authenticated route session', () => {
    expect(shouldShowFullExamCatalog(true, 'free')).toBe(true)
  })

  it('keeps anonymous Free access restricted to demo filtering', () => {
    expect(shouldShowFullExamCatalog(false, 'free')).toBe(false)
  })

  it('keeps full catalog metadata for entitled plans', () => {
    expect(shouldShowFullExamCatalog(false, 'pro')).toBe(true)
    expect(shouldShowFullExamCatalog(false, 'lifetime')).toBe(true)
  })
})
