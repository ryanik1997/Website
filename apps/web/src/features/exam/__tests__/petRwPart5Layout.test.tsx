import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { type ReadingPart } from '../examData'
import PetRwPartContent from '../petRw/PetRwPartContent'

afterEach(cleanup)

// ── Helpers ──

function makePart5Data() {
  const part5: ReadingPart = {
    id: 'part-5',
    partNumber: 5,
    rangeLabel: 'Questions 21–26',
    passageTitle: 'Part 5 – The Coconut Tree',
    passageSubtitle: 'The Coconut Tree',
    questionGroups: [
      {
        id: 'g5',
        type: 'multiple-choice',
        range: 'Questions 21–26',
        instruction: 'Choose the correct answer.',
        questions: [
          { id: 'q21', number: 21, type: 'multiple-choice' as const, prompt: '', passageKey: 'p5', answer: '', explanation: '',
            options: [{ id: 'a', label: 'temperature' }, { id: 'b', label: 'height' }, { id: 'c', label: 'location' }, { id: 'd', label: 'weather' }] },
          { id: 'q22', number: 22, type: 'multiple-choice' as const, prompt: '', passageKey: 'p5', answer: '', explanation: '',
            options: [{ id: 'a', label: 'leaves' }, { id: 'b', label: 'roots' }, { id: 'c', label: 'fruit' }, { id: 'd', label: 'wood' }] },
          { id: 'q23', number: 23, type: 'multiple-choice' as const, prompt: '', passageKey: 'p5', answer: '', explanation: '',
            options: [{ id: 'a', label: 'north' }, { id: 'b', label: 'south' }, { id: 'c', label: 'east' }, { id: 'd', label: 'west' }] },
          { id: 'q24', number: 24, type: 'multiple-choice' as const, prompt: '', passageKey: 'p5', answer: '', explanation: '',
            options: [{ id: 'a', label: 'oil' }, { id: 'b', label: 'milk' }, { id: 'c', label: 'water' }, { id: 'd', label: 'juice' }] },
          { id: 'q25', number: 25, type: 'multiple-choice' as const, prompt: '', passageKey: 'p5', answer: '', explanation: '',
            options: [{ id: 'a', label: 'rope' }, { id: 'b', label: 'paper' }, { id: 'c', label: 'cloth' }, { id: 'd', label: 'basket' }] },
          { id: 'q26', number: 26, type: 'multiple-choice' as const, prompt: '', passageKey: 'p5', answer: '', explanation: '',
            options: [{ id: 'a', label: 'coast' }, { id: 'b', label: 'village' }, { id: 'c', label: 'forest' }, { id: 'd', label: 'garden' }] },
        ],
      },
    ],
    passage: [
      { text: 'The Coconut Tree' },
      { text: 'This tree grows in hot, wet (21) __________ and can reach a (22) __________ of up to 30 metres. The (23) __________ of the tree is found near the (24) __________ where the climate is warm.' },
      { text: 'Its (25) __________ can be used to make (26) __________ and many other useful things.' },
    ],
  } as unknown as ReadingPart
  return { part5 }
}

function Part5Harness({
  initialAnswers = {},
  reviewMode = false,
}: {
  initialAnswers?: Record<string, string>
  reviewMode?: boolean
}) {
  const { part5 } = makePart5Data()
  const [answers, setAnswers] = useState(initialAnswers)
  return (
    <PetRwPartContent
      examId="pet-test"
      part={part5}
      answers={answers}
      activeQuestionId={null}
      reviewMode={reviewMode}
      onSelectQuestion={() => {}}
      onAnswer={(qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }))}
    />
  )
}

// ── Tests ──

describe('Part 5 — horizontal chooser gap', () => {
  it('renders clean title without "Part 5 –" prefix', () => {
    render(<Part5Harness />)
    const titles = screen.getAllByText('The Coconut Tree')
    expect(titles).toHaveLength(1)
    expect(screen.queryByText(/Part\s*5\s*[—–-]\s*The Coconut Tree/i)).toBeNull()
  })

  it('renders 6 gaps', () => {
    render(<Part5Harness />)
    const gaps = document.querySelectorAll('.pet-rw-part5-gap')
    expect(gaps).toHaveLength(6)
  })

  it('opens chooser on gap click', () => {
    render(<Part5Harness />)
    const field = document.querySelector('.pet-rw-part5-gap__field') as HTMLElement
    fireEvent.click(field)
    const chooser = document.querySelector('.pet-rw-part5-gap__chooser')
    expect(chooser).toBeTruthy()
    const close = document.querySelector('.pet-rw-part5-gap__close')
    expect(close).toBeTruthy()
    const options = document.querySelectorAll('.pet-rw-part5-gap__option')
    expect(options).toHaveLength(4)
  })

  it('selecting an option fills the gap and closes chooser', () => {
    render(<Part5Harness />)
    const field = document.querySelector('.pet-rw-part5-gap__field') as HTMLElement
    fireEvent.click(field)

    const option = document.querySelector('.pet-rw-part5-gap__option') as HTMLElement
    expect(option.textContent).toBe('temperature')
    fireEvent.click(option)

    // Gap is filled
    const value = document.querySelector('.pet-rw-part5-gap__value')
    expect(value).toBeTruthy()
    expect(value!.textContent).toBe('temperature')

    // Chooser closed
    expect(document.querySelector('.pet-rw-part5-gap__chooser')).toBeNull()
  })

  it('only one chooser open at a time', () => {
    render(<Part5Harness />)
    const fields = document.querySelectorAll('.pet-rw-part5-gap__field')

    // Click first gap
    fireEvent.click(fields[0] as HTMLElement)
    expect(document.querySelectorAll('.pet-rw-part5-gap__chooser').length).toBe(1)

    // Click second gap
    fireEvent.click(fields[1] as HTMLElement)
    // Still only one chooser
    expect(document.querySelectorAll('.pet-rw-part5-gap__chooser').length).toBe(1)
  })

  it('close button hides chooser without changing answer', () => {
    render(<Part5Harness />)
    const field = document.querySelector('.pet-rw-part5-gap__field') as HTMLElement
    fireEvent.click(field)

    const close = document.querySelector('.pet-rw-part5-gap__close') as HTMLElement
    fireEvent.click(close)

    expect(document.querySelector('.pet-rw-part5-gap__chooser')).toBeNull()
    expect(document.querySelector('.pet-rw-part5-gap__value')).toBeNull() // no answer
  })

  it('click outside closes chooser', () => {
    render(<Part5Harness />)
    const field = document.querySelector('.pet-rw-part5-gap__field') as HTMLElement
    fireEvent.click(field)
    expect(document.querySelector('.pet-rw-part5-gap__chooser')).toBeTruthy()

    fireEvent.pointerDown(document.body)
    expect(document.querySelector('.pet-rw-part5-gap__chooser')).toBeNull()
  })

  it('review mode disables interaction', () => {
    render(<Part5Harness reviewMode />)
    const field = document.querySelector('.pet-rw-part5-gap__field') as HTMLElement
    expect(field.hasAttribute('disabled')).toBe(true)
    fireEvent.click(field)
    expect(document.querySelector('.pet-rw-part5-gap__chooser')).toBeNull()
  })
})
