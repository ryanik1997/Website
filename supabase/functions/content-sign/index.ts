/**
 * Mode A+B — content-sign
 * AuthN: user JWT required
 * AuthZ: plan entitlement + path allowlist + rate limit (user + soft IP)
 * Returns short-lived signed URL for private bucket exam-media
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BUCKET = 'exam-media'
const SIGN_TTL_SEC = 60
const RATE_WINDOW_MS = 60_000
const RATE_MAX_USER = 45
const RATE_MAX_IP = 120
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000
const RATE_MAX_DAILY_USER = 400
const ALERT_DAILY_USER = 300

/** Free-plan demo prefixes only (under exam-media/) */
const FREE_ALLOW_PREFIXES = [
  'catalog/listening/ket-a2-test1/',
  'catalog/listening/pet-b1-test1/',
  'catalog/reading/ket-a2-test1/',
  'catalog/reading/pet-b1-test1/',
  // Mode C — exam bodies (no answers) for free demos
  'catalog/exams/listening/catalog-listening-ket-a2-test1.json',
  'catalog/exams/listening/catalog-listening-pet-b1-test1.json',
  'catalog/exams/reading/catalog-reading-ket-a2-test1.json',
  'catalog/exams/reading/catalog-reading-pet-b1-test1.json',
  // Mode D — answer vaults for free demos only (paid get all via plan)
  'catalog/exams/listening/catalog-listening-ket-a2-test1.answers.json',
  'catalog/exams/listening/catalog-listening-pet-b1-test1.answers.json',
  'catalog/exams/reading/catalog-reading-ket-a2-test1.answers.json',
  'catalog/exams/reading/catalog-reading-pet-b1-test1.answers.json',
]

const ALLOWED_ROOTS = ['catalog/', 'data/', 'books/']
const ALLOWED_EXT = new Set([
  '.mp3', '.m4a', '.wav', '.ogg', '.aac',
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg',
  '.json', '.txt', '.pdf',
])

// data/* and books/* are paid-only. IELTS wizard previews are admin-only.
const PAID_ONLY_PREFIXES = ['data/', 'books/']
const ADMIN_ONLY_PREFIXES = ['catalog/ielts-wizard/']

type Plan = 'free' | 'trial' | 'basic' | 'pro' | 'lifetime'

