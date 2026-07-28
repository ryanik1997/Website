import { supabase } from '../../lib/supabase'

export const LEGAL_TERMS_VERSION = '2026-07-16'
const PENDING_CONSENT_KEY = 'ryan_pending_legal_consent_version'

export function rememberPendingLegalConsent(version = LEGAL_TERMS_VERSION) {
  window.localStorage.setItem(PENDING_CONSENT_KEY, version)
}

export function forgetPendingLegalConsent() {
  window.localStorage.removeItem(PENDING_CONSENT_KEY)
}

export async function recordPendingLegalConsent() {
  const version = window.localStorage.getItem(PENDING_CONSENT_KEY)
  if (!version) return
  const { error } = await supabase.rpc('accept_legal_terms', { version })
  if (error) throw error
  forgetPendingLegalConsent()
}
