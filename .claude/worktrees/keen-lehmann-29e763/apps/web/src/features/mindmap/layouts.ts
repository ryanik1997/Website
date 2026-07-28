import type { MindNode } from './types'
import { CX, CY } from './types'
import { NODE_DIMS } from './connectors'

export type MindmapLayout = 'round' | 'tree' | 'tree-down' | 'fishbone'

export const LAYOUT_OPTIONS: Array<{ id: MindmapLayout; label: string; hint: string }> = [
  { id: 'round', label: 'Round', hint: 'Radial — nhánh xung quanh tâm' },
  { id: 'tree', label: 'Tree', hint: 'Cây ngang — gốc trái, nhánh sang phải' },
  { id: 'tree-down', label: 'Tree ↓', hint: 'Cây dọc — gốc trên, nhánh xuống dưới' },
  { id: 'fishbone', label: 'Fishbone', hint: 'Xương cá — nhánh trái/phải xen kẽ' },
]

export interface NodeLayout {
  id: string
  x: number
  y: number
  depth: number
  color: string
  parentId: string | null
  /** Auto-fit width per node — falls back to NODE_DIMS[depth].w when undefined */
  w?: number
  /** Auto-fit height per node — falls back to NODE_DIMS[depth].h when undefined */
  h?: number
}

export type SizeMap = Map<string, { w: number; h: number }>

const BRANCH_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#f97316',
]

// ── helpers ──────────────────────────────────────────────────────────────────

function leafCount(node: MindNode): number {
  if (node.collapsed || node.children.length === 0) return 1
  return node.children.reduce((s, c) => s + leafCount(c), 0)
}

function getSize(id: string, depth: number, sizeById?: SizeMap): { w: number; h: number } {
  const s = sizeById?.get(id)
  if (s) return s
  return NODE_DIMS[Math.min(depth, 3)]
}

function pushNode(
  result: NodeLayout[],
  node: MindNode,
  x: number,
  y: number,
  depth: number,
  color: string,
  parentId: string | null,
  sizeById?: SizeMap,
) {
  const s = sizeById?.get(node.id)
  result.push({ id: node.id, x, y, depth, color, parentId, w: s?.w, h: s?.h })
}

/** Chiều cao dọc mà cả subtree (bao gồm cháu chắt) chiếm khi xếp dọc */
function subtreeVSpan(node: MindNode, depth: number, sizeById?: SizeMap, gap = 18): number {
  const h = getSize(node.id, depth, sizeById).h
  if (node.collapsed || node.children.length === 0) return h
  const childTotal =
    node.children.reduce((s, c) => s + subtreeVSpan(c, depth + 1, sizeById, gap), 0) +
    (node.children.length - 1) * gap
  return Math.max(h, childTotal)
}

/** Bề ngang mà cả subtree chiếm khi xếp ngang */
function subtreeHSpan(node: MindNode, depth: number, sizeById?: SizeMap, gap = 20): number {
  const w = getSize(node.id, depth, sizeById).w
  if (node.collapsed || node.children.length === 0) return w
  const childTotal =
    node.children.reduce((s, c) => s + subtreeHSpan(c, depth + 1, sizeById, gap), 0) +
    (node.children.length - 1) * gap
  return Math.max(w, childTotal)
}

// ── Round (recursive, leafCount-weighted, no depth cap) ──────────────────────

export function roundLayout(root: MindNode, sizeById?: SizeMap): NodeLayout[] {
  const result: NodeLayout[] = []
  pushNode(result, root, CX, CY, 0, 'var(--color-primary)', null, sizeById)
  if (root.collapsed || root.children.length === 0) return result

  const n1 = root.children.length
  const total1 = root.children.reduce((s, c) => s + leafCount(c), 0)
  const maxW1 = Math.max(...root.children.map(c => getSize(c.id, 1, sizeById).w))
  const rootW = getSize(root.id, 0, sizeById).w
  // R1 đủ để chu vi chứa n children theo width thực
  const perim = n1 * (maxW1 + 28)
  const R1 = Math.max(220, rootW / 2 + maxW1 / 2 + 60, perim / (2 * Math.PI))

  let cumLeaf = 0
  root.children.forEach((child, i) => {
    const leaves = leafCount(child)
    const midFrac = (cumLeaf + leaves / 2) / total1
    const angle1 = midFrac * 2 * Math.PI - Math.PI / 2
    cumLeaf += leaves
    const x1 = CX + Math.cos(angle1) * R1
    const y1 = CY + Math.sin(angle1) * R1
    const color = BRANCH_COLORS[i % BRANCH_COLORS.length]
    pushNode(result, child, x1, y1, 1, color, root.id, sizeById)

    const slotRad = (leaves / total1) * 2 * Math.PI
    const nextSpread = Math.min(Math.PI * 0.9, Math.max(slotRad * 0.85, Math.PI * 0.18))
    placeRoundSubtree(child, x1, y1, angle1, nextSpread, 2, color, child.id, result, sizeById)
  })

  return result
}

