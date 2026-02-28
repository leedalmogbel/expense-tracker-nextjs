"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AnalyticsBarChart } from "@/components/dashboard/analytics-bar-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"
import { useExpense } from "@/contexts/expense-context"
import { staggerContainer, fadeUpItem } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react"

export default function TransactionsPage() {
  const { openAddExpenseRef, openAddBudgetRef, openAddIncomeRef } = useDashboardActions()
  const { setSelectedDate, totalBalance, monthlyIncome, monthlyExpenses, formatCurrency } = useExpense()

  // Clear day-specific filter on mount so full month view shows by default
  useEffect(() => {
    setSelectedDate(null)
  }, [setSelectedDate])

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <DashboardHeader
        onAddExpense={() => openAddExpenseRef.current?.()}
        onAddBudget={() => openAddBudgetRef.current?.()}
        onAddIncome={() => openAddIncomeRef.current?.()}
      />
      <p className="mt-1 text-sm text-muted-foreground min-h-[1.5em]">
        Filter by month, date range, or category. Click a chart bar or use the filters below.
      </p>

      <motion.div
        className="mt-8 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Balance summary */}
        <motion.div variants={fadeUpItem}>
          <div className="grid gap-3 grid-cols-1">
            <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 via-primary/5 to-card p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Balance</p>
                <p className="text-base sm:text-lg font-bold font-heading text-foreground tabular-nums truncate">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Income</p>
                <p className="text-base sm:text-lg font-bold font-heading text-foreground tabular-nums truncate">
                  {formatCurrency(monthlyIncome)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ArrowDownRight className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Expenses</p>
                <p className="text-base sm:text-lg font-bold font-heading text-foreground tabular-nums truncate">
                  {formatCurrency(-monthlyExpenses)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUpItem}>
          <AnalyticsBarChart />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <RecentTransactions />
        </motion.div>
      </motion.div>
    </div>
  )
}
