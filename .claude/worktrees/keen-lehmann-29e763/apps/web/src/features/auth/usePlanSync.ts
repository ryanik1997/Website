import { useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../../lib/supabase'
import { db } from '@ryan/db'
import type { Plan } from '@ryan/core'

function effectivePlan(plan: string, expiresAt: string | null): Plan {
  if (!expiresAt) return plan as Plan
  if (Date.now() > new Date(expiresAt).getTime()) return 'free'
  return plan as Plan
}

/**
 * Gọi trong AppShell — đọc plan + is_admin từ Supabase sau khi login,
 * lưu vào db.settings để toàn app dùng (canUse, rate limit, admin gate).
 */
export function usePlanSync() {
  const { user } = useAuth()
  const synced = useRef(false)

  useEffect(() => {
    if (!user) { synced.current = false; return }
    if (synced.current) return
    synced.current = true

    supabase
      .from('profiles')
      .select('plan, plan_expires_at, is_admin')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) return
        const plan = effectivePlan(
          (data as { plan: string; plan_expires_at: string | null; is_admin: boolean }).plan ?? 'free',
          (data as { plan: string; plan_expires_at: string | null; is_admin: boolean }).plan_expires_at,
        )
        db.settings.put({ key: 'plan', value: plan })
        db.settings.put({ key: 'plan_expires_at', value: (data as { plan_expires_at: string | null }).plan_expires_at ?? null })
        db.settings.put({ key: 'is_admin', value: (data as { is_admin: boolean }).is_admin ?? false })
      })
  }, [user?.id])
}
