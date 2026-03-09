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
    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || searchParams.get("offset") || "1", 10)
    )
    const offset = (page - 1) * limit
    const search = searchParams.get("search")?.trim() || ""

    // Build query: profiles left-joined with subscriptions
    // Note: email is not on profiles table — it's on auth.users
    let query = supabase
      .from("profiles")
      .select(
        "id, full_name, role, is_active, created_at, last_active_at, subscriptions(plan, source)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply search filter on full_name
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
    const total = count ?? 0
    const formattedUsers = (users || []).map((u: Record<string, unknown>) => {
      const subscription = Array.isArray(u.subscriptions)
        ? u.subscriptions[0]
        : u.subscriptions
      return {
        id: u.id,
        full_name: u.full_name,
        email: null, // email not stored on profiles; would need auth.admin API
        role: u.role,
        is_active: u.is_active,
        created_at: u.created_at,
        last_active: u.last_active_at ?? null,
        plan: (subscription as Record<string, unknown>)?.plan ?? "free",
        source: (subscription as Record<string, unknown>)?.source ?? null,
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
