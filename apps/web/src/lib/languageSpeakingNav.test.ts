import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Speaking AI navigation translation', () => {
  it('defines the navigation label instead of rendering the raw i18n key', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/lib/language.tsx'), 'utf8')
    expect(source).toContain("'nav.speakingAi': 'Speaking AI'")
  })
})
