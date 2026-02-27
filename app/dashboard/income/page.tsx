"use client"

import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { IncomeSummaryCards } from "@/components/dashboard/income-summary-cards"
import { IncomeTrendChart } from "@/components/dashboard/income-trend-chart"
import { IncomeBreakdown } from "@/components/dashboard/income-breakdown"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"
import { staggerContainer, fadeUpItem } from "@/lib/utils"

export default function IncomePage() {
  const { openAddExpenseRef, openAddBudgetRef, openAddIncomeRef } = useDashboardActions()

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <DashboardHeader
        onAddExpense={() => openAddExpenseRef.current?.()}
        onAddBudget={() => openAddBudgetRef.current?.()}
        onAddIncome={() => openAddIncomeRef.current?.()}
      />
      <p className="mt-1 text-sm text-muted-foreground">
        Track your income sources and trends over time.
      </p>

      <motion.div
        className="mt-8 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUpItem}>
          <IncomeSummaryCards />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <IncomeTrendChart />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <IncomeBreakdown />
        </motion.div>
      </motion.div>
    </div>
  )
}
