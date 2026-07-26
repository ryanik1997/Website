import { strToU8, zipSync } from 'fflate'
import { describe, expect, it, vi } from 'vitest'
import { __batchReadingZipImportTestUtils } from '../import/batchReadingZipImport'
import type { ReadingExam } from '../examData'

function makePetB1Body(overrides?: Partial<ReadingExam>): ReadingExam {
  const partCounts = [5, 5, 5, 5, 6, 6]
  let number = 1
  const parts = partCounts.map((count, partIndex) => {
    const start = number
    number += count
    return {
      id: `catalog-reading-pet-b1-test2-part-${partIndex + 1}`,
      partNumber: partIndex + 1,
      rangeLabel: `Questions ${start}-${start + count - 1}`,
      passageTitle: `Part ${partIndex + 1}`,
      passage: partIndex === 0
        ? Array.from({ length: count }, (_, index) => ({
          text: '',
          imageUrl: `/catalog/reading/pet-b1-test2/part1-q${index + 1}.jpg`,
        }))
        : [{ text: `Passage ${partIndex + 1}` }],
      questionGroups: [{
        id: `group-${partIndex + 1}`,
        range: `Questions ${start}-${start + count - 1}`,
        instruction: 'Answer the questions.',
        type: 'multiple-choice' as const,
        questions: Array.from({ length: count }, (_, idx) => ({
          id: `q${start + idx}`,
          number: start + idx,
          type: 'multiple-choice' as const,
          prompt: `Question ${start + idx}`,
          options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
          answer: '',
          explanation: '',
        })),
      }],
    }
  })
  return {
    id: 'catalog-reading-pet-b1-test2',
    title: 'PET B1 Test 2',
    durationMinutes: 45,
    bandHint: 'B1',
    examTrack: 'cambridge',
    cambridgeLevel: 'b1',
    parts,
    ...overrides,
  }
}

function makeAnswers(exam: ReadingExam, overrides?: Record<string, Record<string, unknown>>) {
  const answers: Record<string, Record<string, unknown>> = {}
  for (const part of exam.parts) {
    for (const group of part.questionGroups) {
      for (const question of group.questions) {
        answers[question.id] = {
          answer: 'a',
          explanation: `Explanation for ${question.id}`,
        }
      }
    }
  }
  return {
    examId: exam.id,
    version: 1,
    mode: 'answers-vault',
    answers: { ...answers, ...overrides },
  }
}

function makeMeta(exam: ReadingExam, questionCount: number) {
  return {
    id: exam.id,
    bodyPath: `/catalog/exams/reading/${exam.id}.json`,
    answersPath: `/catalog/exams/reading/${exam.id}.answers.json`,
    questionCount,
  }
}

function makeZipFile(
  name: string,
  exam: ReadingExam,
  answers = makeAnswers(exam),
  extra?: Record<string, string>,
  imageCount = 5,
) {
  const entries: Record<string, Uint8Array> = {
    [`pet-b1-test2-import/apps/web/public/catalog/exams/reading/${exam.id}.json`]: strToU8(JSON.stringify(exam)),
    [`pet-b1-test2-import/apps/web/public/catalog/exams/reading/${exam.id}.answers.json`]: strToU8(JSON.stringify(answers)),
    'pet-b1-test2-import/meta-entry-to-paste-into-catalog-reading-meta.json': strToU8(
      JSON.stringify(makeMeta(exam, 32)),
    ),
  }
  for (let i = 1; i <= imageCount; i += 1) {
    entries[`pet-b1-test2-import/apps/web/public/catalog/reading/pet-b1-test2/part1-q${i}.jpg`] = strToU8(`img-${i}`)
  }
  for (const [path, value] of Object.entries(extra ?? {})) {
    entries[path] = strToU8(value)
  }
  const bytes = zipSync(entries)
  return new File([bytes], name, { type: 'application/zip' })
}

