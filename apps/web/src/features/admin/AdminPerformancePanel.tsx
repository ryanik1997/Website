import { useEffect, useState } from 'react'
import { Activity, Clipboard, Play, RotateCcw, Square } from 'lucide-react'
import {
  ADMIN_PERFORMANCE_EVENT,
  clearAdminPerformanceSession,
  getAdminPerformanceReport,
  startAdminPerformanceSession,
  stopAdminPerformanceSession,
  type AdminPerformanceReport,
} from './adminPerformance'

function formatMs(value: number | null): string {
  return value == null ? 'Chưa có' : `${Math.round(value)} ms`
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 ** 2).toFixed(2)} MB`
}

export default function AdminPerformancePanel() {
  const [report, setReport] = useState<AdminPerformanceReport | null>(() => getAdminPerformanceReport())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const update = () => setReport(getAdminPerformanceReport())
    window.addEventListener(ADMIN_PERFORMANCE_EVENT, update)
    return () => window.removeEventListener(ADMIN_PERFORMANCE_EVENT, update)
  }, [])

  async function copyReport() {
    if (!report) return
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const metrics = report?.metrics
  const metricCards = [
    { label: 'LCP', value: formatMs(metrics?.lcpMs ?? null), target: '< 2.500 ms' },
    { label: 'INP', value: formatMs(metrics?.inpMs ?? null), target: '< 200 ms' },
    { label: 'CLS', value: metrics ? metrics.cls.toFixed(4) : 'Chưa có', target: '< 0,1' },
    { label: 'FCP', value: formatMs(metrics?.fcpMs ?? null), target: '< 1.800 ms' },
    { label: 'TTFB', value: formatMs(metrics?.ttfbMs ?? null), target: '< 800 ms' },
    { label: 'Long tasks', value: String(metrics?.longTaskCount ?? 0), target: `${formatMs(metrics?.maxLongTaskMs ?? 0)} lớn nhất` },
    { label: 'Tài nguyên', value: String(metrics?.resourceCount ?? 0), target: formatBytes(metrics?.transferSize ?? 0) },
    { label: 'Load hoàn tất', value: formatMs(metrics?.loadCompleteMs ?? null), target: `DOM ${formatMs(metrics?.domInteractiveMs ?? null)}` },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <section className="rounded-xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Activity size={22} className="shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Đo hiệu năng trình duyệt</h2>
              <p className="text-xs leading-relaxed mt-1 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
                Bắt đầu đo, sử dụng các trang cần kiểm tra qua sidebar, sau đó quay lại đây và dừng đo.
                Báo cáo chỉ lưu trong tab hiện tại và không tự gửi lên máy chủ.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {report?.active ? (
              <button type="button" onClick={() => setReport(stopAdminPerformanceSession())} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: 'var(--color-accent)', color: 'var(--bg-primary)' }}>
                <Square size={13} /> Dừng đo
              </button>
            ) : (
              <button type="button" onClick={() => setReport(startAdminPerformanceSession())} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}>
                <Play size={13} /> {report ? 'Đo lại' : 'Bắt đầu đo'}
              </button>
            )}
            {report && !report.active ? (
              <button type="button" onClick={() => { clearAdminPerformanceSession(); setReport(null) }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                <RotateCcw size={13} /> Xóa
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 rounded-lg px-3 py-2 text-xs" style={{ background: 'var(--bg-secondary)', color: report?.active ? 'var(--color-primary)' : 'var(--text-muted)' }}>
          {report?.active
            ? `Đang đo từ ${new Date(report.startedAt).toLocaleTimeString('vi-VN')}. Hãy chuyển qua các trang cần kiểm tra.`
            : report
              ? `Đã dừng lúc ${new Date(report.endedAt ?? Date.now()).toLocaleTimeString('vi-VN')}.`
              : 'Chưa có phiên đo. Nên hard refresh trước khi bắt đầu để LCP/FCP phản ánh lần tải mới.'}
        </div>
      </section>

      {report ? (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {metricCards.map(metric => (
              <div key={metric.label} className="rounded-xl border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{metric.label}</p>
                <p className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{metric.value}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{metric.target}</p>
              </div>
            ))}
          </section>

          <section className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Kết quả theo route</h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{report.viewport} · {report.connection ?? 'Không rõ mạng'} · {report.routes.length} lượt truy cập</p>
              </div>
              <button type="button" onClick={() => void copyReport()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium" style={{ borderColor: 'var(--border-color)', color: 'var(--color-primary)' }}>
                <Clipboard size={13} /> {copied ? 'Đã sao chép' : 'Sao chép JSON'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                  <tr><th className="px-4 py-2 text-left">Route</th><th className="px-4 py-2 text-right">Thời gian mở</th><th className="px-4 py-2 text-right">Long tasks</th><th className="px-4 py-2 text-right">Tài nguyên</th><th className="px-4 py-2 text-right">Dung lượng</th></tr>
                </thead>
                <tbody>
                  {report.routes.map((route, index) => (
                    <tr key={`${route.enteredAt}-${index}`} style={{ borderTop: index ? '1px solid var(--border-color)' : undefined, color: 'var(--text-primary)' }}>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{route.path}</td>
                      <td className="px-4 py-3 text-right">{formatMs(route.durationMs)}</td>
                      <td className="px-4 py-3 text-right">{route.longTaskCount} ({formatMs(route.longTaskTotalMs)})</td>
                      <td className="px-4 py-3 text-right">{route.resourceCount}</td>
                      <td className="px-4 py-3 text-right">{formatBytes(route.transferSize)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
