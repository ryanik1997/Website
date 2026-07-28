import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ReadingExam } from '../examData'
import { fillMissingReadingMediaFromFallback } from '../fillReadingExamMedia'
// @ts-ignore Node ESM helper is intentionally imported from scripts.
import { validateReadingRuntime } from '../../../../../../scripts/validate-catalog-runtime.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../../../../..')

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown
}

describe('catalog runtime validation', () => {
  it('keeps all 27 FCE B2 tests aligned across meta, runtime, and answer vaults', () => {
    const meta = readJson(path.join(ROOT, 'packages/catalog/data/catalog-reading-meta.json')) as Array<{ id: string }>
    const ids = new Set(meta.map(item => item.id).filter(id => id.startsWith('catalog-reading-fce-b2-')))
    expect(ids.size).toBe(27)
    expect(ids.has('catalog-reading-fce-b2-test1')).toBe(true)
    expect(ids.has('catalog-reading-fce-b2-test2')).toBe(true)
    expect(ids.has('catalog-reading-fce-b2-test10')).toBe(true)
    expect(ids.has('catalog-reading-fce-b2-test27')).toBe(true)

    const body2 = readJson(path.join(ROOT, 'apps/web/public/catalog/exams/reading/catalog-reading-fce-b2-test2.json')) as {
      id: string
      parts: Array<{
        id: string
        partNumber: number
        questionGroups: Array<{
          id: string
          questions: Array<{ id: string }>
        }>
      }>
      examTrack?: string
      cambridgeLevel?: string
    }
    const body10 = readJson(path.join(ROOT, 'apps/web/public/catalog/exams/reading/catalog-reading-fce-b2-test10.json')) as typeof body2
    const body27 = readJson(path.join(ROOT, 'apps/web/public/catalog/exams/reading/catalog-reading-fce-b2-test27.json')) as typeof body2
    const vault10 = readJson(path.join(ROOT, 'apps/web/public/catalog/exams/reading/catalog-reading-fce-b2-test10.answers.json')) as {
      examId: string
      answers: Record<string, unknown>
    }

    for (const body of [body2, body10, body27]) {
      expect(body.parts).toHaveLength(7)
      expect(body.examTrack).toBe('cambridge')
      expect(body.cambridgeLevel).toBe('b2')
      expect(body.parts.flatMap(part => part.questionGroups).every(group => group.id.startsWith(`${body.id}-part-`))).toBe(true)
      expect(body.parts.flatMap(part => part.questionGroups).every(group => group.questions.every(question => question.id.startsWith(`${body.id}-part-`)))).toBe(true)
      expect(body.parts.flatMap(part => part.questionGroups).flatMap(group => group.questions)).toHaveLength(52)
      expect(body.parts.map(part => part.id)).toEqual(body.parts.map(part => `${body.id}-part-${part.partNumber}`))
    }

    expect(vault10.examId).toBe(body10.id)
    expect(Object.keys(vault10.answers)).toHaveLength(52)
    expect(Object.keys(vault10.answers).every(id => body10.parts.flatMap(part => part.questionGroups).some(group => group.questions.some(question => question.id === id)))).toBe(true)

    const result = validateReadingRuntime()
    expect(result.manifestCount).toBe(27)
    expect(result.metaCount).toBe(27)
    expect(result.bodyCount).toBe(27)
    expect(result.answerVaultCount).toBe(27)
  })

  it('restores every Part 7 section in all 26 FCE catalog exams', () => {
    for (let testNumber = 2; testNumber <= 27; testNumber += 1) {
      const catalog = readJson(
        path.join(ROOT, `apps/web/public/catalog/exams/reading/catalog-reading-fce-b2-test${testNumber}.json`),
      ) as ReadingExam
      const catalogPart7 = catalog.parts.find(part => part.partNumber === 7)
      expect(catalogPart7, `Test ${testNumber} catalog Part 7`).toBeDefined()

      const local = structuredClone(catalog)
      const localPart7 = local.parts.find(part => part.partNumber === 7)
      localPart7!.passage = localPart7!.passage.slice(0, 1)

      const restored = fillMissingReadingMediaFromFallback(local, catalog)
      const restoredPart7 = restored.parts.find(part => part.partNumber === 7)

      expect(restoredPart7?.passage, `Test ${testNumber} restored sections`).toHaveLength(
        catalogPart7!.passage.length,
      )
      expect(restoredPart7?.passage.map(block => block.label)).toEqual(
        catalogPart7!.passage.map(block => block.label),
      )
      expect(restoredPart7?.passage.every(block => Boolean(block.text.trim()))).toBe(true)
    }
  })
})