function placeRoundSubtree(
  parent: MindNode,
  px: number,
  py: number,
  parentAngle: number,
  spreadRad: number,
  depth: number,
  color: string,
  parentId: string,
  result: NodeLayout[],
  sizeById?: SizeMap,
) {
  if (parent.collapsed || parent.children.length === 0) return
  const children = parent.children
  const total = children.reduce((s, c) => s + leafCount(c), 0)
  const maxW = Math.max(...children.map(c => getSize(c.id, depth, sizeById).w))
  const parentW = getSize(parent.id, depth - 1, sizeById).w

  // R giảm dần theo depth nhưng phải đủ để tránh chồng cha
  const depthFactor = Math.pow(0.78, depth - 1)
  const baseR = 190 * depthFactor
  const arcNeed = spreadRad > 0 ? (children.length * (maxW + 20)) / spreadRad : baseR
  const minR = parentW / 2 + maxW / 2 + 40
  const R = Math.max(baseR, minR, Math.min(arcNeed, 280))

  let cum = 0
  children.forEach(child => {
    const leaves = leafCount(child)
    const midFrac = total > 0 ? (cum + leaves / 2) / total : 0.5
    const offset = (midFrac - 0.5) * spreadRad
    const angle = parentAngle + offset
    cum += leaves
    const x = px + Math.cos(angle) * R
    const y = py + Math.sin(angle) * R
    pushNode(result, child, x, y, depth, color, parentId, sizeById)
    const childSlot = (leaves / total) * spreadRad
    const nextSpread = Math.min(Math.PI * 0.75, Math.max(childSlot * 0.85, Math.PI * 0.14))
    placeRoundSubtree(child, x, y, angle, nextSpread, depth + 1, color, child.id, result, sizeById)
  })
}

// ── Tree ngang (leafCount weighting + width-aware X_GAP) ─────────────────────

const TREE_X0 = 130
const TREE_MARGIN_X = 80
const TREE_ROW_H = 58

export function treeLayout(root: MindNode, sizeById?: SizeMap): NodeLayout[] {
  const result: NodeLayout[] = []

  // Tính X mỗi depth: dựa trên max width của tất cả nodes ở depth đó
  const maxWByDepth = new Map<number, number>()
  ;(function scan(n: MindNode, d: number) {
    const w = getSize(n.id, d, sizeById).w
    maxWByDepth.set(d, Math.max(maxWByDepth.get(d) ?? 0, w))
    if (n.collapsed) return
    n.children.forEach(c => scan(c, d + 1))
  })(root, 0)

  const xByDepth = new Map<number, number>()
  let cursor = TREE_X0
  for (const d of Array.from(maxWByDepth.keys()).sort((a, b) => a - b)) {
    const wPrev = d > 0 ? (maxWByDepth.get(d - 1) ?? NODE_DIMS[Math.min(d - 1, 3)].w) : 0
    if (d > 0) cursor += wPrev / 2 + TREE_MARGIN_X + (maxWByDepth.get(d) ?? 0) / 2
    xByDepth.set(d, cursor)
  }

  function walk(
    node: MindNode,
    depth: number,
    yTop: number,
    yBottom: number,
    parentId: string | null,
    color: string,
  ) {
    const y = (yTop + yBottom) / 2
    const x = xByDepth.get(depth) ?? TREE_X0
    pushNode(result, node, x, y, depth, color, parentId, sizeById)

    if (node.collapsed || node.children.length === 0) return

    const total = node.children.reduce((s, c) => s + leafCount(c), 0)
    const slice = (yBottom - yTop) / total
    let cur = yTop
    node.children.forEach((child, i) => {
      const h = slice * leafCount(child)
      const childColor = depth === 0 ? BRANCH_COLORS[i % BRANCH_COLORS.length] : color
      walk(child, depth + 1, cur, cur + h, node.id, childColor)
      cur += h
    })
  }

  const leaves = leafCount(root)
  const height = leaves * TREE_ROW_H
  const yStart = Math.max(48, CY - height / 2)
  walk(root, 0, yStart, yStart + height, null, 'var(--color-primary)')
  return result
}

