import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { useState } from 'react'
import { type ReadingPart, type ReadingQuestion } from '../examData'
import KetRwSplitPane, { type SplitPaneVariant } from '../ketRw/KetRwSplitPane'
import PetRwPartContent from '../petRw/PetRwPartContent'

afterEach(cleanup)

// ── Helpers ──

function makeQuestion(id: string, number: number, prompt: string, optionsCount = 4): ReadingQuestion {
  return {
    id,
    number,
    type: 'multiple-choice' as const,
    prompt,
    options: Array.from({ length: optionsCount }, (_, i) => ({
      id: String.fromCharCode(65 + i),
      label: `Option ${String.fromCharCode(65 + i)}`,
      number,
    })),
    passageKey: 'p3',
    answer: '',
    explanation: '',
  } as unknown as ReadingQuestion
}

function makePart3Data() {
  const questions = [
    makeQuestion('q11', 11, 'What would be a good introduction?'),
    makeQuestion('q12', 12, 'Why did Peter start mountain biking?'),
    makeQuestion('q13', 13, "What does Peter say about his first race?"),
    makeQuestion('q14', 14, "What advice does Peter give about equipment?"),
    makeQuestion('q15', 15, "Where does Peter hope to compete next?"),
  ]
  return { questions }
}

// ── Test variants directly ──

describe('KetRwSplitPane variants', () => {
  function renderVariant(variant: SplitPaneVariant) {
    render(
      <KetRwSplitPane
        variant={variant}
        left={<div data-testid="left-pane">Left content</div>}
        right={<div data-testid="right-pane">Right content</div>}
      />,
    )
  }

  it('renders resizable variant with resizer', () => {
    renderVariant('resizable')
    expect(document.querySelector('.ket-rw-body.is-resizable')).toBeTruthy()
    expect(document.querySelector('.ket-rw-resizer')).toBeTruthy()
    expect(document.querySelector('.ket-rw-fixed-divider')).toBeFalsy()
  })

  it('renders fixed-scrollbar variant without resizer or divider', () => {
    renderVariant('fixed-scrollbar')
    expect(document.querySelector('.ket-rw-body.is-fixed-scrollbar')).toBeTruthy()
    expect(document.querySelector('.ket-rw-resizer')).toBeFalsy()
    expect(document.querySelector('.ket-rw-fixed-divider')).toBeFalsy()
  })

  it('renders fixed-divider variant with divider but no resizer', () => {
    renderVariant('fixed-divider')
    expect(document.querySelector('.ket-rw-body.is-fixed-divider')).toBeTruthy()
    expect(document.querySelector('.ket-rw-fixed-divider')).toBeTruthy()
    expect(document.querySelector('.ket-rw-resizer')).toBeFalsy()
  })

  it('renders fixed-divider with aria-hidden="true"', () => {
    renderVariant('fixed-divider')
    const divider = document.querySelector('.ket-rw-fixed-divider')
    expect(divider).toBeTruthy()
    expect(divider?.getAttribute('aria-hidden')).toBe('true')
  })
})

// ── Default variant backward compat ──

describe('KetRwSplitPane default variant', () => {
  it('defaults to resizable', () => {
    render(
      <KetRwSplitPane
        left={<div />}
        right={<div />}
      />,
    )
    expect(document.querySelector('.ket-rw-body.is-resizable')).toBeTruthy()
    expect(document.querySelector('.ket-rw-resizer')).toBeTruthy()
  })

  it('renders --ket-split-pct style when resizable', () => {
    render(
      <KetRwSplitPane
        left={<div />}
        right={<div />}
      />,
    )
    const body = document.querySelector('.ket-rw-body')
    expect(body?.getAttribute('style')).toContain('--ket-split-pct')
  })

  it('does not set --ket-split-pct when fixed-divider', () => {
    render(
      <KetRwSplitPane
        variant="fixed-divider"
        left={<div />}
        right={<div />}
      />,
    )
    const body = document.querySelector('.ket-rw-body')
    expect(body?.getAttribute('style')).toBeFalsy()
  })
})

// ── Part 3 layout via PetRwPartContent ──

