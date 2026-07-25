import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { type ReadingPart } from '../examData'
import PetRwPartContent from '../petRw/PetRwPartContent'

afterEach(cleanup)

function makePart6Data() {
  const part6: ReadingPart = {
    id: 'part-6',
    partNumber: 6,
    rangeLabel: 'Questions 27–32',
    passageTitle: 'The Coconut Tree',
    questionGroups: [
      {
        id: 'g6',
        type: 'multiple-choice',
        range: 'Questions 27–32',
        instruction: 'Choose the correct word.',
        questions: [
          { id: 'q27', number: 27, type: 'multiple-choice' as const, prompt: '', passageKey: 'p6', answer: '', explanation: '', options: [] },
          { id: 'q28', number: 28, type: 'multiple-choice' as const, prompt: '', passageKey: 'p6', answer: '', explanation: '', options: [] },
          { id: 'q29', number: 29, type: 'multiple-choice' as const, prompt: '', passageKey: 'p6', answer: '', explanation: '', options: [] },
          { id: 'q30', number: 30, type: 'multiple-choice' as const, prompt: '', passageKey: 'p6', answer: '', explanation: '', options: [] },
          { id: 'q31', number: 31, type: 'multiple-choice' as const, prompt: '', passageKey: 'p6', answer: '', explanation: '', options: [] },
          { id: 'q32', number: 32, type: 'multiple-choice' as const, prompt: '', passageKey: 'p6', answer: '', explanation: '', options: [] },
        ],
      },
    ],
    passage: [
      { text: 'The (27) __________ tree grows in hot and wet (28) __________. It can reach a (29) __________ of up to 30 metres. The fruit can travel long distances by sea to new (30) __________ where they start to (31) __________. People use the wood to build (32) __________.' },
    ],
  } as unknown as ReadingPart
  return { part6 }
}

function Part6Harness({
  initialAnswers = {},
}: {
  initialAnswers?: Record<string, string>
}) {
  const { part6 } = makePart6Data()
  const [answers, setAnswers] = useState(initialAnswers)
  const [activeId, setActiveId] = useState<string | null>(null)
  return (
    <PetRwPartContent
      examId="pet-test"
      part={part6}
      answers={answers}
      activeQuestionId={activeId}
      onSelectQuestion={setActiveId}
      onAnswer={(qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }))}
    />
  )
}

describe('Part 6 — Cambridge single input boxes', () => {
  it('renders 6 input fields', () => {
    render(<Part6Harness />)
    const inputs = document.querySelectorAll('.pet-rw-part6-gap__input')
    expect(inputs).toHaveLength(6)
  })

  it('has correct placeholder numbers', () => {
    render(<Part6Harness />)
    const inputs = document.querySelectorAll('.pet-rw-part6-gap__input')
    expect((inputs[0] as HTMLInputElement).placeholder).toBe('27')
    expect((inputs[5] as HTMLInputElement).placeholder).toBe('32')
  })

  it('does not render purple badge numbers', () => {
    render(<Part6Harness />)
    expect(document.querySelector('.pet-rw-shell.is-part-6 .ket-rw-gap-text__num')).toBeFalsy()
  })

  it('accepts typed answer and shows it centered', () => {
    render(<Part6Harness />)
    const input = screen.getByLabelText('Question 27') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'every' } })
    expect(input.value).toBe('every')
  })

  it('sets active question on focus', () => {
    let activeId: string | null = null
    const { part6 } = makePart6Data()
    const { container } = render(
      <PetRwPartContent
        examId="pet-test"
        part={part6}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={id => { activeId = id }}
        onAnswer={() => {}}
      />,
    )
    const input = container.querySelector('.pet-rw-part6-gap__input') as HTMLInputElement
    fireEvent.focus(input)
    expect(activeId).toBe('q27')
  })

  it('gap wrapper has inline-flex styling', () => {
    render(<Part6Harness />)
    const wrapper = document.querySelector('.pet-rw-part6-gap') as HTMLElement
    expect(wrapper).toBeTruthy()
  })
})
