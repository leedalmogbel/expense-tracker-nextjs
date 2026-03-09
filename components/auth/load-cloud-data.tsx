"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useExpense } from "@/contexts/expense-context"
import { fetchHouseholdTransactions, fetchCurrencyPreference } from "@/lib/supabase-api"
import { getTransactions, saveTransactions, setCurrency as storageSetCurrency } from "@/lib/storage"
import { CURRENCIES } from "@/lib/constants"

/**
 * When the user is signed in, fetches their household transactions from Supabase
 * and merges them into localStorage (deduplicated by id) + refreshes the expense
 * context so the UI shows cloud data without duplicating existing local entries.
 * Also loads user preferences (currency) from their profile.
 * Runs once per session when the dashboard is first shown.
 *
 * Note: Cloud data LOADING is available to all signed-in users (so data isn't lost
 * on logout/login). Cloud data SYNCING (write) is gated behind premium.
 */
export function LoadCloudData() {
  const { user, isSupabaseConfigured } = useAuth()
  const { refresh, setCurrency } = useExpense()
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (!user || !isSupabaseConfigured || hasLoadedRef.current) return

    hasLoadedRef.current = true

    // Load currency preference from profile
    fetchCurrencyPreference(user.id).then(({ currencyCode }) => {
      if (currencyCode) {
        const match = CURRENCIES.find((c) => c.code === currencyCode)
        if (match) {
          storageSetCurrency(match)
          setCurrency(match)
        }
      }
    })

    // Load cloud transactions
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
  }, [user?.id, isSupabaseConfigured, refresh, setCurrency])

  return null
}
