import { describe, expect, it, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import { useState } from 'react'
import type { ReadingExam, ReadingPart } from '../examData'
import PetRwDragMatch from '../petRw/PetRwDragMatch'
import PetRwPartContent from '../petRw/PetRwPartContent'

afterEach(cleanup)

/* ── Fixtures ───────────────────────────────────────────────── */

function makePart(
  partNumber: number,
  overrides?: Partial<ReadingPart>,
): ReadingPart {
  const n = partNumber
  return {
    id: `part-${n}`,
    rangeLabel: `Questions ${n === 1 ? '1–5' : n === 2 ? '6–10' : '11–15'}`,
    passageTitle: `Part ${n}`,
    partNumber: n,
    passage: [
      { text: '' },
      { text: '' },
      { text: '' },
      { text: '' },
      { text: '' },
    ],
    questionGroups: [
      {
        id: `group-${n}`,
        range: `Questions ${n === 1 ? '1–5' : n === 2 ? '6–10' : '11–15'}`,
        type: 'multiple-choice',
        instruction: n === 2
          ? 'The people below all want to visit a city market.'
          : 'Choose the correct answer.',
        questions: [],
      },
    ],
    ...overrides,
  } as ReadingPart
}

function makeDragMatchQuestions(count: number, startNum: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `q-${startNum + i}`,
    number: startNum + i,
    type: 'multiple-choice' as const,
    prompt: `Person ${startNum + i}`,
    options: [],
    answer: '',
    explanation: '',
  }))
}

function makeBankOptions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: String.fromCharCode(97 + i),
    label: `Market ${String.fromCharCode(65 + i)}`,
    title: `Market ${String.fromCharCode(65 + i)}`,
    body: `Description for market ${String.fromCharCode(65 + i)}.`,
  }))
}

/* ── Drag helper — jsdom needs a mocked DataTransfer ────────── */

function createDataTransfer(): DataTransfer {
  const store = new Map<string, string>()
  return {
    setData: (k: string, v: string) => { store.set(k, v) },
    getData: (k: string) => store.get(k) ?? '',
    clearData: () => store.clear(),
    setDragImage: () => {},
    dropEffect: 'move',
    effectAllowed: 'move',
    files: [] as unknown as FileList,
    items: [] as unknown as DataTransferItemList,
    types: [] as string[],
  } as unknown as DataTransfer
}

/* ── Harness ────────────────────────────────────────────────── */

function DragMatchHarness({
  variant,
  slots,
  bank,
  showBankLetters,
}: {
  variant?: 'default' | 'cambridge-part-2'
  slots: Array<{ id: string; number: number; prompt: string }>
  bank: Array<{ id: string; label: string; title?: string; body?: string }>
  showBankLetters?: boolean
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  return (
    <div data-testid="harness">
      <PetRwDragMatch
        partId="part-2"
        variant={variant}
        slots={slots as any}
        bank={bank as any}
        answers={answers}
        activeQuestionId={activeId}
        showBankLetters={showBankLetters}
        onAnswer={(qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }))}
        onSelectQuestion={setActiveId}
      />
    </div>
  )
}

/* ── Tests ──────────────────────────────────────────────────── */

describe('PetRwDragMatch — default variant', () => {
  it('renders slots and bank in a grid layout', () => {
    render(
      <DragMatchHarness
        slots={makeDragMatchQuestions(5, 6)}
        bank={makeBankOptions(8)}
        showBankLetters
      />,
    )
    expect(document.querySelector('.pet-rw-drag')).toBeTruthy()
    expect(document.querySelector('.pet-rw-drag__slots')).toBeTruthy()
    expect(document.querySelector('.pet-rw-drag__bank')).toBeTruthy()
    expect(document.querySelector('.ket-rw-body.is-split')).toBeFalsy()
  })

  it('shows bank letters A–H by default', () => {
    render(
      <DragMatchHarness
        slots={makeDragMatchQuestions(5, 6)}
        bank={makeBankOptions(8)}
        showBankLetters
      />,
    )
    const letters = document.querySelectorAll('.pet-rw-drag__bank-letter')
    expect(letters.length).toBeGreaterThanOrEqual(8)
    expect(letters[0].textContent?.trim()).toBe('a')
  })

  it('shows Drop here placeholder in empty slots', () => {
    render(
      <DragMatchHarness
        slots={makeDragMatchQuestions(5, 6)}
        bank={makeBankOptions(8)}
      />,
    )
    const placeholders = document.querySelectorAll('.pet-rw-drag__slot-placeholder')
    expect(placeholders.length).toBe(5)
    expect(placeholders[0].textContent).toBe('Drop here')
  })

  it('shows person badge number', () => {
    render(
      <DragMatchHarness
        slots={makeDragMatchQuestions(5, 6)}
        bank={makeBankOptions(8)}
      />,
    )
    const badges = document.querySelectorAll('.pet-rw-person__num')
    expect(badges.length).toBe(5)
    expect(badges[0].textContent?.trim()).toBe('6')
  })
})

