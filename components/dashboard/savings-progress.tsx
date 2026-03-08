"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PiggyBank } from "lucide-react"
import { useExpense } from "@/contexts/expense-context"

export function SavingsProgress() {
  const { currency, currentBudget, monthlySavings, savingsRate, monthlyIncome, monthlyExpenses } = useExpense()
  const savingsTarget = currentBudget?.savingsTarget ?? 0
  const savingsPct = savingsTarget > 0 ? Math.min((monthlySavings / savingsTarget) * 100, 100) : 0
  const isPositive = monthlySavings >= 0

  const formatMoney = (n: number) =>
    currency.symbol + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <Card className="w-full border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
      <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border relative">
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Monthly Savings
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {savingsRate}% savings rate this month
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-4 relative">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-sm font-semibold text-foreground">{formatMoney(monthlyIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-sm font-semibold text-foreground">{formatMoney(monthlyExpenses)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Savings</p>
            <p className={`text-sm font-bold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
              {isPositive ? "+" : "-"}{formatMoney(monthlySavings)}
            </p>
          </div>
        </div>

        {savingsTarget > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Savings Target</span>
              <span className="font-medium text-foreground">
                {formatMoney(Math.max(0, monthlySavings))} / {formatMoney(savingsTarget)}
              </span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${savingsPct}%`,
                  backgroundColor: monthlySavings >= savingsTarget
                    ? "#10b981"
                    : monthlySavings >= 0
                      ? "#f59e0b"
                      : "hsl(var(--destructive))",
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {monthlySavings >= savingsTarget
                ? "Target reached!"
                : monthlySavings >= 0
                  ? `${formatMoney(savingsTarget - monthlySavings)} to go`
                  : "Over budget — no savings this month"}
            </p>
          </div>
        )}

        {savingsTarget === 0 && (
          <p className="text-xs text-muted-foreground">
            Set a savings target in your budget to track progress here.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
