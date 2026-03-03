"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getPendingInvitesForEmail, acceptInvite } from "@/lib/supabase-api"
import { isSupabaseConfigured } from "@/lib/supabase"
import { Users, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type PendingInvite = {
  id: string
  household_id: string
  role: string
  households?: { name: string } | null
}

export function PendingInviteBanner() {
  const { user } = useAuth()
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [accepting, setAccepting] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const loadInvites = useCallback(async () => {
    if (!user?.email || !isSupabaseConfigured()) return
    const { invites: data } = await getPendingInvitesForEmail(user.email)
    setInvites(data)
  }, [user?.email])

  useEffect(() => {
    loadInvites()
  }, [loadInvites])

  const handleAccept = async (invite: PendingInvite) => {
    if (!user) return
    setAccepting(invite.id)
    const { error } = await acceptInvite(invite.id, user.id)
    setAccepting(null)
    if (error) {
      toast.error("Failed to accept invite", { description: error })
      return
    }
    toast.success("Joined household!", {
      description: `You are now a member of ${invite.households?.name ?? "the household"}.`,
    })
    setInvites((prev) => prev.filter((i) => i.id !== invite.id))
    // Reload the page so household data refreshes
    setTimeout(() => window.location.reload(), 1000)
  }

  const handleDismiss = (inviteId: string) => {
    setDismissed((prev) => new Set(prev).add(inviteId))
  }

  const visibleInvites = invites.filter((i) => !dismissed.has(i.id))
  if (visibleInvites.length === 0) return null

  return (
    <div className="space-y-3">
      {visibleInvites.map((invite) => {
        const name = invite.households?.name ?? "a household"
        const isAccepting = accepting === invite.id
        return (
          <div
            key={invite.id}
            className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:px-5 sm:py-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                You&apos;ve been invited to <span className="font-semibold">{name}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Role: <span className="capitalize">{invite.role}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                className="rounded-lg h-9 px-4"
                disabled={isAccepting}
                onClick={() => handleAccept(invite)}
              >
                {isAccepting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
              </Button>
              <button
                type="button"
                onClick={() => handleDismiss(invite.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
