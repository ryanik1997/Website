import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import {
  type ReadingHighlight,
  type TextNote,
  addHighlights,
  upsertNotesForRanges,
  type HighlightColor,
} from '../readingHighlightUtils'
import ExamHighlightZone from '../ExamHighlightZone'
import ReadingHighlightableText from '../ReadingHighlightableText'
import CambridgeSelectionToolbar from '../annotations/CambridgeSelectionToolbar'
import type { StableSelectionSnapshot } from '../annotations/useStableTextSelection'
import { ExamHighlightProvider } from '../examHighlightContext'
import { usePartHighlights } from '../usePartHighlights'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('KET Cambridge Annotation — unit', () => {
  it('calls onCommitHighlight when Highlight button is clicked', () => {
    const onCommitHighlight = vi.fn(() => [])
    const onCommitNote = vi.fn()
    const onCommitDeleteNote = vi.fn()
    const onClose = vi.fn()

    render(
      <CambridgeSelectionToolbar
        selection={{
          text: 'locally-produced food',
          ranges: [{ blockId: 'ket-part-2-txt-0', start: 19, end: 40 }],
          rect: { left: 100, top: 200, right: 260, bottom: 220, width: 160, height: 20 },
        }}
        highlights={[]}
        notes={[]}
        onCommitHighlight={onCommitHighlight}
        onCommitDeleteHighlight={vi.fn()}
        onCommitNote={onCommitNote}
        onCommitDeleteNote={onCommitDeleteNote}
        onClose={onClose}
      />,
    )

    const highlightBtn = screen.getByRole('button', { name: 'Highlight' })
    fireEvent.click(highlightBtn)

    expect(onCommitHighlight).toHaveBeenCalledOnce()
    expect(onCommitHighlight).toHaveBeenCalledWith(
      [{ blockId: 'ket-part-2-txt-0', start: 19, end: 40 }],
      'yellow',
    )
  })

  it('calls onCommitNote when note is saved', () => {
    const onCommitNote = vi.fn(() => [])

    render(
      <CambridgeSelectionToolbar
        selection={{
          text: 'locally-produced food',
          ranges: [{ blockId: 'ket-part-2-txt-0', start: 19, end: 40 }],
          rect: { left: 100, top: 200, right: 260, bottom: 220, width: 160, height: 20 },
        }}
        highlights={[]}
        notes={[]}
        onCommitHighlight={vi.fn()}
        onCommitDeleteHighlight={vi.fn()}
        onCommitNote={onCommitNote}
        onCommitDeleteNote={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    const noteBtn = screen.getByRole('button', { name: 'Note' })
    fireEvent.click(noteBtn)

    const textarea = screen.getByPlaceholderText('Nhập ghi chú...')
    fireEvent.change(textarea, { target: { value: 'important phrase' } })

    const saveBtn = screen.getByRole('button', { name: 'Lưu note' })
    fireEvent.click(saveBtn)

    expect(onCommitNote).toHaveBeenCalledOnce()
    expect(onCommitNote).toHaveBeenCalledWith(
      [{ blockId: 'ket-part-2-txt-0', start: 19, end: 40 }],
      'important phrase',
    )
  })

  it('renders nothing when selection is null', () => {
    const { container } = render(
      <CambridgeSelectionToolbar
        selection={null}
        highlights={[]}
        notes={[]}
        onCommitHighlight={vi.fn()}
        onCommitDeleteHighlight={vi.fn()}
        onCommitNote={vi.fn()}
        onCommitDeleteNote={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('shows existing note text in editor', () => {
    const existingNotes: TextNote[] = [
      { id: 'n1', blockId: 'ket-part-2-txt-0', start: 19, end: 40, text: 'existing note' },
    ]

    render(
      <CambridgeSelectionToolbar
        selection={{
          text: 'locally-produced food',
          ranges: [{ blockId: 'ket-part-2-txt-0', start: 19, end: 40 }],
          rect: { left: 100, top: 200, right: 260, bottom: 220, width: 160, height: 20 },
        }}
        highlights={[]}
        notes={existingNotes}
        onCommitHighlight={vi.fn()}
        onCommitDeleteHighlight={vi.fn()}
        onCommitNote={vi.fn()}
        onCommitDeleteNote={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    const noteBtn = screen.getByRole('button', { name: 'Note' })
    fireEvent.click(noteBtn)

    const textarea = screen.getByPlaceholderText('Nhập ghi chú...') as HTMLTextAreaElement
    expect(textarea.value).toBe('existing note')
  })
})

describe('KET Cambridge Annotation — stateful integration', () => {
  it('commits highlight and shows <mark> element in KET harness', async () => {
    const user = userEvent.setup()
    const PASSAGE_TEXT = 'Jenny wants to buy locally-produced food traditional to the area.'
    const BLOCK_ID = 'ket-part-2-txt-0'

    function KetAnnotationHarness() {
      const [highlightsState, setHighlightsState] = useState<ReadingHighlight[]>([])
      const [notesState, setNotesState] = useState<TextNote[]>([])
      const [selection, setSelection] = useState<StableSelectionSnapshot | null>({
        text: 'locally-produced food',
        ranges: [{ blockId: BLOCK_ID, start: 19, end: 40 }],
        rect: { left: 100, top: 200, right: 260, bottom: 220, width: 160, height: 20 },
      })

      const handleCommitHighlight = (
        ranges: { blockId: string; start: number; end: number }[],
        color: HighlightColor = 'yellow',
      ) => {
        const result = addHighlights(highlightsState, ranges, color)
        setHighlightsState(result)
        return result
      }

      return (
        <>
          <ExamHighlightProvider highlights={highlightsState} notes={notesState}>
            <ExamHighlightZone>
              <ReadingHighlightableText
                blockId={BLOCK_ID}
                text={PASSAGE_TEXT}
                highlights={highlightsState}
              />
            </ExamHighlightZone>
          </ExamHighlightProvider>

          <CambridgeSelectionToolbar
            selection={selection}
            highlights={highlightsState}
            notes={notesState}
            onCommitHighlight={handleCommitHighlight}
            onCommitDeleteHighlight={vi.fn()}
            onCommitNote={vi.fn()}
            onCommitDeleteNote={vi.fn()}
            onClose={() => setSelection(null)}
          />
        </>
      )
    }

    render(<KetAnnotationHarness />)

    expect(document.querySelector('mark.reading-test-highlight--yellow')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Highlight' }))

    await waitFor(() => {
      const markEl = document.querySelector('mark.reading-test-highlight--yellow')
      expect(markEl).toBeTruthy()
      expect(markEl).toHaveTextContent('locally-produced food')
    })
  })

  it('commits note and shows <span> with title in KET harness', async () => {
    const user = userEvent.setup()
    const PASSAGE_TEXT = 'Jenny wants to buy locally-produced food traditional to the area.'
    const BLOCK_ID = 'ket-part-2-txt-0'

    function KetNoteHarness() {
      const [highlightsState] = useState<ReadingHighlight[]>([])
      const [notesState, setNotesState] = useState<TextNote[]>([])
      const [selection, setSelection] = useState<StableSelectionSnapshot | null>({
        text: 'locally-produced food',
        ranges: [{ blockId: BLOCK_ID, start: 19, end: 40 }],
        rect: { left: 100, top: 200, right: 260, bottom: 220, width: 160, height: 20 },
      })

      const handleCommitNote = (
        ranges: { blockId: string; start: number; end: number }[],
        rawText: string,
      ) => {
        const text = rawText.trim()
        if (!text || ranges.length === 0) return null
        const result = upsertNotesForRanges(notesState, ranges, text)
        setNotesState(result)
        return result
      }

      return (
        <>
          <ExamHighlightProvider highlights={highlightsState} notes={notesState}>
            <ExamHighlightZone>
              <ReadingHighlightableText
                blockId={BLOCK_ID}
                text={PASSAGE_TEXT}
                highlights={highlightsState}
                notes={notesState}
              />
            </ExamHighlightZone>
          </ExamHighlightProvider>

          <CambridgeSelectionToolbar
            selection={selection}
            highlights={highlightsState}
            notes={notesState}
            onCommitHighlight={vi.fn()}
            onCommitDeleteHighlight={vi.fn()}
            onCommitNote={handleCommitNote}
            onCommitDeleteNote={vi.fn()}
            onClose={() => setSelection(null)}
          />
        </>
      )
    }

    render(<KetNoteHarness />)

    await user.click(screen.getByRole('button', { name: 'Note' }))

    await user.type(screen.getByPlaceholderText('Nhập ghi chú...'), 'important phrase')

    await user.click(screen.getByRole('button', { name: 'Lưu note' }))

    await waitFor(() => {
      const noteSpan = document.querySelector('.reading-test-note')
      expect(noteSpan).toBeTruthy()
      expect(noteSpan?.getAttribute('title')).toBe('important phrase')
    })
  })
})

describe('KET Cambridge Annotation — usePartHighlights integration', () => {
  it('commits highlight using real usePartHighlights in KET harness', async () => {
    const user = userEvent.setup()

    function KetAnnotationHarness() {
      const [selection, setSelection] = useState<StableSelectionSnapshot | null>({
        text: 'locally-produced food',
        ranges: [{ blockId: 'ket-part-2-txt-0', start: 19, end: 40 }],
        rect: { left: 100, top: 200, right: 260, bottom: 220, width: 160, height: 20 },
      })

      const {
        highlights,
        notes,
        commitHighlightRanges,
        commitNoteRanges,
        commitDeleteNoteRanges,
        commitDeleteHighlightRanges,
      } = usePartHighlights('ket-part-2')

      return (
        <>
          <ExamHighlightProvider highlights={highlights} notes={notes}>
            <ExamHighlightZone>
              <ReadingHighlightableText
                blockId="ket-part-2-txt-0"
                text="Jenny wants to buy locally-produced food traditional to the area."
                highlights={highlights}
              />
            </ExamHighlightZone>
          </ExamHighlightProvider>

          <CambridgeSelectionToolbar
            selection={selection}
            highlights={highlights}
            notes={notes}
            onCommitHighlight={commitHighlightRanges}
            onCommitDeleteHighlight={commitDeleteHighlightRanges}
            onCommitNote={commitNoteRanges}
            onCommitDeleteNote={commitDeleteNoteRanges}
            onClose={() => setSelection(null)}
          />
        </>
      )
    }

    render(<KetAnnotationHarness />)

    expect(document.querySelector('mark.reading-test-highlight--yellow')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Highlight' }))

    await waitFor(() => {
      const markEl = document.querySelector('mark.reading-test-highlight--yellow')
      expect(markEl).toBeTruthy()
      expect(markEl).toHaveTextContent('locally-produced food')
    })
  })

  it('commits note using real usePartHighlights in KET harness', async () => {
    const user = userEvent.setup()

    function KetNoteHarness() {
      const [selection, setSelection] = useState<StableSelectionSnapshot | null>({
        text: 'locally-produced food',
        ranges: [{ blockId: 'ket-part-2-txt-0', start: 19, end: 40 }],
        rect: { left: 100, top: 200, right: 260, bottom: 220, width: 160, height: 20 },
      })

      const {
        highlights,
        notes,
        commitHighlightRanges,
        commitNoteRanges,
        commitDeleteNoteRanges,
        commitDeleteHighlightRanges,
      } = usePartHighlights('ket-part-2')

      return (
        <>
          <ExamHighlightProvider highlights={highlights} notes={notes}>
            <ExamHighlightZone>
              <ReadingHighlightableText
                blockId="ket-part-2-txt-0"
                text="Jenny wants to buy locally-produced food traditional to the area."
                highlights={highlights}
              />
            </ExamHighlightZone>
          </ExamHighlightProvider>

          <CambridgeSelectionToolbar
            selection={selection}
            highlights={highlights}
            notes={notes}
            onCommitHighlight={commitHighlightRanges}
            onCommitDeleteHighlight={commitDeleteHighlightRanges}
            onCommitNote={commitNoteRanges}
            onCommitDeleteNote={commitDeleteNoteRanges}
            onClose={() => setSelection(null)}
          />
        </>
      )
    }

    render(<KetNoteHarness />)

    await user.click(screen.getByRole('button', { name: 'Note' }))

    await user.type(screen.getByPlaceholderText('Nhập ghi chú...'), 'important phrase')

    await user.click(screen.getByRole('button', { name: 'Lưu note' }))

    await waitFor(() => {
      const noteSpan = document.querySelector('.reading-test-note')
      expect(noteSpan).toBeTruthy()
      expect(noteSpan?.getAttribute('title')).toBe('important phrase')
    })
  })
})
