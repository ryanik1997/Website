import { describe, expect, it, afterEach } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { sanitizeReadingExam } from '../readingExamSanitize'
import { getPartQuestions } from '../examData'
import PetRwFooter from '../petRw/PetRwFooter'
import PetRwPartContent from '../petRw/PetRwPartContent'
import type { ReadingExam } from '../examData'

function createNullIdFixture(): ReadingExam {
  return sanitizeReadingExam({
    id: 'pet-null-id-test',
    cambridgeLevel: 'b1',
    title: 'PET B1 Null ID Test',
    durationMinutes: 45,
    bandHint: 'B1',
    parts: [
      {
        id: 'part-1',
        partNumber: 1,
        rangeLabel: 'Questions 1–2',
        passageTitle: 'Test',
        passage: [
          { text: '', imageUrl: '' },
          { text: '', imageUrl: '' },
          { text: '', imageUrl: '' },
          { text: '', imageUrl: '' },
          { text: '', imageUrl: '' },
        ],
        questionGroups: [
          {
            id: 'group-1',
            range: 'Questions 1–2',
            type: 'multiple-choice',
            instruction: 'Choose A or B.',
            questions: [
              {
                id: null as unknown as string,
                number: 1,
                type: 'multiple-choice',
                prompt: 'First question',
                options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
                answer: 'a',
                explanation: '',
              },
              {
                id: null as unknown as string,
                number: 2,
                type: 'multiple-choice',
                prompt: 'Second question',
                options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
                answer: 'b',
                explanation: '',
              },
            ],
          },
        ],
      },
    ],
  } as ReadingExam)
}

function NavigationHarness({ exam }: { exam: ReadingExam }) {
  const [activeQuestionByPart, setActiveQuestionByPart] = useState<Record<number, string>>({})
  const partIndex = 0
  const currentPart = exam.parts[partIndex]
  const questions = getPartQuestions(currentPart)
  const activeQuestionId = activeQuestionByPart[partIndex] ?? questions[0]?.id ?? null

  const handleSelectQuestion = (id: string) => {
    setActiveQuestionByPart(prev => ({ ...prev, [partIndex]: id }))
  }

  return (
    <div data-testid="harness-root">
      <PetRwFooter
        parts={exam.parts}
        activePartIndex={partIndex}
        activeQuestionId={activeQuestionId}
        answers={{}}
        onSelectPart={() => {}}
        onSelectQuestion={handleSelectQuestion}
        onSubmit={() => {}}
      />
      <PetRwPartContent
        examId={exam.id}
        part={currentPart}
        answers={{}}
        activeQuestionId={activeQuestionId}
        onSelectQuestion={handleSelectQuestion}
        onAnswer={() => {}}
      />
    </div>
  )
}

describe('PET Reading integration — navigation with sanitized null IDs', () => {
  afterEach(cleanup)

  it('renders pills with sanitized fallback IDs after null IDs', () => {
    const exam = createNullIdFixture()
    render(<NavigationHarness exam={exam} />)

    const pill1 = screen.getByRole('button', { name: 'Go to question 1' })
    const pill2 = screen.getByRole('button', { name: 'Go to question 2' })

    expect(pill1).toHaveAttribute('data-question-id', 'pet-null-id-test:part-1:group-1:question-1')
    expect(pill2).toHaveAttribute('data-question-id', 'pet-null-id-test:part-1:group-1:question-2')
  })

  it('renders Q1 content initially with fallback ID', () => {
    const exam = createNullIdFixture()
    render(<NavigationHarness exam={exam} />)

    const activeSection = screen.getByTestId('pet-rw-active-question')
    expect(activeSection).toHaveAttribute(
      'data-question-id',
      'pet-null-id-test:part-1:group-1:question-1',
    )
    expect(screen.getByText('First question')).toBeInTheDocument()
  })

  it('clicking pill 2 changes content to Q2', () => {
    const exam = createNullIdFixture()
    render(<NavigationHarness exam={exam} />)

    // Click Q2 pill
    const pill2 = screen.getByRole('button', { name: 'Go to question 2' })
    fireEvent.click(pill2)

    // Content should now show Q2
    const activeSection = screen.getByTestId('pet-rw-active-question')
    expect(activeSection).toHaveAttribute(
      'data-question-id',
      'pet-null-id-test:part-1:group-1:question-2',
    )
    expect(screen.getByText('Second question')).toBeInTheDocument()
    expect(screen.queryByText('First question')).not.toBeInTheDocument()
  })
})
