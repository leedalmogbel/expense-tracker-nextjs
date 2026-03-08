"use client"

import { memo, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useExpense } from "@/contexts/expense-context"
import { getOrdinalSuffix } from "@/lib/expense-utils"
import { CATEGORY_ICONS } from "@/lib/constants"
import { getCategoryIconComponent } from "@/lib/category-icons"
import { Receipt, Check, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export const PendingBills = memo(function PendingBills() {
  const {
    pendingBills,
    recurringTransactions,
    addTransaction,
    currency,
  } = useExpense()

  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null)

  const unpaidBills = useMemo(
    () => pendingBills.filter((b) => !b.isPaid),
    [pendingBills]
  )

  const paidBills = useMemo(
    () => pendingBills.filter((b) => b.isPaid),
    [pendingBills]
  )

  const handleMarkPaid = useCallback(
    (recurring: typeof pendingBills[number]["recurring"]) => {
      setMarkingPaidId(recurring.id)
      const iconName = CATEGORY_ICONS[recurring.category] ?? "circle-dot"
      addTransaction({
        description: recurring.description,
        amount: -Math.abs(recurring.amount),
        category: recurring.category,
        paymentMethod: recurring.paymentMethod,
        date: format(new Date(), "yyyy-MM-dd"),
        icon: iconName,
        scope: "personal",
      })
      // Small delay to show feedback before state updates
      setTimeout(() => setMarkingPaidId(null), 300)
    },
    [addTransaction]
  )

  // Don't render if no recurring bills are configured
  if (recurringTransactions.length === 0) return null

  const totalBills = pendingBills.length
  const paidCount = paidBills.length

  const fmt = (n: number) =>
    currency.symbol +
    Math.abs(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const paidSummary = useMemo(() => {
    if (paidBills.length === 0) return null
    const names = paidBills.map((b) => b.recurring.description)
    if (names.length <= 2) return names.join(", ")
    return `${names[0]}, ${names[1]} +${names.length - 2} more`
  }, [paidBills])

  return (
    <Card className="border-border">
      <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Pending Bills
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">This month</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground shrink-0">
            {paidCount} of {totalBills}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-2">
        {/* Unpaid bills */}
        {unpaidBills.map((bill) => {
          const IconComp = getCategoryIconComponent(
            CATEGORY_ICONS[bill.recurring.category] ?? "circle-dot"
          )
          const isMarking = markingPaidId === bill.recurring.id
          return (
            <div
              key={bill.recurring.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:bg-muted/30"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                <IconComp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {bill.recurring.description}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {fmt(bill.recurring.amount)}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="h-3 w-3" />
                Due {getOrdinalSuffix(bill.recurring.dueDay)}
              </span>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "shrink-0 h-8 text-xs gap-1.5 transition-all duration-200",
                  isMarking && "bg-primary/10 border-primary/30 text-primary"
                )}
                onClick={() => handleMarkPaid(bill.recurring)}
                disabled={isMarking}
              >
                <Check className="h-3.5 w-3.5" />
                {isMarking ? "Done" : "Mark Paid"}
              </Button>
            </div>
          )
        })}

        {/* No unpaid bills message */}
        {unpaidBills.length === 0 && paidBills.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-primary" />
            All bills paid this month
          </div>
        )}

        {/* Paid bills collapsed summary */}
        {paidBills.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/10 px-3 py-2.5">
            <Check className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              {paidSummary}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
