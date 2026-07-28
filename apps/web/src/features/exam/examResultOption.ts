export function formatExamResultOption(option: { id?: unknown; label?: unknown }, index: number): string {
  const rawId = String(option.id ?? '').trim()
  const fallbackId = index >= 0 && index < 26 ? String.fromCharCode(65 + index) : String(index + 1)
  const id = (rawId || fallbackId).toUpperCase()
  return `${id}. ${String(option.label ?? '').trim()}`
}

export function normalizeImportedAnswer(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim()
}
