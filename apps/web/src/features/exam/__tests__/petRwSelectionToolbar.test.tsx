import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRef, useState } from 'react'
import type { ReadingQuestion } from '../examData'
import type { ReadingHighlight, TextNote } from '../readingHighlightUtils'
import RwExamMain from '../rwHighlight/RwExamMain'
import RwMcRadioQuestion from '../rwHighlight/RwMcRadioQuestion'

function makeMockRange(startNode: Node, startOffset: number, endNode: Node, endOffset: number) {
  const range = {
    startContainer: startNode,
    startOffset,
    endContainer: endNode,
    endOffset,
    collapsed: false,
    commonAncestorContainer: startNode.parentElement ?? document.body,
    getBoundingClientRect: () => ({
      x: 100, y: 200, width: 300, height: 20,
      top: 200, right: 400, bottom: 220, left: 100,
      toJSON: () => ({}),
    }),
    getClientRects: () => [],
    cloneRange: () => makeMockRange(startNode, startOffset, endNode, endOffset),
    detach: () => {},
    setStart: () => {},
    setEnd: () => {},
    selectNodeContents: () => {},
  }

  return range
}

function getTextNode(el: HTMLElement): Text | null {
  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) return child as Text
    const found = getTextNode(child as HTMLElement)
    if (found) return found
  }
  return null
}

describe('PET Reading note/highlight', () => {
  it('shows the selection toolbar for question prompt text', async () => {
    const question: ReadingQuestion = {
      id: 'q1',
      number: 1,
      prompt: 'What does the notice tell people to do?',
      explanation: '',
      options: [
        { id: 'A', label: 'Park near the gate' },
        { id: 'B', label: 'Wait outside the farm office' },
        { id: 'C', label: 'Use the campsite reception first' },
      ],
      answer: 'C',
      type: 'multiple-choice',
    }

    function Harness() {
      const rootRef = useRef<HTMLDivElement>(null)
      const [highlights, setHighlights] = useState<ReadingHighlight[]>([])
      const [notes, setNotes] = useState<TextNote[]>([])

      return (
        <RwExamMain
          partId="pet-part-1"
          highlights={highlights}
          notes={notes}
          onHighlightsChange={setHighlights}
          onNotesChange={setNotes}
          mainRef={rootRef}
        >
          <RwMcRadioQuestion
            partId="pet-part-1"
            question={question}
            answers={{}}
            onSelectQuestion={vi.fn()}
            onAnswer={vi.fn()}
          />
        </RwExamMain>
      )
    }

    render(<Harness />)
    const main = document.querySelector('.ket-rw-main') as HTMLElement

    const promptBlock = screen
      .getByText('What does the notice tell people to do?')
      .closest('[data-highlight-block]') as HTMLElement

    expect(promptBlock).toBeTruthy()

    const textNode = getTextNode(promptBlock)
    expect(textNode).toBeTruthy()

    const selectionRange = makeMockRange(textNode!, 5, textNode!, 21)

    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 1,
      isCollapsed: false,
      anchorNode: textNode,
      focusNode: textNode,
      getRangeAt: () => selectionRange,
      toString: () => 'does the notice',
      removeAllRanges: vi.fn(),
    } as unknown as Selection)

    await act(async () => {
      fireEvent.pointerDown(main)
      fireEvent.pointerUp(main)
    })

    expect(await screen.findByRole('toolbar')).toBeTruthy()

    await act(async () => {
      fireEvent.click(screen.getByText('Note'))
    })

    expect(await screen.findByPlaceholderText('Nhập ghi chú…')).toBeTruthy()
  })
})
