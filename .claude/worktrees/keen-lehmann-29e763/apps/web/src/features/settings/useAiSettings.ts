import { useState, useEffect, useCallback } from 'react'
import { writingRepo } from '@ryan/db'
import { AI_PROVIDERS, callAI, type AIProvider } from '@ryan/core'

export function useAiSettings() {
  const [provider, setProvider] = useState<AIProvider>('openai')
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [todayUsage, setTodayUsage] = useState(0)

  useEffect(() => {
    async function load() {
      const p = (await writingRepo.getSetting('ai_provider') as AIProvider) ?? 'openai'
      const k: Record<string, string> = {}
      for (const pr of AI_PROVIDERS) {
        k[pr.id] = ((await writingRepo.getSetting(`ai_key_${pr.id}`)) as string) ?? ''
      }
      setProvider(p)
      setKeys(k)
      // Giữ tương thích; dashboard dùng live query aiUsage
      setTodayUsage(await writingRepo.getTodayUsage('writing_ai'))
      setLoading(false)
    }
    load()
  }, [])

  const updateKey = useCallback((id: string, value: string) => {
    setKeys(prev => ({ ...prev, [id]: value }))
    setTestResult(null)
  }, [])

  const save = useCallback(async () => {
    setSaving(true)
    await writingRepo.setSetting('ai_provider', provider)
    for (const [id, key] of Object.entries(keys)) {
      await writingRepo.setSetting(`ai_key_${id}`, key)
    }
    setSaving(false)
  }, [provider, keys])

  const testConnection = useCallback(async () => {
    const key = keys[provider]?.trim()
    if (!key) {
      setTestResult({ ok: false, msg: 'Chưa nhập API key' })
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const result = await callAI(
        [{ role: 'user', content: 'Reply with JSON only: {"ok":true}' }],
        key,
        provider,
      )
      JSON.parse(result.content)
      setTestResult({ ok: true, msg: `Kết nối ${AI_PROVIDERS.find(p => p.id === provider)?.name} thành công` })
    } catch (e) {
      setTestResult({ ok: false, msg: e instanceof Error ? e.message.slice(0, 200) : 'Lỗi không xác định' })
    } finally {
      setTesting(false)
    }
  }, [provider, keys])

  return {
    provider, setProvider,
    keys, updateKey,
    showKey, setShowKey,
    loading, saving, save,
    testing, testResult, testConnection,
    todayUsage,
  }
}