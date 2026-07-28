const STORAGE_KEY = 'sentence-structure-completion-history'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

export interface StructureCompletionEntry {
  structureId: string
  title: string
  completedAt: number
  source: 'sample' | 'ai'
  completedSentence?: string
}

function read(): StructureCompletionEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as StructureCompletionEntry[]
    const cutoff = Date.now() - MAX_AGE_MS
    const fresh = raw.filter(item => item.completedAt >= cutoff)
    if (fresh.length !== raw.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    return fresh
  } catch {
    return []
  }
}

export function getStructureCompletionHistory(): StructureCompletionEntry[] {
  return read().sort((a, b) => b.completedAt - a.completedAt)
}

export function recordStructureCompletion(entry: Omit<StructureCompletionEntry, 'completedAt'>): void {
  const history = read()
  history.unshift({ ...entry, completedAt: Date.now() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 200)))
}
