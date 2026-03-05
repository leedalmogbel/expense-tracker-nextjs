import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

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

    const body = await request.json()
    const { email, inviteId, inviterName } = body

    if (!email || !inviteId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Look up household name from invite
    const { data: invite } = await supabase
      .from("household_invites")
      .select("household_id, households(name)")
      .eq("id", inviteId)
      .single()

    const householdName = (invite?.households as { name: string } | null)?.name || "a household"

    // Build invite link
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000"
    const inviteLink = `${baseUrl}/auth/invite?id=${inviteId}`

    const { error } = await resend.emails.send({
      from: "Dosh Mate <onboarding@resend.dev>",
      to: [email],
      subject: `You've been invited to ${householdName} on Dosh Mate`,
      html: buildInviteEmailHtml({
        inviterName: inviterName || "Someone",
        householdName,
        inviteLink,
      }),
    })

    if (error) {
      console.error("[api/invites/send] Resend error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
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
