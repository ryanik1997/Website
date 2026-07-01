import type { SentenceStructure } from '@ryan/db'

export type PatternPart =
  | { kind: 'text'; value: string }
  | { kind: 'slot'; key: 'A' | 'B' }

export function parseTemplate(template: string): PatternPart[] {
  const parts: PatternPart[] = []
  const re = /\[([AB])\]/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(template)) !== null) {
    if (m.index > last) {
      parts.push({ kind: 'text', value: template.slice(last, m.index) })
    }
    parts.push({ kind: 'slot', key: m[1] as 'A' | 'B' })
    last = m.index + m[0].length
  }
  if (last < template.length) {
    parts.push({ kind: 'text', value: template.slice(last) })
  }
  return parts
}

export function fillTemplate(template: string, a: string, b: string): string {
  return template
    .replace(/\[A\]/gi, a.trim())
    .replace(/\[B\]/gi, b.trim())
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizePhrase(s: string): string {
  return s.trim().toLowerCase().replace(/[.,!?;:]+$/, '').replace(/\s+/g, ' ')
}

export function phrasesMatch(user: string, expected: string): boolean {
  const u = normalizePhrase(user)
  const e = normalizePhrase(expected)
  if (!u || !e) return false
  return u === e
}

export const STRUCTURE_CATEGORIES = [
  { id: 'conjunction', label: 'Liên từ / Lý do', icon: '🔗' },
  { id: 'comparison', label: 'So sánh', icon: '📊' },
  { id: 'purpose', label: 'Mục đích', icon: '🎯' },
  { id: 'condition', label: 'Điều kiện', icon: '⚡' },
  { id: 'contrast', label: 'Tương phản', icon: '↔' },
  { id: 'other', label: 'Khác', icon: '⋯' },
] as const

export function categoryMeta(category: string) {
  return STRUCTURE_CATEGORIES.find(c => c.label === category || c.id === category)
    ?? STRUCTURE_CATEGORIES[STRUCTURE_CATEGORIES.length - 1]
}

export type StructureSeed = Omit<SentenceStructure, 'id' | 'createdAt' | 'updatedAt'>