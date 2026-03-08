"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

/**
 * Guards admin routes. Redirects non-superadmin users to /dashboard.
 * Shows a loading spinner while authentication state is being resolved.
 */
export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isSuperadmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user || !isSuperadmin) {
      router.push("/dashboard")
    }
  }, [loading, user, isSuperadmin, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user || !isSuperadmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
