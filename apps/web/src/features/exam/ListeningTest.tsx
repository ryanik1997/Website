export default function ListeningTest() {
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
          Listening Mock Test
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Khung Listening se duoc bo sung sau khi flow Reading on dinh. Trang nay giu slot route de mo rong sau.
        </p>
      </div>
    </div>
  )
}
