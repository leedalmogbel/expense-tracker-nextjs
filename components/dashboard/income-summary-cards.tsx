"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useExpense } from "@/contexts/expense-context"
import { getMonthOverMonthChange } from "@/lib/expense-utils"
import { TrendingUp, TrendingDown, Minus, Wallet, ArrowDownLeft, BarChart3, Calculator } from "lucide-react"
import { cn } from "@/lib/utils"

export function IncomeSummaryCards() {
  const { monthlyIncome, prevMonthIncome, averageMonthlyIncome, currency } = useExpense()

  const incomeChange = getMonthOverMonthChange(monthlyIncome, prevMonthIncome)
  const TrendIcon = incomeChange.trend === "up" ? TrendingUp : incomeChange.trend === "down" ? TrendingDown : Minus

  const fmt = (n: number) =>
    currency.symbol + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const cards = [
    {
      title: "This Month",
      value: fmt(monthlyIncome),
      trend: incomeChange,
      icon: Wallet,
      gradient: true,
    },
    {
      title: "Last Month",
      value: fmt(prevMonthIncome),
      trend: null,
      icon: ArrowDownLeft,
      gradient: false,
    },
    {
      title: "Month-over-Month",
      value: incomeChange.text,
      trend: incomeChange,
      icon: BarChart3,
      gradient: false,
    },
    {
      title: "Average Monthly",
      value: fmt(averageMonthlyIncome),
      trend: null,
      icon: Calculator,
      gradient: false,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={cn(
            "relative overflow-hidden border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20",
            card.gradient && "bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
          )}
        >
          {card.gradient && (
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          )}
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {card.title}
              </p>
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                card.gradient ? "bg-primary/20 text-primary" : "bg-accent text-accent-foreground"
              )}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-heading text-foreground">{card.value}</p>
            {card.trend && (
              <div className={cn(
                "mt-1.5 flex items-center gap-1 text-xs font-medium",
                card.trend.trend === "up" && "text-primary",
                card.trend.trend === "down" && "text-destructive",
                card.trend.trend === "neutral" && "text-muted-foreground"
              )}>
                <TrendIcon className="h-3.5 w-3.5" />
                <span>{card.trend.text} vs last month</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
