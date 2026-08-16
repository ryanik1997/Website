import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ExamContentError, isExamContentR2, loadReadingBodyFromR2 } from './index'
import { examContentCache } from './examContentCache'

const BASE = 'https://pub-test.r2.dev'
const RID = 'exam-content-r1-20260804'
const EXAM_ID = 'catalog-reading-cae-c1-test1'

function stubManifest() {
  return {
    schemaVersion: 1,
    releaseId: RID,
    baseUrl: BASE,
    modules: { reading: { catalogPath: `releases/${RID}/reading/catalog.json` } },
  }
}

function stubCatalog() {
  return {
    module: 'reading',
    releaseId: RID,
    count: 1,
    tests: [{ id: EXAM_ID, level: 'c1', title: 'CAE', objectKey: `releases/${RID}/cambridge/reading/c1/${EXAM_ID}.json` }],
  }
}

function stubBody() {
  return {
    id: EXAM_ID,
    cambridgeLevel: 'c1',
    parts: [{ partNumber: 1, questionGroups: [{ questions: [{ id: 'q1', number: 1, type: 'multiple-choice', prompt: 'p', options: [] }] }] }],
  }
}

const json = (obj: unknown, status = 200) => new Response(JSON.stringify(obj), {
  status,
  headers: { 'content-type': 'application/json' },
})

describe('exam-content loader', () => {
  beforeEach(() => {
    examContentCache.clear()
    vi.stubEnv('VITE_EXAM_CONTENT_SOURCE', 'legacy')
    vi.stubEnv('VITE_EXAM_CONTENT_BASE_URL', BASE)
    vi.stubEnv('VITE_EXAM_CONTENT_MANIFEST', '/manifests/staging.json')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    examContentCache.clear()
  })

  it('legacy mode: no R2 call, loadReadingBodyFromR2 returns null', async () => {
    vi.stubEnv('VITE_EXAM_CONTENT_SOURCE', 'legacy')
    expect(isExamContentR2()).toBe(false)
    const res = await loadReadingBodyFromR2(EXAM_ID)
    expect(res).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('r2 mode: fetches manifest + catalog + body, returns cambridge body', async () => {
    vi.stubEnv('VITE_EXAM_CONTENT_SOURCE', 'r2')
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(stubManifest()))
      .mockResolvedValueOnce(json(stubCatalog()))
      .mockResolvedValueOnce(json(stubBody()))
    vi.stubGlobal('fetch', fetchMock)

    const res = await loadReadingBodyFromR2(EXAM_ID)
    expect(res).not.toBeNull()
    expect(res!.format).toBe('cambridge')
    expect(res!.objectKey).toContain('cambridge/reading/c1')
    expect((res!.body as { id: string }).id).toBe(EXAM_ID)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('r2 mode: ielts body gets a slug attached for the shell element ids', async () => {
    vi.stubEnv('VITE_EXAM_CONTENT_SOURCE', 'r2')
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(stubManifest()))
      .mockResolvedValueOnce(json({ module: 'reading', releaseId: RID, count: 1, tests: [{ id: 'catalog-cam-11-2-reading', level: 'ielts', title: 'Cam 11 T2', objectKey: `releases/${RID}/ielts/reading/academic/catalog-cam-11-2-reading.json` }] }))
      .mockResolvedValueOnce(json({ title: 'CAM 11 Test 2', parts: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await loadReadingBodyFromR2('catalog-cam-11-2-reading')
    expect(res!.format).toBe('ielts')
    expect((res!.body as { slug?: string }).slug).toBe('cam-11-2')
  })

  it('invalid manifest fails clearly with ExamContentError', async () => {
    vi.stubEnv('VITE_EXAM_CONTENT_SOURCE', 'r2')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(json({ foo: 1 })))
    await expect(loadReadingBodyFromR2(EXAM_ID)).rejects.toMatchObject({
      name: 'ExamContentError',
      context: { label: 'staging-manifest' },
    })
  })

  it('404 body rejects (no empty test, no silent empty array)', async () => {
    vi.stubEnv('VITE_EXAM_CONTENT_SOURCE', 'r2')
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(json(stubManifest()))
      .mockResolvedValueOnce(json(stubCatalog()))
      .mockResolvedValueOnce(json({ error: 'nope' }, 404)))
    const err = await loadReadingBodyFromR2(EXAM_ID).catch(e => e)
    expect(err).toBeInstanceOf(ExamContentError)
    expect(String(err.message)).toContain('HTTP 404')
    expect(String(err.message)).toContain(EXAM_ID)
  })

  it('test not in catalog throws with testId context', async () => {
    vi.stubEnv('VITE_EXAM_CONTENT_SOURCE', 'r2')
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(json(stubManifest()))
      .mockResolvedValueOnce(json(stubCatalog())))
    const err = await loadReadingBodyFromR2('catalog-reading-nonexistent').catch(e => e)
    expect(err).toBeInstanceOf(ExamContentError)
    expect(err.context.testId).toBe('catalog-reading-nonexistent')
  })

  it('request cache: second call does not re-fetch', async () => {
    vi.stubEnv('VITE_EXAM_CONTENT_SOURCE', 'r2')
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(stubManifest()))
      .mockResolvedValueOnce(json(stubCatalog()))
      .mockResolvedValueOnce(json(stubBody()))
    vi.stubGlobal('fetch', fetchMock)

    await loadReadingBodyFromR2(EXAM_ID)
    await loadReadingBodyFromR2(EXAM_ID)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('never requests a public answer vault (.answers.json)', async () => {
    vi.stubEnv('VITE_EXAM_CONTENT_SOURCE', 'r2')
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(stubManifest()))
      .mockResolvedValueOnce(json(stubCatalog()))
      .mockResolvedValueOnce(json(stubBody()))
    vi.stubGlobal('fetch', fetchMock)

    await loadReadingBodyFromR2(EXAM_ID)
    const urls = fetchMock.mock.calls.map(c => String(c[0]))
    expect(urls.some(u => u.endsWith('.answers.json'))).toBe(false)
  })

  it('preserves question ids (progress/storage keys stay stable)', async () => {
    vi.stubEnv('VITE_EXAM_CONTENT_SOURCE', 'r2')
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(json(stubManifest()))
      .mockResolvedValueOnce(json(stubCatalog()))
      .mockResolvedValueOnce(json(stubBody())))
    const res = await loadReadingBodyFromR2(EXAM_ID)
    const parts = (res!.body as { parts: Array<{ questionGroups: Array<{ questions: Array<{ id: string }> }> }> }).parts
    expect(parts[0].questionGroups[0].questions[0].id).toBe('q1')
  })

  it('external AbortSignal aborts the in-flight body fetch', async () => {
    vi.stubEnv('VITE_EXAM_CONTENT_SOURCE', 'r2')
    const controller = new AbortController()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(stubManifest()))
      .mockResolvedValueOnce(json(stubCatalog()))
      .mockImplementationOnce((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true })
      }))
    vi.stubGlobal('fetch', fetchMock)

    const pending = loadReadingBodyFromR2(EXAM_ID, controller.signal)
    await new Promise(resolve => setTimeout(resolve, 0))
    controller.abort()
    await expect(pending).rejects.toBeInstanceOf(ExamContentError)
  })
})
