import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/styles/globals.css'), 'utf8')
const TOKENS = [
  'reading-corner-bg',
  'reading-corner-grid-line',
  'reading-ribbon-soft',
  'reading-ribbon-mid',
  'reading-ribbon-core',
]

function themeBlock(theme: 'mid' | 'dark'): string {
  return css.match(new RegExp(`\\[data-theme="${theme}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? ''
}

describe('shared ribbon backdrop theme tokens', () => {
  it.each(['mid', 'dark'] as const)('defines a complete %s palette', theme => {
    const block = themeBlock(theme)
    for (const token of TOKENS) {
      expect(block).toContain(`--${token}:`)
    }
  })
})
