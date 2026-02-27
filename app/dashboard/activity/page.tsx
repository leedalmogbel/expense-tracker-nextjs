"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { isSupabaseConfigured } from "@/lib/supabase"
import {
  getUserHouseholdId,
  getUserMemberHouseholdId,
  getHouseholdMembers,
  fetchHouseholdActivityLog,
} from "@/lib/supabase-api"
import type { ActivityLogEntry } from "@/lib/supabase-api"
import { staggerContainer, fadeUpItem } from "@/lib/utils"
import { Activity, Loader2 } from "lucide-react"
import { ActivityFilters } from "@/components/dashboard/activity-filters"
import { ActivityTimeline } from "@/components/dashboard/activity-timeline"

type Member = { user_id: string; role: string; full_name: string | null }

const PAGE_SIZE = 50

export default function ActivityPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [entries, setEntries] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // Filters
  const [selectedMember, setSelectedMember] = useState("")
  const [selectedType, setSelectedType] = useState("")

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { householdId: ownedId } = await getUserHouseholdId(user.id)
    let hId = ownedId
    if (!hId) {
      const { householdId: memberId } = await getUserMemberHouseholdId(user.id)
      hId = memberId
    }

    if (!hId) {
      setLoading(false)
      return
    }

    const [membersRes, activityRes] = await Promise.all([
      getHouseholdMembers(hId),
      fetchHouseholdActivityLog(user.id, { limit: PAGE_SIZE, offset: 0 }),
    ])

    setMembers(membersRes.members)
    setEntries(activityRes.entries)
    setHasMore(activityRes.entries.length >= PAGE_SIZE)
    setLoading(false)
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleLoadMore = async () => {
    if (!user || loadingMore) return
    setLoadingMore(true)
    const { entries: more } = await fetchHouseholdActivityLog(user.id, {
      limit: PAGE_SIZE,
      offset: entries.length,
    })
    setEntries((prev) => [...prev, ...more])
    setHasMore(more.length >= PAGE_SIZE)
    setLoadingMore(false)
  }

  const filteredEntries = useMemo(() => {
    let result = entries
    if (selectedMember && selectedMember !== "all") {
      result = result.filter((e) => e.created_by === selectedMember)
    }
    if (selectedType && selectedType !== "all") {
      result = result.filter((e) => e.type === selectedType)
    }
    return result
  }, [entries, selectedMember, selectedType])

  if (!isSupabaseConfigured() || !user) {
    return (
      <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
        <div className="max-w-3xl">
          <p className="text-sm text-muted-foreground">Sign in to view activity log.</p>
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
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Activity Log</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Track who added each expense, income, and more.
            </p>
          </div>
        </div>

        {loading ? (
          <Card className="border-border shadow-sm">
            <CardContent className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" animate="visible">
            {/* Filters */}
            <motion.div variants={fadeUpItem}>
              <ActivityFilters
                members={members}
                selectedMember={selectedMember}
                onMemberChange={setSelectedMember}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
              />
            </motion.div>

            {/* Timeline */}
            <motion.div variants={fadeUpItem}>
              <ActivityTimeline entries={filteredEntries} />
            </motion.div>

            {/* Load more */}
            {hasMore && !selectedMember && !selectedType && (
              <motion.div variants={fadeUpItem} className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="gap-2 rounded-lg"
                >
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Load more
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