// ── Tree ↓ (leafCount weighting + height-aware Y_GAP) ────────────────────────

const TREE_Y0 = 88
const TREE_MARGIN_Y = 60
const TREE_COL_W = 160

export function treeDownLayout(root: MindNode, sizeById?: SizeMap): NodeLayout[] {
  const result: NodeLayout[] = []

  const maxHByDepth = new Map<number, number>()
  ;(function scan(n: MindNode, d: number) {
    const h = getSize(n.id, d, sizeById).h
    maxHByDepth.set(d, Math.max(maxHByDepth.get(d) ?? 0, h))
    if (n.collapsed) return
    n.children.forEach(c => scan(c, d + 1))
  })(root, 0)

  const yByDepth = new Map<number, number>()
  let cursor = TREE_Y0
  for (const d of Array.from(maxHByDepth.keys()).sort((a, b) => a - b)) {
    const hPrev = d > 0 ? (maxHByDepth.get(d - 1) ?? NODE_DIMS[Math.min(d - 1, 3)].h) : 0
    if (d > 0) cursor += hPrev / 2 + TREE_MARGIN_Y + (maxHByDepth.get(d) ?? 0) / 2
    yByDepth.set(d, cursor)
  }

  function walk(
    node: MindNode,
    depth: number,
    xLeft: number,
    xRight: number,
    parentId: string | null,
    color: string,
  ) {
    const x = (xLeft + xRight) / 2
    const y = yByDepth.get(depth) ?? TREE_Y0
    pushNode(result, node, x, y, depth, color, parentId, sizeById)

    if (node.collapsed || node.children.length === 0) return

    const total = node.children.reduce((s, c) => s + leafCount(c), 0)
    const slice = (xRight - xLeft) / total
    let cur = xLeft
    node.children.forEach((child, i) => {
      const w = slice * leafCount(child)
      const childColor = depth === 0 ? BRANCH_COLORS[i % BRANCH_COLORS.length] : color
      walk(child, depth + 1, cur, cur + w, node.id, childColor)
      cur += w
    })
  }

  const leaves = leafCount(root)
  const width = leaves * TREE_COL_W
  const xStart = Math.max(80, CX - width / 2)
  walk(root, 0, xStart, xStart + width, null, 'var(--color-primary)')
  return result
}

// ── Fishbone (band stacking + subtreeVSpan + size-aware) ─────────────────────

const FISH_H_GAP = 44
const FISH_V_GAP = 20

export function fishboneLayout(root: MindNode, sizeById?: SizeMap): NodeLayout[] {
  const result: NodeLayout[] = []
  pushNode(result, root, CX, CY, 0, 'var(--color-primary)', null, sizeById)
  if (root.collapsed || root.children.length === 0) return result

  const rootW = getSize(root.id, 0, sizeById).w
  const leftIdx: number[] = []
  const rightIdx: number[] = []
  root.children.forEach((_, i) => (i % 2 === 0 ? leftIdx : rightIdx).push(i))

  const placeSide = (indices: number[], side: -1 | 1) => {
    if (indices.length === 0) return
    const bandHeights = indices.map(i => subtreeVSpan(root.children[i], 1, sizeById, FISH_V_GAP))
    const totalH = bandHeights.reduce((s, h) => s + h, 0) + (indices.length - 1) * FISH_V_GAP
    let cursor = CY - totalH / 2
    indices.forEach((i, k) => {
      const child = root.children[i]
      const bandH = bandHeights[k]
      const yc = cursor + bandH / 2
      const childW = getSize(child.id, 1, sizeById).w
      const x = CX + side * (rootW / 2 + FISH_H_GAP + childW / 2)
      const color = BRANCH_COLORS[i % BRANCH_COLORS.length]
      pushNode(result, child, x, yc, 1, color, root.id, sizeById)
      placeFishSubtree(child, x, yc, side, 2, color, child.id, result, sizeById)
      cursor += bandH + FISH_V_GAP
    })
  }
  placeSide(leftIdx, -1)
  placeSide(rightIdx, 1)
  return result
}

