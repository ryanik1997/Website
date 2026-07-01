import type { MindmapLayout, NodeLayout } from './layouts'
import { CANVAS_W, CANVAS_H } from './types'

export const NODE_DIMS: Record<number, { w: number; h: number }> = {
  0: { w: 140, h: 44 },
  1: { w: 120, h: 36 },
  2: { w: 100, h: 30 },
  3: { w: 90, h: 28 },
}

/** Khe giữa mép pill và đường nối (gồm border 2px + stroke) */
const EDGE_PAD = 12
const LINE_GAP = 5

export function nodeDims(depth: number) {
  return NODE_DIMS[Math.min(depth, 3)]
}

export interface ContentBounds {
  minX: number
  minY: number
  width: number
  height: number
}

const PAD = 100

export function computeContentBounds(layouts: NodeLayout[]): ContentBounds {
  let minX = 0
  let minY = 0
  let maxX = CANVAS_W
  let maxY = CANVAS_H

  for (const l of layouts) {
    const { w, h } = nodeDims(l.depth)
    const pad = EDGE_PAD + 4
    minX = Math.min(minX, l.x - w / 2 - pad - 28)
    maxX = Math.max(maxX, l.x + w / 2 + pad + 28)
    minY = Math.min(minY, l.y - h / 2 - pad - 36)
    maxY = Math.max(maxY, l.y + h / 2 + pad + 48)
  }

  minX -= PAD
  minY -= PAD
  maxX += PAD
  maxY += PAD

  return {
    minX,
    minY,
    width: Math.max(CANVAS_W, maxX - minX),
    height: Math.max(CANVAS_H, maxY - minY),
  }
}

export function shiftLayouts(layouts: NodeLayout[], bounds: ContentBounds): NodeLayout[] {
  return layouts.map(l => ({
    ...l,
    x: l.x - bounds.minX,
    y: l.y - bounds.minY,
  }))
}

function unitToward(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): { x: number; y: number } {
  const dx = toX - fromX
  const dy = toY - fromY
  const len = Math.hypot(dx, dy)
  if (len < 1e-6) return { x: 1, y: 0 }
  return { x: dx / len, y: dy / len }
}

/**
 * Giao điểm ray từ tâm theo hướng (ux, uy) → viền pill (stadium).
 */
export function pillEdgeAlongDir(
  cx: number,
  cy: number,
  w: number,
  h: number,
  ux: number,
  uy: number,
  extraPad = EDGE_PAD,
): { x: number; y: number } {
  const W = w + extraPad * 2
  const H = h + extraPad * 2
  const hw = W / 2
  const hh = H / 2
  const len = Math.hypot(ux, uy)
  if (len < 1e-6) return { x: cx, y: cy }
  ux /= len
  uy /= len

  const r = hh
  const flat = Math.max(0, hw - r)

  let best = Infinity

  if (Math.abs(uy) > 1e-6) {
    for (const sign of [1, -1]) {
      const t = (sign * hh) / uy
      if (t > 1e-6 && Math.abs(ux * t) <= flat + 0.5) {
        best = Math.min(best, t)
      }
    }
  }

  for (const sign of [-1, 1] as const) {
    const ccx = sign * flat
    const a = ux * ux + uy * uy
    const b = -2 * ccx * ux
    const c = ccx * ccx - r * r
    const disc = b * b - 4 * a * c
    if (disc >= 0) {
      const sq = Math.sqrt(disc)
      for (const t of [(-b - sq) / (2 * a), (-b + sq) / (2 * a)]) {
        if (t > 1e-6) best = Math.min(best, t)
      }
    }
  }

  if (!Number.isFinite(best)) {
    const denom = Math.sqrt((ux * ux) / (hw * hw) + (uy * uy) / (hh * hh))
    const s = 1 / Math.max(denom, 1e-6)
    return { x: cx + ux * s, y: cy + uy * s }
  }

  return { x: cx + ux * best, y: cy + uy * best }
}

/** @deprecated alias — ray từ tâm về phía điểm đích */
export function pillEdgePoint(
  cx: number,
  cy: number,
  w: number,
  h: number,
  towardX: number,
  towardY: number,
  extraPad = EDGE_PAD,
): { x: number; y: number } {
  const { x: ux, y: uy } = unitToward(cx, cy, towardX, towardY)
  return pillEdgeAlongDir(cx, cy, w, h, ux, uy, extraPad)
}

function nudgeAlong(
  p: { x: number; y: number },
  dirX: number,
  dirY: number,
  gap: number,
) {
  const len = Math.hypot(dirX, dirY)
  if (len < 1e-6) return p
  return {
    x: p.x + (dirX / len) * gap,
    y: p.y + (dirY / len) * gap,
  }
}

function layoutDirections(
  layout: MindmapLayout,
  parent: NodeLayout,
  child: NodeLayout,
): { outDir: { x: number; y: number }; inDir: { x: number; y: number } } {
  switch (layout) {
    case 'tree': {
      const hx = child.x >= parent.x ? 1 : -1
      return { outDir: { x: hx, y: 0 }, inDir: { x: -hx, y: 0 } }
    }
    case 'tree-down': {
      const vy = child.y >= parent.y ? 1 : -1
      return { outDir: { x: 0, y: vy }, inDir: { x: 0, y: -vy } }
    }
    case 'fishbone': {
      const hx = child.x >= parent.x ? 1 : -1
      return { outDir: { x: hx, y: 0 }, inDir: { x: -hx, y: 0 } }
    }
    default: {
      const outDir = unitToward(parent.x, parent.y, child.x, child.y)
      const inDir = unitToward(child.x, child.y, parent.x, parent.y)
      return { outDir, inDir }
    }
  }
}

function elbowPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  axis: 'horizontal' | 'vertical',
): string {
  if (axis === 'horizontal') {
    const midX = (start.x + end.x) / 2
    return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`
  }
  const midY = (start.y + end.y) / 2
  return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`
}

function radialBezierPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  outDir: { x: number; y: number },
  inDir: { x: number; y: number },
): string {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const dist = Math.hypot(dx, dy)
  if (dist < 4) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`
  }

  const tension = Math.min(dist * 0.38, 120)
  const c1x = start.x + outDir.x * tension
  const c1y = start.y + outDir.y * tension
  const c2x = end.x + inDir.x * tension
  const c2y = end.y + inDir.y * tension

  return `M ${start.x} ${start.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${end.x} ${end.y}`
}

/** Đường nối mép pill cha → mép pill con, theo layout. */
export function connectorPath(
  parent: NodeLayout,
  child: NodeLayout,
  layout: MindmapLayout = 'round',
): string {
  const pSize = nodeDims(parent.depth)
  const cSize = nodeDims(child.depth)
  const { outDir, inDir } = layoutDirections(layout, parent, child)

  let start = pillEdgeAlongDir(parent.x, parent.y, pSize.w, pSize.h, outDir.x, outDir.y)
  let end = pillEdgeAlongDir(child.x, child.y, cSize.w, cSize.h, inDir.x, inDir.y)

  start = nudgeAlong(start, outDir.x, outDir.y, LINE_GAP)
  end = nudgeAlong(end, inDir.x, inDir.y, LINE_GAP)

  switch (layout) {
    case 'tree':
    case 'fishbone':
      return elbowPath(start, end, 'horizontal')
    case 'tree-down':
      return elbowPath(start, end, 'vertical')
    default:
      return radialBezierPath(start, end, outDir, inDir)
  }
}