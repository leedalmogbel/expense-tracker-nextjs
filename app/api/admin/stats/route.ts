import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { EARLY_ADOPTER_LIMIT } from "@/lib/premium-features"

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Superadmin check
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch all stats in parallel
    const [
      totalUsersResult,
      premiumUsersResult,
      freeUsersResult,
      earlyAdopterResult,
      activeUsersResult,
      inactiveUsersResult,
      totalHouseholdsResult,
      totalTransactionsResult,
    ] = await Promise.all([
      // Total users
      supabase.from("profiles").select("id", { count: "exact", head: true }),

      // Premium users (users with active premium subscriptions)
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("plan", "premium")
        .eq("is_active", true),

      // Free users (users with free plan or no subscription)
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("plan", "free"),

      // Early adopter slots used
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("source", "early_adopter")
        .eq("is_active", true),

      // Active users
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),

      // Inactive users
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_active", false),

      // Total households
      supabase.from("households").select("id", { count: "exact", head: true }),

      // Total transactions
      supabase.from("transactions").select("id", { count: "exact", head: true }),
    ])

    const totalUsers = totalUsersResult.count ?? 0
    const premiumUsers = premiumUsersResult.count ?? 0
    const freeUsers = freeUsersResult.count ?? 0
    const earlyAdopterSlotsUsed = earlyAdopterResult.count ?? 0
    const earlyAdopterSlotsRemaining = Math.max(
      0,
      EARLY_ADOPTER_LIMIT - earlyAdopterSlotsUsed
    )
    const activeUsers = activeUsersResult.count ?? 0
    const inactiveUsers = inactiveUsersResult.count ?? 0
    const totalHouseholds = totalHouseholdsResult.count ?? 0
    const totalTransactions = totalTransactionsResult.count ?? 0

    return NextResponse.json({
      totalUsers,
      premiumUsers,
      freeUsers,
      earlyAdopterSlotsUsed,
      earlyAdopterSlotsRemaining,
      activeUsers,
      inactiveUsers,
      totalHouseholds,
      totalTransactions,
    })
  } catch (err) {
    console.error("[api/admin/stats] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
