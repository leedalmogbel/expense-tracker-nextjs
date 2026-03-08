"use client"

import { useEffect, useState } from "react"
import { AdminStats } from "@/components/admin/admin-stats"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

type Stats = {
  totalUsers: number
  premiumUsers: number
  freeUsers: number
  earlyAdopterSlotsUsed: number
  earlyAdopterSlotsRemaining: number
  activeUsers: number
  inactiveUsers: number
  totalHouseholds: number
  totalTransactions: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load stats")
        return r.json()
      })
      .then((data) => setStats(data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your application.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : stats ? (
        <AdminStats stats={stats} />
      ) : (
        <p className="text-sm text-muted-foreground">Failed to load stats.</p>
      )}
    </div>
  )
}
