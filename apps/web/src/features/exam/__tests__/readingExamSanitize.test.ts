import { describe, expect, it } from 'vitest'
import { sanitizeReadingExam } from '../readingExamSanitize'
import { getPartQuestions, getExamQuestions } from '../examData'
import type { ReadingExam } from '../examData'

/* ── Helpers ─────────────────────────────────────────────────── */

function minimalExam(overrides?: Partial<ReadingExam>): ReadingExam {
  return {
    id: 'pet-null-id-test',
    cambridgeLevel: 'b1',
    parts: [
      {
        id: 'part-1',
        partNumber: 1,
        rangeLabel: 'Questions 1–2',
        passageTitle: 'Test',
        passage: [{ text: '' }],
        questionGroups: [
          {
            id: 'group-1',
            range: 'Questions 1–2',
            type: 'multiple-choice',
            instruction: 'Choose A or B.',
            questions: [
              { id: 'q1', number: 1, type: 'multiple-choice', prompt: 'First question', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], answer: 'a', explanation: '' },
              { id: 'q2', number: 2, type: 'multiple-choice', prompt: 'Second question', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], answer: 'b', explanation: '' },
            ],
          },
        ],
      },
    ],
    title: 'Test',
    durationMinutes: 30,
    bandHint: 'B1',
    ...overrides,
  }
}

describe('readingExamSanitize — question ID sanitization', () => {
  it('replaces null IDs with stable fallback IDs', () => {
    const rawExam = {
      ...minimalExam(),
      parts: [
        {
          id: 'part-1',
          partNumber: 1,
          rangeLabel: 'Questions 1–2',
          passageTitle: 'Test',
          passage: [{ text: '' }],
          questionGroups: [
            {
              id: 'group-1',
              range: 'Questions 1–2',
              type: 'multiple-choice',
              instruction: 'Choose A or B.',
              questions: [
                { id: null, number: 1, type: 'multiple-choice', prompt: 'First question', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], answer: 'a', explanation: '' },
                { id: null, number: 2, type: 'multiple-choice', prompt: 'Second question', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], answer: 'b', explanation: '' },
              ] as unknown as ReadingExam['parts'][0]['questionGroups'][0]['questions'],
            },
          ],
        },
      ],
    } as ReadingExam

    const sanitized = sanitizeReadingExam(rawExam)
    const questions = getPartQuestions(sanitized.parts[0])

    expect(questions[0].id).toBe('pet-null-id-test:part-1:group-1:question-1')
    expect(questions[1].id).toBe('pet-null-id-test:part-1:group-1:question-2')
    expect(questions[0].id).not.toBe(questions[1].id)
  })

  it('produces stable IDs across multiple sanitize calls', () => {
    const rawExam = {
      ...minimalExam(),
      parts: [
        {
          id: 'part-1',
          partNumber: 1,
          rangeLabel: 'Questions 1–2',
          passageTitle: 'Test',
          passage: [{ text: '' }],
          questionGroups: [
            {
              id: 'group-1',
              range: 'Questions 1–2',
              type: 'multiple-choice',
              instruction: 'Choose A or B.',
              questions: [
                { id: null, number: 1, type: 'multiple-choice', prompt: 'First question', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], answer: 'a', explanation: '' },
                { id: null, number: 2, type: 'multiple-choice', prompt: 'Second question', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], answer: 'b', explanation: '' },
              ] as unknown as ReadingExam['parts'][0]['questionGroups'][0]['questions'],
            },
          ],
        },
      ],
    } as ReadingExam

    const first = sanitizeReadingExam(rawExam)
    const second = sanitizeReadingExam(rawExam)

    expect(
      getExamQuestions(first).map(q => q.id),
    ).toEqual(
      getExamQuestions(second).map(q => q.id),
    )
  })

  it('preserves valid existing IDs unchanged', () => {
    const rawExam = {
      ...minimalExam(),
      parts: [
        {
          id: 'part-1',
          partNumber: 1,
          rangeLabel: 'Questions 1–2',
          passageTitle: 'Test',
          passage: [{ text: '' }],
          questionGroups: [
            {
              id: 'group-1',
              range: 'Questions 1–2',
              type: 'multiple-choice',
              instruction: 'Choose A or B.',
              questions: [
                { id: 'existing-id', number: 1, type: 'multiple-choice', prompt: 'First question', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], answer: 'a', explanation: '' },
                { id: 'another-id', number: 2, type: 'multiple-choice', prompt: 'Second question', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], answer: 'b', explanation: '' },
              ],
            },
          ],
        },
      ],
    } as ReadingExam

    const sanitized = sanitizeReadingExam(rawExam)
    expect(
      sanitized.parts[0].questionGroups[0].questions[0].id,
    ).toBe('existing-id')
    expect(
      sanitized.parts[0].questionGroups[0].questions[1].id,
    ).toBe('another-id')
  })

  it('handles duplicate IDs by generating unique fallbacks', () => {
    const rawExam = {
      ...minimalExam(),
      parts: [
        {
          id: 'part-1',
          partNumber: 1,
          rangeLabel: 'Questions 1–2',
          passageTitle: 'Test',
          passage: [{ text: '' }],
          questionGroups: [
            {
              id: 'group-1',
              range: 'Questions 1–2',
              type: 'multiple-choice',
              instruction: 'Choose A or B.',
              questions: [
                { id: 'duplicate-id', number: 1, type: 'multiple-choice', prompt: 'First question', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], answer: 'a', explanation: '' },
                { id: 'duplicate-id', number: 2, type: 'multiple-choice', prompt: 'Second question', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], answer: 'b', explanation: '' },
              ],
            },
          ],
        },
      ],
    } as ReadingExam

    const sanitized = sanitizeReadingExam(rawExam)
    const questions = getPartQuestions(sanitized.parts[0])

    expect(questions[0].id).toBe('duplicate-id')
    expect(questions[1].id).not.toBe('duplicate-id')
    expect(questions[0].id).not.toBe(questions[1].id)
  })

  it('sanitizes empty string IDs same as null', () => {
    const rawExam = {
      ...minimalExam(),
      parts: [
        {
          id: 'part-1',
          partNumber: 1,
          rangeLabel: 'Questions 1',
          passageTitle: 'Test',
          passage: [{ text: '' }],
          questionGroups: [
            {
              id: 'group-1',
              range: 'Questions 1',
              type: 'multiple-choice',
              instruction: 'Choose A or B.',
              questions: [
                { id: '', number: 1, type: 'multiple-choice', prompt: 'Only question', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], answer: 'a', explanation: '' },
              ],
            },
          ],
        },
      ],
    } as ReadingExam

    const sanitized = sanitizeReadingExam(rawExam)
    const question = getPartQuestions(sanitized.parts[0])[0]

    expect(question.id).toBe('pet-null-id-test:part-1:group-1:question-1')
  })
})
