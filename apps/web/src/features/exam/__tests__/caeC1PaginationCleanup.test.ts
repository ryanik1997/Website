import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../../../../..')
const CATALOG_DIR = path.join(ROOT, 'apps', 'web', 'public', 'catalog', 'exams', 'reading')

const PAGINATION_LINE_PATTERN = /^Pages?\s*:\s*(?:\d+\s*){2,}$/i
const TRAILING_PAGINATION_RE = /\s*Pages?\s*:\s*(?:\d+\s*){2,}$/i

function isPaginationArtifact(value: string): boolean {
  const normalized = value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  return PAGINATION_LINE_PATTERN.test(normalized)
}

function hasTrailingPagination(value: string): boolean {
  if (typeof value !== 'string' || value.length === 0) return false
  return TRAILING_PAGINATION_RE.test(value.replace(/\u00a0/g, ' '))
}

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown
}

function findCaeTestFiles(): Array<{ fileName: string; filePath: string; testNumber: number }> {
  return fs
    .readdirSync(CATALOG_DIR)
    .filter(f => /^catalog-reading-cae-c1-test\d+\.json$/.test(f))
    .map(f => ({
      fileName: f,
      filePath: path.join(CATALOG_DIR, f),
      testNumber: Number(f.match(/test(\d+)/)?.[1] ?? 0),
    }))
    .sort((a, b) => a.testNumber - b.testNumber)
}

function findCaeAnswerFiles(): Array<{ fileName: string; filePath: string; testNumber: number }> {
  return fs
    .readdirSync(CATALOG_DIR)
    .filter(f => /^catalog-reading-cae-c1-test\d+\.answers\.json$/.test(f))
    .map(f => ({
      fileName: f,
      filePath: path.join(CATALOG_DIR, f),
      testNumber: Number(f.match(/test(\d+)/)?.[1] ?? 0),
    }))
    .sort((a, b) => a.testNumber - b.testNumber)
}

interface ExamPart {
  id: string
  partNumber: number
  passage: Array<{ text?: string; label?: string }>
  questionGroups: Array<{
    questions: Array<{ id: string; number: number }>
  }>
}

interface ExamBody {
  id: string
  parts: ExamPart[]
}

describe('CAE C1 Reading pagination cleanup — structural integrity', () => {
  const testFiles = findCaeTestFiles()
  const answerFiles = findCaeAnswerFiles()

  it('finds all 24 CAE C1 test files', () => {
    expect(testFiles.length).toBe(24)
    expect(testFiles[0].testNumber).toBe(1)
    expect(testFiles[testFiles.length - 1].testNumber).toBe(24)
  })

  it('finds all 24 CAE C1 answer files', () => {
    expect(answerFiles.length).toBe(24)
  })

  for (const entry of testFiles) {
    describe(`${entry.fileName}`, () => {
      const exam = readJson(entry.filePath) as ExamBody

      it('has parts array', () => {
        expect(exam.parts.length).toBeGreaterThan(0)
      })

      for (const part of exam.parts) {
        if (part.partNumber < 1 || part.partNumber > 3) continue

        it(`Part ${part.partNumber} has no pagination artifacts in passage`, () => {
          for (const block of part.passage ?? []) {
            const text = typeof block.text === 'string' ? block.text : ''
            expect(isPaginationArtifact(text)).toBe(false)
          }
        })

        it(`Part ${part.partNumber} question IDs are intact`, () => {
          const questions = part.questionGroups?.[0]?.questions ?? []
          expect(questions.length).toBeGreaterThan(0)
          for (const q of questions) {
            expect(typeof q.id).toBe('string')
            expect(q.id).toContain(`part-${part.partNumber}`)
          }
        })
      }

      // Parts 4+ must be unchanged (still have their original structure)
      for (const part of exam.parts) {
        if (part.partNumber < 4) continue
        it(`Part ${part.partNumber} still has passage blocks`, () => {
          expect(part.passage?.length ?? 0).toBeGreaterThan(0)
        })
      }
    })
  }

  for (const entry of answerFiles) {
    describe(`${entry.fileName}`, () => {
      const vault = readJson(entry.filePath) as {
        answers: Record<string, { explanation?: string }>
      }

      it('has no trailing pagination in any explanation', () => {
        for (const [key, val] of Object.entries(vault.answers ?? {})) {
          const explanation = val?.explanation
          if (typeof explanation === 'string') {
            expect(hasTrailingPagination(explanation)).toBe(false)
          }
        }
      })

      it('answer count is unchanged (56 for standard tests, 58 for test1, 0 for pending)', () => {
        const count = Object.keys(vault.answers ?? {}).length
        // test1 has 10 parts (58 answers); test24 has pending answer key (0)
        expect(count === 56 || count === 58 || count === 0).toBe(true)
      })
    })
  }
})
