import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1'])
const DAILY_SECONDS = 600

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  const url = Deno.env.get('SUPABASE_URL') ?? ''
  const anon = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY') ?? ''
  if (!url || !anon || !service) return json({ error: 'Server misconfigured' }, 500)
  if (!token) return json({ error: 'Unauthorized' }, 401)
  if (!deepseekKey) return json({ error: 'Speaking AI chưa được cấu hình DEEPSEEK_API_KEY.' }, 503)
  const userClient = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } })
  const { data: auth } = await userClient.auth.getUser(token)
  if (!auth.user) return json({ error: 'Unauthorized' }, 401)
  const admin = createClient(url, service)
  const body = await req.json().catch(() => null) as Record<string, unknown> | null
  if (!body) return json({ error: 'Invalid JSON' }, 400)

  if (body.action === 'history') {
    const { data } = await admin.from('speaking_conversations').select('id,title,level,topic,mode,started_at,total_duration,speaking_messages(*)').eq('user_id', auth.user.id).order('started_at', { ascending: false }).limit(12)
    return json({ conversations: data ?? [] })
  }

  const transcript = typeof body.transcript === 'string' ? body.transcript.trim().slice(0, 2_000) : ''
  const durationSec = Math.ceil(Number(body.durationSec ?? 0))
  const level = typeof body.level === 'string' && LEVELS.has(body.level) ? body.level : 'B1'
  const topic = String(body.topic ?? 'Daily English').slice(0, 100)
  const mode = String(body.mode ?? 'Free Conversation').slice(0, 60)
  if (transcript.length < 2 || durationSec < 1 || durationSec > 60) return json({ error: 'Lời nói phải dài từ 1 đến 60 giây và có nội dung hợp lệ.' }, 400)

  const today = new Date().toISOString().slice(0, 10)
  const { data: usage } = await admin.from('speaking_usage').select('audio_seconds,request_count').eq('user_id', auth.user.id).eq('usage_date', today).maybeSingle()
  if ((usage?.audio_seconds ?? 0) + durationSec > DAILY_SECONDS) return json({ error: 'Bạn đã dùng hết 10 phút Speaking AI hôm nay.', code: 'DAILY_LIMIT' }, 429)

  let conversationId = typeof body.conversationId === 'string' ? body.conversationId : ''
  if (!conversationId) {
    const { data: created, error } = await admin.from('speaking_conversations').insert({ user_id: auth.user.id, title: `${mode} · ${topic}`, level, topic, mode, provider: 'deepseek' }).select('id').single()
    if (error) return json({ error: error.message }, 500)
    conversationId = created.id
  } else {
    const { data: owned } = await admin.from('speaking_conversations').select('id').eq('id', conversationId).eq('user_id', auth.user.id).maybeSingle()
    if (!owned) return json({ error: 'Conversation not found.' }, 404)
  }
  const { data: conversation } = await admin.from('speaking_conversations').select('total_duration').eq('id', conversationId).single()
  const { data: prior } = await admin.from('speaking_messages').select('role,text').eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(12)
  const system = `You are a friendly English speaking tutor for a Vietnamese learner. Student level: ${level}. Topic: ${topic}. Mode: ${mode}.
Reply naturally in level-appropriate English and ask one follow-up question. Give concise correction, a more natural alternative, a short Vietnamese explanation, and one useful vocabulary item. Do not claim to score pronunciation because you only receive a browser transcript.
Return JSON only in exactly this shape: {"reply":"...","correction":{"original":"...","corrected":"...","natural":"...","explanation":"..."},"vocabulary":[{"word":"...","meaning":"...","example":"..."}],"follow_up_question":"..."}.`
  const model = Deno.env.get('SPEAKING_AI_MODEL') ?? 'deepseek-v4-flash'
  const messages = [
    { role: 'system', content: system },
    ...(prior ?? []).map(item => ({ role: item.role, content: item.text })),
    { role: 'user', content: transcript },
  ]
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25_000)
  let response: Response
  try {
    response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST', signal: controller.signal,
      headers: { Authorization: `Bearer ${deepseekKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, response_format: { type: 'json_object' }, max_tokens: 1_000, stream: false, thinking: { type: 'disabled' } }),
    })
  } catch { clearTimeout(timeout); return json({ error: 'DeepSeek timeout. Vui lòng thử lại.' }, 504) }
  clearTimeout(timeout)
  if (!response.ok) return json({ error: `DeepSeek error ${response.status}` }, 502)
  const raw = await response.json()
  const text = raw?.choices?.[0]?.message?.content
  let result: Record<string, unknown>
  try { result = JSON.parse(text) } catch { return json({ error: 'AI trả về dữ liệu không hợp lệ.' }, 502) }
  const reply = String(result.reply ?? '').trim()
  if (!reply) return json({ error: 'AI chưa tạo được phản hồi. Vui lòng thử lại.' }, 502)
  const correction = result.correction as Record<string, unknown> | undefined
  await admin.from('speaking_messages').insert([
    { conversation_id: conversationId, role: 'user', text: transcript },
    { conversation_id: conversationId, role: 'assistant', text: reply, corrected_text: correction?.corrected ?? null, feedback_json: { correction: result.correction, vocabulary: result.vocabulary, followUpQuestion: result.follow_up_question } },
  ])
  await admin.from('speaking_conversations').update({ total_duration: (conversation?.total_duration ?? 0) + durationSec }).eq('id', conversationId).eq('user_id', auth.user.id)
  await admin.from('speaking_usage').upsert({ user_id: auth.user.id, usage_date: today, audio_seconds: (usage?.audio_seconds ?? 0) + durationSec, request_count: (usage?.request_count ?? 0) + 1 }, { onConflict: 'user_id,usage_date' })
  return json({ conversationId, transcript, reply, correction: result.correction, vocabulary: result.vocabulary, followUpQuestion: result.follow_up_question, usedSeconds: (usage?.audio_seconds ?? 0) + durationSec, dailyLimitSeconds: DAILY_SECONDS })
})
