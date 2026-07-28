import { describe, expect, it } from 'vitest'
import type { User } from '@supabase/supabase-js'
import { profileFieldsFromAuthUser } from './syncAuthProfile'

function authUser(user_metadata: Record<string, unknown>): User {
  return {
    id: 'user-1',
    email: 'learner@example.com',
    user_metadata,
  } as unknown as User
}

describe('profileFieldsFromAuthUser', () => {
  it('uses the Google picture field when avatar_url is absent', () => {
    expect(profileFieldsFromAuthUser(authUser({
      name: 'Ryan Learner',
      picture: 'https://example.com/google-avatar.jpg',
    }))).toEqual({
      id: 'user-1',
      email: 'learner@example.com',
      display_name: 'Ryan Learner',
      avatar_url: 'https://example.com/google-avatar.jpg',
    })
  })

  it('prefers explicit profile fields over provider aliases', () => {
    expect(profileFieldsFromAuthUser(authUser({
      full_name: 'Preferred Name',
      name: 'Provider Name',
      avatar_url: 'https://example.com/avatar.jpg',
      picture: 'https://example.com/picture.jpg',
    }))).toMatchObject({
      display_name: 'Preferred Name',
      avatar_url: 'https://example.com/avatar.jpg',
    })
  })
})
