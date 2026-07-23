import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/features/vocab/study/vocabStudy.css'), 'utf8')
const srs = readFileSync(resolve(process.cwd(), 'src/features/vocab/modes/SrsMode.tsx'), 'utf8')
const paperCss = readFileSync(resolve(process.cwd(), 'src/features/vocab/study/vocabStudyPaper.css'), 'utf8')

describe('SRS fade-reveal card', () => {
  it('uses theme tokens and a smooth background transition instead of a 3D rotation', () => {
    expect(css).toContain('background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)')
    expect(css).toContain('background-color: color-mix(in srgb, var(--color-success) 15%, transparent)')
    expect(css).toContain('transition: background-color 360ms ease-out')
    expect(css).toContain('opacity: 0')
    expect(css).toContain('.vs-fade-phonetic')
    expect(css).toContain('70ms')
    expect(css).toContain('140ms')
    expect(paperCss).toMatch(/\.vocab-study-shell \.vs-flip-scene\s*\{[^}]*background:\s*transparent/s)
    expect(paperCss).toContain('.vocab-study-shell .vs-quiz-card')
    expect(paperCss).toContain('.vocab-study-shell .vs-game-card')
    expect(paperCss).toContain('.vocab-study-shell .vs-lt-practice')
    expect(paperCss).toContain('.vocab-study-shell .vs-speaking-card')
  })

  it('renders the original word, phonetic and translation in the revealed layer', () => {
    expect(srs).toContain('vs-fade-word')
    expect(srs).toContain('vs-fade-phonetic')
    expect(srs).toContain('vs-card-meaning')
    expect(srs).toContain('is-flipped')
    expect(srs).toContain("disabled={!flipped || cardTransition !== 'idle'}")
    expect(srs).toContain('vs-rating-row${flipped')
    expect(css).toContain('position: sticky')
    expect(css).toContain('.vs-rating-row.is-locked')
    expect(css).toContain('@keyframes vs-card-pass-out')
    expect(css).toContain('@keyframes vs-card-pass-in')
    expect(css).toContain('transform: translateX(-12%)')
    expect(css).toContain('transform: translateX(12%)')
    expect(srs).toContain("cardTransition === 'exit'")
    expect(srs).toContain("cardTransition === 'enter'")
    expect(srs).toContain('nextRetryAt')
    expect(srs).toContain("void load('due')")
    expect(srs).toContain("studyFilter === 'review'")
    expect(srs).toContain('isSrsReviewDue(s)')
  })
})
