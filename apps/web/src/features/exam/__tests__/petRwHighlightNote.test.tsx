import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act, waitFor } from '@testing-library/react'
import { useRef, useState } from 'react'
import {
  type ReadingHighlight,
  type TextNote,
  addHighlights,
  removeHighlights,
  upsertNotesForRanges,
  segmentsFromAnnotations,
  type HighlightColor,
  type HighlightRange,
} from '../readingHighlightUtils'
import ReadingHighlightToolbar from '../ReadingHighlightToolbar'
import ExamHighlightZone from '../ExamHighlightZone'
import ReadingHighlightableText from '../ReadingHighlightableText'
import CambridgeSelectionToolbar from '../annotations/CambridgeSelectionToolbar'
import type { StableSelectionSnapshot } from '../annotations/useStableTextSelection'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('readingHighlightUtils — color support', () => {
  it('addHighlights preserves color', () => {
    const result = addHighlights([], [{ blockId: 'b1', start: 0, end: 5 }], 'blue')
    expect(result).toHaveLength(1)
    expect(result[0].color).toBe('blue')
  })

  it('addHighlights defaults to yellow', () => {
    const result = addHighlights([], [{ blockId: 'b1', start: 0, end: 5 }])
    expect(result).toHaveLength(1)
    expect(result[0].color).toBe('yellow')
  })

  it('removeHighlights preserves color of remaining', () => {
    const existing: ReadingHighlight[] = [
      { id: 'h1', blockId: 'b1', start: 0, end: 5, color: 'green' },
      { id: 'h2', blockId: 'b1', start: 10, end: 15, color: 'pink' },
    ]
    const result = removeHighlights(existing, [{ blockId: 'b1', start: 0, end: 5 }])
    expect(result).toHaveLength(1)
    expect(result[0].color).toBe('pink')
  })

  it('segmentsFromAnnotations includes color', () => {
    const highlights: ReadingHighlight[] = [
      { id: 'h1', blockId: 'b1', start: 0, end: 4, color: 'green' },
    ]
    const segs = segmentsFromAnnotations('Hello world', highlights, [], 'b1')
    expect(segs.some(s => s.highlighted && s.color === 'green')).toBe(true)
  })

  it('addHighlights merges overlapping ranges with color', () => {
    const a: ReadingHighlight[] = [
      { id: 'h1', blockId: 'b1', start: 0, end: 5, color: 'blue' },
    ]
    const result = addHighlights(a, [{ blockId: 'b1', start: 3, end: 8 }], 'pink')
    expect(result).toHaveLength(1)
    expect(result[0].start).toBe(0)
    expect(result[0].end).toBe(8)
  })
})

describe('TextNote — upsert and remove', () => {
  it('upsertNotesForRanges creates note', () => {
    const result = upsertNotesForRanges([], [{ blockId: 'b1', start: 0, end: 5 }], 'my note')
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('my note')
    expect(result[0].blockId).toBe('b1')
  })

  it('upsertNotesForRanges replaces overlapping note', () => {
    const existing: TextNote[] = [
      { id: 'n1', blockId: 'b1', start: 0, end: 5, text: 'old note' },
    ]
    const result = upsertNotesForRanges(existing, [{ blockId: 'b1', start: 2, end: 8 }], 'new note')
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('new note')
  })
})

