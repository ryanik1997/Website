/** Resolve đường dẫn media tĩnh từ public/ (catalog) → URL tuyệt đối khi có window. */
export function resolveExamMediaUrl(url?: string): string | undefined {
  if (!url?.trim()) return undefined
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:')) {
    return trimmed
  }
  const base = import.meta.env.BASE_URL ?? '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const path = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
  const relative = `${normalizedBase}${path}`.replace(/\/{2,}/g, '/')
  // //catalog → fix double slash after origin join only; keep leading /
  const withLead = relative.startsWith('/') ? relative : `/${relative}`

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${withLead}`
  }
  return withLead
}
