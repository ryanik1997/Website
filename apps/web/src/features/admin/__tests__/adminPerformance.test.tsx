import { StrictMode } from 'react'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import {
  MemoryRouter,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  clearAdminPerformanceSession,
  getAdminPerformanceReport,
  recordAdminPerformanceRoute,
  startAdminPerformanceMonitor,
  startAdminPerformanceSession,
  stopAdminPerformanceSession,
} from '../adminPerformance'
import { useAdminPerformanceTracking } from '../useAdminPerformanceTracking'

type ObserverOptions = PerformanceObserverInit & {
  durationThreshold?: number
}

type ObserverInstance = {
  callback: PerformanceObserverCallback
  disconnect: ReturnType<typeof vi.fn>
  disconnected: boolean
  options: ObserverOptions | null
}

const observerInstances: ObserverInstance[] = []

class PerformanceObserverMock {
  static supportedEntryTypes = [
    'largest-contentful-paint',
    'layout-shift',
    'longtask',
    'event',
    'resource',
  ]

  callback: PerformanceObserverCallback
  disconnected = false
  options: ObserverOptions | null = null
  disconnect = vi.fn(() => {
    this.disconnected = true
  })

  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback
    observerInstances.push(this)
  }

  observe(options: ObserverOptions) {
    this.options = options
  }

  takeRecords(): PerformanceEntryList {
    return []
  }
}

vi.stubGlobal('PerformanceObserver', PerformanceObserverMock)

function entry(
  entryType: string,
  startTime: number,
  duration = 0,
  extra: Record<string, unknown> = {},
): PerformanceEntry {
  return {
    name: entryType,
    entryType,
    startTime,
    duration,
    toJSON: () => ({}),
    ...extra,
  } as PerformanceEntry
}

function emit(entryType: string, entries: PerformanceEntry[]): void {
  for (const observer of observerInstances) {
    if (observer.disconnected || observer.options?.type !== entryType) continue
    observer.callback(
      {
        getEntries: () => entries,
        getEntriesByName: () => [],
        getEntriesByType: () => entries,
      } as PerformanceObserverEntryList,
      observer as unknown as PerformanceObserver,
    )
  }
}

function TrackingHarness({
  enabled = true,
}: {
  enabled?: boolean
}) {
  const location = useLocation()
  const navigate = useNavigate()
  useAdminPerformanceTracking(location.pathname, enabled)

  return (
    <>
      <span data-testid="path">{location.pathname}</span>
      <button type="button" onClick={() => navigate('/app/vocab')}>
        vocab
      </button>
      <button type="button" onClick={() => navigate('/app/writing')}>
        writing
      </button>
    </>
  )
}

let now = 100
let monitorCleanups: Array<() => void> = []

beforeEach(() => {
  vi.useFakeTimers()
  observerInstances.length = 0
  now = 100
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  vi.spyOn(performance, 'getEntriesByType').mockImplementation(type => {
    if (type !== 'navigation') return []
    return [{
      responseStart: 40,
      domInteractive: 70,
      domContentLoadedEventEnd: 80,
      loadEventEnd: 100,
    } as PerformanceNavigationTiming]
  })
  vi.spyOn(performance, 'getEntriesByName').mockImplementation(name => (
    name === 'first-contentful-paint'
      ? [entry('paint', 60)]
      : []
  ))
  window.history.replaceState({}, '', '/app/admin')
  clearAdminPerformanceSession()
})

