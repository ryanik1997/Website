import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd(), '../..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

describe('Speaking AI MVP', () => {
  it('opens from AppShell and exposes explicit recording states and controls', () => {
    const shell = read('apps/web/src/pages/AppShell.tsx')
    const panel = read('apps/web/src/features/speaking-ai/SpeakingAiPanel.tsx')
    const recorder = read('apps/web/src/features/speaking-ai/useSpeakingRecorder.ts')
    expect(shell).toContain('setSpeakingAiOpen(true)')
    expect(panel).toContain("'processing'")
    expect(panel).toContain("'speaking'")
    expect(panel).toContain('Hiển thị bản dịch')
    expect(recorder).toContain('navigator.mediaDevices.getUserMedia')
    expect(recorder).toContain('const MAX_SECONDS = 60')
  })

  it('keeps Gemini credentials server-side and enforces ownership and daily quota', () => {
    const edge = read('supabase/functions/speaking-ai/index.ts')
    expect(edge).toContain("Deno.env.get('GEMINI_API_KEY')")
    expect(edge).toContain("'gemini-2.5-flash'")
    expect(edge).toContain('const DAILY_SECONDS = 600')
    expect(edge).toContain(".eq('user_id', auth.user.id)")
    expect(edge).toContain('inlineData')
    expect(edge).not.toContain('audio_url')
  })

  it('creates private transcript and usage tables without persistent audio', () => {
    const migration = read('supabase/migrations/025_speaking_ai_mvp.sql')
    expect(migration).toContain('public.speaking_conversations')
    expect(migration).toContain('public.speaking_messages')
    expect(migration).toContain('public.speaking_usage')
    expect(migration).toContain('enable row level security')
    expect(migration).not.toContain('audio_url')
  })
})
