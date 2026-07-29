import Dexie from 'dexie'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@ryan/db'
import WritingCambridgeLevelPage from '../../../pages/WritingCambridgeLevelPage'
import WritingCambridgeTaskPage from '../../../pages/WritingCambridgeTaskPage'
import WritingCambridgeTestPage from '../../../pages/WritingCambridgeTestPage'
import { useWritingStore } from '../writingStore'

async function resetDb() {
  Object.assign(globalThis, { indexedDB, IDBKeyRange })
  Dexie.dependencies.indexedDB = indexedDB
  Dexie.dependencies.IDBKeyRange = IDBKeyRange
  Object.assign((db as unknown as { _deps: { indexedDB?: IDBFactory; IDBKeyRange?: typeof IDBKeyRange } })._deps, {
    indexedDB,
    IDBKeyRange,
  })
  db.close()
  await db.delete()
  await db.open()
  useWritingStore.setState({
    activeDocId: null,
    score: null,
    isGrading: false,
    gradingError: null,
    guide: null,
    guideDocId: null,
    isGuideLoading: false,
    guideError: null,
  })
}

function renderHarness(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/app/writing/cambridge/:level" element={<WritingCambridgeLevelPage />} />
        <Route path="/app/writing/cambridge/:level/:testId" element={<WritingCambridgeTestPage />} />
        <Route path="/app/writing/cambridge/:level/:testId/:taskId" element={<WritingCambridgeTaskPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(async () => {
  await resetDb()
})

afterEach(() => {
  cleanup()
})

describe('Cambridge Writing admin flow', () => {
  it('hides create for normal users and shows admin actions with Unicode copy', async () => {
    renderHarness('/app/writing/cambridge/b1')
    await screen.findByText(/đề, .* bài viết\./i)
    expect(screen.queryByText('Tạo đề mới')).not.toBeInTheDocument()
    expect(screen.queryByText('Hướng dẫn tạo đề')).not.toBeInTheDocument()

    cleanup()
    await resetDb()
    await db.settings.put({ key: 'is_admin', value: true })
    renderHarness('/app/writing/cambridge/b1')
    await screen.findByText(/đề, .* bài viết\./i)
    expect(screen.getByText('Tạo đề mới')).toBeInTheDocument()
    expect(screen.getByText('Hướng dẫn tạo đề')).toBeInTheDocument()
  })

  it('creates and edits local drafts from the level page without creating writing docs', async () => {
    await db.settings.put({ key: 'is_admin', value: true })
    renderHarness('/app/writing/cambridge/b1')
    await screen.findByText(/đề, .* bài viết\./i)

    const existingTestNumbers = Array.from(document.querySelectorAll('.cb-card-badge'), node => Number(node.textContent?.match(/Test\s+(\d+)/)?.[1] ?? 0))
    const expectedNextTestNumber = Math.max(...existingTestNumbers)
      + 1
    fireEvent.click(screen.getByText('Tạo đề mới'))
    await screen.findByRole('dialog')
    expect(screen.getByDisplayValue('PET · B1')).toBeInTheDocument()
    expect(screen.getByDisplayValue(String(expectedNextTestNumber))).toBeInTheDocument()
    expect(screen.getByDisplayValue(`PET B1 Writing · Test ${String(expectedNextTestNumber).padStart(2, '0')}`)).toBeInTheDocument()

    fireEvent.click(screen.getByText('+ Thêm bài viết'))
    expect(screen.getAllByText(/Task \d+/).length).toBeGreaterThan(1)

    fireEvent.change(screen.getByDisplayValue(`PET B1 Writing · Test ${String(expectedNextTestNumber).padStart(2, '0')}`), { target: { value: `PET Draft Test ${expectedNextTestNumber}` } })
    fireEvent.change(screen.getAllByRole('textbox')[2], { target: { value: 'Write an email to your friend.' } })
    fireEvent.click(screen.getByText('Lưu bản nháp'))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await screen.findByText(`PET Draft Test ${expectedNextTestNumber}`)
    expect(screen.getAllByText('Bản nháp').length).toBeGreaterThan(0)
    expect(await db.writingDocs.count()).toBe(0)

    const savedTests = await db.cambridgeWritingTests.toArray()
    expect(savedTests).toHaveLength(1)
    const createdTestId = savedTests[0]?.id
    expect(createdTestId).toBe(`pet-b1-writing-test-${String(expectedNextTestNumber).padStart(2, '0')}`)

    cleanup()
    renderHarness(`/app/writing/cambridge/b1/${createdTestId}`)
    await screen.findByRole('heading', { name: `PET Draft Test ${expectedNextTestNumber}` })
    const taskButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.cb-grid .cb-card'))
    expect(taskButtons[0]).toBeTruthy()
    fireEvent.click(taskButtons[0] as HTMLButtonElement)
    await screen.findByLabelText('Writing answer')

    fireEvent.click(screen.getByLabelText('Back to library'))
    await screen.findByText(`PET Draft Test ${expectedNextTestNumber}`)
    fireEvent.click(screen.getByText('Chỉnh sửa'))
    await screen.findByRole('dialog')
    fireEvent.change(screen.getByDisplayValue(`PET Draft Test ${expectedNextTestNumber}`), { target: { value: `PET Draft Test ${expectedNextTestNumber} Updated` } })
    fireEvent.click(screen.getByText('Lưu bản nháp'))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await screen.findByText(`PET Draft Test ${expectedNextTestNumber} Updated`)
  })

  it('supports create entry point on every Cambridge Writing level and opens admin guide', async () => {
    await db.settings.put({ key: 'is_admin', value: true })

    for (const level of ['a2', 'b1', 'b2', 'c1', 'c2'] as const) {
      cleanup()
      renderHarness(`/app/writing/cambridge/${level}`)
      await screen.findByText(/đề, .* bài viết\./i)
      expect(screen.getByText('Tạo đề mới')).toBeInTheDocument()
      expect(screen.getByText('Hướng dẫn tạo đề')).toBeInTheDocument()
    }

    fireEvent.click(screen.getByText('Hướng dẫn tạo đề'))
    await screen.findByRole('dialog', { name: 'Hướng dẫn tạo đề Writing' })
    expect(screen.getByText('Bản nháp hiện chỉ được lưu trên trình duyệt này. Nội dung chưa được xuất bản cho học viên.')).toBeInTheDocument()
  })
})
