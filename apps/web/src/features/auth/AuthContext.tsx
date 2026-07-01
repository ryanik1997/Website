import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
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
    setSession(s)
    recoveringRef.current = false
    setLoading(false)
  }, [])

  useEffect(() => {
    bootstrap()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (!recoveringRef.current) setLoading(false)
      if (event === 'SIGNED_IN') setAuthError(null)
    })

    const onHashChange = () => {
      if (hasOAuthCallbackInUrl()) bootstrap()
    }
    window.addEventListener('hashchange', onHashChange)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [bootstrap])

  const signInWithGoogle = async () => {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname || '/'}`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    })
    if (error) setAuthError(error.message)
  }

  const signOut = async () => {
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