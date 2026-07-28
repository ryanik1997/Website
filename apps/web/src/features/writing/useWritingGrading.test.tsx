import Dexie from 'dexie'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db, writingRepo } from '@ryan/db'
import type { WritingDoc } from '@ryan/db'
import { isCambridgeScore } from '@ryan/core'
import { useWritingGrading } from './useWritingGrading'

const {
  callAIMock,
  buildWritingGradePromptMock,
  canUseMock,
} = vi.hoisted(() => ({
  callAIMock: vi.fn(),
  buildWritingGradePromptMock: vi.fn(() => [{ role: 'user', content: 'grade this' }]),
  canUseMock: vi.fn(() => true),
}))

vi.mock('@ryan/core', async () => {
  const actual = await vi.importActual<typeof import('@ryan/core')>('@ryan/core')
  return {
    ...actual,
    callAI: callAIMock,
    buildWritingGradePrompt: buildWritingGradePromptMock,
    canUse: canUseMock,
    providerSupportsVision: vi.fn(() => false),
    attachImagesToUserMessage: vi.fn((messages) => messages),
  }
})

function makeDoc(id: string, type: WritingDoc['type'] = 'cambridge_b2'): WritingDoc {
  return {
    id,
    type,
    genre: 'essay',
    prompt: 'Prompt',
    text: '',
    updatedAt: Date.now(),
  }
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
}

beforeEach(async () => {
  await resetDb()
  vi.clearAllMocks()
  canUseMock.mockReturnValue(true)
  buildWritingGradePromptMock.mockReturnValue([{ role: 'user', content: 'grade this' }])
  await writingRepo.setSetting('ai_provider', 'openai')
  await writingRepo.setSetting('ai_key_openai', 'test-key')
  await writingRepo.setSetting('plan', 'pro')
})

describe('useWritingGrading', () => {
  it('blocks empty answers before calling AI', async () => {
    const { result } = renderHook(() => useWritingGrading({ doc: makeDoc('doc-empty'), text: '' }))

    await act(async () => {
      const response = await result.current.grade()
      expect(response.kind).toBe('blocked')
    })

    expect(callAIMock).not.toHaveBeenCalled()
    expect(result.current.gradingError).toContain('H')
  })

  it('opens AI settings when API key is missing', async () => {
    await writingRepo.setSetting('ai_key_openai', '')
    const { result } = renderHook(() => useWritingGrading({ doc: makeDoc('doc-no-key'), text: 'Hello world' }))

    await act(async () => {
      const response = await result.current.grade()
      expect(response.kind).toBe('blocked')
    })

    expect(result.current.showAiSettings).toBe(true)
    expect(callAIMock).not.toHaveBeenCalled()
  })

  it('reuses cached score without calling AI', async () => {
    const doc = makeDoc('doc-cached')
    const cachedScore = {
      framework: 'cambridge',
      overallScore: 4,
      levelLabel: 'B2',
      content: { band: 4, feedback: 'Good' },
      communicativeAchievement: { band: 4, feedback: 'Good' },
      organisation: { band: 4, feedback: 'Good' },
      language: { band: 4, feedback: 'Good' },
      strengths: ['Clear ideas'],
      improvements: ['More range'],
    }
    await writingRepo.saveScore(doc.id, 'Cached answer', cachedScore)

    const { result } = renderHook(() => useWritingGrading({ doc, text: 'Cached answer' }))

    await act(async () => {
      const response = await result.current.grade()
      expect(response.kind).toBe('cached')
    })

    expect(callAIMock).not.toHaveBeenCalled()
    expect(isCambridgeScore(result.current.score) ? result.current.score.overallScore : null).toBe(4)
  })

  it('persists current text before calling AI and saves score/history', async () => {
    const doc = makeDoc('doc-save')
    const persistText = vi.fn(async () => {})
    callAIMock.mockResolvedValue({
      content: JSON.stringify({
        overallScore: 4,
        levelLabel: 'B2',
        content: { band: 4, feedback: 'Good' },
        communicativeAchievement: { band: 4, feedback: 'Good' },
        organisation: { band: 4, feedback: 'Good' },
        language: { band: 4, feedback: 'Good' },
        strengths: ['Clear ideas'],
        improvements: ['More range'],
      }),
      inputTokens: 10,
      outputTokens: 20,
    })

    const { result } = renderHook(() => useWritingGrading({
      doc,
      text: 'Fresh answer for grading',
      persistText,
    }))

    await act(async () => {
      const response = await result.current.grade()
      expect(response.kind).toBe('graded')
    })

    expect(persistText).toHaveBeenCalledWith('Fresh answer for grading')
    expect(callAIMock).toHaveBeenCalledTimes(1)
    await waitFor(async () => {
      expect((await db.writingHistory.toArray())).toHaveLength(1)
      expect((await db.aiUsage.toArray())).toHaveLength(1)
      expect((await db.errorBank.toArray())).toHaveLength(1)
    })
  })

  it('deduplicates double-click grading requests', async () => {
    const doc = makeDoc('doc-double')
    let resolveAI: ((value: { content: string; inputTokens: number; outputTokens: number }) => void) | null = null
    callAIMock.mockReturnValue(new Promise((resolve) => {
      resolveAI = resolve
    }))

    const { result } = renderHook(() => useWritingGrading({ doc, text: 'Double click answer' }))

    let completed = 0

    await act(async () => {
      const p1 = result.current.grade().then((value) => {
        if (value.kind === 'graded') completed += 1
      })
      const p2 = result.current.grade().then((value) => {
        if (value.kind === 'graded') completed += 1
      })
      resolveAI?.({
        content: JSON.stringify({
          overallScore: 4,
          levelLabel: 'B2',
          content: { band: 4, feedback: 'Good' },
          communicativeAchievement: { band: 4, feedback: 'Good' },
          organisation: { band: 4, feedback: 'Good' },
          language: { band: 4, feedback: 'Good' },
          strengths: ['Clear ideas'],
          improvements: ['More range'],
        }),
        inputTokens: 10,
        outputTokens: 20,
      })
      await Promise.all([p1, p2])
    })

    expect(callAIMock).toHaveBeenCalledTimes(1)
    expect(completed).toBe(2)
  })

  it('clears stale score when switching tasks', async () => {
    const firstDoc = makeDoc('doc-one')
    const secondDoc = makeDoc('doc-two')
    callAIMock.mockResolvedValue({
      content: JSON.stringify({
        overallScore: 4,
        levelLabel: 'B2',
        content: { band: 4, feedback: 'Good' },
        communicativeAchievement: { band: 4, feedback: 'Good' },
        organisation: { band: 4, feedback: 'Good' },
        language: { band: 4, feedback: 'Good' },
        strengths: ['Clear ideas'],
        improvements: ['More range'],
      }),
      inputTokens: 10,
      outputTokens: 20,
    })

    const { result, rerender } = renderHook(
      ({ doc, text }) => useWritingGrading({ doc, text }),
      { initialProps: { doc: firstDoc, text: 'First answer' } },
    )

    await act(async () => {
      await result.current.grade()
    })
    expect(isCambridgeScore(result.current.score) ? result.current.score.overallScore : null).toBe(4)

    rerender({ doc: secondDoc, text: 'Second answer' })

    await waitFor(() => {
      expect(result.current.score).toBeNull()
      expect(result.current.gradingError).toBeNull()
    })
  })
})
