import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { supabase } from '../../lib/supabase'

type AccessProfile = {
  plan: 'free' | 'trial' | 'basic' | 'pro' | 'lifetime'
  plan_expires_at: string | null
  is_admin: boolean
  suspended_at: string | null
}

const DEV_BYPASS = import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === '1'

function hasProAccess(profile: AccessProfile | null): boolean {
  if (!profile || profile.suspended_at) return false
  if (profile.is_admin || profile.plan === 'lifetime') return true
  return profile.plan === 'pro'
    && (!profile.plan_expires_at || new Date(profile.plan_expires_at).getTime() >= Date.now())
}

/** Blocks all learning/content routes unless the signed-in user has Pro access. */
export default function ProOnlyRoute() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<AccessProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!user) {
      setLoading(false)
      return undefined
    }
    void supabase
      .from('profiles')
      .select('plan, plan_expires_at, is_admin, suspended_at')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) {
          setProfile(data as AccessProfile | null)
          setLoading(false)
        }
      })
    return () => { active = false }
  }, [user])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return DEV_BYPASS || hasProAccess(profile)
    ? <Outlet />
    : <Navigate to="/app/settings?upgrade=pro" replace />
}
