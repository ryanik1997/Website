import { render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CardPanel from './CardPanel'

let liveQueryCall = 0

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => {
    liveQueryCall += 1
    if (liveQueryCall === 1) return { id: 'deck-1', name: 'Test deck' }
    if (liveQueryCall === 2) return []
    return new Map()
  }),
}))

vi.mock('@ryan/db', () => ({
  db: {},
  cardRepo: {},
}))

vi.mock('./vocabStore', () => ({
  useVocabStore: () => ({
    activeDeckId: 'deck-1',
    startStudy: vi.fn(),
    unitKind: 'single',
  }),
}))

vi.mock('../../lib/language', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('./CardEditorModal', () => ({ default: () => null }))
vi.mock('./DeckEditorModal', () => ({ default: () => null }))
vi.mock('./ImportModal', () => ({ default: () => null }))

describe('Vocabulary grid surfaces', () => {
  beforeEach(() => {
    liveQueryCall = 0
  })

  it('marks its full-height surface so the AppShell grid can remain visible', () => {
    const { container } = render(<CardPanel />)

    expect(container.firstElementChild).toHaveClass('vocab-card-panel')
  })

  it('has a grid-mode override that removes the full-height panel background', () => {
    const css = readFileSync(
      resolve(process.cwd(), 'src/pages/appShellBackdrop.css'),
      'utf8',
    )

    expect(css).toMatch(
      /\.app-shell--grid\s+\.vocab-card-panel\s*\{[^}]*background:\s*transparent\s*!important;/s,
    )
  })

  it('gives every study mode an opaque grid surface that hides the deck table', () => {
    const css = readFileSync(
      resolve(process.cwd(), 'src/pages/appShellBackdrop.css'),
      'utf8',
    )
    const rule = css.match(
      /\.app-shell--grid\s+\.vocab-study-shell\s*\{([^}]*)\}/s,
    )?.[1]

    expect(rule).toContain('var(--reading-corner-bg)')
    expect(rule).toContain('var(--reading-corner-grid-line)')
    expect(rule).toMatch(/background-size:\s*32px 32px\s*!important;/)
    expect(rule).not.toMatch(/background:\s*transparent/)
  })
})
