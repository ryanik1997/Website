import Dexie from 'dexie'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db, cambridgeWritingTestLocalRepo } from '@ryan/db'
import type { CambridgeWritingTest } from '@ryan/catalog'
import WritingCambridgeLevelPage from '../../pages/WritingCambridgeLevelPage'
import WritingCambridgeTaskPage from '../../pages/WritingCambridgeTaskPage'
import WritingCambridgeTestPage from '../../pages/WritingCambridgeTestPage'
import { useWritingStore } from './writingStore'

function makeTest(level: 'a2' | 'b1' | 'b2' | 'c1' | 'c2', id: string, testNumber: number, title = `${level.toUpperCase()} custom`) {
  return {
    id,
    level,
    testNumber,
    title,
    status: 'draft',
    version: 1,
    tasks: [
      {
        id: `${id}-task-01`,
        partNumber: 1,
        taskNumber: 1,
        title: 'Question 1',
        genre: 'email',
        instruction: 'Write your answer.',
        promptText: 'Prompt body',
        wordLimit: { min: 100, max: 100, displayText: '100 words' },
      },
    ],
  } satisfies CambridgeWritingTest
}

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

function renderLevelPage(level: string) {
  return render(
    <MemoryRouter initialEntries={[`/app/writing/cambridge/${level}`]}>
      <Routes>
        <Route path="/app/writing/cambridge/:level" element={<WritingCambridgeLevelPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function renderTestPage(level: string, testId: string) {
  return render(
    <MemoryRouter initialEntries={[`/app/writing/cambridge/${level}/${testId}`]}>
      <Routes>
        <Route path="/app/writing/cambridge/:level/:testId" element={<WritingCambridgeTestPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function renderTaskPage(level: string, testId: string, taskId: string) {
  return render(
    <MemoryRouter initialEntries={[`/app/writing/cambridge/${level}/${testId}/${taskId}`]}>
      <Routes>
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

describe('Cambridge Writing pages', () => {
  it('level page shows merged count and finds local drafts for admin', async () => {
    await db.settings.put({ key: 'is_admin', value: true })
    await cambridgeWritingTestLocalRepo.create({
      id: 'pet-b1-test-99',
      contentKey: 'cambridge-writing:b1:pet-b1-test-99',
      level: 'b1',
      testNumber: 99,
      status: 'draft',
      source: 'admin_local',
      payload: makeTest('b1', 'pet-b1-test-99', 99, 'Local draft title'),
    })

    renderLevelPage('b1')

    expect(screen.getAllByText('Đang tải thư viện Writing...').length).toBeGreaterThan(0)
    await screen.findByText(/đề, .* bài viết\./i)
    await waitFor(() => {
      expect(screen.getByText('Local draft title')).toBeInTheDocument()
      expect(screen.getByText('Bản nháp')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('Tìm theo tên đề hoặc dạng bài...'), { target: { value: 'draft title' } })
    expect(screen.getByText('Local draft title')).toBeInTheDocument()
  })

  it('level page hides archived seed overrides and shows empty state for users', async () => {
    await cambridgeWritingTestLocalRepo.create({
      id: 'b1-test-01',
      contentKey: 'cambridge-writing:b1:b1-test-01',
      level: 'b1',
      testNumber: 1,
      status: 'archived',
      source: 'published_sync',
      payload: makeTest('b1', 'b1-test-01', 1),
    })

    renderLevelPage('b1')

    const emptyStates = await screen.findAllByText('Nội dung đang được cập nhật.')
    expect(emptyStates.length).toBeGreaterThan(0)
    expect(screen.queryByText('B1 Test 01')).not.toBeInTheDocument()
  })

  it('level page shows admin warning for invalid payloads', async () => {
    await db.settings.put({ key: 'is_admin', value: true })
    await db.cambridgeWritingTests.add({
      id: 'broken-c1-test',
      contentKey: 'cambridge-writing:c1:broken-c1-test',
      level: 'c1',
      testNumber: 77,
      status: 'published',
      source: 'published_sync',
      version: 1,
      payload: { nope: true },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    renderLevelPage('c1')

    await screen.findByText('Có bản ghi Writing không hợp lệ.')
  })

  it('test page keeps loading separate from not found and respects admin draft visibility', async () => {
    renderTestPage('a2', 'ket-a2-book4-test2')
    expect(screen.getByText('Đang tải đề...')).toBeInTheDocument()
    await screen.findByText('Giữ đúng cấu trúc Part/Task của đề thật.')

    await cambridgeWritingTestLocalRepo.create({
      id: 'pet-b1-test-88',
      contentKey: 'cambridge-writing:b1:pet-b1-test-88',
      level: 'b1',
      testNumber: 88,
      status: 'draft',
      source: 'admin_local',
      payload: makeTest('b1', 'pet-b1-test-88', 88, 'Admin only test'),
    })

    renderTestPage('b1', 'pet-b1-test-88')
    await screen.findByText('Không tìm thấy đề Writing.')

    cleanup()
    await resetDb()
    await db.settings.put({ key: 'is_admin', value: true })
    await cambridgeWritingTestLocalRepo.create({
      id: 'pet-b1-test-88',
      contentKey: 'cambridge-writing:b1:pet-b1-test-88',
      level: 'b1',
      testNumber: 88,
      status: 'draft',
      source: 'admin_local',
      payload: makeTest('b1', 'pet-b1-test-88', 88, 'Admin only test'),
    })

    renderTestPage('b1', 'pet-b1-test-88')
    await screen.findByRole('heading', { name: 'Admin only test' })
  })

  it('test page uses published override from merged repo', async () => {
    await cambridgeWritingTestLocalRepo.create({
      id: 'b1-test-01',
      contentKey: 'cambridge-writing:b1:b1-test-01',
      level: 'b1',
      testNumber: 1,
      status: 'published',
      source: 'published_sync',
      payload: makeTest('b1', 'b1-test-01', 1, 'Published override test'),
    })

    renderTestPage('b1', 'b1-test-01')
    await screen.findByRole('heading', { name: 'Published override test' })
  })

  it('task page renders seed task, keeps two-pane layout, and avoids duplicate WritingDoc', async () => {
    renderTaskPage('b1', 'b1-test-01', 'b1-test-01-task-01')

    expect(screen.getByText('Đang tải bài viết...')).toBeInTheDocument()
    const textarea = await screen.findByLabelText('Writing answer')
    expect(textarea).toBeInTheDocument()
    expect(screen.getByText('Question 1')).toBeInTheDocument()
    expect(document.querySelector('.ket-rw-body.is-split.is-resizable')).toBeTruthy()
    expect(document.querySelector('.ket-rw-pane-left')).toBeTruthy()
    expect(document.querySelector('.ket-rw-pane-right')).toBeTruthy()

    await waitFor(async () => {
      const docs = await db.writingDocs.toArray()
      expect(docs.filter(doc => doc.sourceMeta?.docRole === 'user_answer')).toHaveLength(1)
    })

    fireEvent.change(textarea, { target: { value: 'Hello world from test' } })
    await waitFor(async () => {
      const docs = await db.writingDocs.toArray()
      expect(docs.filter(doc => doc.sourceMeta?.docRole === 'user_answer')).toHaveLength(1)
    })
  })

  it('task page opens local draft task for admin and keeps prompt metadata identity', async () => {
    await db.settings.put({ key: 'is_admin', value: true })
    await cambridgeWritingTestLocalRepo.create({
      id: 'pet-b1-test-77',
      contentKey: 'cambridge-writing:b1:pet-b1-test-77',
      level: 'b1',
      testNumber: 77,
      status: 'draft',
      source: 'admin_local',
      payload: makeTest('b1', 'pet-b1-test-77', 77, 'Draft route test'),
    })

    renderTaskPage('b1', 'pet-b1-test-77', 'pet-b1-test-77-task-01')
    await screen.findByLabelText('Writing answer')

    await waitFor(async () => {
      const docs = await db.writingDocs.toArray()
      const answerDocs = docs.filter(doc => doc.sourceMeta?.docRole === 'user_answer')
      expect(answerDocs).toHaveLength(1)
      expect(answerDocs[0].sourceMeta).toMatchObject({
        examFamily: 'cambridge',
        level: 'b1',
        testId: 'pet-b1-test-77',
        taskId: 'pet-b1-test-77-task-01',
        sourcePromptId: 'pet-b1-test-77-task-01',
      })
    })
  })

  it('task page shows not found for invalid routes', async () => {
    renderTaskPage('b1', 'missing-test', 'missing-task')
    await screen.findByText('Không tìm thấy task Writing.')
  })
  it('advanced routes render B2/C1/C2 prompts and persist part 2 selection', async () => {
    renderTaskPage('b2', 'b2-test-01', 'b2-test-01-task-01')
    await screen.findByLabelText('Writing answer')
    expect(screen.getByText(/140-190 words/i)).toBeInTheDocument()
    expect(screen.queryByLabelText('Answering this question?')).not.toBeInTheDocument()

    cleanup()
    renderTaskPage('c1', 'c1-test-01', 'c1-test-01-task-01')
    await screen.findByText('Some opinions expressed in the discussion:')
    expect(screen.getByText(/220-260 words/i)).toBeInTheDocument()

    cleanup()
    renderTaskPage('c2', 'c2-test-01', 'c2-test-01-task-01')
    await screen.findByText('Text 1:')
    expect(screen.getByText('Shifting sands: behavioural change')).toBeInTheDocument()
    expect(screen.getByText(/240-280 words/i)).toBeInTheDocument()

    cleanup()
    renderTaskPage('c2', 'c2-test-01', 'c2-test-01-task-02')
    const selector = await screen.findByLabelText('Answering this question?')
    fireEvent.change(selector, { target: { value: 'yes' } })
    fireEvent.change(screen.getByLabelText('Writing answer'), { target: { value: 'A saved answer' } })

    cleanup()
    renderTaskPage('c2', 'c2-test-01', 'c2-test-01-task-02')
    expect((await screen.findByLabelText('Answering this question?') as HTMLSelectElement).value).toBe('yes')
    await waitFor(() => {
      expect((screen.getByLabelText('Writing answer') as HTMLTextAreaElement).value).toContain('A saved answer')
    })
  })
})

