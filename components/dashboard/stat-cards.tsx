"use client"

import { DollarSign, TrendingUp, TrendingDown, CreditCard, PiggyBank } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useExpense } from "@/contexts/expense-context"

export function StatCards() {
  const { currency, totalBalance, monthlyIncome, monthlyExpenses } = useExpense()

  const savings = totalBalance
  const prevMonth = 0 // could derive from transactions if we had last month's snapshot
  const incomeChange = prevMonth === 0 ? "+0%" : "+0%"
  const expenseChange = prevMonth === 0 ? "-0%" : "-0%"
  const savingsChange = prevMonth === 0 ? "+0%" : "+0%"

  const stats = [
    {
      label: "Total Balance",
      value: `${currency.symbol}${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: savingsChange,
      trend: "up" as const,
      icon: DollarSign,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      label: "Monthly Income",
      value: `${currency.symbol}${monthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: incomeChange,
      trend: "up" as const,
      icon: TrendingUp,
      iconBg: "bg-chart-2/10 text-[hsl(var(--chart-2))]",
    },
    {
      label: "Monthly Expenses",
      value: `${currency.symbol}${monthlyExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: expenseChange,
      trend: "down" as const,
      icon: CreditCard,
      iconBg: "bg-chart-4/10 text-[hsl(var(--chart-4))]",
    },
    {
      label: "Total Savings",
      value: `${currency.symbol}${savings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: savingsChange,
      trend: "up" as const,
      icon: PiggyBank,
      iconBg: "bg-chart-3/10 text-[hsl(var(--chart-3))]",
    },
  ]

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
                {stat.label}
              </p>
              <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg ${stat.iconBg}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold font-heading text-foreground break-all">{stat.value}</p>
            <div className="mt-2 flex items-center gap-1.5">
              {stat.trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              )}
              <span
                className={`text-xs font-medium ${
                  stat.trend === "up" ? "text-primary" : "text-destructive"
                }`}
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
}
