import { describe, expect, it } from 'vitest'
import type { User } from '@supabase/supabase-js'
import { avatarInitial, resolveAuthAvatarUrl, resolveAuthDisplayName } from './userAvatar'

function authUser(
  user_metadata: Record<string, unknown>,
  identities?: Array<{ identity_data?: Record<string, unknown> }>,
): User {
  return {
    id: 'user-1',
    email: 'learner@example.com',
    user_metadata,
    identities: identities as User['identities'],
  } as unknown as User
}

describe('resolveAuthAvatarUrl', () => {
  it('reads picture when avatar_url missing', () => {
    expect(resolveAuthAvatarUrl(authUser({ picture: 'https://img/a.jpg' }))).toBe(
      'https://img/a.jpg',
    )
  })

  it('prefers avatar_url over picture', () => {
    expect(
      resolveAuthAvatarUrl(
        authUser({ avatar_url: 'https://img/a.jpg', picture: 'https://img/b.jpg' }),
      ),
    ).toBe('https://img/a.jpg')
  })

  it('falls back to identity_data.picture', () => {
    expect(
      resolveAuthAvatarUrl(authUser({}, [{ identity_data: { picture: 'https://img/id.jpg' } }])),
    ).toBe('https://img/id.jpg')
  })
})

describe('resolveAuthDisplayName / avatarInitial', () => {
  it('uses full_name then email', () => {
    expect(resolveAuthDisplayName(authUser({ full_name: 'Ryan' }))).toBe('Ryan')
    expect(resolveAuthDisplayName(authUser({}))).toBe('learner@example.com')
  })

  it('initial is uppercase first char', () => {
    expect(avatarInitial('ryan')).toBe('R')
    expect(avatarInitial('')).toBe('?')
  })
})
