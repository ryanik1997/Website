import { supabase } from '../../lib/supabase'

export interface TutorTurn {
  conversationId: string
  transcript: string
  reply: string
  correction: { original: string; corrected: string; natural: string; explanation: string }
  vocabulary: Array<{ word: string; meaning: string; example: string }>
  followUpQuestion: string
  usedSeconds: number
  dailyLimitSeconds: number | null
  unlimited: boolean
  retentionDays: number
}

export interface SpeakingAccess {
  unlimited: boolean
  dailyLimitSeconds: number | null
  retentionDays: number
}

export interface StoredConversation {
  id: string
  title: string
  level: string
  topic: string
  mode: string
  speaking_messages: Array<{ id: number; role: 'user' | 'assistant'; text: string; corrected_text?: string | null; feedback_json?: Record<string, unknown> }>
}

export interface SpeakingHistory {
  conversation: StoredConversation
  turns: TutorTurn[]
}

export async function sendSpeakingTurn(input: { transcript: string; durationSec: number; conversationId?: string; level: string; topic: string; mode: string }): Promise<TutorTurn> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Phiên đăng nhập đã hết hạn.')
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speaking-ai`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error ?? 'Speaking AI không phản hồi.')
  return data as TutorTurn
}

function conversationTurns(conversation: StoredConversation, access: SpeakingAccess): TutorTurn[] {
  const turns: TutorTurn[] = []
  const messages = [...conversation.speaking_messages].sort((a, b) => a.id - b.id)
  for (let index = 0; index < messages.length; index += 2) {
    const user = messages[index]
    const assistant = messages[index + 1]
    if (user?.role !== 'user' || assistant?.role !== 'assistant') continue
    const feedback = assistant.feedback_json ?? {}
    turns.push({
      conversationId: conversation.id,
      transcript: user.text,
      reply: assistant.text,
      correction: (feedback.correction ?? { original: user.text, corrected: assistant.corrected_text ?? user.text, natural: '', explanation: '' }) as TutorTurn['correction'],
      vocabulary: (feedback.vocabulary ?? []) as TutorTurn['vocabulary'],
      followUpQuestion: String(feedback.followUpQuestion ?? ''),
      usedSeconds: 0,
      dailyLimitSeconds: access.dailyLimitSeconds,
      unlimited: access.unlimited,
      retentionDays: access.retentionDays,
    })
  }
  return turns
}

export async function loadLatestSpeakingConversation(): Promise<{ conversation: StoredConversation | null; turns: TutorTurn[]; histories: SpeakingHistory[]; access: SpeakingAccess } | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speaking-ai`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'history' }),
  })
  if (!response.ok) return null
  const data = await response.json() as { conversations?: StoredConversation[]; access?: SpeakingAccess }
  const access = data.access ?? { unlimited: false, dailyLimitSeconds: 600, retentionDays: 30 }
  const histories = (data.conversations ?? []).map(conversation => ({ conversation, turns: conversationTurns(conversation, access) }))
  return { conversation: histories[0]?.conversation ?? null, turns: histories[0]?.turns ?? [], histories, access }
}
