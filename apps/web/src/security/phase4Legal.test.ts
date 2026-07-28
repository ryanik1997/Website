import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(__dirname, '../../../..')

describe('Phase 4 legal protections', () => {
  it('publishes Terms and Privacy routes with an all-rights-reserved footer', () => {
    const app = readFileSync(resolve(root, 'apps/web/src/App.tsx'), 'utf8')
    const footer = readFileSync(
      resolve(root, 'apps/web/src/components/LegalFooter.tsx'),
      'utf8',
    )
    expect(app).toContain('path="/terms"')
    expect(app).toContain('path="/privacy"')
    expect(footer).toContain('© 2026 Ryan English. All rights reserved.')
  })

  it('stores versioned consent through an authenticated server function', () => {
    const migration = readFileSync(
      resolve(root, 'supabase/migrations/022_legal_consent.sql'),
      'utf8',
    )
    expect(migration).toContain('terms_accepted_at')
    expect(migration).toContain('privacy_accepted_at')
    expect(migration).toContain('security definer')
    expect(migration).toContain('grant execute on function public.accept_legal_terms')
  })

  it('requires consent in signup and persists it with or without an immediate session', () => {
    const login = readFileSync(resolve(root, 'apps/web/src/features/auth/LoginPage.tsx'), 'utf8')
    const auth = readFileSync(resolve(root, 'apps/web/src/features/auth/AuthContext.tsx'), 'utf8')
    const migration = readFileSync(
      resolve(root, 'supabase/migrations/024_signup_consent_and_security_email.sql'),
      'utf8',
    )
    expect(login).toContain('<TermsConsentCheckbox')
    expect(login).toContain("mode === 'signup' && !legalConsent")
    expect(auth).toContain('supabase.auth.signUp')
    expect(auth).toContain('legal_consent_version: LEGAL_TERMS_VERSION')
    expect(migration).toContain("new.raw_user_meta_data->>'legal_consent_version'")
    expect(migration).toContain('terms_accepted_at')
  })
})
