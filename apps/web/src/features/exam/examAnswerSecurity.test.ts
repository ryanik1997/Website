import { describe, expect, it } from 'vitest'
import {
  createExamAnswersVault,
  stripExamAnswerFields,
} from './examAnswerSecurity'

describe('published exam answer security', () => {
  const exam = {
    id: 'published-reading-1',
    title: 'Protected paper',
    parts: [
      {
        questions: [
          {
            id: 'q1',
            prompt: 'Question one',
            answer: 'A',
            explanation: 'Secret explanation',
            acceptableAnswers: ['A', 'a'],
          },
        ],
        questionGroups: [
          {
            questions: [
              {
                id: 'q2',
                prompt: 'Writing prompt',
                answer: 'sample',
                modelAnswer: 'Secret model answer',
              },
            ],
          },
        ],
      },
    ],
  }

  it('removes every answer-bearing field recursively from the runtime body', () => {
    const clean = stripExamAnswerFields(exam)
    const json = JSON.stringify(clean)

    expect(json).not.toContain('"answer"')
    expect(json).not.toContain('"explanation"')
    expect(json).not.toContain('"acceptableAnswers"')
    expect(json).not.toContain('"modelAnswer"')
    expect(json).toContain('"prompt":"Question one"')
  })

  it('extracts answer keys into a private vault keyed by question id', () => {
    const vault = createExamAnswersVault(exam)

    expect(vault).toEqual({
      examId: 'published-reading-1',
      version: 1,
      mode: 'answers-vault',
      answers: {
        q1: {
          answer: 'A',
          explanation: 'Secret explanation',
          acceptableAnswers: ['A', 'a'],
        },
        q2: {
          answer: 'sample',
          modelAnswer: 'Secret model answer',
        },
      },
    })
  })
})
