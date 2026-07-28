import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSequentialPaneScroll } from '../ketRw/useSequentialPaneScroll'

/* ── Helpers ─────────────────────────────────────────────────── */

function createPaneRef(scrollHeight: number, clientHeight: number) {
  const el = document.createElement('div')
  Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, writable: true })
  Object.defineProperty(el, 'clientHeight', { value: clientHeight, writable: true })
  Object.defineProperty(el, 'scrollTop', { value: 0, writable: true })
  return { current: el } as React.RefObject<HTMLDivElement | null>
}

function createBodyRef() {
  const el = document.createElement('div')
  return { current: el } as React.RefObject<HTMLDivElement | null>
}

function fireWheel(
  body: HTMLElement,
  deltaY: number,
  ctrlKey = false,
  deltaX = 0,
  deltaMode = 0, // DOM_DELTA_PIXEL
) {
  const event = new WheelEvent('wheel', {
    deltaY,
    deltaX,
    deltaMode,
    ctrlKey,
    bubbles: true,
    cancelable: true,
  })
  body.dispatchEvent(event)
  return event
}

/* ── Tests ──────────────────────────────────────────────────── */

describe('useSequentialPaneScroll', () => {
  it('scrolls left pane first when scrolling down', () => {
    const bodyRef = createBodyRef()
    const leftRef = createPaneRef(1500, 500)   // 1000px scrollable
    const rightRef = createPaneRef(1200, 500)  // 700px scrollable

    renderHook(() => useSequentialPaneScroll(true, bodyRef, leftRef, rightRef))

    fireWheel(bodyRef.current!, 100)

    expect(leftRef.current!.scrollTop).toBe(100)
    expect(rightRef.current!.scrollTop).toBe(0)
  })

  it('overflows remaining delta to right pane when left reaches bottom', () => {
    const bodyRef = createBodyRef()
    const leftRef = createPaneRef(1500, 500)   // 1000px scrollable max
    const rightRef = createPaneRef(1200, 500)  // 700px scrollable

    leftRef.current!.scrollTop = 950
    rightRef.current!.scrollTop = 0

    renderHook(() => useSequentialPaneScroll(true, bodyRef, leftRef, rightRef))

    fireWheel(bodyRef.current!, 100)

    // Left has 50px remaining: 1000 - 950 = 50
    expect(leftRef.current!.scrollTop).toBe(1000)
    // Right gets remaining 50px: 100 - 50 = 50
    expect(rightRef.current!.scrollTop).toBe(50)
  })

  it('scrolls right pane when left already at bottom', () => {
    const bodyRef = createBodyRef()
    const leftRef = createPaneRef(1500, 500)   // fully scrolled
    const rightRef = createPaneRef(1200, 500)

    leftRef.current!.scrollTop = 1000  // at bottom
    rightRef.current!.scrollTop = 0

    renderHook(() => useSequentialPaneScroll(true, bodyRef, leftRef, rightRef))

    fireWheel(bodyRef.current!, 120)

    expect(leftRef.current!.scrollTop).toBe(1000) // unchanged
    expect(rightRef.current!.scrollTop).toBe(120)
  })

  it('scrolls right pane first when scrolling up', () => {
    const bodyRef = createBodyRef()
    const leftRef = createPaneRef(1500, 500)
    const rightRef = createPaneRef(1200, 500)

    leftRef.current!.scrollTop = 1000  // at bottom
    rightRef.current!.scrollTop = 200

    renderHook(() => useSequentialPaneScroll(true, bodyRef, leftRef, rightRef))

    fireWheel(bodyRef.current!, -80)

    expect(rightRef.current!.scrollTop).toBe(120) // 200 - 80
    expect(leftRef.current!.scrollTop).toBe(1000)  // unchanged
  })

  it('scrolls left pane when right pane is at top while scrolling up', () => {
    const bodyRef = createBodyRef()
    const leftRef = createPaneRef(1500, 500)
    const rightRef = createPaneRef(1200, 500)

    leftRef.current!.scrollTop = 500
    rightRef.current!.scrollTop = 0  // at top

    renderHook(() => useSequentialPaneScroll(true, bodyRef, leftRef, rightRef))

    fireWheel(bodyRef.current!, -100)

    expect(rightRef.current!.scrollTop).toBe(0)   // unchanged
    expect(leftRef.current!.scrollTop).toBe(400)   // 500 - 100
  })

  it('does not scroll body or pet-rw-main (no overflow)', () => {
    const bodyRef = createBodyRef()
    const leftRef = createPaneRef(1500, 500)
    const rightRef = createPaneRef(1200, 500)

    const bodyScrollable = document.createElement('div')
    bodyScrollable.scrollTop = 0
    document.documentElement.scrollTop = 0

    renderHook(() => useSequentialPaneScroll(true, bodyRef, leftRef, rightRef))

    fireWheel(bodyRef.current!, 100)

    // Only left pane scrolled, not document or body
    expect(leftRef.current!.scrollTop).toBe(100)
    expect(document.documentElement.scrollTop).toBe(0)
  })

  it('ignores horizontal scroll and Ctrl+wheel', () => {
    const bodyRef = createBodyRef()
    const leftRef = createPaneRef(1500, 500)
    const rightRef = createPaneRef(1200, 500)

    renderHook(() => useSequentialPaneScroll(true, bodyRef, leftRef, rightRef))

    // Ctrl+wheel (zoom)
    fireWheel(bodyRef.current!, 100, true)
    expect(leftRef.current!.scrollTop).toBe(0)

    // Horizontal scroll (deltaX > deltaY)
    fireWheel(bodyRef.current!, 10, false, 100)
    expect(leftRef.current!.scrollTop).toBe(0)
  })

  it('skips hook when disabled', () => {
    const bodyRef = createBodyRef()
    const leftRef = createPaneRef(1500, 500)
    const rightRef = createPaneRef(1200, 500)

    renderHook(() => useSequentialPaneScroll(false, bodyRef, leftRef, rightRef))

    fireWheel(bodyRef.current!, 100)
    expect(leftRef.current!.scrollTop).toBe(0)
  })
})
