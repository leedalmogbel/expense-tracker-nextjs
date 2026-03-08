import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
      100
    )
    const offset = Math.max(
      0,
      parseInt(searchParams.get("offset") || "0", 10)
    )
    const search = searchParams.get("search")?.trim() || ""

    // Build query: profiles left-joined with subscriptions
    let query = supabase
      .from("profiles")
      .select(
        "id, full_name, role, is_active, last_active_at, subscriptions(plan, source)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply search filter on full_name if provided
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

    // Flatten the subscription join into the user object
    const formattedUsers = (users || []).map((u: Record<string, unknown>) => {
      const subscription = Array.isArray(u.subscriptions)
        ? u.subscriptions[0]
        : u.subscriptions
      return {
        id: u.id,
        full_name: u.full_name,
        role: u.role,
        is_active: u.is_active,
        last_active_at: u.last_active_at,
        plan: (subscription as Record<string, unknown>)?.plan ?? "free",
        source: (subscription as Record<string, unknown>)?.source ?? null,
      }
    })

    return NextResponse.json({
      users: formattedUsers,
      total: count ?? 0,
      limit,
      offset,
    })
  } catch (err) {
    console.error("[api/admin/users] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
