import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function repoFile(path: string): string {
  return readFileSync(resolve(process.cwd(), '../..', path), 'utf8')
}

describe('security hardening phase 2', () => {
  it('enforces a short signed URL TTL and per-user daily quota', () => {
    const edge = repoFile('supabase/functions/content-sign/index.ts')

    expect(edge).toContain('const SIGN_TTL_SEC = 60')
    expect(edge).toContain('const RATE_MAX_DAILY_USER = 400')
    expect(edge).toContain("code: 'RATE_LIMIT_DAILY'")
    expect(edge).toContain("'claim_content_security_alert_email'")
  })

  it('creates an admin-only alert queue and hourly anomaly scan', () => {
    const migration = repoFile('supabase/migrations/021_content_access_daily_quota.sql')

    expect(migration).toContain('public.content_security_alerts')
    expect(migration).toContain('public.scan_content_access_anomalies')
    expect(migration).toContain('scan-content-access-anomalies-hourly')
    expect(migration).toContain('public.is_current_user_admin() = true')
    expect(migration).not.toMatch(
      /create policy "content_security_alerts[^"]*"\s+[\s\S]*?using\s*\(true\)/,
    )
  })

  it('claims and emails each high-volume alert once per user/day', () => {
    const edge = repoFile('supabase/functions/content-sign/index.ts')
    const migration = repoFile('supabase/migrations/024_signup_consent_and_security_email.sql')
    expect(edge).toContain("'claim_content_security_alert_email'")
    expect(edge).toContain('https://api.resend.com/emails')
    expect(edge).toContain("Deno.env.get('RESEND_API_KEY')")
    expect(migration).toContain('emailClaimedAt')
    expect(migration).toContain('grant execute on function public.claim_content_security_alert_email')
  })
})
