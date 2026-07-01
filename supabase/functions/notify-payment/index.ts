import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentBody {
  userId?: string
  userEmail?: string
  userName?: string
  planId?: string
  price?: string
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function isAuthorized(req: Request): boolean {
  const auth = req.headers.get('Authorization') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  return !!token && (token === anonKey || token === serviceKey)
}

function buildEmailHtml(opts: {
  userName: string
  userEmail: string
  planId: string
  price: string
  adminLink: string
  requestedAt: string
}): string {
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
        <tr><td style="padding:8px 0;color:#6e6e73;">Tên</td><td style="padding:8px 0;font-weight:600;">${opts.userName}</td></tr>
        <tr><td style="padding:8px 0;color:#6e6e73;">Email</td><td style="padding:8px 0;font-weight:600;">${opts.userEmail}</td></tr>
        <tr><td style="padding:8px 0;color:#6e6e73;">Gói</td><td style="padding:8px 0;font-weight:600;">${opts.planId}</td></tr>
        <tr><td style="padding:8px 0;color:#6e6e73;">Giá</td><td style="padding:8px 0;font-weight:600;">${opts.price}</td></tr>
        <tr><td style="padding:8px 0;color:#6e6e73;">Thời gian</td><td style="padding:8px 0;">${opts.requestedAt}</td></tr>
      </table>
      <a href="${opts.adminLink}"
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

  if (!isAuthorized(req)) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  let body: PaymentBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const { userId, userEmail, userName, planId, price } = body
  if (!userId || !userEmail || !planId || !price) {
    return jsonResponse({ error: 'Missing required fields' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { error: insertError } = await supabase.from('payment_requests').insert({
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
  const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'ryanik1997@gmail.com'
  const appOrigin = Deno.env.get('APP_ORIGIN') ?? 'https://ryanenglishv2.vercel.app'
  const requestedAt = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
  const adminLink = `${appOrigin}/app/admin?search=${encodeURIComponent(userEmail)}`

  if (resendKey) {
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
          userName: userName || userEmail,
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
    console.warn('RESEND_API_KEY not set — payment request saved but email skipped')
  }

  return jsonResponse({ ok: true })
})

// Deploy:
// npx supabase functions deploy notify-payment --project-ref ntcagvtkwxwsmlxlumfo
// Sau đó vào Supabase Dashboard → Edge Functions → notify-payment → Secrets:
// Thêm RESEND_API_KEY và ADMIN_EMAIL
// (Tuỳ chọn) APP_ORIGIN=https://ryanenglishv2.vercel.app