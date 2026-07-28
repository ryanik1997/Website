import { useEffect } from 'react'
import {
  recordAdminPerformanceRoute,
  startAdminPerformanceMonitor,
} from './adminPerformance'

export function useAdminPerformanceTracking(
  pathname: string,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) return
    return startAdminPerformanceMonitor()
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    recordAdminPerformanceRoute(pathname)
  }, [enabled, pathname])
}