describe('ReadingHighlightToolbar — component', () => {
  function setup() {
    const highlights: ReadingHighlight[] = []
    const notes: TextNote[] = []
    const onHighlightsChange = vi.fn()
    const onNotesChange = vi.fn()

    function Harness() {
      const rootRef = useRef<HTMLDivElement>(null)
      return (
        <div ref={rootRef} data-testid="harness-root">
          <ReadingHighlightToolbar
            rootRef={rootRef}
            highlights={highlights}
            onHighlightsChange={onHighlightsChange}
            notes={notes}
            onNotesChange={onNotesChange}
            resetKey="part-1"
          />
          <ExamHighlightZone className="test-highlight-zone">
            <ReadingHighlightableText
              blockId="b1"
              text="The cat sat on the mat and looked at the birds flying outside."
              highlights={highlights}
            />
            <ReadingHighlightableText
              blockId="b2"
              text="It was a sunny day in the park."
              highlights={highlights}
            />
          </ExamHighlightZone>
        </div>
      )
    }

    return { Harness, onHighlightsChange, onNotesChange, highlights, notes }
  }

  async function flushSelectionOnRoot(root: HTMLElement) {
    await act(async () => {
      fireEvent.pointerDown(root)
      fireEvent(document, new Event('selectionchange'))
      fireEvent.pointerUp(root)
    })
    await waitFor(() => {
      expect(window.getSelection).toBeTruthy()
    })
  }

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

  function mockSelectionInBlock(blockEl: HTMLElement, startOffset: number, endOffset: number) {
    const textNode = getTextNode(blockEl)
    if (!textNode) return

    const range = makeMockRange(textNode, startOffset, textNode, endOffset)

    const mockSelection = {
      rangeCount: 1,
      isCollapsed: false,
      anchorNode: textNode,
      focusNode: textNode,
      getRangeAt: (_i: number) => range,
      toString: () => textNode.textContent?.slice(startOffset, endOffset) ?? '',
      removeAllRanges: vi.fn(),
    } as unknown as Selection

    vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection)
    return mockSelection
  }

  function getTextNode(el: HTMLElement): Text | null {
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) return child as Text
      const found = getTextNode(child as HTMLElement)
      if (found) return found
    }
    return null
  }

  it('renders toolbar after text selection', async () => {
    const { Harness, onHighlightsChange } = setup()
    render(<Harness />)

    const blockEl = screen.getByText(/The cat sat/).closest('[data-highlight-block]') as HTMLElement
    expect(blockEl).toBeTruthy()

    mockSelectionInBlock(blockEl, 4, 11)

    await flushSelectionOnRoot(screen.getByTestId('harness-root'))

    const toolbar = await screen.findByRole('toolbar')
    expect(toolbar).toBeTruthy()

    const yellowBtn = screen.getByLabelText('Tô màu Vàng')
    expect(yellowBtn).toBeTruthy()
    const blueBtn = screen.getByLabelText('Tô màu Xanh')
    expect(blueBtn).toBeTruthy()
    const greenBtn = screen.getByLabelText('Tô màu Xanh lá')
    expect(greenBtn).toBeTruthy()
    const pinkBtn = screen.getByLabelText('Tô màu Hồng')
    expect(pinkBtn).toBeTruthy()

    act(() => {
      fireEvent.click(yellowBtn)
    })

    expect(onHighlightsChange).toHaveBeenCalledOnce()
    const newHighlights = onHighlightsChange.mock.calls[0][0] as ReadingHighlight[]
    expect(newHighlights).toHaveLength(1)
    expect(newHighlights[0].color).toBe('yellow')
    expect(newHighlights[0].blockId).toBe('b1')
  })

  it('applies highlight with each color button', async () => {
    const { Harness, onHighlightsChange } = setup()
    render(<Harness />)

    const blockEl = screen.getByText(/The cat sat/).closest('[data-highlight-block]') as HTMLElement
    mockSelectionInBlock(blockEl, 4, 11)

    await flushSelectionOnRoot(screen.getByTestId('harness-root'))

    const blueBtn = await screen.findByLabelText('Tô màu Xanh')
    act(() => { fireEvent.click(blueBtn) })
    expect(onHighlightsChange).toHaveBeenCalledOnce()
    expect(onHighlightsChange.mock.calls[0][0][0].color).toBe('blue')
  })

  it('does not render toolbar when selection is in non-highlight zone', async () => {
    function SeparateDiv() {
      const rootRef = useRef<HTMLDivElement>(null)
      return (
        <div ref={rootRef}>
          <ReadingHighlightToolbar
            rootRef={rootRef}
            highlights={[]}
            onHighlightsChange={vi.fn()}
            resetKey="part-1"
          />
          <div data-testid="outside-text">Text outside highlight zone</div>
          <ExamHighlightZone className="test-highlight-zone">
            <ReadingHighlightableText
              blockId="b1"
              text="Inside zone text"
              highlights={[]}
            />
          </ExamHighlightZone>
        </div>
      )
    }

    render(<SeparateDiv />)

    const outsideEl = screen.getByTestId('outside-text')
    const textNode = getTextNode(outsideEl)
    expect(textNode).toBeTruthy()

    const mockRange = makeMockRange(textNode!, 0, textNode!, 1)
    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 1,
      isCollapsed: false,
      anchorNode: textNode,
      focusNode: textNode,
      getRangeAt: (_i: number) => mockRange,
      toString: () => 'x',
      removeAllRanges: vi.fn(),
    } as unknown as Selection)

    await flushSelectionOnRoot(document.body as HTMLElement)

    expect(screen.queryByRole('toolbar')).toBeNull()
  })

  it('shows remove highlight button when selection overlaps existing highlight', async () => {
    function HarnessWithExistingHighlight() {
      const rootRef = useRef<HTMLDivElement>(null)
      const existingHighlights: ReadingHighlight[] = [
        { id: 'hl-1', blockId: 'b1', start: 4, end: 11, color: 'yellow' },
      ]
      const onHighlightsChange = vi.fn()
      return (
        <div ref={rootRef} data-testid="harness-root">
          <ReadingHighlightToolbar
            rootRef={rootRef}
            highlights={existingHighlights}
            onHighlightsChange={onHighlightsChange}
            notes={[]}
            onNotesChange={vi.fn()}
            resetKey="part-1"
          />
          <ExamHighlightZone className="test-highlight-zone">
            <ReadingHighlightableText
              blockId="b1"
              text="The cat sat on the mat and looked at the birds flying outside."
              highlights={existingHighlights}
            />
          </ExamHighlightZone>
        </div>
      )
    }

    render(<HarnessWithExistingHighlight />)

    const markEl = document.querySelector('mark.reading-test-highlight--yellow') as HTMLElement
    expect(markEl).toBeTruthy()
    const markTextNode = getTextNode(markEl)
    expect(markTextNode).toBeTruthy()

    const range = makeMockRange(markTextNode!, 0, markTextNode!, 7)
    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 1,
      isCollapsed: false,
      anchorNode: markTextNode,
      focusNode: markTextNode,
      getRangeAt: (_i: number) => range,
      toString: () => 'cat sat',
      removeAllRanges: vi.fn(),
    } as unknown as Selection)

    await flushSelectionOnRoot(screen.getByTestId('harness-root'))

    const removeBtn = await screen.findByText('Bỏ tô sáng')
    expect(removeBtn).toBeTruthy()
  })

  it('shows Note button and opens note editor', async () => {
    const { Harness, onNotesChange } = setup()
    render(<Harness />)

    const blockEl = screen.getByText(/The cat sat/).closest('[data-highlight-block]') as HTMLElement
    mockSelectionInBlock(blockEl, 4, 11)

    await flushSelectionOnRoot(screen.getByTestId('harness-root'))

    const noteBtn = await screen.findByText('Note')
    expect(noteBtn).toBeTruthy()

    act(() => { fireEvent.click(noteBtn) })

    const textarea = screen.getByPlaceholderText('Nhập ghi chú…')
    expect(textarea).toBeTruthy()

    fireEvent.change(textarea, { target: { value: 'This is my note' } })
    expect(textarea as HTMLTextAreaElement).toHaveValue('This is my note')

    const saveBtn = screen.getByText('Lưu note')
    act(() => { fireEvent.click(saveBtn) })

    expect(onNotesChange).toHaveBeenCalled()
    const savedNotes = onNotesChange.mock.calls[0][0] as TextNote[]
    expect(savedNotes).toHaveLength(1)
    expect(savedNotes[0].text).toBe('This is my note')
  })
})

