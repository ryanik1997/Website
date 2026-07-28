import type { User } from '@supabase/supabase-js'

type Meta = Record<string, unknown>

function textFrom(obj: Meta | null | undefined, ...keys: string[]): string | null {
  if (!obj) return null
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

/** Avatar URL từ Auth metadata (Google: avatar_url hoặc picture). */
export function resolveAuthAvatarUrl(user: User | null | undefined): string | null {
  if (!user) return null
  const meta = user.user_metadata as Meta
  const fromMeta = textFrom(meta, 'avatar_url', 'picture', 'avatar')
  if (fromMeta) return fromMeta

  const identities = user.identities
  if (Array.isArray(identities)) {
    for (const identity of identities) {
      const data = (identity as { identity_data?: Meta }).identity_data
      const fromIdentity = textFrom(data, 'avatar_url', 'picture', 'avatar')
      if (fromIdentity) return fromIdentity
    }
  }
  return null
}

export function resolveAuthDisplayName(user: User | null | undefined): string {
  if (!user) return 'Người dùng'
  const meta = user.user_metadata as Meta
  return (
    textFrom(meta, 'full_name', 'name', 'display_name')
    ?? user.email
    ?? 'Người dùng'
  )
}

export function avatarInitial(label: string | null | undefined): string {
  const ch = (label ?? '?').trim().charAt(0)
  return (ch || '?').toUpperCase()
}
