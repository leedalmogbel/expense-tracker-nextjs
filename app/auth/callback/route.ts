import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_REDIRECT_PREFIXES = ["/dashboard", "/auth/invite"]

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const nextPath = ALLOWED_REDIRECT_PREFIXES.some(
    (p) => next === p || next.startsWith(p + "/") || next.startsWith(p + "?")
  )
    ? next
    : "/dashboard"

  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "http"
  const isLocalEnv = process.env.NODE_ENV === "development"
  const baseUrl = !isLocalEnv && forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession error:", error.message)
    }
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${nextPath}`)
    }
  }

  return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`)
}
