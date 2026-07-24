const STORAGE_KEY = 'ryan-admin-performance-report'
export const ADMIN_PERFORMANCE_EVENT = 'ryan-admin-performance-updated'

export interface AdminPerformanceRoute {
  path: string
  enteredAt: string
  durationMs: number
  longTaskCount: number
  longTaskTotalMs: number
  maxLongTaskMs: number
  resourceCount: number
  transferSize: number
}

export interface AdminPerformanceReport {
  active: boolean
  startedAt: string
  endedAt: string | null
  userAgent: string
  viewport: string
  connection: string | null
  metrics: {
    ttfbMs: number | null
    fcpMs: number | null
    lcpMs: number | null
    cls: number
    inpMs: number | null
    domInteractiveMs: number | null
    domContentLoadedMs: number | null
    loadCompleteMs: number | null
    longTaskCount: number
    longTaskTotalMs: number
    maxLongTaskMs: number
    resourceCount: number
    transferSize: number
  }
  routes: AdminPerformanceRoute[]
}

type ConnectionNavigator = Navigator & {
  connection?: { effectiveType?: string }
}

type LayoutShiftEntry = PerformanceEntry & {
  value: number
  hadRecentInput: boolean
}

type EventTimingEntry = PerformanceEntry & {
  duration: number
  interactionId?: number
}

let report: AdminPerformanceReport | null = null
let currentPath = ''
let currentRouteStartedAt = 0
let observers: PerformanceObserver[] = []
let latestLcp: number | null = null

function round(value: number, digits = 1): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function readStoredReport(): AdminPerformanceReport | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AdminPerformanceReport
    return parsed && typeof parsed.startedAt === 'string' && Array.isArray(parsed.routes)
      ? parsed
      : null
  } catch {
    return null
  }
}

function notify(): void {
  if (report) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(report))
  else sessionStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event(ADMIN_PERFORMANCE_EVENT))
}

function navigationMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const fcp = performance.getEntriesByName('first-contentful-paint')[0]
  return {
    ttfbMs: navigation ? round(navigation.responseStart) : null,
    fcpMs: fcp ? round(fcp.startTime) : null,
    lcpMs: latestLcp,
    domInteractiveMs: navigation ? round(navigation.domInteractive) : null,
    domContentLoadedMs: navigation ? round(navigation.domContentLoadedEventEnd) : null,
    loadCompleteMs: navigation?.loadEventEnd ? round(navigation.loadEventEnd) : null,
  }
}

function emptyReport(): AdminPerformanceReport {
  const navigation = navigationMetrics()
  const connection = (navigator as ConnectionNavigator).connection?.effectiveType ?? null
  return {
    active: true,
    startedAt: new Date().toISOString(),
    endedAt: null,
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    connection,
    metrics: {
      ...navigation,
      cls: 0,
      inpMs: null,
      longTaskCount: 0,
      longTaskTotalMs: 0,
      maxLongTaskMs: 0,
      resourceCount: 0,
      transferSize: 0,
    },
    routes: [],
  }
}

function currentRoute(): AdminPerformanceRoute | undefined {
  return report?.routes.at(-1)
}

function finishCurrentRoute(now = performance.now()): void {
  const route = currentRoute()
  if (route && currentRouteStartedAt > 0) {
    route.durationMs = round(now - currentRouteStartedAt)
  }
}

function observe(type: string, handler: (entries: PerformanceEntry[]) => void, buffered = false): void {
  if (!PerformanceObserver.supportedEntryTypes.includes(type)) return
  try {
    const observer = new PerformanceObserver(list => handler(list.getEntries()))
    observer.observe({ type, buffered })
    observers.push(observer)
  } catch {
    // Browsers expose different subsets of the Performance Observer API.
  }
}

export function startAdminPerformanceMonitor(): () => void {
  report = readStoredReport()

  observe('largest-contentful-paint', entries => {
    const entry = entries.at(-1)
    if (!entry) return
    latestLcp = round(entry.startTime)
    if (report?.active) {
      report.metrics.lcpMs = latestLcp
      notify()
    }
  }, true)

  observe('layout-shift', entries => {
    if (!report?.active) return
    for (const entry of entries as LayoutShiftEntry[]) {
      if (!entry.hadRecentInput) report.metrics.cls = round(report.metrics.cls + entry.value, 4)
    }
    notify()
  })

  observe('event', entries => {
    if (!report?.active) return
    for (const entry of entries as EventTimingEntry[]) {
      if (entry.interactionId && entry.duration > (report.metrics.inpMs ?? 0)) {
        report.metrics.inpMs = round(entry.duration)
      }
    }
    notify()
  })

  observe('longtask', entries => {
    if (!report?.active) return
    const route = currentRoute()
    for (const entry of entries) {
      const duration = round(entry.duration)
      report.metrics.longTaskCount += 1
      report.metrics.longTaskTotalMs = round(report.metrics.longTaskTotalMs + duration)
      report.metrics.maxLongTaskMs = Math.max(report.metrics.maxLongTaskMs, duration)
      if (route) {
        route.longTaskCount += 1
        route.longTaskTotalMs = round(route.longTaskTotalMs + duration)
        route.maxLongTaskMs = Math.max(route.maxLongTaskMs, duration)
      }
    }
    notify()
  })

  observe('resource', entries => {
    if (!report?.active) return
    const route = currentRoute()
    for (const entry of entries as PerformanceResourceTiming[]) {
      report.metrics.resourceCount += 1
      report.metrics.transferSize += entry.transferSize || 0
      if (route) {
        route.resourceCount += 1
        route.transferSize += entry.transferSize || 0
      }
    }
    notify()
  })

  return () => {
    observers.forEach(observer => observer.disconnect())
    observers = []
  }
}

export function recordAdminPerformanceRoute(path: string): void {
  currentPath = path
  if (!report?.active) return
  const now = performance.now()
  const route = currentRoute()
  if (route?.path === path) return
  finishCurrentRoute(now)
  currentRouteStartedAt = now
  report.routes.push({
    path,
    enteredAt: new Date().toISOString(),
    durationMs: 0,
    longTaskCount: 0,
    longTaskTotalMs: 0,
    maxLongTaskMs: 0,
    resourceCount: 0,
    transferSize: 0,
  })
  notify()
}

export function startAdminPerformanceSession(): AdminPerformanceReport {
  report = emptyReport()
  currentRouteStartedAt = performance.now()
  report.routes.push({
    path: currentPath || window.location.pathname,
    enteredAt: new Date().toISOString(),
    durationMs: 0,
    longTaskCount: 0,
    longTaskTotalMs: 0,
    maxLongTaskMs: 0,
    resourceCount: 0,
    transferSize: 0,
  })
  notify()
  return structuredClone(report)
}

export function stopAdminPerformanceSession(): AdminPerformanceReport | null {
  if (!report?.active) return getAdminPerformanceReport()
  finishCurrentRoute()
  report.active = false
  report.endedAt = new Date().toISOString()
  notify()
  return structuredClone(report)
}

export function clearAdminPerformanceSession(): void {
  report = null
  currentRouteStartedAt = 0
  notify()
}

export function getAdminPerformanceReport(): AdminPerformanceReport | null {
  if (!report) report = readStoredReport()
  if (report?.active) finishCurrentRoute()
  return report ? structuredClone(report) : null
}
