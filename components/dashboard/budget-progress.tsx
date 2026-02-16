"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpense } from "@/contexts/expense-context"

interface BudgetProgressProps {
  onManage?: () => void
}

export function BudgetProgress({ onManage }: BudgetProgressProps) {
  const { currency, budgetProgress } = useExpense()

  if (budgetProgress.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Budget Overview
            </CardTitle>
            <button type="button" onClick={onManage} className="text-xs font-medium text-primary hover:underline touch-manipulation">Manage</button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-sm text-muted-foreground">
            Set a monthly budget and category limits in Settings to track spending.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            Budget Overview
          </CardTitle>
          <button type="button" onClick={onManage} className="text-xs font-medium text-primary hover:underline touch-manipulation">Manage</button>
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
