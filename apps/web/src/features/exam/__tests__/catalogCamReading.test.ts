import { describe, expect, it, vi } from 'vitest'

vi.mock('@ryan/db', () => ({
  examRepo: { list: vi.fn().mockResolvedValue([]), get: vi.fn() },
}))
vi.mock('../readingExamPublish', () => ({
  getPublishedReadingExam: vi.fn().mockResolvedValue(null),
  listPublishedReadingExams: vi.fn().mockResolvedValue([]),
}))
vi.mock('../examCatalogHide', () => ({
  isReadingCatalogHidden: vi.fn().mockResolvedValue(false),
  listHiddenReadingCatalogIds: vi.fn().mockResolvedValue([]),
}))

import { listAllReadingExams } from '../examLoader'

describe('IELTS Cambridge builtin reading catalog', () => {
  it('lists 48 seeded exams with three passages and 40 questions each', async () => {
    const exams = await listAllReadingExams()
    const seeded = exams.filter(exam => exam.id.startsWith('catalog-cam-') && exam.examTrack === 'ielts')

    expect(seeded).toHaveLength(48)
    for (const exam of seeded) {
      expect(exam.parts).toHaveLength(3)
      // Allow-listed exception: catalog-cam-11-3 carries a phantom empty Q9 from a
      // source duplicate-id bug (see scripts/content/release-exclusions.mjs →
      // IELTS_ANSWER_EXCEPTIONS, classification TRANSFORM_DROPPED). All other cam
      // tests have exactly 40 questions.
      const expected = exam.id === 'catalog-cam-11-3-reading' ? 41 : 40
      expect((exam as typeof exam & { questionCount?: number }).questionCount).toBe(expected)
    }
  })
})
