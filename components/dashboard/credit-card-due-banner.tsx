"use client"

import { useState, useEffect } from "react"
import { getCreditCardReminders } from "@/lib/storage"
import { getDueReminders, getOrdinalSuffix } from "@/lib/expense-utils"
import type { CreditCardReminder } from "@/lib/types"
import { CreditCard, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CreditCardDueBanner() {
  const [dueCards, setDueCards] = useState<CreditCardReminder[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const reminders = getCreditCardReminders()
    setDueCards(getDueReminders(reminders))
  }, [])

  if (dismissed || dueCards.length === 0) return null

  return (
    <div className="relative rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
          <CreditCard className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Credit card payment{dueCards.length > 1 ? "s" : ""} due soon
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {dueCards
              .map((c) => `${c.name} (due ${getOrdinalSuffix(c.dueDay)})`)
              .join(", ")}
            {" \u2014 "}
            <Link href="/dashboard/cards" className="text-primary hover:underline font-medium">
              View cards
            </Link>
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
