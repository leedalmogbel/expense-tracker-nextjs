import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// In-memory rate limiter: 5 invites per user per hour
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 503 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Validate auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting
    const now = Date.now()
    const entry = rateLimitMap.get(user.id)
    if (entry && now < entry.resetAt) {
      if (entry.count >= RATE_LIMIT) {
        return NextResponse.json({ error: "Too many invitations. Try again later." }, { status: 429 })
      }
      entry.count++
    } else {
      rateLimitMap.set(user.id, { count: 1, resetAt: now + RATE_WINDOW_MS })
    }

    const body = await request.json()
    const { email, inviteId, inviterName } = body

    // Input validation
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    if (!inviteId || typeof inviteId !== "string" || !UUID_REGEX.test(inviteId)) {
      return NextResponse.json({ error: "Invalid invitation" }, { status: 400 })
    }
    const safeName = typeof inviterName === "string" ? inviterName.slice(0, 100) : "Someone"

    // Look up household name from invite
    const { data: invite } = await supabase
      .from("household_invites")
      .select("household_id, households(name)")
      .eq("id", inviteId)
      .single()

    const householdName = (invite?.households as { name: string } | null)?.name || "a household"

    // Build invite link with validated origin
    const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000"].filter(Boolean)
    const requestOrigin = request.headers.get("origin")
    const baseUrl = allowedOrigins.includes(requestOrigin ?? "")
      ? requestOrigin!
      : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    const inviteLink = `${baseUrl}/auth/invite?id=${inviteId}`

    const { error } = await resend.emails.send({
      from: "Dosh Mate <onboarding@resend.dev>",
      to: [email],
      subject: `You've been invited to ${householdName} on Dosh Mate`,
      html: buildInviteEmailHtml({
        inviterName: safeName,
        householdName,
        inviteLink,
      }),
    })

    if (error) {
      console.error("[api/invites/send] Resend error:", error)
      return NextResponse.json({ error: "Failed to send invitation email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/invites/send] Unexpected error:", err)
    return NextResponse.json({ error: "Failed to send invitation email" }, { status: 500 })
  }
}

function buildInviteEmailHtml(params: {
  inviterName: string
  householdName: string
  inviteLink: string
}): string {
  const { inviterName, householdName, inviteLink } = params
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <h2 style="color: #111; margin-bottom: 16px;">You've been invited!</h2>
      <p style="color: #555; font-size: 15px; line-height: 1.6;">
        <strong>${escapeHtml(inviterName)}</strong> has invited you to join
        <strong>${escapeHtml(householdName)}</strong> on Dosh Mate to collaborate on household expenses.
      </p>
      <a href="${escapeHtml(inviteLink)}"
         style="display: inline-block; margin-top: 24px; padding: 12px 28px; background-color: #16a34a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
        Accept Invitation
      </a>
      <p style="color: #888; font-size: 13px; margin-top: 32px;">
        Or copy and paste this link into your browser:<br/>
        <a href="${escapeHtml(inviteLink)}" style="color: #16a34a;">${escapeHtml(inviteLink)}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin-top: 32px;" />
      <p style="color: #aaa; font-size: 12px; margin-top: 16px;">
        If you didn't expect this invitation, you can safely ignore this email.
      </p>
    </div>
  `
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
