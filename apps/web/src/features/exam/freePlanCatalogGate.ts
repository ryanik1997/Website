/**
 * Mode B — free users only *discover* demo catalog exams in library.
 * Real media access is still enforced by content-sign (server).
 * This is UX + reduced metadata exposure of paid bank titles in list UI.
 */
import { db } from '@ryan/db'
import { getMediaMode } from '../../lib/protectedMedia'

/** Align with Edge Function FREE_ALLOW_PREFIXES (demo ids). */
export const FREE_DEMO_LISTENING_ID_HINTS = [
  'catalog-listening-ket-a2-test1',
  'catalog-listening-pet-b1-test1',
  'ket-a2-test1',
  'pet-b1-test1',
] as const

export const FREE_DEMO_READING_ID_HINTS = [
  'catalog-reading-ket-a2-test1',
  'catalog-reading-pet-b1-test1',
  'ket-a2-test1',
  'pet-b1-test1',
] as const

type Plan = 'free' | 'trial' | 'basic' | 'pro' | 'lifetime' | string

export async function getEffectivePlan(): Promise<Plan> {
  const [planRow, adminRow, expRow] = await Promise.all([
    db.settings.get('plan'),
    db.settings.get('is_admin'),
    db.settings.get('plan_expires_at'),
  ])
  if (adminRow?.value === true) return 'pro'
  const plan = (planRow?.value as Plan) ?? 'free'
  if (plan === 'free' || plan === 'lifetime') return plan
  const exp = expRow?.value as string | undefined
  if (exp && new Date(exp).getTime() < Date.now()) return 'free'
  return plan
}

export function isPaidPlan(plan: Plan): boolean {
  return plan === 'trial' || plan === 'basic' || plan === 'pro' || plan === 'lifetime'
}

function matchesHints(id: string, title: string | undefined, hints: readonly string[]): boolean {
  const hay = `${id} ${title ?? ''}`.toLowerCase()
  return hints.some(h => hay.includes(h.toLowerCase()))
}

/**
 * When fortress signed mode is on and plan is free, filter catalog list to demos.
 * Always keep user imports / published non-catalog rows.
 */
export async function filterExamsForPlan<T extends { id: string; title?: string }>(
  exams: T[],
  skill: 'listening' | 'reading',
): Promise<T[]> {
  // Local DEV: show full library for authoring
  if (getMediaMode() === 'local') return exams

  const plan = await getEffectivePlan()
  if (isPaidPlan(plan)) return exams

  const hints = skill === 'listening' ? FREE_DEMO_LISTENING_ID_HINTS : FREE_DEMO_READING_ID_HINTS
  return exams.filter(e => {
    const id = e.id
    // User imports always visible
    if (id.startsWith('listening-import-') || id.startsWith('reading-import-')) return true
    if (id.startsWith('listening-import') || id.includes('import-')) return true
    // Published cloud rows from admin — still filter catalog-like ids
    if (matchesHints(id, e.title, hints)) return true
    // Free: hide other catalog / cambridge system papers
    if (id.startsWith('catalog-')) return false
    if (/ielts-cam|cambridge|fce-|cae-|cpe-|ket-|pet-/.test(id.toLowerCase())) {
      return matchesHints(id, e.title, hints)
    }
    return true
  })
}
