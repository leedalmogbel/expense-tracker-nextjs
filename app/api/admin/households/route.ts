import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    // Fetch households with owner profile name and member count
    const { data: households, error: queryError } = await supabase
      .from("households")
      .select(
        "id, name, created_at, owner_id, profiles!households_owner_id_fkey(full_name), household_members(count)"
      )
      .order("created_at", { ascending: false })

    if (queryError) {
      console.error("[api/admin/households] Query error:", queryError)
      return NextResponse.json(
        { error: "Failed to fetch households" },
        { status: 500 }
      )
    }

    // Flatten the response for cleaner output
    const formattedHouseholds = (households || []).map(
      (h: Record<string, unknown>) => {
        const ownerProfile = h.profiles as Record<string, unknown> | null
        const memberCountArr = h.household_members as
          | { count: number }[]
          | null
        return {
          id: h.id,
          name: h.name,
          created_at: h.created_at,
          owner_id: h.owner_id,
          owner_name: ownerProfile?.full_name ?? null,
          member_count: memberCountArr?.[0]?.count ?? 0,
        }
      }
    )

    return NextResponse.json({ households: formattedHouseholds })
  } catch (err) {
    console.error("[api/admin/households] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
