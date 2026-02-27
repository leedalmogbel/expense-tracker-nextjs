"use client"

import { Button } from "@/components/ui/button"
import { Crown, Shield, User, Trash2 } from "lucide-react"

type Member = { user_id: string; role: string; full_name: string | null }

function getRoleIcon(role: string) {
  if (role === "owner") return <Crown className="h-3.5 w-3.5 text-amber-500" />
  if (role === "admin") return <Shield className="h-3.5 w-3.5 text-primary" />
  return <User className="h-3.5 w-3.5 text-muted-foreground" />
}

function getRoleLabel(role: string) {
  if (role === "owner") return "Owner"
  if (role === "admin") return "Admin"
  return "Member"
}

export function MembersList({
  members,
  currentUserId,
  isOwner,
  onRemove,
}: {
  members: Member[]
  currentUserId: string
  isOwner: boolean
  onRemove: (userId: string) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-1">
        Members ({members.length})
      </p>
      <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
        {members.map((m) => (
          <li key={m.user_id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              {getRoleIcon(m.role)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {m.full_name || "Unknown"}
                {m.user_id === currentUserId && (
                  <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{getRoleLabel(m.role)}</p>
            </div>
            {isOwner && m.role !== "owner" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(m.user_id)}
                aria-label={`Remove ${m.full_name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
