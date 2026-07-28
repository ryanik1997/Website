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
  it('lists 47 seeded exams with three passages and 40 questions each', async () => {
    const exams = await listAllReadingExams()
    const seeded = exams.filter(exam => exam.id.startsWith('catalog-cam-') && exam.examTrack === 'ielts')

    expect(seeded).toHaveLength(47)
    for (const exam of seeded) {
      expect(exam.parts).toHaveLength(3)
      expect(exam.parts.reduce((sum, part) => sum + part.questionGroups.reduce((groupSum, group) => groupSum + group.questions.length, 0), 0)).toBe(40)
    }
  })
})
