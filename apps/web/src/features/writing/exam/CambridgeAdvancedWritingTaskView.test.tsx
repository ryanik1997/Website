import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CambridgeWritingTask, CambridgeWritingTest } from '@ryan/catalog'
import CambridgeAdvancedWritingTaskView from './CambridgeAdvancedWritingTaskView'

function makeTest(level: 'b2' | 'c1' | 'c2', tasks: CambridgeWritingTask[]): Pick<CambridgeWritingTest, 'id' | 'tasks' | 'title'> {
  return {
    id: `${level}-test-01`,
    title: `${level.toUpperCase()} Test`,
    tasks,
  }
}

describe('CambridgeAdvancedWritingTaskView', () => {
  it('renders correct B2 and C2 word ranges and always keeps textarea visible', () => {
    const b2Task1: CambridgeWritingTask = {
      id: 'b2-q1',
      partNumber: 1,
      taskNumber: 1,
      title: 'Question 1',
      genre: 'essay',
      instruction: 'Essay',
      wordLimit: { min: 140, max: 190, displayText: '140-190 words' },
      promptBlocks: [{ id: 'p1', type: 'paragraph', text: 'Prompt' }],
    }
    const b2Task2: CambridgeWritingTask = {
      id: 'b2-q2',
      partNumber: 2,
      taskNumber: 2,
      title: 'Question 2',
      genre: 'review',
      instruction: 'Review',
      wordLimit: { min: 140, max: 190, displayText: '140-190 words' },
      promptBlocks: [{ id: 'p2', type: 'paragraph', text: 'Prompt 2' }],
      presentation: { template: 'plain', selectionRequired: 1 },
    }

    const { rerender } = render(
      <CambridgeAdvancedWritingTaskView
        level="b2"
        test={makeTest('b2', [b2Task1, b2Task2])}
        task={b2Task1}
        answer=""
        onAnswerChange={() => {}}
        onOpenTask={() => {}}
        isGrading={false}
        hasScore={false}
        onGrade={() => {}}
      />,
    )

    expect(screen.getByText(/Write 140-190 words/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Writing answer')).toBeInTheDocument()
    expect(screen.queryByLabelText('Answering this question?')).not.toBeInTheDocument()

    const c2Task1: CambridgeWritingTask = {
      id: 'c2-q1',
      partNumber: 1,
      taskNumber: 1,
      title: 'Question 1',
      genre: 'essay',
      instruction: 'Essay',
      wordLimit: { min: 240, max: 280, displayText: '240-280 words' },
      promptBlocks: [{ id: 't1', type: 'source-text', label: 'Text 1', title: 'One', text: 'Alpha' }],
      presentation: { template: 'source-texts', headerInstruction: 'You must answer this question. Write an essay summarising and evaluating the key points from both texts in 240-280 words.' },
    }

    rerender(
      <CambridgeAdvancedWritingTaskView
        level="c2"
        test={makeTest('c2', [c2Task1])}
        task={c2Task1}
        answer=""
        onAnswerChange={() => {}}
        onOpenTask={() => {}}
        isGrading={false}
        hasScore={false}
        onGrade={() => {}}
      />,
    )

    expect(screen.getByText(/240-280 words/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Writing answer')).toBeInTheDocument()
  })

  it('shows selector only for part 2 and keeps one task selected yes', () => {
    const part1: CambridgeWritingTask = {
      id: 'c1-q1',
      partNumber: 1,
      taskNumber: 1,
      title: 'Question 1',
      genre: 'essay',
      instruction: 'Essay',
      wordLimit: { min: 220, max: 260 },
      promptBlocks: [{ id: 'notes', type: 'panel', variant: 'notes', heading: 'Notes', listItems: ['a'] }],
    }
    const part2a: CambridgeWritingTask = {
      id: 'c1-q2',
      partNumber: 2,
      taskNumber: 2,
      title: 'Question 2',
      genre: 'proposal',
      instruction: 'Proposal',
      wordLimit: { min: 220, max: 260 },
      promptBlocks: [{ id: 'p1', type: 'paragraph', text: 'Proposal prompt' }],
      presentation: { template: 'plain', selectionRequired: 1 },
    }
    const part2b: CambridgeWritingTask = {
      id: 'c1-q3',
      partNumber: 2,
      taskNumber: 3,
      title: 'Question 3',
      genre: 'email',
      instruction: 'Email',
      wordLimit: { min: 220, max: 260 },
      promptBlocks: [{ id: 'p2', type: 'paragraph', text: 'Email prompt' }],
      presentation: { template: 'plain', selectionRequired: 1 },
    }

    render(
      <CambridgeAdvancedWritingTaskView
        level="c1"
        test={makeTest('c1', [part1, part2a, part2b])}
        task={part2a}
        answer=""
        onAnswerChange={() => {}}
        onOpenTask={() => {}}
        isGrading={false}
        hasScore={false}
        onGrade={() => {}}
      />,
    )

    const select = screen.getByLabelText('Answering this question?') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'yes' } })
    expect(select.value).toBe('yes')
    expect(screen.getByText('1 of 1 questions selected.')).toBeInTheDocument()
  })
})
