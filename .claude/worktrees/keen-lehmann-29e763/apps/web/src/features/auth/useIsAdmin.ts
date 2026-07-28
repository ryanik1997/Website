import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@ryan/db'

/** Admin flag synced từ Supabase profiles → Dexie settings (usePlanSync). */
export function useIsAdmin(): boolean | undefined {
  return useLiveQuery(
    () => db.settings.get('is_admin').then(s => s?.value as boolean | undefined),
    [],
  )
}