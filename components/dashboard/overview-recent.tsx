"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpense } from "@/contexts/expense-context"
import { getCategoryIconComponent } from "@/lib/category-icons"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const CHART_COLORS = [
  "bg-primary/10 text-primary",
  "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]",
  "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]",
  "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]",
]

export function OverviewRecent() {
  const { filteredTransactions, formatCurrency, formatRelativeDate, selectedDate } = useExpense()
  const recent = filteredTransactions.slice(0, 5)
  const title = selectedDate
    ? `Activity for ${formatRelativeDate(selectedDate)}`
    : "Recent activity"

  return (
    <Card className="border-border">
      <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3 flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          {title}
        </CardTitle>
        <Link
          href="/dashboard/transactions"
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          View all <ChevronRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent className="px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No transactions yet. Add one to get started.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((tx, i) => {
              const Icon = getCategoryIconComponent(tx.icon)
              const isIncome = tx.amount > 0
              return (
                <li
                  key={tx.id}
                  className="flex items-center gap-3 py-3 first:pt-0"
                >
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", CHART_COLORS[i % CHART_COLORS.length])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeDate(tx.date)}</p>
                  </div>
                  <span className={cn("text-sm font-semibold shrink-0", isIncome ? "text-primary" : "text-destructive")}>
                    {formatCurrency(tx.amount)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
