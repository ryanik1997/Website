import { useEffect, useRef } from 'react'
import { syncLocalToCloud, syncCloudToLocal } from '@ryan/db'
import { supabase } from '../../lib/supabase'
import { useAuth } from './AuthContext'

/**
 * Gọi trong AppShell — chạy sync 1 lần khi user đăng nhập xong.
 * - Thiết bị đã có data local → push lên cloud.
 * - Thiết bị mới (Dexie trống) → pull từ cloud về.
 */
export function useSync() {
  const { user } = useAuth()
  const synced = useRef(false)

  useEffect(() => {
    if (!user || synced.current) return
    synced.current = true

    async function run() {
      const { db } = await import('@ryan/db')
      const localCount = await db.decks.count()
      if (localCount === 0) {
        await syncCloudToLocal(supabase)
      } else {
        await syncLocalToCloud(supabase, user!.id)
      }
    }

    run().catch(console.error)
  }, [user])
}
