export default function WritingTest() {
  return (
    <div className="flex h-full items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="max-w-xl rounded-[28px] border px-6 py-8 text-center"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: 'var(--color-primary)' }}>
          Dang phat trien
        </p>
        <h1 className="mt-2 text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
          Writing Mock Test
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Flow Writing se duoc tach thanh Task 1 va Task 2 o buoc tiep theo. Hien tai da chuan bi route de noi tiep.
        </p>
      </div>
    </div>
  )
}
