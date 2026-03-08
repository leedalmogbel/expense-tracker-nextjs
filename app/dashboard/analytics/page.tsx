"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { AnalyticsBarChart } from "@/components/dashboard/analytics-bar-chart"
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown"
import { useExpense } from "@/contexts/expense-context"
import { staggerContainer, fadeUpItem, cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getYearlySpendingByTag } from "@/lib/expense-utils"

const PERIODS = ["Daily", "Weekly", "Monthly", "Year"] as const
type Period = (typeof PERIODS)[number]

export default function AnalyticsPage() {
  const { monthlyIncome, monthlyExpenses, formatCurrency, transactions, tagMappings, year, currency } = useExpense()
  const [period, setPeriod] = useState<Period>("Monthly")

  const yearlyTagSpending = getYearlySpendingByTag(transactions, tagMappings, year)
  const yearlyTotal = yearlyTagSpending.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <p className="text-sm text-muted-foreground min-h-[1.5em]">
        Income vs expenses over time and spending by category.
      </p>

      <motion.div
        className="mt-8 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Time period toggle */}
        <motion.div variants={fadeUpItem}>
          <div className="inline-flex items-center rounded-full border border-border bg-muted/30 p-1 gap-0.5">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  period === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Charts */}
        <motion.div variants={fadeUpItem} className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SpendingChart />
          </div>
          <CategoryBreakdown />
        </motion.div>

        {/* Income / Expense summary */}
        <motion.div variants={fadeUpItem} className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Income</p>
              <p className="text-lg sm:text-xl font-bold font-heading text-foreground tabular-nums truncate">
                {formatCurrency(monthlyIncome)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Expense</p>
              <p className="text-lg sm:text-xl font-bold font-heading text-foreground tabular-nums truncate">
                {formatCurrency(-monthlyExpenses)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUpItem}>
          <AnalyticsBarChart />
        </motion.div>

        {/* Expenses Summary by Tag (Yearly) */}
        <motion.div variants={fadeUpItem}>
          <Card className="w-full border-border">
            <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
              <div className="flex items-center gap-3 w-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                    Expenses Summary
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {year} yearly spending by tag
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {yearlyTagSpending.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No expenses yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add expenses to see your yearly summary by tag
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {yearlyTagSpending.map((item) => {
                    const pct = yearlyTotal > 0 ? (item.amount / yearlyTotal) * 100 : 0
                    return (
                      <div key={item.tag} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-foreground truncate">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                            {currency.symbol}
                            {item.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
