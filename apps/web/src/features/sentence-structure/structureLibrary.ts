import type { LearningStatus, SentenceStructure } from '@ryan/db'
import type { CefrLevel } from '../../lib/cefr'
import { categoryMeta } from './types'

export type LearningStatusFilter = LearningStatus | ''

export const LEARNING_STATUS_LABELS: Record<LearningStatus, string> = {
  not_started: 'Chưa học',
  learning: 'Đang học',
  learned: 'Đã học',
}

export function getLearningStatus(item: Pick<SentenceStructure, 'learningStatus'>): LearningStatus {
  return item.learningStatus ?? 'not_started'
}

function structureDedupeKey(item: Pick<SentenceStructure, 'template'>): string {
  return item.template.trim().toLowerCase().replace(/\s+/g, ' ')
}

function preferListItem(a: SentenceStructure, b: SentenceStructure): SentenceStructure {
  const aCore = a.id.startsWith('catalog:') && !a.id.includes(':v') && !a.id.includes('extra')
  const bCore = b.id.startsWith('catalog:') && !b.id.includes(':v') && !b.id.includes('extra')
  if (aCore && !bCore) return a
  if (bCore && !aCore) return b
  if (a.id.startsWith('catalog:') && !b.id.startsWith('catalog:')) return a
  if (b.id.startsWith('catalog:') && !a.id.startsWith('catalog:')) return b
  return a.updatedAt >= b.updatedAt ? a : b
}

export function uniqueStructures(items: SentenceStructure[]): SentenceStructure[] {
  const map = new Map<string, SentenceStructure>()
  for (const item of items) {
    const key = structureDedupeKey(item)
    const previous = map.get(key)
    map.set(key, previous ? preferListItem(previous, item) : item)
  }
  return [...map.values()].sort((a, b) => b.updatedAt - a.updatedAt)
}

export interface StructureFilters {
  query: string
  cefr: CefrLevel | undefined
  category: string
  status: LearningStatusFilter
  savedOnly: boolean
}

export function filterStructures(items: SentenceStructure[], filters: StructureFilters): SentenceStructure[] {
  const query = filters.query.trim().toLowerCase()
  return uniqueStructures(items).filter(item => {
    if (filters.savedOnly && !item.starred) return false
    if (filters.cefr && item.cefr !== filters.cefr) return false
    if (filters.category && categoryMeta(item.category).label !== filters.category) return false
    if (filters.status && getLearningStatus(item) !== filters.status) return false
    if (!query) return true
    return item.title.toLowerCase().includes(query)
      || item.template.toLowerCase().includes(query)
      || item.category.toLowerCase().includes(query)
      || item.description.toLowerCase().includes(query)
      || item.exampleNoteVi.toLowerCase().includes(query)
      || (item.cefr?.toLowerCase().includes(query) ?? false)
  })
}

export interface StatusCounts {
  total: number
  not_started: number
  learning: number
  learned: number
}

export function countStatuses(items: SentenceStructure[]): StatusCounts {
  const counts: StatusCounts = { total: items.length, not_started: 0, learning: 0, learned: 0 }
  for (const item of items) counts[getLearningStatus(item)] += 1
  return counts
}
