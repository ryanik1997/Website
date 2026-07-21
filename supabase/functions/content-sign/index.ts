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
// Audio files (e.g. KET A2 Listening) can be 25+ min; the <audio> element
// streams via range requests that all share the same signed URL.
// 60 s was far too short — audio freezes once the URL expires mid-play.
// 1 800 s (30 min) covers the longest catalog MP3 with headroom.
const SIGN_TTL_SEC = 1_800
const RATE_MAX_USER = 45
const RATE_MAX_IP = 120
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

function hasProAccess(plan: Plan): boolean {
  return plan === 'pro' || plan === 'lifetime'
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

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char] ?? char))
}

async function sendSecurityAlertEmail(opts: {
  email: string
  userId: string
  requestCount: number
  plan: Plan
  path: string
  ip: string | null
}): Promise<boolean> {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? ''
  if (!resendKey || !adminEmail) {
    console.warn('[content-sign] RESEND_API_KEY or ADMIN_EMAIL missing; alert remains in DB')
    return false
  }
  const appOrigin = Deno.env.get('APP_ORIGIN') ?? 'https://ryanenglishv2.vercel.app'
  const adminLink = `${appOrigin}/app/admin?search=${encodeURIComponent(opts.email)}`
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(8_000),
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Ryan English Security <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `[Ryan English Security] ${opts.requestCount} signed-media requests — ${opts.email}`,
      html: `<h2>Cảnh báo truy cập nội dung</h2>
        <p>User <strong>${escapeHtml(opts.email)}</strong> đã tạo <strong>${opts.requestCount}</strong> signed URL trong 24 giờ.</p>
        <ul><li>User ID: ${escapeHtml(opts.userId)}</li><li>Plan: ${escapeHtml(opts.plan)}</li><li>IP: ${escapeHtml(opts.ip ?? 'unknown')}</li><li>Path cuối: ${escapeHtml(opts.path)}</li></ul>
        <p><a href="${escapeHtml(adminLink)}">Mở Admin</a></p>`,
    }),
  })
  if (!response.ok) {
    console.error('[content-sign] Resend alert failed', response.status, await response.text())
    return false
  }
  return true
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
    .select('plan, plan_expires_at, is_admin, suspended_at')
    .eq('id', user.id)
    .maybeSingle()

  const plan = planActive(profile?.plan, profile?.plan_expires_at)
  const isAdmin = profile?.is_admin === true

  // Checked per request: a suspension takes effect even while an old JWT exists.
  if (profile?.suspended_at) {
    return jsonResponse({ error: 'Account suspended', code: 'ACCOUNT_SUSPENDED' }, 403)
  }

  if (!isAdmin && ADMIN_ONLY_PREFIXES.some(prefix => path.startsWith(prefix))) {
    return jsonResponse({
      error: 'Forbidden — admin content',
      code: 'ADMIN_REQUIRED',
    }, 403)
  }

  if (!isAdmin && !hasProAccess(plan)) {
    return jsonResponse({
      error: 'Forbidden — upgrade plan to access this content',
      code: 'PLAN_REQUIRED',
      plan,
    }, 403)
  }

  const ip = clientIp(req)
  const { data: rateRows, error: rateError } = await adminClient.rpc('claim_content_rate_limit', {
    target_user_id: user.id,
    target_ip: ip,
    hourly_user_limit: RATE_MAX_USER,
    hourly_ip_limit: RATE_MAX_IP,
    daily_user_limit: RATE_MAX_DAILY_USER,
  })
  if (rateError) {
    console.error('[content-sign] rate claim failed', rateError.message)
    return jsonResponse({ error: 'Rate limiter unavailable', code: 'RATE_LIMIT_ERROR' }, 503)
  }
  const rate = Array.isArray(rateRows) ? rateRows[0] : rateRows
  if (!rate?.allowed) {
    if (rate?.denial_code === 'RATE_LIMIT_DAILY') {
      return jsonResponse({
        error: 'Daily content access quota exceeded',
        code: 'RATE_LIMIT_DAILY',
        retryAfterSec: 3600,
      }, 429)
    }
    if (rate?.denial_code === 'RATE_LIMIT_IP') {
      return jsonResponse({
        error: 'Content access rate limit exceeded (IP)',
        code: 'RATE_LIMIT_IP',
        retryAfterSec: 3600,
      }, 429)
    }
    return jsonResponse({
      error: 'Content access rate limit exceeded',
      code: 'RATE_LIMIT',
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

  const nextDailyCount = Number(rate.user_day_count ?? 1)
  if (nextDailyCount >= ALERT_DAILY_USER) {
    const metadata = { threshold: ALERT_DAILY_USER, lastPath: path, plan, ip }
    const { data: emailClaimed, error: claimError } = await adminClient.rpc(
      'claim_content_security_alert_email',
      { target_user_id: user.id, target_request_count: nextDailyCount, target_metadata: metadata },
    )
    if (claimError) {
      console.error('[content-sign] alert claim failed', claimError.message)
    } else if (emailClaimed) {
      let emailSent = false
      try {
        emailSent = await sendSecurityAlertEmail({
          email: user.email ?? user.id,
          userId: user.id,
          requestCount: nextDailyCount,
          plan,
          path,
          ip,
        })
      } catch (emailError) {
        console.error('[content-sign] Resend alert threw', emailError)
      }
      if (!emailSent) {
        const { error: releaseError } = await adminClient.rpc(
          'release_content_security_alert_email',
          { target_user_id: user.id },
        )
        if (releaseError) console.error('[content-sign] alert release failed', releaseError.message)
      }
    }
  }

  const expiresAt = new Date(Date.now() + SIGN_TTL_SEC * 1000).toISOString()
  return jsonResponse({
    url: signed.signedUrl,
    path,
    expiresAt,
    ttlSec: SIGN_TTL_SEC,
  })
})
