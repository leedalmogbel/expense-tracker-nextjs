"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useExpense } from "@/contexts/expense-context"
import { Wallet, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export function BudgetExpenseCards() {
  const { currency, currentBudget, monthlyExpenses, spentToday, year, month } = useExpense()
  const budgetTotal = currentBudget?.budget ?? 0
  const spentPct = budgetTotal > 0 ? Math.min((monthlyExpenses / budgetTotal) * 100, 100) : 0
  const isOverBudget = monthlyExpenses > budgetTotal
  const monthLabel = new Date(year, month - 1, 1).toLocaleString("default", { month: "long" })

  const formatMoney = (n: number) =>
    currency.symbol + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Budget / Month
            </span>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-heading text-foreground">
            {formatMoney(budgetTotal)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Spent: {formatMoney(monthlyExpenses)}
          </p>
          {budgetTotal > 0 && (
            <>
              <Progress
                value={spentPct}
                className={cn("mt-3 h-2", isOverBudget && "[&_[data-slot=indicator]]:bg-destructive")}
              />
              <p className={`text-xs font-medium mt-1.5 ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}>
                {spentPct.toFixed(0)}% used
              </p>
            </>
          )}
          {budgetTotal === 0 && (
            <p className="text-xs text-muted-foreground mt-2">Set a budget in Settings</p>
          )}
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Spent Today
            </span>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-heading text-foreground">
            {formatMoney(spentToday)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {monthLabel} {year}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
