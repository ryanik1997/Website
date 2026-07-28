import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { LucideIcon } from 'lucide-react'

export type OrbitFeature = {
  icon: LucideIcon
  title: string
  desc: string
  accent: string
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** 0..1 → pose: closed showcase → elegant half-open (never flat blank) */
function mapPose(p: number) {
  const t = Math.max(0, Math.min(1, p))
  // open amount capped ~0.62 so book keeps volume & cover readable
  const open = easeInOutCubic(Math.min(1, t / 0.72)) * 0.62
  const cardsIn = easeOutCubic(Math.max(0, (t - 0.25) / 0.55))
  const spin = easeOutCubic(Math.max(0, (t - 0.45) / 0.55))
  return { open, cardsIn, spin }
}

/* ── Canvas textures ────────────────────────────────────── */

function createCoverTexture(): THREE.CanvasTexture {
  const w = 1024
  const h = 1400
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!

  const base = ctx.createLinearGradient(0, 0, w, h)
  base.addColorStop(0, '#5c2a14')
  base.addColorStop(0.4, '#3d1a0c')
  base.addColorStop(1, '#241008')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 12000; i++) {
    const a = Math.random() * 0.08
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(0,0,0,${a})` : `rgba(200,140,60,${a * 0.5})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
  }

  // Gold double frame
  const inset = 56
  ctx.strokeStyle = '#d4af37'
  ctx.lineWidth = 14
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2)
  ctx.lineWidth = 3
  ctx.strokeStyle = 'rgba(240,210,120,0.65)'
  ctx.strokeRect(inset + 22, inset + 22, w - (inset + 22) * 2, h - (inset + 22) * 2)

  // Corner filigree
  const corner = (x: number, y: number, sx: number, sy: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(sx, sy)
    ctx.strokeStyle = '#e8c96a'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(0, 70)
    ctx.quadraticCurveTo(0, 0, 70, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(28, 28, 14, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  corner(inset + 36, inset + 36, 1, 1)
  corner(w - inset - 36, inset + 36, -1, 1)
  corner(inset + 36, h - inset - 36, 1, -1)
  corner(w - inset - 36, h - inset - 36, -1, -1)

  // Crest
  const cx = w / 2
  const cy = h * 0.36
  const rg = ctx.createRadialGradient(cx - 24, cy - 24, 8, cx, cy, 130)
  rg.addColorStop(0, '#f5e6a3')
  rg.addColorStop(0.45, '#d4af37')
  rg.addColorStop(1, '#6b4e12')
  ctx.fillStyle = rg
  ctx.beginPath()
  ctx.arc(cx, cy, 128, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = 8
  ctx.strokeStyle = '#4a3408'
  ctx.stroke()
  ctx.fillStyle = '#2a1808'
  ctx.font = '800 100px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('R', cx, cy + 6)

  ctx.fillStyle = '#f0d878'
  ctx.font = '700 58px Georgia, serif'
  ctx.fillText('RYAN ENGLISH', cx, h * 0.58)
  ctx.font = '600 30px Inter, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(240,216,120,0.85)'
  ctx.fillText('LEXICON ARCANE', cx, h * 0.64)

  ctx.strokeStyle = 'rgba(212,175,55,0.55)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(w * 0.3, h * 0.69)
  ctx.lineTo(w * 0.7, h * 0.69)
  ctx.stroke()

  ctx.font = '500 24px Inter, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(232,201,106,0.6)'
  ctx.fillText('Vocabulary  ·  Exam  ·  AI', cx, h * 0.75)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function createSpineTexture(): THREE.CanvasTexture {
  const w = 280
  const h = 1400
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, w, 0)
  g.addColorStop(0, '#1a0a04')
  g.addColorStop(0.4, '#4a2210')
  g.addColorStop(0.7, '#5c2a14')
  g.addColorStop(1, '#2a1208')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  for (const y of [160, 320, 1000, 1160]) {
    const bg = ctx.createLinearGradient(0, y, 0, y + 28)
    bg.addColorStop(0, '#8a6a20')
    bg.addColorStop(0.4, '#e8c96a')
    bg.addColorStop(1, '#6b4e12')
    ctx.fillStyle = bg
    ctx.fillRect(18, y, w - 36, 26)
  }

  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = '#f0d878'
  ctx.font = '700 46px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('RYAN ENGLISH', 0, 0)
  ctx.restore()

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function createPageTexture(
  kind: 'left' | 'right',
): THREE.CanvasTexture {
  const w = 900
  const h = 1200
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!

  const g = ctx.createLinearGradient(0, 0, w, 0)
  if (kind === 'left') {
    g.addColorStop(0, '#e8dcc4')
    g.addColorStop(0.12, '#faf6ec')
    g.addColorStop(1, '#f5eedc')
  } else {
    g.addColorStop(0, '#f5eedc')
    g.addColorStop(0.88, '#faf6ec')
    g.addColorStop(1, '#e0d4bc')
  }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = `rgba(90,60,20,${Math.random() * 0.04})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5)
  }

  // Ruled lines
  ctx.strokeStyle = 'rgba(120,90,50,0.1)'
  ctx.lineWidth = 1
  for (let y = 200; y < h - 80; y += 40) {
    ctx.beginPath()
    ctx.moveTo(70, y)
    ctx.lineTo(w - 60, y)
    ctx.stroke()
  }

  // Red margin
  ctx.strokeStyle = 'rgba(170,50,40,0.2)'
  ctx.beginPath()
  ctx.moveTo(88, 120)
  ctx.lineTo(88, h - 70)
  ctx.stroke()

  ctx.textAlign = 'left'

  if (kind === 'left') {
    ctx.fillStyle = '#6b3a18'
    ctx.font = '800 42px Georgia, serif'
    ctx.fillText('A  ·  Arcane', 110, 120)

    ctx.fillStyle = '#2c2418'
    const entries: [string, string][] = [
      ['acquire', '/əˈkwaɪər/  ·  v.'],
      ['to gain knowledge or skill', ''],
      ['', ''],
      ['assess', '/əˈses/  ·  v.'],
      ['to evaluate carefully', ''],
      ['', ''],
      ['aptitude', '/ˈæptɪtjuːd/  ·  n.'],
      ['natural ability or talent', ''],
      ['', ''],
      ['articulate', '/ɑːˈtɪkjuleɪt/  ·  v.'],
      ['express clearly in words', ''],
    ]
    let y = 210
    for (const [a, b] of entries) {
      if (!a && !b) {
        y += 18
        continue
      }
      if (b.includes('/')) {
        ctx.font = '700 32px Georgia, serif'
        ctx.fillStyle = '#1a1410'
        ctx.fillText(a, 110, y)
        ctx.font = '400 22px Inter, sans-serif'
        ctx.fillStyle = '#7a6550'
        ctx.fillText(b, 110 + ctx.measureText(a).width + 16, y)
      } else {
        ctx.font = '400 26px Georgia, serif'
        ctx.fillStyle = '#4a4034'
        ctx.fillText(a || b, 110, y)
      }
      y += 44
    }
  } else {
    ctx.fillStyle = '#6b3a18'
    ctx.font = '800 42px Georgia, serif'
    ctx.fillText('Today', 110, 120)

    ctx.fillStyle = '#2c2418'
    ctx.font = '600 28px Inter, sans-serif'
    const rows = [
      { label: 'SRS due', val: '12 words', color: '#F5850A' },
      { label: 'Writing', val: 'Task 2 draft', color: '#6366f1' },
      { label: 'Listening', val: 'Dictation #4', color: '#8b5cf6' },
      { label: 'Mock exam', val: 'Reading Cam 18', color: '#ef4444' },
    ]
    let y = 220
    for (const row of rows) {
      // chip
      ctx.fillStyle = row.color + '22'
      roundRect(ctx, 110, y - 28, w - 220, 72, 16)
      ctx.fill()
      ctx.strokeStyle = row.color + '55'
      ctx.lineWidth = 2
      roundRect(ctx, 110, y - 28, w - 220, 72, 16)
      ctx.stroke()

      ctx.fillStyle = row.color
      ctx.beginPath()
      ctx.arc(148, y + 8, 10, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#1a1410'
      ctx.font = '700 28px Inter, sans-serif'
      ctx.fillText(row.label, 180, y)
      ctx.fillStyle = '#5a5048'
      ctx.font = '500 24px Inter, sans-serif'
      ctx.fillText(row.val, 180, y + 28)
      y += 100
    }

    ctx.fillStyle = 'rgba(90,60,30,0.45)'
    ctx.font = '500 22px Inter, sans-serif'
    ctx.fillText('Study with Genius · offline-first', 110, h - 60)
  }

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function createCardTexture(title: string, desc: string, accent: string): THREE.CanvasTexture {
  const w = 720
  const h = 400
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!

  // Clear for transparent corners
  ctx.clearRect(0, 0, w, h)

  // Soft drop
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  roundRect(ctx, 12, 16, w - 24, h - 24, 36)
  ctx.fill()

  roundRect(ctx, 0, 0, w - 16, h - 20, 36)
  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, 'rgba(24,24,32,0.96)')
  bg.addColorStop(1, 'rgba(12,12,18,0.98)')
  ctx.fillStyle = bg
  ctx.fill()

  ctx.strokeStyle = accent
  ctx.globalAlpha = 0.7
  ctx.lineWidth = 4
  roundRect(ctx, 2, 2, w - 20, h - 24, 34)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Accent top
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, w - 16, 7)

  ctx.fillStyle = accent + '35'
  roundRect(ctx, 36, 40, 56, 56, 14)
  ctx.fill()

  ctx.fillStyle = '#fafafa'
  ctx.font = '700 36px Inter, system-ui, sans-serif'
  ctx.fillText(title.slice(0, 22), 112, 78)

  ctx.fillStyle = 'rgba(200,200,214,0.92)'
  ctx.font = '400 24px Inter, system-ui, sans-serif'
  wrapText(ctx, desc, 40, 150, w - 90, 32, 5)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  maxLines: number,
) {
  const words = text.split(' ')
  let line = ''
  let lines = 0
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, y)
      line = word
      y += lineH
      lines++
      if (lines >= maxLines) return
    } else line = test
  }
  if (line && lines < maxLines) ctx.fillText(line, x, y)
}

/* ── Book geometry ──────────────────────────────────────── */

function buildBook(): {
  root: THREE.Group
  coverPivot: THREE.Group
  leftPage: THREE.Mesh
  rightPage: THREE.Mesh
  pageBlock: THREE.Mesh
  dispose: () => void
} {
  const root = new THREE.Group()
  const textures: THREE.Texture[] = []

  const BW = 2.2
  const BH = 2.95
  const THICK = 0.78
  const CT = 0.08
  const half = THICK / 2

  const coverMap = createCoverTexture()
  const spineMap = createSpineTexture()
  const leftTex = createPageTexture('left')
  const rightTex = createPageTexture('right')
  textures.push(coverMap, spineMap, leftTex, rightTex)

  const leather = new THREE.MeshStandardMaterial({
    color: 0x4a2210,
    roughness: 0.74,
    metalness: 0.1,
  })
  const gold = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.28,
    metalness: 0.9,
    emissive: 0x3d2a08,
    emissiveIntensity: 0.28,
  })

  // Page block (thickness of tome)
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.95 })
  const pageFace = new THREE.MeshStandardMaterial({ color: 0xf4ead6, roughness: 0.92 })
  const pageBlock = new THREE.Mesh(
    new THREE.BoxGeometry(BW * 0.94, BH * 0.96, THICK - CT * 2),
    [edgeMat, edgeMat, pageFace, pageFace, pageFace, pageFace],
  )
  pageBlock.position.set(0.04, 0, 0)
  pageBlock.castShadow = true
  pageBlock.receiveShadow = true
  root.add(pageBlock)

  // Spine
  const spine = new THREE.Mesh(
    new THREE.BoxGeometry(CT * 1.5, BH + 0.06, THICK + 0.02),
    new THREE.MeshStandardMaterial({ map: spineMap, roughness: 0.7, metalness: 0.12 }),
  )
  spine.position.set(-BW / 2 + CT * 0.4, 0, 0)
  spine.castShadow = true
  root.add(spine)

  for (const y of [-0.95, -0.4, 0.4, 0.95]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(CT * 1.65, 0.08, THICK + 0.05), gold)
    band.position.set(-BW / 2 + CT * 0.4, y, 0)
    root.add(band)
  }

  // Back cover
  const back = new THREE.Mesh(new THREE.BoxGeometry(BW, BH + 0.05, CT), leather)
  back.position.set(0, 0, -half + CT / 2)
  back.castShadow = true
  root.add(back)

  // Front cover pivot
  const coverPivot = new THREE.Group()
  coverPivot.position.set(-BW / 2 + CT * 0.45, 0, half - CT / 2)

  const coverMats = [
    leather,
    leather,
    leather,
    leather,
    new THREE.MeshStandardMaterial({
      map: coverMap,
      roughness: 0.55,
      metalness: 0.15,
      emissive: new THREE.Color('#1a1006'),
      emissiveIntensity: 0.12,
    }),
    leather,
  ]
  const cover = new THREE.Mesh(new THREE.BoxGeometry(BW, BH + 0.05, CT), coverMats)
  cover.position.set(BW / 2, 0, 0)
  cover.castShadow = true
  cover.receiveShadow = true
  coverPivot.add(cover)

  // Gold clasps
  for (const [lx, ly] of [
    [0.22, 1.25],
    [BW - 0.22, 1.25],
    [0.22, -1.25],
    [BW - 0.22, -1.25],
  ] as const) {
    const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.045), gold)
    clasp.position.set(lx, ly, CT / 2 + 0.02)
    coverPivot.add(clasp)
  }

  root.add(coverPivot)

  // Open spread pages (beautiful content, always there under cover)
  const pageMatL = new THREE.MeshStandardMaterial({
    map: leftTex,
    roughness: 0.88,
    metalness: 0,
    side: THREE.DoubleSide,
  })
  const pageMatR = new THREE.MeshStandardMaterial({
    map: rightTex,
    roughness: 0.88,
    metalness: 0,
    side: THREE.DoubleSide,
  })

  const leftPage = new THREE.Mesh(new THREE.PlaneGeometry(BW * 0.9, BH * 0.9), pageMatL)
  leftPage.position.set(-0.02, 0, half - CT - 0.02)
  // Fold slightly like open book gutter
  leftPage.rotation.y = 0.12
  leftPage.position.x = -BW * 0.22
  root.add(leftPage)

  const rightPage = new THREE.Mesh(new THREE.PlaneGeometry(BW * 0.9, BH * 0.9), pageMatR)
  rightPage.position.set(BW * 0.28, 0, half - CT - 0.015)
  rightPage.rotation.y = -0.06
  root.add(rightPage)

  // Initial pose: three-quarter product angle
  root.rotation.set(0.22, -0.48, 0.04)
  root.scale.setScalar(1.28)

  return {
    root,
    coverPivot,
    leftPage,
    rightPage,
    pageBlock,
    dispose: () => textures.forEach(t => t.dispose()),
  }
}

function buildCards(features: OrbitFeature[]): THREE.Group {
  const group = new THREE.Group()
  // Only top 3 features — large & readable
  const picks = features.slice(0, 3)
  const slots = [
    { x: 2.55, y: 1.15, z: 0.6, ry: -0.35 },
    { x: 2.85, y: -0.15, z: 0.35, ry: -0.45 },
    { x: 2.35, y: -1.35, z: 0.5, ry: -0.3 },
  ]

  picks.forEach((f, i) => {
    const slot = slots[i]!
    const tex = createCardTexture(f.title, f.desc, f.accent)
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      roughness: 0.35,
      metalness: 0.18,
      emissive: new THREE.Color(f.accent),
      emissiveIntensity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
      opacity: 0,
    })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 1.05), mat)
    mesh.position.set(slot.x, slot.y, slot.z)
    mesh.rotation.y = slot.ry
    mesh.userData = { slot, tex, baseY: slot.y, phase: i * 1.7 }
    group.add(mesh)
  })
  return group
}

/* ── Component ──────────────────────────────────────────── */

interface Props {
  features: OrbitFeature[]
  scrollRootRef?: React.RefObject<HTMLElement | null>
  className?: string
}

export default function MagicTomeCanvas({ features, scrollRootRef, className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const progressTarget = useRef(0.1)
  const progressCurrent = useRef(0.1)
  const introDone = useRef(false)

  useEffect(() => {
    const node = mountRef.current
    if (!node) return
    const mountEl: HTMLDivElement = node

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      progressTarget.current = 0.85
      progressCurrent.current = 0.85
      introDone.current = true
    }

    const w = Math.max(mountEl.clientWidth, 320)
    const h = Math.max(mountEl.clientHeight, 420)

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 60)
    camera.position.set(0.9, 0.35, 6.6)
    camera.lookAt(0.15, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(w, h, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.28
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountEl.appendChild(renderer.domElement)
    Object.assign(renderer.domElement.style, {
      width: '100%',
      height: '100%',
      display: 'block',
      outline: 'none',
    })

    // Lights
    scene.add(new THREE.AmbientLight(0xc8cce0, 0.42))

    const key = new THREE.DirectionalLight(0xfff4e8, 1.65)
    key.position.set(3.5, 5.5, 4.5)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 1
    key.shadow.camera.far = 18
    key.shadow.camera.left = -4
    key.shadow.camera.right = 4
    key.shadow.camera.top = 4
    key.shadow.camera.bottom = -4
    key.shadow.bias = -0.0003
    scene.add(key)

    const rim = new THREE.DirectionalLight(0xb8a0ff, 0.55)
    rim.position.set(-4, 1.5, -2)
    scene.add(rim)

    const goldLight = new THREE.PointLight(0xf0d878, 1.5, 12, 2)
    goldLight.position.set(1.2, 1.4, 2.5)
    scene.add(goldLight)

    const fill = new THREE.PointLight(0x88aadd, 0.5, 10, 2)
    fill.position.set(-1.5, 0.5, 3)
    scene.add(fill)

    // Soft ground shadow
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 48),
      new THREE.ShadowMaterial({ opacity: 0.38 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.set(0.1, -1.72, 0)
    ground.receiveShadow = true
    scene.add(ground)

    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(2.2, 40),
      new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.09,
        depthWrite: false,
      }),
    )
    glow.rotation.x = -Math.PI / 2
    glow.position.set(0.1, -1.71, 0)
    scene.add(glow)
    const glowMat = glow.material as THREE.MeshBasicMaterial

    const book = buildBook()
    book.root.position.set(-0.35, -0.05, 0)
    scene.add(book.root)

    const cards = buildCards(features)
    scene.add(cards)

    // Dust
    const dustCount = 60
    const dustGeo = new THREE.BufferGeometry()
    const dustPos = new Float32Array(dustCount * 3)
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 7
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 4
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        color: 0xe8c96a,
        size: 0.028,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    scene.add(dust)

    let px = 0
    let py = 0
    let tpx = 0
    let tpy = 0
    const onPointer = (e: PointerEvent) => {
      if (window.innerWidth < 768) return
      const r = mountEl.getBoundingClientRect()
      tpx = ((e.clientX - r.left) / r.width - 0.5) * 2
      tpy = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const onLeave = () => {
      tpx = 0
      tpy = 0
    }
    mountEl.addEventListener('pointermove', onPointer)
    mountEl.addEventListener('pointerleave', onLeave)

    const introStart = performance.now()
    const introDur = reduce ? 0 : 3200

    const measureScroll = () => {
      const rect = mountEl.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const start = vh * 0.9
      const end = vh * 0.15
      const mid = rect.top + rect.height * 0.4
      return Math.max(0, Math.min(1, (start - mid) / (start - end)))
    }
    const onScroll = () => {
      const sp = measureScroll()
      if (introDone.current) progressTarget.current = Math.max(0.2, sp)
      else progressTarget.current = Math.max(progressTarget.current, sp * 0.7)
    }
    const scrollRoot = scrollRootRef?.current ?? null
    scrollRoot?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    let frame = 0

    const animate = (now: number) => {
      frame = requestAnimationFrame(animate)

      if (!introDone.current && introDur > 0) {
        const t = Math.min(1, (now - introStart) / introDur)
        // Closed → elegant half-open + cards
        const introP = easeInOutCubic(t) * 0.9
        progressTarget.current = Math.max(progressTarget.current, introP)
        if (t >= 1) introDone.current = true
      }

      progressCurrent.current = lerp(progressCurrent.current, progressTarget.current, 0.08)
      const { open, cardsIn, spin } = mapPose(progressCurrent.current)

      // Cover opens ~0..112° max (0.62 * pi*0.62 ≈ not flat)
      book.coverPivot.rotation.y = -open * Math.PI * 0.95

      // Pages fan slightly more as open
      book.leftPage.rotation.y = 0.08 + open * 0.1
      book.rightPage.rotation.y = -0.04 - open * 0.04
      book.leftPage.position.z = 0.3 + open * 0.08
      book.rightPage.position.z = 0.31 + open * 0.06

      // Thin the bulk block when open so spread is clean
      book.pageBlock.scale.z = 1 - open * 0.35
      book.pageBlock.position.z = -open * 0.06

      // Body pose: more front-facing as opens
      book.root.rotation.x = 0.22 - open * 0.06
      book.root.rotation.y = -0.48 + open * 0.28
      book.root.rotation.z = 0.04 - open * 0.03
      book.root.position.y = -0.05 + open * 0.06
      book.root.scale.setScalar(1.28 + open * 0.06)

      // Cards
      cards.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        const mat = mesh.material as THREE.MeshStandardMaterial
        const { slot, baseY, phase } = mesh.userData as {
          slot: { x: number; y: number; z: number; ry: number }
          baseY: number
          phase: number
        }
        const delay = i * 0.12
        const local = Math.max(0, Math.min(1, (cardsIn - delay) / 0.75))
        mat.opacity = local * 0.96
        const float = Math.sin(now * 0.0011 + phase) * 0.06 * local
        const drift = spin * 0.08 * Math.sin(now * 0.0004 + i)
        mesh.position.set(
          slot.x + drift,
          baseY + float + (1 - local) * 0.4,
          slot.z,
        )
        mesh.rotation.y = slot.ry + Math.sin(now * 0.0005 + i) * 0.03
        mesh.scale.setScalar(0.88 + local * 0.14)
        mat.emissiveIntensity = 0.05 + local * 0.1
      })

      dust.rotation.y = now * 0.00006

      px = lerp(px, tpx, 0.05)
      py = lerp(py, tpy, 0.05)
      camera.position.x = 0.9 + px * 0.4
      camera.position.y = 0.35 - py * 0.22
      camera.position.z = 6.6 - open * 0.4
      camera.lookAt(0.1 + px * 0.08, open * 0.05, 0)

      goldLight.intensity = 1.2 + open * 0.6 + Math.sin(now * 0.002) * 0.1
      glowMat.opacity = 0.06 + open * 0.07

      renderer.render(scene, camera)
    }
    frame = requestAnimationFrame(animate)

    const onResize = () => {
      const nw = Math.max(mountEl.clientWidth, 1)
      const nh = Math.max(mountEl.clientHeight, 1)
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh, false)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(mountEl)

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      scrollRoot?.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
      mountEl.removeEventListener('pointermove', onPointer)
      mountEl.removeEventListener('pointerleave', onLeave)
      book.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mountEl) mountEl.removeChild(renderer.domElement)
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry?.dispose()
          const m = obj.material
          if (Array.isArray(m)) m.forEach(x => x.dispose())
          else if (m) {
            if ('map' in m && m.map) (m.map as THREE.Texture).dispose()
            m.dispose()
          }
        }
      })
    }
  }, [features, scrollRootRef])

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: 440, position: 'relative' }}
      aria-hidden
    />
  )
}
