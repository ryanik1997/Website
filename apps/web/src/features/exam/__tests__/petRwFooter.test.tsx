import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import PetRwFooter from '../petRw/PetRwFooter'
import type { ReadingExam } from '../examData'
import { getPartQuestions } from '../examData'

function createFixtureExam(): ReadingExam {
  return {
    id: 'pet-rw-test-fixture',
    title: 'PET B1 Reading Test',
    durationMinutes: 45,
    bandHint: 'B1',
    cambridgeLevel: 'b1',
    parts: [
      {
        id: 'part-1',
        partNumber: 1,
        rangeLabel: 'Questions 1–5',
        passageTitle: '',
        passage: [{ text: '' }],
        questionGroups: [
          {
            id: 'p1-g1',
            range: 'Questions 1–5',
            type: 'multiple-choice',
            instruction: 'Choose A, B or C.',
            questions: [
              { id: 'q-1', number: 1, type: 'multiple-choice', prompt: 'Q1', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }], answer: 'a', explanation: '' },
              { id: 'q-2', number: 2, type: 'multiple-choice', prompt: 'Q2', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }], answer: 'b', explanation: '' },
              { id: 'q-3', number: 3, type: 'multiple-choice', prompt: 'Q3', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }], answer: 'c', explanation: '' },
            ],
          },
        ],
      },
      {
        id: 'part-2',
        partNumber: 2,
        rangeLabel: 'Questions 6–10',
        passageTitle: '',
        passage: [{ text: '' }],
        questionGroups: [
          {
            id: 'p2-g1',
            range: 'Questions 6–10',
            type: 'multiple-choice',
            instruction: 'Choose A, B or C.',
            questions: [
              { id: 'q-6', number: 6, type: 'multiple-choice', prompt: 'Q6', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }], answer: 'a', explanation: '' },
            ],
          },
        ],
      },
    ],
  }
}

/** Scope queries to the footer element to avoid cross-contamination */
function renderFooter(
  overrides?: {
    activePartIndex?: number
    activeQuestionId?: string
    answers?: Record<string, string>
  },
) {
  const exam = createFixtureExam()
  const onSelectPart = vi.fn()
  const onSelectQuestion = vi.fn()
  const onSubmit = vi.fn()

  const { container } = render(
    <PetRwFooter
      parts={exam.parts}
      activePartIndex={overrides?.activePartIndex ?? 0}
      activeQuestionId={overrides?.activeQuestionId ?? 'q-1'}
      answers={overrides?.answers ?? {}}
      onSelectPart={onSelectPart}
      onSelectQuestion={onSelectQuestion}
      onSubmit={onSubmit}
    />,
  )

  const footer = container.querySelector('footer')!
  return { footer, onSelectPart, onSelectQuestion, onSubmit }
}

