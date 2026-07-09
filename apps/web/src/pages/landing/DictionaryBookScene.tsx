/**
 * Landing hero 3D stage — WebGL tome.
 * Backup sun: HERO_MASCOT_MODE = 'sun' in landingHeroConfig.ts
 */
import type { LucideIcon } from 'lucide-react'
import MagicTomeCanvas from './MagicTomeCanvas'

export type OrbitFeature = {
  icon: LucideIcon
  title: string
  desc: string
  accent: string
}

interface Props {
  features: OrbitFeature[]
  scrollRootRef?: React.RefObject<HTMLElement | null>
}

export default function DictionaryBookScene({ features, scrollRootRef }: Props) {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        minHeight: 'min(64vh, 640px)',
        borderRadius: 28,
        border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
        background: `
          radial-gradient(ellipse 85% 75% at 42% 48%,
            #1e1830 0%,
            #12101c 48%,
            #0a0910 100%)
        `,
        boxShadow: `
          0 24px 64px color-mix(in srgb, var(--text-primary) 10%, transparent),
          inset 0 1px 0 color-mix(in srgb, #ffffff 8%, transparent)
        `,
      }}
    >
      {/* Warm gold pool under book */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 45% 35% at 40% 72%, rgba(212,175,55,0.14) 0%, transparent 70%)',
        }}
        aria-hidden
      />
      {/* Soft top light */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 45% 20%, rgba(180,170,255,0.12) 0%, transparent 60%)',
        }}
        aria-hidden
      />

      <MagicTomeCanvas
        features={features}
        scrollRootRef={scrollRootRef}
        className="relative z-[1] w-full h-full"
      />

      {/* Bottom edge blend into page (subtle) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 z-[2]"
        style={{
          background:
            'linear-gradient(to top, color-mix(in srgb, #0a0910 40%, transparent), transparent)',
        }}
        aria-hidden
      />
    </div>
  )
}
