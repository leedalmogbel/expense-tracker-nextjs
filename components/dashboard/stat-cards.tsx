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
    monthlySavings,
    savingsRate,
    prevMonthIncome,
    prevMonthExpenses,
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

  const prevMonthlySavings = useMemo(() => {
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const prevIncome = transactions
      .filter((t) => {
        const [y, m] = t.date.split("-").map(Number)
        return y === prevYear && m === prevMonth && t.amount > 0
      })
      .reduce((s, t) => s + t.amount, 0)
    const prevExpenses = transactions
      .filter((t) => {
        const [y, m] = t.date.split("-").map(Number)
        return y === prevYear && m === prevMonth && t.amount < 0
      })
      .reduce((s, t) => s + Math.abs(t.amount), 0)
    return prevIncome - prevExpenses
  }, [transactions, year, month])

  const balanceChange = getMonthOverMonthChange(totalBalance, prevTotalBalance)
  const incomeChange = getMonthOverMonthChange(monthlyIncome, prevMonthIncome)
  const expenseChange = getMonthOverMonthChange(monthlyExpenses, prevMonthExpenses)
  const savingsChange = getMonthOverMonthChange(monthlySavings, prevMonthlySavings)
  // For expenses, rising is bad (down trend), falling is good (up trend)
  const expenseTrend: "up" | "down" | "neutral" =
    expenseChange.trend === "up" ? "down" : expenseChange.trend === "down" ? "up" : "neutral"

  const stats = [
    {
      label: "Total Balance",
      value: `${currency.symbol}${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: balanceChange.text,
      trend: balanceChange.trend,
      description: "",
      icon: DollarSign,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      label: "Monthly Income",
      value: `${currency.symbol}${monthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: incomeChange.text,
      trend: incomeChange.trend,
      description: "",
      icon: TrendingUp,
      iconBg: "bg-chart-2/10 text-[hsl(var(--chart-2))]",
    },
    {
      label: "Monthly Expenses",
      value: `${currency.symbol}${monthlyExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: expenseChange.text,
      trend: expenseTrend,
      description: "",
      icon: CreditCard,
      iconBg: "bg-chart-4/10 text-[hsl(var(--chart-4))]",
    },
    {
      label: "Monthly Savings",
      value: `${currency.symbol}${monthlySavings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: savingsChange.text,
      trend: savingsChange.trend,
      description: `${Math.round(savingsRate)}% savings rate`,
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
            i === 0 && "relative bg-gradient-to-br from-primary/20 via-primary/8 to-card dark:from-primary/25 dark:via-primary/10 dark:to-card/60"
          )}
        >
          {i === 0 && (
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          )}
          <CardContent className="relative p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
                {stat.label}
              </p>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold font-heading text-foreground break-all tracking-tight">
              {stat.value}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
              style={{
                backgroundColor: stat.trend === "up" ? "hsl(var(--primary) / 0.1)" : stat.trend === "down" ? "hsl(var(--destructive) / 0.1)" : "hsl(var(--muted))",
              }}
            >
              {stat.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-primary" />
              ) : stat.trend === "down" ? (
                <TrendingDown className="h-3 w-3 text-destructive" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  stat.trend === "up" ? "text-primary" : stat.trend === "down" ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {stat.change}
              </span>
            </div>
            {stat.description && (
              <p className="mt-1.5 text-xs text-muted-foreground">{stat.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
})
