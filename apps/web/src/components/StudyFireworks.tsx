import { useEffect, useRef } from 'react'

const COLORS = [
  'var(--color-primary)',
  'var(--color-accent)',
  '#fbbf24',
  '#a78bfa',
  '#34d399',
]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface Rocket {
  x: number
  y: number
  vy: number
  targetY: number
  color: string
  exploded: boolean
}

interface Props {
  burstId: number
  onDone?: () => void
}

export default function StudyFireworks({ burstId, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let alive = true
    const particles: Particle[] = []
    const rockets: Rocket[] = []
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const w = () => window.innerWidth
    const h = () => window.innerHeight

    function spawnRocket() {
      rockets.push({
        x: w() * (0.2 + Math.random() * 0.6),
        y: h(),
        vy: -(6 + Math.random() * 4),
        targetY: h() * (0.15 + Math.random() * 0.35),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        exploded: false,
      })
    }

    function explode(x: number, y: number, color: string) {
      const count = 36 + Math.floor(Math.random() * 20)
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3
        const speed = 2 + Math.random() * 5
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 45 + Math.random() * 35,
          color,
          size: 2 + Math.random() * 2,
        })
      }
    }

    spawnRocket()
    const rocketTimers = [
      window.setTimeout(spawnRocket, 180),
      window.setTimeout(spawnRocket, 420),
      window.setTimeout(spawnRocket, 650),
    ]

    const start = performance.now()
    const maxMs = 2800

    const tick = () => {
      if (!alive) return
      ctx.clearRect(0, 0, w(), h())

      for (const r of rockets) {
        if (!r.exploded) {
          r.y += r.vy
          r.vy *= 0.98
          ctx.beginPath()
          ctx.arc(r.x, r.y, 3, 0, Math.PI * 2)
          ctx.fillStyle = r.color
          ctx.fill()
          if (r.y <= r.targetY || r.vy > -0.5) {
            r.exploded = true
            explode(r.x, r.y, r.color)
          }
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.06
        p.vx *= 0.99

        const alpha = 1 - p.life / p.maxLife
        if (alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      }
      ctx.globalAlpha = 1

      if (performance.now() - start < maxMs || particles.length > 0) {
        raf = requestAnimationFrame(tick)
      } else {
        alive = false
        onDone?.()
      }
    }

    raf = requestAnimationFrame(tick)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      rocketTimers.forEach(clearTimeout)
      window.removeEventListener('resize', resize)
    }
  }, [burstId, onDone])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[45] pointer-events-none"
      aria-hidden
    />
  )
}