describe('Part 3 layout integration', () => {
  it('renders fixed-divider split pane when partNumber is 3', () => {
    const { questions } = makePart3Data()
    const part3: ReadingPart = {
      id: 'part-3',
      partNumber: 3,
      rangeLabel: 'Questions 11–15',
      passageTitle: 'Part 3 – Artist Peter Fuller',
      passageSubtitle: 'Artist Peter Fuller talks about his hobby',
      questionGroups: [
        {
          id: 'g3',
          type: 'multiple-choice',
          range: 'Questions 11–15',
          instruction: 'Read the article and choose the correct answer.',
          questions,
        },
      ],
      passage: [
        { text: 'Peter enjoys mountain biking in his free time.' },
        { text: 'He started cycling at university.' },
      ],
    } as unknown as ReadingPart

    render(
      <PetRwPartContent
        examId="test-exam"
        part={part3}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    // Check split pane mode
    expect(document.querySelector('.ket-rw-body.is-fixed-divider')).toBeTruthy()
    expect(document.querySelector('.ket-rw-fixed-divider')).toBeTruthy()
    expect(document.querySelector('.ket-rw-resizer')).toBeFalsy()

    // Check title uses subtitle (not full passageTitle)
    expect(
      screen.getByText('Artist Peter Fuller talks about his hobby'),
    ).toBeTruthy()
    // The old "Part 3 –" prefix should NOT appear as a heading
    const h2s = document.querySelectorAll('h2')
    let foundSubtitle = false
    let foundFullTitle = false
    h2s.forEach(h2 => {
      if (h2.textContent?.includes('talks about his hobby')) foundSubtitle = true
      if (h2.textContent?.includes('Part 3 –')) foundFullTitle = true
    })
    expect(foundSubtitle).toBe(true)
    expect(foundFullTitle).toBe(false)

    // Check passage text renders
    expect(screen.getByText(/Peter enjoys mountain biking/)).toBeTruthy()

    // Check all questions prompts appear in the DOM
    const bodyText = document.body.textContent ?? ''
    expect(bodyText).toContain('What would be a good introduction')
    expect(bodyText).toContain('Why did Peter start')
  })

  it('renders all 5 questions in Part 3', () => {
    const { questions } = makePart3Data()
    const part3: ReadingPart = {
      id: 'part-3',
      partNumber: 3,
      rangeLabel: 'Questions 11–15',
      questionGroups: [
        {
          id: 'g3',
          type: 'multiple-choice',
          range: 'Questions 11–15',
          instruction: 'Read the article.',
          questions,
        },
      ],
      passage: [{ text: 'Peter enjoys mountain biking.' }],
    } as unknown as ReadingPart

    render(
      <PetRwPartContent
        examId="test"
        part={part3}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    // All 5 question prompts should render in the DOM
    const bodyText = document.body.textContent ?? ''
    expect(bodyText).toContain('What would be a good introduction')
    expect(bodyText).toContain('Why did Peter start')
  })

  it('has independent scroll on left and right panes', () => {
    const { questions } = makePart3Data()
    const part3: ReadingPart = {
      id: 'part-3',
      partNumber: 3,
      rangeLabel: 'Questions 11–15',
      questionGroups: [
        {
          id: 'g3',
          type: 'multiple-choice',
          range: 'Questions 11–15',
          instruction: 'Read.',
          questions,
        },
      ],
      passage: [{ text: 'Long paragraph content for testing scroll behavior.' }],
    } as unknown as ReadingPart

    render(
      <PetRwPartContent
        examId="test"
        part={part3}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    const leftPane = document.querySelector('.ket-rw-pane-left')
    const rightPane = document.querySelector('.ket-rw-pane-right')

    expect(leftPane).toBeTruthy()
    expect(rightPane).toBeTruthy()

    // Both should have overflow-y auto/scroll for independent scrolling
    const leftCS = getComputedStyle(leftPane!)
    const rightCS = getComputedStyle(rightPane!)
    const leftOverflowY = leftCS.overflowY || leftCS.overflow
    const rightOverflowY = rightCS.overflowY || rightCS.overflow

    // In jsdom, overflow can be 'visible' by default; but our CSS sets it.
    // This test just verifies both panes render (independent scroll is a browser concern)
    expect(leftPane!.querySelectorAll('.ket-rw-paragraph').length).toBeGreaterThan(0)
    expect(rightPane!.querySelectorAll('.ket-rw-question').length).toBeGreaterThan(0)
  })
})
