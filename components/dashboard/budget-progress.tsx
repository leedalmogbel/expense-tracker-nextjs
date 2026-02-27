"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"
import { useExpense } from "@/contexts/expense-context"

interface BudgetProgressProps {
  onManage?: () => void
}

export function BudgetProgress({ onManage }: BudgetProgressProps) {
  const { currency, budgetProgress } = useExpense()

  if (budgetProgress.length === 0) {
    return (
      <Card className="w-full border-border">
        <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
          <div className="flex items-start justify-between gap-4 w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]">
                <Target className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                  Budget Overview
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Track spending vs limits</p>
              </div>
            </div>
            <button type="button" onClick={onManage} className="shrink-0 inline-flex items-center rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted hover:text-primary sm:text-sm sm:px-4 sm:py-2">Manage</button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No budget set</p>
            <p className="text-xs text-muted-foreground mt-1">Set a monthly budget and category limits to track spending</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-border">
      <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]">
              <Target className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Budget Overview
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{budgetProgress.length} categor{budgetProgress.length !== 1 ? "ies" : "y"} tracked</p>
            </div>
          </div>
          <button type="button" onClick={onManage} className="shrink-0 inline-flex items-center rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted hover:text-primary sm:text-sm sm:px-4 sm:py-2">Manage</button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-4 sm:space-y-5">
          {budgetProgress.map((row) => {
            const percentage = Math.min((row.spent / row.budget) * 100, 100)
            const isOver = row.spent > row.budget

            return (
              <div key={row.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{row.category}</span>
                  <span
                    className={`text-xs font-medium ${isOver ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {currency.symbol}
                    {row.spent.toLocaleString()} / {currency.symbol}
                    {row.budget.toLocaleString()}
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${isOver ? "bg-destructive" : row.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
