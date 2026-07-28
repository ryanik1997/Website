import type { LucideIcon } from 'lucide-react'
import { Lightbulb } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  icon: LucideIcon
  title: string
  subtitle: string
  ctaLabel: string
  onCta: () => void
  tip?: string
  footerLink?: { label: string; to: string }
}

export default function EmptyStateCard({
  icon: Icon,
  title,
  subtitle,
  ctaLabel,
  onCta,
  tip,
  footerLink,
}: Props) {
  return (
    <div
      className="w-full max-w-md mx-auto px-8 py-10 rounded-2xl border text-center"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: '0 4px 24px color-mix(in srgb, var(--text-primary) 6%, transparent)',
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
      >
        <Icon size={28} style={{ color: 'var(--color-primary)' }} />
      </div>

      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>
      <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
        {subtitle}
      </p>

      <button
        onClick={onCta}
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{
          background: 'var(--color-primary)',
          boxShadow: '0 4px 16px color-mix(in srgb, var(--color-primary) 30%, transparent)',
        }}
      >
        {ctaLabel}
      </button>

      {tip && (
        <p
          className="flex items-start gap-2 mt-5 text-xs text-left rounded-xl px-3 py-2.5"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
        >
          <Lightbulb size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
          <span>{tip}</span>
        </p>
      )}

      {footerLink && (
        <Link
          to={footerLink.to}
          className="inline-block mt-4 text-xs font-medium transition-opacity hover:opacity-80"
          style={{ color: 'var(--color-primary)' }}
        >
          {footerLink.label}
        </Link>
      )}
    </div>
  )
}