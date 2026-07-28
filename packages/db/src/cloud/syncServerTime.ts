import type { SupabaseClient } from '@supabase/supabase-js'

export type SyncServerTime = {
  iso: string
  authoritative: boolean
}

export function isMissingSyncSchemaError(error: { code?: string; message: string } | null): boolean {
  if (!error) return false
  const message = error.message.toLowerCase()
  return error.code === 'PGRST202'
    || message.includes('could not find the function public.sync_server_time')
    || (message.includes('sync_server_time') && message.includes('schema cache'))
}

export async function getSyncServerTime(
  supabase: SupabaseClient,
  fallbackIso = new Date().toISOString(),
): Promise<SyncServerTime> {
  const result = await supabase.rpc('sync_server_time')
  if (isMissingSyncSchemaError(result.error)) {
    return { iso: fallbackIso, authoritative: false }
  }
  if (result.error) throw new Error(`sync_server_time: ${result.error.message}`)
  return {
    iso: typeof result.data === 'string' ? result.data : fallbackIso,
    authoritative: typeof result.data === 'string',
  }
}
