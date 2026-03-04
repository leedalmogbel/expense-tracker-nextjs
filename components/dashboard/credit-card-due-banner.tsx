"use client"

import { useState, useEffect } from "react"
import { getCreditCardReminders, getCreditCardPayments } from "@/lib/storage"
import { getDueReminders, getOrdinalSuffix, getCardsWithPaymentStatus } from "@/lib/expense-utils"
import type { CreditCardReminder } from "@/lib/types"
import { CreditCard, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CreditCardDueBanner() {
  const [dueCards, setDueCards] = useState<CreditCardReminder[]>([])
  const [overdueCards, setOverdueCards] = useState<CreditCardReminder[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const reminders = getCreditCardReminders()
    const payments = getCreditCardPayments()

    // Cards due soon (existing logic)
    setDueCards(getDueReminders(reminders))

    // Cards overdue (past due day, no payment recorded this month)
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const cardsStatus = getCardsWithPaymentStatus(reminders, payments, year, month)
    setOverdueCards(cardsStatus.filter((c) => c.status === "overdue").map((c) => c.card))
  }, [])

  if (dismissed || (dueCards.length === 0 && overdueCards.length === 0)) return null

  return (
    <div className="space-y-2">
      {overdueCards.length > 0 && (
        <div className="relative rounded-xl border border-destructive/30 bg-destructive/10 dark:bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/20 text-destructive">
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Credit card payment{overdueCards.length > 1 ? "s" : ""} overdue
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {overdueCards
                  .map((c) => `${c.name} (due ${getOrdinalSuffix(c.dueDay)})`)
                  .join(", ")}
                {" \u2014 "}
                <Link href="/dashboard/cards" className="text-primary hover:underline font-medium">
                  Record payment
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
      )}

      {dueCards.length > 0 && (
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
            {overdueCards.length === 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => setDismissed(true)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
