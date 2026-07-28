const STORAGE_KEY = 'ryan-admin-performance-report'
export const ADMIN_PERFORMANCE_EVENT = 'ryan-admin-performance-updated'

export interface AdminPerformanceRoute {
  path: string
  enteredAt: string
  durationMs: number
  /**
   * True navigation LCP for the first route. Later routes contain a best-effort
   * soft-navigation proxy derived from new LCP candidates in that route window.
   */
  lcpMs: number | null
  /** FCP is a navigation metric, so it is only populated for the first route. */
  fcpMs: number | null
  cls: number
  inpMs: number | null
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

type SingleObserverOptions = {
  buffered?: boolean
  durationThreshold?: number
}

type RouteWindow = {
  routeIndex: number
  startedAtPerfMs: number
  endedAtPerfMs: number | null
}

let report: AdminPerformanceReport | null = null
let currentPath = ''
let sessionStartedAtPerfMs = 0
let routeWindows: RouteWindow[] = []
let observers: PerformanceObserver[] = []
let latestLcp: number | null = null
let monitorConsumers = new Set<symbol>()
let pendingMonitorDisconnect: number | null = null

function round(value: number, digits = 1): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function normaliseRoute(
  route: Partial<AdminPerformanceRoute>,
): AdminPerformanceRoute {
  return {
    path: typeof route.path === 'string' ? route.path : '',
    enteredAt: typeof route.enteredAt === 'string'
      ? route.enteredAt
      : new Date().toISOString(),
    durationMs: typeof route.durationMs === 'number' ? route.durationMs : 0,
    lcpMs: typeof route.lcpMs === 'number' ? route.lcpMs : null,
    fcpMs: typeof route.fcpMs === 'number' ? route.fcpMs : null,
    cls: typeof route.cls === 'number' ? route.cls : 0,
    inpMs: typeof route.inpMs === 'number' ? route.inpMs : null,
    longTaskCount: typeof route.longTaskCount === 'number'
      ? route.longTaskCount
      : 0,
    longTaskTotalMs: typeof route.longTaskTotalMs === 'number'
      ? route.longTaskTotalMs
      : 0,
    maxLongTaskMs: typeof route.maxLongTaskMs === 'number'
      ? route.maxLongTaskMs
      : 0,
    resourceCount: typeof route.resourceCount === 'number'
      ? route.resourceCount
      : 0,
    transferSize: typeof route.transferSize === 'number'
      ? route.transferSize
      : 0,
  }
}

function readStoredReport(): AdminPerformanceReport | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AdminPerformanceReport
    if (!parsed || typeof parsed.startedAt !== 'string' || !Array.isArray(parsed.routes)) {
      return null
    }
    parsed.routes = parsed.routes.map(route => normaliseRoute(route))
    return parsed
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

function createRoute(
  path: string,
  firstNavigation = false,
): AdminPerformanceRoute {
  const navigation = firstNavigation ? navigationMetrics() : null
  return {
    path,
    enteredAt: new Date().toISOString(),
    durationMs: 0,
    lcpMs: navigation?.lcpMs ?? null,
    fcpMs: navigation?.fcpMs ?? null,
    cls: 0,
    inpMs: null,
    longTaskCount: 0,
    longTaskTotalMs: 0,
    maxLongTaskMs: 0,
    resourceCount: 0,
    transferSize: 0,
  }
}

function currentRouteWindow(): RouteWindow | undefined {
  return routeWindows.at(-1)
}

function finishCurrentRoute(now = performance.now(), closeWindow = false): void {
  const window = currentRouteWindow()
  if (!report || !window) return
  const route = report.routes[window.routeIndex]
  if (route) route.durationMs = round(Math.max(0, now - window.startedAtPerfMs))
  if (closeWindow) window.endedAtPerfMs = now
}

function routeWindowForEntry(startTime: number): RouteWindow | undefined {
  for (let index = routeWindows.length - 1; index >= 0; index -= 1) {
    const window = routeWindows[index]
    const endedAt = window.endedAtPerfMs ?? Number.POSITIVE_INFINITY
    if (startTime >= window.startedAtPerfMs && startTime < endedAt) return window
  }
  return undefined
}

function routeForEntry(startTime: number): {
  route: AdminPerformanceRoute
  window: RouteWindow
} | null {
  if (!report || startTime < sessionStartedAtPerfMs) return null
  const window = routeWindowForEntry(startTime)
  if (!window) return null
  const route = report.routes[window.routeIndex]
  return route ? { route, window } : null
}

function observe(
  type: string,
  handler: (entries: PerformanceEntry[]) => void,
  options: SingleObserverOptions = {},
): void {
  if (!PerformanceObserver.supportedEntryTypes.includes(type)) return
  try {
    const observer = new PerformanceObserver(list => handler(list.getEntries()))
    observer.observe({ type, ...options } as PerformanceObserverInit)
    observers.push(observer)
  } catch {
    // Browsers expose different subsets of the Performance Observer API.
  }
}

function installAdminPerformanceObservers(): void {
  observe('largest-contentful-paint', entries => {
    let changed = false
    for (const entry of entries) {
      latestLcp = round(entry.startTime)
      if (!report?.active) continue

      // Global LCP and route 0 remain true hard-navigation metrics.
      report.metrics.lcpMs = latestLcp
      if (entry.startTime < sessionStartedAtPerfMs) {
        const firstRoute = report.routes[0]
        if (firstRoute) firstRoute.lcpMs = latestLcp
        changed = true
        continue
      }

      const attributed = routeForEntry(entry.startTime)
      if (!attributed) {
        changed = true
        continue
      }
      attributed.route.lcpMs = attributed.window.routeIndex === 0
        ? latestLcp
        : round(entry.startTime - attributed.window.startedAtPerfMs)
      changed = true
    }
    if (changed) notify()
  }, { buffered: true })

  observe('layout-shift', entries => {
    if (!report?.active) return
    let changed = false
    for (const entry of entries as LayoutShiftEntry[]) {
      if (entry.hadRecentInput || entry.startTime < sessionStartedAtPerfMs) continue
      const value = round(entry.value, 4)
      report.metrics.cls = round(report.metrics.cls + value, 4)
      const attributed = routeForEntry(entry.startTime)
      if (attributed) {
        attributed.route.cls = round(attributed.route.cls + value, 4)
      }
      changed = true
    }
    if (changed) notify()
  }, { buffered: true })

  observe('longtask', entries => {
    if (!report?.active) return
    let changed = false
    for (const entry of entries) {
      if (entry.startTime < sessionStartedAtPerfMs) continue
      const duration = round(entry.duration)
      report.metrics.longTaskCount += 1
      report.metrics.longTaskTotalMs = round(report.metrics.longTaskTotalMs + duration)
      report.metrics.maxLongTaskMs = Math.max(report.metrics.maxLongTaskMs, duration)
      const attributed = routeForEntry(entry.startTime)
      if (attributed) {
        attributed.route.longTaskCount += 1
        attributed.route.longTaskTotalMs = round(attributed.route.longTaskTotalMs + duration)
        attributed.route.maxLongTaskMs = Math.max(
          attributed.route.maxLongTaskMs,
          duration,
        )
      }
      changed = true
    }
    if (changed) notify()
  }, { buffered: true })

  observe('event', entries => {
    if (!report?.active) return
    let changed = false
    for (const entry of entries as EventTimingEntry[]) {
      if (
        !entry.interactionId
        || entry.startTime < sessionStartedAtPerfMs
      ) continue
      const duration = round(entry.duration)
      if (duration > (report.metrics.inpMs ?? 0)) {
        report.metrics.inpMs = duration
      }
      const attributed = routeForEntry(entry.startTime)
      if (attributed && duration > (attributed.route.inpMs ?? 0)) {
        attributed.route.inpMs = duration
      }
      changed = true
    }
    if (changed) notify()
  }, { buffered: true, durationThreshold: 16 })

  observe('resource', entries => {
    if (!report?.active) return
    let changed = false
    for (const entry of entries as PerformanceResourceTiming[]) {
      if (entry.startTime < sessionStartedAtPerfMs) continue
      const transferSize = entry.transferSize || 0
      report.metrics.resourceCount += 1
      report.metrics.transferSize += transferSize
      const attributed = routeForEntry(entry.startTime)
      if (attributed) {
        attributed.route.resourceCount += 1
        attributed.route.transferSize += transferSize
      }
      changed = true
    }
    if (changed) notify()
  })
}

function disconnectAdminPerformanceObservers(): void {
  observers.forEach(observer => observer.disconnect())
  observers = []
}

/**
 * Installs one shared observer set. Multiple consumers receive independent,
 * idempotent cleanup functions while sharing the same browser observers.
 */
export function startAdminPerformanceMonitor(): () => void {
  if (!report) report = readStoredReport()
  if (pendingMonitorDisconnect !== null) {
    window.clearTimeout(pendingMonitorDisconnect)
    pendingMonitorDisconnect = null
  }

  const consumer = Symbol('admin-performance-monitor')
  monitorConsumers.add(consumer)
  if (observers.length === 0) installAdminPerformanceObservers()

  let released = false
  return () => {
    if (released) return
    released = true
    monitorConsumers.delete(consumer)
    if (monitorConsumers.size > 0 || pendingMonitorDisconnect !== null) return

    // React StrictMode mounts, cleans up, then mounts effects again. Deferring
    // disconnect by one task lets that second mount reuse the singleton set.
    pendingMonitorDisconnect = window.setTimeout(() => {
      pendingMonitorDisconnect = null
      if (monitorConsumers.size === 0) disconnectAdminPerformanceObservers()
    }, 0)
  }
}

export function recordAdminPerformanceRoute(path: string): void {
  currentPath = path
  if (!report?.active) return
  const now = performance.now()
  const activeWindow = currentRouteWindow()
  const activeRoute = activeWindow
    ? report.routes[activeWindow.routeIndex]
    : undefined
  if (activeRoute?.path === path) return

  finishCurrentRoute(now, true)
  const routeIndex = report.routes.push(createRoute(path)) - 1
  routeWindows.push({
    routeIndex,
    startedAtPerfMs: now,
    endedAtPerfMs: null,
  })
  notify()
}

export function startAdminPerformanceSession(): AdminPerformanceReport {
  const now = performance.now()
  report = emptyReport()
  sessionStartedAtPerfMs = now
  routeWindows = []
  const routeIndex = report.routes.push(
    createRoute(currentPath || window.location.pathname, true),
  ) - 1
  routeWindows.push({
    routeIndex,
    startedAtPerfMs: now,
    endedAtPerfMs: null,
  })
  notify()
  return structuredClone(report)
}

export function stopAdminPerformanceSession(): AdminPerformanceReport | null {
  if (!report?.active) return getAdminPerformanceReport()
  finishCurrentRoute(performance.now(), true)
  report.active = false
  report.endedAt = new Date().toISOString()
  notify()
  return structuredClone(report)
}

export function clearAdminPerformanceSession(): void {
  report = null
  sessionStartedAtPerfMs = 0
  routeWindows = []
  notify()
}

export function getAdminPerformanceReport(): AdminPerformanceReport | null {
  if (!report) report = readStoredReport()
  if (report?.active) finishCurrentRoute()
  return report ? structuredClone(report) : null
}
