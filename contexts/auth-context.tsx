"use client"

import * as React from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { ensureProfile } from "@/lib/supabase-api"
import { clearAllData } from "@/lib/storage"

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: (options?: { redirectTo?: string }) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  isSupabaseConfigured: boolean
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // When user is set, ensure their profile row exists and is filled from Google (full_name)
  React.useEffect(() => {
    if (!user || !isSupabaseConfigured()) return
    const fullName =
      (user.user_metadata?.full_name as string)?.trim() ||
      (user.user_metadata?.name as string)?.trim() ||
      null
    ensureProfile(user.id, fullName).catch(() => {})
  }, [user?.id, user?.user_metadata?.full_name, user?.user_metadata?.name])

  const signInWithGoogle = React.useCallback(
    async (options?: { redirectTo?: string }) => {
      if (!supabase) {
        return { error: new Error("Supabase is not configured.") }
      }
      const redirectTo = options?.redirectTo ?? "/dashboard"
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })
      if (error) return { error }
      if (data?.url) {
        window.location.href = data.url
        return { error: null }
      }
      return { error: new Error("No redirect URL returned.") }
    },
    []
  )

  const signOut = React.useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    clearAllData()
    setUser(null)
    setSession(null)
    if (typeof window !== "undefined") window.location.reload()
  }, [])

  const value: AuthContextValue = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    isSupabaseConfigured: isSupabaseConfigured(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    return {
      user: null,
      session: null,
      loading: false,
      signInWithGoogle: async () => ({ error: new Error("AuthProvider missing") }),
      signOut: async () => {},
      isSupabaseConfigured: isSupabaseConfigured(),
    }
  }
  return ctx
}
