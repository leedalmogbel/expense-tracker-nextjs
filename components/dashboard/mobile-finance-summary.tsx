"use client"

import { memo, useMemo } from "react"
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useExpense } from "@/contexts/expense-context"
import { getMonthOverMonthChange } from "@/lib/expense-utils"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

export const MobileFinanceSummary = memo(function MobileFinanceSummary() {
  const {
    currency,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    prevMonthIncome,
    prevMonthExpenses,
    currentBudget,
    spentToday,
    transactions,
    year,
    month,
  } = useExpense()

  const prevTotalBalance = useMemo(() => {
    return transactions
      .filter((t) => {
        const [y, m] = t.date.split("-").map(Number)
        return y < year || (y === year && m < month)
      })
      .reduce((s, t) => s + t.amount, 0)
  }, [transactions, year, month])

  const balanceChange = getMonthOverMonthChange(totalBalance, prevTotalBalance)
  const incomeChange = getMonthOverMonthChange(monthlyIncome, prevMonthIncome)
  const expenseChange = getMonthOverMonthChange(monthlyExpenses, prevMonthExpenses)

  const budgetTotal = currentBudget?.budget ?? 0
  const spentPct = budgetTotal > 0 ? Math.min((monthlyExpenses / budgetTotal) * 100, 100) : 0
  const isOverBudget = monthlyExpenses > budgetTotal && budgetTotal > 0
  const budgetRemaining = Math.max(0, budgetTotal - monthlyExpenses)

  const fmt = (n: number) =>
    currency.symbol + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const fmtCompact = (n: number) => {
    const abs = Math.abs(n)
    if (abs >= 1_000_000) return currency.symbol + (abs / 1_000_000).toFixed(1) + "M"
    if (abs >= 10_000) return currency.symbol + (abs / 1_000).toFixed(1) + "k"
    return currency.symbol + abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="space-y-3 lg:hidden">
      {/* ── Hero balance ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/8 to-card border border-primary/10 p-5 shadow-md shadow-primary/[0.06] dark:from-primary/25 dark:via-primary/10 dark:to-card/60 dark:border-primary/15 dark:shadow-lg dark:shadow-black/30">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/12 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[hsl(var(--chart-3))]/8 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Balance
          </p>
          <p className="mt-1.5 text-4xl font-bold font-heading text-foreground tracking-tight drop-shadow-sm">
            {fmt(totalBalance)}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            {balanceChange.trend === "up" ? (
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            ) : balanceChange.trend === "down" ? (
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            ) : (
              <Minus className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                balanceChange.trend === "up" ? "text-primary" : balanceChange.trend === "down" ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {balanceChange.text}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>

          {/* Income & Expense pills */}
          <div className="mt-4 flex gap-2.5">
            <div className="flex-1 flex items-center gap-2.5 rounded-xl bg-primary/6 border border-primary/10 dark:bg-primary/8 dark:border-primary/15 px-3 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/12 dark:bg-primary/18">
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Income</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold text-foreground tabular-nums truncate">{fmtCompact(monthlyIncome)}</p>
                  {incomeChange.trend !== "neutral" && (
                    <span className={cn("text-[9px] font-medium", incomeChange.trend === "up" ? "text-primary" : "text-destructive")}>
                      {incomeChange.trend === "up" ? "\u2191" : "\u2193"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2.5 rounded-xl bg-destructive/6 border border-destructive/10 dark:bg-destructive/8 dark:border-destructive/15 px-3 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/12 dark:bg-destructive/18">
                <ArrowDownRight className="h-4 w-4 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Expenses</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold text-foreground tabular-nums truncate">{fmtCompact(monthlyExpenses)}</p>
                  {expenseChange.trend !== "neutral" && (
                    <span className={cn("text-[9px] font-medium", expenseChange.trend === "up" ? "text-destructive" : "text-primary")}>
                      {expenseChange.trend === "up" ? "\u2191" : "\u2193"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Budget + Today row ─────────────────────────── */}
      <div className="flex gap-3">
        {/* Budget progress */}
        <div className="flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/[0.02] dark:shadow-lg dark:shadow-black/15">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Budget</p>
          {budgetTotal > 0 ? (
            <>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-lg font-bold font-heading text-foreground tabular-nums">{spentPct.toFixed(0)}%</span>
                <span className="text-[10px] text-muted-foreground">used</span>
              </div>
              <Progress
                value={spentPct}
                className={cn("mt-2 h-1.5", isOverBudget && "[&_[data-slot=indicator]]:bg-destructive")}
              />
              <p className={cn("mt-1.5 text-[10px] tabular-nums", isOverBudget ? "text-destructive font-medium" : "text-muted-foreground")}>
                {isOverBudget ? "Over by " + fmtCompact(monthlyExpenses - budgetTotal) : fmtCompact(budgetRemaining) + " left"}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              No budget set
            </p>
          )}
        </div>

        {/* Today + Savings */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/[0.02] dark:shadow-lg dark:shadow-black/15">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Today</p>
            <p className="mt-1 text-lg font-bold font-heading text-foreground tabular-nums">{fmtCompact(spentToday)}</p>
          </div>
          <div className="flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/[0.02] dark:shadow-lg dark:shadow-black/15">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Savings</p>
            <p className="mt-1 text-lg font-bold font-heading text-foreground tabular-nums">{fmtCompact(totalBalance)}</p>
          </div>
        </div>
      </div>
    </div>
  )
})