describe('batchReadingZipImport', () => {
  it('valid zip imports success', async () => {
    const exam = makePetB1Body()
    const file = makeZipFile('test-2.zip', exam)
    const persistExam = vi.fn().mockResolvedValue(undefined)
    const putMedia = vi.fn().mockResolvedValue(undefined)

    const result = await __batchReadingZipImportTestUtils.importOneFile(file, {}, {
      getExistingExam: async () => undefined,
      persistExam,
      putMedia,
    })

    expect(result.status).toBe('success')
    expect(result.examId).toBe(exam.id)
    expect(persistExam).toHaveBeenCalledOnce()
    expect(putMedia).toHaveBeenCalledTimes(5)
  })

  it('multiple valid zips import success', async () => {
    const examA = makePetB1Body()
    const examB = makePetB1Body({ id: 'catalog-reading-pet-b1-test3', title: 'PET B1 Test 3' })
    const persistExam = vi.fn().mockResolvedValue(undefined)

    const results = await Promise.all([
      __batchReadingZipImportTestUtils.importOneFile(makeZipFile('a.zip', examA), {}, {
        getExistingExam: async () => undefined,
        persistExam,
        putMedia: async () => undefined,
      }),
      __batchReadingZipImportTestUtils.importOneFile(makeZipFile('b.zip', examB), {}, {
        getExistingExam: async () => undefined,
        persistExam,
        putMedia: async () => undefined,
      }),
    ])

    expect(results.map(result => result.status)).toEqual(['success', 'success'])
    expect(persistExam).toHaveBeenCalledTimes(2)
  })

  it('missing answers file fails', async () => {
    const exam = makePetB1Body()
    const zip = zipSync({
      [`x/${exam.id}.json`]: strToU8(JSON.stringify(exam)),
    })
    const result = await __batchReadingZipImportTestUtils.importOneFile(
      new File([zip], 'missing-answers.zip', { type: 'application/zip' }),
      {},
      {},
    )
    expect(result.status).toBe('failed')
  })

  it('missing body file fails', async () => {
    const exam = makePetB1Body()
    const answers = makeAnswers(exam)
    const zip = zipSync({
      [`x/${exam.id}.answers.json`]: strToU8(JSON.stringify(answers)),
    })
    const result = await __batchReadingZipImportTestUtils.importOneFile(
      new File([zip], 'missing-body.zip', { type: 'application/zip' }),
      {},
      {},
    )
    expect(result.status).toBe('failed')
  })

  it('question id missing answer fails', async () => {
    const exam = makePetB1Body()
    const answers = makeAnswers(exam)
    delete answers.answers.q1
    const result = await __batchReadingZipImportTestUtils.importOneFile(makeZipFile('missing-q1.zip', exam, answers), {}, {})
    expect(result.status).toBe('failed')
    expect(result.errors.some(error => error.includes('Thiếu answer'))).toBe(true)
  })

  it('extra answer key fails', async () => {
    const exam = makePetB1Body()
    const answers = makeAnswers(exam, {
      extra: { answer: 'a', explanation: 'extra' },
    })
    const result = await __batchReadingZipImportTestUtils.importOneFile(makeZipFile('extra-answer.zip', exam, answers), {}, {})
    expect(result.status).toBe('failed')
    expect(result.errors.some(error => error.includes('key dư'))).toBe(true)
  })

  it('duplicate exam skips by default', async () => {
    const exam = makePetB1Body()
    const result = await __batchReadingZipImportTestUtils.importOneFile(makeZipFile('dupe.zip', exam), {}, {
      getExistingExam: async () => ({ id: exam.id }),
    })
    expect(result.status).toBe('skipped')
  })

  it('duplicate exam overwrites when option true', async () => {
    const exam = makePetB1Body()
    const persistExam = vi.fn().mockResolvedValue(undefined)
    const result = await __batchReadingZipImportTestUtils.importOneFile(makeZipFile('overwrite.zip', exam), {
      overwriteExisting: true,
    }, {
      getExistingExam: async () => ({ id: exam.id }),
      persistExam,
      putMedia: async () => undefined,
    })
    expect(result.status).toBe('success')
    expect(result.message).toContain('Overwritten')
    expect(persistExam).toHaveBeenCalledOnce()
  })

  it('non-zip file rejected', async () => {
    const result = await __batchReadingZipImportTestUtils.importOneFile(
      new File(['x'], 'bad.txt', { type: 'text/plain' }),
      {},
      {},
    )
    expect(result.status).toBe('failed')
  })

  it('body id mismatch answers examId rejected', async () => {
    const exam = makePetB1Body()
    const answers = makeAnswers(exam)
    answers.examId = 'different-id'
    const result = await __batchReadingZipImportTestUtils.importOneFile(makeZipFile('mismatch.zip', exam, answers), {}, {})
    expect(result.status).toBe('failed')
    expect(result.errors.some(error => error.includes('answers.examId'))).toBe(true)
  })

  it('PET B1 31 questions rejected', async () => {
    const exam = makePetB1Body()
    exam.parts[5].questionGroups[0].questions.pop()
    const answers = makeAnswers(exam)
    const result = await __batchReadingZipImportTestUtils.importOneFile(makeZipFile('31q.zip', exam, answers), {}, {})
    expect(result.status).toBe('failed')
    expect(result.errors.some(error => error.includes('32 câu'))).toBe(true)
  })

  it('Part 1 imageUrl missing asset fails', async () => {
    const exam = makePetB1Body()
    const result = await __batchReadingZipImportTestUtils.importOneFile(
      makeZipFile('missing-image.zip', exam, makeAnswers(exam), undefined, 4),
      {},
      {},
    )
    expect(result.status).toBe('failed')
    expect(result.errors.some(error => error.includes('Thiếu asset ảnh'))).toBe(true)
  })
})