interface SignBody {
  path?: string
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function normalizePath(raw: string): string | null {
  let p = raw.trim().replace(/\\/g, '/')
  try {
    if (/^https?:\/\//i.test(p)) {
      const u = new URL(p)
      p = u.pathname
    }
  } catch {
    /* ignore */
  }
  p = (p.split('?')[0] ?? p)
  try {
    p = decodeURIComponent(p)
  } catch {
    /* keep */
  }
  while (p.startsWith('/')) p = p.slice(1)
  if (!p || p.includes('..') || p.includes('\0') || p.includes('//')) return null
  if (p.startsWith(`${BUCKET}/`)) p = p.slice(BUCKET.length + 1)

  const markers = [
    'storage/v1/object/public/exam-media/',
    'storage/v1/object/sign/exam-media/',
    'storage/v1/object/authenticated/exam-media/',
  ]
  for (const m of markers) {
    const i = p.indexOf(m)
    if (i >= 0) p = p.slice(i + m.length)
  }

  if (!ALLOWED_ROOTS.some(root => p.startsWith(root))) return null

  const lower = p.toLowerCase()
  const dot = lower.lastIndexOf('.')
  if (dot < 0) return null
  const ext = lower.slice(dot)
  if (!ALLOWED_EXT.has(ext)) return null

  // block hidden / backup junk
  if (lower.includes('/.') || lower.endsWith('.bak') || lower.endsWith('.tmp')) return null

  return p
}

function planActive(plan: string | null | undefined, expiresAt: string | null | undefined): Plan {
  const p = (plan ?? 'free') as Plan
  if (p === 'free' || p === 'lifetime') return p
  if (!expiresAt) return p
  if (new Date(expiresAt).getTime() < Date.now()) return 'free'
  return p
}

function isPaid(plan: Plan): boolean {
  return plan === 'trial' || plan === 'basic' || plan === 'pro' || plan === 'lifetime'
}

function freeAllowed(path: string): boolean {
  if (PAID_ONLY_PREFIXES.some(prefix => path.startsWith(prefix))) return false
  return FREE_ALLOW_PREFIXES.some(prefix => path === prefix || path.startsWith(prefix))
}

function clientIp(req: Request): string | null {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('cf-connecting-ip')
    ?? req.headers.get('x-real-ip')
    ?? null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!jwt) return jsonResponse({ error: 'Unauthorized', code: 'NO_JWT' }, 401)

  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return jsonResponse({ error: 'Server misconfigured' }, 500)
  }
  if (jwt === anonKey || jwt === serviceKey) {
    return jsonResponse({ error: 'Unauthorized — user session required', code: 'BAD_TOKEN' }, 401)
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  })
  const { data: userData, error: userError } = await userClient.auth.getUser(jwt)
  if (userError || !userData.user) {
    return jsonResponse({ error: 'Unauthorized', code: 'INVALID_SESSION' }, 401)
  }
  const user = userData.user

  let body: SignBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }

  const path = normalizePath(body.path ?? '')
  if (!path) {
    return jsonResponse({ error: 'Invalid path', code: 'BAD_PATH' }, 400)
  }

  const adminClient = createClient(supabaseUrl, serviceKey)

  const { data: profile } = await adminClient
    .from('profiles')
    .select('plan, plan_expires_at, is_admin')
    .eq('id', user.id)
    .maybeSingle()

  const plan = planActive(profile?.plan, profile?.plan_expires_at)
  const isAdmin = profile?.is_admin === true

  if (!isAdmin && ADMIN_ONLY_PREFIXES.some(prefix => path.startsWith(prefix))) {
    return jsonResponse({
      error: 'Forbidden — admin content',
      code: 'ADMIN_REQUIRED',
    }, 403)
  }

  if (!isAdmin && !isPaid(plan) && !freeAllowed(path)) {
    return jsonResponse({
      error: 'Forbidden — upgrade plan to access this content',
      code: 'PLAN_REQUIRED',
      plan,
    }, 403)
  }

  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString()
  const ip = clientIp(req)

  const { count: userCount } = await adminClient
    .from('content_access_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', since)

  if ((userCount ?? 0) >= RATE_MAX_USER) {
    return jsonResponse({ error: 'Rate limit exceeded', code: 'RATE_LIMIT' }, 429)
  }

  if (ip) {
    const { count: ipCount } = await adminClient
      .from('content_access_log')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', since)
    if ((ipCount ?? 0) >= RATE_MAX_IP) {
      return jsonResponse({ error: 'Rate limit exceeded (IP)', code: 'RATE_LIMIT_IP' }, 429)
    }
  }

  const dailySince = new Date(Date.now() - DAILY_WINDOW_MS).toISOString()
  const { count: dailyUserCount } = await adminClient
    .from('content_access_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', dailySince)

  if ((dailyUserCount ?? 0) >= RATE_MAX_DAILY_USER) {
    return jsonResponse({
      error: 'Daily content access quota exceeded',
      code: 'RATE_LIMIT_DAILY',
      retryAfterSec: 3600,
    }, 429)
  }

  const { data: signed, error: signError } = await adminClient.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGN_TTL_SEC)

  if (signError || !signed?.signedUrl) {
    console.error('[content-sign] sign failed', path, signError?.message)
    return jsonResponse({
      error: signError?.message ?? 'Sign failed',
      code: 'SIGN_FAILED',
      path,
    }, 404)
  }

  const ua = req.headers.get('user-agent')?.slice(0, 300) ?? null
  void adminClient.from('content_access_log').insert({
    user_id: user.id,
    path,
    plan,
    ip,
    user_agent: ua,
  })

  if ((dailyUserCount ?? 0) + 1 >= ALERT_DAILY_USER) {
    const alertDay = new Date().toISOString().slice(0, 10)
    void adminClient.from('content_security_alerts').upsert({
      user_id: user.id,
      alert_type: 'DAILY_SIGN_VOLUME',
      alert_day: alertDay,
      request_count: (dailyUserCount ?? 0) + 1,
      metadata: {
        threshold: ALERT_DAILY_USER,
        lastPath: path,
        plan,
        ip,
      },
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,alert_type,alert_day',
    })
  }

  const expiresAt = new Date(Date.now() + SIGN_TTL_SEC * 1000).toISOString()
  return jsonResponse({
    url: signed.signedUrl,
    path,
    expiresAt,
    ttlSec: SIGN_TTL_SEC,
  })
})
