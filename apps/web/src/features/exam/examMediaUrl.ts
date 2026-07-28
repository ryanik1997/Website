/** Resolve đường dẫn media tĩnh từ public/ (catalog) → URL tuyệt đối khi có window. */
export function resolveExamMediaUrl(url?: string): string | undefined {
  if (!url?.trim()) return undefined
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:')) {
    return trimmed
  }
  const base = import.meta.env.BASE_URL ?? '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const rawPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
  // Encode each segment so "Questions 15_20.jpg" still loads
  const path = rawPath
    .split('/')
    .map(seg => encodeURIComponent(decodeURIComponent(seg)))
    .join('/')
  const relative = `${normalizedBase}${path}`.replace(/\/{2,}/g, '/')
  // //catalog → fix double slash after origin join only; keep leading /
  const withLead = relative.startsWith('/') ? relative : `/${relative}`

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${withLead}`
  }
  return withLead
}
