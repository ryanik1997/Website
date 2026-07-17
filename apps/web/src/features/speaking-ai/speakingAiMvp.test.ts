import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd(), '../..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

describe('Speaking AI MVP', () => {
  it('opens as a dedicated page from AppShell nav and supports chat + recording states', () => {
    const shell = read('apps/web/src/pages/AppShell.tsx')
    const app = read('apps/web/src/App.tsx')
    const page = read('apps/web/src/features/speaking-ai/SpeakingAiPage.tsx')
    const recorder = read('apps/web/src/features/speaking-ai/useSpeakingRecorder.ts')
    expect(shell).toContain("to: '/app/speaking-ai'")
    expect(app).toContain('<Route path="speaking-ai"')
    expect(page).toContain("'processing'")
    expect(page).toContain("'speaking'")
    expect(page).toContain('Hiển thị bản dịch')
    expect(page).toContain('textarea')
    expect(page).toContain('estimateTypedSeconds')
    expect(recorder).toContain('navigator.mediaDevices.getUserMedia')
    expect(recorder).toContain('SpeechRecognition?: SpeechRecognitionCtor')
    expect(recorder).toContain("recognition.lang = 'en-US'")
    expect(recorder).toContain('const MAX_SECONDS = 60')
  })

  it('keeps DeepSeek credentials server-side and enforces ownership and daily quota', () => {
    const edge = read('supabase/functions/speaking-ai/index.ts')
    const client = read('apps/web/src/features/speaking-ai/speakingAiApi.ts')
    expect(edge).toContain("Deno.env.get('DEEPSEEK_API_KEY')")
    expect(edge).toContain("'deepseek-v4-flash'")
    expect(edge).toContain('https://api.deepseek.com/chat/completions')
    expect(edge).toContain("response_format: { type: 'json_object' }")
    expect(edge).toContain('const DAILY_SECONDS = 600')
    expect(edge).toContain(".eq('user_id', auth.user.id)")
    expect(edge).not.toContain('inlineData')
    expect(edge).not.toContain('GEMINI_API_KEY')
    expect(client).not.toContain('FileReader')
    expect(client).not.toContain('audioData')
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
