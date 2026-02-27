"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useExpense } from "@/contexts/expense-context"
import { fetchHouseholdTransactions } from "@/lib/supabase-api"
import { getTransactions, saveTransactions } from "@/lib/storage"

/**
 * When the user is signed in, fetches their household transactions from Supabase
 * and merges them into localStorage (deduplicated by id) + refreshes the expense
 * context so the UI shows cloud data without duplicating existing local entries.
 * Runs once per session when the dashboard is first shown.
 */
export function LoadCloudData() {
  const { user, isSupabaseConfigured } = useAuth()
  const { refresh } = useExpense()
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (!user || !isSupabaseConfigured || hasLoadedRef.current) return

    hasLoadedRef.current = true
    fetchHouseholdTransactions(user.id).then(({ transactions: cloudTxs, error }) => {
      if (error) return
      if (cloudTxs.length > 0) {
        const localTxs = getTransactions()
        const localIds = new Set(localTxs.map((t) => t.id))
        const newFromCloud = cloudTxs.filter((t) => !localIds.has(t.id))
        if (newFromCloud.length > 0) {
          saveTransactions([...localTxs, ...newFromCloud])
        }
        refresh()
      }
    })
  }, [user?.id, isSupabaseConfigured, refresh])

  return null
}
