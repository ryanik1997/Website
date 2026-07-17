import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  resolve(process.cwd(), 'src/features/vocab/study/vocabStudy.css'),
  'utf8',
)

describe('SRS flip card compositing', () => {
  it('keeps the inactive face fully hidden on translucent dark themes', () => {
    const innerRule = css.match(/\.vs-flip-inner\s*\{([^}]*)\}/s)?.[1] ?? ''
    const faceRule = css.match(/\.vs-flip-face\s*\{([^}]*)\}/s)?.[1] ?? ''

    expect(innerRule).toContain('transform-style: preserve-3d')
    expect(innerRule).not.toContain('isolation:')
    expect(faceRule).toContain('background-color: var(--bg-card)')
    expect(faceRule).toContain('background-image: var(--vs-flashcard-bg)')
    expect(faceRule).toContain('backdrop-filter: none')
    expect(css).toMatch(/\.vs-flip-face-back\s*\{[^}]*visibility:\s*hidden/s)
    expect(css).toMatch(
      /\.vs-flip-inner\.is-flipped\s+\.vs-flip-face-front\s*\{[^}]*visibility:\s*hidden/s,
    )
    expect(css).toMatch(
      /\.vs-flip-inner\.is-flipped\s+\.vs-flip-face-back\s*\{[^}]*visibility:\s*visible/s,
    )
  })
})
