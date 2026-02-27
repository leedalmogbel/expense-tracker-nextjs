"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { revokeInvite } from "@/lib/supabase-api"
import { toast } from "sonner"
import { Mail, Copy, Check, Trash2 } from "lucide-react"

type Invite = { id: string; email: string; role: string; status: string; created_at: string }

function getRoleLabel(role: string) {
  if (role === "owner") return "Owner"
  if (role === "admin") return "Admin"
  return "Member"
}

export function PendingInvitesCard({
  invites,
  onChanged,
}: {
  invites: Invite[]
  onChanged: () => void
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyLink = async (invite: Invite) => {
    const link = `${window.location.origin}/auth/invite?id=${invite.id}`
    await navigator.clipboard.writeText(link)
    setCopiedId(invite.id)
    setTimeout(() => setCopiedId(null), 3000)
  }

  const handleRevoke = async (inviteId: string) => {
    await revokeInvite(inviteId)
    toast.success("Invite revoked")
    onChanged()
  }

  if (invites.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-1">
        Pending invites ({invites.length})
      </p>
      <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
        {invites.map((inv) => (
          <li key={inv.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{inv.email}</p>
              <p className="text-xs text-muted-foreground">{getRoleLabel(inv.role)}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleCopyLink(inv)}
                aria-label="Copy invite link"
              >
                {copiedId === inv.id ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRevoke(inv.id)}
                aria-label="Revoke invite"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
