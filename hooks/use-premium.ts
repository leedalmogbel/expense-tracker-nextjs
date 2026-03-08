"use client"

import { usePremiumContext } from "@/contexts/premium-context"
import type { PremiumFeatureId } from "@/lib/premium-features"

/**
 * Convenience hook — re-exports the full premium context.
 */
export function usePremium() {
  return usePremiumContext()
}

/**
 * Returns { locked, label } for a specific feature.
 * Use this to conditionally render lock icons or upgrade prompts.
 */
export function useFeatureGate(feature: PremiumFeatureId) {
  const { isFeatureLocked } = usePremiumContext()
  return { locked: isFeatureLocked(feature) }
}
