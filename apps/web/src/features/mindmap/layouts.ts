import type { MindNode } from './types'
import { CX, CY } from './types'

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
}

const BRANCH_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#f97316',
]

function leafCount(node: MindNode): number {
  if (node.collapsed || node.children.length === 0) return 1
  return node.children.reduce((s, c) => s + leafCount(c), 0)
}

function pushNode(
  result: NodeLayout[],
  node: MindNode,
  x: number,
  y: number,
  depth: number,
  color: string,
  parentId: string | null,
) {
  result.push({ id: node.id, x, y, depth, color, parentId })
}

/** Radial — layout hiện tại */
export function roundLayout(root: MindNode): NodeLayout[] {
  const result: NodeLayout[] = []
  pushNode(result, root, CX, CY, 0, 'var(--color-primary)', null)
  if (root.collapsed || root.children.length === 0) return result

  const n1 = root.children.length
  const R1 = Math.max(180, n1 * 38)

  root.children.forEach((child, i) => {
    const angle1 = (i / n1) * 2 * Math.PI - Math.PI / 2
    const x1 = CX + Math.cos(angle1) * R1
    const y1 = CY + Math.sin(angle1) * R1
    const color = BRANCH_COLORS[i % BRANCH_COLORS.length]
    pushNode(result, child, x1, y1, 1, color, root.id)

    if (child.collapsed || child.children.length === 0) return

    const n2 = child.children.length
    const spreadRad = Math.min(Math.PI * 0.75, (2 * Math.PI / n1) * 0.7)
    const R2 = 145

    child.children.forEach((gc, j) => {
      const offset = n2 > 1 ? (j / (n2 - 1) - 0.5) * spreadRad : 0
      const angle2 = angle1 + offset
      const x2 = x1 + Math.cos(angle2) * R2
      const y2 = y1 + Math.sin(angle2) * R2
      pushNode(result, gc, x2, y2, 2, color, child.id)

      if (gc.collapsed || gc.children.length === 0) return

      const n3 = gc.children.length
      const spreadRad3 = Math.min(Math.PI * 0.5, spreadRad * 0.5)
      const R3 = 110

      gc.children.forEach((ggc, k) => {
        const offset3 = n3 > 1 ? (k / (n3 - 1) - 0.5) * spreadRad3 : 0
        const angle3 = angle2 + offset3
        const x3 = x2 + Math.cos(angle3) * R3
        const y3 = y2 + Math.sin(angle3) * R3
        pushNode(result, ggc, x3, y3, 3, color, gc.id)
      })
    })
  })

  return result
}

const X_GAP = 200
const Y_GAP = 52
const TREE_X0 = 130

/** Tree ngang — root bên trái */
export function treeLayout(root: MindNode): NodeLayout[] {
  const result: NodeLayout[] = []

  function walk(
    node: MindNode,
    depth: number,
    yTop: number,
    yBottom: number,
    parentId: string | null,
    color: string,
  ) {
    const y = (yTop + yBottom) / 2
    const x = TREE_X0 + depth * X_GAP
    pushNode(result, node, x, y, depth, color, parentId)

    if (node.collapsed || node.children.length === 0) return

    const total = node.children.reduce((s, c) => s + leafCount(c), 0)
    const slice = (yBottom - yTop) / total
    let cursor = yTop

    node.children.forEach((child, i) => {
      const h = slice * leafCount(child)
      const childColor = depth === 0 ? BRANCH_COLORS[i % BRANCH_COLORS.length] : color
      walk(child, depth + 1, cursor, cursor + h, node.id, childColor)
      cursor += h
    })
  }

  const leaves = leafCount(root)
  const height = leaves * Y_GAP
  const yStart = Math.max(48, CY - height / 2)
  walk(root, 0, yStart, yStart + height, null, 'var(--color-primary)')
  return result
}

const Y_GAP_V = 108
const X_GAP_V = 150
const TREE_Y0 = 88

/** Tree dọc — root trên cùng */
export function treeDownLayout(root: MindNode): NodeLayout[] {
  const result: NodeLayout[] = []

  function walk(
    node: MindNode,
    depth: number,
    xLeft: number,
    xRight: number,
    parentId: string | null,
    color: string,
  ) {
    const x = (xLeft + xRight) / 2
    const y = TREE_Y0 + depth * Y_GAP_V
    pushNode(result, node, x, y, depth, color, parentId)

    if (node.collapsed || node.children.length === 0) return

    const total = node.children.reduce((s, c) => s + leafCount(c), 0)
    const slice = (xRight - xLeft) / total
    let cursor = xLeft

    node.children.forEach((child, i) => {
      const w = slice * leafCount(child)
      const childColor = depth === 0 ? BRANCH_COLORS[i % BRANCH_COLORS.length] : color
      walk(child, depth + 1, cursor, cursor + w, node.id, childColor)
      cursor += w
    })
  }

  const leaves = leafCount(root)
  const width = leaves * X_GAP_V
  const xStart = Math.max(80, CX - width / 2)
  walk(root, 0, xStart, xStart + width, null, 'var(--color-primary)')
  return result
}

const FISH_GAP_X = 175
const FISH_GAP_Y = 72
const FISH_DEPTH_X = 155

/** Fishbone — nhánh L/R xen kẽ từ tâm */
export function fishboneLayout(root: MindNode): NodeLayout[] {
  const result: NodeLayout[] = []
  pushNode(result, root, CX, CY, 0, 'var(--color-primary)', null)
  if (root.collapsed || root.children.length === 0) return result

  function branch(
    node: MindNode,
    depth: number,
    side: -1 | 1,
    x: number,
    y: number,
    parentId: string,
    color: string,
  ) {
    pushNode(result, node, x, y, depth, color, parentId)
    if (node.collapsed || node.children.length === 0) return

    const n = node.children.length
    node.children.forEach((child, i) => {
      const offsetY = n > 1 ? (i - (n - 1) / 2) * 48 : 0
      branch(
        child,
        depth + 1,
        side,
        x + side * FISH_DEPTH_X,
        y + offsetY,
        node.id,
        color,
      )
    })
  }

  const n1 = root.children.length
  const bands = Math.ceil(n1 / 2)

  root.children.forEach((child, i) => {
    const side: -1 | 1 = i % 2 === 0 ? -1 : 1
    const band = Math.floor(i / 2)
    const y = CY + (band - (bands - 1) / 2) * FISH_GAP_Y
    const x = CX + side * FISH_GAP_X
    const color = BRANCH_COLORS[i % BRANCH_COLORS.length]
    branch(child, 1, side, x, y, root.id, color)
  })

  return result
}

export function computeLayout(root: MindNode, layout: MindmapLayout): NodeLayout[] {
  switch (layout) {
    case 'tree': return treeLayout(root)
    case 'tree-down': return treeDownLayout(root)
    case 'fishbone': return fishboneLayout(root)
    case 'round':
    default: return roundLayout(root)
  }
}

export function clearNodeOffsets(node: MindNode): MindNode {
  const { offsetX: _ox, offsetY: _oy, ...rest } = node
  return {
    ...rest,
    children: node.children.map(clearNodeOffsets),
  }
}