describe('PetRwFooter navigation', () => {
  it('renders pills for the current part (Part 1 → 3 pills)', () => {
    const { footer } = renderFooter({ activePartIndex: 0 })

    const pills = footer.querySelectorAll('[data-question-id]')
    expect(pills.length).toBe(3)
    expect(pills[0]).toHaveAttribute('data-question-id', 'q-1')
    expect(pills[1]).toHaveAttribute('data-question-id', 'q-2')
    expect(pills[2]).toHaveAttribute('data-question-id', 'q-3')
  })

  it('does NOT show pills for Part 2 when Part 1 is active', () => {
    const { footer } = renderFooter({ activePartIndex: 0 })

    expect(footer.querySelector('[data-question-id="q-6"]')).not.toBeInTheDocument()
  })

  it('shows pills for Part 2 when Part 2 is active', () => {
    const { footer } = renderFooter({ activePartIndex: 1, activeQuestionId: 'q-6' })

    expect(footer.querySelector('[data-question-id="q-6"]')).toBeInTheDocument()
  })

  it('calls onSelectQuestion when a pill is clicked', () => {
    const { footer, onSelectQuestion } = renderFooter({ activePartIndex: 0 })

    const pill2 = footer.querySelector('[data-question-id="q-2"]')!
    fireEvent.click(pill2)

    expect(onSelectQuestion).toHaveBeenCalledTimes(1)
    expect(onSelectQuestion).toHaveBeenCalledWith('q-2')
  })

  it('does NOT call onSelectPart when a pill is clicked', () => {
    const { footer, onSelectPart, onSelectQuestion } = renderFooter({ activePartIndex: 0 })

    const pill2 = footer.querySelector('[data-question-id="q-2"]')!
    fireEvent.click(pill2)

    expect(onSelectPart).not.toHaveBeenCalled()
    expect(onSelectQuestion).toHaveBeenCalledTimes(1)
    expect(onSelectQuestion).toHaveBeenCalledWith('q-2')
  })

  it('sets aria-current="true" on the active pill', () => {
    const { footer } = renderFooter({ activePartIndex: 0, activeQuestionId: 'q-2' })

    const activePill = footer.querySelector('[data-question-id="q-2"]')
    expect(activePill).toHaveAttribute('aria-current', 'true')

    const inactivePill = footer.querySelector('[data-question-id="q-1"]')
    expect(inactivePill).not.toHaveAttribute('aria-current', 'true')
  })

  it('has data-question-id attribute on each pill', () => {
    const { footer } = renderFooter({ activePartIndex: 0 })

    expect(footer.querySelector('[data-question-id="q-1"]')).toBeInTheDocument()
    expect(footer.querySelector('[data-question-id="q-2"]')).toBeInTheDocument()
    expect(footer.querySelector('[data-question-id="q-3"]')).toBeInTheDocument()
  })

  it('calls onSelectPart when a Part tab is clicked', () => {
    const { footer, onSelectPart } = renderFooter({ activePartIndex: 0 })

    const part2Tab = within(footer).getByRole('button', { name: /part 2/i })
    fireEvent.click(part2Tab)

    expect(onSelectPart).toHaveBeenCalledTimes(1)
    expect(onSelectPart).toHaveBeenCalledWith(1)
  })

  it('renders the submit button', () => {
    const { footer } = renderFooter({ activePartIndex: 0 })

    expect(within(footer).getByRole('button', { name: 'Submit exam' })).toBeInTheDocument()
  })

  it('clicks sequentially through pills 1–3 without calling onSelectPart', () => {
    const { footer, onSelectPart, onSelectQuestion } = renderFooter({ activePartIndex: 0 })

    const pill1 = footer.querySelector('[data-question-id="q-1"]')!
    const pill2 = footer.querySelector('[data-question-id="q-2"]')!
    const pill3 = footer.querySelector('[data-question-id="q-3"]')!

    fireEvent.click(pill1)
    expect(onSelectQuestion).toHaveBeenLastCalledWith('q-1')

    fireEvent.click(pill2)
    expect(onSelectQuestion).toHaveBeenLastCalledWith('q-2')

    fireEvent.click(pill3)
    expect(onSelectQuestion).toHaveBeenLastCalledWith('q-3')

    expect(onSelectPart).not.toHaveBeenCalled()
  })

  it('marks answered pills with is-answered class', () => {
    const { footer } = renderFooter({
      activePartIndex: 0,
      activeQuestionId: 'q-2',
      answers: { 'q-1': 'a', 'q-3': 'c' },
    })

    const pill1 = footer.querySelector('[data-question-id="q-1"]')
    const pill2 = footer.querySelector('[data-question-id="q-2"]')
    const pill3 = footer.querySelector('[data-question-id="q-3"]')

    expect(pill1!.className).toContain('is-answered')
    expect(pill3!.className).toContain('is-answered')
    expect(pill2!.className).toContain('is-active')
  })

  it('checks no nested buttons (event bubbling safeguard)', () => {
    const { footer } = renderFooter({ activePartIndex: 0 })

    const allButtons = footer.querySelectorAll('button')
    for (const btn of Array.from(allButtons)) {
      const nestedButtons = btn.querySelectorAll('button')
      expect(nestedButtons.length).toBe(0)
    }
  })

  it('verifies all question IDs are valid strings', () => {
    const exam = createFixtureExam()
    for (const part of exam.parts) {
      const questions = getPartQuestions(part)
      for (const q of questions) {
        expect(q.id).toBeTruthy()
        expect(typeof q.id).toBe('string')
      }
    }
  })
})
