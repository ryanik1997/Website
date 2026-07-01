export default function ListeningTest() {
  return (
    <div className="flex h-full items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="max-w-xl rounded-[28px] border px-6 py-8 text-center"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: 'var(--color-primary)' }}>
          Đang phát triển
        </p>
        <h1 className="mt-2 text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
          Listening Mock Test
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Khung Listening sẽ được bổ sung sau khi flow Reading ổn định. Trang này giữ slot route để mở rộng sau.
        </p>
      </div>
    </div>
  )
}
