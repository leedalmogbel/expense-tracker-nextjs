import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response
    const { supabase } = auth

    // Fetch all promo codes ordered by created_at desc
    const { data: promoCodes, error: queryError } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false })

    if (queryError) {
      console.error("[api/admin/promo-codes] Query error:", queryError)
      return NextResponse.json(
        { error: "Failed to fetch promo codes" },
        { status: 500 }
      )
    }

    return NextResponse.json({ promo_codes: promoCodes })
  } catch (err) {
    console.error("[api/admin/promo-codes] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response
    const { userId, supabase } = auth

    const body = await request.json()
    const { code, description, max_uses, duration_days, expires_at } = body

    // Validate required fields
    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Promo code is required" },
        { status: 400 }
      )
    }

    // Insert new promo code
    const { data: promoCode, error: insertError } = await supabase
      .from("promo_codes")
      .insert({
        code: code.trim().toUpperCase(),
        description: description || null,
        max_uses: max_uses ?? null,
        duration_days: duration_days ?? null,
        expires_at: expires_at || null,
        created_by: userId,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[api/admin/promo-codes] Insert error:", insertError)

      // Handle unique constraint violation
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "A promo code with this code already exists" },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: "Failed to create promo code" },
        { status: 500 }
      )
    }

    return NextResponse.json({ promo_code: promoCode }, { status: 201 })
  } catch (err) {
    console.error("[api/admin/promo-codes] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
