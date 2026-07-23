export interface MindNode {
  id: string
  text: string
  children: MindNode[]
  collapsed?: boolean
  /** Vị trí kéo thủ công (px, cộng vào vị trí layout) */
  offsetX?: number
  offsetY?: number
}

export function createNode(text: string): MindNode {
  return { id: crypto.randomUUID(), text, children: [], collapsed: false }
}

export function flattenNodes(node: MindNode): MindNode[] {
  return [node, ...node.children.flatMap(flattenNodes)]
}

export function findNode(root: MindNode, id: string): MindNode | null {
  if (root.id === id) return root
  for (const c of root.children) {
    const found = findNode(c, id)
    if (found) return found
  }
  return null
}

export function updateNode(
  root: MindNode,
  id: string,
  fn: (n: MindNode) => MindNode,
): MindNode {
  if (root.id === id) return fn(root)
  return { ...root, children: root.children.map(c => updateNode(c, id, fn)) }
}

export function appendChildren(
  root: MindNode,
  parentId: string,
  newChildren: MindNode[],
): MindNode {
  return updateNode(root, parentId, n => ({
    ...n,
    collapsed: false,
    children: [...n.children, ...newChildren],
  }))
}

export function removeNode(root: MindNode, id: string): MindNode {
  return {
    ...root,
    children: root.children
      .filter(c => c.id !== id)
      .map(c => removeNode(c, id)),
  }
}

// ── Layout ──────────────────────────────────────────────────────────────────

export const CANVAS_W = 1400
export const CANVAS_H = 900
export const CX = CANVAS_W / 2
export const CY = CANVAS_H / 2

import type { NodeLayout } from './layouts'

export type { MindmapLayout, NodeLayout } from './layouts'
export { computeLayout, clearNodeOffsets, LAYOUT_OPTIONS, roundLayout as radialLayout } from './layouts'

export function applyNodeOffsets(
  layouts: NodeLayout[],
  root: MindNode,
  liveOffsets?: Record<string, { x: number; y: number }>,
): NodeLayout[] {
  const byId = new Map(flattenNodes(root).map(n => [n.id, n]))
  return layouts.map(l => {
    const n = byId.get(l.id)
    const ox = liveOffsets?.[l.id]?.x ?? n?.offsetX ?? 0
    const oy = liveOffsets?.[l.id]?.y ?? n?.offsetY ?? 0
    return { ...l, x: l.x + ox, y: l.y + oy }
  })
}
