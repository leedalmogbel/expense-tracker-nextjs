"use client"

import { usePremium } from "@/hooks/use-premium"
import { UpgradePrompt } from "./upgrade-prompt"
import type { PremiumFeatureId } from "@/lib/premium-features"
import { Loader2 } from "lucide-react"

interface PremiumGateProps {
  feature: PremiumFeatureId
  children: React.ReactNode
}

export function PremiumGate({ feature, children }: PremiumGateProps) {
  const { isPremium, loading } = usePremium()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isPremium) {
    return <UpgradePrompt feature={feature} />
  }

  return <>{children}</>
}
