/**
 * Mode C — hydrate full catalog exam JSON via signed/private path.
 * List UI only holds stubs (no answers). Opening a test fetches the body once.
 */
import { catalogExamBodyPath, isCatalogListeningExamId, isCatalogReadingExamId } from '@ryan/catalog'
import { resolvePlayableMediaUrl } from '../../lib/protectedMedia'
import { mediaAccessUserMessage, parseMediaAccessError } from '../../lib/mediaAccessErrors'

const bodyCache = new Map<string, unknown>()
const inflight = new Map<string, Promise<unknown>>()

export type CatalogBodySkill = 'listening' | 'reading'

export function isCatalogExamStub(exam: { id?: string; bodyRemote?: boolean; parts?: Array<{ questions?: unknown[] }> }): boolean {
  if (!exam?.id) return false
  if (exam.bodyRemote === true) return true
  // Heuristic: catalog id + no questions loaded yet
  const isCat = isCatalogListeningExamId(exam.id) || isCatalogReadingExamId(exam.id)
  if (!isCat) return false
  const parts = exam.parts
  if (!Array.isArray(parts) || parts.length === 0) return true
  const hasQ = parts.some(p => Array.isArray(p.questions) && p.questions.length > 0)
  return !hasQ
}

export async function fetchCatalogExamBody<T extends { id: string }>(
  exam: T & { bodyPath?: string; bodyRemote?: boolean },
  skill: CatalogBodySkill,
): Promise<T> {
  if (!isCatalogExamStub(exam)) {
    return exam
  }

  const path = catalogExamBodyPath(exam, skill)
  const cacheKey = path

  if (bodyCache.has(cacheKey)) {
    return bodyCache.get(cacheKey) as T
  }
  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey) as Promise<T>
  }

  const job = (async () => {
    try {
      const url = await resolvePlayableMediaUrl(`/${path}`)
      if (!url) throw new Error('No body URL')
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} loading exam body`)
      const full = await res.json() as T
      if (!full || typeof full !== 'object' || !(full as { id?: string }).id) {
        throw new Error('Invalid exam body JSON')
      }
      bodyCache.set(cacheKey, full)
      return full
    } catch (err) {
      const parsed = parseMediaAccessError(err)
      const msg = mediaAccessUserMessage(parsed)
      console.warn('[mode-c] fetchCatalogExamBody failed', path, parsed.code, err)
      throw new Error(msg)
    } finally {
      inflight.delete(cacheKey)
    }
  })()

  inflight.set(cacheKey, job)
  return job as Promise<T>
}

export function clearCatalogExamBodyCache(): void {
  bodyCache.clear()
  inflight.clear()
}

/** Ensure answers vault is merged before scoring / review (Mode D). */
export async function ensureExamAnswersLoaded<T extends { id: string; answersPath?: string; answersRemote?: boolean }>(
  exam: T,
  skill: CatalogBodySkill,
): Promise<T> {
  const { examMissingAnswerKeys, fetchCatalogExamAnswers, mergeAnswersIntoExam } = await import('./catalogExamAnswers')
  const asAny = exam as T & {
    parts?: Array<{
      questions?: Array<{ id?: string; answer?: string }>
      questionGroups?: Array<{ questions?: Array<{ id?: string; answer?: string }> }>
    }>
  }
  if (!examMissingAnswerKeys(asAny) && exam.answersRemote !== true) {
    return exam
  }
  if (exam.answersRemote === false && !examMissingAnswerKeys(asAny)) {
    return exam
  }
  try {
    const vault = await fetchCatalogExamAnswers(exam, skill)
    return mergeAnswersIntoExam(asAny, vault) as T
  } catch (err) {
    console.warn('[mode-d] ensureExamAnswersLoaded failed', exam.id, err)
    throw err
  }
}
