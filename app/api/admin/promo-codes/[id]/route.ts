import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response
    const { supabase } = auth

    const { id: promoCodeId } = await params
    const body = await request.json()
    const { is_active } = body

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "is_active must be a boolean" },
        { status: 400 }
      )
    }

    const { data: promoCode, error: updateError } = await supabase
      .from("promo_codes")
      .update({ is_active })
      .eq("id", promoCodeId)
      .select()
      .single()

    if (updateError) {
      console.error(
        `[api/admin/promo-codes/${promoCodeId}] Update error:`,
        updateError
      )

      if (updateError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Promo code not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: "Failed to update promo code" },
        { status: 500 }
      )
    }

    return NextResponse.json({ promo_code: promoCode })
  } catch (err) {
    console.error("[api/admin/promo-codes/[id]] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response
    const { supabase } = auth

    const { id: promoCodeId } = await params

    const { error: deleteError } = await supabase
      .from("promo_codes")
      .delete()
      .eq("id", promoCodeId)

    if (deleteError) {
      console.error(
        `[api/admin/promo-codes/${promoCodeId}] Delete error:`,
        deleteError
      )
      return NextResponse.json(
        { error: "Failed to delete promo code" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/admin/promo-codes/[id]] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
