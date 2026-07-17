/**
 * Catalog cấu trúc câu = **1 bản / template** (không clone · 02…· 10).
 * Trước đây 167×10=1670 biến thể ví dụ khiến list trông trùng lặp.
 */
import type { SentenceStructure } from '@ryan/db'

export type CatalogStructure = Omit<SentenceStructure, 'createdAt' | 'updatedAt'>

/** Mục tiêu ship: 365 template khác nhau. */
export const TARGET_STRUCTURE_COUNT = 365

/** @deprecated Không còn nhân bản 10× */
export const VARIANTS_PER_CORE = 1

/**
 * Chuẩn hóa template để gộp trùng (bỏ khoảng trắng thừa).
 */
export function normalizeStructureTemplate(template: string): string {
  return template
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/**
 * Title gốc (bỏ hậu tố " · 02" / " · extra 0001" do expand cũ).
 */
export function baseStructureTitle(title: string): string {
  return title
    .replace(/\s*·\s*\d+\s*$/u, '')
    .replace(/\s*·\s*extra\s+\d+\s*$/iu, '')
    .trim()
}

/**
 * Dedupe theo template (1 bản / mẫu).
 * `priorityKeys` (thường = core) luôn được giữ trước khi cắt về target.
 */
export function expandSentenceStructures(
  items: CatalogStructure[],
  options?: { targetCount?: number; priorityTemplates?: string[] },
): CatalogStructure[] {
  if (items.length === 0) throw new Error('sentence structures list is empty')

  const byTemplate = new Map<string, CatalogStructure>()
  for (const item of items) {
    const key = normalizeStructureTemplate(item.template)
    const prev = byTemplate.get(key)
    if (!prev) {
      byTemplate.set(key, {
        ...item,
        title: baseStructureTitle(item.title),
      })
      continue
    }
    const preferNew =
      (!item.id.includes(':v') && prev.id.includes(':v'))
      || (item.id.length < prev.id.length && !item.id.includes(':v'))
    if (preferNew) {
      byTemplate.set(key, {
        ...item,
        title: baseStructureTitle(item.title),
      })
    }
  }

  const all = [...byTemplate.values()]
  const target = options?.targetCount ?? TARGET_STRUCTURE_COUNT
  const priority = new Set(
    (options?.priorityTemplates ?? []).map(normalizeStructureTemplate),
  )

  const preferred = all
    .filter((i) => priority.has(normalizeStructureTemplate(i.template)))
    .sort((a, b) => a.id.localeCompare(b.id))
  const rest = all
    .filter((i) => !priority.has(normalizeStructureTemplate(i.template)))
    .sort((a, b) => a.id.localeCompare(b.id))

  const ordered = [...preferred, ...rest]
  if (ordered.length <= target) return ordered
  return ordered.slice(0, target)
}
