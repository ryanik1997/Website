import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// @ts-expect-error Node ESM helper is intentionally imported from scripts/
import { validateReadingRuntime } from '../../../../../../scripts/validate-catalog-runtime.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../../../../..')

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown
}

describe('catalog runtime validation', () => {
  it('keeps FCE B2 tests 2 and 26 in meta and runtime outputs', () => {
    const meta = readJson(path.join(ROOT, 'packages/catalog/data/catalog-reading-meta.json')) as Array<{ id: string }>
    const ids = new Set(meta.map(item => item.id))
    expect(ids.has('catalog-reading-fce-b2-test2')).toBe(true)
    expect(ids.has('catalog-reading-fce-b2-test26')).toBe(true)

    const body2 = readJson(path.join(ROOT, 'apps/web/public/catalog/exams/reading/catalog-reading-fce-b2-test2.json')) as { id: string; parts: Array<unknown>; examTrack?: string; cambridgeLevel?: string }
    const body26 = readJson(path.join(ROOT, 'apps/web/public/catalog/exams/reading/catalog-reading-fce-b2-test26.json')) as { id: string; parts: Array<unknown>; examTrack?: string; cambridgeLevel?: string }

    expect(body2.id).toBe('catalog-reading-fce-b2-test2')
    expect(body2.parts).toHaveLength(7)
    expect(body2.examTrack).toBe('cambridge')
    expect(body2.cambridgeLevel).toBe('b2')

    expect(body26.id).toBe('catalog-reading-fce-b2-test26')
    expect(body26.parts).toHaveLength(7)
    expect(body26.examTrack).toBe('cambridge')
    expect(body26.cambridgeLevel).toBe('b2')

    const result = validateReadingRuntime()
    expect(result.manifestCount).toBeGreaterThanOrEqual(26)
    expect(result.metaCount).toBeGreaterThanOrEqual(26)
    expect(result.bodyCount).toBeGreaterThanOrEqual(26)
    expect(result.answerVaultCount).toBeGreaterThanOrEqual(26)
  })
})
