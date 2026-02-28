"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import {
  getUserHouseholdId,
  getUserMemberHouseholdId,
  inviteToHousehold,
  getHouseholdInvites,
  getHouseholdMembers,
  revokeInvite,
  removeHouseholdMember,
} from "@/lib/supabase-api"
import { Select, SelectItem } from "@/components/ui/select"
import { toast } from "sonner"
import { Users, Crown, Shield, User, Copy, Check, Trash2, Loader2, Mail, UserPlus } from "lucide-react"

type Member = { user_id: string; role: string; full_name: string | null }
type Invite = { id: string; email: string; role: string; status: string; created_at: string }

export function HouseholdSettings() {
  const { user } = useAuth()
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member")
  const [inviting, setInviting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Check if user is owner
    const { householdId: ownedId } = await getUserHouseholdId(user.id)
    let hId = ownedId
    let owner = !!ownedId

    // If not owner, check if member of any household
    if (!hId) {
      const { householdId: memberId } = await getUserMemberHouseholdId(user.id)
      hId = memberId
      owner = false
    }

    if (!hId) {
      setLoading(false)
      return
    }

    setHouseholdId(hId)
    setIsOwner(owner)

    const [membersRes, invitesRes] = await Promise.all([
      getHouseholdMembers(hId),
      owner ? getHouseholdInvites(hId) : Promise.resolve({ invites: [] as Invite[], error: null }),
    ])

    setMembers(membersRes.members)
    setInvites(invitesRes.invites.filter((i) => i.status === "pending"))
    setLoading(false)
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleInvite = async () => {
    if (!householdId || !inviteEmail.trim()) return
    setInviting(true)
    const actorName = user?.user_metadata?.full_name ?? user?.email ?? undefined
    const { inviteId, error } = await inviteToHousehold(householdId, inviteEmail, inviteRole, actorName)
    setInviting(false)
    if (error || !inviteId) {
      toast.error("Invite failed", { description: error ?? "Something went wrong" })
      return
    }

    // Build link and copy to clipboard
    const link = `${window.location.origin}/auth/invite?id=${inviteId}`
    await navigator.clipboard.writeText(link)
    setCopiedId(inviteId)
    setTimeout(() => setCopiedId(null), 3000)

    toast.success("Invite created", { description: `Link copied for ${inviteEmail.trim()}` })
    setInviteEmail("")
    loadData()
  }

  const handleCopyLink = async (invite: Invite) => {
    const link = `${window.location.origin}/auth/invite?id=${invite.id}`
    await navigator.clipboard.writeText(link)
    setCopiedId(invite.id)
    setTimeout(() => setCopiedId(null), 3000)
  }

  const handleRevoke = async (inviteId: string) => {
    await revokeInvite(inviteId)
    toast.success("Invite revoked")
    loadData()
  }

  const handleRemoveMember = async (userId: string) => {
    if (!householdId) return
    const member = members.find((m) => m.user_id === userId)
    await removeHouseholdMember(householdId, userId)
    toast.success("Member removed", { description: member?.full_name ?? undefined })
    loadData()
  }

  const getRoleIcon = (role: string) => {
    if (role === "owner") return <Crown className="h-3.5 w-3.5 text-amber-500" />
    if (role === "admin") return <Shield className="h-3.5 w-3.5 text-primary" />
    return <User className="h-3.5 w-3.5 text-muted-foreground" />
  }

  const getRoleLabel = (role: string) => {
    if (role === "owner") return "Owner"
    if (role === "admin") return "Admin"
    return "Member"
  }

  if (!user || loading) {
    if (loading && user) {
      return (
        <Card className="border-border shadow-sm">
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )
    }
    return null
  }

  if (!householdId) return null

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="font-heading text-lg font-semibold">Household</CardTitle>
            <CardDescription>
              {isOwner
                ? "Manage members and invite others to collaborate."
                : "You are a member of this household."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {/* Members list */}
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
                    {m.user_id === user.id && (
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
                    onClick={() => handleRemoveMember(m.user_id)}
                    aria-label={`Remove ${m.full_name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Invite form (owner only) */}
        {isOwner && (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-1 flex items-center gap-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              Invite someone
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
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
                selectedKeys={[inviteRole]}
                onSelectionChange={(keys) => {
                  const v = Array.from(keys)[0]
                  if (v === "member" || v === "admin") setInviteRole(v)
                }}
              >
                <SelectItem key="member">Member</SelectItem>
                <SelectItem key="admin">Admin</SelectItem>
              </Select>
              <Button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="h-10 gap-1.5 rounded-lg px-4"
              >
                {inviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Create Invite
              </Button>
            </div>
            {copiedId && !invites.some((i) => i.id === copiedId) && (
              <p className="flex items-center gap-1.5 text-xs text-primary">
                <Check className="h-3.5 w-3.5" />
                Invite link copied to clipboard!
              </p>
            )}
          </div>
        )}

        {/* Pending invites (owner only) */}
        {isOwner && invites.length > 0 && (
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
        )}
      </CardContent>
    </Card>
  )
}
