import type { MindNode } from './types'
import { computeLayout, applyNodeOffsets, flattenNodes, type MindmapLayout } from './types'
import { computeContentBounds, shiftLayouts, connectorPath, nodeDims } from './connectors'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function nodeColors(depth: number): { fill: string; stroke: string; text: string } {
  if (depth === 0) return { fill: '#6366f1', stroke: '#4f46e5', text: '#ffffff' }
  if (depth === 1) return { fill: '#eef2ff', stroke: '#a5b4fc', text: '#312e81' }
  return { fill: '#f8fafc', stroke: '#cbd5e1', text: '#0f172a' }
}

/** Xuất SVG vector từ cây mindmap (không phụ thuộc DOM canvas). */
export function mindmapToSvg(
  root: MindNode,
  layoutMode: MindmapLayout = 'round',
  opts?: { bg?: string; title?: string },
): { svg: string; width: number; height: number } {
  const base = computeLayout(root, layoutMode)
  const layouts = applyNodeOffsets(base, root)
  const bounds = computeContentBounds(layouts)
  const display = shiftLayouts(layouts, bounds)
  const pad = 32
  const width = Math.ceil(bounds.width + pad * 2)
  const height = Math.ceil(bounds.height + pad * 2)
  const bg = opts?.bg ?? '#ffffff'
  const byId = new Map(display.map(l => [l.id, l]))
  const textById = new Map(flattenNodes(root).map(n => [n.id, n.text]))

  const lines: string[] = []
  for (const l of display) {
    if (!l.parentId) continue
    const p = byId.get(l.parentId)
    if (!p) continue
    const d = connectorPath(p, l, layoutMode)
    lines.push(
      `<path d="${escapeXml(d)}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>`,
    )
  }

  const nodes: string[] = []
  for (const l of display) {
    const { w, h } = nodeDims(l.depth)
    const c = nodeColors(l.depth)
    const label = textById.get(l.id) ?? ''
    const x = l.x - w / 2 + pad
    const y = l.y - h / 2 + pad
    const r = l.depth === 0 ? 16 : 12
    nodes.push(
      `<g>`,
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>`,
      `<text x="${l.x + pad}" y="${l.y + pad}" text-anchor="middle" dominant-baseline="central" font-family="system-ui,Segoe UI,sans-serif" font-size="${l.depth === 0 ? 15 : l.depth === 1 ? 13 : 12}" font-weight="${l.depth === 0 ? 700 : 600}" fill="${c.text}">${escapeXml(label)}</text>`,
      `</g>`,
    )
  }

  const titleBlock = opts?.title
    ? `<text x="${pad}" y="20" font-family="system-ui,sans-serif" font-size="12" fill="#64748b">${escapeXml(opts.title)}</text>`
    : ''

  const svg = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="100%" height="100%" fill="${bg}"/>`,
    titleBlock,
    `<g transform="translate(0,0)">`,
    ...lines,
    ...nodes,
    `</g>`,
    `</svg>`,
  ].join('')

  return { svg, width, height }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function downloadMindmapSvg(root: MindNode, layout: MindmapLayout, name: string) {
  const { svg } = mindmapToSvg(root, layout, { title: name })
  downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), `${slug(name)}.svg`)
}

export async function downloadMindmapPng(root: MindNode, layout: MindmapLayout, name: string): Promise<void> {
  const { svg, width, height } = mindmapToSvg(root, layout, { title: name })
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  try {
    const img = await loadImage(url)
    const scale = 2
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas không khả dụng')
    ctx.scale(scale, scale)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0)
    await new Promise<void>((resolve, reject) => {
      canvas.toBlob(b => {
        if (!b) {
          reject(new Error('Không xuất được PNG'))
          return
        }
        downloadBlob(b, `${slug(name)}.png`)
        resolve()
      }, 'image/png')
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Mở cửa sổ in → user chọn “Save as PDF”. */
export function printMindmapPdf(root: MindNode, layout: MindmapLayout, name: string) {
  const { svg, width, height } = mindmapToSvg(root, layout, { title: name })
  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) {
    // fallback: tải SVG
    downloadMindmapSvg(root, layout, name)
    return
  }
  w.document.write(`<!DOCTYPE html><html><head><title>${escapeXml(name)}</title>
<style>
  @page { margin: 12mm; size: auto; }
  body { margin: 0; display: flex; justify-content: center; align-items: flex-start; background: #fff; }
  img, svg { max-width: 100%; height: auto; }
</style></head><body>${svg}
<script>
  window.onload = function() {
    setTimeout(function(){ window.print(); }, 200);
  };
<\/script></body></html>`)
  w.document.close()
  void width
  void height
}

function slug(name: string): string {
  return (name || 'mindmap')
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'mindmap'
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Không tải được SVG'))
    img.src = url
  })
}