afterEach(() => {
  cleanup()
  for (const stop of monitorCleanups) stop()
  monitorCleanups = []
  vi.runOnlyPendingTimers()
  clearAdminPerformanceSession()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function startMonitor(): void {
  monitorCleanups.push(startAdminPerformanceMonitor())
}

describe('route integration through React Router', () => {
  it('splits a running report when MemoryRouter changes pathname', () => {
    render(
      <MemoryRouter initialEntries={['/app/admin']}>
        <TrackingHarness />
      </MemoryRouter>,
    )

    act(() => {
      startAdminPerformanceSession()
    })
    now = 225
    fireEvent.click(screen.getByRole('button', { name: 'vocab' }))
    now = 390
    fireEvent.click(screen.getByRole('button', { name: 'writing' }))
    now = 540

    const stopped = stopAdminPerformanceSession()

    expect(stopped?.routes.map(route => route.path)).toEqual([
      '/app/admin',
      '/app/vocab',
      '/app/writing',
    ])
    expect(stopped?.routes.map(route => route.durationMs)).toEqual([
      125,
      165,
      150,
    ])
  })
})

describe('timestamp-window attribution', () => {
  it('attributes delayed long-task and resource entries to their original route', () => {
    startMonitor()
    recordAdminPerformanceRoute('/app/admin')
    startAdminPerformanceSession()
    now = 200
    recordAdminPerformanceRoute('/app/vocab')

    emit('longtask', [
      entry('longtask', 50, 90),
      entry('longtask', 150, 70),
      entry('longtask', 250, 80),
    ])
    emit('resource', [
      entry('resource', 175, 10, { transferSize: 1_000 }),
      entry('resource', 275, 20, { transferSize: 2_000 }),
    ])

    const measured = getAdminPerformanceReport()
    expect(measured?.metrics.longTaskCount).toBe(2)
    expect(measured?.routes[0]).toMatchObject({
      path: '/app/admin',
      longTaskCount: 1,
      longTaskTotalMs: 70,
      resourceCount: 1,
      transferSize: 1_000,
    })
    expect(measured?.routes[1]).toMatchObject({
      path: '/app/vocab',
      longTaskCount: 1,
      longTaskTotalMs: 80,
      resourceCount: 1,
      transferSize: 2_000,
    })
  })

  it('filters CLS, INP and long tasks that happened before the session', () => {
    startMonitor()
    recordAdminPerformanceRoute('/app/admin')
    startAdminPerformanceSession()

    emit('layout-shift', [
      entry('layout-shift', 50, 0, { value: 0.8, hadRecentInput: false }),
    ])
    emit('event', [
      entry('event', 60, 300, { interactionId: 1 }),
    ])
    emit('longtask', [entry('longtask', 70, 100)])

    const measured = getAdminPerformanceReport()
    expect(measured?.metrics).toMatchObject({
      cls: 0,
      inpMs: null,
      longTaskCount: 0,
    })
  })
})

describe('per-route Web Vitals', () => {
  it('keeps true initial FCP/LCP and records soft-route LCP, CLS and INP', () => {
    startMonitor()
    emit('largest-contentful-paint', [
      entry('largest-contentful-paint', 80),
    ])

    recordAdminPerformanceRoute('/app/admin')
    startAdminPerformanceSession()
    emit('layout-shift', [
      entry('layout-shift', 150, 0, { value: 0.05, hadRecentInput: false }),
    ])
    emit('event', [
      entry('event', 180, 120, { interactionId: 1 }),
    ])

    now = 200
    recordAdminPerformanceRoute('/app/vocab')
    emit('largest-contentful-paint', [
      entry('largest-contentful-paint', 260),
    ])
    emit('layout-shift', [
      entry('layout-shift', 250, 0, { value: 0.03, hadRecentInput: false }),
      entry('layout-shift', 270, 0, { value: 0.9, hadRecentInput: true }),
    ])
    emit('event', [
      entry('event', 280, 80, { interactionId: 2 }),
      entry('event', 285, 90, { interactionId: 2 }),
    ])

    const measured = getAdminPerformanceReport()
    expect(measured?.routes[0]).toMatchObject({
      path: '/app/admin',
      fcpMs: 60,
      lcpMs: 80,
      cls: 0.05,
      inpMs: 120,
    })
    expect(measured?.routes[1]).toMatchObject({
      path: '/app/vocab',
      fcpMs: null,
      lcpMs: 60,
      cls: 0.03,
      inpMs: 90,
    })
    expect(measured?.metrics).toMatchObject({
      fcpMs: 60,
      lcpMs: 260,
      cls: 0.08,
      inpMs: 120,
    })
  })
})

describe('observer lifecycle and admin gate', () => {
  it('uses buffered observers and a 16 ms Event Timing threshold', () => {
    startMonitor()

    const options = Object.fromEntries(
      observerInstances.map(observer => [
        observer.options?.type,
        observer.options,
      ]),
    )
    expect(options['largest-contentful-paint']).toMatchObject({ buffered: true })
    expect(options['layout-shift']).toMatchObject({ buffered: true })
    expect(options.longtask).toMatchObject({ buffered: true })
    expect(options.event).toMatchObject({
      buffered: true,
      durationThreshold: 16,
    })
  })

  it('does not install observers until the admin gate is enabled', () => {
    const view = render(
      <MemoryRouter initialEntries={['/app/admin']}>
        <TrackingHarness enabled={false} />
      </MemoryRouter>,
    )
    expect(observerInstances).toHaveLength(0)

    view.rerender(
      <MemoryRouter initialEntries={['/app/admin']}>
        <TrackingHarness enabled />
      </MemoryRouter>,
    )
    expect(observerInstances).toHaveLength(5)
  })

  it('shares one observer set across consumers and React StrictMode remounts', () => {
    const directStopA = startAdminPerformanceMonitor()
    const directStopB = startAdminPerformanceMonitor()
    monitorCleanups.push(directStopA, directStopB)
    expect(observerInstances).toHaveLength(5)

    directStopA()
    expect(observerInstances.every(observer => !observer.disconnected)).toBe(true)

    const view = render(
      <StrictMode>
        <MemoryRouter initialEntries={['/app/admin']}>
          <TrackingHarness />
        </MemoryRouter>
      </StrictMode>,
    )
    expect(observerInstances).toHaveLength(5)

    directStopB()
    view.unmount()
    expect(observerInstances.every(observer => !observer.disconnected)).toBe(true)
    act(() => {
      vi.runOnlyPendingTimers()
    })
    expect(observerInstances.every(observer => observer.disconnected)).toBe(true)
  })
})
