/** Resolve đường dẫn media tĩnh từ public/ (catalog) */
export function resolveExamMediaUrl(url?: string): string | undefined {
  if (!url?.trim()) return undefined
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:')) {
    return trimmed
  }
  const base = import.meta.env.BASE_URL ?? '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const path = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
  return `${normalizedBase}${path}`
}