describe('PetRwDragMatch — cambridge-part-2 variant', () => {
  const fiveSlots = makeDragMatchQuestions(5, 6)
  const eightBank = makeBankOptions(8)

  it('renders KetRwSplitPane with is-split and is-fixed-scrollbar classes', () => {
    render(
      <DragMatchHarness
        variant="cambridge-part-2"
        slots={fiveSlots}
        bank={eightBank}
      />,
    )
    const splitBody = document.querySelector('.ket-rw-body.is-split')
    expect(splitBody).toBeTruthy()
    expect(splitBody?.classList.contains('is-fixed-scrollbar')).toBe(true)
    // No resizer button rendered (fixedSplit)
    expect(document.querySelector('.ket-rw-resizer')).toBeFalsy()
    expect(document.querySelector('.pet-rw-drag')).toBeFalsy()
  })

  it('has People heading', () => {
    render(
      <DragMatchHarness
        variant="cambridge-part-2"
        slots={fiveSlots}
        bank={eightBank}
      />,
    )
    expect(screen.getByText('People')).toBeTruthy()
  })

  it('has City Markets heading', () => {
    render(
      <DragMatchHarness
        variant="cambridge-part-2"
        slots={fiveSlots}
        bank={eightBank}
      />,
    )
    expect(screen.getByText('City Markets')).toBeTruthy()
  })

  it('does NOT render bank letters A–H', () => {
    render(
      <DragMatchHarness
        variant="cambridge-part-2"
        slots={fiveSlots}
        bank={eightBank}
        showBankLetters={false}
      />,
    )
    const letters = document.querySelectorAll('.pet-rw-drag__bank-letter')
    expect(letters.length).toBe(0)
  })

  it('does NOT render person badge number', () => {
    render(
      <DragMatchHarness
        variant="cambridge-part-2"
        slots={fiveSlots}
        bank={eightBank}
      />,
    )
    const badges = document.querySelectorAll('.pet-rw-person__num')
    expect(badges.length).toBe(0)
  })

  it('shows question number in empty slot placeholder instead of Drop here', () => {
    render(
      <DragMatchHarness
        variant="cambridge-part-2"
        slots={fiveSlots}
        bank={eightBank}
      />,
    )
    const placeholders = document.querySelectorAll('.pet-rw-drag__slot-placeholder')
    expect(placeholders.length).toBe(5)
    expect(placeholders[0].textContent?.trim()).toBe('6')
    expect(placeholders[4].textContent?.trim()).toBe('10')
  })

  it('renders 5 people slots', () => {
    render(
      <DragMatchHarness
        variant="cambridge-part-2"
        slots={fiveSlots}
        bank={eightBank}
      />,
    )
    const people = document.querySelectorAll('.pet-rw-person')
    expect(people.length).toBe(5)
  })

  it('renders 8 market bank cards', () => {
    render(
      <DragMatchHarness
        variant="cambridge-part-2"
        slots={fiveSlots}
        bank={eightBank}
      />,
    )
    const cards = document.querySelectorAll('.pet-rw-drag__bank-card')
    expect(cards.length).toBe(8)
  })

  it('clicking different people changes active question (Q6–Q10)', () => {
    render(
      <DragMatchHarness
        variant="cambridge-part-2"
        slots={fiveSlots}
        bank={eightBank}
      />,
    )
    const people = document.querySelectorAll('.pet-rw-person')
    expect(people.length).toBe(5)

    // Click Person 7 (index 1)
    const slotButtons = document.querySelectorAll('.pet-rw-drag__slot')
    fireEvent.click(slotButtons[1])
    expect(people[1].classList.contains('is-active')).toBe(true)
    expect(people[0].classList.contains('is-active')).toBe(false)

    // Click Person 10 (index 4)
    fireEvent.click(slotButtons[4])
    expect(people[4].classList.contains('is-active')).toBe(true)
    expect(people[1].classList.contains('is-active')).toBe(false)
  })

  it('click bank card then click slot assigns option and updates classes', () => {
    render(
      <DragMatchHarness
        variant="cambridge-part-2"
        slots={fiveSlots}
        bank={eightBank}
      />,
    )
    const bankCards = document.querySelectorAll('.pet-rw-drag__bank-card')
    const slots = document.querySelectorAll('.pet-rw-drag__slot')

    // Click first bank card (market a) → becomes picked
    fireEvent.click(bankCards[0])
    expect(bankCards[0].classList.contains('is-picked')).toBe(true)

    // Click first slot (Person 6) → assigns market a
    fireEvent.click(slots[0])
    expect(slots[0].classList.contains('is-filled')).toBe(true)
    expect(bankCards[0].classList.contains('is-picked')).toBe(false)
    expect(bankCards[0].classList.contains('is-used')).toBe(true)
  })

  it('has left pane containing People and right pane containing City Markets', () => {
    render(
      <DragMatchHarness
        variant="cambridge-part-2"
        slots={fiveSlots}
        bank={eightBank}
      />,
    )
    const leftPane = document.querySelector('.ket-rw-pane-left')
    const rightPane = document.querySelector('.ket-rw-pane-right')
    expect(leftPane).toBeTruthy()
    expect(rightPane).toBeTruthy()
    expect(within(leftPane as HTMLElement).queryByText('People')).toBeTruthy()
    expect(within(rightPane as HTMLElement).queryByText('City Markets')).toBeTruthy()
  })

  it('clear button removes assigned answer and resets slot', () => {
    render(
      <DragMatchHarness
        variant="cambridge-part-2"
        slots={fiveSlots}
        bank={eightBank}
      />,
    )
    // First assign a market
    const bankCards = document.querySelectorAll('.pet-rw-drag__bank-card')
    const slots = document.querySelectorAll('.pet-rw-drag__slot')
    const dt = createDataTransfer()
    dt.setData('text/plain', 'a')
    fireEvent.dragStart(bankCards[0], { dataTransfer: dt })
    fireEvent.drop(slots[0], { dataTransfer: dt })
    expect(slots[0].classList.contains('is-filled')).toBe(true)

    // Click the × clear button
    const clearBtn = slots[0].querySelector('.pet-rw-drag__slot-clear') as HTMLElement
    expect(clearBtn).toBeTruthy()
    fireEvent.click(clearBtn)

    expect(slots[0].classList.contains('is-filled')).toBe(false)
    expect(bankCards[0].classList.contains('is-used')).toBe(false)
  })

  it('drag and drop assigns market to person', () => {
    render(
      <DragMatchHarness
        variant="cambridge-part-2"
        slots={fiveSlots}
        bank={eightBank}
      />,
    )
    const bankCards = document.querySelectorAll('.pet-rw-drag__bank-card')
    const slots = document.querySelectorAll('.pet-rw-drag__slot')

    const dt = createDataTransfer()
    dt.setData('text/plain', 'a')

    // Use fireEvent with dataTransfer in event options
    fireEvent.dragStart(bankCards[0], { dataTransfer: dt })
    fireEvent.drop(slots[0], { dataTransfer: dt })

    expect(slots[0].classList.contains('is-filled')).toBe(true)
    expect(bankCards[0].classList.contains('is-used')).toBe(true)
  })
})

