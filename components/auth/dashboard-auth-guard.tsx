"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

// Safe: NODE_ENV is set at build time by Next.js — always "production" in prod builds.
// This can never activate in production regardless of env vars.
const DEV_BYPASS_AUTH =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true"

/**
 * Redirects to /login when Supabase is configured but the user is not signed in.
 * Renders children only when the user is signed in or when auth is not configured.
 * In local dev with NEXT_PUBLIC_DEV_BYPASS_AUTH=true, always renders children.
 * When offline, allows access to cached local data regardless of auth state.
 */
export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isSupabaseConfigured } = useAuth()
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    if (DEV_BYPASS_AUTH) return
    if (loading) return
    // If offline, allow access to cached data regardless of auth state
    if (!isOnline) return
    if (isSupabaseConfigured && !user) {
      router.replace("/login")
      return
    }
  }, [loading, user, isSupabaseConfigured, router, isOnline])

  if (DEV_BYPASS_AUTH) return <>{children}</>

  // Allow offline access even without auth — data is all in localStorage
  if (!isOnline) return <>{children}</>

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
