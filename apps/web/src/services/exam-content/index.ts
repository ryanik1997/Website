/**
 * Public API for the shared exam-content delivery layer.
 *
 * Reading and Writing modules are supported for the preview migration phase.
 * Legacy sources (bundled TID data, Supabase-signed catalog bodies and answer
 * vaults) remain untouched and stay the scoring source — public R2 bodies are
 * answer-stripped.
 */
import {
  ExamContentError,
  examContentSource,
  fetchJsonWithCache,
} from './examContentClient'
import { resolveReadingCatalog, resolveWritingCatalog } from './examContentManifest'
import type { LoadedReadingBody, LoadedWritingTasks } from './examContentTypes'

export * from './examContentClient'
export * from './examContentManifest'
export * from './examContentTypes'
export { examContentCache, ExamContentCache } from './examContentCache'

/** True when the app is configured to read exam bodies from R2. */
export function isExamContentR2(): boolean {
  return examContentSource() === 'r2'
}

/**
 * Derive the TID slug (cam-{book}-{test}) from a catalog id so the IELTS shell
 * can build stable element ids (reading-container-{slug}).
 */
export function ieltsSlugFromExamId(examId: string): string | null {
  const m = examId.toLowerCase().match(/cam-(\d+)-(\d+)-reading/)
  if (m) return `cam-${Number(m[1])}-${Number(m[2])}`
  const m2 = examId.toLowerCase().match(/cam\s*(\d+)[- ]*test\s*(\d+)/i)
  if (m2) return `cam-${Number(m2[1])}-${Number(m2[2])}`
  return null
}

/**
 * Load a Reading test body from the R2 release by stable id.
 *
 * Returns null ONLY when the source is 'legacy' (no R2 call is made). In r2
 * mode a missing manifest/catalog entry or a failed request THROWS
 * ExamContentError with testId + objectKey context — callers must surface the
 * error, never fall back to legacy silently.
 */
export async function loadReadingBodyFromR2(
  examId: string,
  signal?: AbortSignal,
): Promise<LoadedReadingBody | null> {
  if (!isExamContentR2()) return null

  const { baseUrl, byId } = await resolveReadingCatalog(signal)
  const entry = byId.get(examId)
  if (!entry) {
    throw new ExamContentError(`Test not found in reading release: ${examId}`, {
      testId: examId,
      label: 'reading-body',
    })
  }

  const url = `${baseUrl}/${entry.objectKey.replace(/^\//, '')}`
  const raw = await fetchJsonWithCache<unknown>(url, {
    signal,
    label: 'reading-body',
    testId: examId,
    objectKey: entry.objectKey,
  })

  if (!raw || typeof raw !== 'object' || !(raw as { parts?: unknown }).parts) {
    throw new ExamContentError(`Invalid reading body for ${examId}`, {
      testId: examId,
      objectKey: entry.objectKey,
    })
  }

  const format = entry.level === 'ielts' ? 'ielts' : 'cambridge'
  const body = entry.level === 'ielts' ? withIeltsSlug(raw, examId) : raw
  return { body, format, objectKey: entry.objectKey }
}

/** Attach the stable slug the IELTS shell uses for element ids. */
function withIeltsSlug(body: unknown, examId: string): unknown {
  const slug = ieltsSlugFromExamId(examId)
  if (slug && body && typeof body === 'object' && !(body as { slug?: string }).slug) {
    return { ...(body as Record<string, unknown>), slug }
  }
  return body
}

/**
 * Load IELTS Writing tasks from the R2 release.
 *
 * Returns null ONLY when the source is 'legacy' (no R2 call is made). In r2
 * mode a missing manifest/catalog or a failed request THROWS ExamContentError
 * — callers must surface the error, never fall back to legacy silently.
 *
 * The returned tasks array replaces the legacy tasks.json fetch. Individual
 * task bodies and images are fetched on demand from the R2 release.
 */
export async function loadWritingTasksFromR2(
  signal?: AbortSignal,
): Promise<LoadedWritingTasks | null> {
  if (!isExamContentR2()) return null

  const { baseUrl, byId, catalog } = await resolveWritingCatalog(signal)

  // Fetch all task bodies in parallel (cached by URL)
  const entries = [...byId.values()]
  const tasks = await Promise.all(
    entries.map(async (entry) => {
      const url = `${baseUrl}/${entry.objectKey.replace(/^\//, '')}`
      return fetchJsonWithCache<unknown>(url, {
        signal,
        label: 'writing-task',
        testId: entry.id,
        objectKey: entry.objectKey,
      })
    }),
  )

  if (tasks.length === 0) {
    throw new ExamContentError('Writing catalog is empty (0 tasks)', {
      label: 'writing-tasks',
    })
  }

  return {
    tasks,
    catalogObjectKey: catalog.tests[0]?.objectKey ?? '',
  }
}

/**
 * Resolve a writing task image URL from the R2 release.
 * In r2 mode, image paths like /catalog/writing/tid/images/xxx.webp are
 * rewritten to point at the R2 base URL.
 */
export function resolveWritingImageR2(
  image: string | null,
  baseUrl: string,
): string | null {
  if (!image) return null
  if (!isExamContentR2()) return image
  // Rewrite /catalog/writing/tid/images/xxx.webp → {baseUrl}/ielts/writing/images/xxx.webp
  const match = image.match(/^\/catalog\/writing\/tid\/images\/(.+)$/)
  if (match) {
    return `${baseUrl}/ielts/writing/images/${match[1]}`
  }
  return image
}