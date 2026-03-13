import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response
    const { supabase } = auth

    // Fetch households with member count
    // Note: households.owner_id references auth.users, not profiles directly,
    // so we fetch owner names separately.
    const { data: households, error: queryError } = await supabase
      .from("households")
      .select("id, name, created_at, owner_id, household_members(count)")
      .order("created_at", { ascending: false })

    if (queryError) {
      console.error("[api/admin/households] Query error:", queryError)
      return NextResponse.json(
        { error: "Failed to fetch households" },
        { status: 500 }
      )
    }

    // Fetch owner profiles for all unique owner_ids
    const ownerIds = [
      ...new Set(
        (households || [])
          .map((h: Record<string, unknown>) => h.owner_id as string)
          .filter(Boolean)
      ),
    ]
    let ownerMap: Record<string, string> = {}
    if (ownerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ownerIds)
      if (profiles) {
        ownerMap = Object.fromEntries(
          profiles.map((p: Record<string, unknown>) => [
            p.id,
            p.full_name ?? null,
          ])
        )
      }
    }

    // Flatten the response for cleaner output
    const formattedHouseholds = (households || []).map(
      (h: Record<string, unknown>) => {
        const memberCountArr = h.household_members as
          | { count: number }[]
          | null
        return {
          id: h.id,
          name: h.name,
          created_at: h.created_at,
          owner_id: h.owner_id,
          owner_name: ownerMap[h.owner_id as string] ?? null,
          owner_email: null,
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
