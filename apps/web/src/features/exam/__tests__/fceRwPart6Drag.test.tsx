import { describe, expect, it, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import type { ReadingPart } from '../examData'
import FceRwPartContent from '../fceRw/FceRwPartContent'

afterEach(cleanup)

/* Part 6 gapped text: 2 gap trong bài đọc + bank A/B/C */
function makePart6(): ReadingPart {
  return {
    id: 'part-6',
    rangeLabel: 'Questions 37–38',
    passageTitle: 'Gapped text',
    partNumber: 6,
    passage: [
      { text: 'Mở đầu (37) rồi tiếp tục (38) và kết thúc.' },
      { label: 'A', text: 'Câu A.' },
      { label: 'B', text: 'Câu B.' },
      { label: 'C', text: 'Câu C.' },
    ],
    questionGroups: [
      {
        id: 'group-6',
        range: 'Questions 37–38',
        type: 'multiple-choice',
        instruction: 'Choose the sentence which fits each gap.',
        questions: [37, 38].map(n => ({
          id: `q-${n}`,
          number: n,
          type: 'multiple-choice' as const,
          prompt: `Gap (${n})`,
          options: [],
          answer: '',
          explanation: '',
        })),
      },
    ],
  } as unknown as ReadingPart
}

function makePart7(): ReadingPart {
  return {
    id: 'part-7',
    rangeLabel: 'Questions 43–52',
    passageTitle: 'Multiple matching',
    partNumber: 7,
    passage: [
      { label: 'A', text: 'Graham Button talks about his father.' },
      { label: 'B', text: 'Sue Smith talks about her mother.' },
      { label: 'C', text: 'Barry Porter talks about acting.' },
      { label: 'D', text: 'Ruth Lawrence talks about teaching.' },
    ],
    questionGroups: [{ id: 'group-7', range: 'Questions 43–52', type: 'matching-features', instruction: '', questions: [] }],
  } as unknown as ReadingPart
}

function Harness() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  return (
    <FceRwPartContent
      examId="exam-1"
      part={makePart6()}
      answers={answers}
      activeQuestionId={null}
      onSelectQuestion={() => {}}
      onAnswer={(id, value) => setAnswers(prev => ({ ...prev, [id]: value }))}
      reviewMode={false}
      reviewStatusMap={{}}
    />
  )
}

const gap = (n: number) => screen.getByRole('button', { name: new RegExp(`^Gap ${n},`) })
const token = (letter: string) => screen.getByRole('button', { name: new RegExp(`^Option ${letter}`) })

describe('FCE Part 6 — kéo thả gapped text', () => {
  it('bấm token rồi bấm gap thì gán được đáp án (đường bàn phím)', () => {
    render(<Harness />)
    fireEvent.click(token('A'))
    fireEvent.click(gap(37))
    expect(gap(37)).toHaveAccessibleName(/answer A/i)
  })

  it('nhấc token đã đặt sang gap khác — gap cũ tự trống, không nhân bản', () => {
    render(<Harness />)
    fireEvent.click(token('A'))
    fireEvent.click(gap(37))
    expect(gap(37)).toHaveAccessibleName(/answer A/i)

    fireEvent.click(token('A'))
    fireEvent.click(gap(38))

    expect(gap(38)).toHaveAccessibleName(/answer A/i)
    expect(gap(37)).toHaveAccessibleName(/empty/i)
  })

  it('nút × trả token về bank', () => {
    render(<Harness />)
    fireEvent.click(token('A'))
    fireEvent.click(gap(37))
    fireEvent.click(screen.getByRole('button', { name: /Clear gap 37/ }))

    expect(gap(37)).toHaveAccessibleName(/empty/i)
  })

  it('drop event gán đúng gap', () => {
    render(<Harness />)
    fireEvent.drop(gap(38), { dataTransfer: { getData: () => 'B' } })
    expect(gap(38)).toHaveAccessibleName(/answer B/i)
  })
})

describe('FCE Part 7 — section labels', () => {
  it('renders every A–D label as its own punctuated heading', () => {
    render(
      <FceRwPartContent
        examId="exam-1"
        part={makePart7()}
        answers={{}}
        activeQuestionId={null}
        onSelectQuestion={() => {}}
        onAnswer={() => {}}
      />,
    )

    for (const label of ['A.', 'B.', 'C.', 'D.']) {
      expect(screen.getByText(label, { selector: '.fce-rw-paragraph-heading' })).toBeVisible()
    }
  })
})
