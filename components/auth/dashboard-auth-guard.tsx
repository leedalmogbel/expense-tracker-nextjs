"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

/**
 * Redirects to /login when Supabase is configured but the user is not signed in.
 * Renders children only when the user is signed in or when auth is not configured (no guest access when auth exists).
 */
export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isSupabaseConfigured } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (isSupabaseConfigured && !user) {
      router.replace("/login")
      return
    }
  }, [loading, user, isSupabaseConfigured, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isSupabaseConfigured && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
