"use client"

import { useState } from "react"
import { Lock, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { usePremium } from "@/hooks/use-premium"
import { PREMIUM_FEATURES } from "@/lib/premium-features"
import type { PremiumFeatureId } from "@/lib/premium-features"
import { toast } from "sonner"

interface UpgradePromptProps {
  feature: PremiumFeatureId
}

export function UpgradePrompt({ feature }: UpgradePromptProps) {
  const { redeemPromoCode } = usePremium()
  const [code, setCode] = useState("")
  const [redeeming, setRedeeming] = useState(false)
  const info = PREMIUM_FEATURES[feature]

  const handleRedeem = async () => {
    if (!code.trim()) return
    setRedeeming(true)
    const { success, error } = await redeemPromoCode(code)
    setRedeeming(false)
    if (success) {
      toast.success("Premium unlocked!", { description: "All premium features are now available." })
      setCode("")
    } else {
      toast.error("Invalid code", { description: error ?? "Please check the code and try again." })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 pt-8 pb-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">{info.label}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {info.description}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
            Premium Feature
          </div>

          <div className="w-full space-y-3 pt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Have a promo code?
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
                className="text-center font-mono tracking-widest uppercase"
              />
              <Button
                onClick={handleRedeem}
                disabled={!code.trim() || redeeming}
                className="shrink-0"
              >
                {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redeem"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
