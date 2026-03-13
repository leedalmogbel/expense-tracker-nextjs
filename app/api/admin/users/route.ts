import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response
    const { supabase } = auth

    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
      100
    )
    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || searchParams.get("offset") || "1", 10)
    )
    const offset = (page - 1) * limit
    const search = searchParams.get("search")?.trim() || ""

    // Fetch profiles (no join — subscriptions.user_id references auth.users, not profiles)
    let query = supabase
      .from("profiles")
      .select("id, full_name, role, is_active, created_at, last_active_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.ilike("full_name", `%${search}%`)
    }

    const { data: users, count, error: queryError } = await query

    if (queryError) {
      console.error("[api/admin/users] Query error:", queryError)
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      )
    }

    // Fetch subscriptions for all returned user IDs
    const userIds = (users || []).map(
      (u: Record<string, unknown>) => u.id as string
    )
    let subMap: Record<string, { plan: string; source: string | null }> = {}
    if (userIds.length > 0) {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("user_id, plan, source")
        .in("user_id", userIds)
      if (subs) {
        subMap = Object.fromEntries(
          subs.map((s: Record<string, unknown>) => [
            s.user_id,
            { plan: s.plan as string, source: (s.source as string) ?? null },
          ])
        )
      }
    }

    const total = count ?? 0
    const formattedUsers = (users || []).map((u: Record<string, unknown>) => {
      const sub = subMap[u.id as string]
      return {
        id: u.id,
        full_name: u.full_name,
        email: null,
        role: u.role,
        is_active: u.is_active,
        created_at: u.created_at,
        last_active: u.last_active_at ?? null,
        plan: sub?.plan ?? "free",
        source: sub?.source ?? null,
      }
    })

    return NextResponse.json({
      users: formattedUsers,
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    })
  } catch (err) {
    console.error("[api/admin/users] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
