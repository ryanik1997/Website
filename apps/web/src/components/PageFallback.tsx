export default function PageFallback() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
      <div
        className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
      />
    </div>
  )
}