describe('PetRwPartContent — Part 2 branch', () => {
  const examId = 'pet-test'

  it('non-pageImage Part 2 renders split layout with headings', () => {
    const part2 = makePart(2)
    part2.passage = [{ text: 'Some text about markets.' }]
    part2.questionGroups[0].questions = makeDragMatchQuestions(5, 6) as any

    render(
      <PetRwPartContent
        examId={examId}
        part={part2}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    expect(document.querySelector('.ket-rw-body.is-split')).toBeTruthy()
    expect(screen.getByText('People')).toBeTruthy()
    expect(screen.getByText('City Markets')).toBeTruthy()
  })

  it('pageImage Part 2 keeps old single layout', () => {
    const part2 = makePart(2)
    part2.passage = [
      { text: '', imageKey: 'full-page-image', imageUrl: 'https://example.com/img.jpg' },
    ]
    part2.questionGroups[0].questions = makeDragMatchQuestions(5, 6) as any

    render(
      <PetRwPartContent
        examId={examId}
        part={part2}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    expect(document.querySelector('.ket-rw-body.is-split')).toBeFalsy()
    expect(document.querySelector('.ket-rw-body.is-single')).toBeTruthy()
  })

  it('Part 1 renders single layout (not split)', () => {
    const part1 = makePart(1)
    part1.questionGroups[0].questions = makeDragMatchQuestions(5, 1) as any

    render(
      <PetRwPartContent
        examId={examId}
        part={part1}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    expect(document.querySelector('.ket-rw-body.is-split')).toBeFalsy()
    expect(document.querySelector('.ket-rw-body.is-single')).toBeTruthy()
  })

  it('Part 3 renders its own split layout (no is-part-2 CSS leak)', () => {
    const part3 = makePart(3)
    part3.questionGroups[0].questions = makeDragMatchQuestions(5, 11) as any

    render(
      <PetRwPartContent
        examId={examId}
        part={part3}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    // Part 3 uses KetRwSplitPane normally
    expect(document.querySelector('.ket-rw-body.is-split')).toBeTruthy()
    // Verify no is-part-2 class is rendered anywhere in the tree
    // (the is-part-2 class is only added by ReadingPetRwTest shell,
    //  not by PetRwPartContent itself)
    expect(document.querySelector('.is-part-2')).toBeFalsy()
  })
})
