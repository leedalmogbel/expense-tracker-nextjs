"use client"

import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { AnalyticsBarChart } from "@/components/dashboard/analytics-bar-chart"
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"
import { staggerContainer, fadeUpItem } from "@/lib/utils"

export default function AnalyticsPage() {
  const { openAddExpenseRef, openAddBudgetRef, openAddIncomeRef } = useDashboardActions()

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
        <motion.div variants={fadeUpItem} className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SpendingChart />
          </div>
          <CategoryBreakdown />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <AnalyticsBarChart />
        </motion.div>
      </motion.div>
    </div>
  )
}
