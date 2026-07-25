import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import { useState } from 'react'
import { type ReadingPart } from '../examData'
import PetRwPartContent from '../petRw/PetRwPartContent'

afterEach(cleanup)

// ── Helpers ──

function makePart4Data() {
  const part4: ReadingPart = {
    id: 'part-4',
    partNumber: 4,
    rangeLabel: 'Questions 16–20',
    passageTitle: 'Part 4 – A new life',
    passageSubtitle: 'A new life',
    questionGroups: [
      {
        id: 'g4',
        type: 'multiple-choice',
        range: 'Questions 16–20',
        instruction: 'Read the article and choose the correct sentence.',
        questions: [
          { id: 'q16', number: 16, type: 'multiple-choice' as const, prompt: '', options: [], passageKey: 'p4', answer: '', explanation: '' },
          { id: 'q17', number: 17, type: 'multiple-choice' as const, prompt: '', options: [], passageKey: 'p4', answer: '', explanation: '' },
          { id: 'q18', number: 18, type: 'multiple-choice' as const, prompt: '', options: [], passageKey: 'p4', answer: '', explanation: '' },
          { id: 'q19', number: 19, type: 'multiple-choice' as const, prompt: '', options: [], passageKey: 'p4', answer: '', explanation: '' },
          { id: 'q20', number: 20, type: 'multiple-choice' as const, prompt: '', options: [], passageKey: 'p4', answer: '', explanation: '' },
        ] as any,
      },
    ],
    passage: [
      { text: 'A new life' },
      { text: 'Text with gaps. (16) __________ (17) __________ (18) __________ (19) __________ (20) __________' },
      { text: 'They always ask lots of questions.', label: 'A' },
      { text: "That's why I knew it was a terrible plan.", label: 'B' },
      { text: 'She was unable to contact her friends.', label: 'C' },
      { text: 'I thought it would be better to keep quiet.', label: 'D' },
      { text: 'He was very proud of his achievement.', label: 'E' },
    ],
  } as unknown as ReadingPart
  return { part4 }
}

function createMockDataTransfer(): DataTransfer {
  const store = new Map<string, string>()
  return {
    setData: (k: string, v: string) => { store.set(k, v) },
    getData: (k: string) => store.get(k) ?? '',
    clearData: () => store.clear(),
    setDragImage: () => {},
    dropEffect: 'move' as DataTransfer['dropEffect'],
    effectAllowed: 'move' as DataTransfer['effectAllowed'],
    files: [] as unknown as FileList,
    items: [] as unknown as DataTransferItemList,
    types: [],
  } as unknown as DataTransfer
}

function Part4Harness({
  initialAnswers = {},
  reviewMode = false,
}: {
  initialAnswers?: Record<string, string>
  reviewMode?: boolean
}) {
  const { part4 } = makePart4Data()
  const [answers, setAnswers] = useState(initialAnswers)
  return (
    <PetRwPartContent
      examId="pet-test"
      part={part4}
      answers={answers}
      activeQuestionId={null}
      reviewMode={reviewMode}
      onSelectQuestion={() => {}}
      onAnswer={(qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }))}
    />
  )
}

// ── Tests ──

