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
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-card/95 to-card border border-border/80 p-5 shadow-sm shadow-primary/[0.04] dark:from-primary/15 dark:via-card/70 dark:to-card/60 dark:border-white/[0.08] dark:shadow-lg dark:shadow-black/30">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-[hsl(var(--chart-3))]/6 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Balance
          </p>
          <p className="mt-1.5 text-3xl font-bold font-heading text-foreground tracking-tight drop-shadow-sm">
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
          <div className="mt-4 flex gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-xl bg-primary/6 border border-primary/10 dark:bg-primary/8 dark:border-primary/15 px-3 py-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/12 dark:bg-primary/18">
                <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Income</p>
                <p className="text-sm font-bold text-foreground tabular-nums truncate">{fmtCompact(monthlyIncome)}</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 rounded-xl bg-destructive/6 border border-destructive/10 dark:bg-destructive/8 dark:border-destructive/15 px-3 py-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-destructive/12 dark:bg-destructive/18">
                <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Expenses</p>
                <p className="text-sm font-bold text-foreground tabular-nums truncate">{fmtCompact(monthlyExpenses)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Budget + Today row ─────────────────────────── */}
      <div className="flex gap-3">
        {/* Budget progress */}
        <div className="flex-1 rounded-xl border border-border/80 bg-card/90 backdrop-blur-xl p-4 shadow-sm shadow-black/[0.02] dark:bg-card/60 dark:border-white/[0.08] dark:shadow-lg dark:shadow-black/20">
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
          <div className="flex-1 rounded-xl border border-border/80 bg-card/90 backdrop-blur-xl p-4 shadow-sm shadow-black/[0.02] dark:bg-card/60 dark:border-white/[0.08] dark:shadow-lg dark:shadow-black/20">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Today</p>
            <p className="mt-1 text-lg font-bold font-heading text-foreground tabular-nums">{fmtCompact(spentToday)}</p>
          </div>
          <div className="flex-1 rounded-xl border border-border/80 bg-card/90 backdrop-blur-xl p-4 shadow-sm shadow-black/[0.02] dark:bg-card/60 dark:border-white/[0.08] dark:shadow-lg dark:shadow-black/20">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Savings</p>
            <p className="mt-1 text-lg font-bold font-heading text-foreground tabular-nums">{fmtCompact(totalBalance)}</p>
          </div>
        </div>
      </div>
    </div>
  )
})
