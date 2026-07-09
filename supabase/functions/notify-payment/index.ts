import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentBody {
  planId?: string
  price?: string
  /** Ignored for identity — kept optional for older clients */
  userId?: string
  userEmail?: string
  userName?: string
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildEmailHtml(opts: {
  userName: string
  userEmail: string
  planId: string
  price: string
  adminLink: string
  requestedAt: string
}): string {
  const userName = escapeHtml(opts.userName)
  const userEmail = escapeHtml(opts.userEmail)
  const planId = escapeHtml(opts.planId)
  const price = escapeHtml(opts.price)
  const requestedAt = escapeHtml(opts.requestedAt)
  const adminLink = escapeHtml(opts.adminLink)
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#f5f5f7;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e5e5ea;overflow:hidden;">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;">
      <h1 style="margin:0;font-size:20px;">Ryan English</h1>
      <p style="margin:8px 0 0;opacity:0.9;font-size:14px;">Yêu cầu kích hoạt gói mới</p>
    </div>
    <div style="padding:28px;color:#1d1d1f;font-size:15px;line-height:1.6;">
      <p style="margin:0 0 16px;">Có người dùng vừa báo đã chuyển tiền:</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:8px 0;color:#6e6e73;">Tên</td><td style="padding:8px 0;font-weight:600;">${userName}</td></tr>
        <tr><td style="padding:8px 0;color:#6e6e73;">Email</td><td style="padding:8px 0;font-weight:600;">${userEmail}</td></tr>
        <tr><td style="padding:8px 0;color:#6e6e73;">Gói</td><td style="padding:8px 0;font-weight:600;">${planId}</td></tr>
        <tr><td style="padding:8px 0;color:#6e6e73;">Giá</td><td style="padding:8px 0;font-weight:600;">${price}</td></tr>
        <tr><td style="padding:8px 0;color:#6e6e73;">Thời gian</td><td style="padding:8px 0;">${requestedAt}</td></tr>
      </table>
      <a href="${adminLink}"
         style="display:inline-block;padding:14px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">
        Kích hoạt ngay
      </a>
    </div>
  </div>
</body>
</html>`
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
  if (!jwt) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  // Reject treating public anon key as "auth"
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (jwt === anonKey || jwt === serviceKey) {
    return jsonResponse({ error: 'Unauthorized — user session required' }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseAnon = anonKey
  if (!supabaseUrl || !supabaseAnon) {
    return jsonResponse({ error: 'Server misconfigured' }, 500)
  }

  // Validate JWT as a real user (not anon/service impersonation via key equality)
  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  })
  const { data: userData, error: userError } = await userClient.auth.getUser(jwt)
  if (userError || !userData.user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const user = userData.user
  const userId = user.id
  const userEmail = user.email ?? ''
  if (!userEmail) {
    return jsonResponse({ error: 'User email missing' }, 400)
  }

  let body: PaymentBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const planId = typeof body.planId === 'string' ? body.planId.trim() : ''
  const price = typeof body.price === 'string' ? body.price.trim() : ''
  if (!planId || !price) {
    return jsonResponse({ error: 'Missing required fields' }, 400)
  }

  // Optional body fields ignored for identity; display name from JWT metadata only
  const metaName = (user.user_metadata?.full_name as string | undefined)?.trim()
  const userName = metaName || userEmail

  const admin = createClient(
    supabaseUrl,
    serviceKey,
  )

  const { error: insertError } = await admin.from('payment_requests').insert({
    user_id: userId,
    user_email: userEmail,
    plan_id: planId,
    price,
    status: 'pending',
  })

  if (insertError) {
    return jsonResponse({ error: insertError.message }, 500)
  }

  const resendKey = Deno.env.get('RESEND_API_KEY')
  const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? ''
  const appOrigin = Deno.env.get('APP_ORIGIN') ?? 'https://ryanenglishv2.vercel.app'
  const requestedAt = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
  const adminLink = `${appOrigin}/app/admin?search=${encodeURIComponent(userEmail)}`

  if (resendKey && adminEmail) {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ryan English <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `[Ryan English] Yêu cầu kích hoạt ${planId} — ${userEmail}`,
        html: buildEmailHtml({
          userName,
          userEmail,
          planId,
          price,
          adminLink,
          requestedAt,
        }),
      }),
    })

    if (!emailRes.ok) {
      const errText = await emailRes.text()
      console.error('Resend error:', errText)
      return jsonResponse({ error: 'Failed to send email', detail: errText }, 500)
    }
  } else {
    console.warn('RESEND_API_KEY or ADMIN_EMAIL not set — payment request saved but email skipped')
  }

  return jsonResponse({ ok: true })
})

// Deploy:
// npx supabase functions deploy notify-payment --project-ref ntcagvtkwxwsmlxlumfo
