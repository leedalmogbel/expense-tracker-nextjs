"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { isSupabaseConfigured } from "@/lib/supabase"
import {
  getUserHouseholdId,
  getUserMemberHouseholdId,
  getHouseholdMembers,
  getHouseholdInvites,
  removeHouseholdMember,
} from "@/lib/supabase-api"
import { staggerContainer, fadeUpItem } from "@/lib/utils"
import { toast } from "sonner"
import { Users, Loader2 } from "lucide-react"
import { MembersList } from "@/components/dashboard/members-list"
import { InviteMemberCard } from "@/components/dashboard/invite-member-card"
import { PendingInvitesCard } from "@/components/dashboard/pending-invites-card"

type Member = { user_id: string; role: string; full_name: string | null }
type Invite = { id: string; email: string; role: string; status: string; created_at: string }

export default function MembersPage() {
  const { user } = useAuth()
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { householdId: ownedId } = await getUserHouseholdId(user.id)
    let hId = ownedId
    let owner = !!ownedId

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

  const handleRemoveMember = async (userId: string) => {
    if (!householdId) return
    const member = members.find((m) => m.user_id === userId)
    await removeHouseholdMember(householdId, userId)
    toast.success("Member removed", { description: member?.full_name ?? undefined })
    loadData()
  }

  if (!isSupabaseConfigured() || !user) {
    return (
      <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
        <div className="max-w-3xl">
          <p className="text-sm text-muted-foreground">Sign in to manage household members.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <div className="max-w-3xl">
        {/* Page header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Members</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {isOwner ? "Manage household members and invite others." : "View household members."}
            </p>
          </div>
        </div>

        {loading ? (
          <Card className="border-border shadow-sm">
            <CardContent className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : !householdId ? (
          <Card className="border-border shadow-sm">
            <CardContent className="py-10 text-center">
              <p className="text-sm text-muted-foreground">No household found. Sync your data first from Settings.</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate="visible">
            {/* Members list */}
            <motion.div variants={fadeUpItem}>
              <Card className="border-border shadow-sm">
                <CardContent className="space-y-5 pt-5">
                  <MembersList
                    members={members}
                    currentUserId={user.id}
                    isOwner={isOwner}
                    onRemove={handleRemoveMember}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Invite form (owner only) */}
            {isOwner && (
              <motion.div variants={fadeUpItem}>
                <Card className="border-border shadow-sm">
                  <CardContent className="space-y-5 pt-5">
                    <InviteMemberCard householdId={householdId} onInviteCreated={loadData} />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Pending invites (owner only) */}
            {isOwner && invites.length > 0 && (
              <motion.div variants={fadeUpItem}>
                <Card className="border-border shadow-sm">
                  <CardContent className="space-y-5 pt-5">
                    <PendingInvitesCard invites={invites} onChanged={loadData} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
