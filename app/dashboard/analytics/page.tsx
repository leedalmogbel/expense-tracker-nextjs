"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { AnalyticsBarChart } from "@/components/dashboard/analytics-bar-chart"
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"
import { useExpense } from "@/contexts/expense-context"
import { staggerContainer, fadeUpItem, cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

const PERIODS = ["Daily", "Weekly", "Monthly", "Year"] as const
type Period = (typeof PERIODS)[number]

export default function AnalyticsPage() {
  const { openAddExpenseRef, openAddBudgetRef, openAddIncomeRef } = useDashboardActions()
  const { monthlyIncome, monthlyExpenses, formatCurrency } = useExpense()
  const [period, setPeriod] = useState<Period>("Monthly")

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <DashboardHeader
        onAddExpense={() => openAddExpenseRef.current?.()}
        onAddBudget={() => openAddBudgetRef.current?.()}
        onAddIncome={() => openAddIncomeRef.current?.()}
      />
      <p className="mt-1 text-sm text-muted-foreground min-h-[1.5em]">
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
        <motion.div variants={fadeUpItem} className="grid gap-4 grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-4 sm:p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Income</p>
              <p className="text-lg sm:text-xl font-bold font-heading text-foreground tabular-nums">
                {formatCurrency(monthlyIncome)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-4 sm:p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Expense</p>
              <p className="text-lg sm:text-xl font-bold font-heading text-foreground tabular-nums">
                {formatCurrency(-monthlyExpenses)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUpItem}>
          <AnalyticsBarChart />
        </motion.div>
      </motion.div>
    </div>
  )
}
