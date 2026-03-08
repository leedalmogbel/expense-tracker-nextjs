"use client"

import Link from "next/link"
import { Check, Sparkles, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { EARLY_ADOPTER_LIMIT } from "@/lib/premium-features"

const freePlan = {
  name: "Free",
  price: "$0",
  period: "forever",
  description: "Everything you need to start tracking expenses.",
  features: [
    "Dashboard & analytics",
    "Unlimited transactions",
    "Budgets & categories",
    "Income tracking",
    "Accounts management",
    "Profile & settings",
  ],
  cta: "Get Started",
}

const premiumPlan = {
  name: "Premium",
  price: "$0",
  period: "early adopter",
  description: "Full access to every feature, free for early adopters.",
  features: [
    "Everything in Free",
    "Cloud sync across devices",
    "Household members",
    "Activity log",
    "Cards & loans tracking",
    "Shopping trips & projects",
    "CSV export/import",
    "Recurring transactions",
  ],
  cta: "Claim Free Premium",
}

export function Pricing() {
  const [remaining, setRemaining] = useState<number | null>(null)
  const total = EARLY_ADOPTER_LIMIT

  useEffect(() => {
    fetch("/api/slots")
      .then((r) => r.json())
      .then((d) => setRemaining(typeof d.remaining === "number" ? d.remaining : null))
      .catch(() => {})
  }, [])

  const used = remaining !== null ? total - remaining : 0
  const pct = remaining !== null ? ((total - remaining) / total) * 100 : 0
  const spotsLow = remaining !== null && remaining <= 30

  return (
    <section id="pricing" className="py-20 md:py-32 bg-card">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Pricing</p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-bold text-foreground md:text-4xl">
            Free for early adopters
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            The first {total} users get full premium access — completely free, forever.
          </p>
        </div>

        {/* Slots counter */}
        {remaining !== null && (
          <div className="mx-auto mt-10 max-w-md">
            <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  {spotsLow ? (
                    <Flame className="h-4 w-4 text-orange-500" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-primary" />
                  )}
                  {remaining} of {total} free premium spots remaining
                </span>
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {used} claimed
                </span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    spotsLow ? "bg-orange-500" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="rounded-xl border border-border bg-background p-8 transition-all duration-300 hover:border-primary/30 dark:bg-card">
            <h3 className="font-heading text-lg font-semibold text-foreground">{freePlan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-heading text-4xl font-bold text-foreground">{freePlan.price}</span>
              <span className="text-sm text-muted-foreground">/{freePlan.period}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{freePlan.description}</p>
            <ul className="mt-6 space-y-3">
              {freePlan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full" variant="outline" asChild>
              <Link href="/login?tab=signup">{freePlan.cta}</Link>
            </Button>
          </div>

          {/* Premium */}
          <div className="relative rounded-xl border border-primary bg-background p-8 shadow-xl shadow-primary/10 scale-[1.02] dark:shadow-primary/20 dark:border-primary/50">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
              Early Adopter
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground">{premiumPlan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-heading text-4xl font-bold text-foreground">{premiumPlan.price}</span>
              <span className="text-sm text-muted-foreground">/{premiumPlan.period}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{premiumPlan.description}</p>
            <ul className="mt-6 space-y-3">
              {premiumPlan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full" asChild>
              <Link href="/login?tab=signup">{premiumPlan.cta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
