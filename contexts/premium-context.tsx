"use client"

import * as React from "react"
import { useAuth } from "./auth-context"
import { isSupabaseConfigured } from "@/lib/supabase"
import {
  fetchSubscription,
  autoGrantEarlyAdopter,
  redeemPromoCode as redeemPromoCodeApi,
} from "@/lib/supabase-api"
import type { PremiumFeatureId } from "@/lib/premium-features"
import type { SubscriptionPlan, SubscriptionSource } from "@/lib/supabase-db-types"

const LS_KEY = "doshmate_premium_cache"

type PremiumCache = {
  plan: SubscriptionPlan
  source: SubscriptionSource | null
  ts: number
}

type PremiumContextValue = {
  plan: SubscriptionPlan
  source: SubscriptionSource | null
  isPremium: boolean
  loading: boolean
  isFeatureLocked: (feature: PremiumFeatureId) => boolean
  redeemPromoCode: (code: string) => Promise<{ success: boolean; error: string | null }>
  refreshSubscription: () => Promise<void>
}

const PremiumContext = React.createContext<PremiumContextValue | null>(null)

function loadCache(): PremiumCache | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PremiumCache
  } catch {
    return null
  }
}

function saveCache(plan: SubscriptionPlan, source: SubscriptionSource | null) {
  if (typeof window === "undefined") return
  const cache: PremiumCache = { plan, source, ts: Date.now() }
  localStorage.setItem(LS_KEY, JSON.stringify(cache))
}

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { user, isSuperadmin } = useAuth()
  const cached = React.useRef(loadCache())

  const [plan, setPlan] = React.useState<SubscriptionPlan>(cached.current?.plan ?? "free")
  const [source, setSource] = React.useState<SubscriptionSource | null>(cached.current?.source ?? null)
  const [loading, setLoading] = React.useState(true)

  // Superadmins are always premium
  const isPremium = isSuperadmin || plan === "premium"

  const refreshSubscription = React.useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    const { subscription, error } = await fetchSubscription(user.id)
    if (error) {
      setLoading(false)
      return
    }

    if (subscription) {
      setPlan(subscription.plan)
      setSource(subscription.source)
      saveCache(subscription.plan, subscription.source)
    } else {
      // No subscription row — try early adopter auto-grant
      const { granted } = await autoGrantEarlyAdopter(user.id)
      if (granted) {
        setPlan("premium")
        setSource("early_adopter")
        saveCache("premium", "early_adopter")
      } else {
        setPlan("free")
        setSource(null)
        saveCache("free", null)
      }
    }
    setLoading(false)
  }, [user])

  React.useEffect(() => {
    refreshSubscription()
  }, [refreshSubscription])

  const isFeatureLocked = React.useCallback(
    (_feature: PremiumFeatureId) => !isPremium,
    [isPremium]
  )

  const redeemPromoCode = React.useCallback(
    async (code: string) => {
      if (!user) return { success: false, error: "Not signed in." }
      const result = await redeemPromoCodeApi(user.id, code)
      if (result.success) {
        await refreshSubscription()
      }
      return result
    },
    [user, refreshSubscription]
  )

  const value: PremiumContextValue = {
    plan,
    source,
    isPremium,
    loading,
    isFeatureLocked,
    redeemPromoCode,
    refreshSubscription,
  }

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
}

export function usePremiumContext() {
  const ctx = React.useContext(PremiumContext)
  if (!ctx) {
    return {
      plan: "free" as SubscriptionPlan,
      source: null,
      isPremium: false,
      loading: false,
      isFeatureLocked: () => true,
      redeemPromoCode: async () => ({ success: false, error: "PremiumProvider missing" }),
      refreshSubscription: async () => {},
    }
  }
  return ctx
}
