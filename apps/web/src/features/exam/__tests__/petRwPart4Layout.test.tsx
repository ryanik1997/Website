import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { type ReadingPart, type ReadingQuestion } from '../examData'
import PetRwPartContent from '../petRw/PetRwPartContent'

afterEach(cleanup)

// ── Helpers ──

function makeGapQuestion(id: string, number: number, label: string): ReadingQuestion {
  return {
    id,
    number,
    type: 'multiple-choice' as const,
    prompt: '',
    options: [],
    passageKey: 'p4',
    answer: '',
    explanation: '',
  } as unknown as ReadingQuestion
}

function makePart4Data(
  overrides?: Partial<ReadingPart>,
  gapQuestionOverrides?: { id: string; number: number; label: string }[],
) {
  const gapData = gapQuestionOverrides ?? [
    { id: 'q16', number: 16, label: 'They always ask lots of questions.' },
    { id: 'q17', number: 17, label: "That's why I knew it was a terrible plan." },
    { id: 'q18', number: 18, label: 'She was unable to contact her friends.' },
    { id: 'q19', number: 19, label: 'I thought it would be better to keep quiet.' },
    { id: 'q20', number: 20, label: 'He was very proud of his achievement.' },
  ]

  const questions = gapData.map(g => makeGapQuestion(g.id, g.number, g.label))

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
        questions,
      },
    ],
    passage: [
      { text: 'A new life' },
      {
        text: 'Sarah moved to a small village last year. (16) __________ ' +
          'Her family thought she was crazy. (17) __________ ' +
          'But Sarah knew what she wanted. (18) __________ ' +
          'She spent her first month painting the house. (19) __________ ' +
          'Now she runs a small shop. (20) __________',
      },
      // Labeled blocks for bank (A–E)
      { text: 'They always ask lots of questions.', label: 'A' },
      { text: "That's why I knew it was a terrible plan.", label: 'B' },
      { text: 'She was unable to contact her friends.', label: 'C' },
      { text: 'I thought it would be better to keep quiet.', label: 'D' },
      { text: 'He was very proud of his achievement.', label: 'E' },
    ],
    ...overrides,
  } as unknown as ReadingPart

  return { part4, questions, gapData }
}

// ── Tests ──

describe('Part 4 layout', () => {
  it('renders pet-rw-part4-body instead of KetRwSplitPane', () => {
    const { part4 } = makePart4Data()
    render(
      <PetRwPartContent
        examId="pet-test"
        part={part4}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    // Should have custom body, not split pane
    expect(document.querySelector('.pet-rw-part4-body')).toBeTruthy()
    expect(document.querySelector('.ket-rw-body.is-split')).toBeFalsy()
    expect(document.querySelector('.ket-rw-resizer')).toBeFalsy()
    expect(document.querySelector('.ket-rw-fixed-divider')).toBeFalsy()
  })

  it('renders article section and bank aside', () => {
    const { part4 } = makePart4Data()
    render(
      <PetRwPartContent
        examId="pet-test"
        part={part4}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    expect(document.querySelector('.pet-rw-part4-article')).toBeTruthy()
    expect(document.querySelector('.pet-rw-part4-bank')).toBeTruthy()
  })

  it('renders title without "Part 4 –" prefix and without duplicate', () => {
    const { part4 } = makePart4Data()
    render(
      <PetRwPartContent
        examId="pet-test"
        part={part4}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    // Title should appear exactly once
    expect(screen.getAllByText('A new life')).toHaveLength(1)

    // The "Part 4 –" prefix should NOT appear
    expect(screen.queryByText(/Part\s*4\s*[—–-]\s*A new life/i)).toBeNull()
  })

  it('renders 5 inline gaps (no bank letters)', () => {
    const { part4 } = makePart4Data()
    render(
      <PetRwPartContent
        examId="pet-test"
        part={part4}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    const gaps = document.querySelectorAll('.pet-rw-drag__slot--inline')
    expect(gaps.length).toBe(5)

    // No A–H letters in gaps
    const gapLetters = document.querySelectorAll('.pet-rw-drag__slot-value strong')
    expect(gapLetters.length).toBe(0)

    // No placeholder dots in gaps
    const placeholders = document.querySelectorAll('.pet-rw-drag__slot-placeholder')
    expect(placeholders.length).toBe(0)
  })

  it('renders bank cards without bank letters', () => {
    const { part4 } = makePart4Data()
    render(
      <PetRwPartContent
        examId="pet-test"
        part={part4}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    const cards = document.querySelectorAll('.pet-rw-part4-bank-card')
    expect(cards.length).toBe(5)

    // No A–H letters in bank
    const bankLetters = document.querySelectorAll('.pet-rw-drag__bank-letter')
    expect(bankLetters.length).toBe(0)
  })

  it('hides used options from bank', () => {
    const { part4, questions } = makePart4Data()
    render(
      <PetRwPartContent
        examId="pet-test"
        part={part4}
        answers={{ q16: 'a' }}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    // "They always ask lots of questions." = option A for q16 is USED
    // The other 4 options should remain

    const bankCards = document.querySelectorAll('.pet-rw-part4-bank-card')
    // After using 1 option, 4 should remain
    expect(bankCards.length).toBe(4)

    // The used sentence should NOT be in bank
    const bankText = document.querySelector('.pet-rw-part4-bank')?.textContent ?? ''
    expect(bankText).not.toContain('They always ask lots of questions')
  })

  it('has filled gap with answer displayed when answer exists', () => {
    const { part4 } = makePart4Data()
    render(
      <PetRwPartContent
        examId="pet-test"
        part={part4}
        answers={{ q16: 'a' }}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    const filledGaps = document.querySelectorAll('.pet-rw-drag__slot--inline.is-filled')
    expect(filledGaps.length).toBe(1)

    // Filled gap should contain the sentence text
    const filledText = filledGaps[0].textContent ?? ''
    expect(filledText).toContain('They always ask lots of questions')

    // The sentence option letter (A/a) should NOT appear in filled gap
    // because showOptionId=false for Part 4
    expect(filledText).not.toMatch(/\b[a-eA-E]\b/)
  })
})
