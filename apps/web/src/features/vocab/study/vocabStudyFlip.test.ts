import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  resolve(process.cwd(), 'src/features/vocab/study/vocabStudy.css'),
  'utf8',
)
const paperCss = readFileSync(
  resolve(process.cwd(), 'src/features/vocab/study/vocabStudyPaper.css'),
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

describe('SRS lesson-paper card', () => {
  it('gives the 3D card its own flat paper surface and hard shadow', () => {
    const cardRule = paperCss.match(/\.vocab-study-shell \.vs-flip-scene\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(cardRule).toContain('background: var(--vs-paper-card)')
    expect(cardRule).toContain('border: 2px solid var(--vs-paper-border)')
    expect(cardRule).toContain('box-shadow: 5px 5px 0 var(--vs-paper-shadow)')
  })

  it('keeps the front face typography readable on the light paper surface', () => {
    const frontTextRule = paperCss.match(/\.vocab-study-shell \.vs-flip-face-front \.vs-card-word\s*\{([^}]*)\}/s)?.[1] ?? ''
    const frontBadgeRule = paperCss.match(/\.vocab-study-shell \.vs-flip-face-front \.vs-tag-topic,\s*\n\.vocab-study-shell \.vs-flip-face-front \.vs-tag-due,\s*\n\.vocab-study-shell \.vs-flip-face-front \.vs-tag-reviewed\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(frontTextRule).toContain('color: var(--text-primary)')
    expect(frontBadgeRule).toContain('color: var(--text-primary)')
    expect(frontBadgeRule).toContain('border-color: var(--text-primary)')
  })
})
