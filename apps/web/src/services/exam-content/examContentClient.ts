/**
 * Exam-content fetch client.
 *
 * Reads the delivery source from Vite env:
 *   VITE_EXAM_CONTENT_SOURCE   'legacy' (default) | 'r2'
 *   VITE_EXAM_CONTENT_BASE_URL public R2 origin (no trailing slash)
 *   VITE_EXAM_CONTENT_MANIFEST manifest path/URL, e.g. /manifests/staging.json
 *
 * Behaviour contract:
 *   - legacy mode NEVER issues an R2 request.
 *   - r2 mode fetches + validates the manifest, reading catalog and body; a
 *     failure throws ExamContentError (never an empty array / empty test).
 *   - responses are cached by URL (see examContentCache).
 *   - every request supports an external AbortSignal + a default timeout.
 *   - error messages carry route/test/object-path context.
 *   - never fetches an answer vault from public R2.
 */
import { examContentCache } from './examContentCache'
import type { ExamContentSource } from './examContentTypes'

const REQUEST_TIMEOUT_MS = 20000

export function examContentSource(): ExamContentSource {
  const raw = (import.meta.env.VITE_EXAM_CONTENT_SOURCE ?? 'legacy').toLowerCase()
  return raw === 'r2' ? 'r2' : 'legacy'
}

export function examContentBaseUrl(): string {
  return (import.meta.env.VITE_EXAM_CONTENT_BASE_URL ?? '').replace(/\/+$/, '')
}

export function examContentManifestPath(): string {
  return import.meta.env.VITE_EXAM_CONTENT_MANIFEST || '/manifests/staging.json'
}

export function examContentManifestUrl(): string {
  const p = examContentManifestPath()
  if (/^https?:\/\//i.test(p)) return p
  return `${examContentBaseUrl()}/${p.replace(/^\//, '')}`
}

export interface ErrorContext {
  url?: string
  label?: string
  testId?: string
  objectKey?: string
  status?: string
  [key: string]: string | undefined
}

/** Human-readable test/object context appended to error messages. */
function ctx(options: FetchJsonOptions): string {
  const parts = [options.testId, options.objectKey].filter(Boolean)
  return parts.length ? ` (${parts.join(' / ')})` : ''
}

export class ExamContentError extends Error {
  readonly context: ErrorContext

  constructor(message: string, context: ErrorContext = {}) {
    super(message)
    this.name = 'ExamContentError'
    this.context = context
  }
}

export interface FetchJsonOptions {
  signal?: AbortSignal
  /** Cache key override (defaults to the URL). Pass '' to bypass cache. */
  cacheKey?: string
  label?: string
  testId?: string
  objectKey?: string
}

/**
 * Fetch + JSON parse a public exam-content object with cache + abort support.
 * Throws ExamContentError with actionable context — it never resolves to a
 * degraded empty value.
 */
export async function fetchJsonWithCache<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const cacheKey = options.cacheKey === undefined ? url : options.cacheKey
  if (cacheKey) {
    const cached = examContentCache.get<T>(cacheKey)
    if (cached !== undefined) return cached
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const onExternalAbort = () => controller.abort()
  options.signal?.addEventListener('abort', onExternalAbort, { once: true })

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      throw new ExamContentError(`HTTP ${res.status} — ${options.label ?? 'exam content'}${ctx(options)}`, {
        url,
        label: options.label,
        status: String(res.status),
        testId: options.testId,
        objectKey: options.objectKey,
      })
    }
    const data = (await res.json()) as T
    if (cacheKey) examContentCache.set(cacheKey, data)
    return data
  } catch (err) {
    if (err instanceof ExamContentError) throw err
    const aborted = (err as Error)?.name === 'AbortError'
    throw new ExamContentError(
      aborted
        ? `Timed out / aborted loading ${options.label ?? 'exam content'}: ${url}${ctx(options)}`
        : `Failed loading ${options.label ?? 'exam content'}: ${url} — ${(err as Error)?.message ?? String(err)}${ctx(options)}`,
      {
        url,
        label: options.label,
        testId: options.testId,
        objectKey: options.objectKey,
      },
    )
  } finally {
    clearTimeout(timeoutId)
    options.signal?.removeEventListener('abort', onExternalAbort)
  }
}
