"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useExpense } from "@/contexts/expense-context"
import { Wallet, Calendar } from "lucide-react"

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
      <Card className="border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent dark:from-primary/15 dark:via-primary/5 dark:to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <CardContent className="relative p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Budget / Month
            </span>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            {formatMoney(budgetTotal)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Spent: {formatMoney(monthlyExpenses)}
          </p>
          {budgetTotal > 0 && (
            <>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${spentPct}%`,
                    backgroundColor: isOverBudget ? "hsl(var(--destructive))" : "hsl(var(--primary))",
                  }}
                />
              </div>
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
      <Card className="border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--chart-4))]/10 via-transparent to-transparent pointer-events-none" />
        <CardContent className="relative p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Spent Today
            </span>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--chart-4))]/10">
              <Calendar className="h-5 w-5 text-[hsl(var(--chart-4))]" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
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
