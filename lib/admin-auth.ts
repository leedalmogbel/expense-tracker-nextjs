import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

const DEV_BYPASS_AUTH =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true"

type AdminAuthResult =
  | { authorized: true; userId: string; supabase: SupabaseClient }
  | { authorized: false; response: NextResponse }

/**
 * Creates a Supabase client with service role key (bypasses RLS).
 * Falls back to the normal server client if service role key is not set.
 */
function createServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null
  return createSupabaseClient(url, serviceRoleKey)
}

/**
 * Shared admin auth check for all admin API routes.
 * In dev bypass mode, skips auth/superadmin checks.
 * Uses service role client when available to bypass RLS for admin queries.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  if (DEV_BYPASS_AUTH) {
    // Use service role client if available (bypasses RLS), otherwise fallback to anon
    const serviceClient = createServiceRoleClient()
    const supabase = serviceClient ?? (await createClient())
    return { authorized: true, userId: "dev-local-user", supabase }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "superadmin") {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { authorized: true, userId: user.id, supabase }
}