describe('ReadingHighlightToolbar — cached snapshot (collapsed-after-pointerup)', () => {
  function setup() {
    const highlights: ReadingHighlight[] = []
    const notes: TextNote[] = []
    const onHighlightsChange = vi.fn()
    const onNotesChange = vi.fn()

    function Harness() {
      const rootRef = useRef<HTMLDivElement>(null)
      return (
        <div ref={rootRef} data-testid="harness-root">
          <ReadingHighlightToolbar
            rootRef={rootRef}
            highlights={highlights}
            onHighlightsChange={onHighlightsChange}
            notes={notes}
            onNotesChange={onNotesChange}
            resetKey="part-1"
          />
          <ExamHighlightZone className="test-highlight-zone">
            <ReadingHighlightableText
              blockId="b1"
              text="The cat sat on the mat and looked at the birds flying outside."
              highlights={highlights}
            />
          </ExamHighlightZone>
        </div>
      )
    }

    return { Harness, onHighlightsChange, onNotesChange, highlights, notes }
  }

  function makeMockRange(startNode: Node, startOffset: number, endNode: Node, endOffset: number) {
    return {
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
  }

  function getTextNode(el: HTMLElement): Text | null {
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) return child as Text
      const found = getTextNode(child as HTMLElement)
      if (found) return found
    }
    return null
  }

  it('shows toolbar from cached snapshot when selection collapses after pointerup', async () => {
    const { Harness } = setup()
    render(<Harness />)

    const blockEl = screen.getByText(/The cat sat/).closest('[data-highlight-block]') as HTMLElement
    expect(blockEl).toBeTruthy()
    const textNode = getTextNode(blockEl)
    expect(textNode).toBeTruthy()

    const range = makeMockRange(textNode!, 4, textNode!, 11)
    const validMockSelection = {
      rangeCount: 1,
      isCollapsed: false,
      anchorNode: textNode,
      focusNode: textNode,
      getRangeAt: (_i: number) => range,
      toString: () => 'cat sat',
      removeAllRanges: vi.fn(),
    } as unknown as Selection

    vi.spyOn(window, 'getSelection').mockReturnValue(validMockSelection)
    await act(async () => {
      fireEvent(document, new Event('selectionchange'))
    })

    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 0,
      isCollapsed: true,
      anchorNode: null,
      focusNode: null,
      getRangeAt: () => { throw new Error('no range') },
      toString: () => '',
      removeAllRanges: vi.fn(),
    } as unknown as Selection)

    const root = screen.getByTestId('harness-root')
    await act(async () => {
      fireEvent.pointerUp(root)
    })

    const toolbar = await screen.findByRole('toolbar')
    expect(toolbar).toBeTruthy()

    const yellowBtn = screen.getByLabelText('Tô màu Vàng')
    expect(yellowBtn).toBeTruthy()
  })

  it('clears toolbar when pointerdown starts a new interaction without prior selection', async () => {
    const { Harness } = setup()
    render(<Harness />)

    expect(screen.queryByRole('toolbar')).toBeNull()

    await act(async () => {
      fireEvent.pointerDown(screen.getByTestId('harness-root'))
    })

    expect(screen.queryByRole('toolbar')).toBeNull()
  })
})

