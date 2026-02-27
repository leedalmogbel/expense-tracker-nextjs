import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const nextPath = next.startsWith("/") ? next : "/dashboard"

  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "http"
  const isLocalEnv = process.env.NODE_ENV === "development"
  const baseUrl = !isLocalEnv && forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${nextPath}`)
    }
  }

  return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`)
}
