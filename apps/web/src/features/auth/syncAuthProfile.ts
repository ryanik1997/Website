import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

type AuthMetadata = Record<string, unknown>

function metadataText(metadata: AuthMetadata, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = metadata[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

export function profileFieldsFromAuthUser(user: User) {
  const metadata = user.user_metadata as AuthMetadata
  return {
    id: user.id,
    email: user.email ?? metadataText(metadata, 'email') ?? '',
    display_name: metadataText(metadata, 'full_name', 'name', 'display_name'),
    avatar_url: metadataText(metadata, 'avatar_url', 'picture'),
  }
}

/** Keep the public profile used by Admin in sync with the latest Auth metadata. */
export async function syncAuthProfile(user: User): Promise<void> {
  const profile = profileFieldsFromAuthUser(user)
  if (!profile.email) return
  const payload = {
    id: profile.id,
    email: profile.email,
    ...(profile.display_name ? { display_name: profile.display_name } : {}),
    ...(profile.avatar_url ? { avatar_url: profile.avatar_url } : {}),
  }

  // database.types.ts can lag behind SQL migrations in this project.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })

  if (error) throw error
}
