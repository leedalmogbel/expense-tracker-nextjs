import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const VALID_ACTIONS = [
  "grant_premium",
  "revoke_premium",
  "deactivate",
  "reactivate",
] as const

type Action = (typeof VALID_ACTIONS)[number]

const ACTION_RPC_MAP: Record<
  Action,
  { rpc: string; params: (adminId: string, targetId: string) => Record<string, string> }
> = {
  grant_premium: {
    rpc: "admin_grant_premium",
    params: (adminId, targetId) => ({
      p_admin_id: adminId,
      p_target_user_id: targetId,
      p_source: "manual",
    }),
  },
  revoke_premium: {
    rpc: "admin_revoke_premium",
    params: (adminId, targetId) => ({
      p_admin_id: adminId,
      p_target_user_id: targetId,
    }),
  },
  deactivate: {
    rpc: "admin_deactivate_user",
    params: (adminId, targetId) => ({
      p_admin_id: adminId,
      p_target_user_id: targetId,
    }),
  },
  reactivate: {
    rpc: "admin_reactivate_user",
    params: (adminId, targetId) => ({
      p_admin_id: adminId,
      p_target_user_id: targetId,
    }),
  },
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: targetUserId } = await params
    const body = await request.json()
    const { action } = body as { action: string }

    // Validate action
    if (!action || !VALID_ACTIONS.includes(action as Action)) {
      return NextResponse.json(
        {
          error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}`,
        },
        { status: 400 }
      )
    }

    // Prevent self-deactivation
    if (action === "deactivate" && targetUserId === user.id) {
      return NextResponse.json(
        { error: "Cannot deactivate your own account" },
        { status: 400 }
      )
    }

    const actionConfig = ACTION_RPC_MAP[action as Action]
    const rpcParams = actionConfig.params(user.id, targetUserId)

    const { error: rpcError } = await supabase.rpc(actionConfig.rpc, rpcParams)

    if (rpcError) {
      console.error(
        `[api/admin/users/${targetUserId}] RPC ${actionConfig.rpc} error:`,
        rpcError
      )
      return NextResponse.json(
        { error: rpcError.message || "Failed to perform action" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/admin/users/[id]] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
