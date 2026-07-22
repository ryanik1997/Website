import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { clearLocalUserData, ensureLocalUserIsolation } from '@ryan/db'
import { supabase } from '../../lib/supabase'
import { hasOAuthCallbackInUrl, recoverOAuthSession } from './recoverOAuthSession'

interface AuthCtx {
  session: Session | null
  user: User | null
  loading: boolean
  authError: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

function AuthLoading() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
      <div
        className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
      />
    </div>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const recoveringRef = useRef(false)

  const isolateForUser = useCallback(async (userId: string | undefined) => {
    if (!userId) return
    try {
      await ensureLocalUserIsolation(userId)
    } catch (err) {
      console.error('[auth] ensureLocalUserIsolation failed', err)
    }
  }, [])

  const bootstrap = useCallback(async () => {
    recoveringRef.current = true
    setLoading(true)
    try {
      if (hasOAuthCallbackInUrl()) {
        await recoverOAuthSession()
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Lỗi xác thực OAuth')
    }

    const { data: { session: s } } = await supabase.auth.getSession()
    if (s?.user?.id) {
      await isolateForUser(s.user.id)
    }
    setSession(s)
    recoveringRef.current = false
    setLoading(false)
  }, [isolateForUser])

  useEffect(() => {
    bootstrap()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      void (async () => {
        if (event === 'SIGNED_IN' && s?.user?.id) {
          await isolateForUser(s.user.id)
          setAuthError(null)
        }
        if (event === 'SIGNED_OUT') {
          try {
            await clearLocalUserData()
          } catch (err) {
            console.error('[auth] clearLocalUserData on SIGNED_OUT failed', err)
          }
        }
        setSession(s)
        if (!recoveringRef.current) setLoading(false)
      })()
    })

    const onHashChange = () => {
      if (hasOAuthCallbackInUrl()) bootstrap()
    }
    window.addEventListener('hashchange', onHashChange)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [bootstrap, isolateForUser])

  const signInWithGoogle = async () => {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Luon quay ve callback cung origin hien tai de localhost va production dung chung.
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    })
    if (error) setAuthError(error.message)
  }

  const signOut = async () => {
    try {
      await clearLocalUserData()
    } catch (err) {
      console.error('[auth] clearLocalUserData on signOut failed', err)
    }
    await supabase.auth.signOut()
    window.location.replace(`${window.location.origin}/`)
  }

  return (
    <Ctx.Provider value={{
      session,
      user: session?.user ?? null,
      loading,
      authError,
      signInWithGoogle,
      signOut,
    }}>
      {loading ? <AuthLoading /> : children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>')
  return ctx
}