describe('Part 4 — two-way drag and drop', () => {
  it('filled gap is draggable', () => {
    render(<Part4Harness initialAnswers={{ q16: 'a' }} />)
    const filledGap = document.querySelector('.pet-rw-drag__slot--inline.is-filled') as HTMLElement
    expect(filledGap).toBeTruthy()
    expect(filledGap.getAttribute('draggable')).toBe('true')
  })

  it('empty gap is not draggable', () => {
    render(<Part4Harness initialAnswers={{}} />)
    const gaps = document.querySelectorAll('.pet-rw-drag__slot--inline')
    gaps.forEach(gap => {
      expect(gap.getAttribute('draggable')).not.toBe('true')
    })
  })

  it('drag from gap to bank returns option to bank', () => {
    render(<Part4Harness initialAnswers={{ q16: 'a' }} />)

    // Before: q16 has answer, bank doesn't have option A
    const bank = document.querySelector('.pet-rw-part4-bank')!
    expect(bank.textContent).not.toContain('They always ask')

    const filledGap = document.querySelector('.pet-rw-drag__slot--inline.is-filled') as HTMLElement
    expect(filledGap).toBeTruthy()

    // Simulate drag from gap to bank
    const dt = createMockDataTransfer()
    fireEvent.dragStart(filledGap, { dataTransfer: dt })
    fireEvent.dragOver(bank, { dataTransfer: dt })
    fireEvent.drop(bank, { dataTransfer: dt })

    // After: q16 is empty, bank has option A
    expect(document.querySelectorAll('.pet-rw-drag__slot--inline.is-filled').length).toBe(0)
    expect(bank.textContent).toContain('They always ask')
  })

  it('drag cancel does not lose answer', () => {
    render(<Part4Harness initialAnswers={{ q16: 'a' }} />)

    const filledGap = document.querySelector('.pet-rw-drag__slot--inline.is-filled') as HTMLElement
    const dt = createMockDataTransfer()
    fireEvent.dragStart(filledGap, { dataTransfer: dt })
    // Cancel by just triggering dragEnd without drop
    fireEvent.dragEnd(filledGap, { dataTransfer: dt })

    // q16 should still have answer
    expect(document.querySelectorAll('.pet-rw-drag__slot--inline.is-filled').length).toBe(1)
  })

  it('drag from gap to another gap transfers option', () => {
    render(<Part4Harness initialAnswers={{ q16: 'a' }} />)

    const gaps = document.querySelectorAll('.pet-rw-drag__slot--inline')
    const gap1 = gaps[0] as HTMLElement // q16 (filled)
    const gap2 = gaps[1] as HTMLElement // q17 (empty)

    const dt = createMockDataTransfer()
    fireEvent.dragStart(gap1, { dataTransfer: dt })
    fireEvent.dragOver(gap2, { dataTransfer: dt })
    fireEvent.drop(gap2, { dataTransfer: dt })

    // After: q17 is filled, q16 is empty
    const filledGaps = document.querySelectorAll('.pet-rw-drag__slot--inline.is-filled')
    expect(filledGaps.length).toBe(1)
    expect(filledGaps[0].getAttribute('data-question-id')).toBe('q17')
  })

  it('drag to same gap is no-op', () => {
    render(<Part4Harness initialAnswers={{ q16: 'a' }} />)

    const gaps = document.querySelectorAll('.pet-rw-drag__slot--inline')
    const gap1 = gaps[0] as HTMLElement

    const dt = createMockDataTransfer()
    fireEvent.dragStart(gap1, { dataTransfer: dt })
    fireEvent.dragOver(gap1, { dataTransfer: dt })
    fireEvent.drop(gap1, { dataTransfer: dt })

    // q16 still filled
    expect(document.querySelectorAll('.pet-rw-drag__slot--inline.is-filled').length).toBe(1)
  })

  it('bank is draggable to gap (bank→gap flow)', () => {
    render(<Part4Harness initialAnswers={{}} />)

    const bankCards = document.querySelectorAll('.pet-rw-part4-bank-card')
    expect(bankCards.length).toBe(5)

    const gaps = document.querySelectorAll('.pet-rw-drag__slot--inline')
    const gap1 = gaps[0] as HTMLElement

    const dt = createMockDataTransfer()
    fireEvent.dragStart(bankCards[0], { dataTransfer: dt })
    fireEvent.dragOver(gap1, { dataTransfer: dt })
    fireEvent.drop(gap1, { dataTransfer: dt })

    // After: gap1 is filled, bank has 4 cards
    expect(document.querySelectorAll('.pet-rw-drag__slot--inline.is-filled').length).toBe(1)
    expect(document.querySelectorAll('.pet-rw-part4-bank-card').length).toBe(4)
  })

  it('review mode locks all drag', () => {
    render(<Part4Harness initialAnswers={{ q16: 'a' }} reviewMode />)

    // Filled gap should not be draggable
    const filledGap = document.querySelector('.pet-rw-drag__slot--inline.is-filled') as HTMLElement
    expect(filledGap.getAttribute('draggable')).not.toBe('true')

    // Bank cards should not be draggable
    const bankCards = document.querySelectorAll('.pet-rw-part4-bank-card')
    bankCards.forEach(card => {
      expect(card.getAttribute('draggable')).not.toBe('true')
    })

    // Drop into bank should not call onAnswer (q16 stays filled)
    const bank = document.querySelector('.pet-rw-part4-bank')!
    const dt = createMockDataTransfer()
    fireEvent.dragStart(filledGap, { dataTransfer: dt })
    fireEvent.dragOver(bank, { dataTransfer: dt })
    fireEvent.drop(bank, { dataTransfer: dt })
    expect(document.querySelectorAll('.pet-rw-drag__slot--inline.is-filled').length).toBe(1)
  })

  it('bank renders even when empty (drop target exists)', () => {
    render(<Part4Harness initialAnswers={{ q16: 'a', q17: 'b', q18: 'c', q19: 'd', q20: 'e' }} />)

    const bank = document.querySelector('.pet-rw-part4-bank')
    expect(bank).toBeTruthy()
    // No bank cards visible
    expect(document.querySelectorAll('.pet-rw-part4-bank-card').length).toBe(0)

    // Drop on empty bank should still restore option
    const filledGaps = document.querySelectorAll('.pet-rw-drag__slot--inline.is-filled')
    const dt = createMockDataTransfer()
    fireEvent.dragStart(filledGaps[0], { dataTransfer: dt })
    fireEvent.dragOver(bank!, { dataTransfer: dt })
    fireEvent.drop(bank!, { dataTransfer: dt })

    expect(document.querySelectorAll('.pet-rw-drag__slot--inline.is-filled').length).toBe(4)
    expect(document.querySelectorAll('.pet-rw-part4-bank-card').length).toBe(1)
  })
})
