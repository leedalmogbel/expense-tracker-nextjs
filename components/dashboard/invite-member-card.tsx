"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectItem } from "@/components/ui/select"
import { inviteToHousehold } from "@/lib/supabase-api"
import { toast } from "sonner"
import { Mail, Loader2, Check, UserPlus } from "lucide-react"

export function InviteMemberCard({
  householdId,
  onInviteCreated,
}: {
  householdId: string
  onInviteCreated: () => void
}) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"member" | "admin">("member")
  const [inviting, setInviting] = useState(false)
  const [justCopied, setJustCopied] = useState(false)

  const handleInvite = async () => {
    if (!email.trim()) return
    setInviting(true)
    const { inviteId, error } = await inviteToHousehold(householdId, email, role)
    setInviting(false)
    if (error || !inviteId) {
      toast.error("Invite failed", { description: error ?? "Something went wrong" })
      return
    }
    const link = `${window.location.origin}/auth/invite?id=${inviteId}`
    await navigator.clipboard.writeText(link)
    setJustCopied(true)
    setTimeout(() => setJustCopied(false), 3000)
    toast.success("Invite created", { description: `Link copied for ${email.trim()}` })
    setEmail("")
    onInviteCreated()
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-1 flex items-center gap-1.5">
        <UserPlus className="h-3.5 w-3.5" />
        Invite someone
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleInvite()
            }
          }}
          className="h-10 w-full max-w-[240px] rounded-lg border border-input bg-background text-sm"
        />
        <Select
          aria-label="Invite role"
          placeholder="Role"
          classNames={{ base: "w-auto min-w-[120px]", trigger: "h-10 min-h-10" }}
          selectedKeys={[role]}
          onSelectionChange={(keys) => {
            const v = Array.from(keys)[0]
            if (v === "member" || v === "admin") setRole(v)
          }}
        >
          <SelectItem key="member">Member</SelectItem>
          <SelectItem key="admin">Admin</SelectItem>
        </Select>
        <Button
          onClick={handleInvite}
          disabled={inviting || !email.trim()}
          className="h-10 gap-1.5 rounded-lg px-4"
        >
          {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Create Invite
        </Button>
      </div>
      {justCopied && (
        <p className="flex items-center gap-1.5 text-xs text-primary">
          <Check className="h-3.5 w-3.5" />
          Invite link copied to clipboard!
        </p>
      )}
    </div>
  )
}