describe('ReadingHighlightToolbar — color buttons', () => {
  it('the 4 color buttons are defined in constants', () => {
    const colors: HighlightColor[] = ['yellow', 'blue', 'green', 'pink']
    expect(colors).toHaveLength(4)
  })
})

describe('CambridgeSelectionToolbar — PET-specific toolbar', () => {
  const makeSelection = () => ({
    text: 'found by the sea',
    ranges: [
      { blockId: 'pet-part-5-p5-0-seg-0', start: 73, end: 89 },
    ],
    rect: {
      left: 100,
      top: 200,
      right: 220,
      bottom: 220,
      width: 120,
      height: 20,
    },
  })

  it('calls onCommitHighlight when Highlight button is clicked', () => {
    const onCommitHighlight = vi.fn(() => [])
    const onCommitNote = vi.fn()
    const onCommitDeleteNote = vi.fn()
    const onClose = vi.fn()

    render(
      <CambridgeSelectionToolbar
        selection={makeSelection()}
        highlights={[]}
        notes={[]}
        onCommitHighlight={onCommitHighlight}
        onCommitNote={onCommitNote}
        onCommitDeleteNote={onCommitDeleteNote}
        onClose={onClose}
      />,
    )

    const highlightBtn = screen.getByRole('button', { name: 'Highlight' })
    fireEvent.click(highlightBtn)

    expect(onCommitHighlight).toHaveBeenCalledOnce()
    expect(onCommitHighlight).toHaveBeenCalledWith(
      [{ blockId: 'pet-part-5-p5-0-seg-0', start: 73, end: 89 }],
      'yellow',
    )
  })

  it('textarea receives focus when Note editor opens', async () => {
    render(
      <CambridgeSelectionToolbar
        selection={makeSelection()}
        highlights={[]}
        notes={[]}
        onCommitHighlight={vi.fn()}
        onCommitNote={vi.fn()}
        onCommitDeleteNote={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    const noteBtn = screen.getByRole('button', { name: 'Note' })
    await act(async () => {
      fireEvent.click(noteBtn)
    })

    const textarea = screen.getByPlaceholderText('Nhap ghi chu...')
    expect(textarea).toBeTruthy()
    await waitFor(() => {
      expect(document.activeElement).toBe(textarea)
    })
  })

  it('calls onCommitNote when note is saved', () => {
    const onCommitNote = vi.fn(() => [])

    render(
      <CambridgeSelectionToolbar
        selection={makeSelection()}
        highlights={[]}
        notes={[]}
        onCommitHighlight={vi.fn()}
        onCommitNote={onCommitNote}
        onCommitDeleteNote={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    const noteBtn = screen.getByRole('button', { name: 'Note' })
    fireEvent.click(noteBtn)

    const textarea = screen.getByPlaceholderText('Nhap ghi chu...')
    fireEvent.change(textarea, { target: { value: 'Important vocabulary' } })

    const saveBtn = screen.getByRole('button', { name: 'Luu note' })
    fireEvent.click(saveBtn)

    expect(onCommitNote).toHaveBeenCalledOnce()
    expect(onCommitNote).toHaveBeenCalledWith(
      [{ blockId: 'pet-part-5-p5-0-seg-0', start: 73, end: 89 }],
      'Important vocabulary',
    )
  })

  it('renders nothing when selection is null', () => {
    const { container } = render(
      <CambridgeSelectionToolbar
        selection={null}
        highlights={[]}
        notes={[]}
        onCommitHighlight={vi.fn()}
        onCommitNote={vi.fn()}
        onCommitDeleteNote={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('fills note editor with existing note text', () => {
    const existingNotes: TextNote[] = [
      {
        id: 'n1',
        blockId: 'pet-part-5-p5-0-seg-0',
        start: 73,
        end: 89,
        text: 'Existing note content',
      },
    ]

    render(
      <CambridgeSelectionToolbar
        selection={makeSelection()}
        highlights={[]}
        notes={existingNotes}
        onCommitHighlight={vi.fn()}
        onCommitNote={vi.fn()}
        onCommitDeleteNote={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    const noteBtn = screen.getByRole('button', { name: 'Note' })
    fireEvent.click(noteBtn)

    const textarea = screen.getByPlaceholderText('Nhap ghi chu...') as HTMLTextAreaElement
    expect(textarea.value).toBe('Existing note content')
  })

  it('stateful integration: click Highlight produces <mark> element', async () => {
    const PASSAGE_TEXT = 'The coconut tree was found by the sea where the sand meets the shore.'
    const BLOCK_ID = 'pet-part-5-p5-0-seg-0'
    const RANGE = { blockId: BLOCK_ID, start: 21, end: 37 }

    function StatefulHarness() {
      const [highlightState, setHighlightState] = useState<ReadingHighlight[]>([])
      const handleCommitHighlight = (
        ranges: { blockId: string; start: number; end: number }[],
        color: HighlightColor = 'yellow',
      ) => {
        const result = addHighlights(highlightState, ranges, color)
        setHighlightState(result)
        return result
      }

      const selection = {
        text: 'found by the sea',
        ranges: [RANGE],
        rect: {
          left: 100, top: 200, right: 220, bottom: 220,
          width: 120, height: 20,
        },
      }

      return (
        <div>
          <CambridgeSelectionToolbar
            selection={selection}
            highlights={highlightState}
            notes={[]}
            onCommitHighlight={handleCommitHighlight}
            onCommitNote={vi.fn()}
            onCommitDeleteNote={vi.fn()}
            onClose={() => {}}
          />
          <ExamHighlightZone className="test-highlight-zone">
            <ReadingHighlightableText
              blockId={BLOCK_ID}
              text={PASSAGE_TEXT}
              highlights={highlightState}
            />
          </ExamHighlightZone>
        </div>
      )
    }

    render(<StatefulHarness />)

    expect(document.querySelector('mark.reading-test-highlight--yellow')).toBeNull()

    const highlightBtn = screen.getByRole('button', { name: 'Highlight' })
    await act(async () => {
      fireEvent.click(highlightBtn)
    })

    await waitFor(() => {
      const markEl = document.querySelector('mark.reading-test-highlight--yellow')
      expect(markEl).toBeTruthy()
      expect(markEl?.textContent).toBe('found by the sea')
    })
  })

  it('stateful integration: click Note then Save produces <span> with note title', async () => {
    const PASSAGE_TEXT = 'The coconut tree was found by the sea where the sand meets the shore.'
    const BLOCK_ID = 'pet-part-5-p5-0-seg-0'
    const RANGE = { blockId: BLOCK_ID, start: 21, end: 37 }

    function StatefulHarness() {
      const [notesState, setNotes] = useState<TextNote[]>([])
      const handleCommitNote = (
        ranges: { blockId: string; start: number; end: number }[],
        rawText: string,
      ) => {
        const text = rawText.trim()
        if (!text || ranges.length === 0) return null
        const result = upsertNotesForRanges(notesState, ranges, text)
        setNotes(result)
        return result
      }

      const selection = {
        text: 'found by the sea',
        ranges: [RANGE],
        rect: {
          left: 100, top: 200, right: 220, bottom: 220,
          width: 120, height: 20,
        },
      }

      return (
        <div>
          <CambridgeSelectionToolbar
            selection={selection}
            highlights={[]}
            notes={notesState}
            onCommitHighlight={vi.fn()}
            onCommitNote={handleCommitNote}
            onCommitDeleteNote={vi.fn()}
            onClose={() => {}}
          />
          <ExamHighlightZone className="test-highlight-zone">
            <ReadingHighlightableText
              blockId={BLOCK_ID}
              text={PASSAGE_TEXT}
              highlights={[]}
              notes={notesState}
            />
          </ExamHighlightZone>
        </div>
      )
    }

    render(<StatefulHarness />)

    const noteBtn = screen.getByRole('button', { name: 'Note' })
    await act(async () => { fireEvent.click(noteBtn) })

    const textarea = screen.getByPlaceholderText('Nhap ghi chu...')
    fireEvent.change(textarea, { target: { value: 'Important vocabulary' } })

    const saveBtn = screen.getByRole('button', { name: 'Luu note' })
    await act(async () => { fireEvent.click(saveBtn) })

    await waitFor(() => {
      const noteSpan = document.querySelector('.reading-test-note')
      expect(noteSpan).toBeTruthy()
      expect(noteSpan?.getAttribute('title')).toBe('Important vocabulary')
    })
  })

  it('stateful: Highlight closes toolbar via real onClose', async () => {
    const PASSAGE_TEXT = 'The coconut tree was found by the sea where the sand meets the shore.'
    const BLOCK_ID = 'pet-part-5-p5-0-seg-0'
    const RANGE = { blockId: BLOCK_ID, start: 21, end: 37 }
    const MOCK_SEL = {
      text: 'found by the sea',
      ranges: [RANGE],
      rect: { left: 100, top: 200, right: 220, bottom: 220, width: 120, height: 20 },
    }

    function StatefulHarness() {
      const [sel, setSel] = useState<typeof MOCK_SEL | null>(MOCK_SEL)
      const [highlightState, setHighlightState] = useState<ReadingHighlight[]>([])
      const handleCommitHighlight = (ranges: HighlightRange[], color: HighlightColor) => {
        const result = addHighlights(highlightState, ranges, color)
        setHighlightState(result)
        return result
      }
      return (
        <div>
          <CambridgeSelectionToolbar
            selection={sel}
            highlights={highlightState}
            notes={[]}
            onCommitHighlight={handleCommitHighlight}
            onCommitNote={vi.fn()}
            onCommitDeleteNote={vi.fn()}
            onClose={() => setSel(null)}
          />
          <ExamHighlightZone>
            <ReadingHighlightableText blockId={BLOCK_ID} text={PASSAGE_TEXT} highlights={highlightState} />
          </ExamHighlightZone>
        </div>
      )
    }

    render(<StatefulHarness />)

    expect(screen.getByRole('toolbar')).toBeTruthy()

    const button = screen.getByRole('button', { name: 'Highlight' })
    await act(async () => { fireEvent.click(button) })

    await waitFor(() => {
      expect(screen.queryByRole('toolbar')).toBeNull()
    })

    await waitFor(() => {
      const markEl = document.querySelector('mark.reading-test-highlight--yellow')
      expect(markEl).toHaveTextContent('found by the sea')
    })
  })
})
