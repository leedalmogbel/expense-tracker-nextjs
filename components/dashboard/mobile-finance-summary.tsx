"use client"

import { memo, useMemo } from "react"
import { TrendingUp, TrendingDown, Minus, Target, Calendar, PiggyBank } from "lucide-react"
import { useExpense } from "@/contexts/expense-context"
import { getMonthOverMonthChange } from "@/lib/expense-utils"
import { cn } from "@/lib/utils"

export const MobileFinanceSummary = memo(function MobileFinanceSummary() {
  const {
    currency,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate,
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
    if (abs >= 100_000) return currency.symbol + (abs / 1_000).toFixed(1) + "k"
    if (abs >= 1_000) return currency.symbol + abs.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    return currency.symbol + abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="space-y-3 lg:hidden">
      {/* ── Hero balance ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/25 via-primary/10 to-card border border-primary/15 p-5 shadow-md shadow-primary/[0.06] dark:from-primary/30 dark:via-primary/12 dark:to-card/60 dark:border-primary/20 dark:shadow-lg dark:shadow-black/30">
        <div className="absolute top-0 right-0 w-52 h-52 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-[hsl(var(--chart-3))]/8 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Balance
          </p>
          <p className="mt-1.5 text-4xl font-bold font-heading text-foreground tracking-tight drop-shadow-sm">
            {fmt(totalBalance)}
          </p>

          {/* Trend pill */}
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-background/60 backdrop-blur-sm px-2.5 py-1 border border-border/50">
            {balanceChange.trend === "up" ? (
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            ) : balanceChange.trend === "down" ? (
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            ) : (
              <Minus className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span
              className={cn(
                "text-xs font-semibold",
                balanceChange.trend === "up" ? "text-primary" : balanceChange.trend === "down" ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {balanceChange.text}
            </span>
            <span className="text-[10px] text-muted-foreground">vs last month</span>
          </div>

          {/* Income & Expense pills */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/60 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Income</p>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-base font-bold text-foreground tabular-nums">{fmtCompact(monthlyIncome)}</p>
                {incomeChange.trend !== "neutral" && (
                  <span className={cn("text-[9px] font-semibold shrink-0", incomeChange.trend === "up" ? "text-primary" : "text-destructive")}>
                    {incomeChange.trend === "up" ? "\u2191" : "\u2193"}
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/60 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 shrink-0 rounded-full bg-destructive" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Expenses</p>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-base font-bold text-foreground tabular-nums">{fmtCompact(monthlyExpenses)}</p>
                {expenseChange.trend !== "neutral" && (
                  <span className={cn("text-[9px] font-semibold shrink-0", expenseChange.trend === "up" ? "text-destructive" : "text-primary")}>
                    {expenseChange.trend === "up" ? "\u2191" : "\u2193"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats rows ────────────────────────────────── */}
      <div className="space-y-2">
        {/* Budget */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm shadow-black/[0.02] dark:shadow-lg dark:shadow-black/15">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--chart-3))]/10">
            <Target className="h-4.5 w-4.5 text-[hsl(var(--chart-3))]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Budget</p>
            {budgetTotal > 0 ? (
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm font-bold font-heading text-foreground tabular-nums">{spentPct.toFixed(0)}%</p>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${spentPct}%`,
                      backgroundColor: isOverBudget ? "hsl(var(--destructive))" : "hsl(var(--primary))",
                    }}
                  />
                </div>
                <p className={cn("text-[10px] tabular-nums shrink-0", isOverBudget ? "text-destructive font-medium" : "text-muted-foreground")}>
                  {isOverBudget ? "Over " + fmtCompact(monthlyExpenses - budgetTotal) : fmtCompact(budgetRemaining) + " left"}
                </p>
              </div>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">Not set</p>
            )}
          </div>
        </div>

        {/* Today */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm shadow-black/[0.02] dark:shadow-lg dark:shadow-black/15">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--chart-4))]/10">
            <Calendar className="h-4.5 w-4.5 text-[hsl(var(--chart-4))]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Today</p>
            <p className="mt-0.5 text-sm font-bold font-heading text-foreground tabular-nums">{fmtCompact(spentToday)}</p>
          </div>
        </div>

        {/* Savings */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm shadow-black/[0.02] dark:shadow-lg dark:shadow-black/15">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <PiggyBank className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Savings</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-sm font-bold font-heading text-foreground tabular-nums">{fmtCompact(monthlySavings)}</p>
              <p className={cn(
                "text-[10px] font-semibold tabular-nums",
                savingsRate > 0 ? "text-primary" : savingsRate < 0 ? "text-destructive" : "text-muted-foreground"
              )}>
                {Math.round(savingsRate)}% rate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
