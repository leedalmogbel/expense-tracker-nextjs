import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { EARLY_ADOPTER_LIMIT } from "@/lib/premium-features"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc("get_early_adopter_slots_remaining")

    if (error) {
      return NextResponse.json(
        { remaining: EARLY_ADOPTER_LIMIT, total: EARLY_ADOPTER_LIMIT },
        { status: 200 }
      )
    }

    const remaining = Math.max(0, Math.min(EARLY_ADOPTER_LIMIT, Number(data) || EARLY_ADOPTER_LIMIT))

    return NextResponse.json(
      { remaining, total: EARLY_ADOPTER_LIMIT },
      {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      }
    )
  } catch {
    return NextResponse.json(
      { remaining: EARLY_ADOPTER_LIMIT, total: EARLY_ADOPTER_LIMIT },
      { status: 200 }
    )
  }
}