function placeFishSubtree(
  parent: MindNode,
  px: number,
  py: number,
  side: -1 | 1,
  depth: number,
  color: string,
  parentId: string,
  result: NodeLayout[],
  sizeById?: SizeMap,
) {
  if (parent.collapsed || parent.children.length === 0) return
  const children = parent.children
  const bandHeights = children.map(c => subtreeVSpan(c, depth, sizeById, FISH_V_GAP))
  const totalH = bandHeights.reduce((s, h) => s + h, 0) + (children.length - 1) * FISH_V_GAP
  const parentW = getSize(parent.id, depth - 1, sizeById).w
  let cursor = py - totalH / 2
  children.forEach((child, i) => {
    const bandH = bandHeights[i]
    const yc = cursor + bandH / 2
    const childW = getSize(child.id, depth, sizeById).w
    const x = px + side * (parentW / 2 + FISH_H_GAP + childW / 2)
    pushNode(result, child, x, yc, depth, color, parentId, sizeById)
    placeFishSubtree(child, x, yc, side, depth + 1, color, child.id, result, sizeById)
    cursor += bandH + FISH_V_GAP
  })
}

// ── Post-pass: resolve overlapping bboxes ────────────────────────────────────

function resolveOverlaps(layouts: NodeLayout[], sizeById?: SizeMap, padding = 8, maxIter = 10) {
  if (layouts.length < 2) return layouts
  for (let iter = 0; iter < maxIter; iter++) {
    let moved = false
    for (let i = 0; i < layouts.length; i++) {
      for (let j = i + 1; j < layouts.length; j++) {
        const a = layouts[i]
        const b = layouts[j]
        const sa = getSize(a.id, a.depth, sizeById)
        const sb = getSize(b.id, b.depth, sizeById)
        const dx = b.x - a.x
        const dy = b.y - a.y
        const minDx = (sa.w + sb.w) / 2 + padding
        const minDy = (sa.h + sb.h) / 2 + padding
        const overlapX = minDx - Math.abs(dx)
        const overlapY = minDy - Math.abs(dy)
        if (overlapX > 0 && overlapY > 0) {
          moved = true
          if (overlapY < overlapX) {
            const push = overlapY / 2 + 0.5
            const sign = dy === 0 ? (i % 2 === 0 ? 1 : -1) : dy > 0 ? 1 : -1
            // Root (depth 0) là neo — không dịch
            if (a.depth !== 0) a.y -= sign * push
            if (b.depth !== 0) b.y += sign * push
          } else {
            const push = overlapX / 2 + 0.5
            const sign = dx === 0 ? (i % 2 === 0 ? 1 : -1) : dx > 0 ? 1 : -1
            if (a.depth !== 0) a.x -= sign * push
            if (b.depth !== 0) b.x += sign * push
          }
        }
      }
    }
    if (!moved) break
  }
  return layouts
}

// ── Entry ────────────────────────────────────────────────────────────────────

export function computeLayout(
  root: MindNode,
  layout: MindmapLayout,
  sizeById?: SizeMap,
): NodeLayout[] {
  let layouts: NodeLayout[]
  switch (layout) {
    case 'tree':      layouts = treeLayout(root, sizeById); break
    case 'tree-down': layouts = treeDownLayout(root, sizeById); break
    case 'fishbone':  layouts = fishboneLayout(root, sizeById); break
    case 'round':
    default:          layouts = roundLayout(root, sizeById); break
  }
  return resolveOverlaps(layouts, sizeById)
}

export function clearNodeOffsets(node: MindNode): MindNode {
  const { offsetX: _ox, offsetY: _oy, ...rest } = node
  return {
    ...rest,
    children: node.children.map(clearNodeOffsets),
  }
}
