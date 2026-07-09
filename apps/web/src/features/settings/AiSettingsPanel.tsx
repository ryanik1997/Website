import { ExternalLink, Eye, EyeOff, Info, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { AI_PROVIDERS } from '@ryan/core'
import { useAiSettings } from './useAiSettings'
import AiUsageDashboard from './AiUsageDashboard'

const INPUT_STYLE = {
  background: 'var(--bg-secondary)',
  borderColor: 'var(--border-color)',
  color: 'var(--text-primary)',
}

interface Props {
  showUsage?: boolean
  onSave?: () => void
}

export default function AiSettingsPanel({ showUsage = true, onSave }: Props) {
  const {
    provider, setProvider,
    keys, updateKey,
    showKey, setShowKey,
    loading, saving, save,
    testing, testResult, testConnection,
  } = useAiSettings()

  const cfg = AI_PROVIDERS.find(p => p.id === provider)!

  async function handleSave() {
    await save()
    onSave?.()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Provider */}
      <section>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Nhà cung cấp AI</p>
        <div className="grid grid-cols-2 gap-2">
          {AI_PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className="px-3 py-2.5 rounded-xl text-left border transition-colors"
              style={{
                borderColor: provider === p.id ? 'var(--color-primary)' : 'var(--border-color)',
                background: provider === p.id
                  ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                  : 'var(--bg-secondary)',
              }}
            >
              <p
                className="text-xs font-semibold"
                style={{ color: provider === p.id ? 'var(--color-primary)' : 'var(--text-primary)' }}
              >
                {p.name}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.defaultModel}</p>
            </button>
          ))}
        </div>
      </section>

      {/* API Key */}
      <section>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            API Key — {cfg.name}
          </label>
          <a
            href={`https://${cfg.note.split(' ')[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1"
            style={{ color: 'var(--color-primary)' }}
          >
            Lấy key <ExternalLink size={10} />
          </a>
        </div>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={keys[provider] ?? ''}
            onChange={e => updateKey(provider, e.target.value)}
            placeholder={`${cfg.name} API key...`}
            className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border outline-none focus:ring-1"
            style={{ ...INPUT_STYLE, outlineColor: 'var(--color-primary)' }}
          />
          <button
            type="button"
            onClick={() => setShowKey(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <Info size={10} /> {cfg.note} — Key lưu cục bộ, không gửi lên server
        </p>
      </section>

      {/* Test + Save */}
      <section className="flex flex-col gap-3">
        <div className="flex gap-2">
          <button
            onClick={testConnection}
            disabled={testing || !keys[provider]?.trim()}
            className="flex-1 px-4 py-2.5 text-sm rounded-lg border font-medium disabled:opacity-50 transition-colors"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}
          >
            {testing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Đang kiểm tra...
              </span>
            ) : 'Kiểm tra kết nối'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 text-sm rounded-lg font-medium text-white disabled:opacity-50"
            style={{ background: 'var(--color-primary)' }}
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>

        {testResult && (
          <div
            className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs"
            style={{
              background: testResult.ok
                ? 'color-mix(in srgb, #22c55e 12%, transparent)'
                : 'color-mix(in srgb, #ef4444 12%, transparent)',
              color: testResult.ok ? '#22c55e' : '#ef4444',
            }}
          >
            {testResult.ok ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <XCircle size={14} className="shrink-0 mt-0.5" />}
            <span>{testResult.msg}</span>
          </div>
        )}
      </section>

      {/* Usage dashboard theo từng phần */}
      {showUsage && <AiUsageDashboard />}
    </div>
  )
}