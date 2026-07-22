export default function WritingTest() {
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
          Writing Mock Test
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Flow Writing sẽ được tách thành Task 1 và Task 2 ở bước tiếp theo. Hiện tại đã chuẩn bị route để nối tiếp.
        </p>
      </div>
    </div>
  )
}
