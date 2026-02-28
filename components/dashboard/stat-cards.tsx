"use client"

import { memo, useMemo } from "react"
import { DollarSign, TrendingUp, TrendingDown, CreditCard, PiggyBank, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useExpense } from "@/contexts/expense-context"
import { getMonthOverMonthChange } from "@/lib/expense-utils"
import { cn } from "@/lib/utils"

export const StatCards = memo(function StatCards() {
  const {
    currency,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    prevMonthIncome,
    prevMonthExpenses,
    transactions,
    year,
    month,
  } = useExpense()

  const savings = totalBalance

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
  // For expenses, rising is bad (down trend), falling is good (up trend)
  const expenseTrend: "up" | "down" | "neutral" =
    expenseChange.trend === "up" ? "down" : expenseChange.trend === "down" ? "up" : "neutral"

  const stats = [
    {
      label: "Total Balance",
      value: `${currency.symbol}${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: balanceChange.text,
      trend: balanceChange.trend,
      icon: DollarSign,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      label: "Monthly Income",
      value: `${currency.symbol}${monthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: incomeChange.text,
      trend: incomeChange.trend,
      icon: TrendingUp,
      iconBg: "bg-chart-2/10 text-[hsl(var(--chart-2))]",
    },
    {
      label: "Monthly Expenses",
      value: `${currency.symbol}${monthlyExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: expenseChange.text,
      trend: expenseTrend,
      icon: CreditCard,
      iconBg: "bg-chart-4/10 text-[hsl(var(--chart-4))]",
    },
    {
      label: "Total Savings",
      value: `${currency.symbol}${savings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: balanceChange.text,
      trend: balanceChange.trend,
      icon: PiggyBank,
      iconBg: "bg-chart-3/10 text-[hsl(var(--chart-3))]",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card
          key={stat.label}
          className={cn(
            "border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.98] overflow-hidden",
            i === 0 && "relative bg-gradient-to-br from-primary/15 via-primary/5 to-card dark:from-primary/20 dark:via-primary/8 dark:to-card/60"
          )}
        >
          {i === 0 && (
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          )}
          <CardContent className="relative p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
                {stat.label}
              </p>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stat.iconBg}`}>
                <stat.icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold font-heading text-foreground break-all tracking-tight">
              {stat.value}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              {stat.trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
              ) : stat.trend === "down" ? (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              ) : (
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  stat.trend === "up" ? "text-primary" : stat.trend === "down" ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})
